import { useState } from "react";
import { BUSINESS } from "../config/business";
import { generalMessage, usePageMeta, waLink } from "../lib/utils";
import { Btn, IcArrow, IcWhatsApp, Kicker, Reveal, SectionHead } from "../components/ui";

const ARTICLES = [
  {
    tag: "Vibração",
    title: "Vibração fraca no rolo? Comece pelo circuito hidráulico",
    minutes: 4,
    body: [
      "Quando o tambor perde amplitude, o primeiro suspeito é a bomba de vibração: vazão baixa não empurra o motor vibratório como deveria. Bombas Sundstrand e Sauer Danfoss, quando revisadas em bancada, voltam aos números de fábrica — e o laudo mostra isso antes de você pagar.",
      "Antes de condenar a bomba, confira o básico: nível e estado do óleo hidráulico, filtro entupido, mangueiras ressecadas e coxins do módulo. Metade das 'bombas ruins' que chegam no balcão são filtro vencido e óleo velho.",
      "Na dúvida, traga o rolo ou mande o modelo: a equipe técnica da Lusomaq indica o teste certo antes de vender a peça.",
    ],
  },
  {
    tag: "Tambor",
    title: "Duocone: a peça pequena que salva o tambor inteiro",
    minutes: 3,
    body: [
      "O duocone veda o eixo do tambor contra poeira e umidade. Quando ele falha, o rolamento trabalha sujo — e rolamento de tambor não é peça barata nem rápida de trocar em campo.",
      "Sinais de alerta: graxa saindo pela borda do tambor, pó fino acumulado no eixo e folga perceptível ao levantar o tambor com a pá. Na troca, limpe a sede com cuidado: assento arranhado mata o duocone novo em semanas.",
      "É a peça que mais sai do nosso balcão — sempre tem no estoque, com medida certa para CA150 e CA250.",
    ],
  },
  {
    tag: "Motor",
    title: "Perkins, MWM ou Deutz: manutenção que estica a vida",
    minutes: 5,
    body: [
      "Motor de rolo trabalha em regime que caminhão não conhece: rotação constante, poeira constante e calor de esteira. Por isso, filtro de ar é a manutenção mais barata que existe — e a mais negligenciada. Elemento de segurança trocado no prazo evita poeira fina no cilindro.",
      "Jogo de juntas merece atenção aos primeiros sinais de suor nas tampas: vazamento pequeno em motor quente vira poça e contamina correia e mangueira. Trocar o jogo completo sai mais barato que caçar vazamento depois.",
      "Trabalhamos com as linhas Perkins, MWM, Mercedes, Kubota, Deutz e Cummins — do filtro ao motor completo.",
    ],
  },
  {
    tag: "Rodado",
    title: "Pneu de rolo pneumático: pressão é especificação de obra",
    minutes: 4,
    body: [
      "Em compactação com pneumático, a pressão do pneu faz parte da receita da massa: pressão errada muda a pressão de contato e o grau de compactação medido no CBR. Não é detalhe — é especificação.",
      "Na escolha do pneu, lona reforçada para trabalho contínuo compensa em base e sub-base, onde o rolo roda carregado o dia inteiro. E conferir cubo e rolamento na troca evita parar a obra por roda travada.",
      "Goodyear e Continental nas medidas de rolo estão sempre no estoque — par ou jogo fechado com condição melhor.",
    ],
  },
  {
    tag: "Original × Compatível",
    title: "Peça original ou compatível: quando cada uma vale a pena",
    minutes: 5,
    body: [
      "Original é a escolha quando a especificação não admite conversa: bombas e motores hidráulicos calibrados, componentes internos de caixa e peças de segurança. Ali, o manual manda e a gente concorda.",
      "Compatível de procedência é ferramenta de custo inteligente em itens de desgaste: duocones, retentores, filtros, correias, bicos e coxins. O segredo é a seleção — peça compatível sem marca conhecida é loteria.",
      "No nosso balcão a regra é clara: dizemos qual é qual, qual marca está por trás e qual garantia acompanha. A decisão é sua, com a informação certa.",
    ],
  },
  {
    tag: "Logística",
    title: "Obra parada custa caro: como antecipar a reposição",
    minutes: 3,
    body: [
      "Peça de desgaste tem hora marcada para vencer — filtro, correia, bico, retentor. Montar um kit de reposição por rolo (dois filtros, jogo de correias, bicos reservas) custa pouco perto de um dia de usina parada.",
      "Para frotas, fazemos orçamento fechado com separação de estoque por contrato: a peça já está reservada quando você liga. E o despacho sai com transporte próprio ou pela transportadora que chegar primeiro.",
      "Mande a lista pelo site ou pelo WhatsApp — a condição para pedido fechado sempre compensa.",
    ],
  },
];

export default function Contents() {
  usePageMeta(
    `Conteúdos técnicos — ${BUSINESS.name}`,
    "Guias de manutenção para rolos compactadores: vibração, duocone, motores Perkins e MWM, pneus, peças originais e compatíveis, e logística de reposição.",
  );
  const [open, setOpen] = useState(0);
  const active = ARTICLES[open];

  return (
    <div className="pt-[120px] lg:pt-[150px]">
      <header className="border-b border-line-dark bg-coal-900">
        <div className="hazard-thin h-1.5 w-full opacity-60" aria-hidden="true" />
        <div className="mx-auto max-w-(--container-site) px-6 py-14">
          <Reveal><Kicker>Conhecimento de balcão</Kicker></Reveal>
          <Reveal delay={80}>
            <h1 className="mt-3 font-display text-[clamp(2.2rem,5.5vw,4rem)] uppercase leading-[0.95]">
              Conteúdos <span className="text-hz-400">técnicos</span>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-4 max-w-2xl text-lg text-steel-300">
              O que a gente explica no balcão todos os dias, agora por escrito — manutenção, escolha de peça e logística para quem vive de rolo.
            </p>
          </Reveal>
        </div>
      </header>

      <div className="mx-auto max-w-(--container-site) px-6 py-14">
        <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
          <nav aria-label="Lista de conteúdos" className="space-y-2">
            {ARTICLES.map((a, i) => (
              <button
                key={a.title}
                onClick={() => setOpen(i)}
                aria-pressed={open === i}
                className={`w-full border px-4 py-3.5 text-left transition-all duration-200 ${
                  open === i ? "border-hz-400 bg-hz-400/10" : "border-line-dark bg-coal-900 hover:border-steel-500"
                }`}
              >
                <p className="font-cond text-[11px] font-bold uppercase tracking-[0.2em] text-hz-300">{a.tag} · {a.minutes} min</p>
                <p className={`mt-1 font-display text-lg uppercase leading-tight ${open === i ? "text-hz-300" : "text-bone-100"}`}>{a.title}</p>
              </button>
            ))}
          </nav>

          <Reveal key={active.title}>
            <article className="border border-line-dark bg-coal-900 p-7 md:p-10">
              <p className="font-cond text-[12px] font-bold uppercase tracking-[0.24em] text-hz-300">{active.tag} · leitura de {active.minutes} min</p>
              <h2 className="mt-3 font-display text-3xl uppercase leading-tight md:text-4xl">{active.title}</h2>
              <div className="mt-6 space-y-5">
                {active.body.map((p) => (
                  <p key={p.slice(0, 24)} className="text-[16px] leading-relaxed text-steel-200">{p}</p>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-3 border-t border-line-dark pt-6">
                <Btn href={waLink(BUSINESS.whatsapp, `Olá! Li o conteúdo "${active.title}" no site da ${BUSINESS.name} e quero tirar uma dúvida.`)} tone="agri">
                  <IcWhatsApp size={16} /> Tirar dúvida no WhatsApp
                </Btn>
                <Btn to="/pecas" tone="outline">Ver peças <IcArrow size={15} /></Btn>
              </div>
            </article>
          </Reveal>
        </div>

        <Reveal className="mt-12">
          <div className="flex flex-wrap items-center justify-between gap-6 border border-line-dark bg-coal-900 p-7">
            <div>
              <Kicker>Sugestão de pauta?</Kicker>
              <p className="mt-2 font-display text-2xl uppercase">Conta pra gente qual dúvida falta responder.</p>
            </div>
            <Btn href={waLink(BUSINESS.whatsapp, generalMessage())} tone="hz">Enviar sugestão</Btn>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
