# Arquitetura e estrutura profissional

## Estrutura atual + alvo

```text
Sistema-SaaS-Geral/
├─ apps/
│  ├─ platform/              # control plane interno
│  ├─ builder/               # Site Builder / Preview Studio (em construção)
│  ├─ bakery/
│  ├─ pet/
│  ├─ restaurant/
│  ├─ metalart/
│  ├─ heavy-machinery/
│  ├─ religious-house/
│  ├─ salon/
│  └─ led/
├─ packages/
│  ├─ saas-core/
│  ├─ database/
│  ├─ auth/
│  ├─ tenancy/
│  ├─ ui/                    # planejado: primitives compartilhados, sem apagar identidade
│  ├─ brand-engine/          # planejado
│  ├─ content/               # planejado: page/section/config contracts
│  ├─ media/                 # planejado: media contracts/processors
│  ├─ billing/               # consolidar quando provider for integrado
│  ├─ integrations/          # conectores/webhooks
│  └─ observability/         # logs/audit/metrics
├─ supabase/
│  ├─ migrations/
│  └─ seed.sql
├─ scripts/
│  ├─ qa/
│  ├─ deploy/
│  └─ maintenance/
├─ infra/
│  └─ cloudflare/
├─ docs/
│  ├─ project-bible/
│  ├─ adr/
│  ├─ runbooks/
│  ├─ handoffs/
│  ├─ migrations/
│  └─ prompts/
└─ .agents/skills/tupiniquim-toolbox/
```

## Regra de estruturação

Pastas planejadas **não devem virar pacotes vazios artificiais**. Criar código/pacote somente quando houver contrato real, testes e dono claro. A árvore acima é o destino arquitetural, não justificativa para gerar boilerplate sem uso.

## Limites entre camadas

### `apps/platform`
Administração da plataforma: status, tenants, verticais, deploys, domínios, planos e saúde operacional. Não editar diretamente o conteúdo visual de sites.

### `apps/builder`
Experiência de edição: selecionar tenant/vertical, editar draft, visualizar, aprovar e solicitar publicação. Não pode possuir `service_role`, secrets ou autorização própria fora do SaaS Core.

### Verticais
Renderizam configuração autorizada do tenant e mantêm componentes/UX específicos do segmento. Hard-code de marca deve migrar gradualmente para configuração sem apagar a experiência premium.

### Packages
Contratos compartilhados, independentes de um cliente específico. Nunca adicionar lógica do tipo `if tenant === "cliente-x"` para customização ordinária.

## Contrato mínimo do Builder

```ts
type SiteDraft = {
  tenantId: string;
  verticalId: string;
  revision: number;
  brand: { logo?: string; favicon?: string; colors: Record<string,string>; fonts?: Record<string,string> };
  contact: { phone?: string; whatsapp?: string; instagram?: string; address?: string; mapsUrl?: string };
  pages: Array<{ slug: string; title: string; sections: SiteSection[] }>;
  media: Array<{ id: string; kind: 'image'|'video'; src: string; alt?: string }>;
  integrations: Record<string, { enabled: boolean; configRef?: string }>;
  status: 'draft'|'preview'|'approved'|'published';
};
```

Mutação futura exige autenticação, membership, permission, validation schema, audit log e RLS. Draft local/protótipo não deve ser confundido com persistência de produção.

## Decisões arquiteturais

- **ADR-001:** um Supabase compartilhado, isolamento por tenant/RLS.
- **ADR-002:** Worker/deploy por app/vertical, tenant por configuração/domínio.
- **ADR-003:** Control Plane separado do Builder.
- **ADR-004:** Cloudflare Workers + Static Assets como hosting alvo atual.
- **ADR-005:** domínio customizado mapeia hostname→tenant; não cria fork.
- **ADR-006:** conteúdo/mídia legítima preservados; derivados não substituem fonte sem rastreabilidade.
