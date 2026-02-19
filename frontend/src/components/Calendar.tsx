"use client";
import { useState, useEffect, useCallback } from "react";
import {
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  format,
  addDays,
  isToday,
  setHours,
  setMinutes,
} from "date-fns";
import { ru } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus, LogOut } from "lucide-react";
import { getLessons, Lesson } from "@/lib/api";
import { removeToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import LessonModal from "./LessonModal";
import CreateLessonForm from "./CreateLessonForm";

const HOURS = Array.from({ length: 15 }, (_, i) => i + 8); // 08:00–22:00
const DAYS = 7;

export default function Calendar() {
  const router = useRouter();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createDefaults, setCreateDefaults] = useState<{
    day: number;
    hour: number;
  } | null>(null);
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });

  const fetchLessons = useCallback(async () => {
    try {
      const data = await getLessons(
        weekStart.toISOString(),
        weekEnd.toISOString()
      );
      setLessons(data);
    } catch {
      // token expired
      removeToken();
      router.push("/login");
    }
  }, [weekStart.toISOString(), weekEnd.toISOString(), router]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  function getLessonsForCell(dayIndex: number, hour: number) {
    const cellDate = addDays(weekStart, dayIndex);
    return lessons.filter((l) => {
      const d = new Date(l.start_time);
      return (
        d.getFullYear() === cellDate.getFullYear() &&
        d.getMonth() === cellDate.getMonth() &&
        d.getDate() === cellDate.getDate() &&
        d.getHours() === hour
      );
    });
  }

  function handleCellClick(dayIndex: number, hour: number) {
    setCreateDefaults({ day: dayIndex, hour });
    setShowCreate(true);
  }

  function handleLogout() {
    removeToken();
    router.push("/login");
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-lg font-semibold min-w-[220px] text-center">
            {format(weekStart, "d MMM", { locale: ru })} —{" "}
            {format(weekEnd, "d MMM yyyy", { locale: ru })}
          </h2>
          <button
            onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronRight size={20} />
          </button>
          <button
            onClick={() => setCurrentWeek(new Date())}
            className="ml-2 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
          >
            Сегодня
          </button>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-gray-500 hover:text-red-600 transition text-sm"
        >
          <LogOut size={16} /> Выйти
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b sticky top-[57px] bg-white z-10">
        <div className="border-r" />
        {Array.from({ length: DAYS }).map((_, i) => {
          const day = addDays(weekStart, i);
          const today = isToday(day);
          return (
            <div
              key={i}
              className={`text-center py-2 text-sm font-medium border-r ${
                today ? "bg-red-50 text-red-600" : "text-gray-600"
              }`}
            >
              <div>{format(day, "EEE", { locale: ru })}</div>
              <div
                className={`text-lg font-bold ${
                  today
                    ? "bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto"
                    : ""
                }`}
              >
                {format(day, "d")}
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-[60px_repeat(7,1fr)]">
          {HOURS.map((hour) => (
            <div key={hour} className="contents">
              {/* Time label */}
              <div className="border-r border-b h-16 flex items-start justify-end pr-2 pt-1 text-xs text-gray-400">
                {String(hour).padStart(2, "0")}:00
              </div>
              {/* Day cells */}
              {Array.from({ length: DAYS }).map((_, dayIndex) => {
                const cellKey = `${dayIndex}-${hour}`;
                const cellLessons = getLessonsForCell(dayIndex, hour);
                const day = addDays(weekStart, dayIndex);
                const todayCol = isToday(day);

                return (
                  <div
                    key={cellKey}
                    className={`border-r border-b h-16 relative group cursor-pointer transition ${
                      todayCol ? "bg-red-50/30" : "hover:bg-blue-50/50"
                    }`}
                    onMouseEnter={() => setHoveredCell(cellKey)}
                    onMouseLeave={() => setHoveredCell(null)}
                    onClick={() => {
                      if (cellLessons.length === 0) handleCellClick(dayIndex, hour);
                    }}
                  >
                    {/* Lessons */}
                    {cellLessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLesson(lesson);
                        }}
                        className="absolute inset-x-0.5 top-0.5 bottom-0.5 bg-blue-500 text-white rounded px-1 py-0.5 text-xs overflow-hidden cursor-pointer hover:bg-blue-600 transition z-[1]"
                        style={{
                          height: `${(lesson.duration / 60) * 64 - 4}px`,
                        }}
                      >
                        <div className="font-semibold truncate">
                          {lesson.student_name}
                        </div>
                        <div className="truncate opacity-80">
                          #{lesson.lesson_number} · {lesson.course_name}
                        </div>
                      </div>
                    ))}

                    {/* + button on hover */}
                    {cellLessons.length === 0 && hoveredCell === cellKey && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-7 h-7 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                          <Plus size={16} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={() => {
          setCreateDefaults(null);
          setShowCreate(true);
        }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition flex items-center justify-center z-20"
      >
        <Plus size={28} />
      </button>

      {/* Modals */}
      {selectedLesson && (
        <LessonModal
          lesson={selectedLesson}
          onClose={() => setSelectedLesson(null)}
          onUpdate={fetchLessons}
        />
      )}

      {showCreate && (
        <CreateLessonForm
          defaultDay={createDefaults?.day}
          defaultHour={createDefaults?.hour}
          weekStart={weekStart}
          onClose={() => setShowCreate(false)}
          onCreated={fetchLessons}
        />
      )}
    </div>
  );
}
