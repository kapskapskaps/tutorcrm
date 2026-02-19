"use client";
import { useState } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { X, Send, Trash2, Save } from "lucide-react";
import { Lesson, updateLesson, deleteLesson } from "@/lib/api";

interface Props {
  lesson: Lesson;
  onClose: () => void;
  onUpdate: () => void;
}

function telegramLink(phone: string) {
  const cleaned = phone.replace(/[^0-9+]/g, "");
  const withPlus = cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
  return `https://t.me/${withPlus}`;
}

export default function LessonModal({ lesson, onClose, onUpdate }: Props) {
  const [description, setDescription] = useState(lesson.description);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await updateLesson(lesson.id, { description });
      onUpdate();
      onClose();
    } catch {
      alert("Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Удалить этот урок?")) return;
    try {
      await deleteLesson(lesson.id);
      onUpdate();
      onClose();
    } catch {
      alert("Ошибка удаления");
    }
  }

  const startTime = new Date(lesson.start_time);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-bold">{lesson.student_name}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">Курс:</span>{" "}
              <span className="font-medium">{lesson.course_name}</span>
            </div>
            <div>
              <span className="text-gray-500">Урок №:</span>{" "}
              <span className="font-medium">{lesson.lesson_number}</span>
            </div>
            <div>
              <span className="text-gray-500">Дата:</span>{" "}
              <span className="font-medium">
                {format(startTime, "d MMMM yyyy, HH:mm", { locale: ru })}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Длительность:</span>{" "}
              <span className="font-medium">{lesson.duration} мин</span>
            </div>
          </div>

          {/* Contacts */}
          <div className="space-y-2">
            {lesson.student_phone && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Тел. ученика:</span>
                <span>{lesson.student_phone}</span>
                <a
                  href={telegramLink(lesson.student_phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-700 ml-1"
                >
                  <Send size={14} /> Telegram
                </a>
              </div>
            )}
            {lesson.parent_name && (
              <div className="text-sm">
                <span className="text-gray-500">Родитель:</span>{" "}
                {lesson.parent_name}
              </div>
            )}
            {lesson.parent_phone && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Тел. родителя:</span>
                <span>{lesson.parent_phone}</span>
                <a
                  href={telegramLink(lesson.parent_phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-700 ml-1"
                >
                  <Send size={14} /> Telegram
                </a>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Заметки
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              placeholder="Заметки к этому уроку..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t">
          <button
            onClick={handleDelete}
            className="flex items-center gap-1 text-red-500 hover:text-red-700 text-sm transition"
          >
            <Trash2 size={16} /> Удалить
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition text-sm"
          >
            <Save size={16} /> {saving ? "Сохранение..." : "Сохранить"}
          </button>
        </div>
      </div>
    </div>
  );
}
