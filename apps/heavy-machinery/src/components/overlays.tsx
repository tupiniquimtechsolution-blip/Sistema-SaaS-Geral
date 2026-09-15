import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { BUSINESS } from "../config/business";
import { CATEGORY_META, IMPLEMENTS, MACHINES } from "../data/machines";
import type { Implement, Machine } from "../data/machines";
import { cx, formatBRL, machineMessage, quoteMessage, waLink } from "../lib/utils";
import { useApp } from "../store/AppStore";
import { Btn, IcArrow, IcChevronL, IcChevronR, IcScale, IcWhatsApp, IcX } from "./ui";

function useEscape(active: boolean, onClose: () => void) {
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, onClose]);
}

function useBodyLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [active]);
}

/* ================= Lightbox ================= */

export function Lightbox({ images, index, onClose, onIndex, title }: { images: string[]; index: number; onClose: () => void; onIndex: (i: number) => void; title: string }) {
  useEscape(true, onClose);
  useBodyLock(true);
  const touchX = useRef<number | null>(null);

  const prev = () => onIndex((index - 1 + images.length) % images.length);
  const next = () => onIndex((index + 1) % images.length);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, images.length]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Galeria — ${title}`}
      className="fixed inset-0 z-[90] flex flex-col bg-coal-950/97 backdrop-blur-sm"
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current == null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (dx > 48) prev();
        if (dx < -48) next();
        touchX.current = null;
      }}
    >
      <div className="flex items-center justify-between px-5 py-4">
        <p className="font-cond text-[13px] font-bold uppercase tracking-[0.22em] text-steel-300">
          {title} — <span className="text-hz-300">{index + 1}/{images.length}</span>
        </p>
        <button onClick={onClose} className="grid h-11 w-11 place-items-center border border-line-dark text-bone-100 transition-colors hover:border-safety-400 hover:text-safety-400" aria-label="Fechar galeria">
          <IcX size={20} />
        </button>
      </div>
      <div className="relative flex flex-1 items-center justify-center px-16 pb-8">
        <button onClick={prev} aria-label="Foto anterior" className="absolute left-4 z-10 grid h-12 w-12 place-items-center border border-line-dark bg-coal-950/70 text-bone-100 transition-colors hover:border-hz-400 hover:text-hz-300">
          <IcChevronL size={22} />
        </button>
        <img src={images[index]} alt={`${title} — foto ${index + 1}`} className="max-h-full max-w-full object-contain bg-white p-4" />
        <button onClick={next} aria-label="Próxima foto" className="absolute right-4 z-10 grid h-12 w-12 place-items-center border border-line-dark bg-coal-950/70 text-bone-100 transition-colors hover:border-hz-400 hover:text-hz-300">
          <IcChevronR size={22} />
        </button>
      </div>
    </div>
  );
}

/* ================= Modal de orçamento ================= */

const inputCls =
  "w-full border border-line-dark bg-coal-800 px-4 py-3 text-[15px] text-bone-100 placeholder:text-steel-500 transition-colors focus:border-hz-400 focus:outline-none";
const labelCls = "mb-1.5 block font-cond text-[12px] font-bold uppercase tracking-[0.18em] text-steel-300";

export function QuoteModal() {
  const { quoteMachine, quoteLabel, closeQuote } = useApp();
  const open = quoteMachine !== null || quoteLabel !== "";
  useEscape(open, closeQuote);
  useBodyLock(open);

  const [form, setForm] = useState({ nome: "", empresa: "", telefone: "", email: "", cidade: "", mensagem: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm({ nome: "", empresa: "", telefone: "", email: "", cidade: "", mensagem: "" });
      setError("");
    }
  }, [open]);

  if (!open) return null;

  const submit = () => {
    if (!form.nome.trim() || !form.telefone.trim() || !form.cidade.trim()) {
      setError("Preencha ao menos nome, telefone e cidade — o resto é opcional.");
      return;
    }
    const msg = quoteMessage({
      nome: form.nome,
      empresa: form.empresa,
      telefone: form.telefone,
      email: form.email,
      cidade: form.cidade,
      item: quoteLabel,
      mensagem: form.mensagem,
    });
    window.open(waLink(BUSINESS.whatsapp, msg), "_blank", "noopener");
    closeQuote();
  };

  return (
    <div className="fixed inset-0 z-[85] grid place-items-center p-4" role="dialog" aria-modal="true" aria-label="Solicitar orçamento">
      <div className="absolute inset-0 bg-coal-950/85 backdrop-blur-sm" onClick={closeQuote} />
      <div className="relative w-full max-w-lg border border-line-dark bg-coal-900 shadow-plate">
        <div className="hazard-thin h-1.5 w-full opacity-70" aria-hidden="true" />
        <div className="flex items-start justify-between gap-4 px-6 pt-5">
          <div>
            <p className="font-cond text-[12px] font-bold uppercase tracking-[0.26em] text-hz-300">Orçamento sem compromisso</p>
            <h2 className="mt-1 font-display text-2xl uppercase leading-tight">{quoteLabel || "Solicite sua peça"}</h2>
          </div>
          <button onClick={closeQuote} className="grid h-10 w-10 shrink-0 place-items-center border border-line-dark text-bone-100 hover:border-safety-400 hover:text-safety-400" aria-label="Fechar">
            <IcX size={18} />
          </button>
        </div>
        <div className="grid gap-3 px-6 py-5 sm:grid-cols-2">
          <div>
            <label htmlFor="q-nome" className={labelCls}>Nome *</label>
            <input id="q-nome" className={inputCls} value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Seu nome" />
          </div>
          <div>
            <label htmlFor="q-empresa" className={labelCls}>Empresa</label>
            <input id="q-empresa" className={inputCls} value={form.empresa} onChange={(e) => setForm({ ...form, empresa: e.target.value })} placeholder="Opcional" />
          </div>
          <div>
            <label htmlFor="q-tel" className={labelCls}>Telefone / WhatsApp *</label>
            <input id="q-tel" className={inputCls} value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} placeholder="(11) 9…" />
          </div>
          <div>
            <label htmlFor="q-cidade" className={labelCls}>Cidade / UF *</label>
            <input id="q-cidade" className={inputCls} value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} placeholder="São Paulo/SP" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="q-email" className={labelCls}>E-mail</label>
            <input id="q-email" type="email" className={inputCls} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Opcional" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="q-msg" className={labelCls}>Mensagem</label>
            <textarea id="q-msg" rows={3} className={inputCls} value={form.mensagem} onChange={(e) => setForm({ ...form, mensagem: e.target.value })} placeholder="Quantidade, prazo desejado…" />
          </div>
        </div>
        {error && <p className="px-6 pb-2 font-cond text-[13px] font-bold uppercase tracking-[0.1em] text-safety-400" role="alert">{error}</p>}
        <div className="flex flex-col gap-3 border-t border-line-dark px-6 py-5 sm:flex-row">
          <Btn onClick={submit} className="flex-1">
            Enviar pelo WhatsApp <IcWhatsApp size={16} />
          </Btn>
          <Btn tone="outline" onClick={closeQuote} className="sm:w-auto">
            Voltar
          </Btn>
        </div>
        <p className="px-6 pb-5 text-[12px] text-steel-500">
          Seu pedido abre o WhatsApp da {BUSINESS.name} já preenchido — nada é enviado sem sua confirmação.
        </p>
      </div>
    </div>
  );
}

/* ================= Comparador ================= */

type AnyItem = (Machine & { __kind: "machine" }) | (Implement & { __kind: "impl"; images: string[] });

function useItems(): AnyItem[] {
  const { compare } = useApp();
  return compare
    .map((id) => {
      const m = MACHINES.find((x) => x.id === id);
      if (m) return { ...m, __kind: "machine" } as AnyItem;
      const it = IMPLEMENTS.find((x) => x.id === id);
      if (it) return { ...it, __kind: "impl", images: [] } as AnyItem;
      return null;
    })
    .filter((x): x is AnyItem => x !== null);
}

export function CompareTray() {
  const { compare, compareOpen, setCompareOpen, clearCompare, toggleCompare } = useApp();
  const items = useItems();
  if (compare.length === 0) return null;

  return (
    <div className="fixed bottom-24 left-1/2 z-[70] w-[min(94vw,560px)] -translate-x-1/2 md:bottom-7">
      <div className="flex items-center gap-3 border border-line-dark bg-coal-900/95 p-3 shadow-plate backdrop-blur-md">
        <span className="grid h-10 w-10 shrink-0 place-items-center bg-hz-400 text-coal-950" aria-hidden="true">
          <IcScale size={19} />
        </span>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {items.map((it) => (
            <span key={it.id} className="flex min-w-0 items-center gap-1.5 border border-line-dark bg-coal-800 px-2 py-1">
              <span className="truncate font-cond text-[12px] font-bold uppercase tracking-[0.08em] text-bone-100">
                {it.model}
              </span>
              <button onClick={() => toggleCompare(it.id)} aria-label={`Remover ${it.model} da comparação`} className="text-steel-400 hover:text-safety-400">
                <IcX size={12} />
              </button>
            </span>
          ))}
          {compare.length < 3 && <span className="hidden font-cond text-[12px] uppercase tracking-[0.14em] text-steel-500 sm:block">+{3 - compare.length} p/ completar</span>}
        </div>
        <Btn
          size="sm"
          onClick={() => {
            if (compare.length >= 2) setCompareOpen(true);
          }}
          className={compare.length < 2 ? "pointer-events-none opacity-40" : ""}
        >
          Comparar
        </Btn>
        <button onClick={clearCompare} className="shrink-0 font-cond text-[11px] font-bold uppercase tracking-[0.12em] text-steel-400 hover:text-safety-400" aria-label="Limpar comparação">
          Limpar
        </button>
      </div>
    </div>
  );
}

export function CompareModal() {
  const { compareOpen, setCompareOpen, toggleCompare } = useApp();
  const items = useItems();
  useEscape(compareOpen, () => setCompareOpen(false));
  useBodyLock(compareOpen);
  if (!compareOpen) return null;

  const rows: { label: string; render: (it: AnyItem) => ReactNode }[] = [
    { label: "Tipo", render: (it) => (it.__kind === "machine" ? CATEGORY_META[it.category].label : it.type) },
    { label: "Marca da peça", render: (it) => (it.__kind === "machine" ? it.oem : it.brand) },
    { label: "Aplicação", render: (it) => (it.__kind === "machine" ? `${it.brand} — ${it.application}` : it.compat) },
    { label: "Condição", render: (it) => (it.__kind === "machine" ? (it.condition === "original" ? "Original" : "Compatível") : it.condition) },
    { label: "Código", render: (it) => (it.__kind === "machine" ? it.code : "—") },
    { label: "Peso", render: (it) => (it.__kind === "machine" && it.weightKg ? `${it.weightKg} kg` : "—") },
    {
      label: "Preço",
      render: (it) =>
        it.__kind === "machine" ? (
          it.price ? (
            <span className="font-bold text-hz-300">{formatBRL(it.price)}</span>
          ) : (
            "Sob consulta"
          )
        ) : (
          it.price ? <span className="font-bold text-hz-300">{formatBRL(it.price)}</span> : "Sob consulta"
        ),
    },
    { label: "Estoque", render: (it) => (it.__kind === "machine" ? (it.status === "disponivel" ? "Em estoque" : it.status === "reservada" ? "Reservada" : "Esgotada") : "Sob consulta") },
  ];

  return (
    <div className="fixed inset-0 z-[85] flex items-end justify-center p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label="Comparação de peças">
      <div className="absolute inset-0 bg-coal-950/85 backdrop-blur-sm" onClick={() => setCompareOpen(false)} />
      <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col border border-line-dark bg-coal-900 shadow-plate">
        <div className="flex items-center justify-between gap-4 border-b border-line-dark px-6 py-4">
          <h2 className="font-display text-2xl uppercase">Comparar peças</h2>
          <button onClick={() => setCompareOpen(false)} className="grid h-10 w-10 place-items-center border border-line-dark hover:border-safety-400 hover:text-safety-400" aria-label="Fechar comparação">
            <IcX size={18} />
          </button>
        </div>
        <div className="overflow-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 w-40 border-b border-line-dark bg-coal-900 px-6 py-4 font-cond text-[12px] font-bold uppercase tracking-[0.2em] text-steel-400">
                  Atributo
                </th>
                {items.map((it) => (
                  <th key={it.id} className="border-b border-line-dark px-4 py-4 align-top">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-cond text-[11px] font-bold uppercase tracking-[0.2em] text-hz-300">{it.__kind === "machine" ? it.brand : it.type}</p>
                        <p className="mt-0.5 font-display text-lg uppercase leading-tight text-bone-100">{it.model}</p>
                      </div>
                      <button onClick={() => toggleCompare(it.id)} className="text-steel-400 hover:text-safety-400" aria-label={`Remover ${it.model}`}>
                        <IcX size={14} />
                      </button>
                    </div>
                    {it.__kind === "machine" ? (
                      <Link to={`/pecas/${it.slug}`} className="mt-2 inline-flex items-center gap-1.5 font-cond text-[12px] font-bold uppercase tracking-[0.14em] text-hz-300 hover:underline">
                        Ver ficha <IcArrow size={12} />
                      </Link>
                    ) : (
                      <a href={waLink(BUSINESS.whatsapp, `Olá! Gostaria de orçamento do ${it.brand} ${it.model}.`)} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1.5 font-cond text-[12px] font-bold uppercase tracking-[0.14em] text-hz-300 hover:underline">
                        Orçamento <IcArrow size={12} />
                      </a>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr key={r.label} className={ri % 2 === 0 ? "bg-coal-950/40" : ""}>
                  <td className="sticky left-0 z-10 border-b border-line-dark bg-coal-900 px-6 py-3 font-cond text-[12px] font-bold uppercase tracking-[0.16em] text-steel-400">
                    {r.label}
                  </td>
                  {items.map((it) => (
                    <td key={it.id} className="border-b border-line-dark px-4 py-3 text-[14px] text-bone-200">
                      {r.render(it)}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="sticky left-0 z-10 bg-coal-900 px-6 py-4 font-cond text-[12px] font-bold uppercase tracking-[0.16em] text-steel-400">Ação</td>
                {items.map((it) => (
                  <td key={it.id} className="px-4 py-4">
                    {it.__kind === "machine" ? (
                      <a
                        href={waLink(BUSINESS.whatsapp, machineMessage(it))}
                        target="_blank"
                        rel="noreferrer"
                        className="clip-cut-sm inline-flex items-center gap-2 bg-[#1f9d44] px-4 py-2.5 font-cond text-[12px] font-bold uppercase tracking-[0.14em] text-bone-100 hover:bg-[#23b34d]"
                      >
                        <IcWhatsApp size={14} /> WhatsApp
                      </a>
                    ) : (
                      <a
                        href={waLink(BUSINESS.whatsapp, `Olá! Gostaria de orçamento do ${it.brand} ${it.model} (${it.compat}).`)}
                        target="_blank"
                        rel="noreferrer"
                        className="clip-cut-sm inline-flex items-center gap-2 bg-[#1f9d44] px-4 py-2.5 font-cond text-[12px] font-bold uppercase tracking-[0.14em] text-bone-100 hover:bg-[#23b34d]"
                      >
                        <IcWhatsApp size={14} /> WhatsApp
                      </a>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
