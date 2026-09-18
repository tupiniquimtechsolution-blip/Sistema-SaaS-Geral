import Hero from "../components/Hero";
import MenuBoard from "../components/MenuBoard";
import { ChefSpotlight, MarqueeStrip, OurStory, Promos, StorySticky } from "../components/SectionsA";
import { DeliverySection, FinalCTA, InstagramSection, LocationSection, Testimonials } from "../components/SectionsB";
import { SectionHeading } from "../components/ui";
import { menuItems } from "../config/menu";

export default function Home() {
  return (
    <>
      <Hero />
      <MarqueeStrip />

      {/* cardápio em destaque */}
      <section id="carta" className="bg-bg py-24 sm:py-28" aria-label="Cardápio em destaque">
        <div className="shell">
          <SectionHeading
            kicker="La Carte"
            title={
              <>
                O que sai <em className="font-wordmark not-italic text-ember">da cozinha</em>
              </>
            }
            description="Os clássicos da casa — toque em um item para ver ingredientes e personalizar. Reservas e pedidos fecham no WhatsApp."
          />
          <div className="mt-12">
            <MenuBoard items={menuItems} mode="home" />
          </div>
        </div>
      </section>

      <ChefSpotlight />
      <StorySticky />
      <Promos />
      <OurStory />
      <DeliverySection />
      <Testimonials />
      <LocationSection />
      <InstagramSection />
      <FinalCTA />
    </>
  );
}
