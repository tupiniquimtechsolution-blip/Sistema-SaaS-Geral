# ASSET_AUDIT — Metal & Art Serralheria

Auditoria de assets — coleta em **22/08/2026**.

## Quantidades

| Fonte | Encontrado | Utilizado no site | Observação |
|---|---|---|---|
| Imagens reais da empresa (Instagram) | ~20+ publicações visíveis | **0 arquivos baixados** | 5 publicações **catalogadas com link para o original** |
| Imagens reais (Google Maps / ficha) | fotos públicas na ficha | 0 | Endereço validado pelo mapa incorporado |
| Site oficial (metaleartserralheria.com.br) | 7 imagens + textos | textos/slogan/serviços reaproveitados | imagens do site não reutilizadas |
| Avaliações Google (widget oficial no site) | 41 avaliações · EXCELENTE · 5,0 | 7 exibidas + nota/contagem | coletadas em 22/08/2026 |
| Imagens de referência (protótipo) | 10 geradas | 10 | placeholders ilustrativos |
| Vídeos reais | reels públicos no Instagram | 0 | solicitar ao cliente |
| Logotipo | presente no site/Instagram (sem arquivo acessível) | reprodução tipográfica fiel em código | solicitar vetor original |

## Inventário oficial recebido (Guia de Identidade — Google Drive)

**51 arquivos: 1 logo JPG + 36 fotos JPG + 14 vídeos MP4 (~6min35s).**
Arquivos ainda NÃO entregues ao projeto (apenas o guia). Quando recebidos,
salvar conforme CLIENT_REPLACEMENT_GUIDE.md e substituir as referências.

### Fotos por projeto (prefixo = mesmo projeto/carrossel)

| Prefixo | Qtd. | Conteúdo | Destino no site |
|---|---|---|---|
| 1771634656/657 | 9 | Grades/estruturas de proteção em janelas | Portfólio > Grades |
| 1771634799 | 4 | Porta/fechamento metálico + instalação | Portfólio > Portas e fechamentos |
| 1771634800 | 1 | Corrimão/rampa preto | Serviços > Corrimãos |
| 1771639042 | 2 + vídeo | Guarda-corpo preto ornamental | Case guarda-corpo (antes/depois) |
| 1771639815 | 1 + vídeo | Tela metálica suspensa interna | Projetos sob medida |
| 1771640508 | 8 | Residencial branco: guarda-corpo, grade, portão | Case residencial (mosaico) |
| 1771640657 | 3 | Cobertura/pergolado metálico | Serviços > Coberturas |
| 1771640874 | 3 | Painéis/tela metálica preta | Projetos especiais |
| 1784983926 | 2 + vídeo | Fechamento galvanizado + detalhe de fechadura | Fechaduras/segurança |
| 1784984255 | 3 + vídeo | Portão preto residencial instalado | Hero secundário / case de portão |

### Vídeos (mapa de uso definido no guia)

| Prefixo | Duração | Uso sugerido |
|---|---|---|
| 1775044474 | 12,0s | **Seção Processo/Bastidores (prioridade)** |
| 1774786200 | 83,3s | Recortes 6–10s para Automação (não publicar inteiro no hero) |
| 1784984255 | 34,9s | Case de portão instalado |
| 1774112432 | 45,5s | Portão verde — transformação/antes-depois |
| 1771634438 | 10,9s | Loop curto em Corrimãos |
| 1771639042 | 16,9s | Case pareado guarda-corpo |
| 1771639815 | 18,2s | Projetos especiais/interiores |
| 1774054576 | 15,6s | Demonstração de funcionamento (portão/grade) |
| 1775043504 | 44,4s | Clientes comerciais |
| 1775043910 | 39,5s | Grade/fechamento preto interno |
| 1775044199 | 13,1s | Cobertura/estrutura externa |
| 1775045580 | 12,0s | Estrutura decorativa colorida |
| 1775046057 | 25,9s | Carrinho/estrutura sob medida |
| 1784983926 | 22,9s | Detalhe de fechadura |

### Regras técnicas do guia para as mídias
- Converter para AVIF/WebP + JPG fallback; thumbnails e srcset.
- Vídeos: MP4 H.264 (+WebM), muted + playsinline, poster, lazy load;
  recortes de 6–10s para loops; versões completas em modal/portfólio.
- Logo: usar logo.jpg original SEM distorcer/recolorir; área de proteção escura.

## Placeholders restantes

**Nenhuma imagem gerada/banco é usada.** Todas as referências de mídia em
`src/config/assets.ts` apontam para a pasta local `public/client-assets/media/`,
que deve ser preenchida com os arquivos reais da pasta oficial do Drive:
`https://drive.google.com/drive/folders/1kdx8AvTpfgRugHaptm32c5k3GpL0W6Xi`
(inventário: 1 logo + 36 fotos + 14 vídeos).

Enquanto a pasta local não é preenchida, um guard global oculta as imagens
ausentes (sem ícone de "quebrado") e os slots exibem o fundo da marca.
O passo único de ativação está em `CLIENT_REPLACEMENT_GUIDE.md`.

Nenhuma obra de terceiro é atribuída à empresa; nenhum antes/depois é
apresentado como real até que o par do mesmo vão (1774112432) seja adicionado.

## Materiais a solicitar em HD ao cliente (checklist)

1. [ ] **Logotipo vetorial/original** (variações clara, escura e símbolo)
2. [ ] **Vídeo real** de fabricação/solda com faíscas (para o Hero)
3. [ ] Fotos reais em HD: portão deslizante, portão social, automação/motor,
      corrimão, grade de proteção, porta de enrolar, oficina/equipe
4. [ ] Par **antes/depois real do mesmo ângulo** (reforma de portão — ex.:
      publicação de 25/07/2026)
5. [ ] Reels para cases visuais (automação funcionando, reforma concluída)
6. [ ] Fotos da fachada/oficina (Google Maps ou próprias)
7. [ ] Autorização por escrito para exibir avaliações e fotos no site

## Informações a confirmar com o cliente

- [ ] Horários oficiais de atendimento (hoje: "consulte pelo WhatsApp")
- [ ] Raio exato de atendimento (hoje: Zona Leste + Centro SP confirmados)
- [ ] Recolher nota/contagem atuais da ficha do Google (última coleta: 22/08/2026)
- [ ] Endereço: nome completo do logradouro confirmado pelo mapa oficial
      (Rua Serra do Ouro Branco, 267 — Vila Carmosina); o rodapé do site
      atual abrevia para "Rua Serra do Ouro"
- [ ] E-mail `serralheria.metaleart@gmail.com` ainda ativo

## Riscos de direitos registrados

- Avaliações exibidas foram coletadas do widget publicado no **próprio site da
  empresa**; ainda assim, recomendar validação antes da publicação definitiva.
- Nenhum arquivo do Instagram foi baixado; os cards linkam para o conteúdo
  original na plataforma (sem UI, curtidas ou comentários do app).
