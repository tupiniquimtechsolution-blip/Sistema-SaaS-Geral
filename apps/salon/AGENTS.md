# AGENTS.md — Vanessa Braz — Beleza & Autoestima

## MISSÃO
Construir uma aplicação web profissional para gestão de beleza e autoestima, com agendamento online, área do cliente, painel administrativo e pagamentos — seguindo padrões Tupiniquim de segurança, qualidade e governança.

## LEITURA OBRIGATÓRIA
1. `AGENTS.md` (este arquivo)
2. `.agents/skills/tupiniquim-toolbox/SKILL.md`
3. `.agent/MASTER_PLAN.md`
4. `.agent/STATUS.md`
5. `QWEN.md`
6. `docs/DESIGN_DIRECTION.md` e `docs/MEDIA_USAGE.md` antes de UI/mídia

## ESCOPO
- Site público (home, serviços, galeria, contato)
- Motor de agendamento persistido
- Autenticação real (Supabase Auth)
- Área do cliente e admin com RLS
- Pagamentos (DemoProvider → Mercado Pago sandbox)
- LGPD (consentimentos separados)
- CI, CodeQL, Dependabot

## ARQUITETURA
```
UI → Feature → Service → Repository → Provider/Supabase
```
- Frontend: React + Vite + Tailwind CSS
- Auth: Supabase Auth (sem senha na aplicação)
- Database: PostgreSQL via Supabase, migrations em `supabase/migrations/`
- Payments: webhook é autoridade
- Seed de produção: apenas dados confirmados / PENDENTE_DE_CONFIRMACAO
- Catálogo demo: `supabase/seed/demo.sql` e `VITE_DEMO_CATALOG=true` (nunca em produção)

## REGRAS
1. Nunca expor secrets no client-side
2. Service Role Key apenas server-side
3. Validação server-side obrigatória (Zod)
4. RLS default-deny em todas as tabelas
5. RBAC: admin | professional | customer
6. Não inventar preço, procedimento, depoimento, endereço ou canal de contato
7. Mobile first, WCAG AA, privacy by design
8. Documentar decisões em ADR

## SEGURANÇA
- [x] Default deny + FORCE RLS
- [x] RBAC por `profiles.role`
- [x] Validação de input (Zod)
- [x] Service Role isolada
- [x] Audit log
- [x] Preço copiado no banco
- [x] Double booking no banco
- [x] Webhook MP com HMAC oficial + lookup `/v1/payments/{id}`
- [ ] Rate limiting (pendente edge)
- [ ] CSP headers no deploy

## LGPD
- [x] Consentimento operacional
- [x] Consentimento marketing separado
- [x] Consentimento uso de imagem separado
- [x] Política e termos
- [ ] Exportação de dados
- [ ] Exclusão de conta

## TESTES
- [x] Unit
- [x] Integration (domínio)
- [x] Security (negativos + isolamento de demo)
- [x] E2E lógico
- [x] Postgres real (migrations/RLS) quando `DATABASE_URL` está definido; obrigatório no CI

## QUALITY GATES
```bash
npm run lint
npm run typecheck
npm test
npm run test:security
npm run build
```

## GITHUB
- Repositório: `tupiniquimtechsolution-blip/Vanessa-Braz`
- Branch desta sessão: `arena/01a0a695-vanessa-braz`
- PR: não mergear `main` sem auditoria
- CI: `.github/workflows/ci.yml`
- CodeQL: `.github/workflows/codeql.yml`
- Dependabot: `.github/dependabot.yml`
