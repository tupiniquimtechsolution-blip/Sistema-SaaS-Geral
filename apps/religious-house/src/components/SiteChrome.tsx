import { Link } from "react-router-dom";
import { templeConfig } from "../data/templeConfig";
import { WHATSAPP_URL } from "../lib/calendar";
import { GoldStar, LeafSprig, LogoCircle } from "./Ornaments";

/* ---------- botão flutuante do WhatsApp ---------- */
export function WhatsAppButton() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noreferrer"
      aria-label="Falar com o templo pelo WhatsApp"
      className="group fixed bottom-5 right-5 z-[45] flex items-center gap-0 overflow-hidden rounded-full bg-whatsapp text-cream shadow-[0_16px_40px_-10px_rgba(23,79,50,0.55)] transition-all duration-400 hover:pr-5"
    >
      <span className="grid size-14 shrink-0 place-items-center">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2 22l5.3-1.39a9.87 9.87 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.44 9.9-9.9 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.03h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.29z" />
        </svg>
      </span>
      <span className="max-w-0 whitespace-nowrap font-body text-[13px] font-semibold opacity-0 transition-all duration-400 group-hover:ml-1 group-hover:max-w-[180px] group-hover:opacity-100">
        Falar com o templo
      </span>
    </a>
  );
}

/* ---------- rodapé ---------- */
const FOOTER_NAV = [
  { to: "/", label: "Início" },
  { to: "/quem-somos", label: "Quem Somos" },
  { to: "/calendario", label: "Calendário" },
  { to: "/atendimentos", label: "Atendimentos" },
  { to: "/galeria", label: "Galeria" },
  { to: "/contato", label: "Contato" },
];

export function Footer() {
  const { address } = templeConfig;
  return (
    <footer className="relative overflow-hidden bg-forest-950 text-cream">
      <div className="absolute -right-20 -top-24 opacity-15" aria-hidden>
        <LeafSprig color="var(--color-gold-300)" className="h-80 w-80" flip />
      </div>
      <div className="absolute -bottom-24 -left-16 opacity-10" aria-hidden>
        <LeafSprig color="var(--color-forest-300)" className="h-80 w-80" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-10 pt-16 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr_1fr]">
          <div>
            <div className="flex items-center gap-4">
              <LogoCircle size={64} />
              <div>
                <p className="font-display text-xl font-semibold leading-tight">
                  Caboclo Tupinambá
                </p>
                <p className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-gold-300">
                  & Flecha Dourada
                </p>
              </div>
            </div>
            <p className="mt-5 max-w-sm font-body text-sm leading-relaxed text-mint-200/80">
              Um espaço de fé, acolhimento, orientação e axé. Atendimento aos
              consulentes e orientação espiritual, com respeito e caridade.
            </p>
          </div>

          <nav aria-label="Navegação do rodapé">
            <p className="mb-4 flex items-center gap-2 font-body text-[11px] font-bold uppercase tracking-[0.28em] text-gold-300">
              <GoldStar size={10} /> Caminhos
            </p>
            <ul className="space-y-2.5">
              {FOOTER_NAV.map((n) => (
                <li key={n.to}>
                  <Link
                    to={n.to}
                    className="gold-line font-body text-sm text-mint-200/85 transition-colors hover:text-gold-300"
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="mb-4 flex items-center gap-2 font-body text-[11px] font-bold uppercase tracking-[0.28em] text-gold-300">
              <GoldStar size={10} /> Nossa casa
            </p>
            <address className="space-y-3 font-body text-sm not-italic leading-relaxed text-mint-200/85">
              <p>
                {address.street}
                <br />
                {address.district}
                <br />
                {address.city} – {address.state} · {address.zip}
              </p>
              <p>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="text-gold-300 underline-offset-4 hover:underline"
                >
                  WhatsApp {templeConfig.phoneDisplay}
                </a>
              </p>
              <p>
                <a
                  href={templeConfig.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="text-gold-300 underline-offset-4 hover:underline"
                >
                  @caboclotupinamba_flechadourada
                </a>
              </p>
            </address>
          </div>
        </div>

        <div className="mt-14 border-t border-cream/15 pt-8 text-center">
          <p className="font-body text-[11px] uppercase tracking-[0.24em] text-mint-200/60">
            Templo de Umbanda Caboclo Tupinambá e Caboclo Flecha Dourada
          </p>
          <p className="mt-3 flex items-center justify-center gap-2 text-gold-500/70" aria-hidden>
            <span className="h-px w-10 bg-current opacity-50" />
            <GoldStar size={10} />
            <span className="h-px w-10 bg-current opacity-50" />
          </p>
        </div>
      </div>
    </footer>
  );
}
