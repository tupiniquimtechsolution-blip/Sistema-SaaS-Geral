import { useState } from "react";
import { BUSINESS } from "../config/business";
import { IMPLEMENTS, MACHINES } from "../data/machines";
import { cx, financeMessage, generalMessage, tradeMessage, usePageMeta, waLink } from "../lib/utils";
import { Btn, IcArrow, IcDoc, IcPhone, IcPin, IcSearch, IcTractor, IcWhatsApp, IcWrench, Kicker, Reveal, SectionHead } from "../components/ui";

const inputCls =
  "w-full border border-line-dark bg-coal-800 px-4 py-3 text-[15px] text-bone-100 placeholder:text-steel-500 transition-colors focus:border-hz-400 focus:outline-none";
const labelCls = "mb-1.5 block font-cond text-[12px] font-bold uppercase tracking-[0.18em] text-steel-300";

function FormShell({ kicker, title, lead, children }: { kicker: string; title: React.ReactNode; lead: string; children: React.ReactNode }) {
  return (
    <div className="pt-[120px] lg:pt-[150px]">
      <header className="border-b border-line-dark bg-coal-900">
        <div className="hazard-thin h-1.5 w-full opacity-60" aria-hidden="true" />
        <div className="mx-auto max-w-(--container-site) px-6 py-14">
          <Reveal><Kicker>{kicker}</Kicker></Reveal>
          <Reveal delay={80}><h1 className="mt-3 max-w-3xl font-display text-[clamp(2.2rem,5.5vw,4rem)] uppercase leading-[0.95]">{title}</h1></Reveal>
          <Reveal delay={160}><p className="mt-4 max-w-2xl text-lg text-steel-300">{lead}</p></Reveal>
        </div>
      </header>
      <div className="mx-auto max-w-(--container-site) px-6 py-14">{children}</div>
    </div>
  );
}

/* =============== /orcamento — pedido para frota =============== */

export function FinancingPage() {
  usePageMeta(`Orçamento para frota — ${BUSINESS.name}`, "Condição especial para pedidos fechados e frotas de rolos compactadores. Orçamento sem compromisso pelo WhatsApp.");
  const [f, setF] = useState({ nome: "", telefone: "", rolo: "", pecas: "", cidade: "", mensagem: "" });
  const [error, setError] = useState("");

  const submit = () => {
    if (!f.nome.trim() || !f.telefone.trim() || !f.pecas.trim()) {
      setError("Preencha ao menos nome, telefone e a lista de peças.");
      return;
    }
    window.open(waLink(BUSINESS.whatsapp, financeMessage(f)), "_blank", "noopener");
  };

  return (
    <FormShell
      kicker="Pedido fechado"
      title={<>Orçamento para <span className="text-hz-400">frota & usina</span></>}
      lead="Opera vários rolos ou mantém usina de asfalto? Mande a lista de peças e receba condição para pedido fechado — sem simulação de taxa, sem letra miúda: preço de balcão."
    >
      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <Reveal>
          <div className="border border-line-dark bg-coal-900 p-7 md:p-9">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="o-nome" className={labelCls}>Nome *</label>
                <input id="o-nome" className={inputCls} value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} placeholder="Seu nome" />
              </div>
              <div>
                <label htmlFor="o-tel" className={labelCls}>Telefone / WhatsApp *</label>
                <input id="o-tel" className={inputCls} value={f.telefone} onChange={(e) => setF({ ...f, telefone: e.target.value })} placeholder="(11) 9…" />
              </div>
              <div>
                <label htmlFor="o-cidade" className={labelCls}>Cidade / UF</label>
                <input id="o-cidade" className={inputCls} value={f.cidade} onChange={(e) => setF({ ...f, cidade: e.target.value })} placeholder="Onde a frota opera" />
              </div>
              <div>
                <label htmlFor="o-rolo" className={labelCls}>Rolos na frota</label>
                <input id="o-rolo" className={inputCls} value={f.rolo} onChange={(e) => setF({ ...f, rolo: e.target.value })} placeholder="Ex.: 2× CA250, 1× Hamm 3410" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="o-pecas" className={labelCls}>Lista de peças *</label>
                <textarea id="o-pecas" rows={5} className={inputCls} value={f.pecas} onChange={(e) => setF({ ...f, pecas: e.target.value })} placeholder={"Uma por linha. Ex.:\n2× bomba de vibração CA250\n4× filtro de ar CA150\n1× jogo de duocones"} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="o-msg" className={labelCls}>Detalhes</label>
                <textarea id="o-msg" rows={3} className={inputCls} value={f.mensagem} onChange={(e) => setF({ ...f, mensagem: e.target.value })} placeholder="Prazo, condição de pagamento, urgência…" />
              </div>
            </div>
            {error && <p className="mt-4 font-cond text-[13px] font-bold uppercase tracking-[0.1em] text-safety-400" role="alert">{error}</p>}
            <div className="mt-6 flex flex-wrap gap-3">
              <Btn onClick={submit} size="lg">Enviar pelo WhatsApp <IcWhatsApp size={16} /></Btn>
              <Btn to="/pecas" tone="outline" size="lg">Ver peças antes <IcArrow size={15} /></Btn>
            </div>
            <p className="mt-4 text-[12px] text-steel-500">O formulário abre seu WhatsApp com a lista já estruturada — você revisa antes de enviar.</p>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <aside className="space-y-5">
            <div className="border border-agri-500/40 bg-coal-900 p-6">
              <IcWrench size={26} className="text-agri-300" />
              <h3 className="mt-3 font-display text-2xl uppercase">Por que pedido fechado?</h3>
              <ul className="mt-3 space-y-2 text-[14px] leading-relaxed text-steel-300">
                <li className="flex gap-2.5"><span className="mt-2 h-[2px] w-4 shrink-0 bg-agri-400" />Condição melhor que peça avulsa</li>
                <li className="flex gap-2.5"><span className="mt-2 h-[2px] w-4 shrink-0 bg-agri-400" />Um frete só para tudo</li>
                <li className="flex gap-2.5"><span className="mt-2 h-[2px] w-4 shrink-0 bg-agri-400" />Separamos o estoque por contrato</li>
              </ul>
            </div>
            <div className="border border-line-dark bg-coal-900 p-6">
              <IcDoc size={26} className="text-hz-300" />
              <h3 className="mt-3 font-display text-2xl uppercase">Fale direto</h3>
              <p className="mt-2 text-[14px] text-steel-300">Prefere voz? Liga no fixo que a mesa de orçamentos atende:</p>
              <a href={`tel:+${BUSINESS.phoneRaw}`} className="mt-3 block font-cond text-xl font-bold text-hz-300 hover:underline">{BUSINESS.phoneDisplay}</a>
              <p className="mt-1 font-cond text-[12px] uppercase tracking-[0.18em] text-steel-500">{BUSINESS.hours[0].days} · {BUSINESS.hours[0].time}</p>
            </div>
          </aside>
        </Reveal>
      </div>
    </FormShell>
  );
}

/* =============== /busca — não achou a peça =============== */

export function TradeInPage() {
  usePageMeta(`Não achou a peça? — ${BUSINESS.name}`, "Mais de 30.000 itens no estoque físico. Mande o código OEM ou uma foto da peça e a Lusomaq localiza para você.");
  const [f, setF] = useState({ nome: "", telefone: "", codigo: "", rolo: "", descricao: "" });
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState("");

  const submit = () => {
    if (!f.nome.trim() || !f.telefone.trim() || (!f.codigo.trim() && !f.descricao.trim())) {
      setError("Informe ao menos nome, telefone e o código ou uma descrição da peça.");
      return;
    }
    window.open(waLink(BUSINESS.whatsapp, tradeMessage({ ...f, fotos: photos.length })), "_blank", "noopener");
  };

  return (
    <FormShell
      kicker="Caça-peças"
      title={<>Não achou a peça? <span className="text-hz-400">A gente acha.</span></>}
      lead="O site mostra só uma amostra — são mais de 30.000 itens no estoque físico. Mande o código OEM, o modelo do rolo ou uma foto da peça velha que nossa equipe localiza."
    >
      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <Reveal>
          <div className="border border-line-dark bg-coal-900 p-7 md:p-9">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="b-nome" className={labelCls}>Nome *</label>
                <input id="b-nome" className={inputCls} value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} placeholder="Seu nome" />
              </div>
              <div>
                <label htmlFor="b-tel" className={labelCls}>Telefone / WhatsApp *</label>
                <input id="b-tel" className={inputCls} value={f.telefone} onChange={(e) => setF({ ...f, telefone: e.target.value })} placeholder="(11) 9…" />
              </div>
              <div>
                <label htmlFor="b-cod" className={labelCls}>Código OEM / referência</label>
                <input id="b-cod" className={inputCls} value={f.codigo} onChange={(e) => setF({ ...f, codigo: e.target.value })} placeholder="Ex.: 4700268419" />
              </div>
              <div>
                <label htmlFor="b-rolo" className={labelCls}>Rolo / equipamento</label>
                <input id="b-rolo" className={inputCls} value={f.rolo} onChange={(e) => setF({ ...f, rolo: e.target.value })} placeholder="Ex.: Dynapac CA250 2012" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="b-desc" className={labelCls}>Descreva a peça *</label>
                <textarea id="b-desc" rows={4} className={inputCls} value={f.descricao} onChange={(e) => setF({ ...f, descricao: e.target.value })} placeholder="Onde vai, o que faz, medida aproximada…" />
              </div>
            </div>

            {/* fotos */}
            <div className="mt-5">
              <p className={labelCls}>Fotos da peça (frente, lateral, código gravado)</p>
              <label className="grid cursor-pointer place-items-center border border-dashed border-steel-500 bg-coal-950/60 px-6 py-8 text-center transition-colors hover:border-hz-400">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={(e) => {
                    const files = Array.from(e.target.files ?? []);
                    setPhotos((p) => [...p, ...files.map((file) => URL.createObjectURL(file))].slice(0, 8));
                  }}
                />
                <IcSearch size={26} className="text-hz-300" />
                <span className="mt-2 font-cond text-[13px] font-bold uppercase tracking-[0.18em] text-bone-100">Escolher fotos (até 8)</span>
                <span className="mt-1 text-[12px] text-steel-500">Use-as como referência — depois anexe no WhatsApp</span>
              </label>
              {photos.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {photos.map((p, i) => (
                    <img key={i} src={p} alt={`Foto da peça ${i + 1}`} className="h-16 w-16 border border-line-dark object-cover" />
                  ))}
                </div>
              )}
              <p className="mt-2 text-[12px] text-steel-500">
                Como não temos upload direto no site ainda, envie as fotos na conversa do WhatsApp que vai abrir — leva 2 segundos.
              </p>
            </div>

            {error && <p className="mt-4 font-cond text-[13px] font-bold uppercase tracking-[0.1em] text-safety-400" role="alert">{error}</p>}
            <div className="mt-6">
              <Btn onClick={submit} size="lg">Procurar minha peça <IcWhatsApp size={16} /></Btn>
            </div>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <aside className="space-y-5">
            <div className="border border-line-dark bg-coal-900 p-6">
              <IcTractor size={26} className="text-hz-300" />
              <h3 className="mt-3 font-display text-2xl uppercase">Como funciona</h3>
              <ol className="mt-3 space-y-3 text-[14px] leading-relaxed text-steel-300">
                <li><strong className="font-cond text-bone-100">1.</strong> Você manda código, descrição ou foto;</li>
                <li><strong className="font-cond text-bone-100">2.</strong> A equipe confere no estoque físico (30.000+ itens);</li>
                <li><strong className="font-cond text-bone-100">3.</strong> Você recebe preço e prazo no WhatsApp;</li>
                <li><strong className="font-cond text-bone-100">4.</strong> Fechou? A peça sai no próximo despacho.</li>
              </ol>
            </div>
            <div className="border border-hz-500/40 bg-coal-900 p-6">
              <h3 className="font-display text-2xl uppercase">Dica de balcão</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-steel-300">
                Peça com código gravado é localizada mais rápido. Foto do horímetro e da plaqueta do rolo também ajuda a fechar a aplicação.
              </p>
            </div>
          </aside>
        </Reveal>
      </div>
    </FormShell>
  );
}

/* =============== /contato =============== */

export function ContactPage() {
  usePageMeta(`Contato & localização — ${BUSINESS.name}`, `Fale com a ${BUSINESS.name}: WhatsApp, telefone e e-mail. Rua Sapucaia, 26 — Alto da Mooca, São Paulo/SP. Seg a sex, 8h às 18h.`);

  return (
    <div className="pt-[120px] lg:pt-[150px]">
      <header className="border-b border-line-dark bg-coal-900">
        <div className="hazard-thin h-1.5 w-full opacity-60" aria-hidden="true" />
        <div className="mx-auto max-w-(--container-site) px-6 py-14">
          <Reveal><Kicker>Balcão, telefone e WhatsApp</Kicker></Reveal>
          <Reveal delay={80}>
            <h1 className="mt-3 font-display text-[clamp(2.2rem,5.5vw,4rem)] uppercase leading-[0.95]">
              Fale com um <span className="text-hz-400">especialista</span>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-4 max-w-2xl text-lg text-steel-300">
              {BUSINESS.team.length - 1} atendentes dedicados no WhatsApp, telefone fixo e e-mail. Resposta em horário comercial.
            </p>
          </Reveal>
        </div>
      </header>

      <div className="mx-auto max-w-(--container-site) px-6 py-14">
        {/* equipe */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {BUSINESS.team.map((t, i) => (
            <Reveal key={t.whatsapp} delay={i * 80}>
              <a
                href={waLink(t.whatsapp, generalMessage())}
                target="_blank"
                rel="noreferrer"
                className="group flex h-full flex-col border border-line-dark bg-coal-900 p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-steel-500 hover:shadow-plate"
              >
                <span className={cx("grid h-14 w-14 place-items-center font-display text-xl uppercase", i === 0 ? "bg-hz-400 text-coal-950" : "bg-coal-700 text-bone-100")}>
                  {t.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </span>
                <h3 className="mt-4 font-display text-xl uppercase">{t.name}</h3>
                <p className="mt-1 font-cond text-[12px] font-semibold uppercase tracking-[0.18em] text-steel-400">{t.role}</p>
                <p className="mt-auto pt-4 font-cond text-[15px] font-bold text-hz-300 transition-colors group-hover:text-hz-400">{t.phoneDisplay}</p>
                <span className="mt-1 inline-flex items-center gap-2 font-cond text-[12px] font-bold uppercase tracking-[0.16em] text-agri-300">
                  <IcWhatsApp size={14} /> Chamar no WhatsApp
                </span>
              </a>
            </Reveal>
          ))}
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          {/* dados */}
          <Reveal>
            <div className="h-full border border-line-dark bg-coal-900 p-7 md:p-9">
              <h2 className="font-display text-3xl uppercase">Informações<span className="text-hz-400">.</span></h2>
              <ul className="mt-6 space-y-5 text-[15px]">
                <li className="flex gap-4">
                  <IcPin size={20} className="mt-0.5 shrink-0 text-hz-300" />
                  <div>
                    <p className="font-cond text-[12px] font-bold uppercase tracking-[0.2em] text-steel-500">Endereço</p>
                    <p className="mt-1 text-bone-100">{BUSINESS.address.street}</p>
                    <p className="text-steel-300">{BUSINESS.address.city}/{BUSINESS.address.state} — CEP {BUSINESS.address.zip}</p>
                    <a href={BUSINESS.mapsLink} target="_blank" rel="noreferrer" className="mt-1 inline-block font-cond text-[13px] font-bold uppercase tracking-[0.16em] text-hz-300 hover:underline">
                      Traçar rota →
                    </a>
                  </div>
                </li>
                <li className="flex gap-4">
                  <IcPhone size={20} className="mt-0.5 shrink-0 text-hz-300" />
                  <div>
                    <p className="font-cond text-[12px] font-bold uppercase tracking-[0.2em] text-steel-500">Telefone fixo</p>
                    <a href={`tel:+${BUSINESS.phoneRaw}`} className="mt-1 block text-bone-100 hover:text-hz-300">{BUSINESS.phoneDisplay}</a>
                  </div>
                </li>
                <li className="flex gap-4">
                  <IcWhatsApp size={20} className="mt-0.5 shrink-0 text-hz-300" />
                  <div>
                    <p className="font-cond text-[12px] font-bold uppercase tracking-[0.2em] text-steel-500">WhatsApp</p>
                    <p className="mt-1 text-bone-100">{BUSINESS.whatsappDisplay} (principal)</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <IcDoc size={20} className="mt-0.5 shrink-0 text-hz-300" />
                  <div>
                    <p className="font-cond text-[12px] font-bold uppercase tracking-[0.2em] text-steel-500">E-mail</p>
                    <a href={`mailto:${BUSINESS.email}`} className="mt-1 block text-bone-100 hover:text-hz-300">{BUSINESS.email}</a>
                  </div>
                </li>
              </ul>
              <div className="mt-7 border-t border-line-dark pt-5">
                <p className="font-cond text-[12px] font-bold uppercase tracking-[0.2em] text-steel-500">Horário de atendimento</p>
                {BUSINESS.hours.map((h) => (
                  <p key={h.days} className="mt-1 flex justify-between gap-4 text-[14px]">
                    <span className="text-steel-300">{h.days}</span>
                    <span className="font-cond font-bold text-bone-100">{h.time}</span>
                  </p>
                ))}
              </div>
            </div>
          </Reveal>

          {/* mapa + fachada */}
          <Reveal delay={120}>
            <div className="flex h-full flex-col gap-6">
              <div className="min-h-[320px] flex-1 overflow-hidden border border-line-dark">
                <iframe
                  title={`Mapa — ${BUSINESS.name}`}
                  src={BUSINESS.mapsEmbed}
                  className="h-full min-h-[320px] w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
              <div className="relative overflow-hidden border border-line-dark">
                <img src="https://www.lusomaq.com.br/assets/predio-Dm1lldnl.jpg" alt={`Fachada da sede da ${BUSINESS.name} no Alto da Mooca`} loading="lazy" className="h-52 w-full object-cover" />
                <span className="absolute bottom-3 left-3 bg-coal-950/85 px-3 py-1.5 font-cond text-[12px] font-bold uppercase tracking-[0.18em] text-bone-100">
                  Nossa sede — Alto da Mooca
                </span>
              </div>
            </div>
          </Reveal>
        </div>

        {/* CTA */}
        <Reveal className="mt-14">
          <div className="flex flex-wrap items-center justify-between gap-6 border border-line-dark bg-coal-900 p-8">
            <div>
              <p className="font-cond text-[13px] font-bold uppercase tracking-[0.24em] text-hz-300">Pronto para cotar?</p>
              <h2 className="mt-2 font-display text-3xl uppercase">
                {IMPLEMENTS.length + MACHINES.filter((m) => m.status === "disponivel").length} itens no catálogo online — e 30.000+ no estoque
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Btn href={waLink(BUSINESS.whatsapp, generalMessage())} size="lg" tone="agri"><IcWhatsApp size={17} /> WhatsApp</Btn>
              <Btn to="/pecas" tone="outline" size="lg">Ver peças <IcArrow size={15} /></Btn>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
