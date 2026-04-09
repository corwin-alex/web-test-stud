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

### 1. Подготовка базы данных

1. Создайте PostgreSQL базу данных на Render:
   - Dashboard → New → PostgreSQL
   - Выберите регион и тариф (Free для тестирования)
   - После создания скопируйте **Internal Database URL**

2. Инициализируйте схему БД:
   ```bash
   psql <DATABASE_URL> -f backend/schema.sql
   ```

### 2. Деплой Backend

1. Создайте новый **Web Service**:
   - Dashboard → New → Web Service
   - Connect your repository

2. Настройте параметры:
   - **Name**: `online-testing-backend`
   - **Region**: выберите ближайший к вам
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

3. Добавьте переменные окружения в разделе Environment:
   ```
   PORT=3001
   NODE_ENV=production
   DATABASE_URL=<ваш Internal Database URL от Render>
   JWT_SECRET=<сгенерируйте случайную строку 32+ символов>
   FRONTEND_URL=https://online-testing-frontend.onrender.com
   SESSION_SECRET=<любая случайная строка>
   LOG_REQUESTS=true
   ```

   Для генерации JWT_SECRET выполните локально:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

4. Нажмите **Create Web Service**

### 3. Деплой Frontend

1. Создайте новый **Static Site**:
   - Dashboard → New → Static Site
   - Connect your repository

2. Настройте параметры:
   - **Name**: `online-testing-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

3. Добавьте переменные окружения:
   ```
   API_URL=https://online-testing-backend.onrender.com/api
   ```

4. Нажмите **Create Static Site**

### 4. Финальная настройка

После деплоя frontend вы получите URL вида `https://online-testing-frontend.onrender.com`

1. Вернитесь в настройки **Backend Web Service**
2. Обновите переменную `FRONTEND_URL` на актуальный URL frontend
3. Сохраните изменения — сервис перезапустится автоматически

### 5. Проверка работы

1. Откройте URL frontend в браузере
2. Зарегистрируйте первого пользователя как админа через БД:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
   ```
3. Войдите под учетной записью админа
4. Создайте тест и назначьте его студентам

## Локальная разработка

### Требования
- Node.js 18+
- PostgreSQL 14+
- npm или yarn

### Быстрый старт

```bash
# 1. Клонирование и установка зависимостей
cd online-testing-app

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

# 2. Настройка переменных окружения
cd ..
cp .env.example .env

# Отредактируйте .env:
# - DATABASE_URL=postgresql://postgres:пароль@localhost:5432/online_testing
# - JWT_SECRET=случайная_строка_минимум_32_символа

# 3. Создание базы данных
createdb online_testing
psql -d online_testing -f backend/schema.sql

# 4. Запуск серверов (в разных терминалах)

# Терминал 1 - Backend
cd backend
npm run dev

# Терминал 2 - Frontend
cd frontend
npm run dev
```

Приложение доступно:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Авторы

Студенческий проект системы онлайн-тестирования.
