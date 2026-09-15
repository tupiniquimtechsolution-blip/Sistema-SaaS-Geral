import { Link } from "react-router-dom";
import { business } from "../config/business";
import { brl, Reveal, track, usePageMeta, useStore } from "../lib/core";
import { Btn, SectionHead } from "../components/ui";
import { IBath, ICalendar, IClock, IPaw, IScissors, ISparkle, IArrow, IStar } from "../components/icons";

const P = business.branding.photos;

export default function Services() {
  usePageMeta(
    `Banho e Tosa em São Paulo | ${business.name}`,
    "Banho, tosa, hidratação e cuidados com hora marcada. Sem gaiolas, sem pressa e com envio de fotos."
  );
  const { toast } = useStore();

  return (
    <main className="pt-16 md:pt-[72px]">
      {/* abertura editorial */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-[1.1fr_1fr] gap-10 items-center py-14 md:py-20">
          <Reveal>
            <p className="eyebrow flex items-center gap-3"><span className="h-px w-8 bg-brand inline-block" aria-hidden /> Serviços da casa</p>
            <h1 className="font-display font-extrabold display-tight text-[clamp(2.2rem,5.2vw,3.8rem)] text-ink mt-3">
              Cuidado de spa, <span className="font-accent italic font-normal text-brand-deep">ritmo de casa.</span>
            </h1>
            <p className="mt-5 text-fog text-[16px] leading-relaxed max-w-lg">
              Cada atendimento começa lendo as anotações do seu pet: comportamento, sensibilidades e preferências.
              Valores variam por porte — o preço fechado é confirmado no agendamento, sem surpresa.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Btn to="/agendamento" size="lg"><ICalendar size={18} /> Agendar horário</Btn>
              <Btn to="/meu-pet" variant="outline" size="lg"><IPaw size={18} /> Cadastrar pet</Btn>
            </div>
            <div className="mt-8 flex items-center gap-3 text-[13px] text-fog">
              <span className="flex text-brand">{Array.from({ length: 5 }).map((_, i) => <IStar key={i} size={14} />)}</span>
              4.9 em serviços de estética · avaliações reais
            </div>
          </Reveal>
          <Reveal delay={150}>
            <div className="relative">
              <div className="rounded-[28px] rounded-bl-[8px] overflow-hidden shadow-[0_30px_60px_-25px_rgba(91,64,52,0.45)]">
                <img src={P.care} alt="Profissional cuidando de um cachorro com carinho" className="w-full aspect-[4/3] object-cover" />
              </div>
              <div className="absolute -bottom-5 left-6 bg-white rounded-[18px] rounded-bl-[6px] shadow-xl px-5 py-3.5 flex items-center gap-3">
                <span className="w-10 h-10 grid place-items-center rounded-full bg-sand text-bark"><IBath size={19} /></span>
                <div>
                  <p className="font-display font-extrabold text-ink text-sm">+3.400 banhos</p>
                  <p className="text-[12px] text-fog">realizados desde 2016</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* lista de serviços */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
        <div className="grid gap-5">
          {business.services.map((s, i) => (
            <Reveal key={s.id} delay={i * 60}>
              <article
                onMouseEnter={() => track("view_service", { service: s.slug })}
                className={`group relative bg-white border border-line rounded-[24px] rounded-bl-[6px] p-6 sm:p-8 transition-all duration-400 hover:border-brand/60 hover:shadow-[0_24px_50px_-24px_rgba(231,136,74,0.4)] ${i % 2 ? "lg:ml-10" : ""}`}
              >
                {s.popular && (
                  <span className="absolute -top-3 left-7 bg-coral text-white text-[10.5px] font-display font-bold uppercase tracking-wider px-3 py-1 rounded-full">Mais pedido</span>
                )}
                <div className="grid md:grid-cols-[1fr_auto] gap-6 items-start">
                  <div>
                    <div className="flex items-center gap-3.5">
                      <span className="w-12 h-12 shrink-0 grid place-items-center rounded-full bg-sand text-bark group-hover:bg-brand group-hover:text-white transition-colors duration-300">
                        {s.slug.includes("tosa") ? <IScissors size={21} /> : s.slug.includes("hidra") ? <ISparkle size={21} /> : <IBath size={21} />}
                      </span>
                      <div>
                        <h2 className="font-display font-extrabold text-ink text-xl sm:text-[22px]">{s.name}</h2>
                        <p className="text-[12.5px] text-fog flex items-center gap-3 mt-0.5">
                          <span className="inline-flex items-center gap-1"><IClock size={13} /> ~{s.duration} min</span>
                          <span className="inline-flex items-center gap-1"><IPaw size={13} /> {s.petTypes.map((t) => (t === "caes" ? "cães" : "gatos")).join(" e ")}</span>
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 text-fog text-[15px] leading-relaxed max-w-xl">{s.description}</p>
                    <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5">
                      {s.includes.map((inc) => (
                        <li key={inc} className="text-[13px] text-bark/85 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand inline-block" aria-hidden /> {inc}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="md:text-right md:border-l md:border-line md:pl-8 flex md:flex-col items-center md:items-end justify-between gap-4">
                    <div>
                      <p className="text-[11.5px] font-display font-bold uppercase tracking-[0.16em] text-fog">A partir de</p>
                      <p className="font-display font-extrabold text-ink text-3xl">{brl(s.basePrice)}</p>
                      <div className="mt-2.5 flex md:justify-end gap-1.5 text-[11.5px] font-display font-bold">
                        {(["P", "M", "G"] as const).map((k) => (
                          <span key={k} className="bg-sand/70 text-bark rounded-full px-2.5 py-1">{k} · {brl(s.priceBySize[k])}</span>
                        ))}
                      </div>
                    </div>
                    <Btn to={`/agendamento?service=${s.slug}`} variant="bark">
                      Agendar este serviço <IArrow size={15} />
                    </Btn>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* equipe */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-20">
        <Reveal>
          <SectionHead eyebrow="Quem cuida" title={<>Mãos que eles <span className="font-accent italic font-normal text-brand-deep">já conhecem</span></>} desc="No agendamento você pode escolher seu profissional favorito — ou deixar a gente encaixar com quem estiver livre." />
        </Reveal>
        <div className="mt-9 grid sm:grid-cols-3 gap-5">
          {business.professionals.map((pr, i) => (
            <Reveal key={pr.id} delay={i * 90}>
              <div className="bg-white border border-line rounded-[22px] rounded-bl-[6px] p-6 text-center hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(91,64,52,0.35)] transition-all duration-300">
                <span className="mx-auto w-16 h-16 grid place-items-center rounded-full bg-mint text-leaf-deep font-display font-extrabold text-xl">
                  {pr.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </span>
                <p className="mt-4 font-display font-bold text-ink">{pr.name}</p>
                <p className="text-[13px] text-fog">{pr.role}</p>
                <p className="mt-2 text-[11.5px] font-display font-bold uppercase tracking-wider text-brand-deep">na casa desde {pr.since}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* como funciona */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-20">
        <Reveal>
          <div className="rounded-[28px] rounded-bl-[8px] bg-bark text-cream px-6 sm:px-12 py-12 grid lg:grid-cols-[1fr_auto] gap-8 items-center">
            <div>
              <h2 className="font-display font-extrabold display-tight text-[clamp(1.5rem,3.4vw,2.4rem)]">Agende em menos de 2 minutos. <span className="font-accent italic font-normal text-brand">Sério.</span></h2>
              <div className="mt-6 grid sm:grid-cols-3 gap-5">
                {[
                  ["Pet", "Escolha um pet salvo ou cadastre na hora."],
                  ["Serviço & horário", "Agenda real, com os horários livres de verdade."],
                  ["Confirmação", "A loja confirma pelo WhatsApp rapidinho."],
                ].map(([t, d], i) => (
                  <div key={t}>
                    <span className="font-display font-extrabold text-brand text-sm">0{i + 1}</span>
                    <p className="font-display font-bold mt-1">{t}</p>
                    <p className="text-cream/65 text-[13.5px] mt-1">{d}</p>
                  </div>
                ))}
              </div>
            </div>
            <Btn to="/agendamento" size="lg" onClick={() => toast({ title: "Bora lá!", desc: "Escolha o pet para começar." })}>
              Começar agendamento <IArrow size={16} />
            </Btn>
          </div>
        </Reveal>
      </section>

      {/* faixa de fotos */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {[P.bath, P.dry, P.after, P.hero].map((img, i) => (
            <Reveal key={i} delay={i * 70}>
              <img src={img} alt={`Rotina de banho e tosa ${i + 1}`} loading="lazy" className="w-full aspect-[3/4] object-cover rounded-[20px] rounded-bl-[6px] hover:scale-[1.02] transition-transform duration-500" />
            </Reveal>
          ))}
        </div>
        <p className="text-center mt-6">
          <Link to="/agendamento" className="inline-flex items-center gap-2 font-display font-bold text-brand-deep hover:text-brand transition-colors">
            Garantir o horário do seu pet <IArrow size={15} />
          </Link>
        </p>
      </section>
    </main>
  );
}
