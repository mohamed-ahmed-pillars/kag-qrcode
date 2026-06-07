"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Employee } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import QRCodeModal from "@/components/dashboard/QRCodeModal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, QrCode, ExternalLink, X } from "lucide-react";
import type { ActionLink } from "@/lib/schema";

const ACTION_LINK_TYPES: { value: ActionLink["type"]; label: string }[] = [
  { value: "phone", label: "Phone" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
  { value: "website", label: "Website" },
  { value: "instagram", label: "Instagram" },
  { value: "other", label: "Other" },
];

interface Props {
  initialData: Employee[];
  canEdit: boolean;
  canDelete: boolean;
  appUrl: string;
}

type FormData = {
  name: string;
  title: string;
  photoUrl: string;
  bio: string;
  active: boolean;
  actionLinks: ActionLink[];
};

const DEFAULT_FORM: FormData = {
  name: "",
  title: "",
  photoUrl: "",
  bio: "",
  active: true,
  actionLinks: [],
};

export default function EmployeesClient({ initialData, canEdit, canDelete, appUrl }: Props) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Employee | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [qrTarget, setQrTarget] = useState<Employee | null>(null);
  const [form, setForm] = useState<FormData>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);

  function openCreate() {
    setEditTarget(null);
    setForm(DEFAULT_FORM);
    setFormOpen(true);
  }

  function openEdit(emp: Employee) {
    setEditTarget(emp);
    setForm({
      name: emp.name,
      title: emp.title || "",
      photoUrl: emp.photoUrl || "",
      bio: emp.bio || "",
      active: emp.active,
      actionLinks: (emp.actionLinks as ActionLink[]) || [],
    });
    setFormOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editTarget) {
        const res = await fetch(`/api/employees/${editTarget.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("Failed to update");
        const updated = await res.json();
        setData((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
        toast.success("Employee updated");
      } else {
        const res = await fetch("/api/employees", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("Failed to create");
        const created = await res.json();
        setData((prev) => [created, ...prev]);
        toast.success("Employee created");
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
      const res = await fetch(`/api/employees/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setData((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      toast.success("Employee deleted");
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Employees</h1>
          <p className="text-muted-foreground text-sm">Manage employee profiles</p>
        </div>
        {canEdit && (
          <Button onClick={openCreate} className="bg-orange-500 hover:bg-orange-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        )}
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Public URL</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No employees yet. Add one to get started.
                </TableCell>
              </TableRow>
            )}
            {data.map((emp) => (
              <TableRow key={emp.id}>
                <TableCell className="font-medium">{emp.name}</TableCell>
                <TableCell className="text-muted-foreground">{emp.title || "—"}</TableCell>
                <TableCell>
                  <Badge variant={emp.active ? "default" : "secondary"}>
                    {emp.active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <a
                    href={`${appUrl}/e/${emp.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                  >
                    /e/{emp.id.slice(0, 8)}...
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQrTarget(emp)}
                      title="QR Code"
                    >
                      <QrCode className="w-4 h-4" />
                    </Button>
                    {canEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(emp)}
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(emp)}
                        title="Delete"
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Employee" : "Add Employee"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title / Position</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Chef, Manager"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="photoUrl">Photo URL</Label>
              <Input
                id="photoUrl"
                value={form.photoUrl}
                onChange={(e) => setForm((f) => ({ ...f, photoUrl: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                placeholder="Short bio..."
                rows={3}
              />
            </div>
            {/* Action Links */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Action Links</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      actionLinks: [...f.actionLinks, { label: "", url: "", type: "website" }],
                    }))
                  }
                >
                  <Plus className="w-3 h-3 mr-1" /> Add Link
                </Button>
              </div>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {form.actionLinks.map((link, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <div className="flex-1 space-y-1">
                      <Input
                        placeholder="Label (e.g. Call Us)"
                        value={link.label}
                        onChange={(e) =>
                          setForm((f) => {
                            const al = [...f.actionLinks];
                            al[i] = { ...al[i], label: e.target.value };
                            return { ...f, actionLinks: al };
                          })
                        }
                      />
                      <Input
                        placeholder="URL / phone / email"
                        value={link.url}
                        onChange={(e) =>
                          setForm((f) => {
                            const al = [...f.actionLinks];
                            al[i] = { ...al[i], url: e.target.value };
                            return { ...f, actionLinks: al };
                          })
                        }
                      />
                      <Select
                        value={link.type}
                        onValueChange={(v) =>
                          setForm((f) => {
                            const al = [...f.actionLinks];
                            al[i] = { ...al[i], type: v as ActionLink["type"] };
                            return { ...f, actionLinks: al };
                          })
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ACTION_LINK_TYPES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="mt-1 text-red-500 hover:text-red-600 shrink-0"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          actionLinks: f.actionLinks.filter((_, j) => j !== i),
                        }))
                      }
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {form.actionLinks.length === 0 && (
                  <p className="text-xs text-muted-foreground py-2 text-center">
                    No links yet. Click &quot;Add Link&quot; to add one.
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={form.active}
                onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="active">Active (visible on public page)</Label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !form.name}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employee</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* QR Code Modal */}
      <QRCodeModal
        open={!!qrTarget}
        onClose={() => setQrTarget(null)}
        entityUrl={qrTarget ? `${appUrl}/e/${qrTarget.id}` : ""}
        entityName={qrTarget?.name || ""}
      />
    </div>
  );
}
