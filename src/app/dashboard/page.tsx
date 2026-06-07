import { db } from "@/lib/db";
import { employees, products, ads, clickEvents } from "@/lib/schema";
import { count, sql } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, Megaphone, MousePointerClick, TrendingUp } from "lucide-react";

export default async function DashboardPage() {
  const [[empCount], [prodCount], [adCount], [clickCount]] = await Promise.all([
    db.select({ count: count() }).from(employees),
    db.select({ count: count() }).from(products),
    db.select({ count: count() }).from(ads),
    db.select({ count: count() }).from(clickEvents),
  ]);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentClicks = await db
    .select({
      date: sql<string>`DATE(created_at)`,
      total: count(),
    })
    .from(clickEvents)
    .where(sql`created_at >= ${sevenDaysAgo.toISOString()}`)
    .groupBy(sql`DATE(created_at)`)
    .orderBy(sql`DATE(created_at)`);

  const stats = [
    {
      label: "Employees",
      value: empCount.count,
      icon: Users,
      gradient: "from-blue-500 to-blue-600",
      bg: "bg-blue-50",
      text: "text-blue-600",
      ring: "ring-blue-100",
    },
    {
      label: "Products",
      value: prodCount.count,
      icon: Package,
      gradient: "from-emerald-500 to-green-600",
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      ring: "ring-emerald-100",
    },
    {
      label: "Ads & Promotions",
      value: adCount.count,
      icon: Megaphone,
      gradient: "from-violet-500 to-purple-600",
      bg: "bg-violet-50",
      text: "text-violet-600",
      ring: "ring-violet-100",
    },
    {
      label: "Total Clicks",
      value: clickCount.count,
      icon: MousePointerClick,
      gradient: "from-orange-500 to-orange-600",
      bg: "bg-orange-50",
      text: "text-orange-600",
      ring: "ring-orange-100",
    },
  ];

  const maxClicks = recentClicks.length
    ? Math.max(...recentClicks.map((d) => Number(d.total)))
    : 0;

  return (
    <div className="space-y-7">
      {/* Page heading */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Overview</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Welcome back — here&apos;s what&apos;s happening today.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted rounded-lg px-3 py-1.5 border">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
          Live data
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="relative overflow-hidden border shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            {/* Subtle gradient top bar */}
            <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${stat.gradient}`} />

            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <div className={`${stat.bg} ${stat.ring} ring-1 p-2 rounded-xl`}>
                <stat.icon className={`w-4 h-4 ${stat.text}`} />
              </div>
            </CardHeader>
            <CardContent className="pb-5">
              <p className="text-3xl font-bold tracking-tight">{stat.value.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Click Activity Chart */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Click Activity</CardTitle>
            <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full border">
              Last 7 days
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {recentClicks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <MousePointerClick className="w-8 h-8 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground text-sm">No click data yet.</p>
              <p className="text-muted-foreground/60 text-xs mt-1">
                Activity will appear here once visitors interact with your links.
              </p>
            </div>
          ) : (
            <div className="flex items-end gap-2 h-32 pt-2">
              {recentClicks.map((day) => {
                const pct = maxClicks > 0 ? (Number(day.total) / maxClicks) * 100 : 0;
                const isMax = Number(day.total) === maxClicks;
                return (
                  <div key={day.date} className="group flex flex-col items-center gap-1.5 flex-1">
                    <span className={`text-[10px] font-medium transition-colors ${isMax ? "text-orange-500" : "text-muted-foreground"}`}>
                      {day.total}
                    </span>
                    <div className="w-full relative flex items-end" style={{ height: "72px" }}>
                      <div
                        className={`w-full rounded-t-md transition-all duration-300 ${isMax ? "bg-orange-500" : "bg-orange-300 group-hover:bg-orange-400"}`}
                        style={{ height: `${Math.max(pct, 5)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(day.date + "T00:00:00").toLocaleDateString("en", { weekday: "short" })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
