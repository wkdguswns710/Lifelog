-- Lifelog 할 일 스키마 (현재 상태 기준 전체 재작성본)
-- Supabase(PostgreSQL) 기준. 컬럼 순서는 자유롭게 바꿔도 무방함(모두 이름으로 참조됨).
-- 실 데이터가 없는 상태에서만 실행할 것 — 기존 tb_todos / tb_todo_categories를 지우고 새로 만든다.

drop table if exists tb_todos cascade;
drop table if exists tb_todo_categories cascade;

-- updated_at 자동 갱신용 공통 트리거 함수 (이미 있다면 재사용됨 — or replace라 중복 실행 안전)
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ─────────────────────────────
-- 할 일 카테고리 (운동/자산/피부/패션/생활/개발 … 사용자가 자유롭게 추가/수정/삭제)
-- ─────────────────────────────
create table tb_todo_categories (
  id          bigserial primary key,
  name        text not null,
  created_at  timestamptz not null default now(),
  created_by  uuid not null references auth.users(id) on delete cascade,
  updated_at  timestamptz not null default now(),

  unique (created_by, name)  -- 같은 사용자 안에서 카테고리명 중복 방지
);

create trigger tb_todo_categories_set_updated_at
  before update on tb_todo_categories
  for each row execute function set_updated_at();

alter table tb_todo_categories enable row level security;

create policy "select_own_todo_categories" on tb_todo_categories
  for select using (created_by = auth.uid());
create policy "insert_own_todo_categories" on tb_todo_categories
  for insert with check (created_by = auth.uid());
create policy "update_own_todo_categories" on tb_todo_categories
  for update using (created_by = auth.uid()) with check (created_by = auth.uid());
create policy "delete_own_todo_categories" on tb_todo_categories
  for delete using (created_by = auth.uid());

-- ─────────────────────────────
-- 할 일 목록
-- ─────────────────────────────
create table tb_todos (
  id            bigserial primary key,                                          -- 시리얼 번호
  purpose       text not null check (purpose in ('need', 'want')),              -- 구분(자기계발/취미) — 화면의 좌/우 컬럼
  category_id   bigint references tb_todo_categories(id) on delete set null,    -- 카테고리(운동/자산/…) — 자유 태그
  title         text not null,                                                  -- 할일명
  due_date      date,                                                           -- 기한
  priority      text not null default 'medium' check (priority in ('low', 'medium', 'high')),  -- 중요도
  status        text not null default 'pending' check (status in ('pending', 'done')),         -- 상태
  memo          text,                                                           -- 메모
  sort_order    integer not null default 0,                                     -- 같은 구분(purpose) 내 정렬 순서(드래그로 조정)
  completed_at  timestamptz,                                                    -- 완료일
  created_at    timestamptz not null default now(),                            -- 등록일
  created_by    uuid not null references auth.users(id) on delete cascade,     -- 등록자
  updated_at    timestamptz not null default now(),                            -- 수정일
  deleted_yn    text not null default 'N' check (deleted_yn in ('Y', 'N')),     -- 삭제여부
  deleted_at    timestamptz                                                    -- 삭제일
);

create trigger tb_todos_set_updated_at
  before update on tb_todos
  for each row execute function set_updated_at();

create index on tb_todos (created_by, purpose, sort_order) where deleted_yn = 'N';
create index on tb_todos (created_by, category_id);

-- ─────────────────────────────
-- Row Level Security — 본인(created_by = auth.uid()) 소유 행만 조회/수정 가능
-- ─────────────────────────────
alter table tb_todos enable row level security;

create policy "select_own_todos" on tb_todos
  for select using (created_by = auth.uid());
create policy "insert_own_todos" on tb_todos
  for insert with check (created_by = auth.uid());
create policy "update_own_todos" on tb_todos
  for update using (created_by = auth.uid()) with check (created_by = auth.uid());
create policy "delete_own_todos" on tb_todos
  for delete using (created_by = auth.uid());
