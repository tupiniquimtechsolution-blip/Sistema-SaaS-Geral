import type { ReactNode } from "react";
import { LineageSection } from "../components/EntityCard";
import Gallery from "../components/Gallery";
import { ServiceCards } from "../components/HomeSections";
import { BotanicalDivider, GoldArrow, GoldStar, LeafSprig, LogoCircle } from "../components/Ornaments";
import { Reveal, SectionHeading, TempleButton } from "../components/ui";
import { featured } from "../data/media";
import {
  mapsDirectionsUrl,
  mapsEmbedUrl,
  templeConfig,
} from "../data/templeConfig";
import { WHATSAPP_URL } from "../lib/calendar";
import { useParallax, usePrefersReducedMotion } from "../hooks";

/* ---------- cabeçalho de página interna ---------- */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
}) {
  return (
    <div className="pt-32 pb-4 sm:pt-40">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />
        <BotanicalDivider className="mt-8" />
      </div>
    </div>
  );
}

const MISSION = [
  { title: "Acolhimento", desc: "Receber a todos com o coração aberto, sem julgamentos." },
  { title: "Orientação", desc: "Ajudar cada pessoa a encontrar clareza para sua caminhada." },
  { title: "Atendimento", desc: "Cuidado espiritual sério, com hora marcada e respeito." },
  { title: "Respeito", desc: "Honrar todas as crenças, origens e caminhos de fé." },
  { title: "Espiritualidade", desc: "Viver a fé no dia a dia, com equilíbrio e gratidão." },
  { title: "Caridade", desc: "Fazer o bem sem olhar a quem — fundamento da nossa casa." },
];

export function QuemSomos() {
  return (
    <div className="pb-20">
      <PageHeader
        eyebrow="Quem Somos"
        title={
          <>
            Uma casa de <em className="text-gold-700">fé e acolhimento</em>
          </>
        }
        subtitle="Conheça a missão e o propósito que movem a nossa casa."
      />

      {/* a casa */}
      <section className="py-14">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
          <Reveal className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-3 rounded-[30px] border border-gold-500/40" aria-hidden />
            <img
              src={featured.aboutPhoto.src}
              alt="Foto oficial da casa — Templo de Umbanda Caboclo Tupinambá e Flecha Dourada"
              loading="lazy"
              className="relative w-full rounded-[24px] border-[3px] border-cream object-cover shadow-[0_30px_70px_-22px_rgba(23,79,50,0.4)]"
            />
          </Reveal>
          <div>
            <SectionHeading
              align="left"
              eyebrow="A casa"
              title={
                <>
                  Um lugar para quem busca <em className="text-gold-700">ajuda espiritual</em>
                </>
              }
              subtitle="Um lugar de acolhimento a quem precisa de ajuda espiritual, com atendimento aos consulentes e orientação aos mesmos. Axé."
            />
            <div className="mt-6 flex items-center gap-4">
              <LogoCircle size={56} />
              <p className="max-w-xs font-body text-sm leading-relaxed text-sage">
                Nossa casa está de portas abertas em São Paulo, na Zona Leste,
                para receber quem precisa de fé, orientação e axé.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* missão */}
      <section className="bg-mint-100/60 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Nossa missão"
            title={
              <>
                O que nos <em className="text-gold-700">move</em>
              </>
            }
          />
          <div className="mt-12 grid gap-x-12 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {MISSION.map((m, i) => (
              <Reveal key={m.title} delay={(i % 3) * 110} className="flex gap-4">
                <span className="mt-1 shrink-0 text-gold-500">
                  <GoldStar size={16} />
                </span>
                <div>
                  <h3 className="font-display text-2xl font-semibold text-forest-950">{m.title}</h3>
                  <p className="mt-1.5 font-body text-sm leading-relaxed text-sage">{m.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/*
        "Nossas entidades" e o CTA do Manual foram removidos da interface
        pública conforme o Documento Central de Correções (§4). O conteúdo do
        manual permanece preservado em templeConfig, apenas sem renderização.
      */}

      {/* linhas de trabalho — congelada via feature flag (reversível, §4) */}
      {templeConfig.showLineage && <LineageSection />}



      <div className="pt-16 text-center">
        <TempleButton href="#/galeria" variant="secondary" arrow>
          Galeria da casa
        </TempleButton>
      </div>
    </div>
  );
}

export function Atendimentos() {
  return (
    <div className="pb-20">
      <PageHeader
        eyebrow="Atendimentos"
        title={
          <>
            Caminhos de <em className="text-gold-700">orientação</em>
          </>
        }
        subtitle="Cada atendimento é realizado com seriedade, respeito e hora marcada. Nenhum resultado espiritual é prometido — oferecemos acolhimento e orientação."
      />

      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
        {/*
          Tipo = Consulta (genérico, §6): a entidade responsável vem do evento
          associado no calendário — nunca fixada na categoria.
        */}
        <ServiceCards />

        <Reveal className="mx-auto mt-14 max-w-xl">
          <div className="rounded-3xl border border-gold-500/30 bg-cream p-8 text-center sm:p-10">
            <GoldStar size={22} className="mx-auto text-gold-500" />
            <p className="mt-4 font-display text-2xl font-medium italic leading-relaxed text-forest-950">
              “A fé não se promete — se cultiva, com respeito e caridade.”
            </p>
            <p className="mt-4 font-body text-[11px] font-bold uppercase tracking-[0.2em] text-sage">
              Nosso compromisso com você
            </p>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

export function Galeria() {
  return (
    <div className="pb-20">
      <PageHeader
        eyebrow="Galeria"
        title={
          <>
            Arte, fé e <em className="text-gold-700">axé</em>
          </>
        }
        subtitle="Momentos e registros reais da casa — fotos e vídeos do acervo oficial, publicados no nosso Instagram."
      />
      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
        <Gallery />
      </div>
    </div>
  );
}

export function Contato() {
  const { address } = templeConfig;
  const reduced = usePrefersReducedMotion();
  const bg = useParallax(0.1);
  const mapSrc = mapsEmbedUrl;
  const routeUrl = mapsDirectionsUrl;

  return (
    <div className="pb-20">
      <PageHeader
        eyebrow="Contato"
        title={
          <>
            Fale com o <em className="text-gold-700">templo</em>
          </>
        }
        subtitle="O WhatsApp é o canal oficial da casa. Fale conosco para agendamentos, dúvidas ou para marcar sua primeira visita."
      />

      <div className="relative mx-auto max-w-7xl px-4 pt-10 sm:px-6">
        <div
          className="pointer-events-none absolute -right-20 top-0 -z-10 opacity-15"
          style={{ transform: reduced ? undefined : `translateY(${bg * -0.15}px)` }}
          aria-hidden
        >
          <LeafSprig color="var(--color-forest-300)" className="h-72 w-72" flip />
        </div>

        {/* WhatsApp é o canal oficial */}
        <Reveal className="rounded-3xl bg-forest-950 p-8 text-cream sm:p-12">
          <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="flex items-center gap-2 font-body text-[10px] font-bold uppercase tracking-[0.26em] text-gold-300">
                <GoldStar size={10} /> Fale com o templo
              </p>
              <h2 className="mt-3 font-display text-4xl font-semibold leading-tight">
                WhatsApp é o nosso <em className="text-gold-300">canal oficial</em>
              </h2>
              <p className="mt-4 font-body text-sm leading-relaxed text-mint-200/85">
                É por lá que confirmamos giras, consultas e atendimentos. Chame a
                gente — será um prazer te acolher.
              </p>
              <p className="mt-5 font-display text-3xl font-semibold text-gold-300">
                {templeConfig.phoneDisplay}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between rounded-2xl bg-whatsapp px-6 py-4 font-body text-sm font-bold text-cream transition-all hover:-translate-y-0.5 hover:brightness-110"
              >
                Falar pelo WhatsApp
                <GoldArrow size={17} className="transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href={templeConfig.instagram}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between rounded-2xl border border-cream/30 px-6 py-4 font-body text-sm font-semibold text-cream transition-all hover:-translate-y-0.5 hover:border-gold-300 hover:text-gold-300"
              >
                Instagram
                <GoldArrow size={17} className="transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href={templeConfig.googleProfile}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between rounded-2xl border border-cream/30 px-6 py-4 font-body text-sm font-semibold text-cream transition-all hover:-translate-y-0.5 hover:border-gold-300 hover:text-gold-300"
              >
                Perfil no Google
                <GoldArrow size={17} className="transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </div>
        </Reveal>

        {/* localização — título imediatamente acima da área de endereço/mapa */}
        <div className="mt-16">
          <SectionHeading
            align="left"
            eyebrow="Localização"
            title={
              <>
                Onde a casa <em className="text-gold-700">te espera</em>
              </>
            }
          />
        </div>
        <div className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal className="rounded-3xl border border-gold-500/25 bg-cream p-8 shadow-[0_24px_56px_-30px_rgba(23,79,50,0.4)]">
            <p className="flex items-center gap-2 font-body text-[10px] font-bold uppercase tracking-[0.26em] text-gold-700">
              <GoldStar size={10} /> Endereço
            </p>
            <h3 className="mt-3 font-display text-3xl font-semibold text-forest-950">
              Nossa casa te espera
            </h3>
            <address className="mt-5 space-y-1.5 font-body text-[15px] not-italic leading-relaxed text-sage">
              <p className="font-semibold text-forest-950">{templeConfig.shortName}</p>
              <p>{address.street}</p>
              <p>{address.district}</p>
              <p>
                {address.city} – {address.state} · {address.zip}
              </p>
            </address>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={routeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-forest-950 px-6 py-3 font-body text-[13px] font-bold text-cream transition-all hover:bg-forest-800"
              >
                Traçar rota <GoldArrow size={15} />
              </a>
              <a
                href={templeConfig.streetView}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-forest-950/30 px-6 py-3 font-body text-[13px] font-semibold text-forest-950 transition-colors hover:border-gold-500"
              >
                Ver fachada
              </a>
            </div>
          </Reveal>

          <Reveal delay={120} className="overflow-hidden rounded-3xl border border-gold-500/30 shadow-[0_26px_60px_-28px_rgba(23,79,50,0.45)]">
            <iframe
              title="Mapa — Templo de Umbanda Caboclo Tupinambá e Caboclo Flecha Dourada"
              src={mapSrc}
              className="h-[360px] w-full border-0 lg:h-full lg:min-h-[420px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </Reveal>
        </div>
      </div>
    </div>
  );
}
