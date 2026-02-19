from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Lesson
from app.schemas import LessonBulkCreate, LessonOut, LessonUpdate
from app.auth import get_current_user

router = APIRouter(prefix="/api/lessons", tags=["lessons"])

WEEKS_IN_YEAR = 52


def _generate_lessons(data: LessonBulkCreate, user_id: int) -> list[Lesson]:
    """Generate 52 weekly lessons per slot (up to a year)."""
    base_date = datetime.fromisoformat(data.start_date)
    lessons: list[Lesson] = []
    lesson_num = data.first_lesson_number

    for week in range(WEEKS_IN_YEAR):
        for slot in data.slots:
            # Calculate start_time: base_date's Monday + day_of_week offset + week offset
            days_offset = slot.day_of_week + (week * 7)
            start_time = base_date + timedelta(days=days_offset)
            start_time = start_time.replace(hour=slot.hour, minute=slot.minute, second=0, microsecond=0)

            lessons.append(
                Lesson(
                    user_id=user_id,
                    student_name=data.student_name,
                    parent_name=data.parent_name,
                    student_phone=data.student_phone,
                    parent_phone=data.parent_phone,
                    course_name=data.course_name,
                    lesson_number=lesson_num,
                    start_time=start_time,
                    duration=data.duration,
                    description="",
                )
            )
            lesson_num += 1

    return lessons


@router.post("/bulk", response_model=list[LessonOut], status_code=201)
def create_lessons_bulk(
    data: LessonBulkCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lessons = _generate_lessons(data, current_user.id)
    db.add_all(lessons)
    db.commit()
    for lesson in lessons:
        db.refresh(lesson)
    return lessons


@router.get("/", response_model=list[LessonOut])
def get_lessons(
    start: str = Query(..., description="ISO datetime — week start"),
    end: str = Query(..., description="ISO datetime — week end"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    start_dt = datetime.fromisoformat(start)
    end_dt = datetime.fromisoformat(end)
    lessons = (
        db.query(Lesson)
        .filter(
            Lesson.user_id == current_user.id,
            Lesson.start_time >= start_dt,
            Lesson.start_time < end_dt,
        )
        .order_by(Lesson.start_time)
        .all()
    )
    return lessons


@router.get("/{lesson_id}", response_model=LessonOut)
def get_lesson(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id, Lesson.user_id == current_user.id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson


@router.patch("/{lesson_id}", response_model=LessonOut)
def update_lesson(
    lesson_id: int,
    data: LessonUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id, Lesson.user_id == current_user.id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(lesson, key, value)

    db.commit()
    db.refresh(lesson)
    return lesson


@router.delete("/{lesson_id}", status_code=204)
def delete_lesson(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id, Lesson.user_id == current_user.id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    db.delete(lesson)
    db.commit()
