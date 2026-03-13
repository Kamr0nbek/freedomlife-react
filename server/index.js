import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Токен вашего бота (из переменных окружения)
const TOKEN = process.env.TELEGRAM_TOKEN || '8398511660:AAGL4rbX5ZpuooRHD8jC6N1XhDJybWAvsn0';
// Ваш Telegram ID
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || '1340893129';

const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;

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

  try {
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: CHAT_ID,
      text: text,
      parse_mode: 'Markdown'
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error sending message:', error.response?.data || error.message);
    res.status(500).json({ success: false, error: 'Ошибка отправки' });
  }
});

// Эндпоинт для ping
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
