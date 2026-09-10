// FILE: src/pages/admin/AdminAdmins.tsx
// ACTION: Replace the ENTIRE file with this (adds a "what each role can do" legend)

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/contexts/AdminAuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PasswordInput from "./PasswordInput";
import { Plus, Trash2, Loader2, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Role = "owner" | "dev" | "admin";

interface AdminUser {
  user_id: string;
  email: string;
  created_at: string;
  role: Role;
}

const roleLabel: Record<Role, string> = { owner: "Owner", dev: "Dev", admin: "Admin" };
const roleVariant: Record<Role, "default" | "secondary" | "outline"> = {
  owner: "default",
  dev: "secondary",
  admin: "outline",
};

async function fetchAdmins(): Promise<{ admins: AdminUser[]; currentUserId: string; currentUserRole: Role }> {
  const res = await adminFetch("/api/admin/admins");
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Failed to load admins (status ${res.status})`);
  }
  return res.json();
}

const AdminAdmins = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data, isLoading, isError, error: queryError } = useQuery({ queryKey: ["admin-admins"], queryFn: fetchAdmins });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("admin");

  const canManage = data?.currentUserRole === "owner" || data?.currentUserRole === "dev";

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-admins"] });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await adminFetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
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
      setRole("admin");
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
          <p className="text-muted-foreground text-sm">
            {isLoading
              ? "Loading…"
              : isError
              ? "Could not load admins — see the error below."
              : `${data?.admins.length ?? 0} admin${data?.admins.length === 1 ? "" : "s"} have access to this panel`}
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Add Admin
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="pt-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Admins</p>
            <p className="text-2xl font-bold">{isLoading ? "…" : isError ? "—" : data?.admins.length ?? 0}</p>
          </div>
          <Users className="w-8 h-8 text-muted-foreground" />
        </CardContent>
      </Card>

      {!isLoading && !isError && !canManage && (
        <p className="text-xs text-muted-foreground">
          Only Owners and Devs can add or remove admins — you can view the list.
        </p>
      )}

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : isError ? (
            <p className="text-sm text-destructive">{(queryError as Error)?.message || "Could not load admins."}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Gmail</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Added</TableHead>
                  {canManage && <TableHead></TableHead>}
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
                    <TableCell>
                      <Badge variant={roleVariant[a.role]}>{roleLabel[a.role]}</Badge>
                    </TableCell>
                    <TableCell>{new Date(a.created_at).toLocaleDateString()}</TableCell>
                    {canManage && (
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
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {canManage && (
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
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin — manage quotes/products, view-only on admin list</SelectItem>
                    <SelectItem value="dev">Dev — full access including adding/removing admins</SelectItem>
                    <SelectItem value="owner">Owner — same as Dev, top-level role</SelectItem>
                  </SelectContent>
                </Select>
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
      )}
    </div>
  );
};

export default AdminAdmins;