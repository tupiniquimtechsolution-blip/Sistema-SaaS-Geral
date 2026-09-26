import { Hero } from "../components/Hero";
import { AboutSection } from "../components/AboutSection";
import { ServicesSection } from "../components/ServicesSection";
import { Spaces } from "../components/Spaces";
import { Portfolio } from "../components/Portfolio";
import { BeforeAfter, Diagnostic } from "../components/Interactives";
import { HowWeWork } from "../components/Process";
import { Reviews, InstaStrip, Location, FinalCta } from "../components/Social";
import { FaqSection } from "../components/FaqSection";
import { WeldDivider } from "../components/ui";

export function Home() {
  return (
    <>
      <Hero />
      <AboutSection />
      <ServicesSection />
      <Spaces />
      <Portfolio mode="home" />
      <BeforeAfter />
      <Diagnostic />
      <div className="bg-coal-950 px-5 py-4 md:px-8">
        <div className="mx-auto max-w-[1440px]">
          <WeldDivider />
        </div>
      </div>
      <HowWeWork />
      <Reviews />
      <InstaStrip />
      <Location />
      <FaqSection />
      <FinalCta />
    </>
  );
}
