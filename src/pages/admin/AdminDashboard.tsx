import { useQuery } from "@tanstack/react-query";
import { adminFetch } from "@/contexts/AdminAuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { MessageSquareText, Clock, CheckCircle2, Inbox } from "lucide-react";
import { Link } from "react-router-dom";
import { requirementForLabels, labelFor } from "@/lib/quoteOptions";

interface Quote {
  id: string;
  created_at: string;
  full_name: string;
  requirement_for: string;
  status: "new" | "responded" | "closed";
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

function buildChartData(quotes: Quote[]) {
  const days: { date: string; label: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ date: key, label: d.toLocaleDateString(undefined, { day: "numeric", month: "short" }), count: 0 });
  }
  const byDate = new Map(days.map((d) => [d.date, d]));
  for (const q of quotes) {
    const key = q.created_at.slice(0, 10);
    const entry = byDate.get(key);
    if (entry) entry.count += 1;
  }
  return days;
}

const AdminDashboard = () => {
  const { data: quotes, isLoading } = useQuery({ queryKey: ["admin-quotes"], queryFn: fetchQuotes });

  const total = quotes?.length ?? 0;
  const newCount = quotes?.filter((q) => q.status === "new").length ?? 0;
  const respondedCount = quotes?.filter((q) => q.status === "responded").length ?? 0;
  const closedCount = quotes?.filter((q) => q.status === "closed").length ?? 0;
  const chartData = quotes ? buildChartData(quotes) : [];
  const recent = quotes?.slice(0, 5) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Overview of quote requests and activity</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Quotes</p>
              <p className="text-2xl font-bold">{isLoading ? "…" : total}</p>
            </div>
            <Inbox className="w-8 h-8 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">New</p>
              <p className="text-2xl font-bold">{isLoading ? "…" : newCount}</p>
            </div>
            <MessageSquareText className="w-8 h-8 text-accent" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Responded</p>
              <p className="text-2xl font-bold">{isLoading ? "…" : respondedCount}</p>
            </div>
            <Clock className="w-8 h-8 text-trust" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Closed</p>
              <p className="text-2xl font-bold">{isLoading ? "…" : closedCount}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quote submissions — last 14 days</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" fontSize={12} stroke="hsl(var(--muted-foreground))" />
              <YAxis allowDecimals={false} fontSize={12} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                  color: "hsl(var(--card-foreground))",
                }}
              />
              <Line type="monotone" dataKey="count" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent quotes</CardTitle>
          <Link to="/admin/quotes" className="text-sm text-accent hover:underline">
            View all
          </Link>
        </CardHeader>
        <CardContent className="space-y-3">
          {recent.length === 0 && <p className="text-sm text-muted-foreground">No quotes yet.</p>}
          {recent.map((q) => (
            <div key={q.id} className="flex items-center justify-between border-b border-border/50 pb-2 last:border-0 last:pb-0">
              <div>
                                <p className="text-sm font-medium">{q.full_name}</p>
                <p className="text-xs text-muted-foreground">{labelFor(requirementForLabels, q.requirement_for)}</p>
              </div>
              <Badge variant={statusVariant[q.status]}>{q.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
