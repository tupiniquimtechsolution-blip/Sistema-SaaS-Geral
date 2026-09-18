# TENANT DOMAIN ARCHITECTURE

Data: 2026-09-18 · Preparação arquitetural — NENHUM domínio registrado/DNS
alterado nesta Wave.

## Modelo

```text
Vercel Project (saas-pet)              ← aplicação deployable (código)
   ├── tenant pet-a  → pet-a.vercel.app (alias de preview/demo) ou pet-a.com.br
   ├── tenant pet-b  → pet-b.com.br
   └── tenant pet-c  → cliente-c.<dominio-plataforma> (futuro)
        todos: mesmo código, mesmo Supabase (mmykyzzkcugxunmekwew)
        cada um: tenant_brands / tenant_themes / tenant_settings /
                 tenant_domains / entitlements / dados próprios (RLS)
```

- **Vercel Project ≠ Tenant.** Fork de código por cliente é proibido.
- Domínio é **configuração runtime**: `tenant_domains` (schema canônico) é a
  tabela de resolução hostname→tenant.

## Estratégias de domínio (por fase)

1. **Fase atual (preview/demo):** `saas-bakery.vercel.app` etc. — um domínio
   por aplicação; tenant demonstração resolvido por configuração explícita
   (não por hostname).
2. **Fase comercial por tenant:** dois caminhos suportados:
   - **Subdomínio do cliente no vercel.app** (alias por tenant) — simples,
     adequado a demo/pilot;
   - **Domínio próprio do cliente** (`cliente.com.br`) apontando (CNAME) para
     o projeto do vertical — exigirá verificar domínio em `tenant_domains`
     e validação de hostname.
3. **Fase plataforma:** domínio próprio da plataforma
   (`cliente.<dominio-plataforma>`), wildcard → projeto do vertical.

## Resolução de tenant (FUTURA — NÃO implementada nesta Wave)

```text
request → hostname → lookup tenant_domains (RLS-safe, server-side)
        → tenant_id válido? → TenantContext (brand/theme/settings/entitlements)
        → inválido/desconhecido → deny/página neutra (nunca fallback silencioso)
```

**Regra de segurança invariante:** o hostname é DICA de resolução, nunca
autorização. O tenant resolvido por hostname deve ser validado contra o banco
(mesma regra de membership do packages/tenancy) e toda leitura permanece sob
RLS. Nenhum roteamento inseguro baseado em Host header confiado cegamente.

## Non-goals desta Wave

- Registrar/comprar domínios; alterar DNS; configurar domínios no Vercel.
- Implementar resolução hostname→tenant no código (fase futura com
  `tenant_domains` + server-side validation + testes negativos).
