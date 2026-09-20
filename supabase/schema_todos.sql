-- Lifelog 할 일 스키마
-- Supabase(PostgreSQL) 기준. tb_transactions와 동일한 컬럼 네이밍 관례를 따른다
-- (created_at/created_by/updated_at/deleted_yn/deleted_at는 소프트 삭제용).

-- updated_at 자동 갱신 트리거 함수는 schema_budget.sql에서 이미 생성했다면 재사용됨(or replace이므로 중복 실행 안전).
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ─────────────────────────────
-- 할 일 목록
-- ─────────────────────────────
create table tb_todos (
  id            bigserial primary key,                                          -- 시리얼 번호
  category      text not null check (category in ('need', 'want')),             -- 카테고리(해야하는일/하고싶은일)
  title         text not null,                                                  -- 할일명
  due_date      date,                                                           -- 기한
  priority      text not null default 'medium' check (priority in ('low', 'medium', 'high')),  -- 중요도
  status        text not null default 'pending' check (status in ('pending', 'done')),         -- 상태
  memo          text,                                                           -- 메모
  sort_order    integer not null default 0,                                     -- 같은 카테고리 내 정렬 순서(드래그로 조정)
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

create index on tb_todos (created_by, category, sort_order) where deleted_yn = 'N';

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
