begin;

alter table public.profiles enable row level security;

create or replace function public.is_profiles_tenant_admin(target_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.tenant_id = target_tenant_id
      and p.role = 'admin'
      and coalesce(p.active, true) = true
      and coalesce(p.status, 'active') = 'active'
  );
$$;

revoke all on function public.is_profiles_tenant_admin(uuid) from public;
grant execute on function public.is_profiles_tenant_admin(uuid) to authenticated;

drop policy if exists profiles_select_self_or_tenant_admin on public.profiles;
drop policy if exists profiles_insert_tenant_admin on public.profiles;
drop policy if exists profiles_update_tenant_admin on public.profiles;
drop policy if exists profiles_delete_tenant_admin on public.profiles;

create policy profiles_select_self_or_tenant_admin
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
  or public.is_profiles_tenant_admin(tenant_id)
);

create policy profiles_insert_tenant_admin
on public.profiles
for insert
to authenticated
with check (
  public.is_profiles_tenant_admin(tenant_id)
);

create policy profiles_update_tenant_admin
on public.profiles
for update
to authenticated
using (
  public.is_profiles_tenant_admin(tenant_id)
)
with check (
  public.is_profiles_tenant_admin(tenant_id)
);

create policy profiles_delete_tenant_admin
on public.profiles
for delete
to authenticated
using (
  public.is_profiles_tenant_admin(tenant_id)
);

commit;
