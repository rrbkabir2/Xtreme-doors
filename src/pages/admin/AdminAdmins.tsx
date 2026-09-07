import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/contexts/AdminAuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PasswordInput from "./PasswordInput";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdminUser {
  user_id: string;
  email: string;
  created_at: string;
}

async function fetchAdmins(): Promise<{ admins: AdminUser[]; currentUserId: string }> {
  const res = await adminFetch("/api/admin/admins");
  if (!res.ok) throw new Error("Failed to load admins");
  return res.json();
}

const AdminAdmins = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data, isLoading } = useQuery({ queryKey: ["admin-admins"], queryFn: fetchAdmins });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-admins"] });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await adminFetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create admin");
      return data;
    },
    onSuccess: () => {
      invalidate();
      setDialogOpen(false);
      setEmail("");
      setPassword("");
      toast({ title: "Admin account created" });
    },
    onError: (err: Error) => {
      toast({ title: "Could not create admin", description: err.message, variant: "destructive" });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await adminFetch(`/api/admin/admins?id=${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove admin");
    },
    onSuccess: () => {
      invalidate();
      toast({ title: "Admin access removed" });
    },
    onError: (err: Error) => {
      toast({ title: "Could not remove admin", description: err.message, variant: "destructive" });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admins</h1>
          <p className="text-muted-foreground text-sm">Manage who has access to this panel</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Admin
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.admins.map((a) => (
                  <TableRow key={a.user_id}>
                    <TableCell className="font-medium">
                      {a.email}
                      {a.user_id === data.currentUserId && (
                        <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                      )}
                    </TableCell>
                    <TableCell>{new Date(a.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      {a.user_id !== data.currentUserId && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 text-destructive hover:text-destructive"
                          onClick={() => {
                            if (confirm(`Remove admin access for ${a.email}?`)) removeMutation.mutate(a.user_id);
                          }}
                        >
                          <Trash2 className="w-3 h-3" /> Remove
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Admin</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-admin-email">Email</Label>
              <Input
                id="new-admin-email"
                type="email"
                value={email}
                maxLength={255}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-admin-password">Initial password</Label>
              <PasswordInput
                id="new-admin-password"
                value={password}
                maxLength={200}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">At least 8 characters. Share this with them securely — they can change it themselves afterward via "Forgot password."</p>
            </div>
            <Button
              className="w-full"
              disabled={createMutation.isPending || !email.trim() || password.length < 8}
              onClick={() => createMutation.mutate()}
            >
              {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create admin
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAdmins;
