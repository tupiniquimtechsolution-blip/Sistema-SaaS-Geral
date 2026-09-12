import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Clock, Instagram, MapPin, MessageCircle, Phone, Star } from "lucide-react";
import { business } from "../config/business";
import { createWhatsAppUrl } from "../lib/whatsapp";
import { useCart } from "../context/CartContext";
import { Logo } from "./ui";

export function Footer() {
  return (
    <footer className="border-t border-line bg-panel" aria-label="Rodapé">
      <div className="shell grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Logo />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-sand">{business.description}</p>
          <p className="mt-5 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-gold">
            <Star aria-hidden size={13} fill="currentColor" /> {business.rating.value.toFixed(1).replace(".", ",")} ·{" "}
            {business.rating.count.toLocaleString("pt-BR")} avaliações no Google
          </p>
          <div className="mt-6 flex gap-2.5">
            <a
              href={business.social.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="grid h-10 w-10 place-items-center border border-line text-cream transition-all hover:-translate-y-0.5 hover:border-ember hover:text-ember"
            >
              <Instagram aria-hidden size={16} />
            </a>
            <a
              href={createWhatsAppUrl()}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              className="grid h-10 w-10 place-items-center border border-line text-cream transition-all hover:-translate-y-0.5 hover:border-ember hover:text-ember"
            >
              <MessageCircle aria-hidden size={16} />
            </a>
            <a
              href={`tel:${business.contact.phoneRaw}`}
              aria-label="Telefone"
              className="grid h-10 w-10 place-items-center border border-line text-cream transition-all hover:-translate-y-0.5 hover:border-ember hover:text-ember"
            >
              <Phone aria-hidden size={16} />
            </a>
          </div>
        </div>

        <nav aria-label="Links do rodapé">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-gold">Navegue</p>
          <ul className="mt-5 space-y-3 text-sm">
            {[
              { to: "/", label: "Início" },
              { to: "/cardapio", label: "Cardápio completo" },
              { to: "/sobre", label: "A casa" },
              { to: "/contato", label: "Reservas & contato" },
            ].map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-sand transition-colors hover:text-ember">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <a href={business.address.googleMapsUrl} target="_blank" rel="noreferrer" className="text-sand transition-colors hover:text-ember">
                Avaliar no Google
              </a>
            </li>
          </ul>
        </nav>

        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-gold">Horários</p>
          <ul className="mt-5 space-y-3 text-sm text-sand">
            {business.hours.map((h) => (
              <li key={h.days} className="flex items-start gap-2.5">
                <Clock aria-hidden size={14} className="mt-0.5 shrink-0 text-ember" />
                <span>
                  <span className="block text-cream">{h.days}</span>
                  {h.time}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-gold">Contato</p>
          <address className="mt-5 space-y-3 text-sm not-italic text-sand">
            <p className="flex items-start gap-2.5">
              <MapPin aria-hidden size={14} className="mt-0.5 shrink-0 text-ember" />
              {business.address.full}
            </p>
            <p className="flex items-center gap-2.5">
              <Phone aria-hidden size={14} className="shrink-0 text-ember" />
              <a href={`tel:${business.contact.phoneRaw}`} className="hover:text-ember">
                {business.contact.phoneDisplay}
              </a>
            </p>
            <p className="flex items-center gap-2.5">
              <MessageCircle aria-hidden size={14} className="shrink-0 text-ember" />
              <a href={createWhatsAppUrl()} target="_blank" rel="noreferrer" className="hover:text-ember">
                {business.contact.whatsappDisplay} (reservas)
              </a>
            </p>
          </address>
          <a
            href={createWhatsAppUrl(business.whatsappGreeting)}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-block bg-ember px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-bg transition-all hover:bg-gold"
          >
            Reservar mesa
          </a>
        </div>
      </div>

      <div className="border-t border-linesoft">
        <div className="shell flex flex-col items-center justify-between gap-3 py-6 text-center sm:flex-row sm:text-left">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-sand/70">
            © {new Date().getFullYear()} {business.legalName} · {business.address.neighborhood}, {business.address.city}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-sand/70">
            Site demonstrativo — pratos e equipe ilustrativos · fotos da casa: Google
          </p>
        </div>
      </div>
    </footer>
  );
}

/** Botão flutuante de WhatsApp — sobe no mobile quando a barra de pedido está visível */
export function FloatingWhatsApp() {
  const { count } = useCart();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 420);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <a
      href={createWhatsAppUrl(business.whatsappGreeting)}
      target="_blank"
      rel="noreferrer"
      aria-label="Conversar no WhatsApp"
      className={`animate-fade fixed right-4 z-[64] grid place-items-center rounded-full border border-ember/50 bg-ember text-bg shadow-ember transition-all duration-300 hover:scale-110 hover:bg-gold md:right-6 ${
        count > 0 ? "bottom-24 md:bottom-6" : "bottom-6"
      }`}
      style={{ height: 52, width: 52 }}
    >
      <MessageCircle aria-hidden size={22} />
    </a>
  );
}
