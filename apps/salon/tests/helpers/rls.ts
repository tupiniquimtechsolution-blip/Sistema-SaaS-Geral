export type ActorRole = 'anon' | 'customer' | 'admin' | 'professional' | 'service_role';

export interface Actor {
  id: string | null;
  role: ActorRole;
}

export type TableName =
  | 'profiles'
  | 'appointments'
  | 'payments'
  | 'payment_events'
  | 'customer_notes'
  | 'consents'
  | 'audit_logs'
  | 'notifications'
  | 'services'
  | 'professionals';

export function canSelect(table: TableName, row: Record<string, unknown>, actor: Actor): boolean {
  if (actor.role === 'service_role') return true;
  switch (table) {
    case 'profiles':
      return actor.role !== 'anon' && (actor.id === row.id || actor.role === 'admin');
    case 'appointments':
      return actor.role !== 'anon' && (actor.id === row.customer_id || actor.role === 'admin');
    case 'payments':
      return actor.role !== 'anon' && (actor.id === row.customer_id || actor.role === 'admin');
    case 'payment_events':
    case 'customer_notes':
    case 'audit_logs':
      return actor.role === 'admin';
    case 'consents':
    case 'notifications':
      return actor.role !== 'anon' && (actor.id === row.user_id || actor.role === 'admin');
    case 'services':
    case 'professionals':
      return row.active === true || actor.role === 'admin';
    default:
      return false;
  }
}

export function canInsertAppointmentDirect(actor: Actor, _row: Record<string, unknown>): boolean {
  if (actor.role === 'service_role') return true;
  return false;
}

export function canChangeRole(actor: Actor, from: string, to: string): boolean {
  if (from === to) return true;
  return actor.role === 'admin';
}

export function canAccessAdmin(actor: Actor): boolean {
  return actor.role === 'admin';
}
