// 할 일(Todo) 데이터 계층 — Supabase tb_todos 테이블.
// RLS가 created_by = auth.uid() 조건으로 걸려 있어, 로그인한 사용자 본인 행만 오간다.
// 삭제는 하드 삭제가 아니라 deleted_yn 소프트 삭제이며(테이블 설계), 조회 시 항상 제외한다.

import { supabase } from "./supabase/client";

export type Category = "need" | "want";
export type Priority = "low" | "medium" | "high";
export type Status = "pending" | "done";

export type Todo = {
  id: number;
  category: Category;
  title: string;
  dueDate: string | null; // YYYY-MM-DD
  priority: Priority;
  status: Status;
  memo: string;
  sortOrder: number;
  completedAt: string | null; // ISO 8601
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
};

export type NewTodo = {
  category: Category;
  title: string;
  dueDate?: string | null;
  priority?: Priority;
  memo?: string;
};

export type TodoDetailPatch = Partial<
  Pick<Todo, "category" | "title" | "dueDate" | "priority" | "memo">
>;

export const CATEGORY_LABEL: Record<Category, string> = {
  need: "자기계발",
  want: "취미",
};

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

export const STATUS_LABEL: Record<Status, string> = {
  pending: "진행중",
  done: "완료",
};

const SELECT_COLUMNS =
  "id, category, title, due_date, priority, status, memo, sort_order, completed_at, created_at, updated_at";

type TodoRow = {
  id: number;
  category: Category;
  title: string;
  due_date: string | null;
  priority: Priority;
  status: Status;
  memo: string | null;
  sort_order: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

function toTodo(row: TodoRow): Todo {
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    dueDate: row.due_date,
    priority: row.priority,
    status: row.status,
    memo: row.memo ?? "",
    sortOrder: row.sort_order,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function fetchTodos(): Promise<Todo[]> {
  const { data, error } = await supabase
    .from("tb_todos")
    .select(SELECT_COLUMNS)
    .eq("deleted_yn", "N")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(toTodo);
}

export async function insertTodo(
  input: NewTodo,
  sortOrder: number
): Promise<Todo> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error("로그인이 필요해요.");

  const { data, error } = await supabase
    .from("tb_todos")
    .insert({
      category: input.category,
      title: input.title.trim(),
      due_date: input.dueDate || null,
      priority: input.priority ?? "medium",
      memo: input.memo?.trim() || null,
      sort_order: sortOrder,
      created_by: userData.user.id,
    })
    .select(SELECT_COLUMNS)
    .single();
  if (error) throw error;
  return toTodo(data);
}

export async function updateTodoDetail(
  id: number,
  patch: TodoDetailPatch
): Promise<Todo> {
  const { data, error } = await supabase
    .from("tb_todos")
    .update({
      ...(patch.category !== undefined ? { category: patch.category } : {}),
      ...(patch.title !== undefined ? { title: patch.title.trim() } : {}),
      ...(patch.dueDate !== undefined ? { due_date: patch.dueDate || null } : {}),
      ...(patch.priority !== undefined ? { priority: patch.priority } : {}),
      ...(patch.memo !== undefined ? { memo: patch.memo.trim() || null } : {}),
    })
    .eq("id", id)
    .select(SELECT_COLUMNS)
    .single();
  if (error) throw error;
  return toTodo(data);
}

/** 상태를 토글한다. 완료로 바뀌면 완료일을 지금으로, 되돌리면 완료일을 비운다. */
export async function setTodoStatus(id: number, status: Status): Promise<Todo> {
  const { data, error } = await supabase
    .from("tb_todos")
    .update({
      status,
      completed_at: status === "done" ? new Date().toISOString() : null,
    })
    .eq("id", id)
    .select(SELECT_COLUMNS)
    .single();
  if (error) throw error;
  return toTodo(data);
}

/** 하드 삭제가 아니라 deleted_yn = 'Y'로 표시한다(테이블 설계상 소프트 삭제). */
export async function softDeleteTodo(id: number): Promise<void> {
  const { error } = await supabase
    .from("tb_todos")
    .update({ deleted_yn: "Y", deleted_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

/** 같은 카테고리 안에서 드래그로 정한 새 순서(id 배열)를 0부터 순서대로 저장한다. */
export async function persistTodoOrder(orderedIds: number[]): Promise<void> {
  const results = await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("tb_todos").update({ sort_order: index }).eq("id", id)
    )
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) throw failed.error;
}

/** 중요도가 높은 순 → 같은 중요도면 sort_order 순으로 정렬한다. */
export function sortTodosByPriority(todos: Todo[]): Todo[] {
  return [...todos].sort((a, b) => {
    if (a.priority !== b.priority)
      return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    return a.sortOrder - b.sortOrder;
  });
}

export function todosByCategory(todos: Todo[], category: Category): Todo[] {
  return sortTodosByPriority(todos.filter((t) => t.category === category));
}
