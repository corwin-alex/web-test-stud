# Решение проблемы с пустой страницей при деплое на Render.com

## Проблема
После успешной сборки фронтенда вместо сайта отображается пустая страница.

## Найденные и исправленные ошибки:

### 1. Отсутствие конфигурации Babel для JSX
**Проблема:** Webpack не знал, как обрабатывать JSX-синтаксис React.

**Решение:** 
- Создан файл `.babelrc` с настройками presets для React
- Обновлен `webpack.config.js` с явным указанием опций babel-loader

### 2. Неправильный publicPath для статического хостинга
**Проблема:** При деплое на Render.com (Static Site) пути к ресурсам указывались абсолютно (`/bundle.js`), что приводило к 404 ошибкам.

**Решение:** Изменён `publicPath` с `'/'` на `''` в webpack.config.js для использования относительных путей.

## Файлы, которые были изменены:

### 1. `/frontend/.babelrc` (создан новый)
```json
{
  "presets": [
    "@babel/preset-env",
    ["@babel/preset-react", { "runtime": "automatic" }]
  ]
}
```

### 2. `/frontend/webpack.config.js` (изменён)
- Добавлены опции babel-loader с presets
- Изменён publicPath с `'/'` на `''`

## Проверка сборки

Сборка теперь проходит успешно:
- bundle.[hash].js создаётся корректно
- index.html содержит относительные пути к скриптам
- JSX трансформируется в валидный JavaScript

## Для деплоя на Render.com:

1. **Backend** (Web Service):
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`

2. **Frontend** (Static Site):
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Publish Directory: `dist`

3. **Database** (PostgreSQL):
   - Создать через панель Render
   - Скопировать DATABASE_URL в переменные окружения Backend

## Переменные окружения для Backend:
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key-here
PORT=3001
FRONTEND_URL=https://your-frontend.onrender.com
NODE_ENV=production
```

## Если всё ещё видите пустую страницу:

1. Откройте DevTools в браузере (F12)
2. Проверьте консоль на наличие ошибок JavaScript
3. Проверьте Network tab на наличие 404 ошибок
4. Убедитесь, что API_URL настроен правильно для production

## Важные замечания:

- Для работы приложения backend должен быть доступен по HTTPS
- В production укажите полный URL backend в переменной API_URL при сборке
- CORS должен быть настроен на backend для вашего frontend URL
