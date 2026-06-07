"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { Ad } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import QRCodeModal from "@/components/dashboard/QRCodeModal";
import { Plus, Pencil, Trash2, QrCode, ExternalLink } from "lucide-react";

interface Props {
  initialData: Ad[];
  canEdit: boolean;
  canDelete: boolean;
  appUrl: string;
}

type FormData = {
  title: string;
  description: string;
  imageUrl: string;
  ctaText: string;
  ctaUrl: string;
  startsAt: string;
  endsAt: string;
  active: boolean;
};

const DEFAULT_FORM: FormData = {
  title: "",
  description: "",
  imageUrl: "",
  ctaText: "Claim Offer",
  ctaUrl: "",
  startsAt: "",
  endsAt: "",
  active: true,
};

function toDatetimeLocal(val: Date | string | null | undefined): string {
  if (!val) return "";
  const d = new Date(val);
  // Format as yyyy-MM-ddTHH:mm for input[type=datetime-local]
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AdsClient({ initialData, canEdit, canDelete, appUrl }: Props) {
  const [data, setData] = useState(initialData);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Ad | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Ad | null>(null);
  const [qrTarget, setQrTarget] = useState<Ad | null>(null);
  const [form, setForm] = useState<FormData>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);

  function openCreate() {
    setEditTarget(null);
    setForm(DEFAULT_FORM);
    setFormOpen(true);
  }

  function openEdit(ad: Ad) {
    setEditTarget(ad);
    setForm({
      title: ad.title,
      description: ad.description || "",
      imageUrl: ad.imageUrl || "",
      ctaText: ad.ctaText || "Claim Offer",
      ctaUrl: ad.ctaUrl || "",
      startsAt: toDatetimeLocal(ad.startsAt),
      endsAt: toDatetimeLocal(ad.endsAt),
      active: ad.active,
    });
    setFormOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = {
        ...form,
        startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
        endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
      };

      if (editTarget) {
        const res = await fetch(`/api/ads/${editTarget.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();
        const updated = await res.json();
        setData((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
        toast.success("Ad updated");
      } else {
        const res = await fetch("/api/ads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();
        const created = await res.json();
        setData((prev) => [created, ...prev]);
        toast.success("Ad created");
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
      const res = await fetch(`/api/ads/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setData((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      toast.success("Ad deleted");
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleteTarget(null);
    }
  }

  const formatDate = (d: Date | string | null | undefined) =>
    d ? new Date(d).toLocaleDateString() : "—";

  const isExpired = (ad: Ad) =>
    ad.endsAt ? new Date(ad.endsAt) < new Date() : false;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ads & Promotions</h1>
          <p className="text-muted-foreground text-sm">Manage promotional campaigns</p>
        </div>
        {canEdit && (
          <Button onClick={openCreate} className="bg-orange-500 hover:bg-orange-600">
            <Plus className="w-4 h-4 mr-2" /> Add Ad
          </Button>
        )}
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>End</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No ads yet.
                </TableCell>
              </TableRow>
            )}
            {data.map((ad) => (
              <TableRow key={ad.id}>
                <TableCell className="font-medium">{ad.title}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{formatDate(ad.startsAt)}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{formatDate(ad.endsAt)}</TableCell>
                <TableCell>
                  {isExpired(ad) ? (
                    <Badge variant="secondary">Expired</Badge>
                  ) : (
                    <Badge variant={ad.active ? "default" : "secondary"}>
                      {ad.active ? "Active" : "Inactive"}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setQrTarget(ad)} title="QR Code">
                      <QrCode className="w-4 h-4" />
                    </Button>
                    <a href={`${appUrl}/a/${ad.id}`} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon" title="View public page">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </a>
                    {canEdit && (
                      <Button variant="ghost" size="icon" onClick={() => openEdit(ad)} title="Edit">
                        <Pencil className="w-4 h-4" />
                      </Button>
                    )}
                    {canDelete && (
                      <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(ad)}
                        className="text-red-500 hover:text-red-600" title="Delete">
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

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Ad" : "Add Ad"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[70vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Promotion title" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>CTA Button Text</Label>
              <Input value={form.ctaText} onChange={(e) => setForm((f) => ({ ...f, ctaText: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>CTA URL</Label>
              <Input value={form.ctaUrl} onChange={(e) => setForm((f) => ({ ...f, ctaUrl: e.target.value }))} placeholder="https://..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="datetime-local" value={form.startsAt} onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="datetime-local" value={form.endsAt} onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="adactive" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} className="rounded" />
              <Label htmlFor="adactive">Active</Label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving || !form.title} className="bg-orange-500 hover:bg-orange-600">
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Ad</AlertDialogTitle>
            <AlertDialogDescription>
              Delete <strong>{deleteTarget?.title}</strong>? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <QRCodeModal
        open={!!qrTarget}
        onClose={() => setQrTarget(null)}
        entityUrl={qrTarget ? `${appUrl}/a/${qrTarget.id}` : ""}
        entityName={qrTarget?.title || ""}
      />
    </div>
  );
}
