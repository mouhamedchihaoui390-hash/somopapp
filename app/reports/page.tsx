'use client';

import { useEffect, useState } from 'react';
import { BarChart3, Package, DollarSign, Users, Truck, TrendingUp, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { supabase } from '@/lib/supabase';

const PIE_COLORS = ['hsl(221 83% 53%)', 'hsl(160 84% 39%)', 'hsl(43 74% 66%)', 'hsl(340 75% 55%)', 'hsl(197 37% 50%)'];

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('products').select('id, name, selling_price, purchase_price, category:categories(name), brand:brands(name)'),
      supabase.from('inventory').select('quantity, product:products(name, selling_price, purchase_price)'),
      supabase.from('customers').select('*', { count: 'exact', head: true }),
      supabase.from('suppliers').select('*', { count: 'exact', head: true }),
      supabase.from('sales_orders').select('total, order_date, status'),
    ]).then(([p, inv, c, s, so]) => {
      const products = p.data || [];
      const inventory = inv.data || [];
      const sales = so.data || [];

      const byCategory: Record<string, number> = {};
      const byBrand: Record<string, number> = {};
      for (const prod of products) {
        const cat = (prod as any).category?.name || 'Non catégorisé';
        const br = (prod as any).brand?.name || 'Sans marque';
        byCategory[cat] = (byCategory[cat] || 0) + 1;
        byBrand[br] = (byBrand[br] || 0) + 1;
      }

      const invValue = inventory.reduce((sum: number, row: any) => sum + (row.quantity * (row.product?.purchase_price || 0)), 0);
      const sellValue = inventory.reduce((sum: number, row: any) => sum + (row.quantity * (row.product?.selling_price || 0)), 0);

      const totalRevenue = sales.reduce((sum: number, o: any) => sum + Number(o.total || 0), 0);

      setData({
        totalProducts: products.length,
        totalCustomers: c.count || 0,
        totalSuppliers: s.count || 0,
        inventoryCost: invValue,
        inventoryRetail: sellValue,
        potentialMargin: sellValue - invValue,
        totalRevenue,
        byCategory: Object.entries(byCategory).map(([name, value]) => ({ name, value })),
        byBrand: Object.entries(byBrand).map(([name, value]) => ({ name, value })),
      });
    }).finally(() => setLoading(false));
  }, []);

  const exportCSV = (rows: any[], filename: string) => {
    if (!rows.length) return;
    const headers = Object.keys(rows[0]);
    const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <Skeleton className="h-96 rounded-lg" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Rapports & Analyses</h1>
        <p className="text-sm text-muted-foreground">Analyses commerciales et rapports exportables</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPI label="Total produits" value={data.totalProducts} icon={Package} color="text-blue-500" />
        <KPI label="Coût d'inventaire" value={`${data.inventoryCost.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} TND`} icon={DollarSign} color="text-green-500" />
        <KPI label="Valeur de vente" value={`${data.inventoryRetail.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} TND`} icon={TrendingUp} color="text-purple-500" />
        <KPI label="Marge potentielle" value={`${data.potentialMargin.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} TND`} icon={DollarSign} color="text-amber-500" />
        <KPI label="Clients" value={data.totalCustomers} icon={Users} color="text-cyan-500" />
        <KPI label="Fournisseurs" value={data.totalSuppliers} icon={Truck} color="text-pink-500" />
        <KPI label="Revenu total" value={`${data.totalRevenue.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} TND`} icon={DollarSign} color="text-green-600" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Produits par catégorie</span>
              <Button variant="ghost" size="sm" onClick={() => exportCSV(data.byCategory, 'by-category.csv')}>
                <Download className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.byCategory.length === 0 ? <p className="text-sm text-muted-foreground py-8 text-center">Aucune donnée</p> : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.byCategory}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" angle={-15} textAnchor="end" height={60} />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(221 83% 53%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Produits par marque</span>
              <Button variant="ghost" size="sm" onClick={() => exportCSV(data.byBrand, 'by-brand.csv')}>
                <Download className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.byBrand.length === 0 ? <p className="text-sm text-muted-foreground py-8 text-center">Aucune donnée</p> : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={data.byBrand} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                    {data.byBrand.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip /><Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KPI({ label, value, icon: Icon, color }: any) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className={`p-2 rounded-lg bg-muted ${color}`}><Icon className="h-5 w-5" /></div>
        </div>
      </CardContent>
    </Card>
  );
}
