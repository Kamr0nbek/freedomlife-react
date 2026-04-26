import express from 'express';
import cors from 'cors';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Корневой маршрут
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'FreedomLife API Server',
    version: '1.0.0',
    endpoints: ['/api/health', '/api/auth', '/api/subscriptions', '/api/bookings', '/api/reviews', '/api/notifications']
  });
});

// Подключение к БД
import { pool, initDatabase } from './db.js';

// Импорт роутов
import authRoutes from './routes/auth.js';
import subscriptionRoutes from './routes/subscriptions.js';
import bookingRoutes from './routes/bookings.js';
import reviewRoutes from './routes/reviews.js';
import notificationRoutes from './routes/notifications.js';

// Токен вашего бота
const TOKEN = process.env.TELEGRAM_TOKEN || '8398511660:AAGL4rbX5ZpuooRHD8jC6N1XhDJybWAvsn0';
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || '1340893129';
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;

console.log('Telegram config:', { TOKEN: TOKEN ? 'set' : 'missing', CHAT_ID });

// Эндпоинт для отправки заявки
app.post('/api/submit', async (req, res) => {
  const { name, phone, email, message, type } = req.body;
  
  const text = `
📝 *Новая заявка с сайта FreedomLife*

👤 *Имя:* ${name}
📱 *Телефон:* ${phone}
📧 *Email:* ${email || 'не указан'}
💬 *Сообщение:* ${message || 'нет'}
📌 *Тип:* ${type || 'Общая заявка'}
  `;

  console.log('Sending to Telegram:', { CHAT_ID, hasToken: !!TOKEN });

  try {
    const response = await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: CHAT_ID,
      text: text,
      parse_mode: 'Markdown'
    });
    console.log('Telegram sent successfully');
    res.json({ success: true });
  } catch (error) {
    console.error('Telegram error:', error.response?.data || error.message);
    res.status(500).json({ success: false, error: 'Ошибка отправки' });
  }
});

// API роуты
app.use('/api/auth', authRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);

// Статистика для админа
app.get('/api/admin/stats', async (req, res) => {
  try {
    const usersCount = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = $1', ['user']);
    const bookingsToday = await pool.query(
      "SELECT COUNT(*) as count FROM bookings WHERE booking_date = CURRENT_DATE AND status = 'scheduled'"
    );
    const completedToday = await pool.query(
      "SELECT COUNT(*) as count FROM bookings WHERE booking_date = CURRENT_DATE AND status = 'completed'"
    );
    const totalSessions = await pool.query('SELECT SUM(sessions_left) as total FROM subscriptions');

    // Расширенная статистика
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    
    const bookingsThisWeek = await pool.query(
      "SELECT COUNT(*) as count FROM bookings WHERE booking_date >= $1",
      [weekAgo.toISOString().split('T')[0]]
    );
    
    const completedThisMonth = await pool.query(
      "SELECT COUNT(*) as count FROM bookings WHERE booking_date >= $1 AND status = 'completed'",
      [monthAgo.toISOString().split('T')[0]]
    );
    
    const cancelledThisMonth = await pool.query(
      "SELECT COUNT(*) as count FROM bookings WHERE booking_date >= $1 AND status = 'cancelled'",
      [monthAgo.toISOString().split('T')[0]]
    );
    
    const noShowsThisMonth = await pool.query(
      "SELECT COUNT(*) as count FROM bookings WHERE booking_date >= $1 AND status = 'no_show'",
      [monthAgo.toISOString().split('T')[0]]
    );
    
    // Статистика по уровням
    const levelStats = await pool.query(
      `SELECT machine_level, COUNT(*) as count 
       FROM bookings 
       WHERE booking_date >= $1 AND status = 'completed'
       GROUP BY machine_level`,
      [monthAgo.toISOString().split('T')[0]]
    );

    res.json({
      users: parseInt(usersCount.rows[0].count),
      bookings_today: parseInt(bookingsToday.rows[0].count),
      completed_today: parseInt(completedToday.rows[0].count),
      total_sessions: totalSessions.rows[0].total || 0,
      // Расширенная статистика
      bookings_this_week: parseInt(bookingsThisWeek.rows[0].count),
      completed_this_month: parseInt(completedThisMonth.rows[0].count),
      cancelled_this_month: parseInt(cancelledThisMonth.rows[0].count),
      no_shows_this_month: parseInt(noShowsThisMonth.rows[0].count),
      level_stats: levelStats.rows
    });
  } catch (error) {
    console.error('Ошибка статистики:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Выручка и статистика продаж
app.get('/api/admin/revenue-stats', async (req, res) => {
  const filter = req.query.filter || 'month'; // day, week, month
  
  let dateFilter = new Date();
  if (filter === 'day') {
    dateFilter.setDate(dateFilter.getDate() - 1);
  } else if (filter === 'week') {
    dateFilter.setDate(dateFilter.getDate() - 7);
  } else {
    dateFilter.setMonth(dateFilter.getMonth() - 1);
  }
  
  try {
    const historyRes = await pool.query(
      `SELECT subscription_type, created_at 
       FROM subscription_history 
       WHERE action = 'purchase' AND created_at >= $1
       ORDER BY created_at ASC`,
      [dateFilter.toISOString()]
    );
    
    let totalRevenue = 0;
    let totalSales = 0;
    const revenueByDate = {};
    
    historyRes.rows.forEach(row => {
      let price = 0;
      switch(row.subscription_type) {
        case 'Старт': price = 59900; break;
        case 'Базовый': price = 149900; break;
        case 'Оптимальный': price = 239900; break;
        case 'Премиум': price = 400000; break;
        case '1+1': price = 600000; break;
        default: price = 0;
      }
      
      totalRevenue += price;
      totalSales += 1;
      
      const dateStr = row.created_at.toISOString().split('T')[0];
      if (!revenueByDate[dateStr]) {
        revenueByDate[dateStr] = 0;
      }
      revenueByDate[dateStr] += price;
    });
    
    // Новые регистрации за этот же период (исключаем временные)
    const newUsersRes = await pool.query(
      `SELECT COUNT(*) as count 
       FROM users 
       WHERE created_at >= $1 AND is_temp = FALSE`,
      [dateFilter.toISOString()]
    );
    const newRegistrations = parseInt(newUsersRes.rows[0].count);
    
    const averageCheck = totalSales > 0 ? Math.round(totalRevenue / totalSales) : 0;
    
    // Подготовка данных для графика
    const chartData = Object.keys(revenueByDate).map(date => ({
      date,
      revenue: revenueByDate[date]
    }));
    
    res.json({
      totalRevenue,
      totalSales,
      newRegistrations,
      averageCheck,
      chartData
    });
  } catch (error) {
    console.error('Ошибка получения статистики выручки:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Проверка БД
app.get('/api/health', async (req, res) => {
 try {
    await pool.query('SELECT 1');
 res.json({ status: 'ok', database: 'connected' });
 } catch (error) {
 res.status(500).json({ status: 'error', database: 'disconnected' });
 }
});

// Временный endpoint для создания админа
// Использовать: POST /api/auth/create-admin с кодом "admin2024"
app.post('/api/auth/create-admin', async (req, res) => {
 const { email, password, code } = req.body;
  
 if (code !== 'admin2024') {
 return res.status(403).json({ error: 'Неверный код' });
 }
  
 try {
 const hashedPassword = await bcrypt.hash(password,10);
    
 const result = await pool.query(
 `INSERT INTO users (email, password, name, role) 
 VALUES ($1, $2, $3, 'admin')
 ON CONFLICT (email) DO UPDATE SET role = 'admin', password = $2
 RETURNING id, email, role`,
 [email, hashedPassword, 'Администратор']
 );
    
 res.json({ message: 'Админ создан', user: result.rows[0] });
 } catch (error) {
 console.error('Ошибка:', error);
 res.status(500).json({ error: 'Ошибка сервера' });
 }
});

const PORT = process.env.PORT || 3000;

// Запуск сервера
async function start() {
  try {
    await initDatabase();
    console.log('База данных готова');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Ошибка запуска:', error);
    // Запускаем без БД для совместимости
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (без БД)`);
    });
  }
}

start();
