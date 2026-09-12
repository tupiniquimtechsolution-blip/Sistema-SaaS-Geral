import { useState } from "react";
import { Link } from "react-router-dom";
import { assets } from "../config/assets";
import { business } from "../config/business";
import { MaskLines, Reveal, track, waLink } from "../lib/motion";
import { QuoteWizard } from "../components/QuoteWizard";
import {
  IconArrowRight,
  IconArrowUpRight,
  IconInstagram,
  IconMail,
  IconPhone,
  IconPin,
  IconWhatsApp,
  SectionTag,
} from "../components/ui";

function PageShell({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: React.ReactNode[];
  children: React.ReactNode;
}) {
  return (
    <div className="bg-coal-950">
      <header className="blueprint-grid relative overflow-hidden pt-36 pb-14 md:pt-44 md:pb-16">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-coal-950" />
        <div className="relative mx-auto max-w-[1440px] px-5 md:px-8">
          <nav aria-label="Breadcrumb" className="font-mono text-[0.62rem] tracking-[0.25em] text-steel-500 uppercase">
            <Link to="/" className="hover:text-ember-400">Início</Link> <span className="text-ember-500">/</span>{" "}
            <span className="text-steel-300">{kicker}</span>
          </nav>
          <h1 className="font-display mt-6 max-w-[20ch] text-[clamp(2.6rem,7vw,5.5rem)] leading-[0.95] uppercase">
            <MaskLines lines={title} />
          </h1>
        </div>
      </header>
      {children}
    </div>
  );
}

/* ================= SOBRE ================= */

export function AboutPage() {
  return (
    <PageShell
      kicker="Sobre"
      title={[
        <span key="1" className="text-paper-100">Oficina de</span>,
        <span key="2" className="text-paper-100">
          metal <em className="text-ember-500 not-italic">&amp;</em> <span className="text-stroke">arte</span>.
        </span>,
      ]}
    >
      <section className="bg-coal-950 pb-20 md:pb-28">
        <div className="mx-auto max-w-[1440px] px-5 md:px-8">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)] lg:gap-20">
            <div>
              <Reveal>
                <p className="text-lg leading-relaxed text-steel-300">
                  A <strong className="font-semibold text-paper-100">Metal &amp; Art</strong> nasceu do ofício:
                  serralheria de bancada, solda bem feita e peça entregue
                  funcionando. Hoje atendemos residências, condomínios e
                  empresas de São Paulo com o mesmo critério de oficina —
                  só que com processo, medição e acabamento de projeto.
                </p>
              </Reveal>
              <Reveal delay={0.08}>
                <p className="mt-5 leading-relaxed text-steel-400">
                  Nosso trabalho cobre o ciclo completo: entender a necessidade,
                  medir no local, fabricar ou reparar na oficina, dar acabamento
                  e instalar testando cada movimento. Portão que abre leve,
                  grade bem fixada, corrimão firme, porta de enrolar que sobe
                  sem brigar — é isso que entregamos.
                </p>
              </Reveal>
              <Reveal delay={0.14}>
                <div className="border-coal-700 mt-8 grid gap-px border bg-coal-700 sm:grid-cols-2">
                  {[
                    ["Fabricação", "Peças sob medida saindo da própria oficina"],
                    ["Reparo", "Diagnóstico honesto: reformar antes de trocar"],
                    ["Instalação", "Nível, prumo e funcionamento testados"],
                    ["Atendimento", "Conversa direta com quem executa"],
                  ].map(([t, d]) => (
                    <div key={t} className="bg-coal-950 p-6">
                      <h3 className="font-display text-xl tracking-[0.03em] text-ember-500 uppercase">{t}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-steel-400">{d}</p>
                    </div>
                  ))}
                </div>
              </Reveal>
              <Reveal className="mt-10 flex flex-wrap gap-4">
                <Link
                  to="/orcamento"
                  className="btn-press bg-ember-500 hover:bg-weld-400 font-display inline-flex items-center gap-3 px-6 py-3.5 text-base tracking-[0.06em] text-coal-950 uppercase"
                >
                  Pedir orçamento <IconArrowRight className="h-4.5 w-4.5" />
                </Link>
                <Link
                  to="/projetos"
                  className="btn-press border-coal-600 hover:border-ember-500 hover:text-ember-400 font-display inline-flex items-center gap-2 border px-6 py-3.5 text-base tracking-[0.06em] text-paper-100 uppercase"
                >
                  Ver projetos <IconArrowUpRight className="h-4.5 w-4.5" />
                </Link>
              </Reveal>
            </div>
            <div className="grid content-start gap-5 sm:grid-cols-2">
              <img src={assets.workshop.fabrication} alt="Trabalho de corte e solda na oficina" className="border-coal-600 aspect-[3/4] w-full border object-cover" />
              <img src={assets.gates.sliding} alt="Portão entregue e instalado" loading="lazy" className="border-coal-600 aspect-[3/4] w-full translate-y-8 border object-cover" />
              <img src={assets.automation.motor} alt="Automação instalada em portão" loading="lazy" className="border-coal-600 aspect-[3/4] w-full border object-cover" />
              <img src={assets.railings.handrail} alt="Corrimão instalado em escada" loading="lazy" className="border-coal-600 aspect-[3/4] w-full translate-y-8 border object-cover" />
            </div>
          </div>

          <div className="border-coal-700 mt-20 border-t pt-10">
            <SectionTag index="+" label="Onde estamos" />
            <div className="mt-6 flex flex-col gap-4 text-steel-300 md:flex-row md:items-center md:justify-between">
              <p className="flex items-start gap-3 leading-relaxed">
                <IconPin className="mt-1 h-5 w-5 shrink-0 text-ember-500" />
                {business.address.street} — {business.address.region}, {business.address.city}/
                {business.address.state} · CEP {business.address.zip} ·{" "}
                {business.serviceAreas.join(" · ")}
              </p>
              <a
                href={business.mapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("rota_maps_sobre")}
                className="btn-press border-coal-600 hover:border-ember-500 hover:text-ember-400 font-display inline-flex w-fit items-center gap-3 border px-6 py-3.5 text-base tracking-[0.06em] text-paper-100 uppercase"
              >
                Traçar rota <IconArrowUpRight className="h-4.5 w-4.5" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

/* ================= CONTATO ================= */

export function ContactPage() {
  const [nome, setNome] = useState("");
  const [msg, setMsg] = useState("");
  const canSend = nome.trim().length >= 2 && msg.trim().length >= 5;

  return (
    <PageShell
      kicker="Contato"
      title={[
        <span key="1" className="text-paper-100">Fale com</span>,
        <span key="2" className="text-paper-100">
          a <em className="text-ember-500 not-italic">oficina</em>.
        </span>,
      ]}
    >
      <section className="bg-coal-950 pb-20 md:pb-28">
        <div className="mx-auto max-w-[1440px] px-5 md:px-8">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
            <div>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    icon: IconWhatsApp,
                    t: "WhatsApp",
                    d: business.phoneDisplay,
                    href: waLink(business.whatsappDigits, "Olá, Metal & Art! Vim pelo site."),
                    ev: "whatsapp_contato",
                  },
                  {
                    icon: IconPhone,
                    t: "Telefone",
                    d: business.phoneDisplay,
                    href: `tel:+55${business.whatsappDigits.slice(2)}`,
                    ev: "telefone_contato",
                  },
                  {
                    icon: IconMail,
                    t: "E-mail",
                    d: business.email,
                    href: `mailto:${business.email}`,
                    ev: "email_contato",
                  },
                  {
                    icon: IconInstagram,
                    t: "Instagram",
                    d: business.instagram.handle,
                    href: business.instagram.url,
                    ev: "instagram_contato",
                  },
                ].map((c) => (
                  <a
                    key={c.t}
                    href={c.href}
                    target={c.href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    onClick={() => track(c.ev)}
                    className="btn-press border-coal-600 hover:border-ember-500 group border bg-coal-900/70 p-5"
                  >
                    <c.icon className="h-6 w-6 text-ember-500 transition-transform duration-300 group-hover:-translate-y-0.5" />
                    <p className="font-display mt-3 text-lg tracking-[0.03em] text-paper-100 uppercase">{c.t}</p>
                    <p className="mt-1 text-xs break-all text-steel-400">{c.d}</p>
                  </a>
                ))}
              </div>

              <div className="border-coal-700 mt-6 border bg-coal-900/70 p-6">
                <p className="flex items-start gap-3 text-sm leading-relaxed text-steel-300">
                  <IconPin className="mt-0.5 h-4.5 w-4.5 shrink-0 text-ember-500" />
                  {business.address.street} — {business.address.region}, {business.address.city}/
                  {business.address.state} · CEP {business.address.zip}
                </p>
                <p className="mt-4 text-xs leading-relaxed text-steel-500">{business.hoursNote}</p>
              </div>
            </div>

            <div className="border-coal-700 border bg-coal-900/70 p-7 md:p-10">
              <h2 className="font-display text-3xl tracking-[0.02em] text-paper-100 uppercase">Mande sua mensagem</h2>
              <p className="mt-2 text-sm text-steel-400">
                O site monta a mensagem e abre direto no nosso WhatsApp — sem cadastro, sem espera.
              </p>
              <div className="mt-7 grid gap-4">
                <label className="block">
                  <span className="font-mono mb-2 block text-[0.65rem] tracking-[0.2em] text-steel-400 uppercase">Seu nome</span>
                  <input type="text" autoComplete="name" className="field" placeholder="Como podemos te chamar?" value={nome} onChange={(e) => setNome(e.target.value)} />
                </label>
                <label className="block">
                  <span className="font-mono mb-2 block text-[0.65rem] tracking-[0.2em] text-steel-400 uppercase">O que você precisa?</span>
                  <textarea rows={5} className="field resize-y" placeholder="Descreva o serviço, o local e, se tiver, as medidas aproximadas…" value={msg} onChange={(e) => setMsg(e.target.value)} />
                </label>
                <a
                  href={canSend ? waLink(business.whatsappDigits, `Olá, Metal & Art! Aqui é ${nome}.\n\n${msg}`) : undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => canSend && track("whatsapp_form_contato")}
                  aria-disabled={!canSend}
                  className={
                    canSend
                      ? "btn-press bg-ember-500 hover:bg-weld-400 font-display flex items-center justify-center gap-3 px-6 py-4 text-base tracking-[0.06em] text-coal-950 uppercase"
                      : "font-display pointer-events-none flex items-center justify-center gap-3 border border-coal-600 px-6 py-4 text-base tracking-[0.06em] text-steel-500 uppercase"
                  }
                >
                  <IconWhatsApp className="h-4.5 w-4.5" /> Continuar no WhatsApp
                </a>
                <p className="text-xs leading-relaxed text-steel-500">
                  Nada é armazenado pelo site: seus dados vão apenas para a conversa no WhatsApp.
                  Se preferir, ligue para {business.phoneDisplay}.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

/* ================= ORÇAMENTO ================= */

export function QuotePage() {
  return (
    <div className="bg-coal-950 pt-24 md:pt-28">
      <QuoteWizard />
    </div>
  );
}

/* ================= PRIVACIDADE ================= */

export function PrivacyPage() {
  return (
    <PageShell
      kicker="Privacidade"
      title={[<span key="1" className="text-paper-100">Política de privacidade.</span>]}
    >
      <section className="bg-coal-950 pb-20 md:pb-28">
        <div className="mx-auto max-w-3xl px-5 md:px-8">
          <div className="border-coal-700 space-y-6 border bg-coal-900/70 p-8 leading-relaxed text-steel-300 md:p-10">
            <p>
              Este site <strong className="text-paper-100">não coleta, armazena ou transmite dados pessoais a servidores</strong>.
              Os formulários de orçamento e contato apenas montam uma mensagem com as
              informações que você digita e abrem a conversa no WhatsApp da Metal &amp; Art
              ({business.phoneDisplay}).
            </p>
            <p>
              Dados como nome, telefone e detalhes do serviço são enviados somente para o
              atendimento da empresa, com a finalidade exclusiva de responder ao seu pedido
              de orçamento ou dúvida.
            </p>
            <p>
              O site pode usar armazenamento local do navegador (como sessionStorage) apenas
              para melhorar a experiência — por exemplo, não repetir a animação de abertura
              na mesma sessão. Nenhum dado pessoal é gravado.
            </p>
            <p>
              Métricas de uso, quando ativadas, são anônimas e servem apenas para entender
              quais conteúdos são úteis. Você pode solicitar a exclusão de qualquer conversa
              ou dado diretamente pelo WhatsApp ou e-mail {business.email}.
            </p>
            <p className="font-mono text-[0.68rem] tracking-[0.15em] text-steel-500 uppercase">
              Dúvidas: {business.email}
            </p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
