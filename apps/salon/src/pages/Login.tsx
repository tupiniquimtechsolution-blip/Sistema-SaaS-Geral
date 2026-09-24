import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, UserPlus, KeyRound } from 'lucide-react';
import { useAuth } from '../lib/auth/AuthProvider';
import { authErrorMessage } from '../lib/auth/errors';

type Mode = 'login' | 'register' | 'reset';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const [mode, setMode] = useState<Mode>(
    location.pathname === '/cadastro' ? 'register' : location.pathname === '/recuperar-senha' ? 'reset' : 'login',
  );
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);
  const [operational, setOperational] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [imageUse, setImageUse] = useState(false);

  useEffect(() => {
    if (location.pathname === '/cadastro') setMode('register');
    else if (location.pathname === '/recuperar-senha') setMode('reset');
    else setMode('login');
  }, [location.pathname]);

  useEffect(() => {
    if (auth.ready && auth.user && mode !== 'reset') {
      navigate(auth.isAdmin ? '/admin' : '/minha-conta');
    }
  }, [auth.ready, auth.user, auth.isAdmin, mode, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!auth.configured) {
      setError('Autenticação real não configurada. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.');
      return;
    }

    if (mode === 'reset') {
      if (!email) {
        setError('Informe o e-mail da conta.');
        return;
      }
      setBusy(true);
      try {
        await auth.resetPassword(email);
        setInfo('Se o e-mail existir, enviaremos o link de redefinição.');
      } catch (err) {
        setError(authErrorMessage(err));
      } finally {
        setBusy(false);
      }
      return;
    }

    if (!email || !password) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }

    if (mode === 'register') {
      if (!name || !phone) {
        setError('Preencha todos os campos.');
        return;
      }
      if (!operational) {
        setError('O consentimento operacional é obrigatório para criar a conta (LGPD).');
        return;
      }
      if (password.length < 8) {
        setError('A senha deve ter pelo menos 8 caracteres.');
        return;
      }
      setBusy(true);
      try {
        const result = await auth.signUp({
          name,
          email,
          phone,
          password,
          marketingConsent: marketing,
          imageConsent: imageUse,
        });
        if (result.needsConfirmation) {
          setInfo('Conta criada. Confirme o e-mail para entrar.');
          setMode('login');
        } else {
          navigate('/minha-conta');
        }
      } catch (err) {
        setError(authErrorMessage(err));
      } finally {
        setBusy(false);
      }
      return;
    }

    setBusy(true);
    try {
      await auth.signIn(email, password);
      navigate('/minha-conta');
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const title = mode === 'register' ? 'Criar Conta' : mode === 'reset' ? 'Redefinir senha' : 'Entrar';
  const Icon = mode === 'register' ? UserPlus : mode === 'reset' ? KeyRound : LogIn;

  return (
    <div className="py-12 md:py-20">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto bg-brand-primary/10 rounded-full flex items-center justify-center mb-4">
              <Icon size={28} className="text-brand-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold text-brand-primary">{title}</h1>
            <p className="text-sm text-brand-muted mt-2">
              {mode === 'register'
                ? 'Crie sua conta para agendar online'
                : mode === 'reset'
                  ? 'Enviaremos um link seguro para o seu e-mail'
                  : 'Acesse sua conta para ver seus agendamentos'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-brand-text mb-1">
                    Nome completo *
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-brand-surface rounded-xl focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-colors"
                    placeholder="Seu nome"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-brand-text mb-1">
                    WhatsApp *
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 border border-brand-surface rounded-xl focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-colors"
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>
              </>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-brand-text mb-1">
                E-mail *
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-brand-surface rounded-xl focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-colors"
                placeholder="seu@email.com"
                required
              />
            </div>
            {mode !== 'reset' && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-brand-text mb-1">
                  Senha *
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-brand-surface rounded-xl focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-colors pr-12"
                    placeholder="••••••••"
                    required
                    minLength={mode === 'register' ? 8 : 6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-primary"
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div className="space-y-3 pt-1">
                <label className="flex items-start gap-2 text-xs text-brand-muted">
                  <input
                    type="checkbox"
                    checked={operational}
                    onChange={(e) => setOperational(e.target.checked)}
                    className="mt-1 rounded border-brand-surface text-brand-primary focus:ring-brand-primary"
                  />
                  <span>
                    Consentimento operacional * — li e concordo com a{' '}
                    <Link to="/politica-de-privacidade" className="text-brand-primary underline">Política de Privacidade</Link>
                    {' '}e os{' '}
                    <Link to="/termos" className="text-brand-primary underline">Termos de Uso</Link>
                    . Necessário para criar a conta (LGPD, versão 1.0).
                  </span>
                </label>
                <label className="flex items-start gap-2 text-xs text-brand-muted">
                  <input
                    type="checkbox"
                    checked={marketing}
                    onChange={(e) => setMarketing(e.target.checked)}
                    className="mt-1 rounded border-brand-surface"
                  />
                  <span>Consentimento de marketing — comunicações opcionais por e-mail/WhatsApp.</span>
                </label>
                <label className="flex items-start gap-2 text-xs text-brand-muted">
                  <input
                    type="checkbox"
                    checked={imageUse}
                    onChange={(e) => setImageUse(e.target.checked)}
                    className="mt-1 rounded border-brand-surface"
                  />
                  <span>Consentimento de uso de imagem — opcional, para portfólio com autorização explícita.</span>
                </label>
              </div>
            )}

            {error && (
              <div className="p-3 bg-brand-danger/10 text-brand-danger text-sm rounded-xl" role="alert">
                {error}
              </div>
            )}
            {info && (
              <div className="p-3 bg-brand-success/10 text-brand-success text-sm rounded-xl" role="status">
                {info}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full py-3 bg-brand-primary text-white font-medium rounded-full hover:bg-brand-wine/90 transition-colors disabled:opacity-50"
            >
              {busy ? 'Aguarde…' : mode === 'register' ? 'Criar Conta' : mode === 'reset' ? 'Enviar link' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            {mode === 'login' && (
              <>
                <button
                  onClick={() => { setMode('register'); setError(''); setInfo(''); navigate('/cadastro'); }}
                  className="block w-full text-sm text-brand-muted hover:text-brand-primary transition-colors"
                >
                  Não tem conta? Cadastre-se
                </button>
                <button
                  onClick={() => { setMode('reset'); setError(''); setInfo(''); navigate('/recuperar-senha'); }}
                  className="block w-full text-sm text-brand-muted hover:text-brand-primary transition-colors"
                >
                  Esqueci minha senha
                </button>
              </>
            )}
            {mode !== 'login' && (
              <button
                onClick={() => { setMode('login'); setError(''); setInfo(''); navigate('/login'); }}
                className="text-sm text-brand-muted hover:text-brand-primary transition-colors"
              >
                Voltar ao login
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
