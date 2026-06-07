"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { Product } from "@/lib/schema";
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
  initialData: Product[];
  canEdit: boolean;
  canDelete: boolean;
  appUrl: string;
}

type FormData = {
  name: string;
  description: string;
  price: string;
  currency: string;
  category: string;
  ctaText: string;
  ctaUrl: string;
  active: boolean;
};

const DEFAULT_FORM: FormData = {
  name: "",
  description: "",
  price: "",
  currency: "USD",
  category: "",
  ctaText: "Order Now",
  ctaUrl: "",
  active: true,
};

export default function ProductsClient({ initialData, canEdit, canDelete, appUrl }: Props) {
  const [data, setData] = useState(initialData);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [qrTarget, setQrTarget] = useState<Product | null>(null);
  const [form, setForm] = useState<FormData>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);

  function openCreate() {
    setEditTarget(null);
    setForm(DEFAULT_FORM);
    setFormOpen(true);
  }

  function openEdit(p: Product) {
    setEditTarget(p);
    setForm({
      name: p.name,
      description: p.description || "",
      price: p.price?.toString() || "",
      currency: p.currency || "USD",
      category: p.category || "",
      ctaText: p.ctaText || "Order Now",
      ctaUrl: p.ctaUrl || "",
      active: p.active,
    });
    setFormOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: form.price ? parseFloat(form.price) : null,
      };

      if (editTarget) {
        const res = await fetch(`/api/products/${editTarget.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();
        const updated = await res.json();
        setData((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        toast.success("Product updated");
      } else {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();
        const created = await res.json();
        setData((prev) => [created, ...prev]);
        toast.success("Product created");
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
      const res = await fetch(`/api/products/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setData((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      toast.success("Product deleted");
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
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground text-sm">Manage your product catalog</p>
        </div>
        {canEdit && (
          <Button onClick={openCreate} className="bg-orange-500 hover:bg-orange-600">
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </Button>
        )}
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No products yet.
                </TableCell>
              </TableRow>
            )}
            {data.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell className="text-muted-foreground">{p.category || "—"}</TableCell>
                <TableCell>
                  {p.price ? `${p.currency} ${p.price}` : "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={p.active ? "default" : "secondary"}>
                    {p.active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setQrTarget(p)} title="QR Code">
                      <QrCode className="w-4 h-4" />
                    </Button>
                    <a href={`${appUrl}/p/${p.id}`} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon" title="View public page">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </a>
                    {canEdit && (
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)} title="Edit">
                        <Pencil className="w-4 h-4" />
                      </Button>
                    )}
                    {canDelete && (
                      <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(p)}
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

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[70vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Product name" />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} placeholder="e.g. Beverages, Meals" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Price</Label>
                <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Input value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))} placeholder="USD" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>CTA Button Text</Label>
              <Input value={form.ctaText} onChange={(e) => setForm((f) => ({ ...f, ctaText: e.target.value }))} placeholder="Order Now" />
            </div>
            <div className="space-y-2">
              <Label>CTA URL</Label>
              <Input value={form.ctaUrl} onChange={(e) => setForm((f) => ({ ...f, ctaUrl: e.target.value }))} placeholder="https://..." />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="pactive" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} className="rounded" />
              <Label htmlFor="pactive">Active</Label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving || !form.name} className="bg-orange-500 hover:bg-orange-600">
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.
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
        entityUrl={qrTarget ? `${appUrl}/p/${qrTarget.id}` : ""}
        entityName={qrTarget?.name || ""}
      />
    </div>
  );
}
