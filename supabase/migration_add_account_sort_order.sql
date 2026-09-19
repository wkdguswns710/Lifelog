-- tb_accounts에 사용자가 드래그로 정한 순서를 저장할 컬럼 추가

alter table tb_accounts add column sort_order integer not null default 0;

-- 기존 계좌는 등록일 순서대로 0,1,2...를 채워 넣는다.
with ordered as (
  select id, row_number() over (partition by created_by order by created_at) - 1 as rn
  from tb_accounts
)
update tb_accounts
set sort_order = ordered.rn
from ordered
where tb_accounts.id = ordered.id;

create index on tb_accounts (created_by, sort_order);
