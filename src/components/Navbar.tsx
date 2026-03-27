import { useRef, useEffect, useState } from "react";
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
  const navRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number } | null>(null);

  // Animate the active indicator pill
  useEffect(() => {
    if (!navRef.current) return;
    const activeEl = navRef.current.querySelector("[data-active='true']") as HTMLElement | null;
    if (activeEl) {
      const navRect = navRef.current.getBoundingClientRect();
      const elRect = activeEl.getBoundingClientRect();
      setIndicatorStyle({
        left: elRect.left - navRect.left,
        width: elRect.width,
      });
    }
  }, [location.pathname]);

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-12 xl:px-16">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground no-underline group">
          <span className="text-2xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">🦘</span>
          <span className="hidden sm:inline">Sydney 2026</span>
        </Link>

        <div ref={navRef} className="relative flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {/* Animated background pill */}
          {indicatorStyle && (
            <div
              className="absolute top-1/2 -translate-y-1/2 h-9 rounded-full bg-primary transition-all duration-300 ease-out"
              style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
            />
          )}
          {navItems.map(({ to, labelKey, icon: Icon }) => {
            const active =
              to === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                data-active={active}
                className={cn(
                  "relative z-10 flex items-center gap-2 rounded-full px-3 sm:px-4 py-2 text-sm font-medium transition-colors duration-200 no-underline flex-shrink-0",
                  active
                    ? "text-primary-foreground"
                    : "text-foreground/70 hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4 transition-transform duration-200", active && "scale-110")} />
                <span className="hidden lg:inline">{t(labelKey)}</span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <ThemeToggle />
          <button
            onClick={() => setLang(lang === "en" ? "zh" : "en")}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border border-border hover:bg-secondary transition-all duration-200 hover:scale-105 text-foreground"
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
