import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Calendar, Clock, Check, ArrowLeft, ArrowRight, User, Sparkles } from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/store';
import { loadCatalog, type CatalogProfessional, type CatalogService } from '../lib/catalog';
import { createAppointment, listSlots } from '../lib/booking/api';
import { useAuth } from '../lib/auth/AuthProvider';
import { authErrorMessage } from '../lib/auth/errors';
import type { GeneratedSlot } from '../lib/booking/overlap';

type Step = 'service' | 'professional' | 'date' | 'time' | 'info' | 'confirm';
const STEPS: Step[] = ['service', 'professional', 'date', 'time', 'info', 'confirm'];

export default function Booking() {
  const [searchParams] = useSearchParams();
  const auth = useAuth();
  const [step, setStep] = useState<Step>('service');
  const [catalogServices, setCatalogServices] = useState<CatalogService[]>([]);
  const [professionals, setProfessionals] = useState<CatalogProfessional[]>([]);
  const [selectedService, setSelectedService] = useState<string>(searchParams.get('service') || '');
  const [selectedProfessional, setSelectedProfessional] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedStart, setSelectedStart] = useState<string>('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [bookingComplete, setBookingComplete] = useState(false);
  const [timeSlots, setTimeSlots] = useState<GeneratedSlot[]>([]);
  const [operational, setOperational] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [imageUse, setImageUse] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const service = catalogServices.find((item) => item.id === selectedService || item.slug === selectedService);
  const professional = professionals.find((item) => item.id === selectedProfessional);

  useEffect(() => {
    void loadCatalog().then((catalog) => {
      setCatalogServices(catalog.services);
      setProfessionals(catalog.professionals);
      if (catalog.professionals.length === 1) {
        setSelectedProfessional(catalog.professionals[0].id);
      }
      const requested = searchParams.get('service');
      if (requested) {
        const match = catalog.services.find((item) => item.id === requested || item.slug === requested);
        if (match) setSelectedService(match.id);
      }
    });
  }, [searchParams]);

  useEffect(() => {
    if (auth.user) {
      setClientName((current) => current || auth.user?.name || '');
      setClientPhone((current) => current || auth.user?.phone || '');
      setClientEmail((current) => current || auth.user?.email || '');
    }
  }, [auth.user]);

  useEffect(() => {
    if (selectedDate && service && selectedProfessional) {
      void listSlots({
        professionalId: selectedProfessional,
        serviceId: service.id,
        date: selectedDate,
        durationMinutes: service.duration,
      }).then(setTimeSlots).catch(() => setTimeSlots([]));
    }
  }, [selectedDate, service, selectedProfessional]);

  const getAvailableDates = () => {
    const dates: string[] = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      if (date.getDay() !== 0) {
        dates.push(date.toISOString().split('T')[0]);
      }
    }
    return dates;
  };

  const getDayName = (dateStr: string) => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return days[new Date(dateStr + 'T12:00:00').getDay()];
  };

  const getDayNumber = (dateStr: string) => new Date(dateStr + 'T12:00:00').getDate();

  const getMonthName = (dateStr: string) => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return months[new Date(dateStr + 'T12:00:00').getMonth()];
  };

  const handleConfirm = async () => {
    if (!service || !selectedProfessional || !selectedStart || !clientName || !clientPhone) return;
    if (!operational) {
      setError('O consentimento operacional é obrigatório para confirmar o agendamento.');
      return;
    }
    if (!auth.user) {
      setError('Entre na sua conta para confirmar. O agendamento não é mais salvo no navegador.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await createAppointment({
        serviceId: service.id,
        professionalId: selectedProfessional,
        startsAt: selectedStart,
        operationalConsent: true,
        marketingConsent: marketing,
        imageConsent: imageUse,
      });
      setBookingComplete(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('double_booking') || message.includes('23P01')) {
        setError('Este horário acabou de ser reservado. Escolha outro.');
      } else {
        setError(authErrorMessage(err));
      }
    } finally {
      setBusy(false);
    }
  };

  if (bookingComplete) {
    return (
      <div className="py-12 md:py-20">
        <div className="max-w-lg mx-auto px-4 text-center">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm">
            <div className="w-20 h-20 mx-auto bg-brand-success/10 rounded-full flex items-center justify-center mb-6">
              <Check size={40} className="text-brand-success" />
            </div>
            <h1 className="font-display text-3xl font-bold text-brand-primary mb-4">
              Agendamento Confirmado!
            </h1>
            <p className="text-brand-muted mb-8">
              Seu horário foi reservado. Você pode acompanhar o status em Minha Conta.
            </p>
            <div className="bg-brand-surface/50 rounded-2xl p-6 text-left mb-8">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-brand-muted">Serviço:</span>
                  <span className="text-sm font-medium">{service?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-brand-muted">Profissional:</span>
                  <span className="text-sm font-medium">{professional?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-brand-muted">Data:</span>
                  <span className="text-sm font-medium">{formatDate(selectedDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-brand-muted">Horário:</span>
                  <span className="text-sm font-medium">{selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-brand-muted">Valor:</span>
                  <span className="text-sm font-medium">{formatCurrency(service?.price || 0)}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Link
                to="/minha-conta"
                className="inline-flex items-center justify-center px-6 py-3 bg-brand-primary text-white font-medium rounded-full hover:bg-brand-wine/90 transition-colors"
              >
                Ver minha conta
              </Link>
              <Link
                to="/"
                className="inline-flex items-center justify-center px-6 py-3 border border-brand-primary text-brand-primary font-medium rounded-full hover:bg-brand-primary hover:text-white transition-colors"
              >
                Voltar ao Início
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-brand-primary mb-2">
            Agendar Horário
          </h1>
          <p className="text-brand-muted">
            Serviço, profissional, data, horário, seus dados e confirmação
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-10">
          {STEPS.map((item, idx) => (
            <div key={item} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                step === item ? 'bg-brand-primary text-white' :
                STEPS.indexOf(step) > idx ? 'bg-brand-success text-white' :
                'bg-brand-surface text-brand-muted'
              }`}>
                {STEPS.indexOf(step) > idx ? <Check size={14} /> : idx + 1}
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`w-6 md:w-10 h-0.5 ${STEPS.indexOf(step) > idx ? 'bg-brand-success' : 'bg-brand-surface'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm">
          {step === 'service' && (
            <div className="animate-fade-in">
              <h2 className="font-display text-xl font-semibold text-brand-primary mb-6 flex items-center gap-2">
                <Sparkles size={20} />
                Escolha o serviço
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {catalogServices.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedService(item.id)}
                    className={`p-4 rounded-xl text-left transition-all border-2 ${
                      selectedService === item.id
                        ? 'border-brand-primary bg-brand-primary/5'
                        : 'border-brand-surface hover:border-brand-secondary'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-brand-text">{item.name}</p>
                        <p className="text-xs text-brand-muted mt-1">{item.category} • {item.duration}min</p>
                      </div>
                      <span className="font-bold text-brand-primary text-sm">{formatCurrency(item.price)}</span>
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setStep('professional')}
                  disabled={!selectedService}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white font-medium rounded-full hover:bg-brand-wine/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próximo
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 'professional' && (
            <div className="animate-fade-in">
              <h2 className="font-display text-xl font-semibold text-brand-primary mb-6 flex items-center gap-2">
                <User size={20} />
                Escolha o profissional
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {professionals.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedProfessional(item.id)}
                    className={`p-4 rounded-xl text-left transition-all border-2 ${
                      selectedProfessional === item.id
                        ? 'border-brand-primary bg-brand-primary/5'
                        : 'border-brand-surface hover:border-brand-secondary'
                    }`}
                  >
                    <p className="font-medium text-brand-text">{item.name}</p>
                    <p className="text-xs text-brand-muted mt-1">{item.bio}</p>
                  </button>
                ))}
              </div>
              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => setStep('service')}
                  className="inline-flex items-center gap-2 px-6 py-3 border border-brand-surface text-brand-muted font-medium rounded-full hover:bg-brand-surface transition-colors"
                >
                  <ArrowLeft size={16} />
                  Voltar
                </button>
                <button
                  onClick={() => setStep('date')}
                  disabled={!selectedProfessional}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white font-medium rounded-full hover:bg-brand-wine/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próximo
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 'date' && (
            <div className="animate-fade-in">
              <h2 className="font-display text-xl font-semibold text-brand-primary mb-6 flex items-center gap-2">
                <Calendar size={20} />
                Escolha a data
              </h2>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {getAvailableDates().map((date) => (
                  <button
                    key={date}
                    onClick={() => { setSelectedDate(date); setSelectedTime(''); setSelectedStart(''); }}
                    className={`p-3 rounded-xl text-center transition-all border ${
                      selectedDate === date
                        ? 'border-brand-primary bg-brand-primary text-white'
                        : 'border-brand-surface hover:border-brand-secondary'
                    }`}
                  >
                    <p className={`text-xs ${selectedDate === date ? 'text-white/70' : 'text-brand-muted'}`}>
                      {getDayName(date)}
                    </p>
                    <p className={`text-lg font-bold ${selectedDate === date ? 'text-white' : 'text-brand-text'}`}>
                      {getDayNumber(date)}
                    </p>
                    <p className={`text-xs ${selectedDate === date ? 'text-white/70' : 'text-brand-muted'}`}>
                      {getMonthName(date)}
                    </p>
                  </button>
                ))}
              </div>
              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => setStep('professional')}
                  className="inline-flex items-center gap-2 px-6 py-3 border border-brand-surface text-brand-muted font-medium rounded-full hover:bg-brand-surface transition-colors"
                >
                  <ArrowLeft size={16} />
                  Voltar
                </button>
                <button
                  onClick={() => setStep('time')}
                  disabled={!selectedDate}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white font-medium rounded-full hover:bg-brand-wine/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próximo
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 'time' && (
            <div className="animate-fade-in">
              <h2 className="font-display text-xl font-semibold text-brand-primary mb-2 flex items-center gap-2">
                <Clock size={20} />
                Escolha o horário
              </h2>
              <p className="text-sm text-brand-muted mb-6">
                {formatDate(selectedDate)} • {service?.name}
              </p>
              {timeSlots.length === 0 ? (
                <p className="text-brand-muted text-center py-8">
                  Não há horários disponíveis para esta data. Selecione outra data.
                </p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => {
                        setSelectedTime(slot.time);
                        setSelectedStart(slot.start.toISOString());
                      }}
                      disabled={!slot.available}
                      className={`p-3 rounded-xl text-center text-sm font-medium transition-all border ${
                        selectedTime === slot.time
                          ? 'border-brand-primary bg-brand-primary text-white'
                          : slot.available
                            ? 'border-brand-surface hover:border-brand-secondary'
                            : 'border-brand-surface/50 text-brand-muted/50 cursor-not-allowed line-through'
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              )}
              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => setStep('date')}
                  className="inline-flex items-center gap-2 px-6 py-3 border border-brand-surface text-brand-muted font-medium rounded-full hover:bg-brand-surface transition-colors"
                >
                  <ArrowLeft size={16} />
                  Voltar
                </button>
                <button
                  onClick={() => setStep('info')}
                  disabled={!selectedTime}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white font-medium rounded-full hover:bg-brand-wine/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próximo
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 'info' && (
            <div className="animate-fade-in">
              <h2 className="font-display text-xl font-semibold text-brand-primary mb-6 flex items-center gap-2">
                <User size={20} />
                Seus dados
              </h2>
              {!auth.user && (
                <div className="mb-6 p-4 bg-brand-surface/50 rounded-xl text-sm text-brand-muted">
                  Para confirmar, entre ou crie sua conta.{' '}
                  <Link to="/login" className="text-brand-primary underline">Entrar</Link>
                  {' · '}
                  <Link to="/cadastro" className="text-brand-primary underline">Cadastrar</Link>
                </div>
              )}
              <div className="space-y-4 max-w-md">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-brand-text mb-1">Nome completo *</label>
                  <input
                    id="name"
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-4 py-3 border border-brand-surface rounded-xl focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-colors"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-brand-text mb-1">WhatsApp *</label>
                  <input
                    id="phone"
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full px-4 py-3 border border-brand-surface rounded-xl focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-colors"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-brand-text mb-1">E-mail</label>
                  <input
                    id="email"
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-brand-surface rounded-xl focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-colors"
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => setStep('time')}
                  className="inline-flex items-center gap-2 px-6 py-3 border border-brand-surface text-brand-muted font-medium rounded-full hover:bg-brand-surface transition-colors"
                >
                  <ArrowLeft size={16} />
                  Voltar
                </button>
                <button
                  onClick={() => setStep('confirm')}
                  disabled={!clientName || !clientPhone}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white font-medium rounded-full hover:bg-brand-wine/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próximo
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 'confirm' && (
            <div className="animate-fade-in">
              <h2 className="font-display text-xl font-semibold text-brand-primary mb-6 flex items-center gap-2">
                <Check size={20} />
                Confirme seu agendamento
              </h2>
              <div className="bg-brand-surface/50 rounded-2xl p-6 mb-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-brand-muted">Serviço:</span>
                    <span className="font-medium text-brand-text">{service?.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-brand-muted">Profissional:</span>
                    <span className="font-medium text-brand-text">{professional?.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-brand-muted">Data:</span>
                    <span className="font-medium text-brand-text">{formatDate(selectedDate)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-brand-muted">Horário:</span>
                    <span className="font-medium text-brand-text">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-brand-muted">Duração:</span>
                    <span className="font-medium text-brand-text">{service?.duration} minutos</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-brand-muted">Nome:</span>
                    <span className="font-medium text-brand-text">{clientName}</span>
                  </div>
                  <hr className="border-brand-surface" />
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-brand-text">Total:</span>
                    <span className="text-xl font-bold text-brand-primary">{formatCurrency(service?.price || 0)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 bg-brand-surface/30 rounded-xl p-4 mb-6">
                <label className="flex items-start gap-2 text-xs text-brand-muted">
                  <input type="checkbox" checked={operational} onChange={(e) => setOperational(e.target.checked)} className="mt-1" />
                  <span>
                    Consentimento operacional * — concordo com os{' '}
                    <Link to="/termos" className="text-brand-primary underline">Termos</Link> e a{' '}
                    <Link to="/politica-de-privacidade" className="text-brand-primary underline">Política de Privacidade</Link>
                    {' '}(LGPD v1.0).
                  </span>
                </label>
                <label className="flex items-start gap-2 text-xs text-brand-muted">
                  <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className="mt-1" />
                  <span>Consentimento de marketing (opcional).</span>
                </label>
                <label className="flex items-start gap-2 text-xs text-brand-muted">
                  <input type="checkbox" checked={imageUse} onChange={(e) => setImageUse(e.target.checked)} className="mt-1" />
                  <span>Consentimento de uso de imagem (opcional).</span>
                </label>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-brand-danger/10 text-brand-danger text-sm rounded-xl" role="alert">
                  {error}
                </div>
              )}

              <div className="flex justify-between">
                <button
                  onClick={() => setStep('info')}
                  className="inline-flex items-center gap-2 px-6 py-3 border border-brand-surface text-brand-muted font-medium rounded-full hover:bg-brand-surface transition-colors"
                >
                  <ArrowLeft size={16} />
                  Voltar
                </button>
                <button
                  onClick={() => void handleConfirm()}
                  disabled={busy}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-brand-success text-white font-medium rounded-full hover:bg-brand-success/90 transition-colors disabled:opacity-50"
                >
                  <Check size={16} />
                  {busy ? 'Reservando…' : 'Confirmar Agendamento'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
