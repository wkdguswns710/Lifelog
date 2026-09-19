-- 가져오기함(API 수집) 기능 제거에 따른 정리
-- 순서 중요: FK 제약 -> 컬럼 -> 테이블

alter table tb_transactions
  drop constraint if exists tb_transactions_api_transaction_id_fkey;

alter table tb_transactions
  drop column if exists api_transaction_id;

alter table tb_transactions
  drop column if exists source_type;

drop table if exists tb_api_transactions;
