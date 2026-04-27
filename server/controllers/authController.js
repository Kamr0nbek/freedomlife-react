import bcrypt from 'bcryptjs';
import pool from '../db.js';
import { generateToken } from '../middleware/auth.js';

// Определение уровня по весу
function getMachineLevelByWeight(weight) {
  if (!weight) return null;
  if (weight >= 50 && weight <= 65) return 1;
  if (weight > 65 && weight <= 85) return 2;
  if (weight > 85 && weight <= 100) return 3;
  if (weight > 100) return 4;
  return null;
}

// Регистрация
export async function register(req, res) {
  const { email, password, name, phone, weight } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email и пароль обязательны' });
  }

  // Определяем уровень по весу
  const machineLevel = getMachineLevelByWeight(weight);

  try {
    // Проверка существующего пользователя
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создание пользователя
    const result = await pool.query(
      'INSERT INTO users (email, password, name, phone, weight, machine_level) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, name, phone, weight, machine_level, role',
      [email, hashedPassword, name || null, phone || null, weight || null, machineLevel]
    );

    const user = result.rows[0];

    // Создание пустого абонемента
    await pool.query(
      'INSERT INTO subscriptions (user_id, sessions_left, end_date, type) VALUES ($1, 0, NULL, NULL)',
      [user.id]
    );

    const token = generateToken(user);

    res.status(201).json({
      message: 'Регистрация успешна',
      token,
      user: { id: user.id, email: user.email, name: user.name, phone: user.phone, role: user.role }
    });
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

// Вход
export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email и пароль обязательны' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const token = generateToken(user);

    res.json({
      message: 'Вход выполнен',
      token,
      user: { id: user.id, email: user.email, name: user.name, phone: user.phone, role: user.role }
    });
  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

// Получение данных текущего пользователя
export async function getMe(req, res) {
  try {
    const result = await pool.query(
      `SELECT u.id, u.email, u.name, u.phone, u.weight, u.machine_level, u.role, u.created_at,
              s.sessions_left, s.end_date, s.type, s.is_premium_pair
       FROM users u
       LEFT JOIN subscriptions s ON u.id = s.user_id
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Получаем дату последней тренировки
    const lastBooking = await pool.query(
      `SELECT booking_date, booking_time FROM bookings 
       WHERE user_id = $1 AND status = 'completed'
       ORDER BY booking_date DESC, booking_time DESC LIMIT 1`,
      [req.user.id]
    );

    const user = result.rows[0];
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      weight: user.weight,
      machine_level: user.machine_level,
      role: user.role,
      created_at: user.created_at,
      subscription: {
        sessions_left: user.sessions_left || 0,
        end_date: user.end_date,
        type: user.type,
        is_premium_pair: user.is_premium_pair
      },
      last_training_date: lastBooking.rows.length > 0 ? lastBooking.rows[0].booking_date : null
    });
  } catch (error) {
    console.error('Ошибка получения профиля:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

// Обновление профиля
export async function updateProfile(req, res) {
  const { name, phone } = req.body;

  try {
    await pool.query(
      'UPDATE users SET name = COALESCE($1, name), phone = COALESCE($2, phone) WHERE id = $3',
      [name, phone, req.user.id]
    );

    const result = await pool.query(
      'SELECT id, email, name, phone, role FROM users WHERE id = $1',
      [req.user.id]
    );

    res.json({ message: 'Профиль обновлён', user: result.rows[0] });
  } catch (error) {
    console.error('Ошибка обновления профиля:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

// Получение всех пользователей (админ)
export async function getAllUsers(req, res) {
  try {
    const result = await pool.query(
      `SELECT u.id, u.email, u.name, u.phone, u.weight, u.machine_level, u.role, u.created_at,
              s.sessions_left, s.end_date, s.type, s.is_premium_pair
       FROM users u
       LEFT JOIN subscriptions s ON u.id = s.user_id
       WHERE u.role = 'user'
       ORDER BY u.created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка получения пользователей:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

export default { register, login, getMe, updateProfile, getAllUsers };
