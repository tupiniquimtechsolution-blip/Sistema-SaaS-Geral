import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { business } from "../config/business";
import type { Pet } from "../lib/core";
import { brl, formatDateBR, Reveal, uid, usePageMeta, useStore, whatsLink, buildBookingWhatsApp } from "../lib/core";
import { Btn, inputCls, labelCls } from "../components/ui";
import { BackLink } from "../components/chrome";
import { IArrow, IBath, ICalendar, ICheck, IClock, IPaw, IPlus, IWhatsApp, IUser } from "../components/icons";
import { PawMark } from "../components/icons";

const STEPS = ["Pet", "Serviço", "Data", "Horário", "Resumo", "Confirmação"];

function nextDays(horizon: number) {
  const out: Date[] = [];
  const today = new Date();
  for (let i = 0; i < horizon + 7 && out.length < horizon; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    if (business.locations[0].hours[d.getDay()]) out.push(d);
  }
  return out;
}

function toISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function Booking() {
  usePageMeta(`Agendar banho e tosa | ${business.name}`, "Agende online em poucos passos: escolha o pet, o serviço, a data e o horário.");
  const { pets, savePet, bookings, addBooking, toast } = useStore();
  const [params] = useSearchParams();

  const [step, setStep] = useState(0);
  const [petId, setPetId] = useState<string | null>(params.get("pet"));
  const [showPetForm, setShowPetForm] = useState(pets.length === 0);
  const [serviceId, setServiceId] = useState<string | null>(
    business.services.find((s) => s.slug === params.get("service"))?.id ?? null
  );
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [professional, setProfessional] = useState<string>("Sem preferência");
  const [notes, setNotes] = useState("");
  const [done, setDone] = useState<{ id: string; petName: string; serviceName: string; date: string; time: string; professional: string } | null>(null);

  const [pf, setPf] = useState({ name: "", species: "caes" as Pet["species"], breed: "", size: "M" as Pet["size"], birthDate: "", sex: "macho" as Pet["sex"], weight: "", notes: "" });

  useEffect(() => { window.scrollTo({ top: 0 }); }, [step]);

  const pet = pets.find((p) => p.id === petId) ?? null;
  const service = business.services.find((s) => s.id === serviceId) ?? null;
  const days = useMemo(() => nextDays(business.booking.horizonDays), []);

  const slots = useMemo(() => {
    if (!date) return [];
    const d = new Date(`${date}T12:00:00`);
    const hours = business.locations[0].hours[d.getDay()];
    if (!hours) return [];
    const [oh, om] = hours.open.split(":").map(Number);
    const [ch] = hours.close.split(":").map(Number);
    const stepMin = business.booking.slotMinutes;
    const out: string[] = [];
    for (let m = oh * 60 + om; m + 60 <= ch * 60; m += stepMin) {
      const hh = String(Math.floor(m / 60)).padStart(2, "0");
      const mm = String(m % 60).padStart(2, "0");
      const label = `${hh}:${mm}`;
      // bloqueios (almoço etc.)
      const blocked = business.booking.blockedRanges.some((r) => {
        const [a, b] = r.split("-");
        return label >= a && label < b;
      });
      if (blocked) continue;
      // passado (hoje)
      const now = new Date();
      if (toISO(now) === date) {
        const nowMin = now.getHours() * 60 + now.getMinutes();
        if (m <= nowMin + 30) continue;
      }
      // já reservado
      const taken = bookings.some(
        (bk) => bk.date === date && bk.time === label && bk.status !== "cancelled"
      );
      if (taken) continue;
      out.push(label);
    }
    return out;
  }, [date, bookings]);

  const createPet = () => {
    if (!pf.name.trim()) { toast({ title: "Dê um nome ao pet", desc: "É rapidinho, só o nome já basta." }); return; }
    const newPet: Pet = { id: uid(), createdAt: Date.now(), photo: undefined, ...pf, name: pf.name.trim(), breed: pf.breed.trim() || "SRD" };
    savePet(newPet);
    setPetId(newPet.id);
    setShowPetForm(false);
    toast({ title: `${newPet.name} cadastrado!`, desc: "Agora escolha o serviço." });
  };

  const confirm = () => {
    if (!pet || !service || !date || !time) return;
    const b = addBooking({
      petId: pet.id, petName: pet.name, serviceId: service.id, serviceName: service.name,
      date, time, professional, size: pet.size, price: service.priceBySize[pet.size], notes,
    });
    setDone({ id: b.id, petName: pet.name, serviceName: service.name, date, time, professional });
    toast({ title: "Solicitação enviada!", desc: `${pet.name} · ${formatDateBR(date)} às ${time}` });
  };

  /* ===== sucesso ===== */
  if (done) {
    return (
      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-28 md:pt-36 pb-12 text-center">
        <div className="relative inline-block">
          <span className="block w-24 h-24 mx-auto rounded-full bg-leaf text-white grid place-items-center shadow-[0_20px_50px_-15px_rgba(86,140,118,0.7)]">
            <ICheck size={42} className="check-pop" />
          </span>
          <PawMark className="w-8 h-8 text-brand absolute -right-4 -top-2 rotate-12 check-pop" />
        </div>
        <h1 className="font-display font-extrabold display-tight text-[clamp(1.8rem,4vw,2.8rem)] text-ink mt-7">
          Solicitação enviada! <span className="font-accent italic font-normal text-brand-deep">Oba.</span>
        </h1>
        <p className="mt-4 text-fog text-[15.5px] leading-relaxed max-w-md mx-auto">
          A {business.name} vai <strong className="text-ink">confirmar o horário</strong> em instantes.
          Enquanto isso, guarde o protocolo <span className="font-display font-bold text-ink">{done.id}</span>.
        </p>
        <div className="mt-8 bg-white border border-line rounded-[22px] rounded-bl-[6px] p-6 text-left max-w-md mx-auto">
          {[
            ["Pet", done.petName],
            ["Serviço", done.serviceName],
            ["Data", formatDateBR(done.date)],
            ["Horário", done.time],
            ["Profissional", done.professional],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between py-2 border-b border-line last:border-0 text-[14.5px]">
              <span className="text-fog">{k}</span>
              <span className="font-display font-bold text-ink capitalize">{v}</span>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href={whatsLink(business.contact.whatsapp, buildBookingWhatsApp(done.petName, done.serviceName, formatDateBR(done.date), done.time, done.professional, notes))}
            target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-2 font-display font-bold text-[14.5px] px-7 py-3.5 rounded-full bg-leaf text-white hover:bg-leaf-deep transition-colors shadow-[0_14px_30px_-10px_rgba(86,140,118,0.7)]"
          >
            <IWhatsApp size={18} /> Adiantar pelo WhatsApp
          </a>
          <Btn to="/meus-pedidos" variant="outline">Ver meus agendamentos</Btn>
        </div>
        <p className="mt-6 text-[12.5px] text-fog">Enviaremos lembretes antes do horário — somente com seu consentimento.</p>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 md:pt-32 pb-12">
      <BackLink to="/servicos" label="Serviços e valores" />

      <div className="mt-4 flex items-end justify-between gap-6 flex-wrap">
        <div>
          <p className="eyebrow flex items-center gap-3"><span className="h-px w-8 bg-brand inline-block" aria-hidden /> Agendamento online</p>
          <h1 className="font-display font-extrabold display-tight text-[clamp(1.8rem,4.2vw,2.8rem)] text-ink mt-2">
            Vamos cuidar de quem <span className="font-accent italic font-normal text-brand-deep">importa?</span>
          </h1>
        </div>
      </div>

      {/* progresso com pegadas */}
      <ol className="mt-8 flex items-center gap-1 sm:gap-2" aria-label="Progresso do agendamento">
        {STEPS.map((s, i) => (
          <li key={s} className="flex items-center gap-1 sm:gap-2 flex-1 last:flex-none">
            <button
              type="button"
              onClick={() => i < step && setStep(i)}
              disabled={i > step}
              aria-current={i === step ? "step" : undefined}
              className={`flex flex-col items-center gap-1.5 ${i < step ? "cursor-pointer" : "cursor-default"}`}
            >
              <span className={`w-9 h-9 sm:w-10 sm:h-10 grid place-items-center rounded-full border-2 transition-all duration-300 font-display font-bold text-[13px] ${
                i < step ? "bg-leaf border-leaf text-white" : i === step ? "bg-brand border-brand text-white scale-110 shadow-[0_8px_20px_-6px_rgba(231,136,74,0.7)]" : "bg-white border-line text-fog"
              }`}>
                {i < step ? <ICheck size={15} /> : i + 1}
              </span>
              <span className={`text-[10px] sm:text-[11px] font-display font-bold uppercase tracking-wide ${i === step ? "text-brand-deep" : "text-fog/70"}`}>{s}</span>
            </button>
            {i < STEPS.length - 1 && <span className={`h-[3px] flex-1 rounded-full -mt-5 transition-colors duration-500 ${i < step ? "bg-leaf" : "bg-line"}`} aria-hidden />}
          </li>
        ))}
      </ol>

      <div className="mt-10">
        {/* ===== 1 · PET ===== */}
        {step === 0 && (
          <Reveal className="pop-in">
            <h2 className="font-display font-bold text-xl text-ink">Qual pet será atendido?</h2>
            {pets.length > 0 && (
              <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {pets.map((p) => (
                  <button
                    key={p.id} type="button" onClick={() => { setPetId(p.id); setStep(1); }}
                    aria-pressed={petId === p.id}
                    className={`text-left p-4 rounded-[20px] rounded-bl-[6px] border-2 transition-all duration-300 hover:-translate-y-0.5 ${petId === p.id ? "border-brand bg-brand/8 shadow-md" : "border-line bg-white hover:border-bark/35"}`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span className={`w-13 h-13 shrink-0 grid place-items-center rounded-full font-display font-extrabold text-lg text-white ${p.species === "gatos" ? "bg-sea" : "bg-brand"}`}>
                        {p.name[0]?.toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="font-display font-bold text-ink text-[15.5px]">{p.name}</p>
                        <p className="text-[12.5px] text-fog truncate">{p.species === "gatos" ? "Gato" : "Cão"} · porte {p.size} · {p.breed}</p>
                      </div>
                    </div>
                  </button>
                ))}
                <button
                  type="button" onClick={() => setShowPetForm(true)}
                  className="p-4 rounded-[20px] rounded-bl-[6px] border-2 border-dashed border-bark/25 text-fog hover:border-brand hover:text-brand-deep transition-colors grid place-items-center min-h-[92px] font-display font-bold text-sm"
                >
                  <span className="flex items-center gap-2"><IPlus size={17} /> Cadastrar novo pet</span>
                </button>
              </div>
            )}

            {(showPetForm || pets.length === 0) && (
              <div className="mt-6 bg-white border border-line rounded-[22px] rounded-bl-[6px] p-6">
                <p className="font-display font-bold text-ink flex items-center gap-2"><IPaw size={18} className="text-brand" /> Cadastro rápido do pet</p>
                <div className="mt-4 grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="pf-name" className={labelCls}>Nome *</label>
                    <input id="pf-name" className={inputCls} value={pf.name} onChange={(e) => setPf({ ...pf, name: e.target.value })} placeholder="Ex.: Thor" />
                  </div>
                  <div>
                    <span className={labelCls}>Espécie</span>
                    <div className="flex gap-2">
                      {([["caes", "Cão"], ["gatos", "Gato"]] as const).map(([v, l]) => (
                        <button key={v} type="button" aria-pressed={pf.species === v} onClick={() => setPf({ ...pf, species: v })} className={`flex-1 py-3 rounded-[14px] rounded-bl-[4px] font-display font-bold text-sm transition-all ${pf.species === v ? "bg-bark text-cream" : "bg-sand/60 text-bark hover:bg-sand"}`}>{l}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="pf-breed" className={labelCls}>Raça</label>
                    <input id="pf-breed" className={inputCls} value={pf.breed} onChange={(e) => setPf({ ...pf, breed: e.target.value })} placeholder="Ex.: Golden Retriever" />
                  </div>
                  <div>
                    <span className={labelCls}>Porte</span>
                    <div className="flex gap-2">
                      {(["P", "M", "G"] as const).map((v) => (
                        <button key={v} type="button" aria-pressed={pf.size === v} onClick={() => setPf({ ...pf, size: v })} className={`flex-1 py-3 rounded-[14px] rounded-bl-[4px] font-display font-bold text-sm transition-all ${pf.size === v ? "bg-bark text-cream" : "bg-sand/60 text-bark hover:bg-sand"}`}>{v}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="pf-birth" className={labelCls}>Nascimento</label>
                    <input id="pf-birth" type="date" className={inputCls} value={pf.birthDate} onChange={(e) => setPf({ ...pf, birthDate: e.target.value })} />
                  </div>
                  <div>
                    <label htmlFor="pf-weight" className={labelCls}>Peso (kg)</label>
                    <input id="pf-weight" className={inputCls} value={pf.weight} onChange={(e) => setPf({ ...pf, weight: e.target.value })} placeholder="Ex.: 12" inputMode="decimal" />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="pf-notes" className={labelCls}>Cuidados e preferências <span className="text-fog font-body font-normal">(opcional)</span></label>
                    <textarea id="pf-notes" rows={2} className={inputCls} value={pf.notes} onChange={(e) => setPf({ ...pf, notes: e.target.value })} placeholder="Ex.: tem medo de secador, pele sensível, adora petisco de batata…" />
                    <p className="mt-1.5 text-[11.5px] text-fog">Essas anotações guiam nosso atendimento. Não são prontuário médico.</p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Btn onClick={createPet}><IPaw size={17} /> Salvar e continuar</Btn>
                  {pets.length > 0 && <Btn variant="ghost" onClick={() => setShowPetForm(false)}>Cancelar</Btn>}
                </div>
              </div>
            )}
          </Reveal>
        )}

        {/* ===== 2 · SERVIÇO ===== */}
        {step === 1 && (
          <Reveal className="pop-in">
            <h2 className="font-display font-bold text-xl text-ink">Escolha o serviço para {pet?.name}.</h2>
            <p className="text-fog text-sm mt-1">Valores para porte {pet?.size}. Duração aproximada de cada sessão.</p>
            <div className="mt-5 grid sm:grid-cols-2 gap-3.5">
              {business.services.map((s) => (
                <button
                  key={s.id} type="button"
                  onClick={() => { setServiceId(s.id); setStep(2); }}
                  aria-pressed={serviceId === s.id}
                  className={`text-left p-5 rounded-[20px] rounded-bl-[6px] border-2 transition-all duration-300 hover:-translate-y-0.5 ${serviceId === s.id ? "border-brand bg-brand/8 shadow-md" : "border-line bg-white hover:border-bark/35"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display font-bold text-ink text-[16px] flex items-center gap-2">
                        <IBath size={17} className="text-brand" /> {s.name}
                      </p>
                      <p className="text-[12.5px] text-fog mt-1 flex items-center gap-1.5"><IClock size={13} /> ~{s.duration} min</p>
                    </div>
                    {s.popular && <span className="bg-coral text-white text-[10px] font-display font-bold uppercase px-2 py-0.5 rounded-full">Top</span>}
                  </div>
                  <p className="mt-3 font-display font-extrabold text-ink text-xl">{brl(s.priceBySize[pet?.size ?? "M"])}</p>
                  <p className="text-[12px] text-fog line-clamp-2 mt-1">{s.description}</p>
                </button>
              ))}
            </div>
            <div className="mt-6"><Btn variant="ghost" onClick={() => setStep(0)}><IArrow size={15} className="rotate-180" /> Trocar pet</Btn></div>
          </Reveal>
        )}

        {/* ===== 3 · DATA ===== */}
        {step === 2 && (
          <Reveal className="pop-in">
            <h2 className="font-display font-bold text-xl text-ink">Quando fica bom para vocês?</h2>
            <p className="text-fog text-sm mt-1">Próximos {business.booking.horizonDays} dias úteis da loja.</p>
            <div className="mt-5 grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-7 gap-2.5">
              {days.map((d) => {
                const iso = toISO(d);
                const active = date === iso;
                return (
                  <button
                    key={iso} type="button" onClick={() => { setDate(iso); setTime(null); setStep(3); }}
                    aria-pressed={active}
                    className={`py-3.5 rounded-[16px] rounded-bl-[5px] border-2 transition-all duration-300 hover:-translate-y-0.5 ${active ? "border-brand bg-brand text-white shadow-md" : "border-line bg-white text-bark hover:border-bark/40"}`}
                  >
                    <span className={`block text-[10.5px] font-display font-bold uppercase ${active ? "text-white/80" : "text-fog"}`}>
                      {d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "")}
                    </span>
                    <span className="block font-display font-extrabold text-lg">{d.getDate()}</span>
                    <span className={`block text-[10.5px] ${active ? "text-white/80" : "text-fog"}`}>{d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-6 flex gap-3">
              <Btn variant="ghost" onClick={() => setStep(1)}><IArrow size={15} className="rotate-180" /> Trocar serviço</Btn>
            </div>
          </Reveal>
        )}

        {/* ===== 4 · HORÁRIO ===== */}
        {step === 3 && (
          <Reveal className="pop-in">
            <h2 className="font-display font-bold text-xl text-ink">Horários livres em {date && formatDateBR(date)}.</h2>
            {slots.length === 0 ? (
              <div className="mt-5 bg-sand/60 rounded-[20px] p-6 text-center">
                <p className="font-display font-bold text-ink">Sem horários nesse dia 😿</p>
                <p className="text-fog text-sm mt-1">Escolha outra data — a agenda enche rápido aos sábados.</p>
                <Btn variant="bark" className="mt-4" onClick={() => setStep(2)}>Escolher outra data</Btn>
              </div>
            ) : (
              <div className="mt-5 grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-6 gap-2.5">
                {slots.map((t) => (
                  <button
                    key={t} type="button" onClick={() => setTime(t)}
                    aria-pressed={time === t}
                    className={`py-3 rounded-full border-2 font-display font-bold text-sm transition-all duration-200 ${time === t ? "border-brand bg-brand text-white shadow-md scale-105" : "border-line bg-white text-bark hover:border-bark/45"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}

            {business.booking.chooseProfessional && (
              <fieldset className="mt-7">
                <legend className={labelCls}>Profissional (opcional)</legend>
                <div className="flex flex-wrap gap-2">
                  {["Sem preferência", ...business.professionals.map((pr) => pr.name)].map((n) => (
                    <button
                      key={n} type="button" aria-pressed={professional === n} onClick={() => setProfessional(n)}
                      className={`px-4 py-2.5 rounded-full text-[13.5px] font-display font-bold transition-all ${professional === n ? "bg-bark text-cream" : "bg-white border-[1.5px] border-bark/20 text-bark hover:border-bark"}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            <div className="mt-7 flex flex-wrap gap-3">
              <Btn onClick={() => setStep(4)} disabled={!time}>Continuar <IArrow size={15} /></Btn>
              <Btn variant="ghost" onClick={() => setStep(2)}><IArrow size={15} className="rotate-180" /> Trocar data</Btn>
            </div>
          </Reveal>
        )}

        {/* ===== 5 · RESUMO ===== */}
        {step === 4 && pet && service && date && time && (
          <Reveal className="pop-in">
            <h2 className="font-display font-bold text-xl text-ink">Confere se está tudo certo?</h2>
            <div className="mt-5 bg-white border border-line rounded-[22px] rounded-bl-[6px] overflow-hidden">
              <div className="bg-bark text-cream px-6 py-4 flex items-center gap-3">
                <ICalendar size={19} className="text-brand" />
                <p className="font-display font-bold">{formatDateBR(date)} · {time}</p>
              </div>
              <div className="p-6 grid gap-3">
                {[
                  ["Pet", `${pet.name} · ${pet.species === "gatos" ? "gato" : "cão"} porte ${pet.size}`],
                  ["Serviço", service.name],
                  ["Duração", `~${service.duration} minutos`],
                  ["Profissional", professional],
                  ["Valor", brl(service.priceBySize[pet.size])],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-6 text-[14.5px] border-b border-line pb-3 last:border-0 last:pb-0">
                    <span className="text-fog">{k}</span>
                    <span className="font-display font-bold text-ink text-right capitalize">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            {pet.notes && (
              <p className="mt-4 bg-mint/40 border border-leaf/25 rounded-[16px] rounded-bl-[5px] px-4 py-3 text-[13.5px] text-leaf-deep">
                <strong>Anotações da equipe:</strong> {pet.notes}
              </p>
            )}
            <div className="mt-5">
              <label htmlFor="bk-notes" className={labelCls}>Algum recado para a equipe? (opcional)</label>
              <textarea id="bk-notes" rows={2} className={inputCls} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ex.: ele está com um nó atrás da orelha…" />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Btn onClick={() => setStep(5)} size="lg">Confirmar solicitação <ICheck size={17} /></Btn>
              <Btn variant="ghost" onClick={() => setStep(3)}><IArrow size={15} className="rotate-180" /> Ajustar horário</Btn>
            </div>
            <p className="mt-3 text-[12px] text-fog flex items-center gap-1.5"><IUser size={13} /> Pagamento na loja · cancelamento grátis até 3h antes.</p>
          </Reveal>
        )}

        {/* ===== 6 · CONFIRMAÇÃO ===== */}
        {step === 5 && (
          <Reveal className="pop-in text-center py-6">
            <span className="mx-auto w-20 h-20 grid place-items-center rounded-full bg-sand text-bark">
              <IPaw size={34} />
            </span>
            <h2 className="font-display font-extrabold text-2xl text-ink mt-5">Último passo: enviar a solicitação</h2>
            <p className="text-fog mt-2 max-w-sm mx-auto text-[14.5px]">
              A loja confirma o horário em seguida — você acompanha em “Meus pedidos” e pelo WhatsApp.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Btn size="lg" onClick={confirm}><IWhatsApp size={18} /> Enviar solicitação</Btn>
              <Btn variant="ghost" onClick={() => setStep(4)}><IArrow size={15} className="rotate-180" /> Voltar</Btn>
            </div>
          </Reveal>
        )}
      </div>
    </main>
  );
}
