export type UserRole = 'customer' | 'professional' | 'admin';
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
export type PaymentStatus = 'pending' | 'authorized' | 'paid' | 'failed' | 'refunded' | 'cancelled';
export type ConsentKind = 'operational' | 'marketing' | 'image_use';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface ServiceRow {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  duration_minutes: number;
  price_cents: number;
  active: boolean;
  sort_order: number;
}

export interface ProfessionalRow {
  id: string;
  profile_id: string | null;
  display_name: string;
  bio: string;
  active: boolean;
  sort_order: number;
}

export interface AppointmentRow {
  id: string;
  customer_id: string;
  professional_id: string;
  service_id: string;
  starts_at: string;
  ends_at: string;
  status: AppointmentStatus;
  price_cents: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentRow {
  id: string;
  appointment_id: string;
  provider: string;
  provider_ref: string | null;
  status: PaymentStatus;
  amount_cents: number;
  currency: string;
  checkout_url: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ConsentRow {
  id: string;
  user_id: string;
  kind: ConsentKind;
  granted: boolean;
  policy_version: string;
  source: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile> & { id: string; email: string }; Update: Partial<Profile> };
      appointments: { Row: AppointmentRow; Insert: Partial<AppointmentRow>; Update: Partial<AppointmentRow> };
      payments: { Row: PaymentRow; Insert: Partial<PaymentRow>; Update: Partial<PaymentRow> };
      consents: { Row: ConsentRow; Insert: Partial<ConsentRow>; Update: never };
    };
    Functions: {
      create_appointment: {
        Args: {
          p_service_id: string;
          p_professional_id: string;
          p_starts_at: string;
          p_notes?: string;
          p_operational_consent?: boolean;
          p_marketing_consent?: boolean;
          p_image_consent?: boolean;
        };
        Returns: AppointmentRow;
      };
      cancel_appointment: { Args: { p_appointment_id: string }; Returns: AppointmentRow };
      list_available_slots: {
        Args: { p_professional_id: string; p_service_id: string; p_date: string };
        Returns: { slot_start: string; available: boolean }[];
      };
      record_consents: {
        Args: { p_operational: boolean; p_marketing: boolean; p_image: boolean; p_source?: string };
        Returns: void;
      };
      admin_set_appointment_status: {
        Args: { p_appointment_id: string; p_status: AppointmentStatus; p_reason?: string };
        Returns: AppointmentRow;
      };
    };
  };
}
