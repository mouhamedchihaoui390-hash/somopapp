'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, Package, Plus, Car, ChevronRight, Home } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BinTag } from '@/components/ui/bin-tag';
import { smartSearchProducts, type SearchFilters } from '@/lib/search';
import { AdvancedFilters } from '@/components/advanced-filters';
import { VehicleSelector, type VehicleSelection } from '@/components/vehicle-selector';

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(0);
  const [vehicleSel, setVehicleSel] = useState<VehicleSelection>({
    makeId: null, makeName: null, modelId: null, modelName: null,
    generationId: null, generationName: null, engineId: null, engineName: null,
  });
  const [showVehicleSelector, setShowVehicleSelector] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({ sortBy: 'name' });

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setQuery(q);
    const categoryId = searchParams.get('categoryId');
    const brandId = searchParams.get('brandId');
    const vehicleMakeId = searchParams.get('vehicleMakeId');
    const vehicleModelId = searchParams.get('vehicleModelId');
    setFilters((prev) => ({
      ...prev,
      query: q || '',
      categoryId: categoryId || null,
      brandId: brandId || null,
      vehicleMakeId: vehicleMakeId || null,
      vehicleModelId: vehicleModelId || null,
    }));
  }, [searchParams]);

  const load = useCallback(async (f: SearchFilters, p: number) => {
    setLoading(true);
    try {
      const { data, count: total } = await smartSearchProducts(f, p);
      setProducts(data);
      setCount(total);
    } catch (err) {
      console.error('Load error:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      load({ ...filters, query }, 0);
      setPage(0);
    }, 300);
    return () => clearTimeout(t);
  }, [query, filters, load]);

  const numPages = Math.ceil(count / 24);

  const handleVehicleChange = (sel: VehicleSelection) => {
    setVehicleSel(sel);
    setFilters((prev) => ({
      ...prev,
      vehicleMakeId: sel.makeId,
      vehicleModelId: sel.modelId,
      vehicleGenerationId: sel.generationId,
      engineId: sel.engineId,
    }));
  };

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground flex items-center gap-1">
          <Home className="h-3.5 w-3.5" /> Accueil
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">Produits</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Catalogue</p>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Produits</h1>
          <p className="text-sm text-muted-foreground font-mono">{count.toLocaleString('fr-FR')} produits</p>
        </div>
        <Link href="/import">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Importer catalogue
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, OEM, référence, code-barres..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant={showVehicleSelector ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowVehicleSelector(!showVehicleSelector)}
        >
          <Car className="mr-2 h-4 w-4" />
          {vehicleSel.makeName ? `${vehicleSel.makeName} ${vehicleSel.modelName || ''}` : 'Véhicule'}
        </Button>
        <AdvancedFilters filters={filters} onChange={setFilters} />
      </div>

      {showVehicleSelector && (
        <VehicleSelector value={vehicleSel} onChange={handleVehicleChange} />
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(12)].map((_, i) => <Skeleton key={i} className="h-44 rounded-lg" />)}
        </div>
      ) : products.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-lg font-medium">Aucun produit trouvé</p>
            <p className="text-sm text-muted-foreground mt-1">
              Importez votre catalogue Excel pour commencer
            </p>
            <Link href="/import" className="mt-4 inline-block">
              <Button>Aller à l'assistant d'import</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <Link key={p.id} href={`/products/${p.id}`}>
                <Card className="hover:border-primary/40 transition-colors cursor-pointer h-full group">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className="h-16 w-16 rounded-sm bg-background-2 border border-border flex items-center justify-center shrink-0 overflow-hidden">
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                        ) : (
                          <Package className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{p.name}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {p.brand && <Badge variant="secondary" className="text-xs">{p.brand.name}</Badge>}
                          {p.category && <Badge variant="outline" className="text-xs">{p.category.name}</Badge>}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {p.oem && <BinTag>{p.oem}</BinTag>}
                          {p.reference && <BinTag>{p.reference}</BinTag>}
                        </div>
                        <p className="font-mono text-sm font-semibold mt-2 tabular">{Number(p.selling_price || 0).toFixed(3)} TND</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {numPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => { setPage(page - 1); load({ ...filters, query }, page - 1); }}
              >
                Précédent
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page + 1} sur {numPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= numPages - 1}
                onClick={() => { setPage(page + 1); load({ ...filters, query }, page + 1); }}
              >
                Suivant
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 rounded-lg" />}>
      <ProductsPageContent />
    </Suspense>
  );
}
