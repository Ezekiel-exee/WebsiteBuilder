import Navbar from "../components/sections/Navbar";
import GradientHero from "../components/sections/GradientHero";
import StatsCounter from "../components/sections/StatsCounter";
import BentoGrid from "../components/sections/BentoGrid";
import PricingTable from "../components/sections/PricingTable";
import FaqAccordion from "../components/sections/FaqAccordion";
import NewsletterFooter from "../components/sections/NewsletterFooter";

export default function StartupLaunch() {
  return (
    <main className="min-h-screen bg-white antialiased">
      <Navbar />
      <GradientHero />
      <StatsCounter />
      <BentoGrid />
      <PricingTable />
      <FaqAccordion />
      <NewsletterFooter />
    </main>
  );
}
