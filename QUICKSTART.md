# Quick Start Guide

## 🚀 Быстрый запуск с Docker

```bash
# 1. Клонировать репозиторий
git clone <repository-url>
cd nextjs-app-structure

# 2. Запустить все сервисы
docker-compose up

# 3. Открыть в браузере
# Frontend: http://localhost:3000
# GraphQL Playground: http://localhost:4000/graphql
# Mongo Express: http://localhost:8081 (admin/admin)
```

## 📝 Тестовые пользователи

После запуска seed скрипта:

**Admin:**
- Email: `admin@test.com`
- Password: `admin123`

**User:**
- Email: `user@test.com`
- Password: `user123`

## 🔄 Запуск seed скрипта

```bash
# В Docker контейнере
docker-compose exec api npm run seed

# Или локально
cd server
npm install
npm run seed
```

## 🧪 Запуск тестов

```bash
# В Docker контейнере
docker-compose exec api npm test

# Или локально
cd server
npm install
npm test
```

## 🔌 Проверка реалтайм функционала

1. Откройте два браузера/вкладки
2. В первом войдите как Admin
3. Во втором войдите как User
4. В Admin панели создайте новый фильм
5. Во втором браузере фильм должен появиться автоматически (без обновления страницы)

## 📦 Локальная разработка

### Backend
```bash
cd server
npm install
npm run dev
```

### Frontend
```bash
cd client
npm install
npm run dev
```

## 🛠 Полезные команды

```bash
# Остановить все сервисы
docker-compose down

# Пересобрать контейнеры
docker-compose up --build

# Просмотр логов
docker-compose logs -f api
docker-compose logs -f client
```

