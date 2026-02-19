const API_URL = "http://193.222.99.69:8000";

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed: ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Auth ─────────────────────────────────────────────
export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export function register(
  email: string,
  password: string,
  password_confirm: string
) {
  return request<TokenResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, password_confirm }),
  });
}

export function login(email: string, password: string) {
  return request<TokenResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function getMe() {
  return request<{ id: number; email: string }>("/api/auth/me");
}

// ── Lessons ──────────────────────────────────────────
export interface Lesson {
  id: number;
  user_id: number;
  student_name: string;
  parent_name: string;
  student_phone: string;
  parent_phone: string;
  course_name: string;
  lesson_number: number;
  start_time: string;
  duration: number;
  description: string;
}

export interface TimeSlot {
  day_of_week: number;
  hour: number;
  minute: number;
}

export interface BulkCreatePayload {
  student_name: string;
  parent_name: string;
  student_phone: string;
  parent_phone: string;
  course_name: string;
  first_lesson_number: number;
  duration: number;
  slots: TimeSlot[];
  start_date: string;
}

export function getLessons(start: string, end: string) {
  return request<Lesson[]>(
    `/api/lessons/?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`
  );
}

export function createLessonsBulk(data: BulkCreatePayload) {
  return request<Lesson[]>("/api/lessons/bulk", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateLesson(id: number, data: Partial<Lesson>) {
  return request<Lesson>(`/api/lessons/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteLesson(id: number) {
  return request<void>(`/api/lessons/${id}`, { method: "DELETE" });
}
