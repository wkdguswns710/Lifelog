-- 할 일 구분(purpose)에 자기계발/취미 외 "생활"을 추가한다.

alter table tb_todos drop constraint if exists tb_todos_purpose_check;

alter table tb_todos
  add constraint tb_todos_purpose_check check (purpose in ('need', 'want', 'life'));
