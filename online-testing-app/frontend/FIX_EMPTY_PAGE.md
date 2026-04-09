# Решение проблемы с пустой страницей при деплое на Render.com

## Проблема
После успешной сборки фронтенда отображалась только пустая страница вместо работающего приложения.

## Причины и решения

### 1. Переменные окружения не передавались в сборку
**Проблема:** `process.env.API_URL` не был доступен в собранном коде, так как Webpack не подставлял значение переменной окружения.

**Решение:** Добавлен `DefinePlugin` в `webpack.config.js`:
```javascript
new webpack.DefinePlugin({
  'process.env.API_URL': JSON.stringify(process.env.API_URL || '/api')
})
```

Теперь переменная `API_URL` корректно передаётся в приложение во время сборки.

### 2. Отсутствовал базовый URL для React Router
**Проблема:** React Router (BrowserRouter) требовал указания базового пути для корректной работы роутинга на статическом хостинге.

**Решение:** Добавлен тег `<base href="/" />` в `public/index.html`:
```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Online Testing System</title>
  <base href="/" />
</head>
```

Это обеспечивает корректную работу относительных путей при навигации.

## Изменённые файлы

1. **webpack.config.js**
   - Добавлен импорт `webpack`
   - Добавлен `DefinePlugin` для передачи `API_URL`

2. **public/index.html**
   - Добавлен тег `<base href="/" />`

## Настройка для Render.com

### Frontend (Static Site)
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Publish Directory:** `dist`
- **Environment Variables:**
  - `API_URL` = `https://your-backend-url.onrender.com/api` (URL вашего бэкенда)

### Backend (Web Service)
- **Root Directory:** `backend`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Environment Variables:**
  - `DATABASE_URL` (из PostgreSQL сервиса)
  - `JWT_SECRET` (случайная строка)
  - `PORT` = `3001`
  - `NODE_ENV` = `production`
  - `FRONTEND_URL` = `https://your-frontend-url.onrender.com`

## Проверка локально

Перед деплоем проверьте сборку локально:

```bash
cd frontend
npm run build
```

Затем откройте `dist/index.html` в браузере или используйте локальный сервер:
```bash
npx serve dist
```

## Дополнительные замечания

1. **CORS:** Убедитесь, что бэкенд разрешает запросы с домена фронтенда
2. **API_URL:** Для production обязательно установите переменную `API_URL` в настройках Render.com для фронтенда
3. **История браузера:** Тег `<base>` обеспечивает корректную работу кнопок "Назад"/"Вперёд" в браузере

## Логи сборки

Сборка проходит успешно без ошибок:
```
asset bundle.[hash].js 233 KiB [emitted] [immutable] [minimized] (name: main)
asset index.html 278 bytes [emitted]
webpack compiled successfully
```

Предупреждения о deprecated функциях в SCSS не влияют на работу приложения.
