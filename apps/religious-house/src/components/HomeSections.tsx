import { useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { featured } from "../data/media";
import {
  MARIA_MULAMBO_HOURS,
  mapsDirectionsUrl,
  mapsEmbedUrl,
  templeConfig,
} from "../data/templeConfig";
import {
  formatShort,
  getNextMariaMulamboConsultation,
  getNextSaturdayGira,
  getUpcomingActivities,
  waLink,
  WHATSAPP_URL,
} from "../lib/calendar";
import { useParallax, usePrefersReducedMotion } from "../hooks";
import type { AgendaItem, ServiceId } from "../types";
import { useBooking } from "./BookingModal";
import { EntityArtCard } from "./EntityCard";
import {
  BotanicalDivider,
  GoldArrow,
  GoldStar,
  Leaf,
  LeafSprig,
} from "./Ornaments";
import { EventBadge, Reveal, SectionHeading, TempleButton } from "./ui";

/* ---------- 03 · Nossa Casa ---------- */
export function NossaCasa() {
  const bg = useParallax(0.1);
  const reduced = usePrefersReducedMotion();
  return (
    <section id="nossa-casa" className="relative overflow-hidden py-20 sm:py-28">
      <div
        className="pointer-events-none absolute right-0 top-0 opacity-20"
        style={{ transform: reduced ? undefined : `translateY(${bg * -0.2}px)` }}
        aria-hidden
      >
        <LeafSprig color="var(--color-gold-500)" className="h-72 w-72" flip />
      </div>
      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
        <Reveal className="relative mx-auto w-full max-w-md">
          <div className="absolute -inset-3 rounded-[30px] border border-gold-500/40" aria-hidden />
          <img
            src={featured.ourHousePhoto.src}
            alt="Foto oficial da casa — Templo de Umbanda Caboclo Tupinambá e Flecha Dourada"
            loading="lazy"
            className="relative w-full rounded-[24px] border-[3px] border-cream object-cover shadow-[0_30px_70px_-22px_rgba(23,79,50,0.4)]"
          />
          <div className="absolute -bottom-6 -right-6 hidden rounded-2xl border border-gold-500/40 bg-cream px-5 py-4 shadow-lg sm:block">
            <p className="flex items-center gap-2 font-display text-lg italic text-forest-950">
              <GoldStar size={14} className="text-gold-500" />
              Acolher é nossa missão
            </p>
          </div>
        </Reveal>

        <div>
          <SectionHeading
            align="left"
            eyebrow="Nossa Casa"
            title={
              <>
                Um espaço para acolher, orientar e{" "}
                <em className="text-gold-700">caminhar junto</em>.
              </>
            }
            subtitle="Um lugar de acolhimento a quem precisa de ajuda espiritual, com atendimento aos consulentes e orientação aos mesmos. Axé."
          />
          <div className="mt-8 flex flex-wrap gap-4">
            <TempleButton href="#/quem-somos" variant="primary" arrow>
              Conheça nossa casa
            </TempleButton>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 04 · Próximos Trabalhos — agenda única da casa ---------- */
export function ProximosTrabalhos() {
  const { openBooking } = useBooking();

  // Mesma fonte de dados do calendário: próximos eventos futuros,
  // em ordem cronológica — passados nunca aparecem aqui.
  const items = useMemo(() => {
    const list: AgendaItem[] = [];
    const gira = getNextSaturdayGira();
    const consulta = getNextMariaMulamboConsultation();
    const desenvolvimento = getUpcomingActivities().desenvolvimento;
    if (gira) list.push(gira);
    if (consulta) list.push(consulta);
    if (desenvolvimento) list.push(desenvolvimento);
    return list.sort((a, b) => a.date.localeCompare(b.date));
  }, []);

  const actionsFor = (item: AgendaItem) => {
    if (item.internal) return undefined;
    if (item.type === "consulta") {
      return (
        <>
          <button
            onClick={() => openBooking("mariaMulambo", { date: item.date })}
            className="group inline-flex items-center gap-2.5 rounded-full bg-gold-500 px-6 py-3 font-body text-[12.5px] font-bold text-forest-950 transition-all hover:-translate-y-0.5 hover:bg-gold-300"
          >
            Agendar consulta
            <GoldArrow size={15} className="transition-transform group-hover:translate-x-1" />
          </button>
          <a
            href={waLink("Axé. Gostaria de agendar uma consulta.")}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 font-body text-[12.5px] font-bold text-forest-950 transition-colors hover:text-gold-700"
          >
            Falar pelo WhatsApp <GoldArrow size={13} />
          </a>
        </>
      );
    }
    return (
      <>
        <a
          href={waLink(`Axé. Gostaria de confirmar a gira de ${formatShort(item.date)}.`)}
          target="_blank"
          rel="noreferrer"
          className="group inline-flex items-center gap-2.5 rounded-full bg-forest-950 px-6 py-3 font-body text-[12.5px] font-bold text-cream transition-all hover:-translate-y-0.5 hover:bg-forest-800"
        >
          Confirmar pelo WhatsApp
          <GoldArrow size={15} className="transition-transform group-hover:translate-x-1" />
        </a>
        <TempleButton href={`#/calendario?date=${item.date}`} variant="secondary" className="!px-6">
          Ver no calendário
        </TempleButton>
      </>
    );
  };

  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Próximos trabalhos"
          title={
            <>
              O que vem por <em className="text-gold-700">aí</em>
            </>
          }
          subtitle="Giras, consultas e desenvolvimento da corrente em ordem cronológica — a mesma agenda que alimenta o calendário."
        />

        <div className="mx-auto mt-12 max-w-4xl space-y-6">
          {items.map((item, i) => (
            <Reveal key={`${item.date}-${item.type}`} delay={i * 110}>
              <EntityArtCard item={item} action={actionsFor(item)} />
            </Reveal>
          ))}
        </div>

        <p className="mt-8 text-center font-body text-[12.5px] text-sage">
          As consultas acontecem às quartas-feiras, na janela das {MARIA_MULAMBO_HOURS} — horários confirmados pela casa.
        </p>
        <div className="mt-8 text-center">
          <TempleButton href="#/calendario" variant="secondary" arrow>
            Ver calendário completo
          </TempleButton>
        </div>
      </div>
    </section>
  );
}



/* ---------- 06 · A força da gira (vídeos reais da casa) ---------- */

function GiraVideo({
  video,
  delay,
}: {
  video: (typeof featured.homeVideos)[number];
  delay: number;
}) {
  const [playing, setPlaying] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const toggleFullscreen = () => {
    const el = frameRef.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen?.().catch(() => undefined);
  };
  return (
    <Reveal delay={delay} className="group relative mx-auto w-full max-w-[280px] sm:max-w-none">
      <div
        ref={frameRef}
        className="relative aspect-[9/16] overflow-hidden rounded-3xl border border-gold-500/40 bg-forest-800 shadow-[0_30px_60px_-28px_rgba(0,0,0,0.6)]"
      >
        {playing ? (
          <>
            <iframe
              src={video.preview}
              title={`Vídeo — ${video.caption}`}
              className="absolute inset-0 block h-full w-full border-0"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
            <button
              onClick={toggleFullscreen}
              aria-label="Assistir em tela cheia"
              title="Tela cheia"
              className="absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-full border border-gold-300/60 bg-forest-950/70 text-gold-300 backdrop-blur-sm transition-all hover:scale-110 hover:text-gold-500"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
              </svg>
            </button>
          </>
        ) : (
          <button
            onClick={() => setPlaying(true)}
            className="absolute inset-0 block h-full w-full cursor-pointer"
            aria-label={`Assistir: ${video.caption}`}
          >
            <img
              src={video.thumb}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover opacity-85 transition-all duration-700 group-hover:scale-[1.04] group-hover:opacity-100"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-forest-950/85 via-transparent to-forest-950/25" aria-hidden />
            <span className="absolute inset-0 grid place-items-center">
              <span className="grid size-16 place-items-center rounded-full border-2 border-gold-300 bg-forest-950/65 text-gold-300 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M8 5.5v13l11-6.5-11-6.5z" />
                </svg>
              </span>
            </span>
            <span className="absolute inset-x-0 bottom-0 px-4 pb-3.5 text-left font-display text-lg italic leading-tight text-gold-300">
              {video.caption}
            </span>
          </button>
        )}
      </div>
    </Reveal>
  );
}

export function ForcaDaGira() {
  const reduced = usePrefersReducedMotion();
  const bg = useParallax(0.08);
  return (
    <section className="relative overflow-hidden bg-forest-950 py-20 text-cream sm:py-28">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{ transform: reduced ? undefined : `translateY(${bg * -0.15}px)` }}
        aria-hidden
      >
        <img
          src={featured.giraBackdrop.thumb}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-forest-950 via-forest-950/70 to-forest-950" aria-hidden />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          light
          eyebrow="A força da gira"
          title={
            <>
              Onde a fé se faz <em className="text-gold-300">presença</em>
            </>
          }
          subtitle="O tambor, o ponto e a corrente reunida. Registros reais da nossa casa — toque para assistir, sem som automático."
        />

        <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-3">
          {featured.homeVideos.map((v, i) => (
            <GiraVideo key={v.id} video={v} delay={i * 120} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <TempleButton href="#/galeria" variant="gold" arrow>
            Ver todos os vídeos na galeria
          </TempleButton>
        </div>
      </div>
    </section>
  );
}

/* ---------- 08 · Atendimentos (cards de serviço) ---------- */
const SERVICES: {
  id: ServiceId;
  title: string;
  desc: string;
  meta: string;
  icon: ReactNode;
}[] = [
  {
    id: "mariaMulambo",
    title: "Consulta com Maria Mulambo",
    desc: "Atendimento de orientação e acolhimento, em quartas cadastradas, sempre com hora marcada.",
    meta: `Quartas · ${MARIA_MULAMBO_HOURS}`,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="size-6">
        <path d="M12 3c3 3.5 3 7 0 9-3-2-3-5.5 0-9z" />
        <path d="M12 12v9M8 17c1.5 1 6.5 1 8 0" />
      </svg>
    ),
  },
  {
    id: "jogoDeBuzios",
    title: "Jogo de Búzios",
    desc: "Leitura e orientação através dos búzios, conduzida com seriedade e respeito à sua caminhada.",
    meta: "Mediante agendamento",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="size-6">
        <path d="M7 4c4 2 10 2 10 8s-6 8-10 8c3-3 3-13 0-16z" />
        <path d="M7 4v16" />
      </svg>
    ),
  },
  {
    id: "trabalhoEspiritual",
    title: "Trabalhos espirituais",
    desc: "Obras e trabalhos de caridade espiritual, sempre mediante conversa e agendamento prévio.",
    meta: "Mediante conversa",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="size-6">
        <path d="M12 3c1 4 4 5 4 9a4 4 0 0 1-8 0c0-4 3-5 4-9z" />
        <path d="M12 16v5" />
      </svg>
    ),
  },
  {
    id: "orientacao",
    title: "Orientação",
    desc: "Um primeiro acolhimento para quem busca ajuda espiritual e não sabe por onde começar.",
    meta: "Solicite atendimento",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="size-6">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v4l3 2" />
      </svg>
    ),
  },
];

export function ServiceCards() {
  const { openBooking } = useBooking();
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {SERVICES.map((s, i) => (
        <Reveal
          key={s.id}
          delay={i * 100}
          as="article"
          className="group relative flex flex-col rounded-2xl border border-gold-500/25 bg-cream p-6 shadow-[0_16px_36px_-26px_rgba(23,79,50,0.35)] transition-all duration-300 hover:-translate-y-1.5 hover:border-gold-500/60 hover:shadow-[0_26px_50px_-26px_rgba(23,79,50,0.45)]"
        >
          <span className="mb-4 grid size-12 place-items-center rounded-full border border-gold-500/40 bg-gold-500/10 text-gold-700 transition-colors group-hover:bg-gold-500/20">
            {s.icon}
          </span>
          <h3 className="font-display text-xl font-semibold leading-snug text-forest-950">
            {s.title}
          </h3>
          <p className="mt-2.5 flex-1 font-body text-[13.5px] leading-relaxed text-sage">
            {s.desc}
          </p>
          <p className="mt-4 font-body text-[11px] font-bold uppercase tracking-[0.16em] text-gold-700">
            {s.meta}
          </p>
          <button
            onClick={() => openBooking(s.id)}
            className="mt-4 inline-flex items-center gap-2 self-start font-body text-[13px] font-bold text-forest-950 transition-colors hover:text-gold-700"
          >
            Agendar
            <GoldArrow size={14} className="transition-transform group-hover:translate-x-1" />
          </button>
        </Reveal>
      ))}
    </div>
  );
}

/* ---------- 09 · Depoimentos (somente avaliações reais) ---------- */
export function Depoimentos() {
  return (
    <section className="bg-mint-100/60 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Depoimentos"
          title={
            <>
              Palavras de quem já <em className="text-gold-700">esteve conosco</em>
            </>
          }
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {templeConfig.testimonials.map((t: string, i: number) => (
            <Reveal
              key={i}
              delay={i * 130}
              as="figure"
              className="relative rounded-2xl border border-gold-500/25 bg-cream p-8 shadow-[0_16px_36px_-26px_rgba(23,79,50,0.35)]"
            >
              <span className="absolute -top-5 left-8 font-display text-7xl leading-none text-gold-500/60" aria-hidden>
                “
              </span>
              <blockquote className="relative font-display text-xl font-medium italic leading-relaxed text-forest-950">
                {t}
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-2 font-body text-[11px] font-bold uppercase tracking-[0.18em] text-sage">
                <GoldStar size={10} className="text-gold-500" />
                Avaliação no Google
              </figcaption>
            </Reveal>
          ))}
        </div>
        <div className="mt-10 text-center">
          <TempleButton href={templeConfig.googleProfile} external variant="gold" arrow>
            Ver avaliações no Google
          </TempleButton>
        </div>
      </div>
    </section>
  );
}

/* ---------- 10 · Instagram ---------- */
export function InstagramSection() {
  const posts = featured.instagram;
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Instagram"
          title={
            <>
              Acompanhe nossa <em className="text-gold-700">caminhada</em>
            </>
          }
          subtitle="Bastidores, avisos de gira e momentos de axé no nosso perfil oficial."
        />
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {posts.map((post, i) => (
            <a
              key={post.id}
              href={templeConfig.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Ver publicação no Instagram"
              className="group relative block overflow-hidden rounded-xl border border-gold-500/25"
            >
              <img
                src={post.thumb}
                alt="Publicação do templo no Instagram"
                loading="lazy"
                className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <span className="absolute inset-0 grid place-items-center bg-forest-950/0 transition-colors duration-300 group-hover:bg-forest-950/45">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--color-cream)" strokeWidth="1.8" className="opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden>
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
                </svg>
              </span>
            </a>
          ))}
        </div>
        <div className="mt-10 text-center">
          <TempleButton href={templeConfig.instagram} external variant="secondary" arrow>
            Seguir no Instagram
          </TempleButton>
        </div>
      </div>
    </section>
  );
}

/* ---------- 11 · Localização ---------- */
export function LocationSection() {
  const { address } = templeConfig;
  const mapSrc = mapsEmbedUrl;
  const routeUrl = mapsDirectionsUrl;
  return (
    <section className="bg-mint-100/60 py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <SectionHeading
            align="left"
            eyebrow="Localização"
            title={
              <>
                Venha nos <em className="text-gold-700">conhecer</em>
              </>
            }
          />
          <address className="mt-6 space-y-1.5 font-body text-[15px] not-italic leading-relaxed text-sage">
            <p className="font-semibold text-forest-950">{templeConfig.shortName}</p>
            <p>{address.street}</p>
            <p>{address.district}</p>
            <p>
              {address.city} – {address.state} · {address.zip}
            </p>
          </address>
          <div className="mt-7 flex flex-wrap gap-3">
            <TempleButton href={WHATSAPP_URL} external variant="primary">
              WhatsApp · {templeConfig.phoneDisplay}
            </TempleButton>
            <TempleButton href={templeConfig.instagram} external variant="secondary">
              Instagram
            </TempleButton>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={routeUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 font-body text-[13px] font-bold text-forest-950 transition-colors hover:text-gold-700"
            >
              Traçar rota <GoldArrow size={14} />
            </a>
            <span className="text-gold-500" aria-hidden>·</span>
            <a
              href={templeConfig.streetView}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 font-body text-[13px] font-bold text-forest-950 transition-colors hover:text-gold-700"
            >
              Ver fachada <GoldArrow size={14} />
            </a>
          </div>
        </div>

        <Reveal className="overflow-hidden rounded-3xl border border-gold-500/30 shadow-[0_26px_60px_-28px_rgba(23,79,50,0.45)]">
          <iframe
            title="Mapa — Templo de Umbanda Caboclo Tupinambá e Caboclo Flecha Dourada"
            src={mapSrc}
            className="h-[380px] w-full border-0 lg:h-full lg:min-h-[420px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- 12 · Encerramento da Home ---------- */
export function AxClosing() {
  return (
    <section className="relative overflow-hidden py-24 text-center sm:py-32">
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-25" aria-hidden>
        <LeafSprig color="var(--color-forest-300)" className="h-64 w-64 anim-spin-slow" />
      </div>
      <Reveal className="relative z-10">
        <BotanicalDivider className="mb-10" />
        <p className="mx-auto max-w-lg font-display text-2xl font-medium italic leading-snug text-forest-950 sm:text-3xl">
          Que os guias iluminem seus caminhos, nossa casa está de portas abertas
          para te acolher.
        </p>
        <p className="gold-shimmer mt-10 font-display text-6xl font-semibold italic sm:text-8xl">
          Axé!
        </p>
        <p className="mt-4 font-body text-[11px] font-bold uppercase tracking-[0.26em] text-sage">
          Templo de Umbanda Caboclo Tupinambá e Flecha Dourada
        </p>
        <div className="mt-8 flex justify-center gap-2 text-gold-500" aria-hidden>
          <Leaf className="w-8 -rotate-12" />
          <GoldStar size={14} className="self-center" />
          <Leaf className="w-8 rotate-12 scale-x-[-1]" />
        </div>
      </Reveal>
    </section>
  );
}
