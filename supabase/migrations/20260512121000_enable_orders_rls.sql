begin;

alter table public.orders enable row level security;

commit;
