"use client";
import { useState } from "react";
import { format } from "date-fns";
import { X, Plus, Minus } from "lucide-react";
import { createLessonsBulk, TimeSlot } from "@/lib/api";

const DAY_NAMES = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

interface Props {
  defaultDay?: number;
  defaultHour?: number;
  weekStart: Date;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateLessonForm({
  defaultDay,
  defaultHour,
  weekStart,
  onClose,
  onCreated,
}: Props) {
  const [studentName, setStudentName] = useState("");
  const [parentName, setParentName] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [courseName, setCourseName] = useState("");
  const [firstLessonNumber, setFirstLessonNumber] = useState(1);
  const [duration, setDuration] = useState(60);
  const [slots, setSlots] = useState<TimeSlot[]>([
    {
      day_of_week: defaultDay ?? 0,
      hour: defaultHour ?? 10,
      minute: 0,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateSlot(index: number, patch: Partial<TimeSlot>) {
    setSlots((prev) =>
      prev.map((s, i) => (i === index ? { ...s, ...patch } : s))
    );
  }

  function addSlot() {
    setSlots((prev) => [...prev, { day_of_week: 0, hour: 10, minute: 0 }]);
  }

  function removeSlot(index: number) {
    if (slots.length <= 1) return;
    setSlots((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!studentName.trim() || !courseName.trim()) {
      setError("Заполните имя ученика и курс");
      return;
    }

    setLoading(true);
    try {
      await createLessonsBulk({
        student_name: studentName,
        parent_name: parentName,
        student_phone: studentPhone,
        parent_phone: parentPhone,
        course_name: courseName,
        first_lesson_number: firstLessonNumber,
        duration,
        slots,
        start_date: format(weekStart, "yyyy-MM-dd"),
      });
      onCreated();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка создания");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white rounded-t-2xl">
          <h2 className="text-xl font-bold">Новый ученик</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          {error && (
            <p className="text-red-600 text-sm bg-red-50 rounded p-2">
              {error}
            </p>
          )}

          {/* Student info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Имя ученика *
              </label>
              <input
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Имя родителя
              </label>
              <input
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Тел. ученика
              </label>
              <input
                value={studentPhone}
                onChange={(e) => setStudentPhone(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="+79001234567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Тел. родителя
              </label>
              <input
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="+79001234567"
              />
            </div>
          </div>

          {/* Course info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Курс *</label>
              <input
                required
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Математика ЕГЭ"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Номер первого урока
              </label>
              <input
                type="number"
                min={1}
                value={firstLessonNumber}
                onChange={(e) => setFirstLessonNumber(Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Длительность
            </label>
            <div className="flex gap-2">
              {[45, 60, 90].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d)}
                  className={`px-4 py-2 rounded-lg text-sm transition ${
                    duration === d
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {d} мин
                </button>
              ))}
            </div>
          </div>

          {/* Time slots */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Слоты (день/время)</label>
              <button
                type="button"
                onClick={addSlot}
                className="flex items-center gap-1 text-blue-600 text-sm hover:text-blue-800 transition"
              >
                <Plus size={14} /> Добавить слот
              </button>
            </div>
            <div className="space-y-2">
              {slots.map((slot, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <select
                    value={slot.day_of_week}
                    onChange={(e) =>
                      updateSlot(idx, { day_of_week: Number(e.target.value) })
                    }
                    className="border rounded-lg px-2 py-2 text-sm flex-1 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {DAY_NAMES.map((name, i) => (
                      <option key={i} value={i}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="time"
                    value={`${String(slot.hour).padStart(2, "0")}:${String(
                      slot.minute
                    ).padStart(2, "0")}`}
                    onChange={(e) => {
                      const [h, m] = e.target.value.split(":").map(Number);
                      updateSlot(idx, { hour: h, minute: m });
                    }}
                    className="border rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  {slots.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSlot(idx)}
                      className="p-2 text-red-400 hover:text-red-600 transition"
                    >
                      <Minus size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-medium"
          >
            {loading ? "Создание 52 уроков..." : "Создать (52 урока на год)"}
          </button>
        </div>
      </form>
    </div>
  );
}
