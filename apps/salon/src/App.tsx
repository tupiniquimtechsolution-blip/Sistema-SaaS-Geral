import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Services from './pages/Services';
import Booking from './pages/Booking';
import Login from './pages/Login';
import ClientArea from './pages/ClientArea';
import Admin from './pages/Admin';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import GalleryPage from './pages/Gallery';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes with Layout */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/servicos" element={<Layout><Services /></Layout>} />
        <Route path="/servicos/:slug" element={<Layout><Services /></Layout>} />
        <Route path="/galeria" element={<Layout><GalleryPage /></Layout>} />
        <Route path="/agendar" element={<Layout><Booking /></Layout>} />
        <Route path="/login" element={<Layout><Login /></Layout>} />
        <Route path="/cadastro" element={<Layout><Login /></Layout>} />
        <Route path="/recuperar-senha" element={<Layout><Login /></Layout>} />
        <Route path="/minha-conta" element={<Layout><ClientArea /></Layout>} />
        <Route path="/minha-conta/agendamentos" element={<Layout><ClientArea /></Layout>} />
        <Route path="/minha-conta/pagamentos" element={<Layout><ClientArea /></Layout>} />
        <Route path="/contato" element={<Layout><Contact /></Layout>} />
        <Route path="/localizacao" element={<Layout><Contact /></Layout>} />
        <Route path="/politica-de-privacidade" element={<Layout><Privacy /></Layout>} />
        <Route path="/termos" element={<Layout><Terms /></Layout>} />

        {/* Admin Route (own layout) */}
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/*" element={<Admin />} />

        {/* 404 */}
        <Route path="*" element={
          <Layout>
            <div className="py-20 text-center">
              <h1 className="font-display text-4xl font-bold text-brand-primary mb-4">404</h1>
              <p className="text-brand-muted mb-6">Página não encontrada</p>
              <a href="/" className="inline-flex items-center px-6 py-3 bg-brand-primary text-white font-medium rounded-full hover:bg-brand-wine/90 transition-colors">
                Voltar ao Início
              </a>
            </div>
          </Layout>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
