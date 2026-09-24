import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, Users, DollarSign, Settings, LogOut,
  CheckCircle, Clock, TrendingUp, Eye
} from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/store';
import { useAuth } from '../lib/auth/AuthProvider';
import { loadCatalog, type CatalogService } from '../lib/catalog';
import { authErrorMessage } from '../lib/auth/errors';
import { adminSetAppointmentStatus, listAdminAppointments, type AppointmentView } from '../lib/booking/api';
import type { AppointmentStatus } from '../lib/supabase/types';

type AdminTab = 'dashboard' | 'agenda' | 'clients' | 'services' | 'settings';

export default function Admin() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [tab, setTab] = useState<AdminTab>('dashboard');
  const [bookings, setBookings] = useState<AppointmentView[]>([]);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [services, setServices] = useState<CatalogService[]>([]);

  useEffect(() => {
    if (auth.ready && auth.isAdmin) {
      void listAdminAppointments().then(setBookings).catch(() => setBookings([]));
      void loadCatalog().then((catalog) => setServices(catalog.services));
    }
  }, [auth.ready, auth.isAdmin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      await auth.signIn(loginEmail, loginPassword);
      await auth.refreshProfile();
    } catch (err) {
      setLoginError(authErrorMessage(err));
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  const handleStatusChange = async (id: string, status: AppointmentStatus) => {
    await adminSetAppointmentStatus(id, status);
    setBookings(await listAdminAppointments());
  };

  if (!auth.ready) {
    return <div className="min-h-screen flex items-center justify-center text-brand-muted">Carregando…</div>;
  }

  if (!auth.isAdmin) {
    return (
      <div className="min-h-screen bg-brand-background flex items-center justify-center px-4">
        <div className="max-w-sm w-full bg-white rounded-3xl p-8 shadow-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto bg-brand-primary/10 rounded-full flex items-center justify-center mb-4">
              <Settings size={28} className="text-brand-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold text-brand-primary">Painel Admin</h1>
            <p className="text-sm text-brand-muted mt-2">Acesso restrito</p>
          </div>
          {auth.user && !auth.isAdmin && (
            <p className="text-sm text-brand-danger mb-4">Esta conta não tem autorização administrativa.</p>
          )}
          <form onSubmit={(e) => void handleLogin(e)} className="space-y-4">
            <div>
              <label htmlFor="admin-email" className="block text-sm font-medium text-brand-text mb-1">E-mail</label>
              <input
                id="admin-email"
                type="email"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                className="w-full px-4 py-3 border border-brand-surface rounded-xl focus:border-brand-primary outline-none"
                placeholder="e-mail administrativo"
                required
              />
            </div>
            <div>
              <label htmlFor="admin-password" className="block text-sm font-medium text-brand-text mb-1">Senha</label>
              <input
                id="admin-password"
                type="password"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                className="w-full px-4 py-3 border border-brand-surface rounded-xl focus:border-brand-primary outline-none"
                placeholder="••••••••"
                required
              />
            </div>
            {loginError && (
              <p className="text-sm text-brand-danger">{loginError}</p>
            )}
            <button type="submit" className="w-full py-3 bg-brand-primary text-white font-medium rounded-full hover:bg-brand-wine/90 transition-colors">
              Entrar
            </button>
          </form>
          <p className="text-xs text-brand-muted text-center mt-4">
            Acesso somente com perfil admin autorizado no banco.
          </p>
          <Link to="/" className="block text-center text-sm text-brand-muted hover:text-brand-primary mt-4">
            ← Voltar ao site
          </Link>
        </div>
      </div>
    );
  }

  // Stats
  const totalRevenue = bookings.filter(b => b.status !== 'cancelled').reduce((sum, b) => sum + b.price, 0);
  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
  const todayBookings = bookings.filter(b => b.date === new Date().toISOString().split('T')[0]);

  const tabs = [
    { id: 'dashboard' as AdminTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'agenda' as AdminTab, label: 'Agenda', icon: Calendar },
    { id: 'clients' as AdminTab, label: 'Clientes', icon: Users },
    { id: 'services' as AdminTab, label: 'Serviços', icon: DollarSign },
    { id: 'settings' as AdminTab, label: 'Config', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-brand-background flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-brand-surface p-6">
        <div className="mb-8">
          <h1 className="font-display text-lg font-bold text-brand-primary">Admin</h1>
          <p className="text-xs text-brand-muted">Vanessa Braz</p>
        </div>
        <nav className="flex-1 space-y-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                tab === t.id
                  ? 'bg-brand-primary text-white'
                  : 'text-brand-muted hover:bg-brand-surface'
              }`}
            >
              <t.icon size={18} />
              {t.label}
            </button>
          ))}
        </nav>
        <div className="pt-4 border-t border-brand-surface space-y-2">
          <Link to="/" className="flex items-center gap-2 px-4 py-2 text-sm text-brand-muted hover:text-brand-primary transition-colors">
            <Eye size={16} /> Ver Site
          </Link>
          <button onClick={() => void handleLogout()} className="flex items-center gap-2 px-4 py-2 text-sm text-brand-danger hover:text-brand-danger/80 transition-colors w-full text-left">
            <LogOut size={16} /> Sair
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-brand-surface px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-lg font-bold text-brand-primary">Admin</h1>
          <button onClick={() => void handleLogout()} className="text-brand-muted">
            <LogOut size={20} />
          </button>
        </div>
        <div className="flex gap-1 mt-2 overflow-x-auto pb-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                tab === t.id ? 'bg-brand-primary text-white' : 'bg-brand-surface text-brand-muted'
              }`}
            >
              <t.icon size={14} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 mt-24 md:mt-0">
        {/* Dashboard */}
        {tab === 'dashboard' && (
          <div className="animate-fade-in">
            <h2 className="font-display text-2xl font-bold text-brand-primary mb-6">Dashboard</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-2xl p-5 border border-brand-surface">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center">
                    <TrendingUp size={20} className="text-brand-primary" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-brand-text">{formatCurrency(totalRevenue)}</p>
                <p className="text-xs text-brand-muted">Receita total</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-brand-surface">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-brand-warning/10 rounded-xl flex items-center justify-center">
                    <Clock size={20} className="text-brand-warning" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-brand-text">{pendingCount}</p>
                <p className="text-xs text-brand-muted">Pendentes</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-brand-surface">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-brand-success/10 rounded-xl flex items-center justify-center">
                    <CheckCircle size={20} className="text-brand-success" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-brand-text">{confirmedCount}</p>
                <p className="text-xs text-brand-muted">Confirmados</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-brand-surface">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-brand-secondary/20 rounded-xl flex items-center justify-center">
                    <Calendar size={20} className="text-brand-primary" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-brand-text">{todayBookings.length}</p>
                <p className="text-xs text-brand-muted">Hoje</p>
              </div>
            </div>

            {/* Recent Bookings */}
            <h3 className="font-display text-lg font-semibold text-brand-primary mb-4">Agendamentos Recentes</h3>
            {bookings.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-brand-surface">
                <Calendar size={40} className="mx-auto text-brand-muted/50 mb-3" />
                <p className="text-brand-muted">Nenhum agendamento ainda.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-brand-surface overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-brand-surface/50">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-brand-muted">Cliente</th>
                        <th className="text-left px-4 py-3 font-medium text-brand-muted">Serviço</th>
                        <th className="text-left px-4 py-3 font-medium text-brand-muted">Data</th>
                        <th className="text-left px-4 py-3 font-medium text-brand-muted">Horário</th>
                        <th className="text-left px-4 py-3 font-medium text-brand-muted">Status</th>
                        <th className="text-left px-4 py-3 font-medium text-brand-muted">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-surface">
                      {bookings.slice(-10).reverse().map(b => (
                        <tr key={b.id} className="hover:bg-brand-surface/20">
                          <td className="px-4 py-3 font-medium text-brand-text">{b.clientName || 'Cliente'}</td>
                          <td className="px-4 py-3 text-brand-muted">{b.serviceName}</td>
                          <td className="px-4 py-3 text-brand-muted">{formatDate(b.date)}</td>
                          <td className="px-4 py-3 text-brand-muted">{b.time}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              b.status === 'confirmed' ? 'bg-brand-success/10 text-brand-success' :
                              b.status === 'pending' ? 'bg-brand-warning/10 text-brand-warning' :
                              b.status === 'cancelled' ? 'bg-brand-danger/10 text-brand-danger' :
                              'bg-brand-primary/10 text-brand-primary'
                            }`}>
                              {b.status === 'confirmed' ? 'Confirmado' :
                               b.status === 'pending' ? 'Pendente' :
                               b.status === 'cancelled' ? 'Cancelado' : 'Concluído'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              {b.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => void handleStatusChange(b.id, 'confirmed')}
                                    className="text-xs text-brand-success hover:underline"
                                  >
                                    Confirmar
                                  </button>
                                  <button
                                    onClick={() => handleStatusChange(b.id, 'cancelled')}
                                    className="text-xs text-brand-danger hover:underline"
                                  >
                                    Cancelar
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Agenda Tab */}
        {tab === 'agenda' && (
          <div className="animate-fade-in">
            <h2 className="font-display text-2xl font-bold text-brand-primary mb-6">Agenda</h2>
            <div className="bg-white rounded-2xl border border-brand-surface p-6">
              <p className="text-brand-muted mb-4">Visualização completa de todos os agendamentos.</p>
              {bookings.length === 0 ? (
                <p className="text-center py-8 text-brand-muted">Nenhum agendamento registrado.</p>
              ) : (
                <div className="space-y-3">
                  {bookings.map(b => (
                    <div key={b.id} className="flex items-center justify-between p-4 bg-brand-surface/30 rounded-xl">
                      <div>
                        <p className="font-medium text-brand-text">{b.clientName || 'Cliente'}</p>
                        <p className="text-sm text-brand-muted">{b.serviceName} • {formatDate(b.date)} às {b.time}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-brand-primary">{formatCurrency(b.price)}</span>
                        {b.status === 'pending' && (
                          <button
                            onClick={() => void handleStatusChange(b.id, 'confirmed')}
                            className="px-3 py-1 bg-brand-success/10 text-brand-success text-xs rounded-full hover:bg-brand-success/20"
                          >
                            Confirmar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Clients Tab */}
        {tab === 'clients' && (
          <div className="animate-fade-in">
            <h2 className="font-display text-2xl font-bold text-brand-primary mb-6">Clientes</h2>
            <div className="bg-white rounded-2xl border border-brand-surface p-6">
              <p className="text-brand-muted">Lista de clientes cadastrados.</p>
              <div className="mt-4 space-y-3">
                {[...new Map(bookings.map(b => [b.customerId, b])).values()].map(b => (
                  <div key={b.customerId} className="flex items-center justify-between p-4 bg-brand-surface/30 rounded-xl">
                    <div>
                      <p className="font-medium text-brand-text">{b.clientName || 'Cliente'}</p>
                      <p className="text-sm text-brand-muted">{b.clientPhone || b.customerId} • {b.serviceName}</p>
                    </div>
                    <span className="text-xs text-brand-muted">{formatCurrency(b.price)}</span>
                  </div>
                ))}
                {bookings.length === 0 && <p className="text-center py-4 text-brand-muted">Nenhum cliente ainda.</p>}
              </div>
            </div>
          </div>
        )}

        {/* Services Tab */}
        {tab === 'services' && (
          <div className="animate-fade-in">
            <h2 className="font-display text-2xl font-bold text-brand-primary mb-6">Serviços</h2>
            <div className="bg-white rounded-2xl border border-brand-surface p-6">
              <div className="grid sm:grid-cols-2 gap-4">
                {services.length === 0 && <p className="text-sm text-brand-muted">Catálogo — PENDENTE_DE_CONFIRMACAO.</p>}
                {services.map(s => (
                  <div key={s.id} className="p-4 bg-brand-surface/30 rounded-xl">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-brand-text">{s.name}</p>
                        <p className="text-xs text-brand-muted">{s.category} • {s.duration}min</p>
                      </div>
                      <span className="font-bold text-brand-primary">{formatCurrency(s.price)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {tab === 'settings' && (
          <div className="animate-fade-in">
            <h2 className="font-display text-2xl font-bold text-brand-primary mb-6">Configurações</h2>
            <div className="bg-white rounded-2xl border border-brand-surface p-6 space-y-6">
              <div>
                <h3 className="font-medium text-brand-text mb-2">Informações do Negócio</h3>
                <p className="text-sm text-brand-muted">Catálogo, horários e política LGPD vêm de `business_settings` no Supabase.</p>
              </div>
              <div>
                <h3 className="font-medium text-brand-text mb-2">Segurança</h3>
                <ul className="text-sm text-brand-muted space-y-1">
                  <li>✓ Service Role Key não exposta no client</li>
                  <li>✓ RLS default-deny ativo nas migrations</li>
                  <li>✓ RBAC estruturado (admin/client)</li>
                  <li>✓ Validação server-side (Zod)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-brand-text mb-2">Status do Sistema</h3>
                <div className="grid sm:grid-cols-2 gap-3 mt-2">
                  <div className="p-3 bg-brand-surface/30 rounded-xl">
                    <p className="text-xs text-brand-muted">Frontend</p>
                    <p className="text-sm font-medium text-brand-success">✓ Ativo</p>
                  </div>
                  <div className="p-3 bg-brand-surface/30 rounded-xl">
                    <p className="text-xs text-brand-muted">Auth</p>
                    <p className="text-sm font-medium text-brand-warning">⚠ Demo Mode</p>
                  </div>
                  <div className="p-3 bg-brand-surface/30 rounded-xl">
                    <p className="text-xs text-brand-muted">Database</p>
                    <p className="text-sm font-medium text-brand-warning">⚠ LocalStorage</p>
                  </div>
                  <div className="p-3 bg-brand-surface/30 rounded-xl">
                    <p className="text-xs text-brand-muted">Payments</p>
                    <p className="text-sm font-medium text-brand-muted">○ Pendente</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
