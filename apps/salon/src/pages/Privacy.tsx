import { Shield } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="py-12 md:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center">
            <Shield size={24} className="text-brand-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-brand-primary">
              Política de Privacidade
            </h1>
            <p className="text-sm text-brand-muted">Conteúdo em revisão antes da publicação definitiva</p>
          </div>
        </div>

        <div className="prose prose-sm max-w-none text-brand-muted space-y-6">
          <section>
            <h2 className="font-display text-xl font-semibold text-brand-primary">1. Status deste conteúdo</h2>
            <p>
              Esta é uma versão de trabalho e não substitui uma política de privacidade publicada.
              As informações de contato, tratamento de dados, retenção e atendimento aos direitos
              serão confirmadas antes de disponibilizar o serviço ao público.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-brand-primary">2. Dados no fluxo</h2>
            <p>
              Quando configurado, o aplicativo pode solicitar dados necessários para criar conta e
              agendamento, como nome, e-mail, telefone e informações da reserva. Não há declaração
              nesta página sobre coleta adicional enquanto a configuração de produção estiver pendente.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-brand-primary">3. Finalidades</h2>
            <p>
              As finalidades, as bases legais e os canais de comunicação aplicáveis serão publicados
              junto da política definitiva e das informações comerciais confirmadas.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-brand-primary">4. Consentimentos</h2>
            <p>
              O fluxo técnico separa o consentimento operacional dos consentimentos opcionais de
              marketing e de uso de imagem. Os textos e as condições de publicação desses
              consentimentos serão confirmados antes da operação pública.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-brand-primary">5. Direitos e solicitações</h2>
            <p>
              Os canais e o procedimento para solicitações relacionadas a dados pessoais serão
              informados quando estiverem confirmados. Até lá, esta página não anuncia prazo,
              responsável ou canal de atendimento.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-brand-primary">6. Segurança e retenção</h2>
            <p>
              A configuração de produção, as medidas aplicáveis e os períodos de retenção serão
              documentados antes do lançamento. Não há promessa pública de certificação, prazo ou
              nível de proteção nesta versão.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-brand-primary">7. Atualizações</h2>
            <p>
              Esta página será atualizada quando as informações operacionais, jurídicas e de contato
              forem confirmadas para publicação.
            </p>
            <p className="mt-4 text-xs text-brand-muted italic">
              Status: conteúdo em revisão — DADOS_DEMONSTRATIVOS
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
