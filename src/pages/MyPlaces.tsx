import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  PencilLine,
  X,
  MapPin,
  Globe,
  ExternalLink,
  Loader2,
  MapPinned,
  Search,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHero } from "@/components/PageHero";
import { useToast } from "@/components/Toast";
import {
  getAllPlaces,
  insertPlace,
  updatePlace,
  deletePlace,
  type PlaceRow,
} from "@/lib/api";
import { useTranslation } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  "Restaurant",
  "Cafe",
  "Bar",
  "Attraction",
  "Shop",
  "Transport",
  "Other",
];

interface PlaceForm {
  name: string;
  notes: string;
  maps_url: string;
  website: string;
  category: string;
  day_labels: string;
  image_url: string;
}

const emptyForm: PlaceForm = {
  name: "",
  notes: "",
  maps_url: "",
  website: "",
  category: "Attraction",
  day_labels: "",
  image_url: "",
};

export function MyPlaces() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [places, setPlaces] = useState<PlaceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PlaceForm>(emptyForm);

  useEffect(() => {
    getAllPlaces().then((rows) => {
      setPlaces(rows);
      setLoading(false);
    });
  }, []);

  const categoryFilters = ["All", ...CATEGORIES];

  const filtered = places
    .filter(
      (p) => selectedCategory === "All" || p.category === selectedCategory,
    )
    .filter(
      (p) =>
        !searchTerm ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.notes?.toLowerCase().includes(searchTerm.toLowerCase()),
    );

  const openAdd = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (p: PlaceRow) => {
    setEditingId(p.id);
    setFormData({
      name: p.name,
      notes: p.notes || "",
      maps_url: p.maps_url || "",
      website: p.website || "",
      category: p.category || "Attraction",
      day_labels: p.day_labels || "",
      image_url: p.image_url || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name) return;
    const payload = {
      name: formData.name,
      notes: formData.notes || null,
      maps_url: formData.maps_url || null,
      website: formData.website || null,
      category: formData.category || null,
      day_labels: formData.day_labels || null,
      image_url: formData.image_url || null,
    };
    if (editingId) {
      const updated = await updatePlace(editingId, payload);
      setPlaces((prev) => prev.map((p) => (p.id === editingId ? updated : p)));
      toast(t("toast.placeUpdated"), "updated");
    } else {
      const created = await insertPlace(payload);
      setPlaces((prev) => [created, ...prev]);
      toast(t("toast.placeAdded"), "created");
    }
    setDialogOpen(false);
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    setPlaces((prev) => prev.filter((p) => p.id !== id));
    await deletePlace(id);
    toast(t("toast.placeDeleted"), "deleted");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="pb-20 space-y-8">
      <PageHero
        image="https://images.unsplash.com/photo-1624138784614-87fd1b6528f8?w=1400&q=80"
        badge="Sydney 2026"
        title={t("places.title")}
        subtitle={t("places.subtitle")}
        action={
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-white/90 transition-colors w-fit"
          >
            <Plus className="h-4 w-4" /> {t("places.addPlace")}
          </button>
        }
      />

      {/* Filters: Day pills + Search */}
      <div className="space-y-3">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categoryFilters.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={cn(
                "flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors border",
                selectedCategory === c
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:bg-secondary text-foreground",
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t("places.search")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex h-9 w-full rounded-lg border border-input bg-transparent pl-9 pr-3 py-1 text-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Add/Edit Modal */}
      {dialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
        >
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-xs"
            onClick={() => {
              setDialogOpen(false);
              setEditingId(null);
            }}
            role="presentation"
          />
          <div
            className="relative z-10 w-full max-w-md mx-4 rounded-xl bg-popover p-6 shadow-xl ring-1 ring-foreground/10 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold">
                {editingId ? t("places.editPlace") : t("places.addPlace")}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setDialogOpen(false);
                  setEditingId(null);
                }}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label htmlFor="place-name" className="text-sm font-medium">
                  {t("places.name")}
                </label>
                <input
                  id="place-name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="place-cat" className="text-sm font-medium">
                  {t("places.category")}
                </label>
                <select
                  id="place-cat"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="place-notes" className="text-sm font-medium">
                  {t("places.notes")}
                </label>
                <textarea
                  id="place-notes"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="place-maps" className="text-sm font-medium">
                  {t("places.mapsUrl")}
                </label>
                <input
                  id="place-maps"
                  type="url"
                  placeholder="https://maps.app.goo.gl/..."
                  value={formData.maps_url}
                  onChange={(e) =>
                    setFormData({ ...formData, maps_url: e.target.value })
                  }
                  className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="place-web" className="text-sm font-medium">
                  {t("places.website")}
                </label>
                <input
                  id="place-web"
                  type="url"
                  placeholder="https://..."
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                  className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="place-img" className="text-sm font-medium">
                  {t("places.imageUrl")}
                </label>
                <input
                  id="place-img"
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image_url}
                  onChange={(e) =>
                    setFormData({ ...formData, image_url: e.target.value })
                  }
                  className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                {editingId ? t("places.save") : t("places.addPlace")}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Places Grid */}
      {filtered.length === 0 ? (
        <Card className="border-border/50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <MapPinned className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-medium text-muted-foreground">
              {t("places.noPlaces")}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {t("places.noPlacesHint")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((place) => (
            <Card
              key={place.id}
              className="border-border/50 shadow-sm overflow-hidden py-0"
            >
              {/* Image or Map embed */}
              {place.image_url ? (
                <div className="aspect-[16/9] w-full overflow-hidden">
                  <img
                    src={place.image_url}
                    alt={place.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : place.maps_url ? (
                <div className="aspect-[16/9] w-full">
                  <iframe
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(place.name)}&output=embed&z=15`}
                    className="h-full w-full border-0"
                    loading="lazy"
                    allowFullScreen
                    title={place.name}
                  />
                </div>
              ) : null}
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-lg">{place.name}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {place.category && (
                        <Badge variant="secondary" className="text-xs">
                          {place.category}
                        </Badge>
                      )}
                      {place.day_labels &&
                        place.day_labels.split(",").map((d) => (
                          <Badge
                            key={d}
                            className="bg-primary/10 text-primary border-0 text-[10px]"
                          >
                            {d.trim()}
                          </Badge>
                        ))}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      type="button"
                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                      onClick={() => openEdit(place)}
                    >
                      <PencilLine className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
                      onClick={() => handleDelete(place.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {place.notes && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {place.notes}
                  </p>
                )}

                <div className="flex items-center gap-2">
                  {place.maps_url && (
                    <a
                      href={place.maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs text-foreground hover:bg-secondary transition-colors no-underline"
                    >
                      <MapPin className="h-3 w-3" /> {t("places.map")}
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  )}
                  {place.website && (
                    <a
                      href={place.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs text-foreground hover:bg-secondary transition-colors no-underline"
                    >
                      <Globe className="h-3 w-3" /> {t("places.website")}
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
