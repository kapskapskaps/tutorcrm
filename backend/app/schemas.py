from datetime import datetime
from pydantic import BaseModel, EmailStr


# ── Auth ──────────────────────────────────────────────
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    password_confirm: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    email: str
    model_config = {"from_attributes": True}


# ── Lessons ───────────────────────────────────────────
class TimeSlot(BaseModel):
    day_of_week: int          # 0=Mon … 6=Sun
    hour: int
    minute: int = 0


class LessonBulkCreate(BaseModel):
    student_name: str
    parent_name: str = ""
    student_phone: str = ""
    parent_phone: str = ""
    course_name: str
    first_lesson_number: int = 1
    duration: int = 60        # 45 / 60 / 90
    slots: list[TimeSlot]     # 1+ slots per week
    start_date: str           # ISO date of the week start, e.g. "2026-02-16"


class LessonOut(BaseModel):
    id: int
    user_id: int
    student_name: str
    parent_name: str
    student_phone: str
    parent_phone: str
    course_name: str
    lesson_number: int
    start_time: datetime
    duration: int
    description: str
    model_config = {"from_attributes": True}


class LessonUpdate(BaseModel):
    description: str | None = None
    student_name: str | None = None
    parent_name: str | None = None
    student_phone: str | None = None
    parent_phone: str | None = None
    course_name: str | None = None
    start_time: datetime | None = None
    duration: int | None = None
