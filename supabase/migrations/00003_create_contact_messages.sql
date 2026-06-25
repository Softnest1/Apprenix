
create table if not exists contact_messages (
  id          uuid primary key default gen_random_uuid(),
  nom         text not null check (char_length(trim(nom)) >= 2),
  email       text not null check (email ~* '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'),
  objet       text not null,
  message     text not null check (char_length(trim(message)) >= 10),
  ip_hash     text,
  created_at  timestamptz not null default now()
);

alter table contact_messages enable row level security;

-- Tout le monde peut soumettre un message (anon + authentifié)
create policy "contact_insert_anon"
  on contact_messages for insert
  to anon, authenticated
  with check (true);

-- Personne ne peut lire les messages côté client (admin only via service_role)
create policy "contact_select_none"
  on contact_messages for select
  to anon, authenticated
  using (false);

-- Pas d'update/delete côté client
create policy "contact_no_update"
  on contact_messages for update
  to anon, authenticated
  using (false);

create policy "contact_no_delete"
  on contact_messages for delete
  to anon, authenticated
  using (false);
