import { Link } from "react-router-dom";
import { useApp } from "../core/store";
import { track, waLink } from "../core/utils";
import { IBasket, IBike, IFlame, IPhone, ISpark, IWhatsApp } from "./icons";

/* ============================================================
   HUB DE CANAIS — "Como você prefere pedir?"
   Renderiza SOMENTE canais realmente configurados.
   ============================================================ */
export default function ChannelHub() {
  const { business } = useApp();
  const i = business.integrations;
  const f = business.features;

  const channels: {
    id: string; title: string; desc: string; icon: React.ReactNode;
    href?: string; to?: string; external?: boolean; event: string;
  }[] = [];

  if (f.ecommerce) {
    channels.push({
      id: "site", title: "Pedir pelo site",
      desc: business.delivery.enabled
        ? `Entrega em ${business.delivery.time} ou retirada · Pix e cartão`
        : "Retirada na loja · Pix e cartão",
      icon: <IBasket size={22} />, to: "/produtos", event: "order_via_site",
    });
  }
  if (i.whatsapp.enabled) {
    channels.push({
      id: "whatsapp", title: "Pedir no WhatsApp",
      desc: "Atendimento humano, resposta rápida",
      icon: <IWhatsApp size={22} />,
      href: waLink(i.whatsapp.number || business.contact.whatsapp, `Olá, ${business.name}! Gostaria de fazer um pedido.`),
      external: true, event: "click_whatsapp",
    });
  }
  if (f.externalDeliveryApps && i.ifood.enabled && i.ifood.url) {
    channels.push({
      id: "ifood", title: "Pedir no iFood",
      desc: "Entrega pelo app parceiro",
      icon: <IFlame size={22} />, href: i.ifood.url, external: true, event: "click_ifood",
    });
  }
  if (f.externalDeliveryApps && i.keeta.enabled && i.keeta.url) {
    channels.push({
      id: "keeta", title: "Pedir na Keeta",
      desc: "Entrega pelo app parceiro",
      icon: <ISpark size={22} />, href: i.keeta.url, external: true, event: "click_keeta",
    });
  }
  if (f.externalDeliveryApps && i.food99.enabled && i.food99.url) {
    channels.push({
      id: "99food", title: "Pedir no 99Food",
      desc: "Entrega pelo app parceiro",
      icon: <IBike size={22} />, href: i.food99.url, external: true, event: "click_99food",
    });
  }
  if (i.phone.enabled) {
    channels.push({
      id: "phone", title: "Pedir por telefone",
      desc: i.phone.number || business.contact.phone,
      icon: <IPhone size={22} />, href: `tel:${(i.phone.number || business.contact.phone).replace(/\D/g, "")}`, event: "click_phone",
    });
  }

  return (
    <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
      {channels.map((c, idx) => {
        const inner = (
          <>
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[calc(var(--radius)*0.85)] bg-accent/12 text-accent ring-1 ring-accent/25 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105">
              {c.icon}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15.5px] font-extrabold text-paper">{c.title}</span>
              <span className="mt-0.5 block truncate text-[12.5px] font-medium text-dim">{c.desc}</span>
            </span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-dim transition-all duration-300 group-hover:translate-x-1 group-hover:text-accent">
              <path d="M4.5 12h15M13.5 6l6 6-6 6" />
            </svg>
          </>
        );
        const cls = `group flex items-center gap-4 rounded-[var(--radius)] border border-line bg-surface/70 p-4.5 p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-accent/60 hover:bg-surface hover:shadow-[0_22px_44px_-20px_rgba(0,0,0,0.7)]`;

        if (c.to) {
          return (
            <Link key={c.id} to={c.to} onClick={() => track(c.event, { from: "hub" })} className={cls} style={{ transitionDelay: `${idx * 20}ms` }}>
              {inner}
            </Link>
          );
        }
        return (
          <a
            key={c.id}
            href={c.href}
            target={c.external ? "_blank" : undefined}
            rel={c.external ? "noreferrer" : undefined}
            onClick={() => track(c.event, { from: "hub" })}
            className={cls}
          >
            {inner}
          </a>
        );
      })}
    </div>
  );
}
