import { lazy } from "react";
import { COMPONENTS } from "./registry";

const templateModules = import.meta.glob("../templates/*.jsx");
const templateSourceModules = import.meta.glob("../templates/*.jsx", {
  query: "?raw",
  import: "default",
});

const byExportName = Object.fromEntries(
  Object.entries(COMPONENTS).map(([id, component]) => [component.exportName, id]),
);

function define({ component: componentName, sectionNames, ...template }) {
  const path = `../templates/${componentName}.jsx`;
  const componentLoader = templateModules[path];
  const sourceLoader = templateSourceModules[path];

  if (!componentLoader || !sourceLoader) {
    throw new Error(`Unknown template module: ${path}`);
  }

  const sections = sectionNames.map((name) => {
    const id = byExportName[name];
    if (!id) throw new Error(`Unknown section export in ${componentName}: ${name}`);
    return id;
  });

  return {
    ...template,
    sections,
    Component: lazy(componentLoader),
    loadSource: sourceLoader,
  };
}

export const TEMPLATES = [
  define({
    component: "SaasLanding",
    sectionNames: [
      "Navbar",
      "GradientHero",
      "LogoCloud",
      "BentoGrid",
      "DepthCarousel",
      "MarqueeTestimonials",
      "PricingTable",
      "FaqAccordion",
      "CtaBanner",
      "NewsletterFooter",
    ],
    id: "saas-landing",
    name: "SaaS Landing",
    description: "A complete dark-mode SaaS marketing page — hero, logos, bento features, carousel, testimonials, pricing, FAQ, CTA, and footer.",
    accent: "from-violet-500 to-cyan-400",
  }),
  define({
    component: "CreativePortfolio",
    sectionNames: [
      "Navbar",
      "SplitHero",
      "DepthCarousel",
      "MasonryGallery",
      "StatsCounter",
      "MarqueeTestimonials",
      "CtaBanner",
      "NewsletterFooter",
    ],
    id: "creative-portfolio",
    name: "Creative Portfolio",
    description: "An editorial studio site with a split hero, featured 3D carousel, filterable gallery, and animated stats.",
    accent: "from-orange-400 to-rose-500",
  }),
  define({
    component: "StartupLaunch",
    sectionNames: [
      "Navbar",
      "GradientHero",
      "StatsCounter",
      "BentoGrid",
      "PricingTable",
      "FaqAccordion",
      "NewsletterFooter",
    ],
    id: "startup-launch",
    name: "Startup Launch",
    description: "A lean product launch page focused on metrics, features, and pricing conversion.",
    accent: "from-emerald-400 to-sky-500",
  }),
  define({
    component: "RealEstateShowcase",
    sectionNames: [
      "PropertySearchHero",
      "PropertyListingGrid",
      "MortgageCalculator",
      "VirtualTourShowcase",
      "NeighborhoodGuide",
      "AppointmentScheduler",
      "NewsletterFooter",
    ],
    id: "real-estate",
    name: "Real Estate & Property",
    description: "Property search, listings, mortgage estimates, an interactive virtual tour, neighborhood scores, and appointment booking.",
    accent: "from-emerald-500 to-cyan-400",
  }),
  define({
    component: "CampusExperience",
    sectionNames: [
      "CampusAlertTicker",
      "AcademicPrograms",
      "CampusEventAgenda",
      "FacultyDirectory",
      "TuitionEstimator",
      "AppointmentScheduler",
      "NewsletterFooter",
    ],
    id: "campus-experience",
    name: "Campus Experience",
    description: "A university site with campus alerts, academic programs, an event agenda, faculty directory, tuition estimator, and appointment booking.",
    accent: "from-indigo-500 to-sky-400",
  }),
  define({
    component: "DeveloperPortfolio",
    sectionNames: [
      "TerminalHero",
      "ProjectShowcaseGrid",
      "ExperienceTimeline",
      "SkillMatrix",
      "CaseStudyHighlight",
      "MultiStepInquiryForm",
      "NewsletterFooter",
    ],
    id: "developer-portfolio",
    name: "Developer Portfolio",
    description: "An interactive developer portfolio with a live terminal, project bento grid, experience timeline, skill matrix, case study, and inquiry form.",
    accent: "from-violet-500 to-fuchsia-400",
  }),
];
