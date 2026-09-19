-- Lifelog 가계부 스키마 (계좌 / 확정 거래 / API 동기화 원본)
-- Supabase(PostgreSQL) 기준.

-- updated_at 자동 갱신용 공통 트리거 함수
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
  holder_name text,                          -- 예금주
  alias       text not null,                 -- 계좌별명
  created_at  timestamptz not null default now(),  -- 등록일
  created_by  uuid not null references auth.users(id) on delete cascade,  -- 등록자
  updated_at  timestamptz not null default now()   -- 수정일
);

create trigger tb_accounts_set_updated_at
  before update on tb_accounts
  for each row execute function set_updated_at();

-- ─────────────────────────────
-- 계좌 거래 이력 — 최종 확정 거래 원장 (직접입력 + API 확정분 모두 포함)
-- ─────────────────────────────
create table tb_transactions (
  id                  bigserial primary key,   -- 시리얼 번호
  account_id          bigint not null references tb_accounts(id) on delete restrict,  -- 계좌아이디(필수)
  source_type         text not null check (source_type in ('manual', 'api')),         -- 소스종류
  api_transaction_id  bigint,                                                         -- 원본 API 레코드 추적, source_type='api'일 때만 값 존재 — FK는 tb_api_transactions 생성 후 파일 하단에서 추가
  type                text not null check (type in ('income', 'expense')),            -- 수입/지출
  amount              integer not null check (amount > 0),                            -- 금액
  category            text not null,                                                 -- 카테고리
  memo                text,                                                           -- 메모
  occurred_at         timestamptz not null,                                           -- 거래시각(시분초 포함)
  created_at          timestamptz not null default now(),                             -- 등록일
  created_by          uuid not null references auth.users(id),                        -- 등록자
  updated_at          timestamptz not null default now(),                             -- 수정일
  deleted_yn          text not null default 'N' check (deleted_yn in ('Y', 'N')),      -- 삭제여부
  deleted_at          timestamptz                                                     -- 삭제일
);

create trigger tb_transactions_set_updated_at
  before update on tb_transactions
  for each row execute function set_updated_at();

create index on tb_transactions (created_by, occurred_at desc) where deleted_yn = 'N';
create index on tb_transactions (account_id);

-- ─────────────────────────────
-- 계좌 거래 이력 — API 동기화 원본(가져오기함에서 검토 전 상태)
-- ─────────────────────────────
create table tb_api_transactions (
  id            bigserial primary key,   -- 시리얼 번호
  account_id    bigint not null references tb_accounts(id) on delete cascade,  -- 계좌아이디(필수)
  external_id   text not null,                                                 -- 거래고유아이디(은행/API 발급, 재동기화 중복 방지 키)
  type          text not null check (type in ('income', 'expense')),           -- 수입/지출
  amount        integer not null check (amount > 0),                           -- 금액
  category      text,                                                          -- 카테고리(API 원본, 느슨하게)
  memo          text,                                                          -- 메모
  occurred_at   timestamptz not null,                                          -- 거래시각(시분초 포함)
  created_at    timestamptz not null default now(),                            -- 등록일
  created_by    uuid not null references auth.users(id) on delete cascade,     -- 소유자(RLS용, tb_accounts 조인 없이 바로 필터링)
  status        text not null default 'pending' check (status in ('pending', 'imported')),  -- 상태

  unique (account_id, external_id)  -- 같은 계좌에서 같은 거래 중복 수집 방지
);

create index on tb_api_transactions (created_by, status, occurred_at desc);

-- tb_transactions.api_transaction_id → tb_api_transactions.id 순환 참조 때문에
-- tb_transactions 생성 시점엔 FK가 없었으므로 여기서 추가한다.
alter table tb_transactions
  add constraint tb_transactions_api_transaction_id_fkey
  foreign key (api_transaction_id) references tb_api_transactions(id) on delete set null;

-- ─────────────────────────────
-- Row Level Security — 본인(created_by = auth.uid()) 소유 행만 조회/수정 가능
-- ─────────────────────────────
alter table tb_accounts enable row level security;
alter table tb_transactions enable row level security;
alter table tb_api_transactions enable row level security;

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

-- tb_api_transactions
create policy "select_own_api_transactions" on tb_api_transactions
  for select using (created_by = auth.uid());
create policy "insert_own_api_transactions" on tb_api_transactions
  for insert with check (created_by = auth.uid());
create policy "update_own_api_transactions" on tb_api_transactions
  for update using (created_by = auth.uid()) with check (created_by = auth.uid());
create policy "delete_own_api_transactions" on tb_api_transactions
  for delete using (created_by = auth.uid());
