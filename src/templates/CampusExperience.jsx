import CampusAlertTicker from "../components/sections/CampusAlertTicker";
import AcademicPrograms from "../components/sections/AcademicPrograms";
import CampusEventAgenda from "../components/sections/CampusEventAgenda";
import FacultyDirectory from "../components/sections/FacultyDirectory";
import TuitionEstimator from "../components/sections/TuitionEstimator";
import AppointmentScheduler from "../components/sections/AppointmentScheduler";
import NewsletterFooter from "../components/sections/NewsletterFooter";

export default function CampusExperience() {
  return (
    <main className="min-h-screen bg-white antialiased">
      <CampusAlertTicker />
      <AcademicPrograms />
      <CampusEventAgenda />
      <FacultyDirectory />
      <TuitionEstimator />
      <AppointmentScheduler />
      <NewsletterFooter />
    </main>
  );
}
