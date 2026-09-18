import { useState } from "react";
import { Link } from "react-router-dom";
import { business } from "../config/business";
import type { Pet } from "../lib/core";
import { brl, formatDateBR, Reveal, uid, usePageMeta, useStore } from "../lib/core";
import { Btn, EmptyState, Modal, inputCls, labelCls } from "../components/ui";
import { ICalendar, IEdit, IPaw, IPlus, IRefresh, ITrash, IBath, IScissors, IBag, IChevron, IHeart, PawMark } from "../components/icons";

const AVATAR_DOG = "bg-brand";
const AVATAR_CAT = "bg-sea";

function petAge(birthDate: string) {
  if (!birthDate) return null;
  const b = new Date(`${birthDate}T12:00:00`);
  const months = Math.max(0, Math.floor((Date.now() - b.getTime()) / (1000 * 60 * 60 * 24 * 30.4)));
  if (months < 1) return "filhotinho";
  if (months < 12) return `${months} ${months === 1 ? "mês" : "meses"}`;
  const years = Math.floor(months / 12);
  return `${years} ${years === 1 ? "ano" : "anos"}`;
}

const emptyForm = { name: "", species: "caes" as Pet["species"], breed: "", birthDate: "", sex: "macho" as Pet["sex"], weight: "", size: "M" as Pet["size"], notes: "", photo: "" };

export default function PetPage() {
  usePageMeta(`Meu pet | ${business.name}`, "Cadastre seus pets, acompanhe banhos, tosas e próximas visitas.");
  const { pets, savePet, removePet, bookings, orders, toast } = useStore();
  const [editing, setEditing] = useState<Pet | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const openNew = () => { setEditing(null); setForm(emptyForm); setFormOpen(true); };
  const openEdit = (p: Pet) => {
    setEditing(p);
    setForm({ name: p.name, species: p.species, breed: p.breed, birthDate: p.birthDate, sex: p.sex, weight: p.weight, size: p.size, notes: p.notes, photo: p.photo ?? "" });
    setFormOpen(true);
  };

  const submit = () => {
    if (!form.name.trim()) { toast({ title: "Dê um nome ao pet" }); return; }
    savePet({
      id: editing?.id ?? uid(),
      createdAt: editing?.createdAt ?? Date.now(),
      photo: form.photo.trim() || undefined,
      name: form.name.trim(), species: form.species, breed: form.breed.trim() || "SRD",
      birthDate: form.birthDate, sex: form.sex, weight: form.weight, size: form.size, notes: form.notes,
    });
    toast({ title: editing ? `${form.name} atualizado!` : `${form.name} entrou para a família!`, desc: "Perfil salvo no seu dispositivo." });
    setFormOpen(false);
  };

  const upcoming = bookings.filter((b) => b.status !== "cancelled" && new Date(`${b.date}T${b.time}`) >= new Date());
  const lastOrders = orders.slice(0, 3);

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 md:pt-32 pb-10">
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <p className="eyebrow flex items-center gap-3"><span className="h-px w-8 bg-brand inline-block" aria-hidden /> Família cadastrada</p>
          <h1 className="font-display font-extrabold display-tight text-[clamp(1.8rem,4.2vw,2.8rem)] text-ink mt-2">
            Meus pets <span className="font-accent italic font-normal text-brand-deep">({pets.length})</span>
          </h1>
          <p className="text-fog mt-2 text-[15px] max-w-lg">Com o perfil salvo, o agendamento leva segundos e a equipe já sabe os cuidados de cada um.</p>
        </div>
        <Btn onClick={openNew}><IPlus size={17} /> Cadastrar pet</Btn>
      </div>

      {pets.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={<IPaw size={30} />}
            title="Nenhum pet cadastrado ainda"
            desc="Cadastre o Thor, a Mel ou o Mingau — em menos de um minuto eles ganham perfil, histórico e mimos de aniversário."
            action={<Btn onClick={openNew}><IPaw size={17} /> Cadastrar primeiro pet</Btn>}
          />
        </div>
      ) : (
        <div className="mt-10 grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {pets.map((p, i) => {
            const petBookings = bookings.filter((b) => b.petId === p.id && b.status !== "cancelled");
            const lastGroom = petBookings.filter((b) => b.status === "completed" || b.status === "confirmed").slice(-1)[0] ?? petBookings[0];
            const next = upcoming.filter((b) => b.petId === p.id).sort((a, b) => a.date.localeCompare(b.date))[0];
            const age = petAge(p.birthDate);
            return (
              <Reveal key={p.id} delay={i * 80}>
                <article className="bg-white border border-line rounded-[24px] rounded-bl-[6px] overflow-hidden hover:-translate-y-1 hover:shadow-[0_24px_50px_-24px_rgba(91,64,52,0.4)] transition-all duration-300">
                  <div className={`h-24 relative ${p.species === "gatos" ? "bg-[linear-gradient(135deg,#B8D9CD,#6799B5)]" : "bg-[linear-gradient(135deg,#F1DFCA,#E7884A)]"}`}>
                    <PawMark className="absolute right-4 top-4 w-10 h-10 text-white/30 rotate-12" />
                  </div>
                  <div className="px-6 pb-6 -mt-10">
                    {p.photo ? (
                      <img src={p.photo} alt={p.name} className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg" />
                    ) : (
                      <span className={`w-20 h-20 grid place-items-center rounded-full border-4 border-white shadow-lg text-white font-display font-extrabold text-3xl ${p.species === "gatos" ? AVATAR_CAT : AVATAR_DOG}`}>
                        {p.name[0]?.toUpperCase()}
                      </span>
                    )}
                    <div className="mt-3 flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-display font-extrabold text-ink text-xl">{p.name}</h2>
                        <p className="text-[13px] text-fog">
                          {p.species === "gatos" ? "Gato" : "Cão"} · {p.breed} · porte {p.size}
                          {age && <> · {age}</>}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button type="button" onClick={() => openEdit(p)} aria-label={`Editar ${p.name}`} className="w-9 h-9 grid place-items-center rounded-full hover:bg-sand text-bark transition-colors"><IEdit size={16} /></button>
                        <button
                          type="button" aria-label={`Remover ${p.name}`}
                          onClick={() => { if (window.confirm(`Remover o perfil de ${p.name}?`)) { removePet(p.id); toast({ title: `${p.name} removido` }); } }}
                          className="w-9 h-9 grid place-items-center rounded-full hover:bg-coral/15 text-coral transition-colors"
                        >
                          <ITrash size={16} />
                        </button>
                      </div>
                    </div>

                    {p.notes && <p className="mt-3 bg-mint/35 rounded-[14px] px-3.5 py-2.5 text-[12.5px] text-leaf-deep leading-relaxed"><strong>Cuidados:</strong> {p.notes}</p>}

                    <dl className="mt-4 grid gap-2 text-[13.5px]">
                      <div className="flex justify-between border-b border-line pb-2">
                        <dt className="text-fog flex items-center gap-1.5"><IBath size={14} className="text-brand" /> Último serviço</dt>
                        <dd className="font-display font-bold text-ink">{lastGroom ? lastGroom.serviceName : "—"}</dd>
                      </div>
                      <div className="flex justify-between border-b border-line pb-2">
                        <dt className="text-fog flex items-center gap-1.5"><ICalendar size={14} className="text-brand" /> Próxima visita</dt>
                        <dd className="font-display font-bold text-ink capitalize">{next ? `${formatDateBR(next.date)} · ${next.time}` : "—"}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-fog flex items-center gap-1.5"><IBag size={14} className="text-brand" /> Compras recentes</dt>
                        <dd className="font-display font-bold text-ink">{lastOrders.length > 0 ? `${lastOrders.length} ${lastOrders.length === 1 ? "pedido" : "pedidos"}` : "—"}</dd>
                      </div>
                    </dl>

                    <div className="mt-5 flex gap-2.5">
                      <Link to={`/agendamento?pet=${p.id}`} className="flex-1 inline-flex items-center justify-center gap-2 bg-brand text-white font-display font-bold text-[13.5px] py-3 rounded-full hover:bg-brand-deep transition-colors active:scale-[0.98]">
                        <ICalendar size={15} /> Agendar
                      </Link>
                      {lastGroom && (
                        <Link to={`/agendamento?pet=${p.id}&service=${business.services.find((s) => s.id === lastGroom.serviceId)?.slug ?? ""}`} aria-label={`Agendar novamente ${lastGroom.serviceName} para ${p.name}`} className="inline-flex items-center justify-center gap-1.5 border-[1.5px] border-bark/25 text-bark font-display font-bold text-[13px] px-4 py-3 rounded-full hover:bg-bark hover:text-cream transition-colors">
                          <IRefresh size={14} /> De novo
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      )}

      {/* dicas */}
      <Reveal className="mt-14">
        <div className="rounded-[24px] rounded-bl-[6px] bg-sand px-6 sm:px-10 py-10 grid lg:grid-cols-[1fr_auto] gap-6 items-center">
          <div>
            <h2 className="font-display font-extrabold text-[clamp(1.3rem,3vw,1.9rem)] text-ink">Aniversário do pet? <span className="font-accent italic font-normal text-brand-deep">A gente lembra.</span></h2>
            <p className="mt-2 text-fog text-[14.5px] max-w-xl">Com a data de nascimento salva, enviaremos um mimo no mês do aniversário — somente se você autorizar notificações.</p>
          </div>
          <Btn to="/fidelidade" variant="bark">Conhecer o Clube Pet <IChevron size={15} /></Btn>
        </div>
      </Reveal>

      {/* modal cadastro/edição */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? `Editar ${editing.name}` : "Cadastrar pet"} wide>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="pet-name" className={labelCls}>Nome *</label>
            <input id="pet-name" className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex.: Mel" />
          </div>
          <div>
            <span className={labelCls}>Espécie</span>
            <div className="flex gap-2">
              {([["caes", "Cão"], ["gatos", "Gato"]] as const).map(([v, l]) => (
                <button key={v} type="button" aria-pressed={form.species === v} onClick={() => setForm({ ...form, species: v })} className={`flex-1 py-3 rounded-[14px] rounded-bl-[4px] font-display font-bold text-sm transition-all ${form.species === v ? "bg-bark text-cream" : "bg-sand/60 text-bark hover:bg-sand"}`}>{l}</button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="pet-breed" className={labelCls}>Raça</label>
            <input id="pet-breed" className={inputCls} value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} placeholder="Ex.: Lhasa Apso" />
          </div>
          <div>
            <label htmlFor="pet-birth" className={labelCls}>Nascimento</label>
            <input id="pet-birth" type="date" className={inputCls} value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} />
          </div>
          <div>
            <span className={labelCls}>Sexo</span>
            <div className="flex gap-2">
              {([["macho", "Macho"], ["femea", "Fêmea"]] as const).map(([v, l]) => (
                <button key={v} type="button" aria-pressed={form.sex === v} onClick={() => setForm({ ...form, sex: v })} className={`flex-1 py-3 rounded-[14px] rounded-bl-[4px] font-display font-bold text-sm transition-all ${form.sex === v ? "bg-bark text-cream" : "bg-sand/60 text-bark hover:bg-sand"}`}>{l}</button>
              ))}
            </div>
          </div>
          <div>
            <span className={labelCls}>Porte</span>
            <div className="flex gap-2">
              {(["P", "M", "G"] as const).map((v) => (
                <button key={v} type="button" aria-pressed={form.size === v} onClick={() => setForm({ ...form, size: v })} className={`flex-1 py-3 rounded-[14px] rounded-bl-[4px] font-display font-bold text-sm transition-all ${form.size === v ? "bg-bark text-cream" : "bg-sand/60 text-bark hover:bg-sand"}`}>{v}</button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="pet-weight" className={labelCls}>Peso (kg)</label>
            <input id="pet-weight" className={inputCls} value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} placeholder="Ex.: 8,5" inputMode="decimal" />
          </div>
          <div>
            <label htmlFor="pet-photo" className={labelCls}>Foto (URL, opcional)</label>
            <input id="pet-photo" className={inputCls} value={form.photo} onChange={(e) => setForm({ ...form, photo: e.target.value })} placeholder="https://…" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="pet-notes" className={labelCls}>Comportamento, sensibilidades e preferências</label>
            <textarea id="pet-notes" rows={3} className={inputCls} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Ex.: não gosta de água no rosto, tem alergia a fragrância cítrica, ama colo…" />
            <p className="mt-1.5 text-[11.5px] text-fog flex items-center gap-1.5"><IHeart size={12} className="text-coral" /> Usado só para guiar o atendimento — nunca como prontuário médico.</p>
          </div>
        </div>
        <div className="mt-6 flex gap-3 justify-end">
          <Btn variant="ghost" onClick={() => setFormOpen(false)}>Cancelar</Btn>
          <Btn onClick={submit}><IPaw size={17} /> {editing ? "Salvar alterações" : "Cadastrar pet"}</Btn>
        </div>
      </Modal>

      {/* histórico geral */}
      {(bookings.length > 0 || orders.length > 0) && (
        <section className="mt-14">
          <h2 className="font-display font-extrabold text-xl text-ink mb-4">Histórico da família</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {bookings.slice(0, 4).map((b) => (
              <div key={b.id} className="bg-white border border-line rounded-[18px] rounded-bl-[6px] p-4 flex items-center gap-4">
                <span className="w-11 h-11 shrink-0 grid place-items-center rounded-full bg-sand text-bark">
                  {b.serviceName.toLowerCase().includes("tosa") ? <IScissors size={19} /> : <IBath size={19} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-display font-bold text-ink text-[14.5px] truncate">{b.serviceName} · {b.petName}</p>
                  <p className="text-[12.5px] text-fog capitalize">{formatDateBR(b.date)} às {b.time} · {brl(b.price)}</p>
                </div>
                <span className={`text-[10.5px] font-display font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${b.status === "completed" ? "bg-leaf/15 text-leaf-deep" : b.status === "cancelled" ? "bg-coral/15 text-coral" : "bg-sand text-bark"}`}>
                  {b.status === "requested" ? "solicitado" : b.status === "confirmed" ? "confirmado" : b.status === "completed" ? "concluído" : b.status === "cancelled" ? "cancelado" : "em andamento"}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
