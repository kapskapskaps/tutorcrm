# Tutor CRM

CRM-система для репетиторов с недельным календарём, массовой генерацией уроков и интеграцией с Telegram.

## Стек

- **Frontend:** Next.js 14 (App Router), Tailwind CSS, Lucide React, date-fns
- **Backend:** FastAPI, SQLAlchemy 2.0, Pydantic v2, JWT
- **Database:** PostgreSQL 16
- **Infrastructure:** Docker, Docker Compose

## Быстрый старт

### 1. Клонируйте репозиторий

```bash
git clone https://github.com/kapskapskaps/tutorcrm
cd tutor-crm
```

### 2. Запустите через Docker Compose

```bash
docker compose up --build
```

Это поднимет 3 контейнера:
- `db` — PostgreSQL на порту **5432**
- `backend` — FastAPI на порту **8000**
- `frontend` — Next.js на порту **3000**

### 3. Откройте в браузере

```
http://localhost:3000
```

1. Зарегистрируйтесь на странице `/register`
2. Попадёте в недельный календарь
3. Нажмите **+** (FAB или ячейку) для создания ученика
4. Заполните форму — система создаст 52 урока на год вперёд

## Разработка без Docker

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Запуск (нужен запущенный PostgreSQL)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tutor_crm \
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Откройте `http://localhost:3000`

## Структура проекта

```
tutor-crm/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py          # FastAPI app, CORS, lifespan
│       ├── models.py         # SQLAlchemy: User, Lesson
│       ├── schemas.py        # Pydantic: request/response
│       ├── database.py       # Engine, session, Base
│       ├── auth.py           # JWT, password hashing
│       └── routers/
│           ├── auth.py       # /api/auth/register, login, me
│           └── lessons.py    # /api/lessons/ CRUD + bulk
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── lib/
│       │   ├── api.ts        # HTTP client
│       │   └── auth.ts       # Token helpers
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx      # Redirect
│       │   ├── login/page.tsx
│       │   ├── register/page.tsx
│       │   └── calendar/page.tsx
│       └── components/
│           ├── Calendar.tsx       # Weekly grid
│           ├── LessonModal.tsx    # Lesson details + Telegram
│           └── CreateLessonForm.tsx # Bulk creation form
```

## API Endpoints

| Method | Endpoint | Описание |
|--------|----------|----------|
| POST | `/api/auth/register` | Регистрация |
| POST | `/api/auth/login` | Вход |
| GET | `/api/auth/me` | Текущий пользователь |
| POST | `/api/lessons/bulk` | Массовое создание (52 урока) |
| GET | `/api/lessons/?start=&end=` | Уроки за период |
| GET | `/api/lessons/{id}` | Один урок |
| PATCH | `/api/lessons/{id}` | Обновить (заметки и др.) |
| DELETE | `/api/lessons/{id}` | Удалить урок |
