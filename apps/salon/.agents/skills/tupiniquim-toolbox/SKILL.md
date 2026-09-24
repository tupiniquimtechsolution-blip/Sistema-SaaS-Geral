# Tupiniquim Toolbox — SKILL.md

## O QUE É
Conjunto de padrões, práticas e ferramentas para desenvolvimento de aplicações web brasileiras com foco em qualidade, segurança e governança.

## PRINCÍPIOS
1. **Local-first** — Produzir sem depender de serviços externos
2. **Segurança por design** — Default deny, mínimo privilégio
3. **LGPD compliance** — Privacy by Design
4. **Mobile first** — Smartphone é prioridade
5. **Acessibilidade** — WCAG AA mínimo
6. **Performance** — Bundle mínimo, lazy loading
7. **Documentação contínua** — Não deixar para o fim
8. **Adapter pattern** — Desacoplar integrações
9. **Demo mode** — Funcional sem credenciais
10. **Supply chain** — Auditar dependências

## ARQUITETURA
```
UI → Feature → Service → Repository → Provider
```
- Nunca chamar provider diretamente da UI
- Adapter para cada integração externa
- Interface estável, implementação substituível

## SEGURANÇA
### Obrigatório
- [ ] Service Role Key server-side only
- [ ] RLS em todas as tabelas
- [ ] Validação server-side (Zod)
- [ ] RBAC (admin | client)
- [ ] CSP headers
- [ ] Rate limiting
- [ ] Input sanitization
- [ ] Secure cookies
- [ ] IDOR protection
- [ ] Audit log

### Proibido
- ❌ Secrets no client bundle
- ❌ NEXT_PUBLIC_ para service role
- ❌ Senhas em texto plano
- ❌ Trust no frontend para auth
- ❌ Preços manipuláveis no browser

## LGPD
### Consentimentos Separados
1. **Necessário** — Funcionamento básico
2. **Marketing** — Promoções (opt-in)
3. **Imagem** — Uso de fotos (opt-in separado)

### Direitos do Titular
- Acesso
- Correção
- Exclusão
- Portabilidade
- Revogação
- Informação

## PAGAMENTOS
### Abstração
```typescript
interface PaymentProvider {
  createPayment(order: Order): Promise<PaymentResult>;
  confirmPayment(paymentId: string): Promise<PaymentStatus>;
  handleWebhook(payload: unknown): Promise<void>;
}
```

### Providers
- DemoPaymentProvider (desenvolvimento)
- MercadoPagoProvider (sandbox → produção)

### Regras
- Nunca armazenar cartão
- Frontend não confirma pagamento
- Webhook com signature validation
- Idempotency obrigatória

## DEPENDÊNCIAS
### Critérios
- Ativo e mantido
- Bundle size razoável
- TypeScript support
- Sem vulnerabilidades conhecidas
- Licença compatível

### Auditoria
- npm audit periódico
- Revisar antes de instalar
- Preferir soluções nativas

## GIT
### Commits
- Conventional commits
- Mensagens claras
- Commits atômicos
- Sem secrets

### Branches
- main (produção)
- dev (desenvolvimento)
- feature/* (features)
- fix/* (correções)

## DEPLOY
### Checklist
- [ ] Build passa
- [ ] Typecheck passa
- [ ] Sem secrets
- [ ] Variáveis configuradas
- [ ] Domain configurado
- [ ] SSL ativo
- [ ] CDN configurado

## QUALITY GATES
```bash
# Local
npm run typecheck
npm run build
# Futuro
npm run lint
npm run test
npm run test:security
npm run quality
```

## DOCUMENTAÇÃO
### Obrigatória
- README.md
- AGENTS.md
- MASTER_PLAN.md
- STATUS.md
- CHANGELOG
- ADRs para decisões

### Atualização Contínua
- STATUS.md a cada sessão
- CHANGELOG a cada mudança relevante
- ADR para decisões arquiteturais
