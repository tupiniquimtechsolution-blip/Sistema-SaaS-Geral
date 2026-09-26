# TENANT DOMAIN ARCHITECTURE

Data: 2026-09-26 · infraestrutura canônica: Cloudflare Workers / Static Assets.

## Modelo

```text
Cloudflare Worker do vertical             ← aplicação deployable (código)
   ├── tenant-a → domínio customizado
   ├── tenant-b → domínio customizado
   └── tenant-c → subdomínio da plataforma
        todos: mesmo código, mesmo backend multi-tenant
        cada um: tenant_brands / tenant_themes / tenant_settings /
                 tenant_domains / entitlements / dados próprios (RLS)
```

- **Worker ≠ Tenant.** Fork de código por cliente é proibido.
- Domínio é configuração runtime em `tenant_domains`.
- Cloudflare é a única infraestrutura canônica de publicação; Vercel não integra o caminho de release.

## Estratégias

1. **QA/release:** endpoint `workers.dev` do Worker do vertical.
2. **Comercial:** domínio próprio do cliente associado ao Worker e registrado em `tenant_domains`.
3. **Plataforma:** subdomínio de domínio controlado pela plataforma, resolvido pelo mesmo mecanismo.

## Resolução segura

```text
request → hostname normalizado → tenant_domains
        → domínio ativo/verificado? → tenant_id
        → TenantContext + entitlements + RLS
        → desconhecido/inativo → deny/página neutra
```

O hostname é apenas chave de resolução, nunca autorização. Toda leitura/escrita continua sujeita a RLS/RBAC e aos entitlements. Não há fallback silencioso para tenant demo em produção e query string não pode trocar tenant.

## Operação Cloudflare

- associação de domínio/route deve ser idempotente e auditável;
- TLS/SSL é gerenciado pela Cloudflare após associação válida;
- remover/alterar DNS real exige autorização explícita do owner;
- rollback restaura a route/versão anterior sem alterar dados tenant;
- `workers.dev` permanece disponível para QA enquanto o release é validado.

## Gates antes de domínio comercial

- domínio existe em `tenant_domains` e pertence ao tenant correto;
- status ativo/verificado;
- teste negativo hostname desconhecido;
- teste negativo tenant A → domínio B;
- nenhuma confiança em `Host` sem lookup canônico;
- smoke HTTPS/asset/SPA após associação;
- rollback documentado e testável.

## Estado do Release

A arquitetura e o contrato estão definidos. A associação de DNS/domínio real permanece uma ação operacional externa e não deve ser simulada nem executada sem autorização explícita.
