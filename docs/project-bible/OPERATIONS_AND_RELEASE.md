# Operações, onboarding, release e suporte

## Onboarding comercial padrão

1. Criar tenant no SaaS Core.
2. Associar owner/membership.
3. Selecionar vertical.
4. Selecionar plano e entitlements.
5. Aplicar branding/configuração inicial.
6. Importar conteúdo/mídia legítimos.
7. Configurar contatos e integrações públicas.
8. Gerar preview privado revisionado.
9. Obter aprovação do cliente/owner.
10. Publicar no Worker/vertical correspondente.
11. Associar domínio quando autorizado.
12. Rodar smoke pós-deploy.
13. Registrar release, revision, URL, rollback e aceite.

Nenhum passo ordinário deve exigir fork por cliente.

## Fluxo de publicação

`draft → preview → approved → publishing → published`.

Falha em build/deploy/smoke retorna para estado seguro anterior; nunca sobrescrever a última versão saudável sem rollback disponível.

## Cloudflare

Alvo atual: Workers + Static Assets. Cada app/vertical tem Worker próprio; tenants usam configuração/domínio, não Worker individual por padrão.

Checklist:
- branch correta;
- build command correto;
- deploy command correto;
- assets `dist`;
- SPA fallback quando aplicável;
- URL `workers.dev` capturada;
- HTTP 200;
- assets 200;
- refresh de rota;
- console/network;
- identidade visual;
- revisão mobile.

## Rollback

Enquanto a migração não estiver encerrada, Vercel permanece rollback. Em produção Cloudflare, manter referência da versão/revision anterior e documentação de reversão antes de promover nova release.

## Domínios

Domínio real/nameserver/DNS exige autorização explícita. O produto deve manter mapping `hostname → tenant`, validação de ownership e certificado/SSL automatizado quando a implementação for liberada.

## Suporte sugerido

- Start: assíncrono, horário comercial, sem SLA contratual rígido até maturidade operacional.
- Pro: prioridade moderada e canal definido.
- Business: SLA comercial documentado, janela de atendimento e escalonamento.
- Scale: SLA customizado, responsáveis e processo de incidente.

Nunca prometer 24/7 antes de existir escala operacional para cumprir.

## Incidentes

Classificar severidade, registrar impacto/tenant/versão, preservar logs sem PII desnecessária, mitigar, fazer rollback quando seguro, comunicar clientes afetados, documentar causa raiz e ação preventiva.

## Métricas mínimas

- MRR/ARR;
- churn e expansão;
- tenants ativos;
- conversão preview→publicação;
- tempo médio de onboarding;
- deploy success rate;
- incidentes por release;
- custo infra por tenant;
- tickets por tenant/plano;
- ativação de features/entitlements.

## Release comercial final

A release “comercializável” exige evidência do primeiro tenant criado do zero pelo fluxo padrão, publicado sem fork e com aceite registrado. Até isso ocorrer, `COMMERCIAL_MODEL_READY` pode ser PASS documental, mas `END_TO_END_COMMERCIAL_RELEASE` permanece NOT RUN.
