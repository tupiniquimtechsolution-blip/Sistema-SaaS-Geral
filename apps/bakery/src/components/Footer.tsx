import { Link } from "react-router-dom";
import { useApp } from "../core/store";
import { isOpenNow, track, waLink } from "../core/utils";
import { IFacebook, IInstagram, ILoaf, IPhone, IPin, IWhatsApp } from "./icons";

export function OpeningHours({ light = false }: { light?: boolean }) {
  const { business } = useApp();
  const names = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const today = new Date().getDay();
  const cls = light ? "text-ink-soft" : "text-dim";
  return (
    <ul className="space-y-1.5 text-[13.5px]">
      {business.openingHours.map((d, i) => {
        const order = [1, 2, 3, 4, 5, 6, 0][i];
        const day = business.openingHours[order];
        return (
          <li key={order} className={`flex justify-between gap-6 ${order === today ? `font-bold ${light ? "text-ink" : "text-paper"}` : ""}`}>
            <span className={order === today ? "" : cls}>{names[order]}</span>
            <span className={order === today ? "text-caramel" : cls}>
              {day.open ? `${day.open} – ${day.close}` : "Fechado"}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export default function Footer() {
  const { business } = useApp();
  const a = business.address;
  const socials = [
    business.social.instagram && { icon: <IInstagram size={18} />, href: business.social.instagram, label: "Instagram" },
    business.social.facebook && { icon: <IFacebook size={18} />, href: business.social.facebook, label: "Facebook" },
  ].filter(Boolean) as { icon: React.ReactNode; href: string; label: string }[];

  return (
    <footer className="relative overflow-hidden border-t border-line bg-espresso pb-28 md:pb-10">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[720px] -translate-x-1/2 rounded-full bg-caramel/10 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 pt-16 md:px-8">
        <div className="grid gap-12 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-[calc(var(--radius)*0.8)] bg-accent text-accent-ink">
                <ILoaf size={24} />
              </span>
              <span className="font-display text-3xl font-semibold text-paper">{business.name}</span>
            </div>
            <p className="mt-4 max-w-xs text-[14px] leading-relaxed text-dim">{business.slogan} {business.description}</p>
            <div className="mt-6 flex gap-2.5">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="grid h-10 w-10 place-items-center rounded-full border border-line text-dim transition-all hover:-translate-y-0.5 hover:border-accent hover:text-accent"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-accent">Navegação</h3>
            <ul className="mt-4 space-y-2.5 text-[14px]">
              {[
                { to: "/produtos", label: "Cardápio completo" },
                { to: "/encomendas", label: "Encomendas" },
                { to: "/sobre", label: "Nossa casa" },
                { to: "/contato", label: "Contato & rota" },
                { to: "/meus-pedidos", label: "Meus pedidos" },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="u-link text-paper/80 hover:text-paper">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-accent">Horários</h3>
            <div className="mt-4"><OpeningHours /></div>
          </div>

          <div>
            <h3 className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-accent">A casa</h3>
            <address className="mt-4 space-y-3 text-[14px] not-italic text-paper/80">
              <p className="flex gap-2.5"><IPin size={17} className="mt-0.5 shrink-0 text-caramel" /> {a.street}, {a.number} — {a.district}, {a.city}/{a.state}</p>
              <p className="flex gap-2.5"><IPhone size={17} className="mt-0.5 shrink-0 text-caramel" /> {business.contact.phone}</p>
              {business.integrations.whatsapp.enabled && (
                <a
                  href={waLink(business.integrations.whatsapp.number || business.contact.whatsapp, `Olá, ${business.name}!`)}
                  target="_blank" rel="noreferrer"
                  onClick={() => track("click_whatsapp", { from: "footer" })}
                  className="flex gap-2.5 transition-colors hover:text-accent"
                >
                  <IWhatsApp size={17} className="mt-0.5 shrink-0 text-caramel" /> {business.contact.whatsapp}
                </a>
              )}
            </address>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-line pt-7 text-[12.5px] text-dim md:flex-row">
          <p>© {new Date().getFullYear()} {business.name}. Feito com fermento, manteiga e código.</p>
          <div className="flex items-center gap-5">
            <Link to="/sobre" className="u-link">Privacidade (LGPD)</Link>
            <Link to="/admin" className="u-link text-dim/70">Painel da casa</Link>
            <span className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-[11px]">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" /> plataforma white-label
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
