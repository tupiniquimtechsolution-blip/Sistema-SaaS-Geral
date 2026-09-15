import { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../core/store";
import { THEME_PRESETS } from "../core/theme";
import { formatBRL, useSEO } from "../core/utils";
import { ICheck, IFlame, ISpark, IWhatsApp } from "../components/icons";

/* ============================================================
   PAINEL DA CASA — demo do motor white-label
   Tudo aqui grava AdminOverrides (persistido por tenant) e o
   site inteiro reage: nome, tema, produtos, integrações.
   Em produção, esta tela consome a API do painel.
   ============================================================ */
export default function Admin() {
  const { business, admin, setAdmin, resetAdmin, products } = useApp();
  useSEO(`Painel da casa | ${business.name}`);
  const [tab, setTab] = useState<"identidade" | "produtos" | "canais">("identidade");

  const leads = (() => {
    try { return JSON.parse(localStorage.getItem(`${business.tenantId}.leads`) ?? "[]") as { type: string; details: string; name: string; date: string; slot: string; ts: number }[]; }
    catch { return []; }
  })();

  const setProduct = (id: string, patch: { available?: boolean; price?: number; promotionalPrice?: number | null }) => {
    setAdmin({ products: { ...(admin.products ?? {}), [id]: { ...(admin.products?.[id] ?? {}), ...patch } } });
  };

  const Toggle = ({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) => (
    <button onClick={onClick} role="switch" aria-checked={on} aria-label={label} className={`relative h-7 w-12 rounded-full transition-colors ${on ? "bg-accent" : "bg-coffee"}`}>
      <span className={`absolute top-1 h-5 w-5 rounded-full bg-flour transition-all ${on ? "left-6" : "left-1"}`} />
    </button>
  );

  return (
    <main className="min-h-screen bg-bg px-4 pb-24 pt-32 md:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-2.5 text-[11.5px] font-extrabold uppercase tracking-[0.3em] text-accent">
              <span className="h-px w-8 bg-accent" /> painel da casa · modo demonstração
            </p>
            <h1 className="font-display mt-3 text-4xl font-medium text-paper md:text-5xl">Comande o forno.</h1>
          </div>
          <button onClick={resetAdmin} className="btn btn-ghost !py-2.5 text-[13px]">Restaurar padrão</button>
        </div>
        <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-dim">
          Tudo que mudar aqui atualiza o site em tempo real e fica salvo neste navegador — é o motor white-label
          funcionando. Em produção, este painel grava no backend por <code className="text-accent">tenant_id</code>.
        </p>

        <div className="mt-8 flex gap-2">
          {([["identidade", "Identidade & tema"], ["produtos", "Produtos"], ["canais", "Canais & encomendas"]] as const).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} className={`chip ${tab === id ? "on" : ""}`}>{label}</button>
          ))}
        </div>

        {tab === "identidade" && (
          <div className="anim-fade mt-6 grid gap-5 lg:grid-cols-2">
            <div className="space-y-4 rounded-[var(--radius)] border border-line bg-surface/60 p-6">
              <h2 className="text-[12px] font-extrabold uppercase tracking-[0.22em] text-accent">Identidade</h2>
              <label className="block">
                <span className="text-[12.5px] font-bold text-dim">Nome da casa</span>
                <input defaultValue={admin.name ?? business.name} onBlur={(e) => setAdmin({ name: e.target.value || undefined })} className="field mt-1.5" />
              </label>
              <label className="block">
                <span className="text-[12.5px] font-bold text-dim">Tagline</span>
                <input defaultValue={admin.tagline ?? business.tagline} onBlur={(e) => setAdmin({ tagline: e.target.value || undefined })} className="field mt-1.5" />
              </label>
              <label className="block">
                <span className="text-[12.5px] font-bold text-dim">Anúncio do topo</span>
                <input defaultValue={admin.announcement ?? business.announcement} onBlur={(e) => setAdmin({ announcement: e.target.value })} className="field mt-1.5" />
              </label>
              <label className="block">
                <span className="text-[12.5px] font-bold text-dim">WhatsApp (com DDD)</span>
                <input defaultValue={admin.whatsapp ?? business.contact.whatsapp} onBlur={(e) => setAdmin({ whatsapp: e.target.value || undefined })} className="field mt-1.5" />
              </label>
            </div>

            <div className="space-y-4 rounded-[var(--radius)] border border-line bg-surface/60 p-6">
              <h2 className="text-[12px] font-extrabold uppercase tracking-[0.22em] text-accent">Tema por segmento</h2>
              <p className="text-[13px] leading-relaxed text-dim">Troque o preset e veja o site inteiro se readaptar — cores, fontes de apoio e raios mudam juntos.</p>
              <div className="grid gap-2.5">
                {Object.entries(THEME_PRESETS).map(([key, p]) => {
                  const on = (admin.palette ?? business.branding.palette) === key;
                  return (
                    <button key={key} onClick={() => setAdmin({ palette: key })} className={`flex items-center gap-3.5 rounded-[calc(var(--radius)*0.8)] border-2 px-4 py-3 text-left transition-all ${on ? "border-accent bg-accent/10" : "border-line hover:border-caramel/60"}`}>
                      <span className="flex gap-1.5">
                        {[p.tokens["--accent"], p.tokens["--bg"], p.tokens["--paper-text"]].map((c, i) => (
                          <span key={i} className="h-5 w-5 rounded-full ring-1 ring-paper/20" style={{ background: c }} />
                        ))}
                      </span>
                      <span className="flex-1">
                        <span className="block text-[14px] font-extrabold text-paper">{p.label}</span>
                        <span className="block text-[11.5px] text-dim">{p.segments}</span>
                      </span>
                      {on && <ICheck size={16} className="text-accent" />}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11.5px] leading-relaxed text-dim">
                No template real, cada segmento também troca fotografia, copy e a experiência do hero
                (pizza gira, burger se monta, café se enche…).
              </p>
            </div>
          </div>
        )}

        {tab === "produtos" && (
          <div className="anim-fade mt-6 overflow-hidden rounded-[var(--radius)] border border-line">
            <table className="w-full text-left text-[13.5px]">
              <thead className="bg-surface text-[11px] font-extrabold uppercase tracking-wider text-dim">
                <tr>
                  <th className="px-4 py-3.5">Produto</th>
                  <th className="px-4 py-3.5">Preço</th>
                  <th className="hidden px-4 py-3.5 sm:table-cell">Promoção</th>
                  <th className="px-4 py-3.5 text-right">Disponível</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-bg">
                {products.map((p) => {
                  const ov = admin.products?.[p.id];
                  return (
                    <tr key={p.id} className="transition-colors hover:bg-surface/40">
                      <td className="flex items-center gap-3 px-4 py-3">
                        <img src={p.images[0]} alt="" className={`h-10 w-10 rounded-lg object-cover ${ov?.available === false ? "opacity-40 saturate-0" : ""}`} />
                        <span className="font-bold text-paper">{p.name}</span>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number" step="0.5" min="0"
                          defaultValue={ov?.price ?? p.price}
                          onBlur={(e) => setProduct(p.id, { price: Number(e.target.value) || p.price })}
                          className="field !w-24 !py-1.5 text-[13px]"
                          aria-label={`Preço de ${p.name}`}
                        />
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        <input
                          type="number" step="0.5" min="0"
                          defaultValue={ov?.promotionalPrice ?? p.promotionalPrice ?? ""}
                          placeholder="—"
                          onBlur={(e) => setProduct(p.id, { promotionalPrice: e.target.value === "" ? null : Number(e.target.value) })}
                          className="field !w-24 !py-1.5 text-[13px]"
                          aria-label={`Promoção de ${p.name}`}
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Toggle on={(ov?.available ?? p.available) === true} onClick={() => setProduct(p.id, { available: !(ov?.available ?? p.available) })} label={`Disponibilidade de ${p.name}`} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {tab === "canais" && (
          <div className="anim-fade mt-6 grid gap-5 lg:grid-cols-2">
            <div className="space-y-4 rounded-[var(--radius)] border border-line bg-surface/60 p-6">
              <h2 className="text-[12px] font-extrabold uppercase tracking-[0.22em] text-accent">Canais de venda</h2>
              {[
                { key: "whatsapp" as const, label: "WhatsApp", icon: <IWhatsApp size={18} />, on: admin.integrations?.whatsapp ?? business.integrations.whatsapp.enabled },
                { key: "ifood" as const, label: "iFood", icon: <IFlame size={18} />, on: admin.integrations?.ifood ?? business.integrations.ifood.enabled },
                { key: "keeta" as const, label: "Keeta", icon: <ISpark size={18} />, on: admin.integrations?.keeta ?? business.integrations.keeta.enabled },
                { key: "food99" as const, label: "99Food", icon: <ISpark size={18} />, on: admin.integrations?.food99 ?? business.integrations.food99.enabled },
              ].map((c) => (
                <div key={c.key} className="flex items-center justify-between rounded-[calc(var(--radius)*0.7)] border border-line px-4 py-3">
                  <span className="flex items-center gap-3 text-[14px] font-bold text-paper">{c.icon} {c.label}</span>
                  <Toggle on={c.on} onClick={() => setAdmin({ integrations: { ...(admin.integrations ?? {}), [c.key]: !c.on } })} label={`Canal ${c.label}`} />
                </div>
              ))}
              {business.integrations.ifood.enabled && (
                <label className="block">
                  <span className="text-[12.5px] font-bold text-dim">URL oficial do iFood</span>
                  <input
                    defaultValue={admin.integrations?.ifoodUrl ?? business.integrations.ifood.url}
                    onBlur={(e) => setAdmin({ integrations: { ...(admin.integrations ?? {}), ifoodUrl: e.target.value } })}
                    className="field mt-1.5" placeholder="https://www.ifood.com.br/delivery/…"
                  />
                </label>
              )}
              <p className="text-[12px] leading-relaxed text-dim">O hub “Como você prefere pedir?” mostra somente os canais ativos — ligue/desligue e confira na home.</p>
            </div>

            <div className="rounded-[var(--radius)] border border-line bg-surface/60 p-6">
              <h2 className="text-[12px] font-extrabold uppercase tracking-[0.22em] text-accent">Encomendas recebidas</h2>
              {leads.length === 0 ? (
                <p className="mt-4 text-[13.5px] text-dim">Nenhuma solicitação ainda. Faça uma na página de encomendas para testar.</p>
              ) : (
                <ul className="mt-4 space-y-2.5">
                  {leads.map((l, i) => (
                    <li key={l.ts + String(i)} className="rounded-[calc(var(--radius)*0.7)] border border-line bg-bg px-4 py-3">
                      <p className="text-[13.5px] font-extrabold text-paper">{l.type} · {l.name}</p>
                      <p className="mt-0.5 line-clamp-2 text-[12.5px] text-dim">{l.details}</p>
                      <p className="mt-1 text-[11.5px] font-bold uppercase tracking-wider text-caramel">{l.date} · {l.slot}</p>
                    </li>
                  ))}
                </ul>
              )}
              <Link to="/encomendas" className="btn btn-ghost mt-5 w-full !py-3 text-[13px]">Testar fluxo de encomenda</Link>
            </div>
          </div>
        )}

        <p className="mt-10 text-center text-[12px] text-dim">
          Arquitetura: CORE (carrinho, checkout, hub) · THEME (presets) · BUSINESS DATA (config) · INTEGRATIONS — separados para virar qualquer negócio.
        </p>
      </div>
    </main>
  );
}
