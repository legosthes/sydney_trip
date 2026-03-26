import { MapPin, Plane, Wallet, MapPinned, Info, CheckSquare, Languages } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "@/i18n/LanguageContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import type { TranslationKey } from "@/i18n/translations";

const navItems: { to: string; labelKey: TranslationKey; icon: typeof MapPin }[] = [
  { to: "/", labelKey: "nav.overview", icon: MapPin },
  { to: "/itinerary", labelKey: "nav.itinerary", icon: Plane },
  { to: "/places", labelKey: "nav.places", icon: MapPinned },
  { to: "/budget", labelKey: "nav.budget", icon: Wallet },
  { to: "/info", labelKey: "nav.info", icon: Info },
  { to: "/checklist", labelKey: "nav.checklist", icon: CheckSquare },
];

export function Navbar() {
  const location = useLocation();
  const { lang, setLang, t } = useTranslation();

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-12 xl:px-16">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground no-underline">
          <span className="text-2xl">🦘</span>
          <span className="hidden sm:inline">Sydney 2026</span>
        </Link>

        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {navItems.map(({ to, labelKey, icon: Icon }) => {
            const active =
              to === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-2 rounded-full px-3 sm:px-4 py-2 text-sm font-medium transition-colors no-underline flex-shrink-0",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/70 hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden lg:inline">{t(labelKey)}</span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <ThemeToggle />
          <button
            onClick={() => setLang(lang === "en" ? "zh" : "en")}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border border-border hover:bg-secondary transition-colors text-foreground"
            title={lang === "en" ? "Switch to Chinese" : "Switch to English"}
          >
            <Languages className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{lang === "en" ? "中文" : "EN"}</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
