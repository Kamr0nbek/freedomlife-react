import pool from '../db.js';

// Получение абонемента пользователя
export async function getSubscription(req, res) {
  try {
    const result = await pool.query(
      `SELECT * FROM subscriptions WHERE user_id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.json({ sessions_left: 0, end_date: null, type: null, is_premium_pair: false });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка получения абонемента:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

// Покупка абонемента
export async function purchaseSubscription(req, res) {
  const { sessions, type, months, is_premium_pair } = req.body;

  if (!sessions || !type) {
    return res.status(400).json({ error: 'Укажите количество занятий и тип абонемента' });
  }

  try {
    // Проверяем, достаточно ли занятий
    const currentSub = await pool.query(
      'SELECT sessions_left, end_date FROM subscriptions WHERE user_id = $1',
      [req.user.id]
    );

    let newSessions = sessions;
    let endDate = null;

    if (months) {
      const currentDate = new Date();
      if (currentSub.rows.length > 0 && currentSub.rows[0].end_date) {
        const currentEnd = new Date(currentSub.rows[0].end_date);
        if (currentEnd > currentDate) {
          endDate = new Date(currentEnd);
          endDate.setMonth(endDate.getMonth() + months);
        } else {
          endDate = new Date();
          endDate.setMonth(endDate.getMonth() + months);
        }
      } else {
        endDate = new Date();
        endDate.setMonth(endDate.getMonth() + months);
      }
    }

    // Обновляем или создаём абонемент
    if (currentSub.rows.length > 0) {
      const oldSessions = currentSub.rows[0].sessions_left || 0;
      const oldEndDate = currentSub.rows[0].end_date;
      
      await pool.query(
        `UPDATE subscriptions 
         SET sessions_left = sessions_left + $1, 
             end_date = COALESCE($2, end_date),
             type = $3,
             is_premium_pair = COALESCE($4, is_premium_pair),
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $5`,
        [newSessions, endDate, type, is_premium_pair || false, req.user.id]
      );

      // Записываем в историю
      await pool.query(
        `INSERT INTO subscription_history 
         (user_id, action, sessions_change, old_sessions, new_sessions, old_end_date, new_end_date)
         VALUES ($1, 'purchase', $2, $3, $4, $5, $6)`,
        [req.user.id, sessions, oldSessions, oldSessions + sessions, oldEndDate, endDate]
      );
    } else {
      await pool.query(
        `INSERT INTO subscriptions (user_id, sessions_left, end_date, type, is_premium_pair)
         VALUES ($1, $2, $3, $4, $5)`,
        [req.user.id, newSessions, endDate, type, is_premium_pair || false]
      );
    }

    // Создаём уведомление
    await pool.query(
      `INSERT INTO notifications (user_id, title, message) 
       VALUES ($1, $2, $3)`,
      [req.user.id, 'Абонемент приобретён', `Вы приобрели абонемент: ${sessions} занятий, тип: ${type}`]
    );

    const updated = await pool.query('SELECT * FROM subscriptions WHERE user_id = $1', [req.user.id]);

    res.json({ 
      message: 'Абонемент приобретён', 
      subscription: updated.rows[0]
    });
  } catch (error) {
    console.error('Ошибка покупки абонемента:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

// Активация промокода
export async function activatePromoCode(req, res) {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Введите код' });
  }

  try {
    // Ищем промокод
    const promoResult = await pool.query(
      'SELECT * FROM promo_codes WHERE code = $1 AND is_active = true',
      [code]
    );

    if (promoResult.rows.length === 0) {
      return res.status(400).json({ error: 'Неверный или неактивный код' });
    }

    const promo = promoResult.rows[0];

    // Проверяем, не использован ли уже
    const usedResult = await pool.query(
      'SELECT id FROM used_promo_codes WHERE user_id = $1 AND promo_code_id = $2',
      [req.user.id, promo.id]
    );

    if (usedResult.rows.length > 0) {
      return res.status(400).json({ error: 'Вы уже использовали этот код' });
    }

    // Проверяем абонемент
    const subResult = await pool.query(
      'SELECT * FROM subscriptions WHERE user_id = $1',
      [req.user.id]
    );

    let oldSessions = 0;
    if (subResult.rows.length > 0) {
      oldSessions = subResult.rows[0].sessions_left || 0;
    }

    // Применяем код
    if (subResult.rows.length > 0) {
      await pool.query(
        `UPDATE subscriptions 
         SET sessions_left = sessions_left + $1, 
             type = COALESCE($2, type),
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $3`,
        [promo.sessions, promo.type, req.user.id]
      );
    } else {
      await pool.query(
        `INSERT INTO subscriptions (user_id, sessions_left, type) VALUES ($1, $2, $3)`,
        [req.user.id, promo.sessions, promo.type]
      );
    }

    // Отмечаем код как использованный
    await pool.query(
      'INSERT INTO used_promo_codes (user_id, promo_code_id) VALUES ($1, $2)',
      [req.user.id, promo.id]
    );

    // Записываем в историю
    await pool.query(
      `INSERT INTO subscription_history 
       (user_id, action, sessions_change, old_sessions, new_sessions)
       VALUES ($1, 'promo', $2, $3, $4)`,
      [req.user.id, promo.sessions, oldSessions, oldSessions + promo.sessions]
    );

    // Уведомление
    await pool.query(
      `INSERT INTO notifications (user_id, title, message) 
       VALUES ($1, $2, $3)`,
      [req.user.id, 'Промокод активирован', `Вы активировали код на ${promo.sessions} занятий`]
    );

    const updated = await pool.query('SELECT * FROM subscriptions WHERE user_id = $1', [req.user.id]);

    res.json({ 
      message: 'Промокод активирован', 
      subscription: updated.rows[0],
      added_sessions: promo.sessions
    });
  } catch (error) {
    console.error('Ошибка активации промокода:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

// Админ: изменение абонемента
export async function adminUpdateSubscription(req, res) {
  const { user_id, sessions_change, end_date, type } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: 'Укажите пользователя' });
  }

  try {
    const current = await pool.query('SELECT * FROM subscriptions WHERE user_id = $1', [user_id]);
    const oldSessions = current.rows.length > 0 ? current.rows[0].sessions_left || 0 : 0;
    const oldEndDate = current.rows.length > 0 ? current.rows[0].end_date : null;

    let newSessions = oldSessions;
    if (sessions_change) {
      newSessions = Math.max(0, oldSessions + sessions_change);
    }

    await pool.query(
      `UPDATE subscriptions 
       SET sessions_left = $1,
           end_date = COALESCE($2, end_date),
           type = COALESCE($3, type),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $4`,
      [newSessions, end_date, type, user_id]
    );

    // История
    await pool.query(
      `INSERT INTO subscription_history 
       (user_id, action, sessions_change, old_sessions, new_sessions, old_end_date, new_end_date)
       VALUES ($1, 'admin_update', $2, $3, $4, $5, $6)`,
      [user_id, sessions_change || 0, oldSessions, newSessions, oldEndDate, end_date]
    );

    // Уведомление пользователю
    let message = 'Ваш абонемент был обновлён администратором';
    if (sessions_change > 0) {
      message = `Вам добавлено ${sessions_change} занятий`;
    } else if (sessions_change < 0) {
      message = `С вашего абонемента списано ${Math.abs(sessions_change)} занятий`;
    }

    await pool.query(
      `INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)`,
      [user_id, 'Изменение абонемента', message]
    );

    const updated = await pool.query('SELECT * FROM subscriptions WHERE user_id = $1', [user_id]);

    res.json({ message: 'Абонемент обновлён', subscription: updated.rows[0] });
  } catch (error) {
    console.error('Ошибка обновления абонемента:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

// Админ: создание промокода
export async function createPromoCode(req, res) {
  const { code, sessions, type } = req.body;

  if (!code || !sessions) {
    return res.status(400).json({ error: 'Укажите код и количество занятий' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO promo_codes (code, sessions, type) VALUES ($1, $2, $3) RETURNING *',
      [code, sessions, type || 'Стандартный']
    );

    res.status(201).json({ message: 'Промокод создан', promo_code: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Такой код уже существует' });
    }
    console.error('Ошибка создания промокода:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

// Получить все промокоды (админ)
export async function getAllPromoCodes(req, res) {
  try {
    const result = await pool.query('SELECT * FROM promo_codes ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка получения промокодов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

export default { 
  getSubscription, 
  purchaseSubscription, 
  activatePromoCode, 
  adminUpdateSubscription,
  createPromoCode,
  getAllPromoCodes
};
