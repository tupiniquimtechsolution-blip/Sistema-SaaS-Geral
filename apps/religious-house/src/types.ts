/* ---------- agenda ---------- */
export type EventType = "gira" | "consulta" | "desenvolvimento" | "festa";

export interface GiraEvent {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  title: string;
  type: EventType;
  /** slug de entityVisuals → define a arte oficial exibida no card */
  entity?: string;
  startTime?: string;
  endTime?: string;
  description?: string;
  image?: string;
  confirmed: boolean;
}

export interface AgendaItem {
  /** YYYY-MM-DD */
  date: string;
  weekdayLabel: string;
  title: string;
  time?: string;
  description?: string;
  type: EventType;
  entity?: string;
  confirmed: boolean;
  /** atividade interna — não é exibida como "próximo evento" nem permite agendamento */
  internal?: boolean;
}

/* ---------- agendamento ---------- */
export type ServiceId =
  | "mariaMulambo"
  | "jogoDeBuzios"
  | "trabalhoEspiritual"
  | "orientacao";

export interface ServiceDef {
  id: ServiceId;
  title: string;
  schedule: string;
  description: string;
}

export interface BookingAvailabilityRule {
  serviceId: ServiceId;
  /** 0=domingo … 6=sábado */
  weekdays: number[];
  /** horários configurados pelo templo — nunca inventar */
  slots: string[];
}

export interface BookingDateOverride {
  /** YYYY-MM-DD */
  date: string;
  serviceId?: ServiceId;
  enabled: boolean;
  slots?: string[];
}

export interface BookingPayload {
  serviceId: ServiceId;
  service: string;
  /** YYYY-MM-DD */
  date: string;
  time?: string;
  name: string;
  phone?: string;
  note?: string;
}

export const SERVICE_LABEL: Record<ServiceId, string> = {
  mariaMulambo: "Consulta",
  jogoDeBuzios: "Jogo de Búzios",
  trabalhoEspiritual: "Trabalho espiritual",
  orientacao: "Orientação",
};

/**
 * Rótulo adaptável (Documento Central de Correções, §6): o tipo é "Consulta";
 * somente quando a data escolhida é realmente uma quarta-feira — dia da
 * consulta com Maria Mulambo — o nome da entidade acompanha o rótulo.
 */
export function serviceLabelFor(id: ServiceId, dateIso?: string): string {
  if (id === "mariaMulambo") {
    if (dateIso) {
      const [y, m, d] = dateIso.split("-").map(Number);
      if (new Date(y, m - 1, d).getDay() === 3) return "Consulta com Maria Mulambo";
    }
    return "Consulta";
  }
  return SERVICE_LABEL[id];
}

/* ---------- artes de entidade ---------- */
export interface EntityVisual {
  slug: string;
  name: string;
  label?: string;
  /** URL/ caminho da arte oficial — indefinido até o templo fornecer */
  image?: string;
  /** lado LIVRE da arte onde o texto se acomoda (desktop) */
  textPosition: "left" | "right" | "center";
  focalDesktop: string;
  focalMobile: string;
  tone: "dark" | "light";
  /** véu 0–1 aplicado somente sobre a área de texto */
  overlay: number;
  accent: string;
}

/* ---------- galeria ---------- */
export interface GalleryItem {
  id: string;
  src: string;
  alt: string;
  caption: string;
  category: "momentos" | "videos";
  /** item de vídeo — abre player sob demanda, nunca autoplay */
  kind?: "image" | "video";
  /** URL de player (iframe) para vídeos do Drive */
  videoPreview?: string;
  /** link externo para abrir o vídeo no Drive */
  videoOpen?: string;
}
