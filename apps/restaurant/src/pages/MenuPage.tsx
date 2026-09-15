import { AlertTriangle, MessageCircle, UtensilsCrossed } from "lucide-react";
import MenuBoard from "../components/MenuBoard";
import { menuItems } from "../config/menu";
import { business } from "../config/business";
import { images } from "../config/images";
import { createWhatsAppUrl, interestMessage } from "../lib/whatsapp";
import { formatBRL } from "../lib/format";
import { ScrollReveal, usePrefersReducedMotion } from "../components/ui";

export default function MenuPage() {
  const reduce = usePrefersReducedMotion();

  return (
    <>
      {/* cabeçalho da página */}
      <section className="relative overflow-hidden border-b border-line bg-bg pt-32 pb-14 sm:pt-40 sm:pb-20" aria-label="La Carte">
        <div className="absolute inset-0" aria-hidden>
          <img src={images.interior2} alt="" className="h-full w-full object-cover opacity-[0.14]" />
          <div className="absolute inset-0 bg-gradient-to-b from-bg/60 via-bg/85 to-bg" />
        </div>

        <div className="shell relative">
          <div className={reduce ? "" : "anim-fade-up"}>
            <p className="font-mono text-[11px] uppercase tracking-[0.34em] text-gold">Preços em reais · carta sazonal</p>
            <h1 className="display-tight mt-4 font-display text-cream">
              <span className="block text-6xl sm:text-8xl">
                La <em className="font-wordmark not-italic text-ember">Carte</em>
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-sand sm:text-lg">
              Clássicos franceses executados sem pressa. Toque em <span className="text-cream">“adicionar”</span> para
              personalizar extras e montar o pedido — a finalização é pelo WhatsApp, sem pagamento online.
            </p>
            <div className="mt-7 flex flex-wrap gap-x-8 gap-y-2 font-mono text-[11px] uppercase tracking-[0.16em] text-sand">
              <span className="flex items-center gap-2">
                <UtensilsCrossed aria-hidden size={13} className="text-ember" /> {menuItems.length} itens na carta
              </span>
              <span>Menu executivo seg–sex · 12h–16h</span>
              <span>Faixa Google: R$ 80–180</span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-bg py-16 sm:py-20" aria-label="Itens da carta">
        <div className="shell">
          <MenuBoard mode="full" items={menuItems} />

          <ScrollReveal delay={0.1}>
            <div className="mt-16 grid gap-6 border-t border-line pt-10 lg:grid-cols-[1.4fr_1fr]">
              <div className="flex items-start gap-3.5 border border-gold/30 bg-panel p-5">
                <AlertTriangle aria-hidden size={18} className="mt-0.5 shrink-0 text-gold" />
                <p className="text-sm leading-relaxed text-sand">
                  <span className="font-semibold text-cream">Alergênicos:</span> nossos pratos podem conter glúten, lactose,
                  ovo, peixe e derivados. Para restrições severas, fale com a equipe antes de pedir — a cozinha adapta o que
                  for possível.
                </p>
              </div>
              <a
                href={createWhatsAppUrl(interestMessage("um prato que não encontrei na carta"))}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2.5 border border-ember/70 p-5 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ember transition-all hover:bg-ember hover:text-bg"
              >
                <MessageCircle aria-hidden size={15} /> Não achou algo? Pergunta no WhatsApp
              </a>
            </div>
          </ScrollReveal>

          <p className="mt-8 font-mono text-[10px] text-sand/60">
            Valores demonstrativos com base na faixa informada no Google ({formatBRL(80)}–{formatBRL(180)}) — a carta oficial
            entra na personalização do projeto.
          </p>
        </div>
      </section>
    </>
  );
}
