import { FileText } from 'lucide-react';

export default function Terms() {
  return (
    <div className="py-12 md:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center">
            <FileText size={24} className="text-brand-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-brand-primary">
              Termos de Uso
            </h1>
            <p className="text-sm text-brand-muted">Informações em revisão antes da publicação definitiva</p>
          </div>
        </div>

        <div className="prose prose-sm max-w-none text-brand-muted space-y-6">
          <section>
            <h2 className="font-display text-xl font-semibold text-brand-primary">1. Status deste conteúdo</h2>
            <p>
              Esta página está em revisão e não confirma, neste momento, condições comerciais,
              operacionais ou de atendimento. Informações confirmadas serão apresentadas antes
              de qualquer contratação ou agendamento.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-brand-primary">2. Serviços e informações</h2>
            <p>
              A disponibilidade, a descrição e as condições dos serviços serão exibidas apenas
              quando forem confirmadas no catálogo. Nenhum procedimento, preço ou benefício é
              declarado por esta página enquanto essas informações estiverem pendentes.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-brand-primary">3. Agendamentos</h2>
            <p>
              Quando o agendamento estiver disponível, as regras aplicáveis de confirmação,
              alteração, cancelamento e comparecimento serão informadas antes da conclusão.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-brand-primary">4. Pagamentos</h2>
            <p>
              As formas de pagamento, os valores e o momento de cobrança serão confirmados no
              fluxo de agendamento ou em comunicação oficial antes da contratação.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-brand-primary">5. Informações relevantes</h2>
            <p>
              Quando aplicável ao serviço confirmado, orientações e informações necessárias serão
              apresentadas previamente para que a pessoa possa decidir como deseja prosseguir.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-brand-primary">6. Conteúdo e imagens</h2>
            <p>
              O acervo visual exibido neste site é preservado sem afirmar procedimentos,
              resultados ou condições que não tenham sido confirmados. O uso de conteúdos segue
              as autorizações e os direitos aplicáveis.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-brand-primary">7. Atualizações</h2>
            <p>
              Esta página será atualizada quando as informações operacionais e comerciais forem
              confirmadas para publicação.
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
