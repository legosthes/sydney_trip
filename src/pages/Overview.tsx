import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Plane,
  Calendar,
  Hotel,
  Users,
  MapPin,
  ArrowRight,
  ArrowUpRight,
  Globe,
  ChevronLeft,
  ChevronRight,
  CalendarCheck,
  ArrowDown,
} from "lucide-react";
import { Link } from "react-router-dom";
import { CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { tripInfo, itinerary } from "@/data/trip";
import {
  getAllAttractions,
  getAllPlaces,
  getAllDayCustomizations,
  getAllSlots,
  type AttractionRow,
  type PlaceRow,
  type DayCustomization,
  type ItinerarySlotRow,
} from "@/lib/api";
import { useBudget } from "@/hooks/useBudget";
import { useTranslation } from "@/i18n/LanguageContext";
import { CATEGORY_COLORS } from "@/data/budget";
import { cn } from "@/lib/utils";

const PLACES_PREVIEW_LIMIT = 6;

function formatTWD(amount: number) {
  return `NT$${amount.toLocaleString()}`;
}

const DEFAULT_HERO = "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1600&q=80";

export function Overview() {
  const { t } = useTranslation();
  const [attractions, setAttractions] = useState<AttractionRow[]>([]);
  const [places, setPlaces] = useState<PlaceRow[]>([]);
  const [dayCustomizations, setDayCustomizations] = useState<DayCustomization[]>([]);
  const [allSlots, setAllSlots] = useState<ItinerarySlotRow[]>([]);
  const { budgets, getSpentByCategory, totalBudget, totalSpent } = useBudget();

  useEffect(() => {
    let cancelled = false;
    getAllAttractions().then((rows) => { if (!cancelled) setAttractions(rows); });
    getAllPlaces().then((rows) => { if (!cancelled) setPlaces(rows); });
    getAllDayCustomizations().catch(() => [] as DayCustomization[]).then((rows) => {
      if (!cancelled) setDayCustomizations(rows);
    });
    getAllSlots().catch(() => [] as ItinerarySlotRow[]).then((rows) => {
      if (!cancelled) setAllSlots(rows);
    });
    return () => { cancelled = true; };
  }, []);

  const assignedPlaceIds = useMemo(
    () => new Set(allSlots.map((s) => s.place_id)),
    [allSlots],
  );

  const sortedPlaces = useMemo(
    () => [...places].sort((a, b) => {
      if (a.image_url && !b.image_url) return -1;
      if (!a.image_url && b.image_url) return 1;
      return 0;
    }),
    [places],
  );

  const featuredHighlights = useMemo(() => attractions.slice(0, 3), [attractions]);
  const remaining = totalBudget - totalSpent;
  const placesPlanned = allSlots.length;

  // ── Hero carousel ────────────────────────────────────────
  const heroSlides = useMemo(() => {
    const isHighRes = (url: string) => {
      const w = url.match(/[?&]w=(\d+)/);
      if (w && parseInt(w[1], 10) < 800) return false;
      return true;
    };
    const slides: { url: string; label: string }[] = [
      { url: DEFAULT_HERO, label: "Sydney Harbour" },
    ];
    attractions.forEach((a) => {
      if (a.image_url && isHighRes(a.image_url))
        slides.push({ url: a.image_url, label: a.name });
    });
    places.forEach((p) => {
      if (p.image_url && p.category === "Attraction" && isHighRes(p.image_url) && !slides.some((s) => s.url === p.image_url))
        slides.push({ url: p.image_url, label: p.name });
    });
    if (slides.length <= 7) return slides;
    const picked: typeof slides = [slides[0]];
    const step = (slides.length - 1) / 6;
    for (let i = 1; i <= 6; i++) picked.push(slides[Math.round(i * step)]);
    return picked;
  }, [attractions, places]);

  const [heroIndex, setHeroIndex] = useState(0);
  const heroTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetHeroTimer = useCallback(() => {
    if (heroTimerRef.current) clearInterval(heroTimerRef.current);
    heroTimerRef.current = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroSlides.length);
    }, 6500);
  }, [heroSlides.length]);

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    resetHeroTimer();
    return () => { if (heroTimerRef.current) clearInterval(heroTimerRef.current); };
  }, [heroSlides.length, resetHeroTimer]);

  const heroNext = () => { setHeroIndex((p) => (p + 1) % heroSlides.length); resetHeroTimer(); };
  const heroPrev = () => { setHeroIndex((p) => (p - 1 + heroSlides.length) % heroSlides.length); resetHeroTimer(); };
  const currentSlide = heroSlides[heroIndex] || heroSlides[0];

  // ── Trip dates ──────────────────────────────────────────
  const departureDate = new Date("2026-07-21");
  const returnDate = new Date("2026-07-28");
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const daysUntilDeparture = Math.ceil(
    (departureDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  const isTripInProgress = today >= departureDate && today <= returnDate;
  const isTripCompleted = today > returnDate;

  return (
    <div className="space-y-20 pb-0">
      {/* ── Hero (full-bleed) ─────────────────────────────── */}
      <section className="relative overflow-hidden group/hero animate-fade -mx-4 sm:-mx-6 lg:-mx-12 xl:-mx-16 -mt-8">
        <div className="absolute inset-0">
          <img
            key={currentSlide.url}
            src={currentSlide.url}
            alt={currentSlide.label}
            className="h-full w-full object-cover animate-hero-fade"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/20" />
        </div>

        {/* Top row: brand + nav arrows */}
        <div className="relative flex items-center justify-between px-6 md:px-12 lg:px-16 xl:px-20 pt-6 md:pt-10">
          <span className="bracket-label text-white/80" style={{ color: "rgba(255,255,255,0.8)" }}>
            {t("overview.badge")}
          </span>
          {heroSlides.length > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={heroPrev}
                aria-label="Previous"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/30 text-white/90 hover:bg-white/15 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={heroNext}
                aria-label="Next"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/30 text-white/90 hover:bg-white/15 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Title block */}
        <div className="relative flex min-h-[calc(100vh-3.5rem)] md:min-h-[calc(100vh-3.5rem)] flex-col justify-end px-6 md:px-12 lg:px-16 xl:px-20 pb-8 md:pb-12">
          <h1 className="font-display text-white text-[48px] sm:text-[80px] md:text-[112px] lg:text-[128px] leading-[0.95] max-w-[12ch]">
            {t("overview.title")}
          </h1>

          {/* Bottom info strip */}
          <div className="mt-6 md:mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/itinerary"
                className="inline-flex items-center gap-2 rounded-full bg-white text-foreground pl-4 pr-2 py-1.5 text-sm font-medium hover:bg-white/90 transition-colors no-underline"
              >
                {isTripCompleted
                  ? t("overview.tripCompleted")
                  : isTripInProgress
                  ? t("overview.tripInProgress")
                  : t("overview.viewItinerary")}
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-background">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </Link>
              <div className="hidden sm:block text-white/80 text-xs max-w-xs leading-relaxed">
                {tripInfo.dates}. {tripInfo.travelers.join(", ")}.
                {!isTripInProgress && !isTripCompleted && (
                  <> {daysUntilDeparture} {t("overview.daysToGo")}.</>
                )}
              </div>
            </div>
            <a
              href="#about"
              className="inline-flex items-center gap-1.5 text-white/90 text-xs no-underline hover:text-white transition-colors group/scroll"
            >
              {t("overview.exploreBelow")}
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/40 transition-transform duration-400 group-hover/scroll:translate-y-0.5"
                    style={{ transitionTimingFunction: "var(--ease-out-quint)" }}>
                <ArrowDown className="h-3 w-3" />
              </span>
            </a>
          </div>

          {/* Dot indicators */}
          {heroSlides.length > 1 && (
            <div className="mt-5 flex gap-1.5">
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => { setHeroIndex(i); resetHeroTimer(); }}
                  aria-label={`Slide ${i + 1}`}
                  className={cn(
                    "h-[3px] rounded-full transition-all",
                    i === heroIndex ? "w-7 bg-white" : "w-3 bg-white/40 hover:bg-white/60"
                  )}
                  style={{ transitionDuration: "500ms", transitionTimingFunction: "var(--ease-out-quint)" }}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── About + Stats ────────────────────────────────── */}
      <section id="about" className="grid gap-10 md:grid-cols-12 md:gap-12 animate-in">
        <div className="md:col-span-3">
          <span className="bracket-label">{t("overview.aboutLabel")}</span>
        </div>
        <div className="md:col-span-9 space-y-12">
          <p className="font-heading text-2xl sm:text-3xl md:text-4xl leading-[1.25] tracking-tight max-w-[28ch]">
            {t("overview.aboutText")}
          </p>

          <div className="grid grid-cols-3 gap-6 md:gap-12 pt-6 border-t border-border" data-reveal>
            <Stat label={t("overview.statDays")} value={
              isTripCompleted ? "Done" :
              isTripInProgress ? "Now" :
              `${daysUntilDeparture}`
            } />
            <Stat label={t("overview.statPlaces")} value={`${placesPlanned}`} />
            <Stat label={t("overview.statTrip")} value="7" />
          </div>
        </div>
      </section>

      {/* ── Trip dossier ─────────────────────────────────── */}
      <section className="grid gap-10 md:grid-cols-12 md:gap-12">
        <div className="md:col-span-3">
          <span className="bracket-label">{t("overview.dossierLabel")}</span>
          <h2 className="mt-3 font-heading text-2xl md:text-3xl tracking-tight">
            {t("overview.dossierTitle")}
          </h2>
        </div>
        <div className="md:col-span-9 grid grid-cols-2 lg:grid-cols-4 gap-px bg-border rounded-2xl overflow-hidden">
          <DossierItem
            icon={Calendar}
            label={t("overview.dates")}
            primary={tripInfo.dates}
          />
          <DossierItem
            icon={Users}
            label={t("overview.travelers")}
            primary={tripInfo.travelers.join(", ")}
          />
          <DossierItem
            icon={Hotel}
            label={t("overview.hotel")}
            primary={tripInfo.hotel.name}
            href={tripInfo.hotel.mapsUrl}
            secondary={tripInfo.hotel.location}
          />
          <DossierItem
            icon={Plane}
            label={`${t("overview.flights")} · ${tripInfo.flights.outbound.flightNo}`}
            primary={`${tripInfo.flights.outbound.departure} → ${tripInfo.flights.outbound.arrival}`}
            secondary={`${tripInfo.flights.outbound.duration} · ${tripInfo.flights.outbound.airline}`}
          />
        </div>
      </section>

      {/* ── Budget ───────────────────────────────────────── */}
      <section className="grid gap-10 md:grid-cols-12 md:gap-12">
        <div className="md:col-span-3 flex flex-col">
          <span className="bracket-label">{t("overview.budgetLabel")}</span>
          <h2 className="mt-3 font-heading text-2xl md:text-3xl tracking-tight max-w-[20ch]">
            {t("overview.budgetSummary")}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-[28ch]">
            {t("overview.budgetSummaryDesc")}
          </p>
          <Link
            to="/budget"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-foreground no-underline hover:gap-2.5 transition-all w-fit"
            style={{ transitionTimingFunction: "var(--ease-out-quint)", transitionDuration: "300ms" }}
          >
            {t("overview.seeAll")} <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="md:col-span-9 space-y-6">
          <div className="flex items-end justify-between border-b border-border pb-6">
            <div>
              <p className="eyebrow">{t("overview.remaining")}</p>
              <p className={cn(
                "font-stat text-5xl md:text-6xl mt-2 font-numeric",
                remaining < 0 ? "text-destructive" : "text-foreground"
              )}>
                {formatTWD(remaining)}
              </p>
            </div>
            <div className="text-right text-xs text-muted-foreground space-y-1">
              <div>{t("overview.spent")} {formatTWD(totalSpent)}</div>
              <div>{t("budget.totalBudget")} {formatTWD(totalBudget)}</div>
            </div>
          </div>
          <Progress
            value={totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0}
            className="h-1.5"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-5 pt-2" data-reveal>
            {budgets.map((b) => {
              const spent = getSpentByCategory(b.category);
              const pct = b.budgetTWD > 0 ? Math.min((spent / b.budgetTWD) * 100, 100) : 0;
              const catRemaining = b.budgetTWD - spent;
              return (
                <div key={b.category} className="space-y-1.5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[13px] font-medium">{b.category}</span>
                    <span className={cn(
                      "text-[11px] font-numeric",
                      catRemaining < 0 ? "text-destructive" : "text-muted-foreground"
                    )}>
                      {formatTWD(catRemaining)}
                    </span>
                  </div>
                  <Progress
                    value={pct}
                    className="h-[3px]"
                    style={{ "--progress-color": pct > 90 ? "var(--destructive)" : CATEGORY_COLORS[b.category] } as React.CSSProperties}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Highlights / Destinations ────────────────────── */}
      {featuredHighlights.length > 0 && (
        <section className="space-y-8">
          <div className="grid gap-10 md:grid-cols-12 md:gap-12">
            <div className="md:col-span-3">
              <span className="bracket-label">{t("overview.highlightsLabel")}</span>
            </div>
            <div className="md:col-span-9 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <h2 className="font-heading text-3xl md:text-4xl leading-[1.1] tracking-tight max-w-[20ch]">
                {t("overview.highlightsTitle")}
              </h2>
              <p className="text-sm text-muted-foreground max-w-[36ch]">
                {t("overview.highlightsDesc")}
              </p>
            </div>
          </div>

          {/* Featured large + grid */}
          {featuredHighlights[0] && <FeatureImageCard attraction={featuredHighlights[0]} />}
          {featuredHighlights.length > 1 && (
            <div className="grid gap-4 md:grid-cols-2" data-reveal>
              {featuredHighlights.slice(1, 3).map((a) => (
                <ImageCaptionCard key={a.id} attraction={a} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── Itinerary / Packages ────────────────────────── */}
      {allSlots.length > 0 && (
        <section className="space-y-6">
          <div className="grid gap-10 md:grid-cols-12 md:gap-12">
            <div className="md:col-span-3">
              <span className="bracket-label">{t("overview.packagesLabel")}</span>
            </div>
            <div className="md:col-span-9 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <h2 className="font-heading text-3xl md:text-4xl leading-[1.1] tracking-tight max-w-[24ch]">
                {t("overview.packagesTitle")}
              </h2>
              <p className="text-sm text-muted-foreground max-w-[36ch]">
                {t("overview.packagesDesc")}
              </p>
            </div>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0">
            {itinerary.map((day, i) => {
              const dayNum = i + 1;
              const custom = dayCustomizations.find((c) => c.day_number === dayNum);
              const dayPlaces = (allSlots
                .filter((s) => s.day_number === dayNum)
                .map((s) => places.find((p) => p.id === s.place_id))
                .filter(Boolean) as PlaceRow[]
              ).filter((p, idx, arr) => arr.findIndex((q) => q.id === p.id) === idx);
              return (
                <Link
                  key={day.dayLabel}
                  to="/itinerary"
                  className="no-underline snap-start flex-shrink-0 w-[300px] sm:w-[340px] group/pkg"
                >
                  <div className="relative h-[380px] overflow-hidden rounded-2xl">
                    <img
                      src={custom?.image_url || day.image}
                      alt={custom?.title || day.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover/pkg:scale-105"
                      style={{ transitionTimingFunction: "var(--ease-out-quint)" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
                    {/* chips top */}
                    <div className="absolute top-4 left-4 flex gap-1.5">
                      <Chip>{day.dayLabel}</Chip>
                      {dayPlaces.length > 0 && <Chip>{dayPlaces.length} stops</Chip>}
                    </div>
                    {/* title bottom */}
                    <div className="absolute bottom-0 left-0 right-0 p-5 text-white space-y-2">
                      <p className="font-display text-2xl leading-tight">
                        {custom?.title || day.title}
                      </p>
                      <p className="text-xs text-white/70">
                        {day.date}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Saved Places gallery ─────────────────────────── */}
      {sortedPlaces.length > 0 && (
        <section className="space-y-6">
          <div className="grid gap-10 md:grid-cols-12 md:gap-12">
            <div className="md:col-span-3">
              <span className="bracket-label">{t("overview.placesLabel")}</span>
            </div>
            <div className="md:col-span-9 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <h2 className="font-heading text-3xl md:text-4xl leading-[1.1] tracking-tight max-w-[24ch]">
                {t("overview.placesTitle")}
              </h2>
              <p className="text-sm text-muted-foreground max-w-[36ch]">
                {t("overview.placesDesc")}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" data-reveal>
            {sortedPlaces.slice(0, PLACES_PREVIEW_LIMIT).map((p) => (
              <PlaceCard key={p.id} place={p} assigned={assignedPlaceIds.has(p.id)} />
            ))}
          </div>
          {sortedPlaces.length > PLACES_PREVIEW_LIMIT && (
            <div className="pt-2">
              <Link
                to="/places"
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm no-underline hover:bg-secondary transition-colors"
              >
                {t("overview.seeMore")} ({sortedPlaces.length - PLACES_PREVIEW_LIMIT}+) <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </section>
      )}

      {/* ── Bottom CTA ──────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl">
        <div className="absolute inset-0">
          <img
            src={heroSlides[Math.min(2, heroSlides.length - 1)]?.url || DEFAULT_HERO}
            alt=""
            className="h-full w-full object-cover animate-ken-burns"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70" />
        </div>
        <div className="relative px-6 py-20 md:py-28 flex flex-col items-center text-center text-white">
          <span className="bracket-label" style={{ color: "rgba(255,255,255,0.7)" }}>
            {t("overview.ctaLabel")}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl mt-4 max-w-[18ch]">
            {t("overview.ctaTitle")}
          </h2>
          <p className="mt-4 text-sm text-white/80 max-w-md">
            {t("overview.ctaDesc")}
          </p>
          <Link
            to="/itinerary"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-white text-foreground pl-5 pr-1.5 py-1.5 text-sm font-medium no-underline hover:bg-white/90 transition-colors"
          >
            {t("overview.ctaButton")}
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </section>

      {/* ── Wordmark footer ─────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl bg-foreground text-background -mb-20">
        <div className="px-6 md:px-10 pt-12 pb-2 grid gap-10 md:grid-cols-3">
          <div>
            <p className="font-display text-xl">SYDNEY 2026</p>
            <p className="mt-3 text-xs opacity-70 max-w-xs leading-relaxed">
              {t("overview.footerDesc")}
            </p>
          </div>
          <div>
            <p className="eyebrow opacity-60">{t("overview.footerNav")}</p>
            <ul className="mt-3 space-y-1.5 text-sm">
              <li><Link to="/itinerary" className="opacity-90 hover:opacity-100 no-underline">{t("nav.itinerary")}</Link></li>
              <li><Link to="/places" className="opacity-90 hover:opacity-100 no-underline">{t("nav.places")}</Link></li>
              <li><Link to="/budget" className="opacity-90 hover:opacity-100 no-underline">{t("nav.budget")}</Link></li>
              <li><Link to="/checklist" className="opacity-90 hover:opacity-100 no-underline">{t("nav.checklist")}</Link></li>
              <li><Link to="/info" className="opacity-90 hover:opacity-100 no-underline">{t("nav.info")}</Link></li>
            </ul>
          </div>
          <div>
            <p className="eyebrow opacity-60">{t("overview.footerTrip")}</p>
            <ul className="mt-3 space-y-1.5 text-sm">
              <li className="opacity-90">{tripInfo.dates}</li>
              <li className="opacity-90">{tripInfo.travelers.join(", ")}</li>
              <li className="opacity-90">{tripInfo.flights.outbound.flightNo} · {tripInfo.flights.outbound.airline}</li>
            </ul>
          </div>
        </div>
        <div className="px-6 md:px-10 mt-8 mb-4 flex items-center justify-between text-[10px] opacity-50">
          <span>© {new Date().getFullYear()}</span>
          <span>{t("overview.footerMade")}</span>
        </div>
        <p className="font-display select-none leading-none text-background tracking-tight px-2 pb-2"
           style={{ fontSize: "clamp(72px, 22vw, 320px)", letterSpacing: "-0.06em" }}>
          SYDNEY
        </p>
      </section>
    </div>
  );
}

// ─── Components ─────────────────────────────────────────────

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-2">
      <p className="font-stat text-5xl md:text-6xl">{value}</p>
      <p className="eyebrow">{label}</p>
    </div>
  );
}

function DossierItem({
  icon: Icon,
  label,
  primary,
  secondary,
  href,
}: {
  icon: typeof Calendar;
  label: string;
  primary: string;
  secondary?: string;
  href?: string;
}) {
  const content = (
    <div className="bg-card p-5 h-full flex flex-col gap-2 hover:bg-accent/40 transition-colors">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
        <span className="eyebrow">{label}</span>
      </div>
      <p className="font-heading text-base md:text-lg leading-tight mt-1">{primary}</p>
      {secondary && <p className="text-xs text-muted-foreground">{secondary}</p>}
    </div>
  );
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="block no-underline group">
      {content}
    </a>
  ) : (
    content
  );
}

function FeatureImageCard({ attraction }: { attraction: AttractionRow }) {
  const { t } = useTranslation();
  return (
    <article className="group/feat relative overflow-hidden rounded-3xl">
      <div className="relative aspect-[21/10] w-full overflow-hidden">
        <img
          src={attraction.image_url || DEFAULT_HERO}
          alt={attraction.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover/feat:scale-[1.03]"
          style={{ transitionTimingFunction: "var(--ease-out-quint)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
        {attraction.tag && (
          <div className="absolute top-5 left-5">
            <Chip>{attraction.tag}</Chip>
          </div>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
        <div className="flex items-end justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <h3 className="font-display text-3xl md:text-4xl leading-tight">{attraction.name}</h3>
            {attraction.description && (
              <p className="text-sm text-white/85 line-clamp-2 max-w-md">
                {attraction.description}
              </p>
            )}
          </div>
          {attraction.maps_url && (
            <a
              href={attraction.maps_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("overview.openMap")}
              className="flex-shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/40 text-white hover:bg-white/15 transition-colors"
            >
              <ArrowUpRight className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

function ImageCaptionCard({ attraction }: { attraction: AttractionRow }) {
  return (
    <article className="group/img relative overflow-hidden rounded-2xl">
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <img
          src={attraction.image_url || DEFAULT_HERO}
          alt={attraction.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover/img:scale-[1.04]"
          style={{ transitionTimingFunction: "var(--ease-out-quint)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
        {attraction.tag && (
          <div className="absolute top-4 left-4">
            <Chip>{attraction.tag}</Chip>
          </div>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-5 text-white space-y-1.5">
        <h3 className="font-display text-xl md:text-2xl leading-tight">{attraction.name}</h3>
        {attraction.description && (
          <p className="text-xs text-white/80 line-clamp-2 max-w-md">
            {attraction.description}
          </p>
        )}
      </div>
    </article>
  );
}

function PlaceCard({ place, assigned }: { place: PlaceRow; assigned: boolean }) {
  return (
    <article className="group/place relative overflow-hidden rounded-2xl border border-border bg-card hover:border-foreground/40 transition-colors">
      {place.image_url ? (
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <img
            src={place.image_url}
            alt={place.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover/place:scale-[1.04]"
            style={{ transitionTimingFunction: "var(--ease-out-quint)" }}
          />
          {assigned && (
            <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-background/95 text-foreground px-2 py-0.5 text-[10px] font-medium">
              <CalendarCheck className="h-3 w-3" />
              Planned
            </span>
          )}
        </div>
      ) : (
        <div className="relative aspect-[16/9] w-full bg-muted flex items-center justify-center">
          <MapPin className="h-6 w-6 text-muted-foreground/40" />
          {assigned && (
            <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-background/95 text-foreground px-2 py-0.5 text-[10px] font-medium">
              <CalendarCheck className="h-3 w-3" />
              Planned
            </span>
          )}
        </div>
      )}
      <CardContent className="p-4 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p className="font-heading text-base leading-tight">{place.name}</p>
          <div className="flex gap-1 flex-shrink-0 mt-1">
            {place.maps_url && (
              <a href={place.maps_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                <MapPin className="h-3.5 w-3.5" />
              </a>
            )}
            {place.website && (
              <a href={place.website} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                <Globe className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
        {place.category && (
          <span className="bracket-label">{place.category}</span>
        )}
        {place.notes && (
          <p className="text-xs text-muted-foreground line-clamp-2 pt-1">{place.notes}</p>
        )}
      </CardContent>
    </article>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white px-2.5 py-1 text-[11px]">
      {children}
    </span>
  );
}
