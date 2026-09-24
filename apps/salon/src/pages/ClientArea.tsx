import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, LogOut, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/store';
import { useAuth } from '../lib/auth/AuthProvider';
import { cancelAppointment, listMyAppointments, type AppointmentView } from '../lib/booking/api';

export default function ClientArea() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [bookings, setBookings] = useState<AppointmentView[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!auth.ready) return;
    if (!auth.user) {
      navigate('/login');
      return;
    }
    void listMyAppointments()
      .then(setBookings)
      .catch((err) => setError(err instanceof Error ? err.message : 'Não foi possível carregar os agendamentos.'));
  }, [auth.ready, auth.user, navigate]);

  const handleCancel = async (id: string) => {
    if (!confirm('Deseja realmente cancelar este agendamento?')) return;
    try {
      await cancelAppointment(id);
      setBookings(await listMyAppointments());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível cancelar.');
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  const statusConfig = {
    pending: { label: 'Pendente', icon: AlertCircle, color: 'text-brand-warning' },
    confirmed: { label: 'Confirmado', icon: CheckCircle, color: 'text-brand-success' },
    completed: { label: 'Concluído', icon: CheckCircle, color: 'text-brand-primary' },
    cancelled: { label: 'Cancelado', icon: XCircle, color: 'text-brand-danger' },
    no_show: { label: 'Não compareceu', icon: XCircle, color: 'text-brand-danger' },
  };

  const upcomingBookings = bookings.filter((b) => b.status !== 'cancelled' && b.status !== 'completed' && b.status !== 'no_show');
  const pastBookings = bookings.filter((b) => b.status === 'completed' || b.status === 'cancelled' || b.status === 'no_show');

  if (!auth.ready) {
    return <div className="py-20 text-center text-brand-muted">Carregando sessão…</div>;
  }

  return (
    <div className="py-12 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-brand-primary">
              Minha Conta
            </h1>
            <p className="text-brand-muted text-sm mt-1">
              Olá, {auth.user?.name || 'Cliente'}
            </p>
          </div>
          <button
            onClick={() => void handleLogout()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-brand-muted hover:text-brand-danger border border-brand-surface rounded-full hover:border-brand-danger/30 transition-colors"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-brand-danger/10 text-brand-danger text-sm rounded-xl" role="alert">{error}</div>
        )}

        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <Link
            to="/agendar"
            className="bg-brand-primary text-white rounded-2xl p-5 hover:bg-brand-wine/90 transition-colors"
          >
            <Calendar size={24} className="mb-2" />
            <p className="font-medium">Novo Agendamento</p>
            <p className="text-xs text-white/70 mt-1">Agende um novo horário</p>
          </Link>
          <div className="bg-white rounded-2xl p-5 border border-brand-surface">
            <User size={24} className="mb-2 text-brand-primary" />
            <p className="font-medium text-brand-text">Meus Dados</p>
            <p className="text-xs text-brand-muted mt-1">{auth.user?.email || 'Não informado'}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-brand-surface">
            <Calendar size={24} className="mb-2 text-brand-primary" />
            <p className="font-medium text-brand-text">{upcomingBookings.length} Agendamentos</p>
            <p className="text-xs text-brand-muted mt-1">Próximos horários</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="font-display text-xl font-semibold text-brand-primary mb-4">
            Próximos Agendamentos
          </h2>
          {upcomingBookings.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-brand-surface">
              <Calendar size={40} className="mx-auto text-brand-muted/50 mb-3" />
              <p className="text-brand-muted">Nenhum agendamento pendente.</p>
              <Link
                to="/agendar"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-brand-primary text-white text-sm font-medium rounded-full hover:bg-brand-wine/90 transition-colors"
              >
                Agendar Agora
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingBookings.map((booking) => {
                const status = statusConfig[booking.status];
                return (
                  <div key={booking.id} className="bg-white rounded-2xl p-5 border border-brand-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-brand-secondary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Calendar size={20} className="text-brand-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-brand-text">{booking.serviceName}</p>
                        <div className="flex items-center gap-3 mt-1 text-sm text-brand-muted">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDate(booking.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {booking.time}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`flex items-center gap-1 text-xs font-medium ${status.color}`}>
                        <status.icon size={14} />
                        {status.label}
                      </span>
                      <span className="font-bold text-brand-primary">{formatCurrency(booking.price)}</span>
                      {booking.status === 'pending' && (
                        <button
                          onClick={() => void handleCancel(booking.id)}
                          className="text-xs text-brand-danger hover:underline"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {pastBookings.length > 0 && (
          <div>
            <h2 className="font-display text-xl font-semibold text-brand-primary mb-4">
              Histórico
            </h2>
            <div className="space-y-3">
              {pastBookings.map((booking) => {
                const status = statusConfig[booking.status];
                return (
                  <div key={booking.id} className="bg-white/50 rounded-2xl p-5 border border-brand-surface/50 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-brand-text/70">{booking.serviceName}</p>
                      <p className="text-sm text-brand-muted">{formatDate(booking.date)} às {booking.time}</p>
                    </div>
                    <span className={`flex items-center gap-1 text-xs font-medium ${status.color}`}>
                      <status.icon size={14} />
                      {status.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
