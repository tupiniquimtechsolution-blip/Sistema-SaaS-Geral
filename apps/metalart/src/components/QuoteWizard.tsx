import { useState } from "react";
import { useLocation } from "react-router-dom";
import { business } from "../config/business";
import { cn, track, waLink } from "../lib/motion";
import {
  IconArrowRight,
  IconCamera,
  IconCheck,
  IconChevronL,
  IconWhatsApp,
  SectionTag,
} from "./ui";

type Answers = {
  servico: string;
  local: string;
  situacao: string;
  largura: string;
  altura: string;
  semMedidas: boolean;
  temFotos: boolean;
  regiao: string;
  nome: string;
  telefone: string;
};

const INITIAL: Answers = {
  servico: "",
  local: "",
  situacao: "",
  largura: "",
  altura: "",
  semMedidas: false,
  temFotos: true,
  regiao: "",
  nome: "",
  telefone: "",
};

const STEPS = [
  { key: "servico", title: "Qual o serviço?", sub: "Escolha o que você precisa" },
  { key: "local", title: "Tipo do local", sub: "Onde o serviço será feito" },
  { key: "situacao", title: "Qual a situação?", sub: "Estado atual do projeto" },
  { key: "medidas", title: "Medidas aproximadas", sub: "Se não souber, sem problema" },
  { key: "fotos", title: "Fotos do local", sub: "Fotos ajudam muito na avaliação" },
  { key: "regiao", title: "Onde você está?", sub: "CEP, bairro ou cidade" },
  { key: "contato", title: "Seus contatos", sub: "Para retornarmos o orçamento" },
] as const;

function OptionGrid({
  options,
  value,
  onPick,
}: {
  options: string[];
  value: string;
  onPick: (v: string) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map((o) => {
        const on = value === o;
        return (
          <button
            key={o}
            type="button"
            onClick={() => onPick(o)}
            aria-pressed={on}
            className={cn(
              "btn-press flex items-center justify-between gap-3 border px-4 py-4 text-left text-sm font-medium transition-colors",
              on
                ? "border-ember-500 bg-ember-500/12 text-paper-100"
                : "border-coal-600 text-steel-300 hover:border-steel-400 hover:text-paper-100"
            )}
          >
            {o}
            <span
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center border",
                on ? "border-ember-500 bg-ember-500 text-coal-950" : "border-coal-600"
              )}
            >
              {on && <IconCheck className="h-3.5 w-3.5" />}
            </span>
          </button>
        );
      })}
    </div>
  );
}

const SERVICO_OPTIONS = ["Portão", "Reforma", "Automação", "Grade", "Corrimão", "Guarda-corpo", "Porta de enrolar", "Estrutura metálica", "Outro"];

export function QuoteWizard() {
  const loc = useLocation();
  // Pré-seleção vinda da página de serviço (Link state)
  const preService = ((loc.state as { service?: string } | null)?.service ?? "").trim();
  const [step, setStep] = useState(0);
  const [a, setA] = useState<Answers>({
    ...INITIAL,
    servico: SERVICO_OPTIONS.includes(preService) ? preService : "",
  });
  const [copied, setCopied] = useState(false);
  const set = <K extends keyof Answers>(k: K, v: Answers[K]) => setA((p) => ({ ...p, [k]: v }));

  const canNext = (): boolean => {
    const k = STEPS[step].key;
    if (k === "servico") return a.servico !== "";
    if (k === "local") return a.local !== "";
    if (k === "situacao") return a.situacao !== "";
    if (k === "medidas") return a.semMedidas || (a.largura !== "" && a.altura !== "");
    if (k === "fotos") return true;
    if (k === "regiao") return a.regiao.trim().length >= 2;
    return a.nome.trim().length >= 2 && a.telefone.trim().length >= 8;
  };

  const medidas = a.semMedidas
    ? "não sei as medidas"
    : `Largura aprox.: ${a.largura} m · Altura aprox.: ${a.altura} m`;

  const message = [
    "Olá, Metal & Art!",
    "Vim pelo site e gostaria de solicitar um orçamento.",
    "",
    `Serviço: ${a.servico}`,
    `Local: ${a.local}`,
    `Situação: ${a.situacao}`,
    medidas,
    `Região: ${a.regiao}`,
    a.temFotos ? "" : null,
    a.temFotos ? "Tenho fotos para enviar." : "Ainda não tenho fotos.",
    "",
    `Nome: ${a.nome}`,
    `WhatsApp: ${a.telefone}`,
  ]
    .filter((l): l is string => l !== null)
    .join("\n");

  const isLast = step === STEPS.length - 1;

  const finish = () => {
    track("orcamento_concluido", { servico: a.servico, local: a.local });
    window.open(waLink(business.whatsappDigits, message), "_blank", "noopener,noreferrer");
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      /* clipboard indisponível */
    }
  };

  return (
    <section id="orcamento" className="blueprint-grid bg-coal-950 py-24 md:py-32">
      <div className="mx-auto max-w-[1440px] px-5 md:px-8">
        <SectionTag index="07" label="Orçamento guiado" />
        <h1 className="font-display mt-6 text-[clamp(2.4rem,6vw,4.8rem)] leading-[0.96] uppercase">
          Monte seu pedido <em className="text-ember-500 not-italic">de orçamento</em>.
        </h1>
        <p className="mt-5 max-w-2xl leading-relaxed text-steel-400">
          Sete passos rápidos. No final, o pedido vai pronto para o nosso
          WhatsApp — com as fotos, você fecha a avaliação ainda mais rápido.
        </p>

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)] lg:gap-16">
          {/* painel do passo */}
          <div className="border-coal-700 border bg-coal-900/70 p-6 md:p-10">
            {/* progresso: linha de solda */}
            <div className="mb-10">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[0.65rem] tracking-[0.25em] text-steel-400 uppercase">
                  Passo {step + 1} / {STEPS.length} — {STEPS[step].title}
                </p>
                <p className="font-mono text-[0.65rem] tracking-[0.25em] text-ember-500 uppercase">
                  {Math.round(((step + 1) / STEPS.length) * 100)}%
                </p>
              </div>
              <div className="bg-coal-700 relative mt-3 h-px">
                <div
                  className="absolute top-0 left-0 h-px bg-gradient-to-r from-ember-600 to-ember-500 transition-[width] duration-500"
                  style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                />
                <div
                  className="weld-dot bg-weld-400 absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-[left] duration-500"
                  style={{ left: `${((step + 1) / STEPS.length) * 100}%` }}
                />
              </div>
            </div>

            <h2 className="font-display text-3xl tracking-[0.02em] text-paper-100 uppercase md:text-4xl">
              {STEPS[step].title}
            </h2>
            <p className="font-mono mt-2 text-[0.68rem] tracking-[0.2em] text-steel-500 uppercase">
              {STEPS[step].sub}
            </p>

            <div className="mt-8">
              {STEPS[step].key === "servico" && (
                <OptionGrid
                  options={SERVICO_OPTIONS}
                  value={a.servico}
                  onPick={(v) => set("servico", v)}
                />
              )}
              {STEPS[step].key === "local" && (
                <OptionGrid
                  options={["Residência", "Condomínio", "Empresa", "Comércio", "Outro"]}
                  value={a.local}
                  onPick={(v) => set("local", v)}
                />
              )}
              {STEPS[step].key === "situacao" && (
                <OptionGrid
                  options={["Novo", "Reforma", "Reparo", "Manutenção"]}
                  value={a.situacao}
                  onPick={(v) => set("situacao", v)}
                />
              )}
              {STEPS[step].key === "medidas" && (
                <div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="font-mono mb-2 block text-[0.65rem] tracking-[0.2em] text-steel-400 uppercase">Largura (m)</span>
                      <input
                        type="number"
                        min={0}
                        step="0.05"
                        inputMode="decimal"
                        placeholder="ex.: 3,20"
                        className="field"
                        value={a.largura}
                        disabled={a.semMedidas}
                        onChange={(e) => set("largura", e.target.value)}
                      />
                    </label>
                    <label className="block">
                      <span className="font-mono mb-2 block text-[0.65rem] tracking-[0.2em] text-steel-400 uppercase">Altura (m)</span>
                      <input
                        type="number"
                        min={0}
                        step="0.05"
                        inputMode="decimal"
                        placeholder="ex.: 2,10"
                        className="field"
                        value={a.altura}
                        disabled={a.semMedidas}
                        onChange={(e) => set("altura", e.target.value)}
                      />
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => set("semMedidas", !a.semMedidas)}
                    aria-pressed={a.semMedidas}
                    className={cn(
                      "btn-press mt-5 flex items-center gap-3 border px-4 py-3 text-sm",
                      a.semMedidas ? "border-ember-500 bg-ember-500/12 text-paper-100" : "border-coal-600 text-steel-300"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 items-center justify-center border",
                        a.semMedidas ? "border-ember-500 bg-ember-500 text-coal-950" : "border-coal-600"
                      )}
                    >
                      {a.semMedidas && <IconCheck className="h-3.5 w-3.5" />}
                    </span>
                    Não sei as medidas — medimos no local
                  </button>
                </div>
              )}
              {STEPS[step].key === "fotos" && (
                <div className="border-coal-600 border bg-coal-850 p-6">
                  <div className="flex items-start gap-4">
                    <IconCamera className="h-8 w-8 shrink-0 text-ember-500" />
                    <p className="text-sm leading-relaxed text-steel-300">
                      O envio das fotos acontece direto na conversa do WhatsApp
                      — é o jeito mais rápido de avaliarmos o seu caso. Ao
                      finalizar, a mensagem abre pronta e você só anexa as
                      imagens lá.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => set("temFotos", !a.temFotos)}
                    aria-pressed={a.temFotos}
                    className={cn(
                      "btn-press mt-5 flex items-center gap-3 border px-4 py-3 text-sm",
                      a.temFotos ? "border-ember-500 bg-ember-500/12 text-paper-100" : "border-coal-600 text-steel-300"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 items-center justify-center border",
                        a.temFotos ? "border-ember-500 bg-ember-500 text-coal-950" : "border-coal-600"
                      )}
                    >
                      {a.temFotos && <IconCheck className="h-3.5 w-3.5" />}
                    </span>
                    Tenho fotos para enviar pelo WhatsApp
                  </button>
                </div>
              )}
              {STEPS[step].key === "regiao" && (
                <label className="block max-w-lg">
                  <span className="font-mono mb-2 block text-[0.65rem] tracking-[0.2em] text-steel-400 uppercase">
                    CEP, bairro ou cidade
                  </span>
                  <input
                    type="text"
                    placeholder="ex.: Itaquera — São Paulo"
                    className="field"
                    value={a.regiao}
                    onChange={(e) => set("regiao", e.target.value)}
                  />
                  <span className="mt-2 block text-xs text-steel-500">
                    Atendemos {business.serviceAreas.join(" e ")} — outras regiões sob consulta.
                  </span>
                </label>
              )}
              {STEPS[step].key === "contato" && (
                <div className="grid max-w-lg gap-4">
                  <label className="block">
                    <span className="font-mono mb-2 block text-[0.65rem] tracking-[0.2em] text-steel-400 uppercase">Nome</span>
                    <input
                      type="text"
                      autoComplete="name"
                      placeholder="Seu nome"
                      className="field"
                      value={a.nome}
                      onChange={(e) => set("nome", e.target.value)}
                    />
                  </label>
                  <label className="block">
                    <span className="font-mono mb-2 block text-[0.65rem] tracking-[0.2em] text-steel-400 uppercase">WhatsApp</span>
                    <input
                      type="tel"
                      autoComplete="tel"
                      inputMode="tel"
                      placeholder="(11) 9XXXX-XXXX"
                      className="field"
                      value={a.telefone}
                      onChange={(e) => set("telefone", e.target.value)}
                    />
                  </label>
                  <p className="text-xs leading-relaxed text-steel-500">
                    Usamos esses dados apenas para retornar seu orçamento. Nada
                    é armazenado pelo site — a conversa acontece no WhatsApp.
                  </p>
                </div>
              )}
            </div>

            {/* navegação */}
            <div className="border-coal-700 mt-10 flex items-center justify-between border-t pt-6">
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className={cn(
                  "btn-press font-mono inline-flex items-center gap-2 text-[0.7rem] tracking-[0.22em] uppercase",
                  step === 0 ? "cursor-not-allowed text-coal-600" : "text-steel-300 hover:text-paper-100"
                )}
              >
                <IconChevronL className="h-4 w-4" /> Voltar
              </button>
              {!isLast ? (
                <button
                  type="button"
                  onClick={() => canNext() && setStep((s) => s + 1)}
                  aria-disabled={!canNext()}
                  className={cn(
                    "btn-press font-display inline-flex items-center gap-3 px-6 py-3.5 text-base tracking-[0.06em] uppercase",
                    canNext()
                      ? "bg-ember-500 text-coal-950 hover:bg-weld-400"
                      : "cursor-not-allowed border border-coal-600 text-steel-500"
                  )}
                >
                  Continuar <IconArrowRight className="h-4.5 w-4.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={finish}
                  disabled={!canNext()}
                  className={cn(
                    "btn-press font-display inline-flex items-center gap-3 px-6 py-3.5 text-base tracking-[0.06em] uppercase",
                    canNext()
                      ? "bg-[#123524] text-[#7BE3AC] hover:bg-[#1a4a32]"
                      : "cursor-not-allowed border border-coal-600 text-steel-500"
                  )}
                >
                  <IconWhatsApp className="h-4.5 w-4.5" /> Enviar pelo WhatsApp
                </button>
              )}
            </div>
          </div>

          {/* resumo lateral */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <p className="font-mono text-[0.65rem] tracking-[0.3em] text-steel-500 uppercase">Resumo do pedido</p>
            <div className="border-coal-700 mt-4 divide-y divide-coal-700 border bg-coal-900/70">
              {[
                ["Serviço", a.servico],
                ["Local", a.local],
                ["Situação", a.situacao],
                ["Medidas", a.semMedidas ? "medimos no local" : a.largura && a.altura ? `${a.largura} × ${a.altura} m` : ""],
                ["Fotos", a.temFotos ? "enviarei no WhatsApp" : "sem fotos por enquanto"],
                ["Região", a.regiao],
                ["Contato", a.nome],
              ].map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-4 px-4 py-3">
                  <span className="font-mono text-[0.62rem] tracking-[0.2em] text-steel-500 uppercase">{k}</span>
                  <span className={cn("text-right text-sm", v ? "text-paper-100" : "text-coal-600")}>{v || "—"}</span>
                </div>
              ))}
            </div>

            <div className="border-coal-700 mt-6 border bg-coal-950 p-4">
              <p className="font-mono text-[0.6rem] tracking-[0.25em] text-steel-500 uppercase">Prévia da mensagem</p>
              <pre className="mt-3 max-h-56 overflow-auto font-mono text-[0.7rem] leading-relaxed whitespace-pre-wrap text-steel-300">
                {message}
              </pre>
              <button
                type="button"
                onClick={copy}
                className="btn-press border-coal-600 hover:border-ember-500 hover:text-ember-400 font-mono mt-3 w-full border px-3 py-2 text-[0.62rem] tracking-[0.22em] text-steel-300 uppercase"
              >
                {copied ? "✓ Copiado" : "Copiar mensagem"}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
