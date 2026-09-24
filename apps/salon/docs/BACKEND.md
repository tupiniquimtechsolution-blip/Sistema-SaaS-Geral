# Backend — Vanessa Braz

## Fonte de verdade

- Schema e RLS: `supabase/migrations/`
- Booking authority: `public.create_appointment` (price from `services.price_cents`)
- Double booking: `EXCLUDE USING gist` + trigger + row lock
- Auth: Supabase Auth. Passwords never stored by this application.
- Payments: webhook is authority (`supabase/functions/payments-webhook`)

## Bootstrap admin

After the first user signs up:

```sql
update public.profiles
   set role = 'admin'
 where email = 'EMAIL_REAL_DA_VANESSA';
```

There is no demo admin password.

## Apply migrations

```bash
supabase db push
# or
supabase migration up
```

Required env on the frontend:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Never set `VITE_SUPABASE_SERVICE_ROLE_KEY`.

## Demo vs produção

- Migrations em `supabase/migrations/` não carregam preços, horários ou contatos inventados.
- Preview local: `supabase/seed/demo.sql` + `VITE_DEMO_CATALOG=true`.
- Sem isso, o catálogo público permanece vazio / PENDENTE_DE_CONFIRMACAO.

## Live Supabase

Login, booking confirmation and admin writes require a configured project.
