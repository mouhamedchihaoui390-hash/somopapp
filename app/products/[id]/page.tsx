'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Package, Barcode, Truck, Tag,
  Boxes, Car, History, ChevronRight, Home,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getProduct, getProductInventory, getProductCompatibility, getStockMovements } from '@/lib/services';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [product, setProduct] = useState<any>(null);
  const [inventory, setInventory] = useState<any[]>([]);
  const [compat, setCompat] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getProduct(id),
      getProductInventory(id),
      getProductCompatibility(id),
      getStockMovements(id),
    ])
      .then(([p, inv, c, m]) => {
        setProduct(p);
        setInventory(inv);
        setCompat(c);
        setMovements(m);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <Skeleton className="h-96 rounded-lg" />;
  }

  if (!product) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <p className="text-lg font-medium">Produit introuvable</p>
          <Link href="/products" className="mt-4 inline-block">
            <Button variant="outline">Retour aux produits</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const totalStock = inventory.reduce((sum, i) => sum + (i.quantity || 0), 0);

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground flex items-center gap-1">
          <Home className="h-3.5 w-3.5" /> Accueil
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/products" className="hover:text-foreground">Produits</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium truncate">{product.name}</span>
      </nav>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
          <div className="flex flex-wrap gap-2 mt-1">
            {product.brand && <Badge variant="secondary">{product.brand.name}</Badge>}
            {product.category && <Badge variant="outline">{product.category.name}</Badge>}
            {product.subcategory && <Badge variant="outline">{product.subcategory.name}</Badge>}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <div className="aspect-square rounded-lg bg-muted flex items-center justify-center overflow-hidden">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <Package className="h-16 w-16 text-muted-foreground" />
              )}
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Tag className="h-5 w-5" /> Détails du produit</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <Info label="Numéro OEM" value={product.oem} />
                <Info label="Référence" value={product.reference} />
                <Info label="SKU" value={product.sku} />
                <Info label="Code-barres" value={product.barcode} />
                <Info label="Poids" value={product.weight ? `${product.weight} kg` : null} />
                <Info label="Dimensions" value={
                  product.length && product.width && product.height
                    ? `${product.length}×${product.width}×${product.height} cm`
                    : null
                } />
                <Info label="Prix d'achat" value={product.purchase_price ? `${product.purchase_price.toFixed(3)} TND` : null} />
                <Info label="Prix de vente" value={product.selling_price ? `${product.selling_price.toFixed(3)} TND` : null} />
                <Info label="Taux de TVA" value={product.tax_rate ? `${product.tax_rate}%` : null} />
                <Info label="Statut" value={product.status} />
                <Info label="Stock minimum" value={product.min_stock?.toString()} />
                <Info label="Stock maximum" value={product.max_stock?.toString()} />
              </div>
              {product.description && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-1">Description</p>
                  <p className="text-sm">{product.description}</p>
                </div>
              )}
              {product.tags && product.tags.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex flex-wrap gap-1.5">
                    {product.tags.map((t: string) => (
                      <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Boxes className="h-5 w-5" /> Inventaire ({totalStock} total)</CardTitle>
          </CardHeader>
          <CardContent>
            {inventory.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Aucun stock enregistré</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entrepôt</TableHead>
                    <TableHead className="text-right">Qté</TableHead>
                    <TableHead className="text-right">Réservé</TableHead>
                    <TableHead className="text-right">Entrant</TableHead>
                    <TableHead>Étagère</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventory.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-medium">{inv.warehouse?.name || '—'}</TableCell>
                      <TableCell className="text-right">
                        <span className={inv.quantity === 0 ? 'text-red-500 font-medium' : inv.quantity < 5 ? 'text-amber-500 font-medium' : ''}>
                          {inv.quantity}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{inv.reserved}</TableCell>
                      <TableCell className="text-right">{inv.incoming}</TableCell>
                      <TableCell>{inv.shelf || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Car className="h-5 w-5" /> Compatibilité véhicule</CardTitle>
          </CardHeader>
          <CardContent>
            {compat.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Aucune donnée de compatibilité</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {compat.map((c) => (
                  <div key={c.id} className="flex items-center gap-2 text-sm border-b pb-2 last:border-0">
                    <div className="flex-1">
                      <span className="font-medium">{c.make?.name}</span>
                      <span className="text-muted-foreground"> {c.model?.name}</span>
                      {c.generation && <span className="text-muted-foreground"> {c.generation.name}</span>}
                      {c.engine && <span className="text-muted-foreground"> · {c.engine.name}</span>}
                    </div>
                    {(c.year_start || c.year_end) && (
                      <Badge variant="outline" className="text-xs">
                        {c.year_start || '?'}–{c.year_end || '?'}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><History className="h-5 w-5" /> Historique des mouvements de stock</CardTitle>
        </CardHeader>
        <CardContent>
          {movements.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Aucun mouvement enregistré</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Quantité</TableHead>
                  <TableHead>Référence</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="text-xs">{new Date(m.created_at).toLocaleString('fr-FR')}</TableCell>
                    <TableCell><Badge variant="outline">{m.movement_type}</Badge></TableCell>
                    <TableCell className="text-right font-medium">{m.quantity}</TableCell>
                    <TableCell>{m.reference || '—'}</TableCell>
                    <TableCell className="text-xs">{m.notes || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium mt-0.5">{value}</p>
    </div>
  );
}
