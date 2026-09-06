import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/contexts/AdminAuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Mail, MapPin, Loader2 } from "lucide-react";

interface Quote {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  email: string | null;
  city: string | null;
  product_type: string;
  quantity: string | null;
  message: string | null;
  status: "new" | "responded" | "closed";
  admin_notes: string | null;
}

const statusVariant: Record<Quote["status"], "default" | "secondary" | "outline"> = {
  new: "default",
  responded: "secondary",
  closed: "outline",
};

async function fetchQuotes(): Promise<Quote[]> {
  const res = await adminFetch("/api/admin/quotes");
  if (!res.ok) throw new Error("Failed to load quotes");
  const data = await res.json();
  return data.quotes;
}

const AdminQuotes = () => {
  const queryClient = useQueryClient();
  const { data: quotes, isLoading } = useQuery({ queryKey: ["admin-quotes"], queryFn: fetchQuotes });
  const [selected, setSelected] = useState<Quote | null>(null);
  const [notesDraft, setNotesDraft] = useState("");

  const updateMutation = useMutation({
    mutationFn: async (payload: { id: string; status?: Quote["status"]; admin_notes?: string }) => {
      const res = await adminFetch("/api/admin/quotes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Update failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-quotes"] });
    },
  });

  const openQuote = (q: Quote) => {
    setSelected(q);
    setNotesDraft(q.admin_notes || "");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quotes</h1>
        <p className="text-muted-foreground text-sm">All incoming quote requests from the public site</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : !quotes || quotes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No quote requests yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.map((q) => (
                  <TableRow key={q.id} className="cursor-pointer" onClick={() => openQuote(q)}>
                    <TableCell className="font-medium">{q.name}</TableCell>
                    <TableCell>{q.product_type}</TableCell>
                    <TableCell>{q.phone}</TableCell>
                    <TableCell>{new Date(q.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[q.status]}>{q.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.name}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2 text-sm">
                  <a href={`tel:${selected.phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                    <Phone className="w-4 h-4" /> {selected.phone}
                  </a>
                  {selected.email && (
                    <a href={`mailto:${selected.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                      <Mail className="w-4 h-4" /> {selected.email}
                    </a>
                  )}
                  {selected.city && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" /> {selected.city}
                    </div>
                  )}
                </div>

                <div className="text-sm space-y-1">
                  <p>
                    <span className="text-muted-foreground">Product: </span>
                    {selected.product_type}
                  </p>
                  {selected.quantity && (
                    <p>
                      <span className="text-muted-foreground">Quantity: </span>
                      {selected.quantity}
                    </p>
                  )}
                  {selected.message && (
                    <p>
                      <span className="text-muted-foreground">Message: </span>
                      {selected.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={selected.status}
                    onValueChange={(value) => {
                      const status = value as Quote["status"];
                      setSelected({ ...selected, status });
                      updateMutation.mutate({ id: selected.id, status });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="responded">Responded</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Internal notes</label>
                  <Textarea
                    value={notesDraft}
                    onChange={(e) => setNotesDraft(e.target.value)}
                    maxLength={2000}
                    className="min-h-24 resize-none"
                    placeholder="Notes only visible to admins"
                  />
                  <Button
                    size="sm"
                    disabled={updateMutation.isPending}
                    onClick={() => updateMutation.mutate({ id: selected.id, admin_notes: notesDraft })}
                  >
                    {updateMutation.isPending && <Loader2 className="w-3 h-3 mr-2 animate-spin" />}
                    Save notes
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminQuotes;
