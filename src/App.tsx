import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { ToastProvider } from "@/components/Toast";
import { Navbar } from "@/components/Navbar";
import { Overview } from "@/pages/Overview";
import { Itinerary } from "@/pages/Itinerary";
import { MyPlaces } from "@/pages/MyPlaces";
import { Budget } from "@/pages/Budget";
import { TravelInfo } from "@/pages/TravelInfo";
import { Checklist } from "@/pages/Checklist";

export default function App() {
  return (
    <LanguageProvider>
      <ToastProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-12 xl:px-16 pt-8">
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/itinerary" element={<Itinerary />} />
              <Route path="/places" element={<MyPlaces />} />
              <Route path="/budget" element={<Budget />} />
              <Route path="/info" element={<TravelInfo />} />
              <Route path="/checklist" element={<Checklist />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
      </ToastProvider>
    </LanguageProvider>
  );
}
