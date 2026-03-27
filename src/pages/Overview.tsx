import { useState, useEffect, useMemo } from "react";
import {
  Plane,
  Calendar,
  Hotel,
  Users,
  MapPin,
  ArrowRight,
  ExternalLink,
  Clock,
  Wallet,
  Globe,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { tripInfo, itinerary } from "@/data/trip";
import { getAllAttractions, getAllPlaces, getAllDayCustomizations, getAllSlots, type AttractionRow, type PlaceRow, type DayCustomization, type ItinerarySlotRow } from "@/lib/api";

const PLACES_PREVIEW_LIMIT = 6;
import { useBudget } from "@/hooks/useBudget";
import { useTranslation } from "@/i18n/LanguageContext";
import { CATEGORY_COLORS } from "@/data/budget";
import { cn } from "@/lib/utils";

function formatTWD(amount: number) {
  return `NT$${amount.toLocaleString()}`;
}

export function Overview() {
  const { t } = useTranslation();
  const [attractions, setAttractions] = useState<AttractionRow[]>([]);
  const [places, setPlaces] = useState<PlaceRow[]>([]);
  const [dayCustomizations, setDayCustomizations] = useState<DayCustomization[]>([]);
  const [allSlots, setAllSlots] = useState<ItinerarySlotRow[]>([]);
  const { budgets, getSpentByCategory, totalBudget, totalSpent } = useBudget();

  useEffect(() => {
    let cancelled = false;
    getAllAttractions().then((rows) => {
      if (!cancelled) setAttractions(rows);
    });
    getAllPlaces().then((rows) => {
      if (!cancelled) setPlaces(rows);
    });
    getAllDayCustomizations().catch(() => [] as DayCustomization[]).then((rows) => {
      if (!cancelled) setDayCustomizations(rows);
    });
    getAllSlots().catch(() => [] as ItinerarySlotRow[]).then((rows) => {
      if (!cancelled) setAllSlots(rows);
    });
    return () => { cancelled = true; };
  }, []);

  const sortedPlaces = useMemo(
    () => [...places].sort((a, b) => {
      if (a.image_url && !b.image_url) return -1;
      if (!a.image_url && b.image_url) return 1;
      return 0;
    }),
    [places]
  );

  const highlights = useMemo(
    () =>
      attractions.filter((a) =>
        ["Sydney Opera House", "Manly Beach", "SEA LIFE Sydney Aquarium", "Featherdale Wildlife Park"].some(
          (name) => a.name.includes(name.split(" ")[0])
        )
      ).slice(0, 4),
    [attractions]
  );

  const remaining = totalBudget - totalSpent;

  return (
    <div className="space-y-12 pb-20">
      {/* Hero — reliable Sydney photo */}
      <section className="relative overflow-hidden rounded-3xl mx-0">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1400&q=80"
            alt="Sydney Harbour"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        </div>
        <div className="relative flex min-h-[420px] md:min-h-[480px] flex-col justify-end p-6 md:p-12">
          <Badge className="mb-4 w-fit bg-white/20 text-white backdrop-blur-sm border-white/30 text-xs uppercase tracking-wider">
            {t("overview.badge")}
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-6xl">
            {t("overview.title")}
          </h1>
          <p className="mt-2 max-w-lg text-base md:text-lg text-white/80">
            {tripInfo.dates} {t("overview.subtitle")}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/itinerary">
              <Button size="lg" className="rounded-full bg-white text-foreground hover:bg-white/90">
                {t("overview.viewItinerary")} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/budget">
              <Button size="lg" className="rounded-full bg-white/20 text-white border-2 border-white/50 backdrop-blur-sm hover:bg-white/30">
                {t("overview.budgetTracker")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trip Details Cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="bg-card shadow-sm border-border/50">
          <CardContent className="flex items-start gap-4 p-5">
            <div className="rounded-xl bg-primary/10 p-3">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("overview.dates")}</p>
              <p className="font-semibold">{tripInfo.dates}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card shadow-sm border-border/50">
          <CardContent className="flex items-start gap-4 p-5">
            <div className="rounded-xl bg-primary/10 p-3">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("overview.travelers")}</p>
              <p className="font-semibold">{tripInfo.travelers.join(", ")}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card shadow-sm border-border/50">
          <CardContent className="flex items-start gap-4 p-5">
            <div className="rounded-xl bg-primary/10 p-3">
              <Hotel className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">{t("overview.hotel")}</p>
              <a href={tripInfo.hotel.mapsUrl} target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-primary inline-flex items-center gap-1 no-underline">
                {tripInfo.hotel.name} <ExternalLink className="h-3 w-3" />
              </a>
              <p className="text-xs text-muted-foreground">{tripInfo.hotel.location}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card shadow-sm border-border/50">
          <CardContent className="flex items-start gap-4 p-5">
            <div className="rounded-xl bg-primary/10 p-3">
              <Plane className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("overview.flights")} — {tripInfo.flights.outbound.flightNo}</p>
              <div className="flex items-center gap-1.5 text-sm font-semibold">
                <span>{tripInfo.flights.outbound.departure}</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <span>{tripInfo.flights.outbound.arrival}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <Clock className="h-3 w-3" />
                <span>{tripInfo.flights.outbound.duration} direct · {tripInfo.flights.outbound.airline}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Budget Dashboard */}
      <section>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t("overview.budgetSummary")}</h2>
            <p className="text-muted-foreground">{t("overview.budgetSummaryDesc")}</p>
          </div>
          <Link to="/budget" className="text-sm font-medium text-primary hover:underline no-underline flex items-center gap-1">
            {t("overview.seeAll")} <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Overall summary card — highlight remaining */}
          <Card className={cn("border-border/50 shadow-sm sm:col-span-2 lg:col-span-1", remaining < 0 && "border-destructive/50")}>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className={cn("rounded-xl p-3", remaining >= 0 ? "bg-primary/10" : "bg-destructive/10")}>
                  <Wallet className={cn("h-5 w-5", remaining >= 0 ? "text-primary" : "text-destructive")} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("overview.remaining")}</p>
                  <p className={cn("text-2xl font-bold", remaining < 0 ? "text-destructive" : "text-primary")}>{formatTWD(remaining)}</p>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("overview.spent")}: {formatTWD(totalSpent)}</span>
                <span className="text-muted-foreground">{t("budget.totalBudget")}: {formatTWD(totalBudget)}</span>
              </div>
              <Progress value={totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0} className="h-2" />
            </CardContent>
          </Card>
          {/* Category mini-cards */}
          {budgets.map((b) => {
            const spent = getSpentByCategory(b.category);
            const pct = b.budgetTWD > 0 ? Math.min((spent / b.budgetTWD) * 100, 100) : 0;
            const catRemaining = b.budgetTWD - spent;
            return (
              <Card key={b.category} className="border-border/50 shadow-sm">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{b.category}</span>
                    <span className={cn("text-xs font-medium", catRemaining < 0 ? "text-destructive" : "text-primary")}>
                      {formatTWD(catRemaining)} {t("overview.remaining")}
                    </span>
                  </div>
                  <Progress
                    value={pct}
                    className="h-1.5"
                    style={{ "--progress-color": pct > 90 ? "#ef4444" : CATEGORY_COLORS[b.category] } as React.CSSProperties}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatTWD(spent)} {t("overview.spent")}</span>
                    <span>{t("overview.of")} {formatTWD(b.budgetTWD)}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Highlights Gallery */}
      <section>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t("overview.highlights")}</h2>
            <p className="text-muted-foreground">{t("overview.highlightsDesc")}</p>
          </div>
          <Link to="/itinerary" className="text-sm font-medium text-primary hover:underline no-underline flex items-center gap-1">
            {t("overview.seeAll")} <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {highlights.map((a) => (
              <Card key={a.id} className="group overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-shadow py-0">
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <img
                    src={a.image_url || "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600&q=80"}
                    alt={a.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {a.tag && (
                    <Badge className="absolute top-3 left-3 bg-white/90 text-foreground border-0 text-xs">
                      {a.tag}
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      <p className="font-semibold text-sm">{a.name}</p>
                    </div>
                    {a.maps_url && (
                      <a href={a.maps_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                  {a.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed">{a.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
      </section>

      {/* Itinerary Overview — horizontal slider */}
      {allSlots.length > 0 && (
        <section>
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{t("overview.journey")}</h2>
              <p className="text-muted-foreground">{t("overview.journeyDesc")}</p>
            </div>
            <Link to="/itinerary" className="text-sm font-medium text-primary hover:underline no-underline flex items-center gap-1">
              {t("overview.seeAll")} <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
            {itinerary.map((day, i) => {
              const dayNum = i + 1;
              const custom = dayCustomizations.find((c) => c.day_number === dayNum);
              const daySlotItems = allSlots.filter((s) => s.day_number === dayNum);
              const dayPlaces = daySlotItems
                .map((s) => places.find((p) => p.id === s.place_id))
                .filter(Boolean) as PlaceRow[];
              return (
                <Link key={day.dayLabel} to="/itinerary" className="no-underline snap-start flex-shrink-0 w-[280px] sm:w-[320px]">
                  <Card className="h-full overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 py-0">
                    <div className="relative h-36 w-full overflow-hidden">
                      <img
                        src={custom?.image_url || day.image}
                        alt={custom?.title || day.title}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-0 p-4">
                        <Badge className="mb-1.5 bg-white/20 text-white backdrop-blur-sm border-white/30 text-[10px]">
                          {day.dayLabel} · {day.date}
                        </Badge>
                        <p className="font-bold text-white text-sm">{custom?.title || day.title}</p>
                      </div>
                    </div>
                    <CardContent className="p-3">
                      {dayPlaces.length > 0 ? (
                        <div className="space-y-1.5">
                          {dayPlaces.slice(0, 4).map((p) => (
                            <div key={p.id} className="flex items-center gap-2">
                              {p.image_url ? (
                                <img src={p.image_url} alt="" className="h-6 w-6 rounded object-cover flex-shrink-0" />
                              ) : (
                                <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <MapPin className="h-3 w-3 text-primary" />
                                </div>
                              )}
                              <p className="text-xs truncate">{p.name}</p>
                            </div>
                          ))}
                          {dayPlaces.length > 4 && (
                            <p className="text-[10px] text-muted-foreground">+{dayPlaces.length - 4} more</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">No places planned yet</p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Saved Places */}
      {sortedPlaces.length > 0 && (
        <section>
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{t("overview.places")}</h2>
              <p className="text-muted-foreground">{t("overview.placesDesc")}</p>
            </div>
            <Link to="/places" className="text-sm font-medium text-primary hover:underline no-underline flex items-center gap-1">
              {t("overview.seeAll")} <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sortedPlaces.slice(0, PLACES_PREVIEW_LIMIT).map((p) => (
              <Card key={p.id} className="group overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 py-0">
                {p.image_url ? (
                  <div className="relative h-36 w-full overflow-hidden">
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    {p.category && (
                      <Badge className="absolute top-2 left-2 bg-white/90 text-foreground border-0 text-[10px]">{p.category}</Badge>
                    )}
                  </div>
                ) : (
                  <div className="relative h-20 w-full bg-muted flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-muted-foreground/40" />
                    {p.category && (
                      <Badge className="absolute top-2 left-2 bg-secondary text-foreground border-0 text-[10px]">{p.category}</Badge>
                    )}
                  </div>
                )}
                <CardContent className="p-3 space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className="font-semibold text-xs truncate">{p.name}</p>
                    <div className="flex gap-1 flex-shrink-0">
                      {p.maps_url && (
                        <a href={p.maps_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary cursor-pointer">
                          <MapPin className="h-3 w-3" />
                        </a>
                      )}
                      {p.website && (
                        <a href={p.website} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary cursor-pointer">
                          <Globe className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                  {p.notes && (
                    <p className="text-[10px] text-muted-foreground truncate">{p.notes}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          {sortedPlaces.length > PLACES_PREVIEW_LIMIT && (
            <div className="mt-4 flex justify-center">
              <Link to="/places">
                <Button variant="outline" className="rounded-full">
                  {t("overview.seeMore")} ({sortedPlaces.length - PLACES_PREVIEW_LIMIT} more) <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </section>
      )}

    </div>
  );
}
