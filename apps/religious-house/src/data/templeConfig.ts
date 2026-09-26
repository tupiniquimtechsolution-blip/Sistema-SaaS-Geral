import { addDays, format, getDay, startOfDay } from "date-fns";
import type {
  BookingAvailabilityRule,
  BookingDateOverride,
  GiraEvent,
  ServiceDef,
} from "../types";
import { driveUrl } from "./media";

/** próximo sábado (inclui hoje, se for sábado) — base da gira confirmada */
const base = startOfDay(new Date());
const NEXT_SATURDAY_ISO = format(
  addDays(base, (6 - getDay(base) + 7) % 7),
  "yyyy-MM-dd"
);

/**
 * Fonte única de dados do templo.
 *
 * COMO ATUALIZAR (para o templo):
 * · Nova gira confirmada → adicionar objeto em `giras` com date, title, entity
 *   (slug de entityVisuals), startTime, description e confirmed: true.
 * · Consultas de Maria Mulambo → NÃO cadastrar quarta por quarta: a regra
 *   semanal `mariaMulamboWeeklyRule` já libera todas as quartas futuras.
 *   Preencher `slots` quando o templo definir os horários reais, ou usar
 *   `bookingDateOverrides` para exceções/bloqueios pontuais.
 * · Bloquear uma data → incluir o ISO (YYYY-MM-DD) em `blockedDates`.
 */
export const templeConfig = {
  name: "Templo de Umbanda Caboclo Tupinambá e Caboclo Flecha Dourada",
  shortName: "Caboclo Tupinambá & Flecha Dourada",
  phone: "5511975965824",
  phoneDisplay: "(11) 97596-5824",
  instagram: "https://www.instagram.com/caboclotupinamba_flechadourada/",
  googleProfile: "https://share.google/U0lMswLgGE9KDkU1M",
  streetView:
    "https://www.google.com/local/place/fid/0x94ce67deb2d1cad3:0x35ee6c10a1bb4093/photosphere",
  mapsQuery:
    "Av. Osvaldo Pucci, 883 - Jardim Nossa Senhora do Carmo, São Paulo - SP, 08270-700",
  /** logo OFICIAL redondo do templo (usar apenas a parte circular) */
  logo: driveUrl("1Mgk8mSQ18BlgQSuMiBadwmIGzAT-am2T"),
  /** Manual para Novos Filhos (PDF) — jornada e dirigentes nas páginas 4–5 */
  manualNovosFilhos:
    "https://drive.google.com/file/d/1c1yJb754sNlAfc5vM3_FYK0s39DwzYRE/view?usp=drive_web",
  /** pasta oficial com toda a mídia da casa */
  mediaFolder:
    "https://drive.google.com/drive/folders/1omygp4Toy5jhgew2bcGMXCdiDqUx06JB",

  /**
   * Feature flag REVERSÍVEL (Documento Central de Correções, §4):
   * a seção "As linhas que trabalham na casa" (Quem Somos) está congelada.
   * Voltar para `true` para reexibi-la — o componente segue intacto no projeto.
   */
  showLineage: false,

  /**
   * Jornada e dirigentes da casa — texto oficial das páginas 4–5 do
   * "Manual para Novos Filhos".
   */
  fundadaEm: 2019,
  jornada:
    "Nossa Casa de Umbanda, fundada em 2019, é um espaço sagrado de conexão espiritual e conhecimento. Enraizada na tradição candomblecista, nossa comunidade é guiada por nossos Guias-Chefes Tupinambá e Flecha Dourada.",
  jornadaMissao:
    "Nossa missão: cultivar a espiritualidade, promover a união e o respeito, oferecendo refúgio para todos que buscam conexão com as raízes ancestrais.",
  dirigentes: [
    {
      name: "Pai Vinicius d' Iemanjá",
      initials: "PV",
      note: "Nascido e criado na religião",
      accent: "var(--color-teal)",
    },
    {
      name: "Pai Moisés d' Ogum",
      initials: "PM",
      note: "Nascido e criado na religião",
      accent: "var(--color-forest-800)",
    },
  ] as { name: string; initials: string; note: string; accent: string }[],
  dirigentesTexto:
    "Ambos iniciados no culto de candomblé, seguem com suas raízes firmes ao sagrado, sendo dirigentes espirituais com grandes conhecimentos filosóficos e religiosos, além de muita fé ao sagrado e acima de tudo honestidade.",

  address: {
    street: "Av. Osvaldo Pucci, 883",
    district: "Jardim Nossa Senhora do Carmo",
    city: "São Paulo",
    state: "SP",
    zip: "08270-700",
  },

  /**
   * Regra recorrente: TODA quarta-feira futura é dia de consulta com Maria
   * Mulambo, salvo bloqueio/override. Os horários reais (`slots`) devem ser
   * preenchidos pelo templo — até lá o site informa "horários a confirmar".
   */
  mariaMulamboWeeklyRule: {
    weekday: 3,
    entity: "maria-mulambo",
    marker: "purple",
    slots: [] as string[],
    window: "18h–22h",
  },

  /** demais dias/serviços com horários — sem inventar horários */
  bookingAvailability: [] as BookingAvailabilityRule[],
  /** abre, fecha ou altera slots por data específica */
  bookingDateOverrides: [] as BookingDateOverride[],

  /** somente giras CONFIRMADAS entram aqui */
  giras: [
    {
      id: "gira-exu-pombagira",
      date: NEXT_SATURDAY_ISO,
      title: "Gira de Exu e Pombagira",
      type: "gira" as const,
      entity: "exu",
      confirmed: true,
    },
  ] as GiraEvent[],

  /** datas ISO bloqueadas para agendamento */
  blockedDates: [] as string[],

  services: [
    {
      // Tipo = Consulta (genérico). A entidade responsável vem do evento
      // associado — ex.: quartas-feiras = Maria Mulambo — nunca fixa aqui.
      id: "mariaMulambo",
      title: "Consulta",
      schedule: "Quartas · 18h–22h",
      description:
        "Atendimento individual de orientação e acolhimento, com hora marcada e todo o cuidado que a sua caminhada merece.",
    },
    {
      id: "jogoDeBuzios",
      title: "Jogo de Búzios",
      schedule: "Mediante agendamento",
      description:
        "Leitura e orientação através dos búzios, conduzida com seriedade, respeito e sigilo.",
    },
    {
      id: "trabalhoEspiritual",
      title: "Trabalhos espirituais",
      schedule: "Mediante conversa e agendamento",
      description:
        "Obras e trabalhos de caridade espiritual, sempre mediante conversa prévia com a casa.",
    },
    {
      id: "orientacao",
      title: "Orientação",
      schedule: "Solicitação de atendimento",
      description:
        "Um primeiro acolhimento para quem busca ajuda espiritual e não sabe por onde começar.",
    },
  ] as ServiceDef[],

  /** somente depoimentos reais — nunca inventar outros */
  testimonials: [
    "Casa linda, cheia de energia e com muito axé ■",
    "Ótimos pais de santos e entidades incríveis",
    "Local adequado para pessoas que buscam ajuda espiritual!!!",
  ],
};

export const MARIA_MULAMBO_HOURS = templeConfig.mariaMulamboWeeklyRule.window;

export const fullAddress = `${templeConfig.address.street} — ${templeConfig.address.district}, ${templeConfig.address.city}/${templeConfig.address.state} · CEP ${templeConfig.address.zip}`;

export const mapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  templeConfig.mapsQuery
)}`;

export const mapsEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(
  templeConfig.mapsQuery
)}&output=embed`;
