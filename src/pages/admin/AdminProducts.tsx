import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/contexts/AdminAuthContext";
import { getProductImageUrl } from "@/lib/productImage";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Pencil, X, Loader2, ImagePlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Spec {
  label: string;
  value: string;
}

interface Product {
  id: string;
  title: string;
  description: string;
  features: string[];
  specifications: Spec[];
  image_path: string | null;
  icon_name: string;
  sort_order: number;
  is_active: boolean;
}

type ProductDraft = Omit<Product, "id">;

const emptyDraft: ProductDraft = {
  title: "",
  description: "",
  features: [],
  specifications: [],
  image_path: null,
  icon_name: "Layers",
  sort_order: 0,
  is_active: true,
};

async function fetchProducts(): Promise<Product[]> {
  const res = await adminFetch("/api/admin/products");
  if (!res.ok) throw new Error("Failed to load products");
  const data = await res.json();
  return data.products;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const AdminProducts = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: products, isLoading, isError, error: productsError } = useQuery({ queryKey: ["admin-products"], queryFn: fetchProducts });

  const [editing, setEditing] = useState<Product | null>(null);
  const [draft, setDraft] = useState<ProductDraft>(emptyDraft);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [featureInput, setFeatureInput] = useState("");
  const [specLabel, setSpecLabel] = useState("");
  const [specValue, setSpecValue] = useState("");
  const [uploading, setUploading] = useState(false);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-products"] });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const method = editing ? "PUT" : "POST";
      const url = editing ? `/api/admin/products?id=${editing.id}` : "/api/admin/products";
      const res = await adminFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Save failed");
      }
    },
    onSuccess: () => {
      invalidate();
      setDialogOpen(false);
      toast({ title: editing ? "Product updated" : "Product added" });
    },
    onError: (err: Error) => {
      toast({ title: "Could not save product", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await adminFetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      invalidate();
      toast({ title: "Product deleted" });
    },
  });

  const openNew = () => {
    setEditing(null);
    setDraft(emptyDraft);
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setDraft({ ...p });
    setDialogOpen(true);
  };

  const addFeature = () => {
    if (!featureInput.trim()) return;
    setDraft((d) => ({ ...d, features: [...d.features, featureInput.trim()] }));
    setFeatureInput("");
  };

  const addSpec = () => {
    if (!specLabel.trim() || !specValue.trim()) return;
    setDraft((d) => ({ ...d, specifications: [...d.specifications, { label: specLabel.trim(), value: specValue.trim() }] }));
    setSpecLabel("");
    setSpecValue("");
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      toast({ title: "Image too large", description: "Max size is 3MB.", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const base64 = await fileToBase64(file);
      const res = await adminFetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileBase64: base64 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setDraft((d) => ({ ...d, image_path: data.path }));
    } catch (err) {
      toast({ title: "Upload failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground text-sm">Manage what customers see on the public site</p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : isError ? (
        <p className="text-sm text-destructive">{(productsError as Error)?.message || "Could not load products."}</p>
      ) : !products || products.length === 0 ? (
        <p className="text-sm text-muted-foreground">No products yet — add your first one.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <Card key={p.id} className="overflow-hidden">
              <div className="h-40 bg-secondary/30">
                <img src={getProductImageUrl(p.image_path)} alt={p.title} className="w-full h-full object-cover" />
              </div>
              <CardContent className="pt-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold">{p.title}</h3>
                  {!p.is_active && <Badge variant="outline">Hidden</Badge>}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => openEdit(p)}>
                    <Pencil className="w-3 h-3" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 text-destructive hover:text-destructive"
                    onClick={() => {
                      if (confirm(`Delete "${p.title}"? This can't be undone.`)) deleteMutation.mutate(p.id);
                    }}
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Image</Label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-md bg-secondary/30 overflow-hidden shrink-0">
                  <img src={getProductImageUrl(draft.image_path)} alt="" className="w-full h-full object-cover" />
                </div>
                <label className="inline-flex">
                  <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleImageChange} />
                  <Button type="button" variant="outline" size="sm" asChild disabled={uploading}>
                    <span className="gap-2 cursor-pointer">
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                      {uploading ? "Uploading…" : "Upload image"}
                    </span>
                  </Button>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={draft.title} maxLength={200} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={draft.description}
                maxLength={2000}
                className="min-h-24"
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Icon</Label>
              <Select value={draft.icon_name} onValueChange={(v) => setDraft({ ...draft, icon_name: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Layers">Layers</SelectItem>
                  <SelectItem value="ShieldCheck">Shield</SelectItem>
                  <SelectItem value="Ruler">Ruler</SelectItem>
                  <SelectItem value="Wand2">Wand</SelectItem>
                  <SelectItem value="DoorOpen">Door</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Features</Label>
              <div className="flex flex-wrap gap-2">
                {draft.features.map((f, i) => (
                  <Badge key={i} variant="secondary" className="gap-1">
                    {f}
                    <button onClick={() => setDraft((d) => ({ ...d, features: d.features.filter((_, idx) => idx !== i) }))}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. Termite resistant"
                  value={featureInput}
                  maxLength={200}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                />
                <Button type="button" variant="outline" onClick={addFeature}>
                  Add
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Specifications</Label>
              <div className="space-y-1">
                {draft.specifications.map((s, i) => (
                  <div key={i} className="flex items-center justify-between text-sm border-b border-border/50 pb-1">
                    <span>
                      <span className="text-muted-foreground">{s.label}: </span>
                      {s.value}
                    </span>
                    <button
                      onClick={() => setDraft((d) => ({ ...d, specifications: d.specifications.filter((_, idx) => idx !== i) }))}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input placeholder="Label (e.g. Thickness)" value={specLabel} maxLength={100} onChange={(e) => setSpecLabel(e.target.value)} />
                <Input placeholder="Value (e.g. 30-50mm)" value={specValue} maxLength={300} onChange={(e) => setSpecValue(e.target.value)} />
                <Button type="button" variant="outline" onClick={addSpec}>
                  Add
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Visible on public site</Label>
              <Switch id="is_active" checked={draft.is_active} onCheckedChange={(v) => setDraft({ ...draft, is_active: v })} />
            </div>

            <Button
              className="w-full"
              disabled={saveMutation.isPending || !draft.title.trim() || !draft.description.trim()}
              onClick={() => saveMutation.mutate()}
            >
              {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editing ? "Save changes" : "Add product"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;