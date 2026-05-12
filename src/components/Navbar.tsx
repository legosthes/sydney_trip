import { useRef, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Languages } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import type { TranslationKey } from "@/i18n/translations";

const navItems: { to: string; labelKey: TranslationKey }[] = [
  { to: "/", labelKey: "nav.overview" },
  { to: "/itinerary", labelKey: "nav.itinerary" },
  { to: "/places", labelKey: "nav.places" },
  { to: "/budget", labelKey: "nav.budget" },
  { to: "/info", labelKey: "nav.info" },
  { to: "/checklist", labelKey: "nav.checklist" },
];

export function Navbar() {
  const location = useLocation();
  const { lang, setLang, t } = useTranslation();
  const navRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  useEffect(() => {
    if (!navRef.current) return;
    const activeEl = navRef.current.querySelector("[data-active='true']") as HTMLElement | null;
    if (!activeEl) {
      setIndicator(null);
      return;
    }
    const navRect = navRef.current.getBoundingClientRect();
    const elRect = activeEl.getBoundingClientRect();
    setIndicator({
      left: elRect.left - navRect.left,
      width: elRect.width,
    });
  }, [location.pathname, lang]);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-12 xl:px-16">
        {/* Wordmark */}
        <Link
          to="/"
          className="font-display text-base tracking-tight no-underline text-foreground"
          aria-label="Sydney 2026"
        >
          SYDNEY <span className="text-muted-foreground font-normal">2026</span>
        </Link>

        {/* Nav items */}
        <div ref={navRef} className="relative flex items-center overflow-x-auto scrollbar-hide">
          {/* Hairline indicator */}
          {indicator && (
            <span
              aria-hidden
              className="absolute bottom-0 h-px bg-foreground"
              style={{
                left: indicator.left,
                width: indicator.width,
                transitionProperty: "left, width",
                transitionDuration: "400ms",
                transitionTimingFunction: "var(--ease-out-quint)",
              }}
            />
          )}
          {navItems.map(({ to, labelKey }) => {
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
                  "relative px-3 sm:px-4 py-[18px] text-[13px] tracking-tight no-underline transition-colors duration-300 flex-shrink-0",
                  active ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t(labelKey)}
              </Link>
            );
          })}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <ThemeToggle />
          <button
            onClick={() => setLang(lang === "en" ? "zh" : "en")}
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-medium border border-border hover:bg-secondary transition-colors text-foreground"
            title={lang === "en" ? "Switch to Chinese" : "Switch to English"}
          >
            <Languages className="h-3 w-3" strokeWidth={1.75} />
            <span className="hidden sm:inline">{lang === "en" ? "中文" : "EN"}</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
