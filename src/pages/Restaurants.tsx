import { useState, useEffect } from "react";
import {
  MapPin,
  UtensilsCrossed,
  Baby,
  Loader2,
  Globe,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAllRestaurants, type RestaurantRow } from "@/lib/api";
import { cn } from "@/lib/utils";
import { itinerary } from "@/data/trip";

const dayFilters = ["All", ...itinerary.map((d) => d.dayLabel)];

export function Restaurants() {
  const [restaurants, setRestaurants] = useState<RestaurantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState("All");

  useEffect(() => {
    getAllRestaurants().then((rows) => {
      setRestaurants(rows);
      setLoading(false);
    });
  }, []);

  const filtered =
    selectedDay === "All"
      ? restaurants
      : restaurants.filter((r) => r.day_labels?.includes(selectedDay));

  // Separate "near hotel" (Chippendale) from day-specific
  const daySpecific = filtered.filter(
    (r) => r.area !== "Chippendale"
  );
  const nearHotel = filtered.filter(
    (r) => r.area === "Chippendale"
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="pb-20 space-y-8">
      {/* Header */}
      <div className="px-0">
        <h1 className="text-3xl font-bold tracking-tight">
          Restaurant Recommendations
        </h1>
        <p className="text-muted-foreground mt-1">
          Family-friendly dining options for each day of the trip
        </p>
      </div>

      {/* Day Filter */}
      <div className="px-0">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {dayFilters.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={cn(
                "flex-shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-all",
                selectedDay === day
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-card hover:border-primary/40 hover:bg-secondary text-muted-foreground"
              )}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Day-Specific Restaurants */}
      {daySpecific.length > 0 && (
        <div className="px-0">
          <h2 className="text-xl font-bold tracking-tight mb-4">
            {selectedDay === "All" ? "All Restaurants" : `${selectedDay} — Nearby Picks`}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {daySpecific.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
        </div>
      )}

      {/* Near Hotel */}
      {nearHotel.length > 0 && (
        <div className="px-0">
          <h2 className="text-xl font-bold tracking-tight mb-1">
            Near the Hotel (Chippendale)
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Walking distance from Adina Apartment Hotel — great for any night
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {nearHotel.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="px-0">
          <Card className="border-dashed border-border/50">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <UtensilsCrossed className="h-8 w-8 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No restaurants found for this filter</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function RestaurantCard({ restaurant: r }: { restaurant: RestaurantRow }) {
  return (
    <Card className="group overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-shadow">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={r.image_url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80"}
          alt={r.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex gap-1.5">
          {r.price_range && (
            <Badge className="bg-black/60 text-white border-0 backdrop-blur-sm text-xs">
              {r.price_range}
            </Badge>
          )}
          {r.kid_friendly === 1 && (
            <Badge className="bg-emerald-600/80 text-white border-0 backdrop-blur-sm text-xs gap-1">
              <Baby className="h-3 w-3" /> Kid-friendly
            </Badge>
          )}
        </div>
        {r.meal_type && (
          <Badge className="absolute top-3 right-3 bg-white/90 text-foreground border-0 text-xs">
            {r.meal_type}
          </Badge>
        )}
      </div>
      <CardContent className="p-4 space-y-3">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm leading-tight">{r.name}</h3>
            {r.cuisine && (
              <Badge variant="secondary" className="text-xs flex-shrink-0">
                {r.cuisine}
              </Badge>
            )}
          </div>
          {r.description && (
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
              {r.description}
            </p>
          )}
        </div>

        {r.address && (
          <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
            <span>{r.address}</span>
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          {r.maps_url && (
            <a href={r.maps_url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="h-7 rounded-full text-xs gap-1.5">
                <MapPin className="h-3 w-3" /> Map
              </Button>
            </a>
          )}
          {r.website && (
            <a href={r.website} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="h-7 rounded-full text-xs gap-1.5">
                <Globe className="h-3 w-3" /> Website
              </Button>
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
