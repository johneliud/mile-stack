create table freelancer_profiles (
  wallet_address text primary key,
  name text,
  bio text,
  skills text[] default '{}',
  github_url text,
  portfolio_url text,
  updated_at timestamptz default now()
);

alter table freelancer_profiles enable row level security;

create policy "anon_select" on freelancer_profiles for select to anon using (true);
create policy "anon_insert" on freelancer_profiles for insert to anon with check (true);
create policy "anon_upsert" on freelancer_profiles for update to anon using (true) with check (true);
