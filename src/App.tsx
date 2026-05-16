import { useState, useEffect } from "react";
import { ArrowUpLeft } from "lucide-react";
import { Navbar } from "./components/sections/Navbar";
import { HeroSection } from "./components/sections/HeroSection";
import { ServicesSection } from "./components/sections/ServicesSection";
import { GallerySection } from "./components/sections/GallerySection";
import { StatsSection } from "./components/sections/StatsSection";
import { LocationsSection } from "./components/sections/LocationsSection";
import { BookingSection } from "./components/sections/BookingSection";
import { CancelAppointmentSection } from "./components/sections/CancelAppointmentSection";
import { TestimonialsSection } from "./components/sections/TestimonialsSection";
import { ContactSection } from "./components/sections/ContactSection";
import { Footer } from "./components/sections/Footer";
import { GradientMenu } from "./components/ui/gradient-menu";
import { AdminPage } from "./pages/AdminPage";

function App() {
  const [view, setView] = useState<"main" | "admin">("main");

  useEffect(() => {
    const handleLocation = () => {
      if (window.location.pathname === "/adminegs") {
        setView("admin");
      } else if (view === "admin") {
        setView("main");
      }
    };
    
    // Handle browser back/forward buttons
    window.addEventListener("popstate", handleLocation);
    handleLocation();
    return () => window.removeEventListener("popstate", handleLocation);
  }, [view]);

  const goToSite = () => {
    setView("main");
    // Return to the main website path
    history.pushState("", document.title, "/");
  };

  if (view === "admin") {
    return (
      <div className="relative min-h-screen" style={{ background: "#080808" }}>
        {/*
          ── Back to Site button ────────────────────────────────────────────
          Fixed to bottom-right corner. High z-index (z-[999]) sits above
          all admin content. Gold gradient style, never overlaps sidebar.
        ──────────────────────────────────────────────────────────────────── */}
        <button
          onClick={goToSite}
          className="fixed bottom-6 right-6 z-[999] flex items-center gap-2 px-5 py-3 rounded-full text-xs font-body font-medium cursor-pointer group transition-all duration-300 hover:scale-105 select-none"
          style={{
            background: "linear-gradient(135deg, #C9A84C 0%, #F5E68A 100%)",
            boxShadow: "0 8px 32px rgba(201,168,76,0.40), 0 2px 8px rgba(0,0,0,0.6)",
            color: "#000",
          }}
        >
          <ArrowUpLeft
            size={14}
            style={{ color: "#000" }}
            className="transition-transform duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5"
          />
          <span style={{ letterSpacing: "0.05em", fontWeight: 600 }}>Back to Site</span>
        </button>

        {/*
          The AdminPage (login + dashboard) renders here.
          No extra padding on this wrapper — the AdminDashboard's own
          sticky topbar handles its internal layout. The button is
          fixed so it floats above without disrupting any layout flow.
        */}
        <AdminPage />
      </div>
    );
  }

  return (
    <div className="relative overflow-x-hidden">
      <Navbar />
      <main>
        <HeroSection />
        <ServicesSection />
        <GallerySection />
        <StatsSection />
        <LocationsSection />
        <BookingSection />
        <CancelAppointmentSection />
        <TestimonialsSection />
        <ContactSection />
      </main>
      <Footer />
      <GradientMenu />
    </div>
  );
}

export default App;
