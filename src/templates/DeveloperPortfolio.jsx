import TerminalHero from "../components/sections/TerminalHero";
import ProjectShowcaseGrid from "../components/sections/ProjectShowcaseGrid";
import ExperienceTimeline from "../components/sections/ExperienceTimeline";
import SkillMatrix from "../components/sections/SkillMatrix";
import CaseStudyHighlight from "../components/sections/CaseStudyHighlight";
import MultiStepInquiryForm from "../components/sections/MultiStepInquiryForm";
import NewsletterFooter from "../components/sections/NewsletterFooter";

export default function DeveloperPortfolio() {
  return (
    <main className="min-h-screen bg-slate-950 antialiased">
      <TerminalHero />
      <ProjectShowcaseGrid />
      <ExperienceTimeline />
      <SkillMatrix />
      <CaseStudyHighlight />
      <MultiStepInquiryForm />
      <NewsletterFooter />
    </main>
  );
}
