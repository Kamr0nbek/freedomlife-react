import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Поддержка DATABASE_URL (NeonDB) или локальной БД
export const pool = new Pool({
 connectionString: process.env.DATABASE_URL,
 ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

// Тест подключения
pool.on('connect', () => {
  console.log('Подключено к PostgreSQL');
});

pool.on('error', (err) => {
  console.error('Ошибка подключения к PostgreSQL:', err);
});

// Инициализация таблиц
export async function initDatabase() {
  const client = await pool.connect();
  
  try {
    // Таблица пользователей
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        phone VARCHAR(50),
        weight DECIMAL(5,2),
        machine_level INTEGER,
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Миграция: добавить колонки если не существуют
    try {
      await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS weight DECIMAL(5,2)`);
      await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS machine_level INTEGER`);
      await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_temp BOOLEAN DEFAULT FALSE`);
    } catch (e) {
      // Колонки уже существуют
    }

    // Таблица абонементов
    await client.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        sessions_left INTEGER DEFAULT 0,
        end_date DATE,
        type VARCHAR(50),
        is_premium_pair BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Таблица запросов на абонементы
    await client.query(`
      CREATE TABLE IF NOT EXISTS subscription_requests (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        sessions INTEGER NOT NULL,
        type VARCHAR(50) NOT NULL,
        months INTEGER,
        partner_email VARCHAR(255),
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Таблица записей на тренировки
    await client.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        booking_date DATE NOT NULL,
        booking_time TIME NOT NULL,
        machine_level INTEGER DEFAULT 1,
        partner_machine_level INTEGER,
        is_pair_booking BOOLEAN DEFAULT FALSE,
        pair_booking_id INTEGER REFERENCES bookings(id),
        status VARCHAR(20) DEFAULT 'scheduled',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Миграция: добавить колонки для 1+1 если не существуют
    try {
      await client.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS is_pair_booking BOOLEAN DEFAULT FALSE`);
      await client.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pair_booking_id INTEGER REFERENCES bookings(id)`);
    } catch (e) {
      // Колонки уже существуют
    }

    // Таблица промокодов
    await client.query(`
      CREATE TABLE IF NOT EXISTS promo_codes (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        sessions INTEGER NOT NULL,
        type VARCHAR(50),
        is_active BOOLEAN DEFAULT TRUE,
        is_used BOOLEAN DEFAULT FALSE,
        used_by INTEGER REFERENCES users(id),
        used_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Добавляем колонку is_used, если она ещё не существует (миграция)
    try {
      await client.query(`ALTER TABLE promo_codes ADD COLUMN IF NOT EXISTS is_used BOOLEAN DEFAULT FALSE`);
      await client.query(`ALTER TABLE promo_codes ADD COLUMN IF NOT EXISTS used_by INTEGER REFERENCES users(id)`);
      await client.query(`ALTER TABLE promo_codes ADD COLUMN IF NOT EXISTS used_at TIMESTAMP`);
      await client.query(`ALTER TABLE promo_codes ADD COLUMN IF NOT EXISTS months INTEGER`);
    } catch (e) {
      // Колонки уже существуют
    }

    // Таблица использованных промокодов
    await client.query(`
      CREATE TABLE IF NOT EXISTS used_promo_codes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        promo_code_id INTEGER REFERENCES promo_codes(id) ON DELETE CASCADE,
        used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, promo_code_id)
      )
    `);

    // Таблица отзывов
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        text TEXT NOT NULL,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        is_approved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Таблица уведомлений
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        message TEXT,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Таблица истории абонементов
    await client.query(`
      CREATE TABLE IF NOT EXISTS subscription_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        action VARCHAR(50) NOT NULL,
        sessions_change INTEGER,
        old_sessions INTEGER,
        new_sessions INTEGER,
        old_end_date DATE,
        new_end_date DATE,
        subscription_type VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Миграция: добавить колонки для истории
    try {
      await client.query(`ALTER TABLE subscription_history ADD COLUMN IF NOT EXISTS subscription_type VARCHAR(50)`);
    } catch (e) {
      // Колонки уже существуют
    }

    console.log('База данных инициализирована');
  } catch (error) {
    console.error('Ошибка инициализации БД:', error);
    throw error;
  } finally {
    client.release();
  }
}

export default pool;
