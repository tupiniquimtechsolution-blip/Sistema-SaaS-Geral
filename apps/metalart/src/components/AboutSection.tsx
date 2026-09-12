import { Link } from "react-router-dom";
import { assets } from "../config/assets";
import { business } from "../config/business";
import { MaskLines, Reveal, track, useParallax, waLink } from "../lib/motion";
import {
  IconArrowUpRight,
  IconFlame,
  IconGear,
  IconRuler,
  IconShield,
  IconWhatsApp,
  SectionTag,
} from "./ui";

const PILLARS = [
  {
    icon: IconGear,
    title: "Fabricação própria",
    text: "Corte, solda e acabamento dentro da oficina — controle total sobre cada peça que sai daqui.",
  },
  {
    icon: IconRuler,
    title: "Medição no local",
    text: "Nenhuma peça é fabricada 'por aproximação'. O vão é conferido antes de qualquer corte.",
  },
  {
    icon: IconShield,
    title: "Segurança em primeiro lugar",
    text: "Travamento, fixação e estrutura pensados para proteger quem usa todos os dias.",
  },
  {
    icon: IconFlame,
    title: "Acabamento que dura",
    text: "Tratamento antiferrugem e pintura de qualidade para enfrentar o tempo e o clima.",
  },
];

export function AboutSection() {
  const imgPar = useParallax<HTMLDivElement>(30);
  return (
    <section id="sobre-home" className="blueprint-grid-light bg-paper-100 py-24 text-ink-900 md:py-32">
      <div className="mx-auto max-w-[1440px] px-5 md:px-8">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-24">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionTag light index="01" label="A Metal & Art" />
            <h2 className="font-display mt-6 text-[clamp(2.6rem,5.5vw,4.6rem)] leading-[0.96] uppercase">
              <MaskLines
                lines={[
                  <span key="1">Sob medida.</span>,
                  <span key="2">Do jeito que</span>,
                  <span key="3">
                    o projeto <em className="text-ember-600 not-italic">exige</em>.
                  </span>,
                ]}
              />
            </h2>

            <Reveal className="mt-10">
              <div className="relative">
                {/* imagem institucional oficial do site do cliente */}
                <div className="img-zoom border-ink-900/15 relative aspect-[2/3] max-h-[34rem] overflow-hidden border">
                  <div ref={imgPar} className="h-[114%] w-full will-change-transform">
                    <img
                      src={assets.official.aboutImage}
                      alt="Metal & Art Serralheria — fabricação sob medida"
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <p className="font-mono absolute bottom-3 left-3 bg-ink-900/85 px-2.5 py-1 text-[0.6rem] tracking-[0.2em] text-paper-100 uppercase">
                    Metal &amp; Art — {business.address.region}, SP
                  </p>
                </div>
                {/* moldura sobreposta — dia a dia da oficina */}
                <div className="img-zoom border-ember-600/70 absolute -right-3 -bottom-10 hidden w-[46%] overflow-hidden border-4 bg-paper-100 shadow-[0_18px_40px_rgba(20,22,26,0.28)] sm:block lg:-right-8">
                  <img
                    src={assets.workshop.fabrication}
                    alt="Corte de perfis metálicos na oficina da Metal & Art"
                    className="aspect-[4/3] w-full object-cover"
                    loading="lazy"
                  />
                  <p className="font-mono bg-ink-900 px-2.5 py-1.5 text-[0.55rem] tracking-[0.22em] text-paper-100 uppercase">
                    Oficina — corte &amp; solda
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          <div>
            <Reveal>
              <p className="text-lg leading-relaxed text-ink-700 md:text-xl">
                A <strong className="font-semibold text-ink-900">Metal &amp; Art</strong> é uma
                serralheria de São Paulo especializada em trabalho sob medida:
                medimos no local, fabricamos na oficina e instalamos com a
                mesma equipe — do portão da casa à estrutura do galpão.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-6 leading-relaxed text-ink-700">
                Atendemos <strong className="font-semibold text-ink-900">residências, condomínios e empresas</strong>{" "}
                com reformas e reparos em portões, automação, travas
                eletromagnéticas, fechaduras, grades de proteção, corrimãos,
                guarda-corpos, portas de enrolar e estruturas metálicas. Sempre
                com o mesmo critério: qualidade de fabricação, segurança de uso
                e durabilidade de acabamento.
              </p>
            </Reveal>

            <div className="mt-12 grid gap-px border border-ink-900/15 bg-ink-900/15 sm:grid-cols-2">
              {PILLARS.map((p, i) => (
                <Reveal key={p.title} delay={i * 0.08} className="bg-paper-100">
                  <div className="group h-full p-6 transition-colors hover:bg-paper-200 md:p-7">
                    <p.icon className="h-7 w-7 text-ember-600 transition-transform duration-300 group-hover:-translate-y-1" />
                    <h3 className="font-display mt-4 text-xl tracking-[0.03em] uppercase">{p.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-700">{p.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal className="mt-12 flex flex-wrap gap-4">
              <Link
                to="/sobre"
                className="btn-press bg-ink-900 hover:bg-ember-600 font-display inline-flex items-center gap-3 px-6 py-3.5 text-base tracking-[0.06em] text-paper-100 uppercase"
              >
                Conheça a oficina <IconArrowUpRight className="h-4.5 w-4.5" />
              </Link>
              <a
                href={waLink(business.whatsappDigits, "Olá, Metal & Art! Quero conhecer os serviços de vocês.")}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("whatsapp_sobre")}
                className="btn-press border-ink-900/30 hover:border-ember-600 hover:text-ember-600 font-display inline-flex items-center gap-3 border px-6 py-3.5 text-base tracking-[0.06em] text-ink-900 uppercase"
              >
                <IconWhatsApp className="h-4.5 w-4.5" /> Falar com a equipe
              </a>
            </Reveal>

            <Reveal className="mt-10">
              <p className="font-mono text-[0.65rem] tracking-[0.2em] text-ink-700/70 uppercase">
                Atendimento: {business.serviceAreas.join(" · ")}
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
