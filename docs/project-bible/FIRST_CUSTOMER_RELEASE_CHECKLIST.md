# Checklist — Primeiro Cliente Novo / Release Comercial

Use este checklist na task #13. Não considerar o primeiro onboarding concluído apenas porque o site foi publicado.

## A. Produto

- [ ] vertical correto selecionado;
- [ ] tenant criado sem fork;
- [ ] plano/entitlements configurados;
- [ ] Builder/onboarding suporta as mudanças necessárias sem edição ad hoc de código, exceto customização explicitamente contratada;
- [ ] conteúdo demo removido ou claramente isolado.

## B. Identidade e conteúdo

- [ ] nome comercial confirmado;
- [ ] logo/favicon autorizados;
- [ ] paleta/tipografia aprovadas;
- [ ] contatos confirmados;
- [ ] endereço/localização confirmados;
- [ ] horários confirmados;
- [ ] serviços/produtos/preços confirmados;
- [ ] claims/testemunhos/certificações têm fonte/autorização;
- [ ] textos legais/políticas revisados quando aplicável.

## C. Mídia

- [ ] arquivos tecnicamente válidos;
- [ ] versões web/responsivas quando necessário;
- [ ] alt text;
- [ ] sem EXIF/GPS indevido quando aplicável;
- [ ] autorização de publicação registrada para pessoas/imagens que exigem isso;
- [ ] assets privados não expostos publicamente.

## D. Segurança

- [ ] Auth configurado;
- [ ] owner/admin bootstrap seguro;
- [ ] permissions coerentes;
- [ ] RLS/default deny;
- [ ] cross-tenant negativo executado;
- [ ] service role ausente do browser;
- [ ] secrets em secret management;
- [ ] uploads validados;
- [ ] rate limits/anti-abuse onde necessário;
- [ ] CSP/headers compatíveis;
- [ ] CodeQL/dependency/secret checks sem bloqueio crítico.

## E. Fluxo crítico

Conforme vertical:

- [ ] booking/order/lead/quote funcionando;
- [ ] conflito/concorrência protegido no banco;
- [ ] estados e histórico corretos;
- [ ] e-mail/WhatsApp/notification configurados quando contratados;
- [ ] provider de pagamento configurado e testado quando aplicável;
- [ ] webhook autenticado/idempotente;
- [ ] preço/valor validado server-side.

## F. Billing do SaaS

- [ ] plano contratado confere com entitlements;
- [ ] cobrança/assinatura criada;
- [ ] status de assinatura reflete provider;
- [ ] upgrade/downgrade/cancelamento têm regra;
- [ ] invoice/registro comercial disponível conforme operação;
- [ ] add-ons e setup documentados.

## G. Preview

- [ ] preview privado gerado;
- [ ] desktop/mobile revisados;
- [ ] navegação e CTAs revisados;
- [ ] formulários testados;
- [ ] imagens e fontes carregam;
- [ ] console/network sem falhas relevantes;
- [ ] cliente aprovou versão/publicação por canal rastreável.

## H. Release

- [ ] branch/release correta;
- [ ] CI verde;
- [ ] migrations aplicadas/reconciliadas;
- [ ] backup/rollback proporcional ao risco;
- [ ] deploy concluído;
- [ ] smoke test pós-deploy;
- [ ] domínio/SSL funcionando;
- [ ] tenant resolution correta;
- [ ] observabilidade ativa;
- [ ] alertas essenciais configurados.

## I. Qualidade

- [ ] E2E crítico;
- [ ] acessibilidade;
- [ ] Lighthouse/Core Web Vitals em nível aceitável para o release;
- [ ] responsividade;
- [ ] reduced motion;
- [ ] SEO básico quando público;
- [ ] links sociais/contatos reais;
- [ ] mapa/localização quando contratado e confirmado.

## J. Operação e suporte

- [ ] owner/gestor treinado;
- [ ] usuários convidados;
- [ ] guia rápido entregue;
- [ ] canal de suporte definido;
- [ ] SLA/horário de suporte conhecido;
- [ ] responsáveis internos claros;
- [ ] revisão de 7 dias agendada/planejada;
- [ ] revisão de 30 dias planejada.

## K. Financeiro e aprendizagem

Registrar:

- preço contratado;
- setup contratado/isento;
- horas reais de implantação;
- custo de providers;
- origem do lead/CAC quando disponível;
- objeções comerciais;
- customizações solicitadas;
- incidentes/dúvidas;
- oportunidades de produto.

## Critério final

Task #13 só pode ir para `Concluída` quando o tenant novo tiver sido provisionado, aprovado, publicado e operacional pelo fluxo padrão, com os gates aplicáveis acima registrados. Documentação/proposta sem onboarding real não satisfaz o critério.
