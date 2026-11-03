import Navbar from "../components/sections/Navbar";
import GradientHero from "../components/sections/GradientHero";
import LogoCloud from "../components/sections/LogoCloud";
import BentoGrid from "../components/sections/BentoGrid";
import DepthCarousel from "../components/sections/DepthCarousel";
import MarqueeTestimonials from "../components/sections/MarqueeTestimonials";
import PricingTable from "../components/sections/PricingTable";
import FaqAccordion from "../components/sections/FaqAccordion";
import CtaBanner from "../components/sections/CtaBanner";
import NewsletterFooter from "../components/sections/NewsletterFooter";

export default function SaasLanding() {
  return (
    <main className="min-h-screen bg-zinc-950 antialiased">
      <Navbar />
      <GradientHero />
      <LogoCloud />
      <BentoGrid />
      <DepthCarousel />
      <MarqueeTestimonials />
      <PricingTable />
      <FaqAccordion />
      <CtaBanner />
      <NewsletterFooter />
    </main>
  );
}
