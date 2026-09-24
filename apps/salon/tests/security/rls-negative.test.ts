import { describe, expect, it } from 'vitest';
import { canAccessAdmin, canChangeRole, canInsertAppointmentDirect, canSelect } from '../helpers/rls';

const customerA = { id: 'user-a', role: 'customer' as const };
const customerB = { id: 'user-b', role: 'customer' as const };
const admin = { id: 'admin-1', role: 'admin' as const };
const anon = { id: null, role: 'anon' as const };

describe('RLS negative tests', () => {
  it('anonymous cannot read appointments', () => {
    expect(
      canSelect('appointments', { customer_id: 'user-a' }, anon),
    ).toBe(false);
  });

  it('customer A cannot read customer B appointments, payments or consents', () => {
    expect(canSelect('appointments', { customer_id: 'user-b' }, customerA)).toBe(false);
    expect(canSelect('payments', { customer_id: 'user-b' }, customerA)).toBe(false);
    expect(canSelect('consents', { user_id: 'user-b' }, customerA)).toBe(false);
    expect(canSelect('appointments', { customer_id: 'user-a' }, customerA)).toBe(true);
  });

  it('customers cannot insert appointments directly (must use RPC)', () => {
    expect(canInsertAppointmentDirect(customerA, { price_cents: 1 })).toBe(false);
    expect(canInsertAppointmentDirect(admin, { price_cents: 1 })).toBe(false);
  });

  it('customers cannot self-promote to admin', () => {
    expect(canChangeRole(customerA, 'customer', 'admin')).toBe(false);
    expect(canChangeRole(admin, 'customer', 'admin')).toBe(true);
  });

  it('admin-only tables stay denied for customers', () => {
    expect(canSelect('audit_logs', { actor_id: 'user-a' }, customerA)).toBe(false);
    expect(canSelect('customer_notes', { customer_id: 'user-a' }, customerA)).toBe(false);
    expect(canSelect('payment_events', { provider: 'demo' }, customerA)).toBe(false);
    expect(canSelect('audit_logs', {}, admin)).toBe(true);
  });

  it('admin UI requires real admin role, not a demo flag', () => {
    expect(canAccessAdmin(customerA)).toBe(false);
    expect(canAccessAdmin(customerB)).toBe(false);
    expect(canAccessAdmin(anon)).toBe(false);
    expect(canAccessAdmin(admin)).toBe(true);
  });
});
