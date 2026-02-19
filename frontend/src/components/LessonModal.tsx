"use client";
import { useState } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { X, Send, Trash2, Save, Pencil } from "lucide-react";
import { Lesson, updateLesson, deleteLesson, deleteLessonSeries } from "@/lib/api";

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
  const [editing, setEditing] = useState(false);
  const [description, setDescription] = useState(lesson.description);
  const [studentName, setStudentName] = useState(lesson.student_name);
  const [parentName, setParentName] = useState(lesson.parent_name);
  const [studentPhone, setStudentPhone] = useState(lesson.student_phone);
  const [parentPhone, setParentPhone] = useState(lesson.parent_phone);
  const [courseName, setCourseName] = useState(lesson.course_name);
  const [saving, setSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await updateLesson(lesson.id, {
        description,
        student_name: studentName,
        parent_name: parentName,
        student_phone: studentPhone,
        parent_phone: parentPhone,
        course_name: courseName,
      });
      onUpdate();
      onClose();
    } catch {
      alert("Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteOne() {
    setDeleting(true);
    try {
      await deleteLesson(lesson.id);
      onUpdate();
      onClose();
    } catch {
      alert("Ошибка удаления");
    } finally {
      setDeleting(false);
    }
  }

  async function handleDeleteAll() {
    setDeleting(true);
    try {
      await deleteLessonSeries(lesson.id);
      onUpdate();
      onClose();
    } catch {
      alert("Ошибка удаления");
    } finally {
      setDeleting(false);
    }
  }

  const startTime = new Date(lesson.start_time);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-bold">
            {editing ? "Редактирование" : lesson.student_name}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          {editing ? (
            /* ── Edit mode ── */
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Имя ученика</label>
                  <input
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Имя родителя</label>
                  <input
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Тел. ученика</label>
                  <input
                    value={studentPhone}
                    onChange={(e) => setStudentPhone(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Тел. родителя</label>
                  <input
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Курс</label>
                <input
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Заметки</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="Заметки к этому уроку..."
                />
              </div>
            </>
          ) : (
            /* ── View mode ── */
            <>
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

              {lesson.description && (
                <div>
                  <span className="text-sm text-gray-500">Заметки:</span>
                  <p className="text-sm mt-1 bg-gray-50 rounded-lg p-2">
                    {lesson.description}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t">
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="flex items-center gap-1 text-red-500 hover:text-red-700 text-sm transition"
          >
            <Trash2 size={16} /> Удалить
          </button>
          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  Отмена
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition text-sm"
                >
                  <Save size={16} /> {saving ? "Сохранение..." : "Сохранить"}
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
              >
                <Pencil size={16} /> Редактировать
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h3 className="text-lg font-bold">Удалить урок</h3>
            <p className="text-sm text-gray-600">
              Удалить только этот урок или все уроки ученика{" "}
              <strong>{lesson.student_name}</strong> по курсу{" "}
              <strong>{lesson.course_name}</strong>?
            </p>
            <div className="space-y-2">
              <button
                onClick={handleDeleteOne}
                disabled={deleting}
                className="w-full py-2 px-4 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm font-medium disabled:opacity-50"
              >
                {deleting ? "Удаление..." : "Удалить только этот урок"}
              </button>
              <button
                onClick={handleDeleteAll}
                disabled={deleting}
                className="w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium disabled:opacity-50"
              >
                {deleting ? "Удаление..." : "Удалить все уроки серии"}
              </button>
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
