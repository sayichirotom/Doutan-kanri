create extension if not exists pgcrypto;
create table if not exists members(id bigint generated always as identity primary key, display_name text not null, token_hash text not null unique, current_state text, updated_at timestamptz);
create table if not exists status_logs(id bigint generated always as identity primary key, member_id bigint not null references members(id), state text not null check(state in ('出勤','退勤','休暇','出張','外出','帰庁')), recorded_at timestamptz not null default now());
alter table members enable row level security; alter table status_logs enable row level security;
revoke all on members from anon, authenticated; revoke all on status_logs from anon, authenticated;
create or replace function resolve_member_token(p_token text) returns table(display_name text,current_state text) language sql security definer set search_path=public as $$ select m.display_name,m.current_state from members m where m.token_hash=encode(digest(p_token,'sha256'),'hex') limit 1 $$;
create or replace function record_status(p_token text,p_state text) returns timestamptz language plpgsql security definer set search_path=public as $$ declare mid bigint; ts timestamptz:=now(); begin if p_state not in ('出勤','退勤','休暇','出張','外出','帰庁') then raise exception 'invalid state'; end if; select id into mid from members where token_hash=encode(digest(p_token,'sha256'),'hex'); if mid is null then raise exception 'invalid token'; end if; insert into status_logs(member_id,state,recorded_at) values(mid,p_state,ts); update members set current_state=p_state,updated_at=ts where id=mid; return ts; end $$;
grant execute on function resolve_member_token(text) to anon; grant execute on function record_status(text,text) to anon;
-- 登録例: tokenは十分長いランダム値にする
-- insert into members(display_name,token_hash) values ('隊員01', encode(digest('RANDOM_TOKEN_HERE','sha256'),'hex'));
