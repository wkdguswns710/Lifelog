-- Lifelog 가계부 스키마 (현재 상태 기준 전체 재작성본)
-- Supabase(PostgreSQL) 기준. 컬럼 순서는 자유롭게 바꿔도 무방함(모두 이름으로 참조됨).
-- 실 데이터가 없는 상태에서만 실행할 것 — 기존 tb_accounts / tb_transactions를 지우고 새로 만든다.
-- (가져오기함/API 동기화 기능은 제거되어 tb_api_transactions는 더 이상 존재하지 않는다.)

drop table if exists tb_transactions cascade;
drop table if exists tb_accounts cascade;

-- updated_at 자동 갱신용 공통 트리거 함수 (이미 있다면 재사용됨 — or replace라 중복 실행 안전)
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ─────────────────────────────
-- 계좌 목록
-- ─────────────────────────────
create table tb_accounts (
  id          bigserial primary key,          -- 시리얼 번호
  bank        text not null,                 -- 은행명
  last4       text,                          -- 계좌번호 뒷 4자리(선택)
  alias       text not null,                 -- 계좌별명
  sort_order  integer not null default 0,    -- 사용자가 드래그로 정한 표시 순서
  created_at  timestamptz not null default now(),  -- 등록일
  created_by  uuid not null references auth.users(id) on delete cascade,  -- 등록자
  updated_at  timestamptz not null default now()   -- 수정일
);

create trigger tb_accounts_set_updated_at
  before update on tb_accounts
  for each row execute function set_updated_at();

create index on tb_accounts (created_by, sort_order);

-- ─────────────────────────────
-- 계좌 거래 이력 — 확정 거래 원장(직접입력)
-- ─────────────────────────────
create table tb_transactions (
  id           bigserial primary key,   -- 시리얼 번호
  account_id   bigint not null references tb_accounts(id) on delete restrict,  -- 계좌아이디(필수)
  type         text not null check (type in ('income', 'expense')),            -- 수입/지출
  amount       integer not null check (amount > 0),                            -- 금액
  category     text not null,                                                 -- 카테고리
  memo         text,                                                          -- 메모
  occurred_at  timestamptz not null,                                          -- 거래시각(시분초 포함)
  created_at   timestamptz not null default now(),                            -- 등록일
  created_by   uuid not null references auth.users(id),                       -- 등록자
  updated_at   timestamptz not null default now(),                            -- 수정일
  deleted_yn   text not null default 'N' check (deleted_yn in ('Y', 'N')),     -- 삭제여부
  deleted_at   timestamptz                                                    -- 삭제일
);

create trigger tb_transactions_set_updated_at
  before update on tb_transactions
  for each row execute function set_updated_at();

create index on tb_transactions (created_by, occurred_at desc) where deleted_yn = 'N';
create index on tb_transactions (account_id);

-- ─────────────────────────────
-- Row Level Security — 본인(created_by = auth.uid()) 소유 행만 조회/수정 가능
-- ─────────────────────────────
alter table tb_accounts enable row level security;
alter table tb_transactions enable row level security;

-- tb_accounts
create policy "select_own_accounts" on tb_accounts
  for select using (created_by = auth.uid());
create policy "insert_own_accounts" on tb_accounts
  for insert with check (created_by = auth.uid());
create policy "update_own_accounts" on tb_accounts
  for update using (created_by = auth.uid()) with check (created_by = auth.uid());
create policy "delete_own_accounts" on tb_accounts
  for delete using (created_by = auth.uid());

-- tb_transactions
create policy "select_own_transactions" on tb_transactions
  for select using (created_by = auth.uid());
create policy "insert_own_transactions" on tb_transactions
  for insert with check (created_by = auth.uid());
create policy "update_own_transactions" on tb_transactions
  for update using (created_by = auth.uid()) with check (created_by = auth.uid());
create policy "delete_own_transactions" on tb_transactions
  for delete using (created_by = auth.uid());
