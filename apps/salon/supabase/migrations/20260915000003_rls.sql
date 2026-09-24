-- Default-deny RLS. Service role bypasses RLS by design and must never ship to the browser.

alter table public.profiles enable row level security;
alter table public.business_settings enable row level security;
alter table public.professionals enable row level security;
alter table public.service_categories enable row level security;
alter table public.services enable row level security;
alter table public.professional_services enable row level security;
alter table public.business_hours enable row level security;
alter table public.availability enable row level security;
alter table public.blocked_periods enable row level security;
alter table public.appointments enable row level security;
alter table public.appointment_status_history enable row level security;
alter table public.payments enable row level security;
alter table public.payment_events enable row level security;
alter table public.customer_notes enable row level security;
alter table public.media_assets enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;
alter table public.consents enable row level security;

-- Force RLS even for table owners in hosted projects that honor it.
alter table public.profiles force row level security;
alter table public.business_settings force row level security;
alter table public.professionals force row level security;
alter table public.service_categories force row level security;
alter table public.services force row level security;
alter table public.professional_services force row level security;
alter table public.business_hours force row level security;
alter table public.availability force row level security;
alter table public.blocked_periods force row level security;
alter table public.appointments force row level security;
alter table public.appointment_status_history force row level security;
alter table public.payments force row level security;
alter table public.payment_events force row level security;
alter table public.customer_notes force row level security;
alter table public.media_assets force row level security;
alter table public.notifications force row level security;
alter table public.audit_logs force row level security;
alter table public.consents force row level security;

-- profiles
create policy profiles_select_own_or_admin
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

create policy profiles_update_own
  on public.profiles for update
  to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- No insert/delete policies for clients. Signup trigger (definer) inserts.

-- public catalog
create policy business_settings_public_read
  on public.business_settings for select
  to anon, authenticated
  using (true);

create policy business_settings_admin_write
  on public.business_settings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy professionals_public_read
  on public.professionals for select
  to anon, authenticated
  using (active or public.is_admin());

create policy professionals_admin_write
  on public.professionals for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy service_categories_public_read
  on public.service_categories for select
  to anon, authenticated
  using (active or public.is_admin());

create policy service_categories_admin_write
  on public.service_categories for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy services_public_read
  on public.services for select
  to anon, authenticated
  using (active or public.is_admin());

create policy services_admin_write
  on public.services for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy professional_services_public_read
  on public.professional_services for select
  to anon, authenticated
  using (true);

create policy professional_services_admin_write
  on public.professional_services for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy business_hours_public_read
  on public.business_hours for select
  to anon, authenticated
  using (true);

create policy business_hours_admin_write
  on public.business_hours for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy availability_public_read
  on public.availability for select
  to anon, authenticated
  using (true);

create policy availability_admin_write
  on public.availability for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy blocked_periods_staff_read
  on public.blocked_periods for select
  to authenticated
  using (public.is_staff());

create policy blocked_periods_admin_write
  on public.blocked_periods for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- appointments: owner or admin. Inserts go through create_appointment().
create policy appointments_select_own_or_admin
  on public.appointments for select
  to authenticated
  using (customer_id = auth.uid() or public.is_admin());

create policy appointments_admin_update
  on public.appointments for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy appointment_history_select_own_or_admin
  on public.appointment_status_history for select
  to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.appointments a
      where a.id = appointment_id and a.customer_id = auth.uid()
    )
  );

-- payments
create policy payments_select_own_or_admin
  on public.payments for select
  to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.appointments a
      where a.id = appointment_id and a.customer_id = auth.uid()
    )
  );

-- Webhook (service role) writes payment_events. Clients cannot.
create policy payment_events_admin_read
  on public.payment_events for select
  to authenticated
  using (public.is_admin());

-- customer notes: admin only
create policy customer_notes_admin_all
  on public.customer_notes for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- media catalog is public (paths only, originals stay in media/source)
create policy media_assets_public_read
  on public.media_assets for select
  to anon, authenticated
  using (true);

create policy media_assets_admin_write
  on public.media_assets for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- notifications
create policy notifications_select_own
  on public.notifications for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy notifications_update_own
  on public.notifications for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- audit logs: admin read, no client writes
create policy audit_logs_admin_read
  on public.audit_logs for select
  to authenticated
  using (public.is_admin());

-- consents: owner can insert/select, never update/delete
create policy consents_select_own
  on public.consents for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy consents_insert_own
  on public.consents for insert
  to authenticated
  with check (user_id = auth.uid());
