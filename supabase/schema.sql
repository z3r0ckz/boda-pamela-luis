-- =====================================================================
--  Boda Pamela & Luis - Base de datos en Supabase
--  Cómo usarlo: Supabase -> SQL Editor -> New query -> pega todo -> Run.
--  Al final, cambia el correo en la última línea por el tuyo.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
--  Tabla principal: una fila por familia / invitación
-- ---------------------------------------------------------------------
create table if not exists public.invitaciones (
  id                  uuid primary key default gen_random_uuid(),
  slug                text not null unique check (slug ~ '^[a-z0-9-]{3,80}$'),
  nombre              text not null check (char_length(nombre) between 1 and 120),
  boletos             int  not null check (boletos between 1 and 30),
  telefono            text,
  notas               text,
  estado              text not null default 'pendiente'
                      check (estado in ('pendiente', 'asiste', 'no_asiste')),
  boletos_confirmados int  not null default 0,
  mensaje             text check (mensaje is null or char_length(mensaje) <= 1000),
  respondido_at       timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint boletos_confirmados_validos check (boletos_confirmados between 0 and boletos)
);

-- Correos con permiso para entrar al panel
create table if not exists public.admins (
  email text primary key
);

-- updated_at automático
create or replace function public.tocar_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists invitaciones_updated_at on public.invitaciones;
create trigger invitaciones_updated_at
  before update on public.invitaciones
  for each row execute function public.tocar_updated_at();

-- ---------------------------------------------------------------------
--  Seguridad (Row Level Security)
--  Los invitados NO pueden leer la tabla directamente: solo pueden
--  consultar y responder SU invitación a través de las funciones de abajo.
-- ---------------------------------------------------------------------
alter table public.invitaciones enable row level security;
alter table public.admins       enable row level security;

create or replace function public.es_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

drop policy if exists "admins gestionan invitaciones" on public.invitaciones;
create policy "admins gestionan invitaciones" on public.invitaciones
  for all to authenticated
  using (public.es_admin())
  with check (public.es_admin());

drop policy if exists "admin ve su registro" on public.admins;
create policy "admin ve su registro" on public.admins
  for select to authenticated
  using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

-- ---------------------------------------------------------------------
--  Funciones públicas para la invitación
-- ---------------------------------------------------------------------
create or replace function public.obtener_invitacion(p_slug text)
returns table (nombre text, boletos int, estado text, boletos_confirmados int, mensaje text, respondido_at timestamptz)
language sql stable security definer
set search_path = public
as $$
  select i.nombre, i.boletos, i.estado, i.boletos_confirmados, i.mensaje, i.respondido_at
  from public.invitaciones i
  where i.slug = lower(trim(p_slug));
$$;

create or replace function public.responder_invitacion(
  p_slug text, p_asiste boolean, p_boletos int, p_mensaje text
)
returns table (nombre text, boletos int, estado text, boletos_confirmados int, mensaje text, respondido_at timestamptz)
language plpgsql volatile security definer
set search_path = public
as $$
declare
  v_inv public.invitaciones%rowtype;
begin
  select * into v_inv from public.invitaciones i where i.slug = lower(trim(p_slug)) for update;
  if not found then
    raise exception 'invitacion no encontrada' using errcode = 'P0002';
  end if;

  if p_asiste and (p_boletos is null or p_boletos < 1 or p_boletos > v_inv.boletos) then
    raise exception 'numero de boletos invalido' using errcode = '22023';
  end if;

  update public.invitaciones i set
    estado              = case when p_asiste then 'asiste' else 'no_asiste' end,
    boletos_confirmados = case when p_asiste then p_boletos else 0 end,
    mensaje             = nullif(left(trim(coalesce(p_mensaje, '')), 1000), ''),
    respondido_at       = now()
  where i.id = v_inv.id;

  return query
    select i.nombre, i.boletos, i.estado, i.boletos_confirmados, i.mensaje, i.respondido_at
    from public.invitaciones i where i.id = v_inv.id;
end $$;

revoke all on function public.obtener_invitacion(text) from public;
revoke all on function public.responder_invitacion(text, boolean, int, text) from public;
grant execute on function public.obtener_invitacion(text) to anon, authenticated;
grant execute on function public.responder_invitacion(text, boolean, int, text) to anon, authenticated;

-- ---------------------------------------------------------------------
--  Tiempo real para el panel
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'invitaciones'
  ) then
    alter publication supabase_realtime add table public.invitaciones;
  end if;
end $$;

-- ---------------------------------------------------------------------
--  ¡IMPORTANTE! Cambia este correo por el que usarás para entrar al panel.
--  Puedes agregar más de uno (por ejemplo, el de Pamela y el de Luis).
-- ---------------------------------------------------------------------
insert into public.admins (email) values ('TU_CORREO@ejemplo.com')
on conflict do nothing;
