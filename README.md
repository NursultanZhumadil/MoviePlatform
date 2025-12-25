# Movie Platform - MERN Stack Project

Кино платформасы - MERN стектегі толық функционалды веб-қосымша.

## 📋 Сипаттама

Бұл платформа кино көру, пікір қалдыру және фильмдерді басқару мүмкіндіктерін қамтамасыз етеді. Жоба MERN стекте (MongoDB, Express.js, React/Next.js, Node.js) құрастырылған және GraphQL, TypeScript, Docker сияқты заманауи технологияларды пайдаланады.

## 🎯 Функционал

### Рольдер
- **Admin**: Фильмдерді қосу, өзгерту, жою (CRUD операциялары)
- **User**: Фильмдерді көру, пікір қалдыру, рейтинг беру

### Мүмкіндіктер
- ✅ JWT авторизация (Login/Register)
- ✅ Рольдер бойынша қолжетімділік
- ✅ Фильмдерді жанр бойынша категориялау
- ✅ Пікірлер және рейтингтер
- ✅ Реалтайм жаңартулар (GraphQL Subscriptions)
- ✅ Адаптивті дизайн (TailwindCSS)

## 🛠 Технологиялық стек

### Backend
- Node.js + Express.js
- GraphQL (Apollo Server)
- MongoDB + Mongoose
- TypeScript
- JWT авторизация
- GraphQL Subscriptions (WebSocket)

### Frontend
- Next.js 14 (App Router)
- React + TypeScript
- Apollo Client
- Zustand (State Management)
- TailwindCSS
- React Hook Form + Zod

### DevOps
- Docker + Docker Compose
- Jest (Тесттер)

## 🚀 Жылдам бастау

### Алғышарттар
- Docker & Docker Compose
- Node.js 18+ (локальды дамыту үшін)

### Docker арқылы іске қосу (Ұсынылады)

```bash
# Барлық сервистерді іске қосу
docker-compose up

# Артқы планда іске қосу
docker-compose up -d

# Тоқтату
docker-compose down
```

Сервистер:
- **Frontend**: http://localhost:3000
- **GraphQL API**: http://localhost:4000/graphql
- **WebSocket**: ws://localhost:4000/graphql
- **Mongo Express**: http://localhost:8081 (admin/admin)

### Локальды дамыту

```bash
# Dependencies орнату
npm install

# Server дамыту
cd server && npm install && npm run dev

# Client дамыту (жаңа терминалда)
cd client && npm install && npm run dev
```

## 📊 Модельдер

### User
- email, password, name, role (Admin/User), avatar, createdAt, updatedAt

### Movie
- title, description, genre, year, director, duration, poster, rating, createdAt, updatedAt

### Review
- movieId, userId, rating, comment, createdAt, updatedAt

### Genre
- name, description, movies (массив), createdAt, updatedAt

## 🔐 Тесттік пайдаланушылар

### Admin
```
Email: admin@test.com
Password: admin123
```

### User
```
Email: user@test.com
Password: user123
```

## 📡 GraphQL API

### Queries
- `me` - Ағымдағы пайдаланушы
- `movies` - Фильмдер тізімі
- `movie(id)` - Бір фильм
- `reviews(movieId)` - Фильм пікірлері
- `genres` - Жанрлар тізімі
- `searchMovies(query)` - Фильмдерді іздеу

### Mutations
- `register` - Тіркелу
- `login` - Кіру
- `createMovie` - Фильм қосу (Admin)
- `updateMovie` - Фильмді өзгерту (Admin)
- `deleteMovie` - Фильмді жою (Admin)
- `createReview` - Пікір қалдыру (User)

### Subscriptions
- `movieAdded` - Жаңа фильм қосылғанда
- `movieUpdated` - Фильм жаңартылғанда
- `reviewAdded` - Пікір қосылғанда

## 🔄 Реалтайм функционал

### Тестілеу

1. Екі браузер терезесін ашыңыз
2. Біріншіде Admin ретінде кіріңіз
3. Екіншіде User ретінде кіріңіз
4. Admin жаңа фильм қосқанда, User бетінде ол дереу пайда болады
5. User пікір қалдырғанда, фильм бетінде дереу көрінеді

## 🧪 Тесттер

```bash
# Барлық тесттерді іске қосу
cd server && npm test

# Coverage көрсету
cd server && npm run test:coverage
```

## 📝 Скрипттер

```bash
# Дамыту режимінде іске қосу
npm run dev

# Production билд
npm run build

# Тесттер
npm test

# Seed базасы
npm run seed

# Lint
npm run lint
```

## 📁 Проект құрылымы

```
.
├── server/          # Backend (GraphQL API)
│   ├── src/
│   │   ├── models/      # Mongoose моделдері
│   │   ├── resolvers/   # GraphQL резолверлер
│   │   ├── schema/      # GraphQL схема
│   │   ├── services/    # Бизнес логика
│   │   ├── utils/       # Утилиталар
│   │   └── types/       # TypeScript типтері
│   ├── tests/       # Jest тесттері
│   └── Dockerfile
├── client/          # Frontend (Next.js)
│   ├── app/         # Next.js App Router
│   ├── components/  # React компоненттері
│   ├── lib/         # Apollo, Zustand, утилиталар
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## 👥 Команда

- [Студент 1 аты] - Backend, GraphQL, Database
- [Студент 2 аты] - Frontend, UI/UX, State Management

## 🔗 Демо сілтемелері

### Production
- Frontend: [URL]
- GraphQL: [URL]/graphql
- WebSocket: ws://[URL]/graphql

## 📄 Лицензия

Бұл жоба оқу мақсатында құрастырылған.

