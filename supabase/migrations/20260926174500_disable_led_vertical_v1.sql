-- Owner decision: LED is outside the active release scope.
update public.vertical_registry
set is_enabled = false, updated_at = now()
where id = 'led' and is_enabled = true;
