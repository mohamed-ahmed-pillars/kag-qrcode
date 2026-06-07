"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";

interface AnalyticsData {
  byType: { entityType: string; total: number }[];
  perDay: { date: string; total: number }[];
  topEmployees: { entityId: string; total: number; name: string | null }[];
  topProducts: { entityId: string; total: number; name: string | null }[];
  topAds: { entityId: string; total: number; title: string | null }[];
}

const COLORS = ["#f97316", "#3b82f6", "#22c55e", "#a855f7", "#eab308"];

const TYPE_LABELS: Record<string, string> = {
  employee: "Employees",
  product: "Products",
  ad: "Ads",
  social_link: "Social Links",
};

function getDefaultRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

export default function AnalyticsClient() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState(getDefaultRange());

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/analytics?from=${range.from}&to=${range.to + "T23:59:59"}`
      );
      const json = await res.json();
      setData(json);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalClicks = data?.byType.reduce((sum, t) => sum + Number(t.total), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground text-sm">Track clicks across all entities</p>
        </div>

        {/* Date Range Filter */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Label className="text-sm shrink-0">From</Label>
            <Input
              type="date"
              value={range.from}
              onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))}
              className="w-36 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-sm shrink-0">To</Label>
            <Input
              type="date"
              value={range.to}
              onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
              className="w-36 text-sm"
            />
          </div>
          <Button onClick={fetchData} variant="outline" size="sm" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Apply
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : !data ? null : (
        <>
          {/* Total */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Total Clicks in Range</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-orange-600">{totalClicks.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Tabs defaultValue="timeline">
            <TabsList>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="breakdown">By Type</TabsTrigger>
              <TabsTrigger value="top">Top Items</TabsTrigger>
            </TabsList>

            {/* Timeline chart */}
            <TabsContent value="timeline">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Clicks Per Day</CardTitle>
                </CardHeader>
                <CardContent>
                  {data.perDay.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No data in this range.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={data.perDay.map((d) => ({ ...d, total: Number(d.total) }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 11 }}
                          tickFormatter={(v) =>
                            new Date(v).toLocaleDateString("en", { month: "short", day: "numeric" })
                          }
                        />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip
                          labelFormatter={(v) => new Date(v as string).toLocaleDateString()}
                        />
                        <Bar dataKey="total" fill="#f97316" radius={[4, 4, 0, 0]} name="Clicks" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* By type pie */}
            <TabsContent value="breakdown">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Clicks by Entity Type</CardTitle>
                </CardHeader>
                <CardContent>
                  {data.byType.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No data in this range.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={data.byType.map((t) => ({
                            name: TYPE_LABELS[t.entityType] || t.entityType,
                            value: Number(t.total),
                          }))}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name} (${(percent * 100).toFixed(0)}%)`
                          }
                        >
                          {data.byType.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Top items */}
            <TabsContent value="top" className="space-y-4">
              {[
                { label: "Top Employees", items: data.topEmployees.map((e) => ({ name: e.name || e.entityId, clicks: Number(e.total) })) },
                { label: "Top Products", items: data.topProducts.map((p) => ({ name: p.name || p.entityId, clicks: Number(p.total) })) },
                { label: "Top Ads", items: data.topAds.map((a) => ({ name: a.title || a.entityId, clicks: Number(a.total) })) },
              ].map(({ label, items }) => (
                <Card key={label}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {items.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No data.</p>
                    ) : (
                      <div className="space-y-2">
                        {items.map((item, i) => {
                          const max = Math.max(...items.map((x) => x.clicks));
                          const pct = max > 0 ? (item.clicks / max) * 100 : 0;
                          return (
                            <div key={i} className="flex items-center gap-3">
                              <span className="text-sm font-medium w-4 text-muted-foreground">{i + 1}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm truncate">{item.name}</p>
                                <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-orange-400 rounded-full"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>
                              <span className="text-sm font-bold text-orange-600 shrink-0">
                                {item.clicks.toLocaleString()}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
