// 할 일(Todo) 데이터 계층.
// 지금은 localStorage에 저장하지만, 나중에 Supabase로 교체하기 쉽도록
// 저장소 접근을 이 파일의 함수들로 격리해 둔다.

export type Priority = "low" | "medium" | "high";

export type Todo = {
  id: string;
  title: string;
  done: boolean;
  dueDate: string | null; // YYYY-MM-DD
  priority: Priority;
  createdAt: string; // ISO 8601
};

export type NewTodo = {
  title: string;
  dueDate?: string | null;
  priority?: Priority;
};

const STORAGE_KEY = "lifelog:todos";

export const PRIORITY_LABEL: Record<Priority, string> = {
  high: "높음",
  medium: "보통",
  low: "낮음",
};

export const PRIORITY_ORDER: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

function isPriority(value: unknown): value is Priority {
  return value === "low" || value === "medium" || value === "high";
}

/** 저장된 값이 Todo 형태인지 최소한으로 검증한다. */
function normalize(raw: unknown): Todo | null {
  if (!raw || typeof raw !== "object") return null;
  const t = raw as Record<string, unknown>;
  if (typeof t.id !== "string" || typeof t.title !== "string") return null;
  return {
    id: t.id,
    title: t.title,
    done: Boolean(t.done),
    dueDate: typeof t.dueDate === "string" ? t.dueDate : null,
    priority: isPriority(t.priority) ? t.priority : "medium",
    createdAt: typeof t.createdAt === "string" ? t.createdAt : new Date().toISOString(),
  };
}

export function loadTodos(): Todo[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalize).filter((t): t is Todo => t !== null);
  } catch {
    return [];
  }
}

export function saveTodos(todos: Todo[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch {
    // 저장 실패(용량 초과 등)는 조용히 무시한다.
  }
}

export function createTodo(input: NewTodo): Todo {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    title: input.title.trim(),
    done: false,
    dueDate: input.dueDate ?? null,
    priority: input.priority ?? "medium",
    createdAt: new Date().toISOString(),
  };
}

/** 미완료 우선 → 우선순위 → 마감일(가까운 순) → 생성일(최신) 순으로 정렬한다. */
export function sortTodos(todos: Todo[]): Todo[] {
  return [...todos].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    if (a.priority !== b.priority)
      return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (a.dueDate && b.dueDate && a.dueDate !== b.dueDate)
      return a.dueDate < b.dueDate ? -1 : 1;
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;
    return a.createdAt < b.createdAt ? 1 : -1;
  });
}
