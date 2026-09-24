-- Salon booking RPC ACL hardening.
-- Keep public slot discovery callable by anon/authenticated, customer booking authenticated-only,
-- and the trigger helper internal to privileged database roles.

revoke all on function public.record_booking_status_history() from public, anon, authenticated;

revoke all on function public.list_available_booking_slots(uuid, uuid, uuid, uuid, date)
  from public, anon, authenticated;
grant execute on function public.list_available_booking_slots(uuid, uuid, uuid, uuid, date)
  to anon, authenticated;

revoke all on function public.create_customer_booking(
  uuid, uuid, uuid, uuid, timestamptz, text, text, text, text, boolean, boolean, boolean
) from public, anon, authenticated;
grant execute on function public.create_customer_booking(
  uuid, uuid, uuid, uuid, timestamptz, text, text, text, text, boolean, boolean, boolean
) to authenticated;
