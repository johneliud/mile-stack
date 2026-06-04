create table if not exists project_metadata (
  on_chain_project_id bigint primary key,
  name text not null,
  client_address text not null,
  created_at timestamptz default now()
);

create policy "anon_select" on project_metadata for select to anon using (true);
create policy "anon_insert" on project_metadata for insert to anon with check (true);
create policy "anon_update" on project_metadata for update to anon using (true) with check (true);
