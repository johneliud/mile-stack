create table if not exists listings (
  id uuid default gen_random_uuid() primary key,
  client_address text not null,
  title text not null,
  description text not null,
  skills text[] default '{}',
  milestones jsonb not null,
  total_xlm numeric not null,
  status text default 'open',
  on_chain_project_id bigint,
  created_at timestamptz default now()
);

create table if not exists applications (
  id uuid default gen_random_uuid() primary key,
  listing_id uuid references listings(id) on delete cascade,
  freelancer_address text not null,
  message text,
  status text default 'pending',
  created_at timestamptz default now()
);

create policy "anon_select" on listings for select to anon using (true);
create policy "anon_insert" on listings for insert to anon with check (true);
create policy "anon_update" on listings for update to anon using (true) with check (true);

create policy "anon_select" on applications for select to anon using (true);
create policy "anon_insert" on applications for insert to anon with check (true);
create policy "anon_update" on applications for update to anon using (true) with check (true);
