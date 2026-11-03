import Navbar from "../components/sections/Navbar";
import SplitHero from "../components/sections/SplitHero";
import DepthCarousel from "../components/sections/DepthCarousel";
import MasonryGallery from "../components/sections/MasonryGallery";
import StatsCounter from "../components/sections/StatsCounter";
import MarqueeTestimonials from "../components/sections/MarqueeTestimonials";
import CtaBanner from "../components/sections/CtaBanner";
import NewsletterFooter from "../components/sections/NewsletterFooter";

export default function CreativePortfolio() {
  return (
    <main className="min-h-screen bg-stone-50 antialiased">
      <Navbar />
      <SplitHero />
      <DepthCarousel />
      <MasonryGallery />
      <StatsCounter />
      <MarqueeTestimonials />
      <CtaBanner />
      <NewsletterFooter />
    </main>
  );
}
