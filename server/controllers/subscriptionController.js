import pool from '../db.js';
import bcrypt from 'bcryptjs';

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

// Покупка абонемента (Создание запроса)
export async function purchaseSubscription(req, res) {
  const { sessions, type, months, is_premium_pair, partner_email } = req.body;

  if (!sessions || !type) {
    return res.status(400).json({ error: 'Укажите количество занятий и тип абонемента' });
  }

  try {
    // Создаем запрос на покупку
    await pool.query(
      `INSERT INTO subscription_requests (user_id, sessions, type, months, partner_email, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')`,
      [req.user.id, sessions, type, months || null, partner_email || null]
    );

    res.json({ 
      message: 'Запрос на покупку отправлен администратору. Ожидайте подтверждения.'
    });
  } catch (error) {
    console.error('Ошибка создания запроса на абонемент:', error);
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

    // Проверяем, использован ли код (одноразовый промокод)
    if (promo.is_used) {
      return res.status(400).json({ error: 'Этот промокод уже был использован' });
    }

    // Проверяем, не использовал ли уже этот пользователь многоразовый код
    const usedResult = await pool.query(
      'SELECT id FROM used_promo_codes WHERE user_id = $1 AND promo_code_id = $2',
      [req.user.id, promo.id]
    );

    if (usedResult.rows.length > 0 && !promo.is_used) {
      return res.status(400).json({ error: 'Вы уже использовали этот код' });
    }

    // Проверяем абонемент
    const subResult = await pool.query(
      'SELECT * FROM subscriptions WHERE user_id = $1',
      [req.user.id]
    );

    let oldSessions = 0;
    let oldEndDate = null;
    if (subResult.rows.length > 0) {
      oldSessions = subResult.rows[0].sessions_left || 0;
      oldEndDate = subResult.rows[0].end_date;
    }

    // Для Премиум абонемента - устанавливаем срок
    let newEndDate = null;
    if (promo.type === 'Премиум') {
      newEndDate = new Date();
      newEndDate.setFullYear(newEndDate.getFullYear() + 1);
    }

    // Применяем код
    if (subResult.rows.length > 0) {
      await pool.query(
        `UPDATE subscriptions 
         SET sessions_left = sessions_left + $1, 
             type = COALESCE($2, type),
             end_date = COALESCE($3, end_date),
             is_premium_pair = CASE WHEN $4 = 'Годовой 1+1' THEN TRUE ELSE is_premium_pair END,
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $5`,
        [promo.sessions, promo.type, newEndDate, promo.type, req.user.id]
      );
    } else {
      await pool.query(
        `INSERT INTO subscriptions (user_id, sessions_left, type, end_date, is_premium_pair) 
         VALUES ($1, $2, $3, $4, $5)`,
        [req.user.id, promo.sessions, promo.type, newEndDate, promo.type === 'Годовой 1+1']
      );
    }

    // Отмечаем код как использованный (одноразовый)
    await pool.query(
      'UPDATE promo_codes SET is_used = TRUE, used_by = $1, used_at = CURRENT_TIMESTAMP WHERE id = $2',
      [req.user.id, promo.id]
    );

    // Записываем в историю использованных кодов
    await pool.query(
      'INSERT INTO used_promo_codes (user_id, promo_code_id) VALUES ($1, $2)',
      [req.user.id, promo.id]
    );

    // Записываем в историю абонемента
    await pool.query(
      `INSERT INTO subscription_history 
       (user_id, action, sessions_change, old_sessions, new_sessions, old_end_date, new_end_date)
       VALUES ($1, 'promo', $2, $3, $4, $5, $6)`,
      [req.user.id, promo.sessions, oldSessions, oldSessions + promo.sessions, oldEndDate, newEndDate]
    );

    // Уведомление
    let message = `Вы активировали код на ${promo.sessions} занятий`;
    if (promo.type === 'Премиум') {
      message = `Вы активировали промокод "Премиум" - 8 занятий в месяц на 1 год`;
    } else if (promo.type === 'Годовой 1+1') {
      message = `Вы активировали промокод "Годовой 1+1" - абонемент для двоих на год`;
    }

    await pool.query(
      `INSERT INTO notifications (user_id, title, message) 
       VALUES ($1, $2, $3)`,
      [req.user.id, 'Промокод активирован', message]
    );

    const updated = await pool.query('SELECT * FROM subscriptions WHERE user_id = $1', [req.user.id]);

    res.json({ 
      message: 'Промокод активирован', 
      subscription: updated.rows[0],
      added_sessions: promo.sessions,
      promo_type: promo.type
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
  const { code, sessions, type, months } = req.body;

  if (!code || !sessions || !type) {
    return res.status(400).json({ error: 'Укажите код, количество занятий и тип' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO promo_codes (code, sessions, type, months) VALUES ($1, $2, $3, $4) RETURNING *',
      [code, sessions, type, months || null]
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
    const result = await pool.query(`
      SELECT 
        pc.*,
        u.name as used_by_name,
        u.email as used_by_email
      FROM promo_codes pc
      LEFT JOIN users u ON pc.used_by = u.id
      ORDER BY pc.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка получения промокодов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

// Получить запросы пользователя
export async function getUserRequests(req, res) {
  try {
    const result = await pool.query(
      `SELECT * FROM subscription_requests 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка получения запросов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

// Получить все ожидающие запросы (админ)
export async function getPendingRequests(req, res) {
  try {
    const result = await pool.query(`
      SELECT 
        sr.*,
        u.name as user_name,
        u.email as user_email
      FROM subscription_requests sr
      JOIN users u ON sr.user_id = u.id
      WHERE sr.status = 'pending'
      ORDER BY sr.created_at ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка получения запросов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

// Подтвердить запрос (админ)
export async function approveRequest(req, res) {
  const { id } = req.params;

  try {
    // Получаем запрос
    const reqResult = await pool.query('SELECT * FROM subscription_requests WHERE id = $1', [id]);
    if (reqResult.rows.length === 0) {
      return res.status(404).json({ error: 'Запрос не найден' });
    }
    
    const request = reqResult.rows[0];
    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Запрос уже обработан' });
    }

    const { user_id, sessions, type, months, partner_email } = request;
    const is_premium_pair = type === '1+1';

    // Получаем текущий абонемент пользователя
    const currentSub = await pool.query(
      'SELECT sessions_left, end_date FROM subscriptions WHERE user_id = $1',
      [user_id]
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
        [newSessions, endDate, type, is_premium_pair, user_id]
      );

      // Записываем в историю
      await pool.query(
        `INSERT INTO subscription_history 
         (user_id, action, sessions_change, old_sessions, new_sessions, old_end_date, new_end_date, subscription_type)
         VALUES ($1, 'purchase', $2, $3, $4, $5, $6, $7)`,
        [user_id, sessions, oldSessions, oldSessions + sessions, oldEndDate, endDate, type]
      );
    } else {
      await pool.query(
        `INSERT INTO subscriptions (user_id, sessions_left, end_date, type, is_premium_pair)
         VALUES ($1, $2, $3, $4, $5)`,
        [user_id, newSessions, endDate, type, is_premium_pair]
      );
      
      await pool.query(
        `INSERT INTO subscription_history 
         (user_id, action, sessions_change, old_sessions, new_sessions, old_end_date, new_end_date, subscription_type)
         VALUES ($1, 'purchase', $2, 0, $2, NULL, $3, $4)`,
        [user_id, sessions, endDate, type]
      );
    }

    // Логика для 1+1: создание второго пользователя и выдача ему абонемента
    if (type === '1+1') {
      let partnerUserId = null;
      let targetEmail = partner_email;

      if (targetEmail) {
        // Проверяем, есть ли пользователь с таким email
        const userRes = await pool.query('SELECT id FROM users WHERE email = $1', [targetEmail]);
        if (userRes.rows.length > 0) {
          partnerUserId = userRes.rows[0].id;
        }
      }

      if (!partnerUserId) {
        // Создаем пользователя (либо временного, либо с указанным email)
        const newEmail = targetEmail || \`temp_\${Date.now()}@freedomlife.com\`;
        const randomPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(randomPassword, 10);
        
        const newUserRes = await pool.query(
          `INSERT INTO users (email, password, is_temp, name) 
           VALUES ($1, $2, $3, $4) RETURNING id`,
          [newEmail, hashedPassword, !targetEmail, targetEmail ? 'Партнер' : 'Временный аккаунт']
        );
        partnerUserId = newUserRes.rows[0].id;
      }

      // Выдаем 1+1 абонемент второму пользователю
      const partnerSubRes = await pool.query('SELECT sessions_left, end_date FROM subscriptions WHERE user_id = $1', [partnerUserId]);
      
      if (partnerSubRes.rows.length > 0) {
        const oldSessionsPartner = partnerSubRes.rows[0].sessions_left || 0;
        const oldEndDatePartner = partnerSubRes.rows[0].end_date;
        
        await pool.query(
          `UPDATE subscriptions 
           SET sessions_left = sessions_left + $1, 
               end_date = COALESCE($2, end_date),
               type = $3,
               updated_at = CURRENT_TIMESTAMP
           WHERE user_id = $4`,
          [newSessions, endDate, type, partnerUserId]
        );

        await pool.query(
          `INSERT INTO subscription_history 
           (user_id, action, sessions_change, old_sessions, new_sessions, old_end_date, new_end_date, subscription_type)
           VALUES ($1, 'gift', $2, $3, $4, $5, $6, $7)`,
          [partnerUserId, sessions, oldSessionsPartner, oldSessionsPartner + sessions, oldEndDatePartner, endDate, type]
        );
      } else {
        await pool.query(
          `INSERT INTO subscriptions (user_id, sessions_left, end_date, type)
           VALUES ($1, $2, $3, $4)`,
          [partnerUserId, newSessions, endDate, type]
        );
        
        await pool.query(
          `INSERT INTO subscription_history 
           (user_id, action, sessions_change, old_sessions, new_sessions, old_end_date, new_end_date, subscription_type)
           VALUES ($1, 'gift', $2, 0, $2, NULL, $3, $4)`,
          [partnerUserId, sessions, endDate, type]
        );
      }

      // Уведомление второму пользователю
      await pool.query(
        `INSERT INTO notifications (user_id, title, message) 
         VALUES ($1, $2, $3)`,
        [partnerUserId, 'Вам подарен абонемент!', \`Вам начислен абонемент 1+1: \${sessions} занятий.\`]
      );
    }

    // Обновляем статус запроса
    await pool.query(
      "UPDATE subscription_requests SET status = 'approved', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
      [id]
    );

    // Создаём уведомление для пользователя
    await pool.query(
      `INSERT INTO notifications (user_id, title, message) 
       VALUES ($1, $2, $3)`,
      [user_id, 'Оплата подтверждена', \`Ваш запрос на абонемент подтвержден: \${sessions} занятий, тип: \${type}\`]
    );

    res.json({ message: 'Запрос подтвержден и абонемент начислен' });
  } catch (error) {
    console.error('Ошибка подтверждения запроса:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

// Отклонить запрос (админ)
export async function rejectRequest(req, res) {
  const { id } = req.params;

  try {
    const reqResult = await pool.query('SELECT * FROM subscription_requests WHERE id = $1', [id]);
    if (reqResult.rows.length === 0) {
      return res.status(404).json({ error: 'Запрос не найден' });
    }
    
    const request = reqResult.rows[0];
    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Запрос уже обработан' });
    }

    await pool.query(
      "UPDATE subscription_requests SET status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
      [id]
    );

    await pool.query(
      `INSERT INTO notifications (user_id, title, message) 
       VALUES ($1, $2, $3)`,
      [request.user_id, 'Оплата отклонена', \`Ваш запрос на абонемент (\${request.type}) был отклонен администратором.\`]
    );

    res.json({ message: 'Запрос отклонен' });
  } catch (error) {
    console.error('Ошибка отклонения запроса:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

export default { 
  getSubscription, 
  purchaseSubscription, 
  activatePromoCode, 
  adminUpdateSubscription,
  createPromoCode,
  getAllPromoCodes,
  getUserRequests,
  getPendingRequests,
  approveRequest,
  rejectRequest
};
