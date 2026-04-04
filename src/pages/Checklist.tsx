import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Trash2,
  PencilLine,
  X,
  CheckSquare,
  Square,
  Loader2,
  ClipboardList,
  GripVertical,
  FolderPlus,
} from "lucide-react";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { PageHero } from "@/components/PageHero";
import { useToast } from "@/components/Toast";
import {
  getAllChecklist,
  insertChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
  type ChecklistItemRow,
} from "@/lib/api";
import { useTranslation } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";

const DEFAULT_CATEGORIES = [
  "Documents",
  "Clothing",
  "Toiletries",
  "Baby Items",
  "Electronics",
  "Miscellaneous",
];

interface ItemForm {
  text: string;
  category: string;
}

const emptyForm: ItemForm = { text: "", category: "Miscellaneous" };

// ── Draggable checklist item ──

function DraggableChecklistItem({
  item,
  onToggle,
  onEdit,
  onDelete,
}: {
  item: ChecklistItemRow;
  onToggle: (item: ChecklistItemRow) => void;
  onEdit: (item: ChecklistItemRow) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `item-${item.id}`,
    data: { item },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "group/item flex items-center gap-3 p-3 sm:p-4",
        isDragging && "opacity-30",
      )}
    >
      <div
        {...listeners}
        {...attributes}
        className="flex-shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none opacity-0 group-hover/item:opacity-100 transition-opacity"
      >
        <GripVertical className="h-4 w-4" />
      </div>
      <button
        type="button"
        onClick={() => onToggle(item)}
        className="flex-shrink-0 text-primary hover:text-primary/70 transition-all duration-200 active:scale-90"
      >
        {item.checked ? (
          <CheckSquare className="h-5 w-5 transition-transform duration-200 scale-110" />
        ) : (
          <Square className="h-5 w-5 text-muted-foreground transition-transform duration-200 hover:scale-110" />
        )}
      </button>
      <span
        className={cn(
          "flex-1 text-sm",
          item.checked && "line-through text-muted-foreground",
        )}
      >
        {item.text}
      </span>
      <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity">
        <button
          type="button"
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
          onClick={() => onEdit(item)}
        >
          <PencilLine className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
          onClick={() => onDelete(item.id)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ── Droppable group ──

function DroppableGroup({
  category,
  children,
}: {
  category: string;
  children: React.ReactNode;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `group-${category}`,
    data: { category },
  });

  return (
    <div ref={setNodeRef}>
      <Card
        className={cn(
          "border-border/50 shadow-sm transition-colors py-0 gap-0",
          isOver && "border-primary ring-1 ring-primary/30 bg-primary/5",
        )}
      >
        <CardContent className="p-0">{children}</CardContent>
      </Card>
    </div>
  );
}

export function Checklist() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [items, setItems] = useState<ChecklistItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ItemForm>(emptyForm);

  // Custom groups management
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [groupName, setGroupName] = useState("");

  // Drag state
  const [activeItem, setActiveItem] = useState<ChecklistItemRow | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  useEffect(() => {
    getAllChecklist().then((rows) => {
      setItems(rows);
      // Discover custom categories from existing items
      const existingCats = new Set(rows.map((r) => r.category).filter(Boolean) as string[]);
      const custom = [...existingCats].filter((c) => !DEFAULT_CATEGORIES.includes(c));
      setCustomCategories(custom);
      setLoading(false);
    });
  }, []);

  // All available categories
  const allCategories = useMemo(
    () => [...DEFAULT_CATEGORIES, ...customCategories],
    [customCategories],
  );

  const totalItems = items.length;
  const checkedItems = items.filter((i) => i.checked).length;
  const progressPct = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0;

  // Group by category
  const grouped = useMemo(() => {
    const groups = allCategories.map((cat) => ({
      category: cat,
      items: items.filter((i) => i.category === cat),
    }));
    // Items with unknown category
    const ungrouped = items.filter(
      (i) => !allCategories.includes(i.category || ""),
    );
    if (ungrouped.length > 0) {
      groups.push({ category: "Other", items: ungrouped });
    }
    return groups.filter((g) => g.items.length > 0 || customCategories.includes(g.category));
  }, [items, allCategories, customCategories]);

  const toggleItem = async (item: ChecklistItemRow) => {
    const newChecked = item.checked ? 0 : 1;
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, checked: newChecked } : i)),
    );
    await updateChecklistItem(item.id, { checked: newChecked });
    toast(
      newChecked
        ? `${item.text} ${t("checklist.checked")}`
        : `${item.text} ${t("checklist.unchecked")}`,
      "checked",
    );
  };

  const openAdd = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (item: ChecklistItemRow) => {
    setEditingId(item.id);
    setFormData({
      text: item.text,
      category: item.category || "Miscellaneous",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.text) return;
    if (editingId) {
      const updated = await updateChecklistItem(editingId, {
        text: formData.text,
        category: formData.category,
      });
      setItems((prev) => prev.map((i) => (i.id === editingId ? updated : i)));
      toast(t("toast.itemUpdated"), "updated");
    } else {
      const created = await insertChecklistItem({
        text: formData.text,
        category: formData.category,
        sort_order: 99,
      });
      setItems((prev) => [...prev, created]);
      toast(t("toast.itemAdded"), "created");
    }
    setDialogOpen(false);
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await deleteChecklistItem(id);
    toast(t("toast.itemDeleted"), "deleted");
  };

  // ── Group management ──

  const openAddGroup = () => {
    setEditingGroup(null);
    setGroupName("");
    setGroupDialogOpen(true);
  };

  const openEditGroup = (category: string) => {
    setEditingGroup(category);
    setGroupName(category);
    setGroupDialogOpen(true);
  };

  const handleGroupSubmit = async () => {
    const name = groupName.trim();
    if (!name) return;
    if (allCategories.includes(name) && name !== editingGroup) {
      toast(t("checklist.groupExists"), "deleted");
      return;
    }

    if (editingGroup) {
      // Rename: update all items in old group to new name
      const toUpdate = items.filter((i) => i.category === editingGroup);
      const updatedItems = items.map((i) =>
        i.category === editingGroup ? { ...i, category: name } : i,
      );
      setItems(updatedItems);

      // Update custom categories list
      if (DEFAULT_CATEGORIES.includes(editingGroup)) {
        // Renaming a default category — add the new name as custom
        setCustomCategories((prev) => [...prev, name]);
      } else {
        setCustomCategories((prev) =>
          prev.map((c) => (c === editingGroup ? name : c)),
        );
      }

      // Persist to backend
      await Promise.all(
        toUpdate.map((i) => updateChecklistItem(i.id, { category: name })),
      );
      toast(t("toast.itemUpdated"), "updated");
    } else {
      // Add new group
      setCustomCategories((prev) => [...prev, name]);
      toast(t("checklist.groupAdded"), "created");
    }
    setGroupDialogOpen(false);
    setEditingGroup(null);
  };

  const handleDeleteGroup = async (category: string) => {
    // Move items to Miscellaneous, then remove the group
    const toUpdate = items.filter((i) => i.category === category);
    setItems((prev) =>
      prev.map((i) =>
        i.category === category ? { ...i, category: "Miscellaneous" } : i,
      ),
    );
    setCustomCategories((prev) => prev.filter((c) => c !== category));
    await Promise.all(
      toUpdate.map((i) =>
        updateChecklistItem(i.id, { category: "Miscellaneous" }),
      ),
    );
    toast(t("toast.itemDeleted"), "deleted");
  };

  // ── Drag and drop ──

  const handleDragStart = (event: DragStartEvent) => {
    const item = event.active.data.current?.item as ChecklistItemRow | undefined;
    if (item) setActiveItem(item);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveItem(null);
    const { active, over } = event;
    if (!over) return;

    const item = active.data.current?.item as ChecklistItemRow | undefined;
    const targetCategory = over.data.current?.category as string | undefined;
    if (!item || !targetCategory || item.category === targetCategory) return;

    // Optimistic update
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id ? { ...i, category: targetCategory } : i,
      ),
    );
    await updateChecklistItem(item.id, { category: targetCategory });
    toast(
      `${item.text} → ${targetCategory}`,
      "updated",
    );
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
        image="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1400&q=80"
        badge="Sydney 2026"
        title={t("checklist.title")}
        subtitle={t("checklist.subtitle")}
        action={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={openAdd}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-white/90 transition-colors w-fit"
            >
              <Plus className="h-4 w-4" /> {t("checklist.addItem")}
            </button>
            <button
              type="button"
              onClick={openAddGroup}
              className="inline-flex items-center gap-2 rounded-full bg-white/20 border-2 border-white/50 px-4 py-2 text-sm font-medium text-white hover:bg-white/30 backdrop-blur-sm transition-colors w-fit"
            >
              <FolderPlus className="h-4 w-4" /> {t("checklist.addGroup")}
            </button>
          </div>
        }
      />

      {/* Progress */}
      <div className="animate-in" style={{ animationFillMode: "both" }}>
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium">{t("checklist.progress")}</p>
              <p className="text-sm text-muted-foreground">
                {checkedItems} / {totalItems} {t("checklist.packed")}
              </p>
            </div>
            <Progress value={progressPct} className="h-3" />
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Item Modal */}
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
            className="relative z-10 w-full max-w-md mx-4 rounded-xl bg-popover p-6 shadow-xl ring-1 ring-foreground/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold">
                {editingId ? t("checklist.editItem") : t("checklist.addItem")}
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
                <label htmlFor="cl-text" className="text-sm font-medium">
                  {t("checklist.itemText")}
                </label>
                <input
                  id="cl-text"
                  type="text"
                  required
                  value={formData.text}
                  onChange={(e) =>
                    setFormData({ ...formData, text: e.target.value })
                  }
                  className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="cl-cat" className="text-sm font-medium">
                  {t("checklist.category")}
                </label>
                <select
                  id="cl-cat"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {allCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                {editingId ? t("checklist.save") : t("checklist.addItem")}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Group Modal */}
      {groupDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
        >
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-xs"
            onClick={() => {
              setGroupDialogOpen(false);
              setEditingGroup(null);
            }}
            role="presentation"
          />
          <div
            className="relative z-10 w-full max-w-md mx-4 rounded-xl bg-popover p-6 shadow-xl ring-1 ring-foreground/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold">
                {editingGroup
                  ? t("checklist.editGroup")
                  : t("checklist.addGroup")}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setGroupDialogOpen(false);
                  setEditingGroup(null);
                }}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleGroupSubmit();
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label htmlFor="grp-name" className="text-sm font-medium">
                  {t("checklist.groupName")}
                </label>
                <input
                  id="grp-name"
                  type="text"
                  required
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                {editingGroup ? t("checklist.save") : t("checklist.addGroup")}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Checklist Groups — two-column grid with drag-and-drop */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {grouped.map((group, gi) => {
            const groupChecked = group.items.filter((i) => i.checked).length;
            const isCustom = customCategories.includes(group.category);
            return (
              <div
                key={group.category}
                className="animate-in"
                style={{
                  animationDelay: `${80 + gi * 80}ms`,
                  animationFillMode: "both",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="font-semibold text-base font-heading">
                    {group.category}
                  </h2>
                  <Badge variant="secondary" className="text-xs">
                    {groupChecked}/{group.items.length}
                  </Badge>
                  <div className="flex-1" />
                  <button
                    type="button"
                    className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                    onClick={() => openEditGroup(group.category)}
                    title={t("checklist.editGroup")}
                  >
                    <PencilLine className="h-3 w-3" />
                  </button>
                  {isCustom && (
                    <button
                      type="button"
                      className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
                      onClick={() => handleDeleteGroup(group.category)}
                      title={t("checklist.deleteGroup")}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <DroppableGroup category={group.category}>
                  {group.items.length > 0 ? (
                    group.items.map((item, i) => (
                      <div key={item.id}>
                        {i > 0 && <Separator />}
                        <DraggableChecklistItem
                          item={item}
                          onToggle={toggleItem}
                          onEdit={openEdit}
                          onDelete={handleDelete}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-xs text-muted-foreground">
                      {t("checklist.dragHere")}
                    </div>
                  )}
                </DroppableGroup>
              </div>
            );
          })}
        </div>

        {/* Drag overlay */}
        <DragOverlay>
          {activeItem && (
            <div className="flex items-center gap-3 p-3 rounded-lg border border-primary bg-card shadow-xl max-w-sm">
              <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              {activeItem.checked ? (
                <CheckSquare className="h-5 w-5 text-primary flex-shrink-0" />
              ) : (
                <Square className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              )}
              <span
                className={cn(
                  "text-sm truncate",
                  activeItem.checked && "line-through text-muted-foreground",
                )}
              >
                {activeItem.text}
              </span>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {totalItems === 0 && grouped.length === 0 && (
        <Card className="border-border/50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <ClipboardList className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-medium text-muted-foreground">
              {t("checklist.noItems")}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
