'use client';

import { useEffect, useState } from 'react';
import { Warehouse, AlertTriangle, XCircle, TrendingUp, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BinTag, StockTag } from '@/components/ui/bin-tag';
import { Skeleton } from '@/components/ui/skeleton';
import { getInventory, getStockMovements, getWarehouses, recordStockMovement } from '@/lib/services';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export default function InventoryPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'stock' | 'movements'>('stock');

  useEffect(() => {
    Promise.all([getInventory(0), getStockMovements(undefined, 0), getWarehouses()])
      .then(([inv, mv, wh]) => {
        setInventory(inv.data);
        setMovements(mv);
        setWarehouses(wh);
      })
      .finally(() => setLoading(false));
  }, []);

  const reload = () => {
    Promise.all([getInventory(0), getStockMovements(undefined, 0)])
      .then(([inv, mv]) => { setInventory(inv.data); setMovements(mv); });
  };

  const lowStock = inventory.filter((i) => i.quantity > 0 && i.quantity < 5);
  const outOfStock = inventory.filter((i) => i.quantity === 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Gestion de l'inventaire</h1>
        <p className="text-sm text-muted-foreground">Suivez le stock entre les entrepôts et enregistrez les mouvements</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Articles totaux</p>
                <p className="text-2xl font-bold mt-1">{inventory.length}</p>
              </div>
              <Warehouse className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Stock faible</p>
                <p className="text-2xl font-bold mt-1 text-amber-500">{lowStock.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rupture de stock</p>
                <p className="text-2xl font-bold mt-1 text-red-500">{outOfStock.length}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 border-b">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 ${tab === 'stock' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
          onClick={() => setTab('stock')}
        >
          Stock actuel
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 ${tab === 'movements' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
          onClick={() => setTab('movements')}
        >
          Historique des mouvements
        </button>
      </div>

      {loading ? (
        <Skeleton className="h-64 rounded-lg" />
      ) : tab === 'stock' ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produit</TableHead>
                  <TableHead>OEM</TableHead>
                  <TableHead>Entrepôt</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Qté</TableHead>
                  <TableHead className="text-right">Réservé</TableHead>
                  <TableHead className="text-right">Entrant</TableHead>
                  <TableHead>Étagère</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.product?.name || '—'}</TableCell>
                    <TableCell>{item.product?.oem ? <BinTag>{item.product.oem}</BinTag> : '—'}</TableCell>
                    <TableCell>{item.warehouse?.name || '—'}</TableCell>
                    <TableCell>
                      <StockTag status={item.quantity === 0 ? 'out_of_stock' : item.quantity < 5 ? 'low_stock' : 'in_stock'} />
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-mono tabular font-medium">
                        {item.quantity}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{item.reserved}</TableCell>
                    <TableCell className="text-right">{item.incoming}</TableCell>
                    <TableCell>{item.shelf || '—'}</TableCell>
                    <TableCell>
                      <StockMovementDialog
                        productId={item.product_id}
                        warehouseId={item.warehouse_id}
                        warehouses={warehouses}
                        onDone={reload}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Produit</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Qté</TableHead>
                  <TableHead>Entrepôt</TableHead>
                  <TableHead>Référence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="text-xs">{new Date(m.created_at).toLocaleString()}</TableCell>
                    <TableCell className="font-medium">{m.product?.name || '—'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        m.movement_type === 'in' ? 'text-success border-success/30' :
                        m.movement_type === 'out' ? 'text-danger border-danger/30' : ''
                      }>
                        {m.movement_type === 'in' && <ArrowDownToLine className="h-3 w-3 mr-1 inline" />}
                        {m.movement_type === 'out' && <ArrowUpFromLine className="h-3 w-3 mr-1 inline" />}
                        {m.movement_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono tabular font-medium">{m.quantity}</TableCell>
                    <TableCell>{m.warehouse?.name || '—'}</TableCell>
                    <TableCell>{m.reference ? <BinTag>{m.reference}</BinTag> : '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StockMovementDialog({ productId, warehouseId, warehouses, onDone }: {
  productId: string;
  warehouseId: string;
  warehouses: any[];
  onDone: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState('in');
  const [qty, setQty] = useState('1');
  const [whId, setWhId] = useState(warehouseId);
  const [ref, setRef] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    try {
      await recordStockMovement({
        product_id: productId,
        warehouse_id: whId,
        movement_type: type,
        quantity: parseInt(qty, 10) || 0,
        reference: ref || undefined,
        notes: notes || undefined,
      });
      setOpen(false);
      setQty('1'); setRef(''); setNotes('');
      onDone();
    } catch (e) {
      alert('Échec de l\'enregistrement du mouvement: ' + (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">Ajuster</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enregistrer un mouvement de stock</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Type de mouvement</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="in">Entrée stock</SelectItem>
                <SelectItem value="out">Sortie stock</SelectItem>
                <SelectItem value="reservation">Réservation</SelectItem>
                <SelectItem value="damage">Endommagé</SelectItem>
                <SelectItem value="return">Retour</SelectItem>
                <SelectItem value="adjustment">Ajustement</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Quantité</Label>
            <Input type="number" value={qty} onChange={(e) => setQty(e.target.value)} min="1" />
          </div>
          <div>
            <Label>Entrepôt</Label>
            <Select value={whId} onValueChange={setWhId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {warehouses.map((w) => (
                  <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Référence (optionnel)</Label>
            <Input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="PO-001, SO-001..." />
          </div>
          <div>
            <Label>Notes (optionnel)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
          <Button onClick={submit} disabled={saving}>{saving ? 'Enregistrement...' : 'Enregistrer'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
