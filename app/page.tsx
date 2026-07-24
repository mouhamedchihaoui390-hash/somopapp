'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Package, AlertTriangle, XCircle, Users, Truck, Car,
  ClipboardList, DollarSign, Activity, TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BinTag } from '@/components/ui/bin-tag';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import { getDashboardStats, getRecentActivity, getSalesChartData, getInventoryByCategory } from '@/lib/services';

const PIE_COLORS = ['hsl(21 90% 48%)', 'hsl(146 66% 33%)', 'hsl(214 10% 40%)', 'hsl(38 90% 38%)', 'hsl(213 18% 10%)'];

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [catData, setCatData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDashboardStats(),
      getRecentActivity(8),
      getSalesChartData(),
      getInventoryByCategory(),
    ])
      .then(([s, a, sales, cats]) => {
        setStats(s);
        setActivity(a);
        setSalesData(aggregateSales(sales));
        setCatData(cats);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-md animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const kpis = [
    { label: 'Produits', value: stats.productCount, icon: Package, edge: 'bg-foreground' },
    { label: 'Valeur du stock', value: `${stats.inventoryValue.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} TND`, icon: DollarSign, edge: 'bg-success' },
    { label: 'Stock faible', value: stats.lowStockCount, icon: AlertTriangle, edge: 'bg-warning' },
    { label: 'Rupture de stock', value: stats.outOfStockCount, icon: XCircle, edge: 'bg-danger' },
    { label: 'Clients', value: stats.customerCount, icon: Users, edge: 'bg-foreground' },
    { label: 'Fournisseurs', value: stats.supplierCount, icon: Truck, edge: 'bg-foreground' },
    { label: 'Demandes VIN', value: stats.vinPendingCount, icon: Car, edge: 'bg-primary' },
    { label: 'Commandes de vente', value: stats.orderCount, icon: ClipboardList, edge: 'bg-primary' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Aperçu · Temps réel</p>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Tableau de bord</h1>
        </div>
        <Link href="/import">
          <Button>
            <Activity className="mr-2 h-4 w-4" />
            Importer catalogue
          </Button>
        </Link>
      </div>

      {/* KPI readout plates */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="relative bg-card border border-border shadow-panel rounded-md overflow-hidden">
              <span className={`absolute left-0 top-0 h-full w-1 ${kpi.edge}`} />
              <div className="pl-4 pr-4 py-4 flex items-start justify-between">
                <div className="min-w-0">
                  <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground truncate">{kpi.label}</p>
                  <p className="font-display text-[26px] font-semibold tabular leading-tight mt-1">{kpi.value}</p>
                </div>
                <Icon className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              Ventes (30 derniers jours)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {salesData.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center font-mono">— Aucune donnée —</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                  <XAxis dataKey="date" className="text-xs" tickLine={false} axisLine={false} />
                  <YAxis className="text-xs" tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 6, border: '1px solid hsl(var(--border))', fontSize: 12 }} />
                  <Line type="monotone" dataKey="total" stroke="hsl(21 90% 48%)" strokeWidth={2} dot={false} name="Revenu" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Inventaire par catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            {catData.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center font-mono">— Aucune donnée —</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={catData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} label>
                    {catData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 6, border: '1px solid hsl(var(--border))', fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Activité récente</CardTitle>
        </CardHeader>
        <CardContent>
          {activity.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center font-mono">— Aucune activité —</p>
          ) : (
            <div className="divide-y divide-border">
              {activity.map((log) => (
                <div key={log.id} className="flex items-center gap-3 text-sm py-2.5 first:pt-0 last:pb-0">
                  <span className="h-1.5 w-1.5 shrink-0 bg-primary" />
                  <span className="font-medium">{log.action}</span>
                  {log.detail && (log.detail.length <= 24
                    ? <BinTag className="shrink-0">{log.detail}</BinTag>
                    : <span className="text-muted-foreground truncate">{log.detail}</span>)}
                  <span className="ml-auto text-xs text-muted-foreground font-mono shrink-0">
                    {new Date(log.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function aggregateSales(sales: any[]) {
  const byDate: Record<string, number> = {};
  for (const s of sales) {
    const date = s.order_date;
    byDate[date] = (byDate[date] || 0) + Number(s.total || 0);
  }
  return Object.entries(byDate)
    .map(([date, total]) => ({ date: date.slice(5), total: Math.round(total) }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
