import pool from '../db.js';

// Получение одобренных отзывов
export async function getReviews(req, res) {
  try {
    const result = await pool.query(
      `SELECT r.*, u.name as user_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.is_approved = true
       ORDER BY r.created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка получения отзывов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

// Создание отзыва
export async function createReview(req, res) {
  const { text, rating } = req.body;

  if (!text || !rating) {
    return res.status(400).json({ error: 'Текст и рейтинг обязательны' });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Рейтинг должен быть от 1 до 5' });
  }

  try {
    // Проверка: пользователь должен иметь хотя бы 1 посещённое занятие
    const completedBookings = await pool.query(
      `SELECT id FROM bookings 
       WHERE user_id = $1 AND status = 'completed'`,
      [req.user.id]
    );

    if (completedBookings.rows.length === 0) {
      return res.status(400).json({ 
        error: 'Вы можете оставить отзыв только после посещения хотя бы одного занятия' 
      });
    }

    // Проверка: нельзя оставлять повторный отзыв чаще чем раз в 30 дней
    const lastReview = await pool.query(
      `SELECT created_at FROM reviews 
       WHERE user_id = $1 
       ORDER BY created_at DESC LIMIT 1`,
      [req.user.id]
    );

    if (lastReview.rows.length > 0) {
      const lastDate = new Date(lastReview.rows[0].created_at);
      const now = new Date();
      const daysDiff = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff < 30) {
        return res.status(400).json({ 
          error: 'Вы можете оставлять отзыв не чаще чем раз в 30 дней' 
        });
      }
    }

    const result = await pool.query(
      `INSERT INTO reviews (user_id, text, rating) VALUES ($1, $2, $3) RETURNING *`,
      [req.user.id, text, rating]
    );

    res.status(201).json({ message: 'Отзыв отправлен на модерацию', review: result.rows[0] });
  } catch (error) {
    console.error('Ошибка создания отзыва:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

// Получение всех отзывов (админ)
export async function getAllReviews(req, res) {
  try {
    const result = await pool.query(
      `SELECT r.*, u.name as user_name, u.email as user_email
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       ORDER BY r.created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка получения всех отзывов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

// Модерация отзыва (админ)
export async function moderateReview(req, res) {
  const { id } = req.params;
  const { is_approved } = req.body;

  try {
    await pool.query(
      'UPDATE reviews SET is_approved = $1 WHERE id = $2',
      [is_approved, id]
    );

    res.json({ message: is_approved ? 'Отзыв одобрен' : 'Отзыв отклонён' });
  } catch (error) {
    console.error('Ошибка модерации отзыва:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

export default { getReviews, createReview, getAllReviews, moderateReview };
