import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Sun,
  Coffee,
  CloudSun,
  UtensilsCrossed,
  Moon,
  Wine,
  Plus,
  X,
  MapPin,
  ExternalLink,
  MapPinned,
  Loader2,
  Search,
  GripVertical,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { itinerary } from "@/data/trip";
import {
  getAllPlaces,
  getSlotsByDay,
  addSlot,
  removeSlot,
  type PlaceRow,
  type ItinerarySlotRow,
  type SlotType,
} from "@/lib/api";
import { useToast } from "@/components/Toast";
import { useTranslation } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { TranslationKey } from "@/i18n/translations";

// ── Slot constants ──

const SLOT_ORDER: SlotType[] = ["morning", "breakfast", "afternoon", "lunch", "evening", "dinner"];
const MEAL_SLOTS: SlotType[] = ["breakfast", "lunch", "dinner"];

function slotMax(type: SlotType): number {
  return (MEAL_SLOTS as readonly string[]).includes(type) ? 1 : 3;
}

const SLOT_META: Record<SlotType, { icon: LucideIcon; labelKey: TranslationKey; color: string }> = {
  morning: { icon: Sun, labelKey: "itinerary.morning", color: "#f59e0b" },
  breakfast: { icon: Coffee, labelKey: "itinerary.breakfast", color: "#8b5cf6" },
  afternoon: { icon: CloudSun, labelKey: "itinerary.afternoon", color: "#3b82f6" },
  lunch: { icon: UtensilsCrossed, labelKey: "itinerary.lunch", color: "#10b981" },
  evening: { icon: Moon, labelKey: "itinerary.evening", color: "#6366f1" },
  dinner: { icon: Wine, labelKey: "itinerary.dinner", color: "#ef4444" },
};

// ── Draggable Place (sidebar) ──

function DraggablePlaceCard({ place }: { place: PlaceRow }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `place-${place.id}`,
    data: { place },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "flex items-center gap-2 rounded-lg border border-border p-2 bg-card cursor-grab active:cursor-grabbing hover:border-primary/40 transition-colors",
        isDragging && "opacity-30"
      )}
    >
      <GripVertical className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
      {place.image_url ? (
        <img src={place.image_url} alt="" className="h-8 w-8 rounded object-cover flex-shrink-0" />
      ) : (
        <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
          <MapPin className="h-3.5 w-3.5 text-primary" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium truncate">{place.name}</p>
        {place.category && <p className="text-[10px] text-muted-foreground">{place.category}</p>}
      </div>
    </div>
  );
}

// ── Droppable Slot ──

function DroppableSlot({
  slotType,
  dayNumber,
  slots,
  places,
  onRemove,
  onOpenPicker,
  onFocusLocation,
  focusedLocation,
  t,
}: {
  slotType: SlotType;
  dayNumber: number;
  slots: ItinerarySlotRow[];
  places: PlaceRow[];
  onRemove: (slotId: string) => void;
  onOpenPicker: (slotType: SlotType) => void;
  onFocusLocation: (name: string) => void;
  focusedLocation: string | null;
  t: (key: TranslationKey) => string;
}) {
  const meta = SLOT_META[slotType];
  const Icon = meta.icon;
  const max = slotMax(slotType);
  const isMeal = (MEAL_SLOTS as readonly string[]).includes(slotType);
  const slotsForType = slots.filter((s) => s.slot_type === slotType);
  const isFull = slotsForType.length >= max;

  const { isOver, setNodeRef } = useDroppable({
    id: `slot-${dayNumber}-${slotType}`,
    data: { dayNumber, slotType },
    disabled: isFull,
  });

  // Resolve place data for each slot entry
  const slotPlaces = slotsForType.map((s) => ({
    slot: s,
    place: places.find((p) => p.id === s.place_id),
  }));

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-xl border-2 border-dashed p-3 transition-colors",
        isOver && !isFull ? "border-primary bg-primary/5" : "border-border/60",
        isFull && isOver && "border-destructive/50"
      )}
    >
      {/* Slot header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="rounded-lg p-1.5" style={{ backgroundColor: `${meta.color}15` }}>
            <Icon className="h-3.5 w-3.5" style={{ color: meta.color }} />
          </div>
          <span className="text-xs font-semibold">{t(meta.labelKey)}</span>
          <span className="text-[10px] text-muted-foreground">
            {slotsForType.length}/{max}
          </span>
        </div>
        {!isFull && (
          <button
            type="button"
            onClick={() => onOpenPicker(slotType)}
            className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[10px] font-medium hover:bg-secondary transition-colors"
          >
            <Plus className="h-2.5 w-2.5" /> {t("itinerary.addToSlot")}
          </button>
        )}
      </div>

      {/* Place cards */}
      {slotPlaces.length > 0 ? (
        <div className={cn("grid gap-2", isMeal ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3")}>
          {slotPlaces.map(({ slot, place }) =>
            place ? (
              <div
                key={slot.id}
                onClick={() => onFocusLocation(place.name)}
                className={cn(
                  "group relative flex items-center gap-2 rounded-lg border p-2 bg-card cursor-pointer transition-all hover:shadow-sm",
                  focusedLocation === place.name ? "border-primary ring-1 ring-primary/30" : "border-border/50"
                )}
              >
                {place.image_url ? (
                  <img src={place.image_url} alt="" className="h-10 w-10 rounded-md object-cover flex-shrink-0" />
                ) : (
                  <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold truncate">{place.name}</p>
                  {place.category && (
                    <Badge variant="secondary" className="text-[9px] mt-0.5">{place.category}</Badge>
                  )}
                </div>
                {place.maps_url && (
                  <a
                    href={place.maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-muted-foreground hover:text-primary flex-shrink-0"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onRemove(slot.id); }}
                  className="absolute -top-1.5 -right-1.5 hidden group-hover:flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white text-[10px] shadow-sm"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : null
          )}
        </div>
      ) : (
        <p className="text-[11px] text-muted-foreground text-center py-3">
          {t("itinerary.dragHint")}
        </p>
      )}
    </div>
  );
}

// ── Main Page ──

export function Itinerary() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedDay, setSelectedDay] = useState(0);
  const [allPlaces, setAllPlaces] = useState<PlaceRow[]>([]);
  const [daySlots, setDaySlots] = useState<ItinerarySlotRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSlotType, setPickerSlotType] = useState<SlotType | null>(null);
  const [focusedLocation, setFocusedLocation] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeDragPlace, setActiveDragPlace] = useState<PlaceRow | null>(null);

  const dayNumber = selectedDay + 1;

  // Fetch all places once
  useEffect(() => {
    getAllPlaces().then((rows) => {
      setAllPlaces(rows);
      setLoading(false);
    });
  }, []);

  // Fetch slots when day changes
  useEffect(() => {
    getSlotsByDay(dayNumber).then(setDaySlots);
    setFocusedLocation(null);
  }, [dayNumber]);

  // Map URL
  const mapUrl = useMemo(() => {
    if (focusedLocation) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(focusedLocation + ", Sydney")}&output=embed&z=15`;
    }
    // Show all places in current day's slots
    const placeNames = daySlots
      .map((s) => allPlaces.find((p) => p.id === s.place_id)?.name)
      .filter(Boolean);
    if (placeNames.length === 0) {
      // Fallback: show day's first location from static data
      const locs = itinerary[selectedDay]?.activities?.filter((a) => a.location).map((a) => a.location!) || [];
      if (locs.length === 0) return null;
      return `https://maps.google.com/maps?q=${encodeURIComponent(locs.join(", ") + ", Sydney")}&output=embed&z=12`;
    }
    return `https://maps.google.com/maps?q=${encodeURIComponent(placeNames.join(", ") + ", Sydney")}&output=embed&z=12`;
  }, [selectedDay, focusedLocation, daySlots, allPlaces]);

  // Add place to slot
  const handleAddToSlot = useCallback(
    async (slotType: SlotType, placeId: string) => {
      const slotsForType = daySlots.filter((s) => s.slot_type === slotType);
      const max = slotMax(slotType);
      if (slotsForType.length >= max) {
        toast(t("toast.slotFull"), "deleted");
        return;
      }
      try {
        const created = await addSlot({
          day_number: dayNumber,
          slot_type: slotType,
          place_id: placeId,
          position: slotsForType.length,
        });
        setDaySlots((prev) => [...prev, created]);
        toast(t("toast.slotAdded"), "created");
      } catch {
        toast(t("toast.slotFull"), "deleted");
      }
    },
    [dayNumber, daySlots, toast, t]
  );

  // Remove place from slot
  const handleRemoveSlot = useCallback(
    async (slotId: string) => {
      setDaySlots((prev) => prev.filter((s) => s.id !== slotId));
      await removeSlot(slotId);
      toast(t("toast.slotRemoved"), "deleted");
    },
    [toast, t]
  );

  // Open picker
  const openPicker = (slotType: SlotType) => {
    setPickerSlotType(slotType);
    setPickerOpen(true);
    setSearchTerm("");
  };

  // DnD handlers
  const handleDragStart = (event: DragStartEvent) => {
    const place = event.active.data.current?.place as PlaceRow | undefined;
    setActiveDragPlace(place || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragPlace(null);
    const { active, over } = event;
    if (!over) return;
    const place = active.data.current?.place as PlaceRow | undefined;
    const slotType = over.data.current?.slotType as SlotType | undefined;
    if (place && slotType) {
      handleAddToSlot(slotType, place.id);
    }
  };

  // Filtered places for picker
  const pickerPlaces = allPlaces.filter((p) => {
    if (!searchTerm) return true;
    return p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
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

        {/* Row 1: Photo (left) | Slot Timeline (right) */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Day photo */}
          <div>
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

          {/* Slot Timeline */}
          <div className="space-y-3">
            {SLOT_ORDER.map((slotType) => (
              <DroppableSlot
                key={slotType}
                slotType={slotType}
                dayNumber={dayNumber}
                slots={daySlots}
                places={allPlaces}
                onRemove={handleRemoveSlot}
                onOpenPicker={openPicker}
                onFocusLocation={setFocusedLocation}
                focusedLocation={focusedLocation}
                t={t}
              />
            ))}
          </div>
        </div>

        {/* Row 2: Map (left) | All Saved Places sidebar (right) */}
        <div className="grid gap-6 lg:grid-cols-2 mt-6">
          {/* Map */}
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
              {mapUrl ? (
                <iframe
                  key={mapUrl}
                  src={mapUrl}
                  className="w-full h-[350px] lg:h-[450px] rounded-lg border-0"
                  loading="lazy"
                  allowFullScreen
                  title="Day route map"
                />
              ) : (
                <div className="flex items-center justify-center h-[350px] text-muted-foreground text-sm">
                  Add places to see them on the map
                </div>
              )}
            </CardContent>
          </Card>

          {/* All Saved Places — draggable sidebar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPinned className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm">{t("itinerary.allPlaces")}</h3>
              </div>
              <Link to="/places" className="text-xs text-primary hover:underline no-underline">
                {t("itinerary.viewAll")}
              </Link>
            </div>
            <p className="text-[11px] text-muted-foreground">{t("itinerary.dragHint")}</p>
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {allPlaces.length > 0 ? (
                allPlaces.map((p) => <DraggablePlaceCard key={p.id} place={p} />)
              ) : (
                <Card className="border-border/50 border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                    <MapPinned className="h-5 w-5 text-muted-foreground mb-2" />
                    <p className="text-xs text-muted-foreground">{t("places.noPlaces")}</p>
                    <Link to="/places" className="text-xs text-primary mt-1 hover:underline no-underline">
                      {t("places.addPlace")} →
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Place Picker Modal */}
        {pickerOpen && pickerSlotType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-xs" onClick={() => setPickerOpen(false)} role="presentation" />
            <div className="relative z-10 w-full max-w-lg mx-4 rounded-xl bg-popover p-6 shadow-xl ring-1 ring-foreground/10 max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-semibold">{t("itinerary.pickPlace")}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t(SLOT_META[pickerSlotType].labelKey)} — {itinerary[selectedDay].dayLabel}
                  </p>
                </div>
                <button type="button" onClick={() => setPickerOpen(false)} className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t("itinerary.searchPlaces")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex h-9 w-full rounded-lg border border-input bg-transparent pl-9 pr-3 py-1 text-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  autoFocus
                />
              </div>

              {/* Place list */}
              <div className="flex-1 overflow-y-auto space-y-2">
                {pickerPlaces.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">{t("places.noPlaces")}</p>
                ) : (
                  pickerPlaces.map((place) => {
                    const alreadyInSlot = daySlots.some(
                      (s) => s.slot_type === pickerSlotType && s.place_id === place.id
                    );
                    return (
                      <button
                        key={place.id}
                        type="button"
                        disabled={alreadyInSlot}
                        onClick={() => {
                          handleAddToSlot(pickerSlotType, place.id);
                          setPickerOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                          alreadyInSlot
                            ? "border-border/30 bg-muted/50 opacity-50 cursor-not-allowed"
                            : "border-border hover:border-primary/40 hover:bg-secondary cursor-pointer"
                        )}
                      >
                        {place.image_url ? (
                          <img src={place.image_url} alt="" className="h-10 w-10 rounded-md object-cover flex-shrink-0" />
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <MapPin className="h-4 w-4 text-primary" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{place.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {place.category && (
                              <Badge variant="secondary" className="text-[10px]">{place.category}</Badge>
                            )}
                            {alreadyInSlot && (
                              <span className="text-[10px] text-muted-foreground">Already added</span>
                            )}
                          </div>
                        </div>
                        {!alreadyInSlot && <Plus className="h-4 w-4 text-primary flex-shrink-0" />}
                      </button>
                    );
                  })
                )}
              </div>

              <div className="mt-3 pt-3 border-t">
                <Link to="/places" className="text-xs text-primary hover:underline no-underline" onClick={() => setPickerOpen(false)}>
                  {t("places.addPlace")} →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Drag Overlay */}
        <DragOverlay>
          {activeDragPlace && (
            <div className="flex items-center gap-2 rounded-lg border border-primary bg-card p-2 shadow-lg opacity-90 w-48">
              {activeDragPlace.image_url ? (
                <img src={activeDragPlace.image_url} alt="" className="h-8 w-8 rounded object-cover" />
              ) : (
                <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                </div>
              )}
              <p className="text-xs font-medium truncate">{activeDragPlace.name}</p>
            </div>
          )}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
