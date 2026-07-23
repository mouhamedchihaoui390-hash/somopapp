'use client';

import { useEffect, useState } from 'react';
import { ShoppingCart, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getPurchaseOrders, getSuppliers, getWarehouses } from '@/lib/services';
import { supabase } from '@/lib/supabase';

const statusColors: Record<string, string> = {
  draft: 'text-muted-foreground',
  ordered: 'text-blue-500',
  received: 'text-green-500',
  cancelled: 'text-red-500',
};

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ supplier_id: '', warehouse_id: '', expected_date: '', notes: '' });

  useEffect(() => {
    Promise.all([getPurchaseOrders(0), getSuppliers(0), getWarehouses()])
      .then(([o, s, w]) => { setOrders(o.data); setSuppliers(s.data); setWarehouses(w); })
      .finally(() => setLoading(false));
  }, []);

  const submit = async () => {
    const num = `PO-${Date.now().toString().slice(-6)}`;
    await supabase.from('purchase_orders').insert({
      order_number: num,
      supplier_id: form.supplier_id,
      warehouse_id: form.warehouse_id || null,
      expected_date: form.expected_date || null,
      notes: form.notes || null,
      status: 'draft',
    });
    setOpen(false);
    setForm({ supplier_id: '', warehouse_id: '', expected_date: '', notes: '' });
    getPurchaseOrders(0).then((r) => setOrders(r.data));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Commandes d'achat</h1>
          <p className="text-sm text-muted-foreground">{orders.length} commandes</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Nouvelle commande</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nouvelle commande d'achat</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Fournisseur</Label>
                <Select value={form.supplier_id} onValueChange={(v) => setForm({ ...form, supplier_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner un fournisseur" /></SelectTrigger>
                  <SelectContent>{suppliers.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Entrepôt</Label>
                <Select value={form.warehouse_id} onValueChange={(v) => setForm({ ...form, warehouse_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner un entrepôt" /></SelectTrigger>
                  <SelectContent>{warehouses.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Date prévue</Label><Input type="date" value={form.expected_date} onChange={(e) => setForm({ ...form, expected_date: e.target.value })} /></div>
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button><Button onClick={submit}>Créer</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? <Skeleton className="h-64 rounded-lg" /> : orders.length === 0 ? (
        <Card><CardContent className="py-16 text-center">
          <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-lg font-medium">Aucune commande d'achat pour le moment</p>
        </CardContent></Card>
      ) : (
        <Card><CardContent className="p-0">
          <Table>
            <TableHeader><TableRow>
              <TableHead>N° commande</TableHead><TableHead>Fournisseur</TableHead>
              <TableHead>Entrepôt</TableHead><TableHead>Date</TableHead>
              <TableHead className="text-right">Total</TableHead><TableHead>Statut</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-sm">{o.order_number}</TableCell>
                  <TableCell>{o.supplier?.name || '—'}</TableCell>
                  <TableCell>{o.warehouse?.name || '—'}</TableCell>
                  <TableCell className="text-xs">{new Date(o.order_date).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell className="text-right font-medium">{o.total?.toFixed(3) || '0.000'} TND</TableCell>
                  <TableCell><Badge variant="outline" className={statusColors[o.status] || ''}>{o.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent></Card>
      )}
    </div>
  );
}
