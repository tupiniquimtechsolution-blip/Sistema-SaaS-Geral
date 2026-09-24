import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  applyMigrations,
  connect,
  postgresUrl,
  resetPostgresTestSchemas,
  type RlsIdentity,
  withRlsIdentity,
} from './harness';

const enabled = Boolean(postgresUrl());

if (process.env.CI && !enabled) {
  throw new Error('DATABASE_URL is required in CI for real RLS tests.');
}

describe.skipIf(!enabled)('real postgres migrations + RLS', () => {
  it('enforces RLS, booking constraints, and atomic payment-event idempotency', async () => {
    const sql = connect();
    try {
      await resetPostgresTestSchemas(sql);
      await applyMigrations(sql);

      const settingsCount = await sql`select count(*)::int as n from public.business_settings`;
      expect(settingsCount[0].n).toBe(1);
      await expect(
        sql`insert into public.business_settings (name) values ('outra linha')`,
      ).rejects.toThrow();

      const hours = await sql`select count(*)::int as n from public.business_hours where professional_id is null`;
      expect(Number(hours[0].n)).toBe(0);
      await sql`insert into public.business_hours (professional_id, weekday, open_time, close_time) values (null, 1, '09:00', '18:00')`;
      await expect(
        sql`insert into public.business_hours (professional_id, weekday, open_time, close_time) values (null, 1, '10:00', '19:00')`,
      ).rejects.toThrow();

      const userA = randomUUID();
      const userB = randomUUID();
      const adminUser = randomUUID();
      const anon: RlsIdentity = { role: 'anon', subject: null };
      const customerA: RlsIdentity = { role: 'authenticated', subject: userA };
      const customerB: RlsIdentity = { role: 'authenticated', subject: userB };
      const admin: RlsIdentity = { role: 'authenticated', subject: adminUser };

      await sql`insert into auth.users (id, email, raw_user_meta_data) values (${userA}::uuid, 'a@example.com', '{"full_name":"A","phone":"11"}'::jsonb)`;
      await sql`insert into auth.users (id, email, raw_user_meta_data) values (${userB}::uuid, 'b@example.com', '{"full_name":"B","phone":"22"}'::jsonb)`;
      await sql`insert into auth.users (id, email, raw_user_meta_data) values (${adminUser}::uuid, 'admin@example.com', '{"full_name":"Admin","phone":"33"}'::jsonb)`;

      // Fixture provisioning is privileged; clients cannot promote themselves.
      await sql`alter table public.profiles disable trigger profiles_protect_role`;
      try {
        await sql`update public.profiles set role = 'admin' where id = ${adminUser}::uuid`;
      } finally {
        await sql`alter table public.profiles enable trigger profiles_protect_role`;
      }

      const adminProfile = await sql`select role::text as role from public.profiles where id = ${adminUser}::uuid`;
      expect(adminProfile[0].role).toBe('admin');

      const categoryId = '22222222-0000-4000-8000-000000000099';
      const serviceId = '33333333-0000-4000-8000-000000000099';
      const professionalId = '11111111-1111-4111-8111-111111111111';
      await sql`insert into public.service_categories (id, name, slug) values (${categoryId}::uuid, 'Teste', 'teste-rls')`;
      await sql`insert into public.services (id, category_id, name, slug, duration_minutes, price_cents) values (${serviceId}::uuid, ${categoryId}::uuid, 'Serviço teste', 'servico-teste', 60, 1000)`;
      await sql`insert into public.professional_services (professional_id, service_id) values (${professionalId}::uuid, ${serviceId}::uuid)`;
      await sql`insert into public.business_hours (professional_id, weekday, open_time, close_time) values (null, 2, '09:00', '19:00')`;

      const created = await withRlsIdentity(
        sql,
        customerA,
        async (tx) => tx`select * from public.create_appointment(${serviceId}::uuid, ${professionalId}::uuid, '2026-09-22 14:00:00+00'::timestamptz, '', true, false, false)`,
        { commit: true },
      );
      expect(created[0].price_cents).toBe(1000);
      const appointmentId = created[0].id as string;

      await withRlsIdentity(sql, anon, async (tx) => {
        const context = await tx`
          select current_user as role,
                 nullif(current_setting('request.jwt.claim.sub', true), '') as subject
        `;
        expect(context[0]).toMatchObject({ role: 'anon', subject: null });

        const asAnon = await tx`select id from public.appointments where id = ${appointmentId}::uuid`;
        expect(asAnon).toHaveLength(0);
      });

      await withRlsIdentity(sql, customerA, async (tx) => {
        const context = await tx`
          select current_user as role,
                 nullif(current_setting('request.jwt.claim.sub', true), '') as subject
        `;
        expect(context[0]).toMatchObject({ role: 'authenticated', subject: userA });

        const asA = await tx`select id from public.appointments where id = ${appointmentId}::uuid`;
        expect(asA).toHaveLength(1);
      });

      await withRlsIdentity(sql, customerB, async (tx) => {
        const context = await tx`
          select current_user as role,
                 nullif(current_setting('request.jwt.claim.sub', true), '') as subject
        `;
        expect(context[0]).toMatchObject({ role: 'authenticated', subject: userB });

        const asB = await tx`select id from public.appointments where id = ${appointmentId}::uuid`;
        expect(asB).toHaveLength(0);
      });

      await withRlsIdentity(sql, admin, async (tx) => {
        const context = await tx`
          select current_user as role,
                 nullif(current_setting('request.jwt.claim.sub', true), '') as subject
        `;
        expect(context[0]).toMatchObject({ role: 'authenticated', subject: adminUser });

        const asAdmin = await tx`select id from public.appointments where id = ${appointmentId}::uuid`;
        expect(asAdmin).toHaveLength(1);
      });

      const cleanContext = await sql`
        select current_user = session_user as role_restored,
               nullif(current_setting('request.jwt.claim.sub', true), '') is null as subject_cleared
      `;
      expect(cleanContext[0].role_restored).toBe(true);
      expect(cleanContext[0].subject_cleared).toBe(true);

      await withRlsIdentity(sql, customerA, async (tx) => {
        await expect(
          tx`select * from public.create_appointment(${serviceId}::uuid, ${professionalId}::uuid, '2026-09-22 14:30:00+00'::timestamptz, '', true, false, false)`,
        ).rejects.toThrow(/double_booking|23P01|exclusion/i);
      });

      const firstPay = await sql`select public.apply_payment_event('demo', 'evt-1', 'payment.updated', 'pay-1', ${appointmentId}::uuid, 'paid', 1000, '{}'::jsonb) as result`;
      expect((firstPay[0].result as { duplicate: boolean }).duplicate).toBe(false);
      const secondPay = await sql`select public.apply_payment_event('demo', 'evt-1', 'payment.updated', 'pay-1', ${appointmentId}::uuid, 'paid', 1000, '{}'::jsonb) as result`;
      expect((secondPay[0].result as { duplicate: boolean }).duplicate).toBe(true);

      // Hold the winning INSERT open so both independent PostgreSQL sessions
      // contend for the same provider/event acquisition.
      await sql.unsafe(`
        create or replace function public.test_hold_payment_event_insert()
        returns trigger
        language plpgsql
        as $$
        begin
          if new.provider = 'demo' and new.provider_event_id = 'evt-concurrent-1' then
            perform pg_sleep(0.25);
          end if;
          return new;
        end;
        $$;
      `);
      await sql`create trigger test_hold_payment_event_insert after insert on public.payment_events for each row execute function public.test_hold_payment_event_insert()`;

      const workerOne = connect();
      const workerTwo = connect();
      try {
        const [firstConcurrent, secondConcurrent] = await Promise.all([
          workerOne`select public.apply_payment_event('demo', 'evt-concurrent-1', 'payment.updated', 'pay-concurrent-1', ${appointmentId}::uuid, 'paid', 1000, '{}'::jsonb) as result`,
          workerTwo`select public.apply_payment_event('demo', 'evt-concurrent-1', 'payment.updated', 'pay-concurrent-1', ${appointmentId}::uuid, 'paid', 1000, '{}'::jsonb) as result`,
        ]);
        const concurrentResults = [
          firstConcurrent[0].result as { duplicate: boolean },
          secondConcurrent[0].result as { duplicate: boolean },
        ];
        expect(concurrentResults.filter((result) => result.duplicate === false)).toHaveLength(1);
        expect(concurrentResults.filter((result) => result.duplicate === true)).toHaveLength(1);

        const concurrentEvents = await sql`
          select count(*)::int as n
          from public.payment_events
          where provider = 'demo' and provider_event_id = 'evt-concurrent-1'
        `;
        expect(concurrentEvents[0].n).toBe(1);

        const concurrentPayments = await sql`
          select count(*)::int as n
          from public.payments
          where provider = 'demo' and provider_ref = 'pay-concurrent-1'
        `;
        expect(concurrentPayments[0].n).toBe(1);

        const concurrentApplications = await sql`
          select count(*)::int as n
          from public.audit_logs
          where action = 'payment.apply'
            and metadata->>'event_id' = 'evt-concurrent-1'
        `;
        expect(concurrentApplications[0].n).toBe(1);
      } finally {
        await workerOne.end({ timeout: 1 });
        await workerTwo.end({ timeout: 1 });
        await sql`drop trigger if exists test_hold_payment_event_insert on public.payment_events`;
        await sql`drop function if exists public.test_hold_payment_event_insert()`;
      }

      await expect(
        sql`select public.apply_payment_event('demo', 'evt-2', 'payment.updated', 'pay-2', ${appointmentId}::uuid, 'paid', 1, '{}'::jsonb)`,
      ).rejects.toThrow(/price_mismatch/);
    } finally {
      await sql.end({ timeout: 1 });
    }
  });
});
