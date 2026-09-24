import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, MessageCircle, Instagram, MapPin, Phone } from 'lucide-react';
import {
  businessInfo,
  businessMapsUrl,
  businessPhoneUrl,
  isPublicHandleConfigured,
  isWhatsAppConfigured,
} from '../lib/data';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin) return <>{children}</>;

  const navLinks = [
    { to: '/', label: 'Início' },
    { to: '/servicos', label: 'Serviços' },
    { to: '/galeria', label: 'Galeria' },
    { to: '/agendar', label: 'Agendar' },
    { to: '/contato', label: 'Contato' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-brand-background">
      <header className="sticky top-0 z-50 bg-white border-b border-brand-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link to="/" className="flex items-center gap-3">
              <span className="font-display text-xl md:text-2xl text-brand-text font-light tracking-tight">Vanessa Braz</span>
            </Link>
            <nav className="hidden md:flex items-center gap-8" aria-label="Navegação principal">
              {navLinks.map(link => (
                <Link key={link.to} to={link.to} className={`text-sm tracking-wide transition-colors ${location.pathname === link.to ? 'text-brand-text' : 'text-brand-muted hover:text-brand-text'}`}>
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-4">
              <Link to="/agendar" className="hidden sm:inline-flex items-center px-5 py-2 bg-brand-text text-white text-sm tracking-wide hover:bg-brand-text/90 transition-colors">Agendar</Link>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-brand-muted hover:text-brand-text" aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={mobileMenuOpen}>
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-brand-surface bg-white animate-fade-in">
            <nav className="px-4 py-6 space-y-1" aria-label="Navegação mobile">
              {navLinks.map(link => (
                <Link key={link.to} to={link.to} onClick={() => setMobileMenuOpen(false)} className={`block px-4 py-3 text-sm tracking-wide transition-colors ${location.pathname === link.to ? 'text-brand-text font-medium' : 'text-brand-muted hover:text-brand-text'}`}>{link.label}</Link>
              ))}
              <div className="pt-4 mt-4 border-t border-brand-surface"><Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm text-brand-muted hover:text-brand-text">Minha Conta</Link></div>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1" role="main">{children}</main>

      <footer className="bg-brand-text text-white" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-5">
              <h2 className="font-display text-2xl font-light mb-4">Vanessa Braz</h2>
              <p className="text-white/50 text-sm leading-relaxed max-w-sm">Beleza & Autoestima. Informações de serviços e disponibilidade são publicadas após confirmação.</p>
            </div>
            <div className="md:col-span-3">
              <h3 className="text-xs uppercase tracking-[0.2em] text-white/40 mb-6">Navegação</h3>
              <ul className="space-y-3">
                <li><Link to="/servicos" className="text-white/70 hover:text-white text-sm transition-colors">Serviços</Link></li>
                <li><Link to="/galeria" className="text-white/70 hover:text-white text-sm transition-colors">Galeria</Link></li>
                <li><Link to="/agendar" className="text-white/70 hover:text-white text-sm transition-colors">Agendar</Link></li>
                <li><Link to="/contato" className="text-white/70 hover:text-white text-sm transition-colors">Contato</Link></li>
              </ul>
            </div>
            <div className="md:col-span-4">
              <h3 className="text-xs uppercase tracking-[0.2em] text-white/40 mb-6">Contato</h3>
              <ul className="space-y-3 text-white/70 text-sm">
                {isPublicHandleConfigured(businessInfo.instagram) && <li><a href={businessInfo.instagramUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-white"><Instagram size={15} />{businessInfo.instagram}</a></li>}
                <li><a href={businessPhoneUrl} className="inline-flex items-center gap-2 hover:text-white"><Phone size={15} />{businessInfo.phone}</a></li>
                <li><a href={businessMapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-white"><MapPin size={15} />{businessInfo.address}</a></li>
                <li className="pt-2"><span className="text-white/40 text-xs">Horários</span><br />PENDENTE_DE_CONFIRMACAO</li>
              </ul>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/30 text-xs">© {new Date().getFullYear()} Vanessa Braz. Informações sujeitas a confirmação.</p>
            <div className="flex items-center gap-6">
              <Link to="/politica-de-privacidade" className="text-white/30 text-xs hover:text-white/60 transition-colors">Privacidade</Link>
              <Link to="/termos" className="text-white/30 text-xs hover:text-white/60 transition-colors">Termos</Link>
            </div>
          </div>
        </div>
      </footer>

      {isWhatsAppConfigured(businessInfo.whatsapp) && (
        <a href={`https://wa.me/${businessInfo.whatsapp}?text=${encodeURIComponent('Olá! Gostaria de agendar um horário.')}`} target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-brand-text hover:bg-brand-text/90 text-white flex items-center justify-center shadow-lg transition-all" aria-label="Contato via WhatsApp">
          <MessageCircle size={24} />
        </a>
      )}
    </div>
  );
}
