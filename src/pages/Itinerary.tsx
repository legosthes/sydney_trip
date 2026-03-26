import { useState, useEffect, useMemo } from "react";
import {
  PlaneLanding,
  Plane,
  Ship,
  Landmark,
  Store,
  Camera,
  Fish,
  Utensils,
  Bed,
  PawPrint,
  FerrisWheel,
  Umbrella,
  Footprints,
  ShoppingBag,
  Trees,
  Wine,
  Luggage,
  MapPin,
  Hotel,
  ExternalLink,
  MapPinned,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { itinerary } from "@/data/trip";
import { getPlacesByDay, type PlaceRow } from "@/lib/api";
import { useTranslation } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";

const iconMap: Record<string, LucideIcon> = {
  "plane-landing": PlaneLanding,
  plane: Plane,
  ship: Ship,
  landmark: Landmark,
  store: Store,
  camera: Camera,
  fish: Fish,
  utensils: Utensils,
  bed: Bed,
  "paw-print": PawPrint,
  "ferris-wheel": FerrisWheel,
  umbrella: Umbrella,
  footprints: Footprints,
  "shopping-bag": ShoppingBag,
  trees: Trees,
  wine: Wine,
  luggage: Luggage,
  hotel: Hotel,
};

export function Itinerary() {
  const { t } = useTranslation();
  const [selectedDay, setSelectedDay] = useState(0);
  const [dayPlaces, setDayPlaces] = useState<PlaceRow[]>([]);
  const [focusedLocation, setFocusedLocation] = useState<string | null>(null);

  useEffect(() => {
    const dayLabel = itinerary[selectedDay].dayLabel;
    getPlacesByDay(dayLabel).then(setDayPlaces);
    setFocusedLocation(null);
  }, [selectedDay]);

  // Map URL: focused on a single location or showing all day locations
  const mapUrl = useMemo(() => {
    if (focusedLocation) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(focusedLocation + ", Sydney")}&output=embed&z=15`;
    }
    const locations = itinerary[selectedDay].activities
      .filter((a) => a.location)
      .map((a) => a.location!);
    if (locations.length === 0) return null;
    const query = locations.join(", ") + ", Sydney";
    return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed&z=12`;
  }, [selectedDay, focusedLocation]);

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t("itinerary.title")}</h1>
        <p className="text-muted-foreground mt-1">{t("itinerary.subtitle")}</p>
      </div>

      {/* Day Selector */}
      <div className="mb-8">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {itinerary.map((day, i) => (
            <button
              key={day.dayLabel}
              onClick={() => setSelectedDay(i)}
              className={cn(
                "flex-shrink-0 rounded-2xl border px-5 py-3 text-left transition-all",
                selectedDay === i
                  ? "border-primary bg-primary text-primary-foreground shadow-md"
                  : "border-border bg-card hover:border-primary/40 hover:bg-secondary"
              )}
            >
              <p className={cn("text-xs font-medium", selectedDay === i ? "text-primary-foreground/70" : "text-muted-foreground")}>{day.date}</p>
              <p className="font-semibold text-sm mt-0.5">{day.dayLabel}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Row 2: Photo (left) | Itinerary timeline (right) */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Photo + stats */}
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-2xl">
            <img
              src={itinerary[selectedDay].image}
              alt={itinerary[selectedDay].title}
              className="aspect-[4/3] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-0 p-6">
              <Badge className="mb-2 bg-white/20 text-white backdrop-blur-sm border-white/30">
                {itinerary[selectedDay].dayLabel}
              </Badge>
              <h2 className="text-2xl font-bold text-white">{itinerary[selectedDay].title}</h2>
              <p className="text-white/70 text-sm mt-1">{itinerary[selectedDay].date}</p>
            </div>
          </div>
        </div>

        {/* Itinerary timeline */}
        <div className="space-y-0">
          {itinerary[selectedDay].activities.map((activity, i) => {
            const Icon = iconMap[activity.icon] || MapPin;
            const isLast = i === itinerary[selectedDay].activities.length - 1;
            const isFocused = focusedLocation === activity.location;
            return (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                    isFocused
                      ? "bg-primary border-primary"
                      : "bg-primary/10 border-primary/20"
                  )}>
                    <Icon className={cn("h-4 w-4", isFocused ? "text-primary-foreground" : "text-primary")} />
                  </div>
                  {!isLast && <div className="w-0.5 flex-1 bg-border my-1" />}
                </div>
                <Card
                  className={cn(
                    "mb-4 flex-1 shadow-sm transition-all",
                    isFocused
                      ? "border-primary/50 ring-2 ring-primary/20 shadow-md"
                      : "border-border/50",
                    activity.location && "cursor-pointer hover:border-primary/30"
                  )}
                  onClick={() => {
                    if (activity.location) setFocusedLocation(activity.location);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs font-medium">{activity.time}</Badge>
                      {activity.location && (
                        <span className={cn(
                          "flex items-center gap-1 text-xs transition-colors",
                          isFocused ? "text-primary font-medium" : "text-muted-foreground"
                        )}>
                          <MapPin className="h-3 w-3" />
                          {activity.location}
                          {activity.mapsUrl && (
                            <a href={activity.mapsUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="hover:text-primary">
                              <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          )}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-sm text-foreground">{activity.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{activity.description}</p>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {/* Row 3: Map (left) | Saved Places (right) */}
      <div className="grid gap-6 lg:grid-cols-2 mt-6">
        {/* Map */}
        {mapUrl && (
          <Card className="border-border/50 overflow-hidden">
            <div className="flex items-center justify-between px-4 pt-3 pb-1">
              <div className="flex items-center gap-2">
                <MapPinned className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm">
                  {focusedLocation || t("itinerary.mapView")}
                </h3>
              </div>
              {focusedLocation && (
                <button
                  type="button"
                  onClick={() => setFocusedLocation(null)}
                  className="text-xs text-primary hover:underline"
                >
                  {t("itinerary.showAll")}
                </button>
              )}
            </div>
            <CardContent className="p-2">
              <iframe
                key={mapUrl}
                src={mapUrl}
                className="w-full h-[350px] lg:h-[420px] rounded-lg border-0"
                loading="lazy"
                allowFullScreen
                title="Day route map"
              />
            </CardContent>
          </Card>
        )}

        {/* Saved Places */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPinned className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">{t("itinerary.savedPlaces")}</h3>
            </div>
            <Link to="/places" className="text-xs text-primary hover:underline no-underline">
              {t("itinerary.viewAll")}
            </Link>
          </div>
          {dayPlaces.length > 0 ? (
            <div className="space-y-2">
              {dayPlaces.map((p) => (
                <Card
                  key={p.id}
                  className="border-border/50 shadow-sm cursor-pointer hover:border-primary/40 transition-colors"
                  onClick={() => setFocusedLocation(p.name)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-xs truncate">{p.name}</p>
                        {p.category && (
                          <Badge variant="secondary" className="text-[10px] mt-0.5">{p.category}</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {p.maps_url && (
                          <a href={p.maps_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[10px] text-foreground hover:bg-secondary transition-colors no-underline">
                            <MapPin className="h-2.5 w-2.5" /> Map
                            <ExternalLink className="h-2 w-2" />
                          </a>
                        )}
                      </div>
                    </div>
                    {p.notes && <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{p.notes}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-border/50 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <MapPinned className="h-6 w-6 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">{t("places.noPlaces")}</p>
                <Link to="/places" className="text-xs text-primary mt-2 hover:underline no-underline">
                  {t("places.addPlace")} →
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
