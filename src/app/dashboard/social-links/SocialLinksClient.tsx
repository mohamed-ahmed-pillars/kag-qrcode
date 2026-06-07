"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { SocialLink } from "@/lib/schema";
import { getIcon, AVAILABLE_ICONS } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, GripVertical, Save } from "lucide-react";

interface Props {
  initialData: SocialLink[];
  canEdit: boolean;
  canDelete: boolean;
}

type FormData = { label: string; url: string; iconName: string; active: boolean };
const DEFAULT_FORM: FormData = { label: "", url: "", iconName: "link", active: true };

// Sortable row component
function SortableRow({
  link,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: {
  link: SocialLink;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = getIcon(link.iconName);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 border rounded-lg px-4 py-3 bg-white"
    >
      {canEdit && (
        <button {...attributes} {...listeners} className="cursor-grab touch-none text-gray-400 hover:text-gray-600">
          <GripVertical className="w-4 h-4" />
        </button>
      )}
      <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-orange-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{link.label}</p>
        <p className="text-xs text-muted-foreground truncate">{link.url}</p>
      </div>
      <Badge variant={link.active ? "default" : "secondary"} className="shrink-0">
        {link.active ? "Active" : "Hidden"}
      </Badge>
      <div className="flex items-center gap-1 shrink-0">
        {canEdit && (
          <Button variant="ghost" size="icon" onClick={onEdit}>
            <Pencil className="w-3.5 h-3.5" />
          </Button>
        )}
        {canDelete && (
          <Button variant="ghost" size="icon" onClick={onDelete} className="text-red-500 hover:text-red-600">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}

export default function SocialLinksClient({ initialData, canEdit, canDelete }: Props) {
  const [data, setData] = useState(initialData);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<SocialLink | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SocialLink | null>(null);
  const [form, setForm] = useState<FormData>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [reorderSaving, setReorderSaving] = useState(false);
  const [orderDirty, setOrderDirty] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setData((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
    setOrderDirty(true);
  }

  async function saveOrder() {
    setReorderSaving(true);
    try {
      await Promise.all(
        data.map((link, index) =>
          fetch(`/api/social-links/${link.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ displayOrder: index + 1 }),
          })
        )
      );
      toast.success("Order saved");
      setOrderDirty(false);
    } catch {
      toast.error("Failed to save order");
    } finally {
      setReorderSaving(false);
    }
  }

  function openCreate() {
    setEditTarget(null);
    setForm(DEFAULT_FORM);
    setFormOpen(true);
  }

  function openEdit(link: SocialLink) {
    setEditTarget(link);
    setForm({
      label: link.label,
      url: link.url,
      iconName: link.iconName || "link",
      active: link.active,
    });
    setFormOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editTarget) {
        const res = await fetch(`/api/social-links/${editTarget.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error();
        const updated = await res.json();
        setData((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
        toast.success("Link updated");
      } else {
        const res = await fetch("/api/social-links", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, displayOrder: data.length + 1 }),
        });
        if (!res.ok) throw new Error();
        const created = await res.json();
        setData((prev) => [...prev, created]);
        toast.success("Link created");
      }
      setFormOpen(false);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/social-links/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setData((prev) => prev.filter((l) => l.id !== deleteTarget.id));
      toast.success("Link deleted");
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Social Links</h1>
          <p className="text-muted-foreground text-sm">Manage links shown on the main page. Drag to reorder.</p>
        </div>
        <div className="flex items-center gap-2">
          {orderDirty && (
            <Button variant="outline" onClick={saveOrder} disabled={reorderSaving}>
              <Save className="w-4 h-4 mr-2" />
              {reorderSaving ? "Saving..." : "Save Order"}
            </Button>
          )}
          {canEdit && (
            <Button onClick={openCreate} className="bg-orange-500 hover:bg-orange-600">
              <Plus className="w-4 h-4 mr-2" /> Add Link
            </Button>
          )}
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={data.map((d) => d.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {data.length === 0 && (
              <p className="text-center text-muted-foreground py-8 text-sm">
                No links yet. Add one to get started.
              </p>
            )}
            {data.map((link) => (
              <SortableRow
                key={link.id}
                link={link}
                canEdit={canEdit}
                canDelete={canDelete}
                onEdit={() => openEdit(link)}
                onDelete={() => setDeleteTarget(link)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Link" : "Add Link"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Label *</Label>
              <Input value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} placeholder="e.g. Instagram" />
            </div>
            <div className="space-y-2">
              <Label>URL *</Label>
              <Input value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>Icon</Label>
              <Select value={form.iconName} onValueChange={(v) => setForm((f) => ({ ...f, iconName: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select icon" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_ICONS.map((icon) => {
                    const Icon = getIcon(icon.name);
                    return (
                      <SelectItem key={icon.name} value={icon.name}>
                        <span className="flex items-center gap-2">
                          <Icon className="w-4 h-4" /> {icon.label}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="lactive" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} className="rounded" />
              <Label htmlFor="lactive">Visible on main page</Label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving || !form.label || !form.url} className="bg-orange-500 hover:bg-orange-600">
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Link</AlertDialogTitle>
            <AlertDialogDescription>
              Delete <strong>{deleteTarget?.label}</strong>? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
