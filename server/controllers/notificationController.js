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

export default { getNotifications, markAsRead, markAllAsRead };
