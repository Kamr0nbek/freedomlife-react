import pool from '../db.js';

// Получение всех записей пользователя
export async function getMyBookings(req, res) {
  try {
    const result = await pool.query(
      `SELECT b.*, u.name as user_name, u.phone as user_phone
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       WHERE b.user_id = $1
       ORDER BY b.booking_date DESC, b.booking_time DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка получения записей:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

// Создание записи
export async function createBooking(req, res) {
  const { booking_date, booking_time, machine_level, partner_machine_level } = req.body;

  if (!booking_date || !booking_time) {
    return res.status(400).json({ error: 'Укажите дату и время' });
  }

  try {
    // Проверка абонемента
    const subResult = await pool.query(
      'SELECT sessions_left, end_date FROM subscriptions WHERE user_id = $1',
      [req.user.id]
    );

    const subscription = subResult.rows[0];
    
    if (!subscription || subscription.sessions_left <= 0) {
      return res.status(400).json({ error: 'У вас нет доступных занятий' });
    }

    if (subscription.end_date) {
      const endDate = new Date(subscription.end_date);
      const bookingDate = new Date(booking_date);
      if (bookingDate > endDate) {
        return res.status(400).json({ error: 'Срок вашего абонемента истёк' });
      }
    }

    // Проверка: последняя тренировка была меньше 1 дня назад
    const lastBooking = await pool.query(
      `SELECT booking_date FROM bookings 
       WHERE user_id = $1 AND status = 'completed'
       ORDER BY booking_date DESC, booking_time DESC LIMIT 1`,
      [req.user.id]
    );

    if (lastBooking.rows.length > 0) {
      const lastDate = new Date(lastBooking.rows[0].booking_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays < 1) {
        return res.status(400).json({ 
          error: 'Вы можете записаться не ранее чем через 1 день после последней тренировки' 
        });
      }
    }

    // Проверка: нельзя записаться на прошедшее время
    const bookingDateTime = new Date(`${booking_date}T${booking_time}`);
    const now = new Date();
    
    if (bookingDateTime <= now) {
      return res.status(400).json({ error: 'Нельзя записаться на прошедшее время' });
    }

    // Проверка: нельзя записаться на сегодня (минимум за 1 день)
    const todayStr = new Date().toISOString().split('T')[0];
    if (booking_date === todayStr) {
      return res.status(400).json({ error: 'Запись возможна только на завтра и позже' });
    }

    // Проверка: нельзя записаться более чем за 30 дней
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    if (bookingDateTime > maxDate) {
      return res.status(400).json({ error: 'Запись возможна не более чем за 30 дней' });
    }

    // Проверка доступности слота
    const existing = await pool.query(
      `SELECT id FROM bookings 
       WHERE booking_date = $1 AND booking_time = $2 AND status != 'cancelled'`,
      [booking_date, booking_time]
    );

    if (existing.rows.length >= 10) {
      return res.status(400).json({ error: 'Это время уже занято, выберите другое' });
    }

    // Создание записи
    const result = await pool.query(
      `INSERT INTO bookings (user_id, booking_date, booking_time, machine_level, partner_machine_level)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.id, booking_date, booking_time, machine_level || 1, partner_machine_level || null]
    );

    // Уведомление
    await pool.query(
      `INSERT INTO notifications (user_id, title, message) 
       VALUES ($1, $2, $3)`,
      [req.user.id, 'Запись на тренировку', `Вы записаны на ${booking_date} в ${booking_time}`]
    );

    res.status(201).json({ 
      message: 'Запись создана', 
      booking: result.rows[0] 
    });
  } catch (error) {
    console.error('Ошибка создания записи:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

// Изменение записи
export async function updateBooking(req, res) {
  const { id } = req.params;
  const { booking_time, machine_level, partner_machine_level } = req.body;

  try {
    // Проверяем, что запись принадлежит пользователю
    const existing = await pool.query(
      'SELECT * FROM bookings WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Запись не найдена' });
    }

    const booking = existing.rows[0];

    // Проверка: до занятия должно быть больше 3 часов
    const bookingDateTime = new Date(`${booking.booking_date}T${booking.booking_time}`);
    const now = new Date();
    const hoursDiff = (bookingDateTime - now) / (1000 * 60 * 60);

    if (hoursDiff <= 3) {
      return res.status(400).json({ 
        error: 'Изменение доступно не позднее чем за 3 часа до занятия',
        hours_remaining: hoursDiff
      });
    }

    // Проверка нового времени на доступность
    if (booking_time) {
      const existingSlot = await pool.query(
        `SELECT id FROM bookings 
         WHERE booking_date = $1 AND booking_time = $2 AND status != 'cancelled' AND id != $3`,
        [booking.booking_date, booking_time, id]
      );

      if (existingSlot.rows.length >= 10) {
        return res.status(400).json({ error: 'Это время уже занято' });
      }
    }

    // Обновление
    const result = await pool.query(
      `UPDATE bookings 
       SET booking_time = COALESCE($1, booking_time),
           machine_level = COALESCE($2, machine_level),
           partner_machine_level = COALESCE($3, partner_machine_level),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 RETURNING *`,
      [booking_time, machine_level, partner_machine_level, id]
    );

    // Уведомление
    await pool.query(
      `INSERT INTO notifications (user_id, title, message) 
       VALUES ($1, $2, $3)`,
      [req.user.id, 'Запись изменена', `Ваша запись на ${booking.booking_date} была изменена`]
    );

    res.json({ message: 'Запись обновлена', booking: result.rows[0] });
  } catch (error) {
    console.error('Ошибка обновления записи:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

// Отмена записи
export async function cancelBooking(req, res) {
  const { id } = req.params;

  try {
    const existing = await pool.query(
      'SELECT * FROM bookings WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Запись не найдена' });
    }

    const booking = existing.rows[0];

    // Проверка: до занятия должно быть больше 3 часов
    const bookingDateTime = new Date(`${booking.booking_date}T${booking.booking_time}`);
    const now = new Date();
    const hoursDiff = (bookingDateTime - now) / (1000 * 60 * 60);

    if (hoursDiff <= 3) {
      return res.status(400).json({ 
        error: 'Отмена доступна не позднее чем за 3 часа до занятия' 
      });
    }

    await pool.query(
      `UPDATE bookings SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [id]
    );

    // Уведомление
    await pool.query(
      `INSERT INTO notifications (user_id, title, message) 
       VALUES ($1, $2, $3)`,
      [req.user.id, 'Запись отменена', `Ваша запись на ${booking.booking_date} отменена`]
    );

    res.json({ message: 'Запись отменена' });
  } catch (error) {
    console.error('Ошибка отмены записи:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

// Получение всех записей (админ)
export async function getAllBookings(req, res) {
  const { date, status } = req.query;

  try {
    let query = `
      SELECT b.*, u.name as user_name, u.email as user_email, u.phone as user_phone
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (date) {
      params.push(date);
      query += ` AND b.booking_date = $${params.length}`;
    }

    if (status) {
      params.push(status);
      query += ` AND b.status = $${params.length}`;
    }

    query += ' ORDER BY b.booking_date DESC, b.booking_time DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка получения всех записей:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

// Админ: изменение статуса посещения
export async function updateBookingStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['completed', 'no_show', 'excused', 'error'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Неверный статус' });
  }

  try {
    const existing = await pool.query('SELECT * FROM bookings WHERE id = $1', [id]);
    
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Запись не найдена' });
    }

    const booking = existing.rows[0];
    const oldStatus = booking.status;

    // Списание занятия при статусах completed или no_show
    if (status === 'completed' || status === 'no_show') {
      await pool.query(
        'UPDATE subscriptions SET sessions_left = sessions_left - 1 WHERE user_id = $1',
        [booking.user_id]
      );
    }

    await pool.query(
      `UPDATE bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [status, id]
    );

    // Уведомление пользователю
    const statusMessages = {
      'completed': 'Вы посетили тренировку ✅',
      'no_show': 'Вы не пришли на тренировку (занятие списано)',
      'excused': 'Ваша причина отсутствия засчитана, занятие не списано',
      'error': 'Отмечена ошибка клиента, занятие не списано'
    };

    await pool.query(
      `INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)`,
      [booking.user_id, 'Статус тренировки', statusMessages[status]]
    );

    res.json({ message: 'Статус обновлён', status });
  } catch (error) {
    console.error('Ошибка обновления статуса:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

// Получение доступных слотов
export async function getAvailableSlots(req, res) {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: 'Укажите дату' });
  }

  try {
    // Все возможные времена (с 9:00 до 21:00, каждый час)
    const allSlots = [];
    for (let hour = 9; hour <= 21; hour++) {
      allSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    }

    // Получаем занятые слоты
    const booked = await pool.query(
      `SELECT booking_time FROM bookings 
       WHERE booking_date = $1 AND status != 'cancelled'`,
      [date]
    );

    const bookedTimes = booked.rows.map(r => r.booking_time.substring(0, 5));

    // Фильтруем: только будущие слоты
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    const availableSlots = allSlots.filter(slot => {
      if (date === todayStr) {
        const slotTime = new Date(`${date}T${slot}:00`);
        return slotTime > now;
      }
      return !bookedTimes.includes(slot);
    });

    res.json({ date, slots: availableSlots, booked_count: bookedTimes.length });
  } catch (error) {
    console.error('Ошибка получения слотов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

export default { 
  getMyBookings, 
  createBooking, 
  updateBooking, 
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
  getAvailableSlots
};
