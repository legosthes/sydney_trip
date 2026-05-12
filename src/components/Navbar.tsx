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
  const [overlay, setOverlay] = useState(false);
  const onHomepage = location.pathname === "/";

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
  }, [location.pathname, lang, overlay]);

  // Listen to scroll only on homepage; navbar becomes transparent while
  // the hero is in view, solid once scrolled past it.
  useEffect(() => {
    if (!onHomepage) {
      setOverlay(false);
      return;
    }
    const update = () => {
      setOverlay(window.scrollY < window.innerHeight - 120);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [onHomepage]);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-colors duration-500",
        overlay
          ? "border-b border-white/0 bg-transparent text-white"
          : "border-b border-border bg-background/85 backdrop-blur-md text-foreground",
      )}
      style={{ transitionTimingFunction: "var(--ease-out-quint)" }}
    >
      <div className="mx-auto flex h-14 w-full max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-12 xl:px-16">
        {/* Wordmark */}
        <Link
          to="/"
          className={cn(
            "font-display text-base tracking-tight no-underline transition-colors duration-500",
            overlay ? "text-white" : "text-foreground",
          )}
          aria-label="Sydney 2026"
        >
          SYDNEY{" "}
          <span className={cn("font-normal", overlay ? "text-white/60" : "text-muted-foreground")}>2026</span>
        </Link>

        {/* Nav items */}
        <div ref={navRef} className="relative flex items-center overflow-x-auto scrollbar-hide">
          {/* Hairline indicator */}
          {indicator && (
            <span
              aria-hidden
              className={cn(
                "absolute bottom-0 h-px transition-colors duration-500",
                overlay ? "bg-white" : "bg-foreground",
              )}
              style={{
                left: indicator.left,
                width: indicator.width,
                transitionProperty: "left, width, background-color",
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
                  overlay
                    ? active
                      ? "text-white font-medium"
                      : "text-white/65 hover:text-white"
                    : active
                      ? "text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground",
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
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-medium transition-colors",
              overlay
                ? "border border-white/40 text-white hover:bg-white/10"
                : "border border-border text-foreground hover:bg-secondary",
            )}
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
