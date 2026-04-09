# Настройка переменных окружения

Этот документ описывает все переменные окружения, необходимые для работы приложения онлайн-тестирования.

## 📋 Список переменных

### Backend (Node.js/Express)

| Переменная | Описание | Пример значения | Обязательно |
|------------|----------|-----------------|-------------|
| `PORT` | Порт сервера | `3001` | Нет (по умолчанию 3001) |
| `NODE_ENV` | Режим работы | `development`, `production` | Нет (по умолчанию development) |
| `DATABASE_URL` | URL подключения к PostgreSQL | `postgresql://user:pass@host:5432/dbname` | **Да** |
| `JWT_SECRET` | Секретный ключ для JWT токенов | Минимум 32 случайных символа | **Да** |
| `JWT_EXPIRES_IN` | Время жизни токена | `86400` (24 часа в секундах) | Нет |
| `FRONTEND_URL` | URL фронтенда для CORS | `http://localhost:3000` | **Да** |
| `SESSION_SECRET` | Секрет сессий | Любая случайная строка | Нет |
| `LOG_REQUESTS` | Логирование запросов | `true` / `false` | Нет |

### Frontend (React/Webpack)

| Переменная | Описание | Пример значения | Обязательно |
|------------|----------|-----------------|-------------|
| `API_URL` | URL backend API | `/api` или `https://backend.onrender.com/api` | **Да** |

---

## 🔐 Генерация секретных ключей

### JWT_SECRET

Выполните команду в терминале:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Пример вывода:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

### SESSION_SECRET

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 💻 Локальная разработка

### Шаг 1: Создание файла .env

```bash
cd /workspace/online-testing-app
cp .env.example .env
```

### Шаг 2: Настройка DATABASE_URL

**Для macOS (Homebrew):**
```
DATABASE_URL=postgresql://postgres@localhost:5432/online_testing
```

**Для Windows (PostgreSQL Installer):**
```
DATABASE_URL=postgresql://postgres:ваш_пароль@localhost:5432/online_testing
```

**Для Linux:**
```
DATABASE_URL=postgresql://postgres@localhost:5432/online_testing
```

### Шаг 3: Создание базы данных

```bash
createdb online_testing
psql -d online_testing -f backend/schema.sql
```

### Шаг 4: Заполнение .env

```env
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://postgres@localhost:5432/online_testing
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
JWT_EXPIRES_IN=86400
FRONTEND_URL=http://localhost:3000
API_URL=/api
SESSION_SECRET=f1e2d3c4b5a6978869504132abcdef
LOG_REQUESTS=true
```

---

## ☁️ Деплой на Render.com

### Backend Web Service

В панели управления Render в разделе Environment Variables добавьте:

```
PORT=3001
NODE_ENV=production
DATABASE_URL=postgresql://online_testing_user:password@ep-xxx.region.aws.neon.tech/online_testing?sslmode=require
JWT_SECRET=<сгенерируйте новую случайную строку>
JWT_EXPIRES_IN=86400
FRONTEND_URL=https://online-testing-frontend.onrender.com
SESSION_SECRET=<сгенерируйте новую случайную строку>
LOG_REQUESTS=true
```

**Важно:** 
- `DATABASE_URL` берётся из созданной PostgreSQL базы на Render (Internal Database URL)
- `FRONTEND_URL` обновляется после деплоя frontend
- Используйте **разные** JWT_SECRET и SESSION_SECRET для production

### Frontend Static Site

В панели управления Render в разделе Environment Variables добавьте:

```
API_URL=https://online-testing-backend.onrender.com/api
```

**Важно:**
- Замените `online-testing-backend` на имя вашего backend сервиса
- URL должен совпадать с реальным адресом backend после деплоя

---

## 🔍 Проверка конфигурации

### Backend

После запуска сервера проверьте логи:

```
Server running on port 3001
Environment: production
Connected to PostgreSQL database
```

Если видите ошибки:
- `Error: connect ECONNREFUSED` — проверьте DATABASE_URL
- `jwt secret must be provided` — проверьте JWT_SECRET
- `CORS policy` — проверьте FRONTEND_URL

### Frontend

Откройте консоль браузера (F12):
- Ошибки CORS — проверьте FRONTEND_URL в backend
- Ошибки сети — проверьте API_URL

Проверьте health endpoint:
```bash
curl https://your-backend.onrender.com/api/health
```

Ответ:
```json
{"status":"ok","timestamp":"2024-01-01T00:00:00.000Z"}
```

---

## ⚠️ Частые проблемы

### 1. Ошибка подключения к базе данных

**Симптомы:**
```
Error: connect ECONNREFUSED
```

**Решение:**
- Проверьте формат DATABASE_URL
- Убедитесь, что база данных существует
- Для Render добавьте `?sslmode=require`

### 2. CORS ошибки

**Симптомы:**
```
Access to fetch at ... has been blocked by CORS policy
```

**Решение:**
- Проверьте FRONTEND_URL в backend .env
- Убедитесь, что URL совпадает с реальным адресом frontend
- Перезапустите backend сервис

### 3. Ошибка аутентификации

**Симптомы:**
```
Invalid or expired token
```

**Решение:**
- Проверьте JWT_SECRET (должен быть одинаковым после перезапусков)
- В production не меняйте JWT_SECRET без необходимости

### 4. API не доступен с frontend

**Симптомы:**
```
Network Error / ERR_CONNECTION_REFUSED
```

**Решение:**
- Проверьте API_URL в frontend
- Убедитесь, что backend сервис запущен
- Проверьте firewall правила (для облачных сервисов)

---

## 📝 Шаблон .env для копирования

```env
# Backend
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://postgres@localhost:5432/online_testing
JWT_SECRET=
JWT_EXPIRES_IN=86400
FRONTEND_URL=http://localhost:3000
SESSION_SECRET=
LOG_REQUESTS=true

# Frontend
API_URL=/api
```

Заполните пустые поля JWT_SECRET и SESSION_SECRET сгенерированными значениями.

---

## 🔒 Безопасность

**Никогда не коммитьте файл .env в репозиторий!**

Файл `.env` уже добавлен в `.gitignore`. Перед публикацией кода убедитесь:

```bash
git status
# Убедитесь, что .env нет в списке изменённых файлов
```

Для передачи конфигов команде используйте:
- Менеджеры паролей (LastPass, 1Password)
- Secure paste сервисы
- Переменные окружения в CI/CD системах
