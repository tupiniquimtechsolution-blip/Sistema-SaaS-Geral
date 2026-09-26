import { useState } from "react";
import { business } from "../config/business";
import { openStatus, Reveal, track, usePageMeta, useStore, whatsLink } from "../lib/core";
import { Btn, SectionHead, inputCls, labelCls } from "../components/ui";
import { TrustStrip } from "../components/chrome";
import { IArrow, IClock, IHeart, IInstagram, IPaw, IPhone, IPin, IWhatsApp, IStar, IBath, IRoute } from "../components/icons";

const P = business.branding.photos;
const loc = business.locations[0];
const DAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

/* =============== SOBRE =============== */
export function AboutPage() {
  usePageMeta(`Sobre | ${business.name}`, "Conheça a história da Amora Pet: casa de banho e lifestyle pet na Vila Madalena desde 2016.");
  return (
    <main className="pt-16 md:pt-[72px]">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 md:py-20 grid lg:grid-cols-2 gap-12 items-center">
        <Reveal>
          <p className="eyebrow flex items-center gap-3"><span className="h-px w-8 bg-brand inline-block" aria-hidden /> Nossa história</p>
          <h1 className="font-display font-extrabold display-tight text-[clamp(2.2rem,5vw,3.6rem)] text-ink mt-3">
            Começou com uma vira-lata <span className="font-accent italic font-normal text-brand-deep">chamada Amora.</span>
          </h1>
          <div className="mt-6 grid gap-4 text-fog text-[15.5px] leading-relaxed max-w-xl">
            <p>
              Em 2016, a Bianca não encontrava um lugar que tratasse a Amora como parte da família — então abriu o próprio.
              A primeira sala tinha uma banheira, um secador e uma certeza: <strong className="text-ink">pet não é cliente, é convidado.</strong>
            </p>
            <p>
              Hoje somos casa de banho, loja de curadoria e ponto de encontro do bairro. Sem gaiolas, sem linha de montagem,
              com anotações de cada pet e fotos enviadas quando estão prontos.
            </p>
          </div>
          <div className="mt-8 flex gap-8">
            {[["9", "anos de casa"], ["3.4k", "banhos feitos"], ["4.9", "nota média"]].map(([n, l]) => (
              <div key={l}>
                <p className="font-display font-extrabold text-3xl text-ink">{n}</p>
                <p className="text-[12.5px] text-fog font-display font-semibold">{l}</p>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={150}>
          <div className="grid grid-cols-2 gap-4">
            <img src={P.store} alt="Interior da loja Amora Pet" className="rounded-[24px] rounded-bl-[6px] aspect-[3/4] object-cover mt-8" />
            <img src={P.care} alt="Cuidado com os pets" className="rounded-[24px] rounded-bl-[6px] aspect-[3/4] object-cover" />
          </div>
        </Reveal>
      </section>

      <section className="bg-sand/70 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Reveal><SectionHead align="center" eyebrow="No que a gente acredita" title={<>Três promessas, <span className="font-accent italic font-normal text-brand-deep">todos os dias</span></>} /></Reveal>
          <div className="mt-10 grid md:grid-cols-3 gap-5">
            {[
              { icon: <IHeart size={24} />, t: "Carinho mensurável", d: "Cada pet tem ficha de comportamento e preferências. A gente lê antes de cada banho — sempre." },
              { icon: <IBath size={24} />, t: "Sem pressa, sem gaiola", d: "Agenda com buffer entre atendimentos para ninguém esperar estressado. Um de cada vez." },
              { icon: <IStar size={24} />, t: "Transparência de preço", d: "Valor por porte publicado, confirmado antes de começar. Surpresa só na hora da foto final." },
            ].map((v, i) => (
              <Reveal key={v.t} delay={i * 100}>
                <div className="bg-white rounded-[22px] rounded-bl-[6px] p-7 h-full hover:-translate-y-1 hover:shadow-[0_20px_44px_-22px_rgba(91,64,52,0.4)] transition-all duration-300">
                  <span className="w-12 h-12 grid place-items-center rounded-full bg-brand/12 text-brand-deep">{v.icon}</span>
                  <h3 className="font-display font-bold text-ink text-lg mt-4">{v.t}</h3>
                  <p className="text-fog text-[14.5px] mt-2 leading-relaxed">{v.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <Reveal><SectionHead eyebrow="Equipe" title={<>Quem vai receber <span className="font-accent italic font-normal text-brand-deep">o seu pet</span></>} /></Reveal>
        <div className="mt-9 grid sm:grid-cols-3 gap-5">
          {business.professionals.map((pr, i) => (
            <Reveal key={pr.id} delay={i * 90}>
              <div className="bg-white border border-line rounded-[22px] rounded-bl-[6px] p-6 flex items-center gap-4">
                <span className="w-14 h-14 shrink-0 grid place-items-center rounded-full bg-mint text-leaf-deep font-display font-extrabold text-lg">
                  {pr.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </span>
                <div>
                  <p className="font-display font-bold text-ink">{pr.name}</p>
                  <p className="text-[13px] text-fog">{pr.role} · desde {pr.since}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-12 text-center">
          <Btn to="/agendamento" size="lg">Agendar uma visita <IArrow size={16} /></Btn>
        </Reveal>
      </section>
    </main>
  );
}

/* =============== CONTATO =============== */
export function ContactPage() {
  usePageMeta(`Contato | ${business.name}`, "Fale com a Amora Pet por WhatsApp, telefone ou visite a loja na Vila Madalena.");
  const { toast } = useStore();
  const [f, setF] = useState({ name: "", contact: "", msg: "" });
  const [sent, setSent] = useState(false);
  const status = openStatus();

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 md:pt-32 pb-10">
      <Reveal>
        <SectionHead
          eyebrow="Fale com a gente"
          title={<>Oi! Como podemos <span className="font-accent italic font-normal text-brand-deep">ajudar?</span></>}
          desc="Respondemos rápido no WhatsApp. Para encomendas, parcerias ou só mandar foto do seu pet, qualquer canal serve."
        />
      </Reveal>

      <div className="mt-10 grid lg:grid-cols-[1fr_380px] gap-8 items-start">
        <Reveal className="bg-white border border-line rounded-[24px] rounded-bl-[6px] p-6 sm:p-8">
          {sent ? (
            <div className="text-center py-10">
              <span className="mx-auto w-16 h-16 grid place-items-center rounded-full bg-leaf text-white"><IPaw size={26} /></span>
              <h2 className="font-display font-extrabold text-xl text-ink mt-4">Mensagem anotada!</h2>
              <p className="text-fog mt-2 text-[14.5px]">Retornamos em até 1 dia útil — normalmente bem antes.</p>
              <Btn variant="outline" className="mt-6" onClick={() => { setSent(false); setF({ name: "", contact: "", msg: "" }); }}>Enviar outra</Btn>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (f.name.trim() && f.msg.trim()) {
                  setSent(true);
                  toast({ title: "Mensagem enviada", desc: "Obrigado pelo contato!" });
                }
              }}
              className="grid gap-4"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ct-name" className={labelCls}>Nome *</label>
                  <input id="ct-name" required className={inputCls} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Seu nome" />
                </div>
                <div>
                  <label htmlFor="ct-contact" className={labelCls}>WhatsApp ou e-mail</label>
                  <input id="ct-contact" className={inputCls} value={f.contact} onChange={(e) => setF({ ...f, contact: e.target.value })} placeholder="Para retornarmos" />
                </div>
              </div>
              <div>
                <label htmlFor="ct-msg" className={labelCls}>Mensagem *</label>
                <textarea id="ct-msg" required rows={5} className={inputCls} value={f.msg} onChange={(e) => setF({ ...f, msg: e.target.value })} placeholder="Conte o que precisa — encomenda, dúvida, parceria…" />
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="submit" className="inline-flex items-center gap-2 font-display font-bold text-[15px] px-8 py-4 rounded-full bg-brand text-white hover:bg-brand-deep transition-colors shadow-[0_14px_34px_-10px_rgba(231,136,74,0.7)]">
                  Enviar mensagem <IArrow size={16} />
                </button>
                <a href={whatsLink(business.contact.whatsapp, "Olá! Vim pela página de contato.")} target="_blank" rel="noreferrer" onClick={() => track("click_whatsapp", { from: "contact" })} className="inline-flex items-center gap-2 font-display font-bold text-[14.5px] px-6 py-4 rounded-full border-[1.5px] border-leaf/40 text-leaf-deep hover:bg-leaf hover:text-white transition-colors">
                  <IWhatsApp size={17} /> Ou chame no WhatsApp
                </a>
              </div>
            </form>
          )}
        </Reveal>

        <div className="grid gap-4">
          {[
            { icon: <IWhatsApp size={20} />, t: "WhatsApp", d: business.contact.phone, href: whatsLink(business.contact.whatsapp, "Olá!"), ext: true },
            { icon: <IPhone size={20} />, t: "Telefone", d: loc.phone, href: `tel:${loc.phone.replace(/\D/g, "")}`, ext: false },
            { icon: <IPin size={20} />, t: "Endereço", d: `${loc.address} · ${loc.district} — ${loc.city}`, href: loc.mapsUrl, ext: true },
            { icon: <IClock size={20} />, t: status.label, d: "Seg–Sex 08h–19h · Sáb 08h–18h", href: "/localizacao", ext: false },
          ].map((c) => {
            const inner = (
              <>
                <span className="w-11 h-11 shrink-0 grid place-items-center rounded-full bg-sand text-bark">{c.icon}</span>
                <div className="min-w-0">
                  <p className="font-display font-bold text-ink text-[14.5px]">{c.t}</p>
                  <p className="text-[13px] text-fog truncate">{c.d}</p>
                </div>
                <IArrow size={15} className="ml-auto text-fog shrink-0" />
              </>
            );
            return c.href.startsWith("/") ? (
              <a key={c.t} href={`#${c.href}`} className="bg-white border border-line rounded-[18px] rounded-bl-[6px] p-4 flex items-center gap-3.5 hover:border-brand hover:-translate-y-0.5 transition-all">
                {inner}
              </a>
            ) : (
              <a key={c.t} href={c.href} target={c.ext ? "_blank" : undefined} rel="noreferrer" className="bg-white border border-line rounded-[18px] rounded-bl-[6px] p-4 flex items-center gap-3.5 hover:border-brand hover:-translate-y-0.5 transition-all">
                {inner}
              </a>
            );
          })}
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="bg-bark text-cream rounded-[18px] rounded-bl-[6px] p-4 flex items-center gap-3.5 hover:bg-ink transition-colors">
            <span className="w-11 h-11 shrink-0 grid place-items-center rounded-full bg-cream/12 text-brand"><IInstagram size={19} /></span>
            <div>
              <p className="font-display font-bold text-[14.5px]">{business.contact.instagram}</p>
              <p className="text-[13px] text-cream/60">Bastidores e pets prontos todo dia</p>
            </div>
          </a>
        </div>
      </div>
    </main>
  );
}

/* =============== LOCALIZAÇÃO =============== */
export function LocationPage() {
  usePageMeta(`Localização | ${business.name}`, `${loc.address}, ${loc.district} — ${loc.city}. Delivery na Zona Oeste e retirada na loja.`);
  const status = openStatus();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 md:pt-32 pb-10">
      <Reveal>
        <SectionHead
          eyebrow="Onde estamos"
          title={<>Vem tomar um café — <span className="font-accent italic font-normal text-brand-deep">traz o pet.</span></>}
          desc={`${loc.address}, ${loc.district} — ${loc.city}. A 400 m do metrô Fradique Coutinho, com bicicletário e água fresca na calçada.`}
        />
      </Reveal>

      <div className="mt-10 grid lg:grid-cols-[1.2fr_1fr] gap-8 items-start">
        {/* mapa estilizado */}
        <Reveal>
          <div className="relative rounded-[28px] rounded-bl-[8px] overflow-hidden border border-line bg-mint/40 aspect-[4/3]">
            <svg viewBox="0 0 600 450" className="w-full h-full" role="img" aria-label="Mapa ilustrado da região da loja">
              <rect width="600" height="450" fill="#DCEAE2" />
              {/* quarteirões */}
              {[
                [20, 20, 160, 120], [200, 20, 180, 120], [400, 20, 180, 120],
                [20, 170, 160, 130], [400, 170, 180, 130], [20, 330, 160, 100],
                [200, 330, 180, 100], [400, 330, 180, 100],
              ].map(([x, y, w, h], i) => (
                <rect key={i} x={x} y={y} width={w} height={h} rx="14" fill="#F1DFCA" opacity="0.85" />
              ))}
              {/* ruas */}
              <rect x="0" y="146" width="600" height="20" fill="#FFF8F0" />
              <rect x="0" y="306" width="600" height="20" fill="#FFF8F0" />
              <rect x="184" y="0" width="14" height="450" fill="#FFF8F0" />
              <rect x="384" y="0" width="14" height="450" fill="#FFF8F0" />
              <path d="M0 156h600" stroke="#E5CDAE" strokeWidth="2" strokeDasharray="10 12" />
              {/* praça */}
              <rect x="206" y="176" width="170" height="124" rx="16" fill="#B8D9CD" />
              <circle cx="250" cy="220" r="14" fill="#568C76" opacity="0.8" />
              <circle cx="290" cy="250" r="18" fill="#568C76" opacity="0.7" />
              <circle cx="330" cy="215" r="12" fill="#568C76" opacity="0.8" />
              <text x="291" y="285" textAnchor="middle" fontSize="12" fontFamily="Sora, sans-serif" fontWeight="700" fill="#3F6E5B">Praça dos Cachorros</text>
              {/* loja */}
              <g transform="translate(300 156)">
                <circle r="26" fill="#E7884A" opacity="0.25">
                  <animate attributeName="r" values="20;30;20" dur="2.6s" repeatCount="indefinite" />
                </circle>
                <circle r="13" fill="#E7884A" stroke="#FFF8F0" strokeWidth="4" />
                <text y="-24" textAnchor="middle" fontSize="14" fontFamily="Sora, sans-serif" fontWeight="800" fill="#5B4034">Amora Pet</text>
              </g>
            </svg>
            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2.5 items-center justify-between">
              <span className={`inline-flex items-center gap-2 bg-cream/95 text-bark font-display font-bold text-[12.5px] rounded-full px-3.5 py-2 ${status.open ? "" : ""}`}>
                <span className={`w-2 h-2 rounded-full ${status.open ? "bg-leaf" : "bg-coral"}`} aria-hidden /> {status.label}
              </span>
              <a href={loc.mapsUrl} target="_blank" rel="noreferrer" onClick={() => track("view_location", {})} className="inline-flex items-center gap-2 bg-bark text-cream font-display font-bold text-[12.5px] rounded-full px-4 py-2 hover:bg-ink transition-colors">
                <IRoute size={15} /> Traçar rota no Google Maps
              </a>
            </div>
          </div>
        </Reveal>

        <div className="grid gap-4">
          <Reveal className="bg-white border border-line rounded-[22px] rounded-bl-[6px] p-6">
            <h2 className="font-display font-bold text-ink text-lg flex items-center gap-2.5"><IPin size={19} className="text-brand" /> {loc.name}</h2>
            <address className="not-italic mt-3 text-fog text-[14.5px] leading-relaxed">
              {loc.address} · {loc.district}<br />{loc.city}
            </address>
            <div className="mt-4 flex flex-wrap gap-2.5">
              <a href={loc.mapsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-brand text-white font-display font-bold text-[13px] px-4 py-2.5 rounded-full hover:bg-brand-deep transition-colors">
                <IRoute size={15} /> Traçar rota
              </a>
              <a href={whatsLink(loc.whatsapp, "Olá! Estou a caminho da loja.")} target="_blank" rel="noreferrer" onClick={() => track("click_whatsapp", { from: "location" })} className="inline-flex items-center gap-2 border-[1.5px] border-leaf/40 text-leaf-deep font-display font-bold text-[13px] px-4 py-2.5 rounded-full hover:bg-leaf hover:text-white transition-colors">
                <IWhatsApp size={15} /> Avisar que estou indo
              </a>
            </div>
          </Reveal>

          <Reveal delay={100} className="bg-white border border-line rounded-[22px] rounded-bl-[6px] p-6">
            <h2 className="font-display font-bold text-ink text-lg flex items-center gap-2.5"><IClock size={19} className="text-brand" /> Horários</h2>
            <ul className="mt-4 grid gap-1.5">
              {[1, 2, 3, 4, 5, 6, 0].map((d) => {
                const h = loc.hours[d];
                const isToday = new Date().getDay() === d;
                return (
                  <li key={d} className={`flex justify-between text-[14px] rounded-full px-3 py-1.5 ${isToday ? "bg-sand/80 font-bold" : ""}`}>
                    <span className={isToday ? "text-bark" : "text-fog"}>{DAYS[d]}{isToday && " · hoje"}</span>
                    <span className={`font-display font-bold ${h ? "text-ink" : "text-coral"}`}>{h ? `${h.open} – ${h.close}` : "Fechado"}</span>
                  </li>
                );
              })}
            </ul>
          </Reveal>

          <Reveal delay={180} className="bg-bark text-cream rounded-[22px] rounded-bl-[6px] p-6">
            <p className="font-display font-bold text-[15px]">Delivery na região</p>
            <p className="text-cream/70 text-[13.5px] mt-1.5">{business.delivery.note}</p>
            <p className="mt-3 text-[13px] font-display font-bold text-mint">Taxa {business.delivery.fee.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} · grátis acima de {business.delivery.freeAbove.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
          </Reveal>
        </div>
      </div>

      <Reveal className="mt-14"><TrustStrip /></Reveal>
    </main>
  );
}
