import pool from '../db.js';

// Получение уведомлений пользователя
export async function getNotifications(req, res) {
  try {
    const result = await pool.query(
      `SELECT * FROM notifications 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [req.user.id]
    );

    // Получаем количество непрочитанных
    const unread = await pool.query(
      `SELECT COUNT(*) as count FROM notifications 
       WHERE user_id = $1 AND is_read = false`,
      [req.user.id]
    );

    res.json({
      notifications: result.rows,
      unread_count: parseInt(unread.rows[0].count)
    });
  } catch (error) {
    console.error('Ошибка получения уведомлений:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

// Отметить уведомление как прочитанное
export async function markAsRead(req, res) {
  const { id } = req.params;

  try {
    await pool.query(
      'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    res.json({ message: 'Уведомление прочитано' });
  } catch (error) {
    console.error('Ошибка:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

// Отметить все как прочитанные
export async function markAllAsRead(req, res) {
  try {
    await pool.query(
      'UPDATE notifications SET is_read = true WHERE user_id = $1',
      [req.user.id]
    );

    res.json({ message: 'Все уведомления прочитаны' });
  } catch (error) {
    console.error('Ошибка:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

// Отправка push-уведомления (заглушка - требует настройки WebPush)
export async function sendPush(req, res) {
  const { title, body, url } = req.body;
  
  // Здесь должна быть интеграция с web-push или аналогичным сервисом
  // Для демонстрации просто создаём уведомление в БД
  
  try {
    // Сохраняем уведомление в БД
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type) 
       VALUES ($1, $2, $3, 'system')`,
      [req.user.id, title, body]
    );
    
    res.json({ message: 'Уведомление отправлено' });
  } catch (error) {
    console.error('Ошибка отправки push:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

// Планирование напоминаний о тренировках (вызывается по cron)
export async function scheduleTrainingReminders() {
  try {
    // Находим записи на завтра
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    
    const result = await pool.query(
      `SELECT b.id, b.booking_date, b.booking_time, u.id as user_id, u.name
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       WHERE b.booking_date = $1 AND b.status = 'scheduled'`,
      [dateStr]
    );
    
    for (const booking of result.rows) {
      // Создаём напоминание
      const time = booking.booking_time.substring(0, 5);
      await pool.query(
        `INSERT INTO notifications (user_id, title, message, type, link)
         VALUES ($1, $2, $3, 'reminder', $4)`,
        [
          booking.user_id,
          'Напоминание о тренировке',
          `Завтра в ${time} у вас запланирована тренировка. Не забудьте взять сменную обувь!`,
          '/dashboard'
        ]
      );
    }
    
    console.log(`Создано ${result.rows.length} напоминаний о тренировках`);
  } catch (error) {
    console.error('Ошибка планирования напоминаний:', error);
  }
}

export default { getNotifications, markAsRead, markAllAsRead, sendPush };
