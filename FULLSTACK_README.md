# FreedomLife - Fullstack приложение

## Структура проекта

```
freedomlife/
├── client/              # React frontend (текущий src/)
│   ├── src/
│   │   ├── context/     # AuthContext - управление авторизацией
│   │   ├── pages/       # Страницы приложения
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx   # Личный кабинет клиента
│   │   │   └── AdminPanel.jsx  # Админ-панель
│   │   └── ...
│   └── package.json
│
├── server/              # Express backend
│   ├── controllers/     # Бизнес-логика
│   │   ├── authController.js
│   │   ├── bookingController.js
│   │   ├── subscriptionController.js
│   │   ├── reviewController.js
│   │   └── notificationController.js
│   ├── routes/          # API роуты
│   ├── middleware/      # JWT авторизация
│   ├── db.js            # Подключение к PostgreSQL
│   └── index.js         # Главный файл сервера
│
└── README.md
```

## Запуск

### 1. База данных PostgreSQL

Создайте базу данных:

```sql
CREATE DATABASE freedomlife;
```

Настройте подключение в `server/.env`:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=freedomlife
DB_USER=postgres
DB_PASSWORD=ваш_пароль
```

### 2. Запуск сервера

```bash
cd server
npm install
npm start
```

Сервер запустится на порту 3000.

### 3. Запуск клиента

```bash
npm install
npm run dev
```

Клиент запустится на порту 5173.

## API Endpoints

### Авторизация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/auth/me` - Текущий пользователь

### Абонементы
- `GET /api/subscriptions` - Получить абонемент
- `POST /api/subscriptions/purchase` - Купить абонемент
- `POST /api/subscriptions/activate` - Активировать промокод

### Записи
- `GET /api/bookings` - Мои записи
- `POST /api/bookings` - Создать запись
- `PUT /api/bookings/:id` - Изменить запись
- `DELETE /api/bookings/:id` - Отменить запись

### Админ
- `GET /api/auth/users` - Все пользователи
- `GET /api/bookings/all` - Все записи
- `PUT /api/bookings/:id/status` - Изменить статус
- `POST /api/subscriptions/promo/create` - Создать промокод
- `PUT /api/subscriptions/admin/update` - Изменить абонемент

## Функциональность

### Клиент
- Регистрация/вход
- Просмотр абонемента
- Покупка абонемента онлайн
- Запись на тренировку (выбор даты, времени, уровня тренажёра)
- Изменение/отмена записи (за 3 часа)
- Активация промокода
- Просмотр уведомлений

### Админ
- Просмотр всех записей
- Управление посещениями (пришёл/не пришёл/уважительная причина)
- Управление абонементами (+/- занятия, изменение срока)
- Создание промокодов

## Технологии

- **Frontend**: React + Vite + TailwindCSS + Framer Motion
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Auth**: JWT
