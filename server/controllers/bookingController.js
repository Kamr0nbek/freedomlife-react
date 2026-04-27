import pool from '../db.js';

// Константы уровней
const LEVEL_CONFIG = {
  1: { minWeight: 50, maxWeight: 65, maxPerLevel: 2, machines: 2 },
  2: { minWeight: 65, maxWeight: 85, maxPerLevel: 4, machines: 4 },
  3: { minWeight: 85, maxWeight: 100, maxPerLevel: 4, machines: 4 },
  4: { minWeight: 100, maxWeight: 999, maxPerLevel: 2, machines: 2 }
};
const MAX_TOTAL_PER_HOUR = 10;

// Определение уровня по весу
function getMachineLevelByWeight(weight) {
  if (!weight) return null;
  if (weight >= 50 && weight <= 65) return 1;
  if (weight > 65 && weight <= 85) return 2;
  if (weight > 85 && weight <= 100) return 3;
  if (weight > 100) return 4;
  return null;
}

// Проверка доступности слотов по уровням
async function checkSlotAvailability(booking_date, booking_time, machine_level, isPair = false) {
  // Получаем текущее количество записей по уровням
  const levelCounts = await pool.query(
    `SELECT machine_level, COUNT(*) as count 
     FROM bookings 
     WHERE booking_date = $1 AND booking_time = $2 AND status != 'cancelled'
     GROUP BY machine_level`,
    [booking_date, booking_time]
  );

  const counts = { 1: 0, 2: 0, 3: 0 };
  levelCounts.rows.forEach(row => {
    counts[row.machine_level] = parseInt(row.count);
  });

  const totalBooked = levelCounts.rows.reduce((sum, r) => sum + parseInt(r.count), 0);

  // Проверка общего лимита
  const requiredSlots = isPair ? 2 : 1;
  if (totalBooked + requiredSlots > MAX_TOTAL_PER_HOUR) {
    return { available: false, error: 'Все слоты на это время заняты (максимум 10 человек в час)' };
  }

  // Проверка лимита уровня
  const levelLimit = LEVEL_CONFIG[machine_level];
  if (levelLimit) {
    if (counts[machine_level] + requiredSlots > levelLimit.maxPerLevel) {
      return { 
        available: false, 
        error: `На уровне ${machine_level} занято ${counts[machine_level]} из ${levelLimit.maxPerLevel} мест. Выберите другое время или уровень.` 
      };
    }
  }

  return { available: true, counts };
}

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
  const { booking_date, booking_time, machine_level, partner_machine_level, book_for_pair } = req.body;

  if (!booking_date || !booking_time) {
    return res.status(400).json({ error: 'Укажите дату и время' });
  }

  try {
    // Проверка абонемента
    const subResult = await pool.query(
      'SELECT sessions_left, end_date, is_premium_pair FROM subscriptions WHERE user_id = $1',
      [req.user.id]
    );

    const subscription = subResult.rows[0];
    const isPair = subscription?.is_premium_pair || book_for_pair;
    
    if (!subscription || subscription.sessions_left <= 0) {
      return res.status(400).json({ error: 'У вас нет доступных занятий' });
    }

    // Для 1+1 нужно минимум 2 занятия (если это Premium Pair абонемент)
    if (subscription.is_premium_pair && subscription.sessions_left < 2) {
      return res.status(400).json({ error: 'Для записи 1+1 нужно минимум 2 занятия' });
    }

    // Если бронируем для пары - нужно 2 слота
    const requiredSlots = isPair ? 2 : 1;
    if (subscription.sessions_left < requiredSlots) {
      return res.status(400).json({ 
        error: `Для записи ${isPair ? 'для двоих' : ''} нужно минимум ${requiredSlots} занятия` 
      });
    }

    if (subscription.end_date) {
      const endDate = new Date(subscription.end_date);
      const bookingDate = new Date(booking_date);
      if (bookingDate > endDate) {
        return res.status(400).json({ error: 'Срок вашего абонемента истёк' });
      }
    }

    // Получаем вес пользователя для проверки уровня
    const userResult = await pool.query(
      'SELECT weight, machine_level FROM users WHERE id = $1',
      [req.user.id]
    );
    const userWeight = userResult.rows[0]?.weight;
    const userMachineLevel = userResult.rows[0]?.machine_level;

    // Определяем уровень по весу или используем сохранённый
    const finalLevel = machine_level || userMachineLevel || getMachineLevelByWeight(userWeight);
    
    if (!finalLevel) {
      return res.status(400).json({ 
        error: 'Не удалось определить уровень. Укажите ваш вес в профиле.' 
      });
    }

    // Проверка: соответствует ли выбранный уровень весу пользователя
    const allowedLevel = userMachineLevel || getMachineLevelByWeight(userWeight);
    if (allowedLevel && finalLevel !== allowedLevel) {
      return res.status(400).json({ 
        error: `Вы можете выбрать только уровень ${allowedLevel} (по вашему весу)` 
      });
    }

    // Проверка: последняя тренировка была меньше 2 дней назад (нельзя на следующий день)
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
      
      // Разница в днях между сегодня и последней тренировкой
      const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
      
      // Нельзя записаться на следующий день (должно пройти минимум 2 дня)
      if (diffDays < 2) {
        return res.status(400).json({ 
          error: 'Вы можете записаться не ранее чем через 1 день после последней тренировки. Минимум 2 дня между посещениями.' 
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

    // Проверка: нельзя записаться более чем за 30 дней (с учетом часового пояса)
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    maxDate.setHours(23, 59, 59, 999);
    if (bookingDateTime > maxDate) {
      return res.status(400).json({ error: 'Запись возможна не более чем за 30 дней' });
    }

    // Проверка доступности слотов по уровням (нужно 2 слота для 1+1)
    const slotCheck = await checkSlotAvailability(booking_date, booking_time, finalLevel, isPair);
    if (!slotCheck.available) {
      return res.status(400).json({ error: slotCheck.error });
    }

    // Создаём 2 записи для 1+1
    const bookings = [];
    const partnerLevel = partner_machine_level || finalLevel;
    
    // Основная запись (для себя)
    const result1 = await pool.query(
      `INSERT INTO bookings (user_id, booking_date, booking_time, machine_level, partner_machine_level, is_pair_booking)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.id, booking_date, booking_time, finalLevel, isPair ? partnerLevel : null, isPair]
    );
    bookings.push(result1.rows[0]);

    // Если 1+1 - создаём вторую запись
    if (isPair) {
      const result2 = await pool.query(
        `INSERT INTO bookings (user_id, booking_date, booking_time, machine_level, partner_machine_level, is_pair_booking, pair_booking_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [req.user.id, booking_date, booking_time, partnerLevel, finalLevel, true, result1.rows[0].id]
      );
      bookings.push(result2.rows[0]);
      
      // Обновляем первую запись ссылкой на вторую
      await pool.query(
        `UPDATE bookings SET pair_booking_id = $1 WHERE id = $2`,
        [result2.rows[0].id, result1.rows[0].id]
      );
    }

    // Уведомление
    const pairText = isPair ? ' (запись для двоих)' : '';
    await pool.query(
      `INSERT INTO notifications (user_id, title, message) 
       VALUES ($1, $2, $3)`,
      [req.user.id, 'Запись на тренировку', `Вы записались на ${booking_date} в ${booking_time}${pairText}`]
    );

    res.status(201).json({ 
      message: 'Запись создана', 
      booking: bookings[0],
      pair_booking: bookings[1] || null
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
    const isPairBooking = booking.is_pair_booking;

    // Списание занятий при статусах completed или no_show
    // Для 1+1 списываем 2 занятия
    if (status === 'completed' || status === 'no_show') {
      const sessionsToDeduct = isPairBooking ? 2 : 1;
      await pool.query(
        'UPDATE subscriptions SET sessions_left = GREATEST(0, sessions_left - $1) WHERE user_id = $2',
        [sessionsToDeduct, booking.user_id]
      );
    }

    // Обновляем статус основной записи
    await pool.query(
      `UPDATE bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [status, id]
    );

    // Если это 1+1 - обновляем и связанную запись
    if (booking.pair_booking_id) {
      await pool.query(
        `UPDATE bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
        [status, booking.pair_booking_id]
      );
    }
      
    // Уведомление пользователю
    const sessionsText = isPairBooking ? '2 занятия' : '1 занятие';
    const statusMessages = {
      'completed': `Вы посетили тренировку ✅ (списано ${sessionsText})`,
      'no_show': `Вы не пришли на тренировку (списано ${sessionsText})`,
      'excused': 'Ваша причина отсутствия засчитана, занятия не списаны',
      'error': 'Отмечена ошибка клиента, занятия не списаны'
    };

    await pool.query(
      `INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)`,
      [booking.user_id, 'Статус тренировки', statusMessages[status]]
    );

    res.json({ message: 'Статус обновлён', status, sessions_deducted: isPairBooking ? 2 : 1 });
  } catch (error) {
    console.error('Ошибка обновления статуса:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

// Получение доступных слотов с информацией по уровням
export async function getAvailableSlots(req, res) {
  const { date, machine_level } = req.query;

  if (!date) {
    return res.status(400).json({ error: 'Укажите дату' });
  }

  try {
    // Все возможные времена (с 9:00 до 21:00, каждый час)
    const allSlots = [];
    for (let hour = 9; hour <= 21; hour++) {
      allSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    }

    // Получаем занятые слоты с разбивкой по уровням
    const booked = await pool.query(
      `SELECT booking_time, machine_level, COUNT(*) as count 
       FROM bookings 
       WHERE booking_date = $1 AND status != 'cancelled'
       GROUP BY booking_time, machine_level`,
      [date]
    );

    // Фильтруем: только будущие слоты
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    // Формируем информацию о доступности для каждого слота
    const slotsInfo = allSlots.map(slot => {
      if (date === todayStr) {
        const slotTime = new Date(`${date}T${slot}:00`);
        if (slotTime <= now) {
          return { time: slot, available: false, reason: 'past' };
        }
      }

      // Подсчет занятых мест на этом слоте по уровням
      const slotBookings = booked.rows.filter(b => 
        b.booking_time.substring(0, 5) === slot
      );
      
      const levelCounts = { 1: 0, 2: 0, 3: 0 };
      let totalBooked = 0;
      slotBookings.forEach(b => {
        levelCounts[b.machine_level] = parseInt(b.count);
        totalBooked += parseInt(b.count);
      });

      // Проверка доступности для конкретного уровня
      let available = true;
      let reason = '';
      
      if (totalBooked >= MAX_TOTAL_PER_HOUR) {
        available = false;
        reason = 'full';
      } else if (machine_level) {
        const levelLimit = LEVEL_CONFIG[machine_level];
        if (levelLimit && levelCounts[machine_level] >= levelLimit.maxPerLevel) {
          available = false;
          reason = 'level_full';
        } else if (!levelLimit && levelCounts[machine_level] >= 2) {
          available = false;
          reason = 'level_full';
        }
      }

      return {
        time: slot,
        available,
        reason,
        level_counts: levelCounts,
        total_booked: totalBooked,
        max_total: MAX_TOTAL_PER_HOUR
      };
    });

    // Фильтруем только доступные если не запрошена детальная информация
    const availableOnly = slotsInfo.filter(s => s.available).map(s => s.time);

    res.json({ 
      date, 
      slots: availableOnly,
      slots_detail: slotsInfo,
      booked_count: booked.rows.length 
    });
  } catch (error) {
    console.error('Ошибка получения слотов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

// Генерация QR-кода для записи
export async function getBookingQR(req, res) {
  const { id } = req.params;
  
  try {
    const QRCode = await import('qrcode');
    
    const booking = await pool.query(
      `SELECT b.*, u.name as user_name, u.phone as user_phone
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       WHERE b.id = $1`,
      [id]
    );
    
    if (booking.rows.length === 0) {
      return res.status(404).json({ error: 'Запись не найдена' });
    }
    
    const b = booking.rows[0];
    
    // Данные для QR-кода (JSON)
    const qrData = JSON.stringify({
      booking_id: b.id,
      user_id: b.user_id,
      date: b.booking_date,
      time: b.booking_time,
      level: b.machine_level,
      name: b.user_name,
      type: 'freedomlife_checkin'
    });
    
    // Генерируем QR как data URL
    const qrDataUrl = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#0d9488',
        light: '#ffffff'
      }
    });
    
    res.json({
      qr_code: qrDataUrl,
      booking: {
        id: b.id,
        date: b.booking_date,
        time: b.booking_time,
        level: b.machine_level,
        user_name: b.user_name
      }
    });
  } catch (error) {
    console.error('Ошибка генерации QR:', error);
    res.status(500).json({ error: 'Ошибка генерации QR-кода' });
  }
}

// Сканирование QR-кода (чекин)
export async function scanQRCode(req, res) {
  const { qr_data } = req.body;
  
  if (!qr_data) {
    return res.status(400).json({ error: 'Нет данных QR-кода' });
  }
  
  try {
    // Парсим данные QR
    let qrData;
    try {
      qrData = JSON.parse(qr_data);
    } catch (e) {
      return res.status(400).json({ error: 'Неверный формат QR-кода' });
    }
    
    if (qrData.type !== 'freedomlife_checkin') {
      return res.status(400).json({ error: 'QR-код не является кодом FreedomLife' });
    }
    
    const { booking_id, user_id, date, time, level } = qrData;
    
    // Ищем запись
    const booking = await pool.query(
      `SELECT b.*, u.name as user_name, u.phone as user_phone
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       WHERE b.id = $1 AND b.user_id = $2 AND b.booking_date = $3 AND b.booking_time = $4`,
      [booking_id, user_id, date, time]
    );
    
    if (booking.rows.length === 0) {
      return res.status(404).json({ error: 'Запись не найдена' });
    }
    
    const b = booking.rows[0];
    
    // Проверяем, что запись ещё не отмечена
    if (b.status !== 'scheduled') {
      return res.status(400).json({ 
        error: 'Запись уже отмечена',
        current_status: b.status,
        booking: b
      });
    }
    
    // Отмечаем как "Пришёл"
    const isPairBooking = b.is_pair_booking;
    const sessionsToDeduct = isPairBooking ? 2 : 1;
    
    await pool.query(
      `UPDATE bookings SET status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [booking_id]
    );
    
    // Если 1+1 - обновляем связанную запись
    if (b.pair_booking_id) {
      await pool.query(
        `UPDATE bookings SET status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [b.pair_booking_id]
      );
    }
    
    // Списываем занятия
    await pool.query(
      'UPDATE subscriptions SET sessions_left = GREATEST(0, sessions_left - $1) WHERE user_id = $2',
      [sessionsToDeduct, user_id]
    );
    
    // Уведомление
    await pool.query(
      `INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)`,
      [user_id, 'Чек-ин выполнен', `Вы отмечены как посетивший тренировку ${date} в ${time}. Списано ${sessionsToDeduct} занятие(й).`]
    );
    
    res.json({
      success: true,
      message: 'Чек-ин выполнен',
      booking: {
        id: b.id,
        user_name: b.user_name,
        date: b.booking_date,
        time: b.booking_time,
        level: b.machine_level,
        sessions_deducted: sessionsToDeduct
      }
    });
  } catch (error) {
    console.error('Ошибка сканирования QR:', error);
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
  getAvailableSlots,
  getBookingQR,
  scanQRCode
};
