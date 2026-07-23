'use client';

import { useEffect, useState } from 'react';
import { ClipboardList, Plus } from 'lucide-react';
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
import { getSalesOrders, getCustomers } from '@/lib/services';
import { supabase } from '@/lib/supabase';

const statusColors: Record<string, string> = {
  draft: 'text-muted-foreground',
  confirmed: 'text-blue-500',
  shipped: 'text-amber-500',
  invoiced: 'text-green-500',
  cancelled: 'text-red-500',
};

export default function SalesOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ customer_id: '', notes: '' });

  useEffect(() => {
    Promise.all([getSalesOrders(0), getCustomers(0)])
      .then(([o, c]) => { setOrders(o.data); setCustomers(c.data); })
      .finally(() => setLoading(false));
  }, []);

  const submit = async () => {
    const num = `SO-${Date.now().toString().slice(-6)}`;
    await supabase.from('sales_orders').insert({
      order_number: num,
      customer_id: form.customer_id,
      notes: form.notes || null,
      status: 'draft',
    });
    setOpen(false);
    setForm({ customer_id: '', notes: '' });
    getSalesOrders(0).then((r) => setOrders(r.data));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Commandes de vente</h1>
          <p className="text-sm text-muted-foreground">{orders.length} commandes</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Nouvelle commande</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nouvelle commande de vente</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Client</Label>
                <Select value={form.customer_id} onValueChange={(v) => setForm({ ...form, customer_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner un client" /></SelectTrigger>
                  <SelectContent>{customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button><Button onClick={submit}>Créer</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? <Skeleton className="h-64 rounded-lg" /> : orders.length === 0 ? (
        <Card><CardContent className="py-16 text-center">
          <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-lg font-medium">Aucune commande de vente pour le moment</p>
        </CardContent></Card>
      ) : (
        <Card><CardContent className="p-0">
          <Table>
            <TableHeader><TableRow>
              <TableHead>N° commande</TableHead><TableHead>Client</TableHead>
              <TableHead>Date</TableHead><TableHead className="text-right">Total</TableHead><TableHead>Statut</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-sm">{o.order_number}</TableCell>
                  <TableCell>{o.customer?.name || '—'}</TableCell>
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
