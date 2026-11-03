import PropertySearchHero from "../components/sections/PropertySearchHero";
import PropertyListingGrid from "../components/sections/PropertyListingGrid";
import MortgageCalculator from "../components/sections/MortgageCalculator";
import VirtualTourShowcase from "../components/sections/VirtualTourShowcase";
import NeighborhoodGuide from "../components/sections/NeighborhoodGuide";
import AppointmentScheduler from "../components/sections/AppointmentScheduler";
import NewsletterFooter from "../components/sections/NewsletterFooter";

export default function RealEstateShowcase() {
  return (
    <main className="min-h-screen bg-white antialiased">
      <PropertySearchHero />
      <PropertyListingGrid />
      <MortgageCalculator />
      <VirtualTourShowcase />
      <NeighborhoodGuide />
      <AppointmentScheduler />
      <NewsletterFooter />
    </main>
  );
}
