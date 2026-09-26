import { Link } from "react-router-dom";
import { ArrowRight, Wine } from "lucide-react";
import { philosophy, team } from "../config/content";
import { business } from "../config/business";
import { images } from "../config/images";
import { AnimatedCounter, Kicker, Parallax, ScrollReveal, SectionHeading, usePrefersReducedMotion } from "../components/ui";

export default function AboutPage() {
  const reduce = usePrefersReducedMotion();

  return (
    <>
      {/* abertura editorial */}
      <section className="relative overflow-hidden border-b border-line bg-bg pt-32 pb-16 sm:pt-40 sm:pb-24" aria-label="Sobre o Chez Amis">
        <div className="shell relative grid items-end gap-12 lg:grid-cols-2">
          <div className={reduce ? "" : "anim-fade-up"}>
            <Kicker>Haddock Lobo, 74 · Cerqueira César</Kicker>
            <h1 className="display-tight mt-5 font-display text-cream">
              <span className="block text-5xl sm:text-7xl">Um bistrô de</span>
              <span className="block text-6xl text-ember sm:text-8xl">
                <em className="font-wordmark not-italic">porta aberta</em>
              </span>
              <span className="block text-5xl sm:text-7xl">para a França.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-relaxed text-sand sm:text-lg">
              O {business.name} nasceu de uma convicção simples: a alta cozinha francesa não precisa de cerimônia — precisa
              de técnica, produto bom e uma mesa acolhedora. O resto é conversa boa e vinho na taça.
            </p>
          </div>

          <div className={`relative ${reduce ? "" : "anim-fade"}`}>
            <div className="absolute -left-4 -top-4 h-20 w-20 border-l-2 border-t-2 border-gold/60" aria-hidden />
            <img
              src={images.interior1}
              alt="Salão do Chez Amis Bistrô com mesas postas e iluminação quente"
              className="aspect-[16/10] w-full border border-line object-cover"
            />
            <p className="absolute bottom-4 right-4 bg-bg/85 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-gold backdrop-blur-sm">
              O salão, todos os dias 12h–23h
            </p>
          </div>
        </div>
      </section>

      {/* manifesto / filosofia */}
      <section className="border-b border-line bg-panel py-24 sm:py-28" aria-label="Nossa filosofia">
        <div className="shell">
          <SectionHeading
            kicker="Manifesto da casa"
            title={
              <>
                O que não <em className="font-wordmark not-italic text-ember">negociamos</em>
              </>
            }
          />
          <div className="mt-14 grid gap-x-16 gap-y-12 md:grid-cols-2">
            {philosophy.map((p, i) => (
              <ScrollReveal key={p.n} delay={(i % 2) * 0.1}>
                <article className="group flex gap-6 border-t border-line pt-7 transition-colors hover:border-ember">
                  <p className="font-display text-5xl italic text-ember/70 transition-colors group-hover:text-ember">{p.n}</p>
                  <div>
                    <h3 className="font-display text-2xl text-cream">{p.title}</h3>
                    <p className="mt-3 max-w-md leading-relaxed text-sand">{p.text}</p>
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* equipe */}
      <section className="bg-bg py-24 sm:py-28" aria-label="Equipe">
        <div className="shell">
          <SectionHeading
            kicker="Quem faz a casa"
            title={
              <>
                A brigada <em className="font-wordmark not-italic text-ember">do Chez Amis</em>
              </>
            }
            description="Cozinha enxuta, obcecada por técnica — e um salão que trata todo mundo como amigo da casa. Fotos ilustrativas até entrarem as oficiais."
          />
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((m, i) => (
              <ScrollReveal key={m.name} delay={i * 0.1} y={32}>
                <article className="group border border-line bg-panel transition-all duration-300 hover:-translate-y-1.5 hover:border-ember/60 hover:shadow-lift">
                  <div className="relative overflow-hidden">
                    <img
                      src={m.image}
                      alt={`Foto ilustrativa de ${m.name}, ${m.role}`}
                      loading="lazy"
                      className="aspect-[4/5] w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-panel via-transparent to-transparent" />
                    <p className="absolute left-4 top-4 border border-gold/40 bg-bg/80 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-gold backdrop-blur-sm">
                      foto ilustrativa
                    </p>
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-2xl text-cream">{m.name}</h3>
                    <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.22em] text-ember">{m.role}</p>
                    <p className="mt-3 text-sm leading-relaxed text-sand">{m.bio}</p>
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* números + CTA */}
      <section className="relative overflow-hidden border-t border-line bg-panel py-24 sm:py-28" aria-label="Números da casa">
        <div className="absolute inset-0 overflow-hidden" aria-hidden>
          <Parallax className="h-full" speed={0.1}>
            <img src={images.interior2} alt="" className="h-[115%] w-full object-cover opacity-[0.12]" loading="lazy" />
          </Parallax>
        </div>
        <div className="shell relative">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {business.stats.map((s, i) => (
              <ScrollReveal key={s.label} delay={i * 0.08}>
                <div className="border-l-2 border-ember/70 pl-5">
                  <p className="font-display text-6xl text-cream">
                    <AnimatedCounter value={s.value} suffix={s.suffix} decimals={s.decimals ?? 0} />
                  </p>
                  <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-sand">{s.label}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={0.2}>
            <div className="mt-16 flex flex-col items-start justify-between gap-6 border border-line bg-bg p-8 sm:flex-row sm:items-center sm:p-10">
              <div>
                <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.26em] text-gold">
                  <Wine aria-hidden size={13} /> Próximo capítulo
                </p>
                <p className="display-tight mt-3 font-display text-3xl text-cream sm:text-4xl">
                  Vem brindar <em className="font-wordmark not-italic text-ember">de perto.</em>
                </p>
              </div>
              <Link
                to="/cardapio"
                className="group flex shrink-0 items-center gap-3 border border-ember bg-ember px-7 py-4 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-bg transition-all duration-300 hover:bg-transparent hover:text-ember"
              >
                Ver a carta
                <ArrowRight aria-hidden size={16} className="transition-transform duration-300 group-hover:translate-x-1.5" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
