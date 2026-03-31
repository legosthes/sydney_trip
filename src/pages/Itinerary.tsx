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
  PanelRightClose,
  PanelRightOpen,
  ImageIcon,
  PencilLine,
  Check,
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
  getAllDayCustomizations,
  updateDayCustomization,
  type PlaceRow,
  type ItinerarySlotRow,
  type SlotType,
  type DayCustomization,
} from "@/lib/api";
import { useToast } from "@/components/Toast";
import { useTranslation } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { TranslationKey } from "@/i18n/translations";

// ── Slot constants ──

const SLOT_ORDER: SlotType[] = [
  "breakfast",
  "morning",
  "lunch",
  "afternoon",
  "dinner",
  "evening",
];
const MEAL_SLOTS: SlotType[] = ["breakfast", "lunch", "dinner"];

function slotMax(type: SlotType): number {
  return (MEAL_SLOTS as readonly string[]).includes(type) ? 1 : 3;
}

const SLOT_META: Record<
  SlotType,
  { icon: LucideIcon; labelKey: TranslationKey; color: string }
> = {
  morning: { icon: Sun, labelKey: "itinerary.morning", color: "#f59e0b" },
  breakfast: {
    icon: Coffee,
    labelKey: "itinerary.breakfast",
    color: "#8b5cf6",
  },
  afternoon: {
    icon: CloudSun,
    labelKey: "itinerary.afternoon",
    color: "#3b82f6",
  },
  lunch: {
    icon: UtensilsCrossed,
    labelKey: "itinerary.lunch",
    color: "#10b981",
  },
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
        isDragging && "opacity-30",
      )}
    >
      <GripVertical className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
      {place.image_url ? (
        <img
          src={place.image_url}
          alt=""
          className="h-8 w-8 rounded object-cover flex-shrink-0"
        />
      ) : (
        <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
          <MapPin className="h-3.5 w-3.5 text-primary" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium truncate">{place.name}</p>
        {place.category && (
          <p className="text-[10px] text-muted-foreground">{place.category}</p>
        )}
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
  const isSingle = slotPlaces.length === 1;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-xl border-2 border-dashed p-3 transition-colors",
        isOver && !isFull ? "border-primary bg-primary/5" : "border-border/60",
        isFull && isOver && "border-destructive/50",
      )}
    >
      {/* Slot header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className="rounded-lg p-1.5"
            style={{ backgroundColor: `${meta.color}15` }}
          >
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
        <div
          className={cn(
            "grid gap-2",
            isMeal
              ? "grid-cols-1"
              : slotPlaces.length === 1
                ? "grid-cols-1"
                : slotPlaces.length === 2
                  ? "grid-cols-1 sm:grid-cols-2"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
          )}
        >
          {slotPlaces.map(({ slot, place }) =>
            place ? (
              <div
                key={slot.id}
                onClick={() => onFocusLocation(place.name)}
                className={cn(
                  "group relative flex flex-col rounded-lg border bg-card cursor-pointer transition-all hover:shadow-sm overflow-hidden",
                  focusedLocation === place.name
                    ? "border-primary ring-1 ring-primary/30"
                    : "border-border/50",
                )}
                style={{ minHeight: isSingle ? undefined : "236px" }}
              >
                {/* Image area */}
                {place.image_url ? (
                  <div
                    className={cn(
                      "w-full overflow-hidden flex-shrink-0",
                      isSingle ? "h-36" : "h-28",
                    )}
                  >
                    <img
                      src={place.image_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className={cn(
                      "w-full bg-primary/5 flex items-center justify-center flex-shrink-0",
                      isSingle ? "h-36" : "h-28",
                    )}
                  >
                    <MapPin className="h-8 w-8 text-primary/30" />
                  </div>
                )}
                {/* Info area */}
                <div
                  className={cn(
                    "flex-1 flex flex-col justify-between",
                    isSingle ? "p-4" : "p-3",
                  )}
                >
                  <div>
                    <p
                      className={cn(
                        "font-semibold leading-tight",
                        isSingle ? "text-xl" : "text-sm",
                      )}
                    >
                      {place.name}
                    </p>
                    {place.category && (
                      <Badge
                        variant="secondary"
                        className={cn(
                          "mt-1",
                          isSingle ? "text-[10px]" : "text-[9px]",
                        )}
                      >
                        {place.category}
                      </Badge>
                    )}
                    {place.notes && (
                      <p
                        className={cn(
                          "text-muted-foreground mt-1",
                          isSingle
                            ? "text-xs line-clamp-3"
                            : "text-[10px] line-clamp-2",
                        )}
                      >
                        {place.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    {place.maps_url && (
                      <a
                        href={place.maps_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className={cn(
                          "inline-flex items-center gap-0.5 text-muted-foreground hover:text-primary",
                          isSingle ? "text-xs" : "text-[10px]",
                        )}
                      >
                        <MapPin
                          className={cn(isSingle ? "h-3 w-3" : "h-2.5 w-2.5")}
                        />{" "}
                        Map{" "}
                        <ExternalLink
                          className={cn(isSingle ? "h-2.5 w-2.5" : "h-2 w-2")}
                        />
                      </a>
                    )}
                  </div>
                </div>
                {/* Remove button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(slot.id);
                  }}
                  className="absolute top-1.5 right-1.5 hidden group-hover:flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white text-[10px] shadow-sm"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : null,
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
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeDragPlace, setActiveDragPlace] = useState<PlaceRow | null>(null);
  const [dayCustomizations, setDayCustomizations] = useState<
    DayCustomization[]
  >([]);
  const [photoPickerOpen, setPhotoPickerOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [hasMounted, setHasMounted] = useState(false);

  const dayNumber = selectedDay + 1;

  // Fetch all places + day customizations once
  useEffect(() => {
    Promise.all([
      getAllPlaces(),
      getAllDayCustomizations().catch(() => [] as DayCustomization[]),
    ]).then(([places, customs]) => {
      setAllPlaces(places);
      setDayCustomizations(customs);
      setLoading(false);
      setHasMounted(true);
    });
  }, []);

  // Fetch slots when day changes
  useEffect(() => {
    getSlotsByDay(dayNumber).then(setDaySlots);
    setFocusedLocation(null);
    setEditingTitle(false);
  }, [dayNumber, hasMounted]);

  // Get current day's customization
  const currentCustom = dayCustomizations.find(
    (c) => c.day_number === dayNumber,
  );
  const dayTitle = currentCustom?.title || itinerary[selectedDay].title;
  const dayImage = currentCustom?.image_url || itinerary[selectedDay].image;

  // Places in current day's slots (for photo picker)
  const slotPlacesWithImages = useMemo(() => {
    return daySlots
      .map((s) => allPlaces.find((p) => p.id === s.place_id))
      .filter((p): p is PlaceRow => !!p && !!p.image_url);
  }, [daySlots, allPlaces]);

  const handleSaveTitle = async () => {
    const newTitle = titleDraft.trim() || null;
    const updated = await updateDayCustomization(dayNumber, {
      title: newTitle,
      image_url: currentCustom?.image_url ?? null,
    });
    setDayCustomizations((prev) => {
      const filtered = prev.filter((c) => c.day_number !== dayNumber);
      return [...filtered, updated];
    });
    setEditingTitle(false);
  };

  const handleSelectPhoto = async (imageUrl: string | null) => {
    const updated = await updateDayCustomization(dayNumber, {
      title: currentCustom?.title ?? null,
      image_url: imageUrl,
    });
    setDayCustomizations((prev) => {
      const filtered = prev.filter((c) => c.day_number !== dayNumber);
      return [...filtered, updated];
    });
    setPhotoPickerOpen(false);
  };

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
      const locs =
        itinerary[selectedDay]?.activities
          ?.filter((a) => a.location)
          .map((a) => a.location!) || [];
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
    [dayNumber, daySlots, toast, t],
  );

  // Remove place from slot
  const handleRemoveSlot = useCallback(
    async (slotId: string) => {
      setDaySlots((prev) => prev.filter((s) => s.id !== slotId));
      await removeSlot(slotId);
      toast(t("toast.slotRemoved"), "deleted");
    },
    [toast, t],
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

  // Unassigned places (not in current day's slots)
  const unassignedPlaces = allPlaces.filter(
    (p) => !daySlots.some((s) => s.place_id === p.id),
  );

  // Unique categories from all places
  const placeCategories = [
    "All",
    ...Array.from(
      new Set(allPlaces.map((p) => p.category).filter(Boolean) as string[]),
    ),
  ];

  // Filtered unassigned for sidebar
  const filteredUnassigned = unassignedPlaces.filter((p) => {
    const matchesSearch =
      !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Filtered places for picker modal (all places, not just unassigned)
  const pickerPlaces = allPlaces.filter((p) => {
    if (!searchTerm) return true;
    return (
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
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
          <h1 className="text-3xl font-bold tracking-tight font-heading">
            {t("itinerary.title")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("itinerary.subtitle")}
          </p>
        </div>

        {/* Day Selector */}
        <div className="mb-8">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {itinerary.map((day, i) => {
              const custom = dayCustomizations.find(
                (c) => c.day_number === i + 1,
              );
              return (
                <button
                  key={day.dayLabel}
                  onClick={() => setSelectedDay(i)}
                  className={cn(
                    "flex-shrink-0 rounded-2xl border px-5 py-3 text-left transition-all duration-300",
                    selectedDay === i
                      ? "border-primary bg-primary text-primary-foreground shadow-md scale-[1.02]"
                      : "border-border bg-card hover:border-primary/40 hover:bg-secondary hover:scale-[1.01]",
                  )}
                >
                  <p
                    className={cn(
                      "text-xs font-medium",
                      selectedDay === i
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground",
                    )}
                  >
                    {day.date}
                  </p>
                  <p className="font-semibold text-sm mt-0.5">
                    {custom?.title || day.title}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3-column layout: [Photo+Map | Slots | Unassigned Sidebar] */}
        <div
          className={cn(
            "grid gap-5",
            sidebarOpen
              ? "lg:grid-cols-[1fr_1.5fr_260px]"
              : "lg:grid-cols-[1fr_1.5fr_40px]",
          )}
        >
          {/* Left column: Photo + Map — sticky */}
          <div
            className={cn(
              "lg:sticky lg:top-20 lg:self-start space-y-3 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:scrollbar-hide",
            )}
          >
            {/* Day photo */}
            <div className="group/photo relative overflow-hidden rounded-2xl">
              <img
                src={dayImage}
                alt={dayTitle}
                className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover/photo:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              {/* Photo change button */}
              {slotPlacesWithImages.length > 0 && (
                <button
                  type="button"
                  onClick={() => setPhotoPickerOpen(true)}
                  className="absolute top-3 right-3 opacity-0 group-hover/photo:opacity-100 transition-opacity inline-flex items-center gap-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 text-xs font-medium hover:bg-black/70"
                >
                  <ImageIcon className="h-3 w-3" /> {t("itinerary.changePhoto")}
                </button>
              )}
              <div className="absolute bottom-0 p-5 w-full">
                <Badge className="mb-2 bg-white/20 text-white backdrop-blur-sm border-white/30">
                  {itinerary[selectedDay].dayLabel}
                </Badge>
                {editingTitle ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={titleDraft}
                      onChange={(e) => setTitleDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveTitle();
                        if (e.key === "Escape") setEditingTitle(false);
                      }}
                      autoFocus
                      className="bg-transparent border-b-2 border-white/60 text-xl font-bold text-white outline-none placeholder:text-white/40 w-full"
                      placeholder={itinerary[selectedDay].title}
                    />
                    <button
                      type="button"
                      onClick={handleSaveTitle}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingTitle(false)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="group/title flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white font-heading">{dayTitle}</h2>
                    <button
                      type="button"
                      onClick={() => {
                        setTitleDraft(dayTitle);
                        setEditingTitle(true);
                      }}
                      className="opacity-0 group-hover/title:opacity-100 transition-opacity inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
                    >
                      <PencilLine className="h-3 w-3" />
                    </button>
                  </div>
                )}
                <p className="text-white/70 text-sm mt-1">
                  {itinerary[selectedDay].date}
                </p>
              </div>
            </div>

            {/* Map — directly under photo */}
            <Card className="border-border/50 overflow-hidden">
              <div className="flex items-center justify-between px-3 pt-2 pb-1">
                <div className="flex items-center gap-2">
                  <MapPinned className="h-3.5 w-3.5 text-primary" />
                  <h3 className="font-semibold text-xs">
                    {focusedLocation || t("itinerary.mapView")}
                  </h3>
                </div>
                {focusedLocation && (
                  <button
                    type="button"
                    onClick={() => setFocusedLocation(null)}
                    className="text-[10px] text-primary hover:underline"
                  >
                    {t("itinerary.showAll")}
                  </button>
                )}
              </div>
              <CardContent className="p-1.5">
                {mapUrl ? (
                  <iframe
                    key={mapUrl}
                    src={mapUrl}
                    className="w-full h-[300px] lg:h-[400px] xl:h-[500px] rounded-lg border-0"
                    loading="lazy"
                    allowFullScreen
                    title="Day route map"
                  />
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
                    {t("itinerary.dragHint")}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Center column: Slot Timeline */}
          <div
            className="space-y-3"
          >
            {SLOT_ORDER.map((slotType) => (
              <div key={slotType}>
                <DroppableSlot
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
              </div>
            ))}
          </div>

          {/* Right column: Collapsible Unassigned Places sidebar */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            {sidebarOpen ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPinned className="h-3.5 w-3.5 text-primary" />
                    <h3 className="font-semibold text-xs">
                      {t("itinerary.unassigned")}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <Link
                      to="/places"
                      className="text-[10px] text-primary hover:underline no-underline"
                    >
                      {t("itinerary.viewAll")}
                    </Link>
                    <button
                      type="button"
                      onClick={() => setSidebarOpen(false)}
                      className="hidden lg:inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-muted transition-colors text-muted-foreground"
                      title="Collapse sidebar"
                    >
                      <PanelRightClose className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={t("itinerary.searchPlaces")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex h-8 w-full rounded-lg border border-input bg-transparent pl-7 pr-3 py-1 text-xs transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                {/* Category filter */}
                {placeCategories.length > 2 && (
                  <div className="flex gap-1 flex-wrap">
                    {placeCategories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors border",
                          selectedCategory === cat
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border hover:bg-secondary text-foreground",
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}

                <p className="text-[10px] text-muted-foreground">
                  {t("itinerary.dragHint")}
                </p>

                <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto pr-1">
                  {filteredUnassigned.length > 0 ? (
                    filteredUnassigned.map((p) => (
                      <DraggablePlaceCard key={p.id} place={p} />
                    ))
                  ) : unassignedPlaces.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border/60 py-6 text-center">
                      <p className="text-[10px] text-muted-foreground">
                        {t("itinerary.allAssigned")}
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-border/60 py-6 text-center">
                      <p className="text-[10px] text-muted-foreground">
                        {t("places.noPlaces")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Collapsed sidebar — just a toggle button */
              <div className="hidden lg:flex flex-col items-center pt-1">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-secondary transition-colors text-muted-foreground"
                  title="Expand sidebar"
                >
                  <PanelRightOpen className="h-4 w-4" />
                </button>
                <span className="text-[9px] text-muted-foreground mt-1 [writing-mode:vertical-lr]">
                  {t("itinerary.unassigned")} ({unassignedPlaces.length})
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Photo Picker Modal */}
        {photoPickerOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            role="dialog"
          >
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-xs"
              onClick={() => setPhotoPickerOpen(false)}
              role="presentation"
            />
            <div
              className="relative z-10 w-full max-w-lg mx-4 rounded-xl bg-popover p-6 shadow-xl ring-1 ring-foreground/10 max-h-[80vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold">
                  {t("itinerary.selectPhoto")}
                </h2>
                <button
                  type="button"
                  onClick={() => setPhotoPickerOpen(false)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2">
                {/* Default photo option */}
                <button
                  type="button"
                  onClick={() => handleSelectPhoto(null)}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:border-primary/40 hover:bg-secondary",
                    !currentCustom?.image_url
                      ? "border-primary ring-1 ring-primary/30"
                      : "border-border",
                  )}
                >
                  <img
                    src={itinerary[selectedDay].image}
                    alt=""
                    className="h-14 w-20 rounded-md object-cover flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {t("itinerary.useDefault")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {itinerary[selectedDay].title}
                    </p>
                  </div>
                  {!currentCustom?.image_url && (
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  )}
                </button>
                {/* Places with images */}
                {slotPlacesWithImages.map((place) => (
                  <button
                    key={place.id}
                    type="button"
                    onClick={() => handleSelectPhoto(place.image_url)}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:border-primary/40 hover:bg-secondary",
                      currentCustom?.image_url === place.image_url
                        ? "border-primary ring-1 ring-primary/30"
                        : "border-border",
                    )}
                  >
                    <img
                      src={place.image_url!}
                      alt=""
                      className="h-14 w-20 rounded-md object-cover flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {place.name}
                      </p>
                      {place.category && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {place.category}
                        </p>
                      )}
                    </div>
                    {currentCustom?.image_url === place.image_url && (
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Place Picker Modal */}
        {pickerOpen && pickerSlotType && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            role="dialog"
          >
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-xs"
              onClick={() => setPickerOpen(false)}
              role="presentation"
            />
            <div
              className="relative z-10 w-full max-w-lg mx-4 rounded-xl bg-popover p-6 shadow-xl ring-1 ring-foreground/10 max-h-[80vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-semibold">
                    {t("itinerary.pickPlace")}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t(SLOT_META[pickerSlotType].labelKey)} —{" "}
                    {itinerary[selectedDay].dayLabel}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPickerOpen(false)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted transition-colors"
                >
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
                  <p className="text-sm text-muted-foreground text-center py-8">
                    {t("places.noPlaces")}
                  </p>
                ) : (
                  pickerPlaces.map((place) => {
                    const alreadyInSlot = daySlots.some(
                      (s) =>
                        s.slot_type === pickerSlotType &&
                        s.place_id === place.id,
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
                            : "border-border hover:border-primary/40 hover:bg-secondary cursor-pointer",
                        )}
                      >
                        {place.image_url ? (
                          <img
                            src={place.image_url}
                            alt=""
                            className="h-10 w-10 rounded-md object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <MapPin className="h-4 w-4 text-primary" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">
                            {place.name}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {place.category && (
                              <Badge
                                variant="secondary"
                                className="text-[10px]"
                              >
                                {place.category}
                              </Badge>
                            )}
                            {alreadyInSlot && (
                              <span className="text-[10px] text-muted-foreground">
                                Already added
                              </span>
                            )}
                          </div>
                        </div>
                        {!alreadyInSlot && (
                          <Plus className="h-4 w-4 text-primary flex-shrink-0" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              <div className="mt-3 pt-3 border-t">
                <Link
                  to="/places"
                  className="text-xs text-primary hover:underline no-underline"
                  onClick={() => setPickerOpen(false)}
                >
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
                <img
                  src={activeDragPlace.image_url}
                  alt=""
                  className="h-8 w-8 rounded object-cover"
                />
              ) : (
                <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                </div>
              )}
              <p className="text-xs font-medium truncate">
                {activeDragPlace.name}
              </p>
            </div>
          )}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
