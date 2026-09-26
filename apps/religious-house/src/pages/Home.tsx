import Gallery from "../components/Gallery";
import Hero, { WelcomeScene } from "../components/Hero";
import {
  AxClosing,
  Depoimentos,
  ForcaDaGira,
  InstagramSection,
  LocationSection,
  NossaCasa,
  ProximosTrabalhos,
  ServiceCards,
} from "../components/HomeSections";
import { BotanicalDivider } from "../components/Ornaments";
import { SectionHeading, TempleButton } from "../components/ui";

export default function Home() {
  return (
    <>
      <WelcomeScene />
      <Hero />
      <NossaCasa />
      <BotanicalDivider className="py-2" />
      <ProximosTrabalhos />
      <ForcaDaGira />

      {/* 07 · Galeria */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Galeria"
            title={
              <>
                Um pouco da <em className="text-gold-700">nossa arte</em>
              </>
            }
            subtitle="Artes e referências que compõem a identidade da casa — as fotos reais chegam em breve."
          />
          <div className="mt-12">
            <Gallery limit={6} showFilters={false} />
          </div>
          <div className="mt-10 text-center">
            <TempleButton href="#/galeria" variant="secondary" arrow>
              Ver galeria completa
            </TempleButton>
          </div>
        </div>
      </section>

      {/* 08 · Atendimentos */}
      <section className="bg-mint-100/60 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Atendimentos"
            title={
              <>
                Como podemos te <em className="text-gold-700">acolher</em>
              </>
            }
            subtitle="Cada atendimento é marcado com carinho e respeito. Escolha o caminho e fale conosco."
          />
          <div className="mt-12">
            <ServiceCards />
          </div>
        </div>
      </section>

      <Depoimentos />
      <InstagramSection />
      <LocationSection />
      <AxClosing />
    </>
  );
}
