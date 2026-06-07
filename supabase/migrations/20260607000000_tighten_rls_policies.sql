alter table listings
  add constraint listings_status_valid
  check (status in ('open', 'filled', 'cancelled'));

drop policy if exists "anon_update" on listings;

create policy "anon_update_open_listings" on listings
  for update to anon
  using (status = 'open')
  with check (status in ('open', 'filled', 'cancelled'));

alter table applications
  add constraint applications_status_valid
  check (status in ('pending', 'accepted', 'rejected'));

drop policy if exists "anon_update" on applications;

create policy "anon_update_pending_applications" on applications
  for update to anon
  using (status = 'pending')
  with check (status in ('pending', 'accepted', 'rejected'));

create unique index if not exists applications_unique_per_listing
  on applications (listing_id, freelancer_address);

alter table project_metadata
  add constraint project_metadata_name_nonempty
  check (length(trim(name)) > 0);

drop policy if exists "anon_update" on project_metadata;

create policy "anon_upsert_project_metadata" on project_metadata
  for update to anon
  using (true)
  with check (length(trim(name)) > 0);
