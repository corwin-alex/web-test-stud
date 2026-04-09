# Online Testing Application

Студенческий проект системы онлайн-тестирования для студентов.

## Стек технологий

### Frontend
- HTML5, CSS3 (SCSS)
- JavaScript (React 18, React Router v6)
- Webpack 5

### Backend
- Node.js
- Express.js
- PostgreSQL

## Структура проекта

```
online-testing-app/
├── backend/                 # Серверная часть
│   ├── routes/             # API маршруты
│   │   ├── auth.js         # Авторизация и регистрация
│   │   ├── tests.js        # Управление тестами
│   │   ├── users.js        # Управление пользователями
│   │   ├── questions/      # Вопросы тестов
│   │   └── attempts/       # Попытки прохождения
│   ├── middleware/         # Промежуточное ПО
│   │   └── auth.js         # Аутентификация JWT
│   ├── db.js               # Подключение к БД
│   ├── server.js           # Точка входа сервера
│   ├── schema.sql          # Схема базы данных
│   └── package.json
├── frontend/               # Клиентская часть
│   ├── public/            # Статические файлы
│   ├── src/
│   │   ├── components/    # React компоненты
│   │   ├── pages/         # Страницы приложения
│   │   ├── services/      # API сервисы
│   │   ├── context/       # React Context
│   │   ├── styles/        # SCSS стили
│   │   ├── App.js         # Главный компонент
│   │   └── index.js       # Точка входа
│   ├── webpack.config.js
│   └── package.json
└── .env.example           # Пример переменных окружения
```

## Установка и запуск

### 1. Клонирование и установка зависимостей

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Настройка базы данных

Создайте базу данных PostgreSQL и выполните схему:

```bash
psql -U your_username -d online_testing_db -f backend/schema.sql
```

### 3. Настройка переменных окружения

Скопируйте `.env.example` в `.env` и настройте значения:

```bash
cp .env.example .env
```

Необходимые переменные:
- `DATABASE_URL` - URL подключения к PostgreSQL
- `JWT_SECRET` - Секретный ключ для JWT
- `PORT` - Порт сервера (по умолчанию 3001)
- `FRONTEND_URL` - URL фронтенда (для CORS)

### 4. Запуск приложения

```bash
# Запуск backend (в одном терминале)
cd backend
npm run dev

# Запуск frontend (в другом терминале)
cd frontend
npm run dev
```

Приложение будет доступно по адресу:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Функционал

### Для студентов:
- Регистрация и авторизация
- Просмотр назначенных тестов
- Прохождение тестов (multiple choice, true/false, текстовые ответы)
- Просмотр результатов с детализацией по вопросам
- 100-балльная система оценивания

### Для администраторов:
- Создание, редактирование и удаление тестов
- Добавление вопросов различных типов
- Назначение тестов студентам
- Установка дедлайнов
- Просмотр результатов всех студентов

## API Endpoints

### Auth
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход

### Tests
- `GET /api/tests` - Все тесты (admin)
- `GET /api/tests/assigned` - Назначенные тесты (student)
- `POST /api/tests` - Создать тест (admin)
- `PUT /api/tests/:id` - Обновить тест (admin)
- `DELETE /api/tests/:id` - Удалить тест (admin)

### Questions
- `GET /api/questions/test/:testId` - Вопросы теста
- `POST /api/questions` - Создать вопрос (admin)
- `PUT /api/questions/:id` - Обновить вопрос (admin)
- `DELETE /api/questions/:id` - Удалить вопрос (admin)

### Attempts
- `POST /api/attempts/submit` - Отправить ответы
- `GET /api/attempts/my-attempts/:testId` - Мои попытки (student)
- `GET /api/attempts/test/:testId` - Все попытки теста (admin)

### Users
- `GET /api/users/students` - Список студентов (admin)
- `POST /api/users/assign-test` - Назначить тест (admin)
- `GET /api/users/me` - Профиль пользователя

## Деплой на Render.com

### Backend:
1. Создайте новый Web Service
2. Подключите репозиторий
3. Build Command: `cd backend && npm install`
4. Start Command: `cd backend && npm start`
5. Добавьте переменные окружения из `.env`

### Frontend:
1. Создайте новый Static Site
2. Build Command: `cd frontend && npm run build`
3. Publish Directory: `frontend/dist`

### Database:
Создайте PostgreSQL базу данных на Render и обновите `DATABASE_URL`

## Авторы

Студенческий проект системы онлайн-тестирования.
