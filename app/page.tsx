'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Package, AlertTriangle, XCircle, Users, Truck, Car,
  ClipboardList, DollarSign, Activity, TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import { getDashboardStats, getRecentActivity, getSalesChartData, getInventoryByCategory } from '@/lib/services';

const PIE_COLORS = ['hsl(221 83% 53%)', 'hsl(160 84% 39%)', 'hsl(43 74% 66%)', 'hsl(340 75% 55%)', 'hsl(197 37% 50%)'];

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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const kpis = [
    { label: 'Produits', value: stats.productCount, icon: Package, color: 'text-blue-500' },
    { label: 'Valeur du stock', value: `${stats.inventoryValue.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} TND`, icon: DollarSign, color: 'text-green-500' },
    { label: 'Stock faible', value: stats.lowStockCount, icon: AlertTriangle, color: 'text-amber-500' },
    { label: 'Rupture de stock', value: stats.outOfStockCount, icon: XCircle, color: 'text-red-500' },
    { label: 'Clients', value: stats.customerCount, icon: Users, color: 'text-purple-500' },
    { label: 'Fournisseurs', value: stats.supplierCount, icon: Truck, color: 'text-cyan-500' },
    { label: 'Demandes VIN', value: stats.vinPendingCount, icon: Car, color: 'text-orange-500' },
    { label: 'Commandes de vente', value: stats.orderCount, icon: ClipboardList, color: 'text-pink-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-sm text-muted-foreground">Vue d'ensemble de votre activité de pièces automobiles</p>
        </div>
        <Link href="/import">
          <Button>
            <Activity className="mr-2 h-4 w-4" />
            Importer catalogue
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{kpi.label}</p>
                    <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                  </div>
                  <div className={`p-2 rounded-lg bg-muted ${kpi.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Ventes (30 derniers jours)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {salesData.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Aucune donnée de vente</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Line type="monotone" dataKey="total" stroke="hsl(221 83% 53%)" strokeWidth={2} name="Revenu" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventaire par catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            {catData.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Aucune donnée d'inventaire</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={catData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                    {catData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activité récente</CardTitle>
        </CardHeader>
        <CardContent>
          {activity.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Aucune activité récente</p>
          ) : (
            <div className="space-y-3">
              {activity.map((log) => (
                <div key={log.id} className="flex items-center gap-3 text-sm">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="font-medium">{log.action}</span>
                  <span className="text-muted-foreground">{log.detail}</span>
                  <Badge variant="outline" className="ml-auto text-xs">
                    {new Date(log.created_at).toLocaleDateString('fr-FR')}
                  </Badge>
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
