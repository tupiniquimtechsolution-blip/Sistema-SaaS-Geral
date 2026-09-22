# Registro de Riscos e Decisões

## Decisões canônicas

### D-001 — Cliente é tenant, não fork
**Status:** RATIFICADA.  
Todo novo cliente utiliza vertical existente + configuração/tenant. Fork somente por exceção arquitetural formalmente aprovada.

### D-002 — Platform ≠ Builder
**Status:** RATIFICADA.  
`apps/platform` é control plane interno. `apps/builder` será Site Builder / Preview Studio para edição de branding/conteúdo/mídia e aprovação/publicação.

### D-003 — Supabase compartilhado como backend canônico
**Status:** RATIFICADA.  
Tenancy/RBAC/RLS/entitlements são compartilhados. Nenhuma mutation remota fora de migration/gate autorizado.

### D-004 — Cloudflare como hosting alvo
**Status:** RATIFICADA.  
Workers + Static Assets por app/vertical. Vercel permanece rollback até aceite completo. DNS real é owner-gated.

### D-005 — Vanessa Braz é tenant/template de Salon
**Status:** RATIFICADA.  
Não duplicar backend Vanessa dentro do Core. Reconciliar REUSE/ADAPT/NEW/DROP.

### D-006 — LED repo identificado sem fonte executável
**Status:** RATIFICADA em 22/09/2026.  
Repo: `tupiniquimtechsolution-blip/LED`. Localização do repo está resolvida; importação permanece bloqueada por falta de código/mídia executável versionada.

## Riscos ativos

| ID | Risco | Prob. | Impacto | Mitigação | Estado |
|---|---|---|---|---|---|
| R-001 | Builder virar fork visual por vertical | média | alto | schema comum Page/Section/Theme/Media + adapters | aberto |
| R-002 | Configuração tenant causar vazamento cross-tenant | baixa após RLS | crítico | RLS/default-deny + negative tests | controlado, revalidar E2E |
| R-003 | Billing duplicar cobrança/webhook | média | crítico | assinatura + idempotência + replay tests | aberto |
| R-004 | DNS customizado derrubar site | média | alto | preview, verificação, staged cutover, rollback | aberto / owner-gated |
| R-005 | Mídia Vanessa regressar/desaparecer | alta observada | médio/alto | manifest único, provenance, asset smoke test | em tratamento |
| R-006 | Publicar mídia sem autorização | média | alto | gate de publication authorization separado do arquivo técnico | aberto |
| R-007 | LED ser reconstruído por suposição | média | alto | fail-closed: recuperar fonte real; não inventar | bloqueado controlado |
| R-008 | Vertical Religious House expor dado sensível | baixa se gates mantidos | crítico | entitlement + RBAC + RLS + minimização LGPD | aberto/controlado |
| R-009 | Documentação divergir de GitHub | média | médio | Agenor: GitHub → Notion → Miro; ledger versionado | aberto/controlado |
| R-010 | Pricing subestimar suporte humano | alta inicial | alto | cohort 3–5 clientes + time tracking + revisão trimestral | aberto |
| R-011 | Cloudflare/Vercel estados divergirem | média | médio | matriz de deploy + rollback versionado | aberto |
| R-012 | CI ficar verde sem cobrir fluxo comercial | média | alto | E2E real e release checklist obrigatório | aberto |

## Riscos aceitos temporariamente

- Vercel coexistir com Cloudflare durante migração: aceito como rollback.
- Domínio `workers.dev` para validação: aceito antes do cutover de domínio real.
- Apps placeholder (`builder`, `salon`, `religious-house`, `led`) existirem: aceito apenas enquanto status permanecer explícito e sem falso `PASS`.

## Regra de escalonamento

Qualquer mudança que envolva:
- DNS/nameserver;
- gasto pago recorrente novo;
- destructive migration;
- deleção de mídia/dados;
- merge em `main`;
- publicação de dado sensível;

exige autorização explícita do owner e plano de rollback.
