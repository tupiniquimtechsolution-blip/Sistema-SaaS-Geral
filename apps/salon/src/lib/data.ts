export const PENDING = 'PENDENTE_DE_CONFIRMACAO';

export interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  image?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface Booking {
  id: string;
  serviceId: string;
  serviceName: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  price: number;
  clientName: string;
  clientPhone: string;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
}

export function isPendingValue(value: string | undefined | null): boolean {
  if (!value) return true;
  return /PENDENTE/i.test(value);
}

export function isWhatsAppConfigured(value: string | undefined | null): boolean {
  if (!value || isPendingValue(value)) return false;
  const digits = value.replace(/\D/g, '');
  if (digits.length < 10) return false;
  if (/^55?119{4,}/.test(digits)) return false;
  return true;
}

export function isPublicHandleConfigured(value: string | undefined | null): boolean {
  if (!value || isPendingValue(value)) return false;
  return !/^@?vanessabraz\.beleza$/i.test(value);
}

export const services: Service[] = [];
export const categories: string[] = [];
export const testimonials: Array<{ id: string; name: string; text: string; rating: number; service: string }> = [];

export const businessHours = null;

// Dados confirmados pelo owner em 22/09/2026. Campos não confirmados permanecem PENDING.
export const businessInfo = {
  name: 'Vanessa Braz',
  tagline: 'Beleza & Autoestima',
  description: PENDING,
  phone: '(11) 98814-9152',
  whatsapp: '5511988149152',
  email: PENDING,
  instagram: '@vanessabraz_belezaeautoestima',
  instagramUrl: 'https://www.instagram.com/vanessabraz_belezaeautoestima/',
  address: 'Rua Redenção 88',
  city: PENDING,
  state: PENDING,
};

export const businessMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(businessInfo.address)}`;
export const businessPhoneUrl = `tel:+${businessInfo.whatsapp}`;

export const faqItems = [
  {
    question: 'Como faço para agendar um horário?',
    answer: 'Use a página Agendar. O horário só é reservado depois do login e da confirmação no servidor.',
  },
  {
    question: 'Preciso criar uma conta?',
    answer: 'Sim. A confirmação do agendamento usa autenticação real e não grava senha neste aplicativo.',
  },
  {
    question: 'Como meus dados são tratados?',
    answer: 'Consentimentos operacional, de marketing e de uso de imagem são registrados em separado, com versão da política e data. Veja a Política de Privacidade.',
  },
];
