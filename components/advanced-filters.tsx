'use client';

import { useEffect, useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/lib/supabase';
import type { SearchFilters } from '@/lib/search';

type Option = { id: string; name: string };

export function AdvancedFilters({
  filters,
  onChange,
}: {
  filters: SearchFilters;
  onChange: (f: SearchFilters) => void;
}) {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Option[]>([]);
  const [subcategories, setSubcategories] = useState<Option[]>([]);
  const [brands, setBrands] = useState<Option[]>([]);
  const [makes, setMakes] = useState<Option[]>([]);
  const [models, setModels] = useState<Option[]>([]);
  const [fuelTypes, setFuelTypes] = useState<Option[]>([]);
  const [transmissions, setTransmissions] = useState<Option[]>([]);

  useEffect(() => {
    Promise.all([
      supabase.from('categories').select('id, name').order('name'),
      supabase.from('brands').select('id, name').order('name'),
      supabase.from('vehicle_makes').select('id, name').order('name'),
      supabase.from('fuel_types').select('id, name').order('name'),
      supabase.from('transmissions').select('id, name').order('name'),
    ]).then(([catRes, brandRes, makeRes, fuelRes, transRes]) => {
      setCategories(catRes.data || []);
      setBrands(brandRes.data || []);
      setMakes(makeRes.data || []);
      setFuelTypes(fuelRes.data || []);
      setTransmissions(transRes.data || []);
    });
  }, []);

  useEffect(() => {
    if (filters.categoryId) {
      supabase
        .from('subcategories')
        .select('id, name')
        .eq('category_id', filters.categoryId)
        .order('name')
        .then(({ data }) => setSubcategories(data || []));
    } else {
      setSubcategories([]);
    }
  }, [filters.categoryId]);

  useEffect(() => {
    if (filters.vehicleMakeId) {
      supabase
        .from('vehicle_models')
        .select('id, name')
        .eq('make_id', filters.vehicleMakeId)
        .order('name')
        .then(({ data }) => setModels(data || []));
    } else {
      setModels([]);
    }
  }, [filters.vehicleMakeId]);

  const update = (patch: Partial<SearchFilters>) => onChange({ ...filters, ...patch });

  const activeFilterCount = [
    filters.categoryId,
    filters.subcategoryId,
    filters.brandId,
    filters.vehicleMakeId,
    filters.vehicleModelId,
    filters.fuelTypeId,
    filters.transmissionId,
    filters.minPrice != null ? 'price' : null,
    filters.maxPrice != null ? 'price' : null,
    filters.inStockOnly ? 'stock' : null,
  ].filter(Boolean).length;

  const reset = () => {
    onChange({
      query: filters.query,
      categoryId: null,
      subcategoryId: null,
      brandId: null,
      vehicleMakeId: null,
      vehicleModelId: null,
      vehicleGenerationId: null,
      engineId: null,
      fuelTypeId: null,
      transmissionId: null,
      minPrice: null,
      maxPrice: null,
      inStockOnly: false,
      sortBy: filters.sortBy,
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Filter className="mr-2 h-4 w-4" />
          Filtres
          {activeFilterCount > 0 && (
            <Badge className="absolute -top-1.5 -right-1.5 h-5 min-w-5 px-1 flex items-center justify-center text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            Filtres avancés
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={reset}>
                <X className="mr-1 h-3 w-3" />
                Effacer
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-5 mt-6">
          <FilterGroup label="Catégorie">
            <Select
              value={filters.categoryId || '__none__'}
              onValueChange={(v) => update({ categoryId: v === '__none__' ? null : v, subcategoryId: null })}
            >
              <SelectTrigger><SelectValue placeholder="Toutes" /></SelectTrigger>
              <SelectContent className="max-h-64">
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filters.categoryId && subcategories.length > 0 && (
              <Select
                value={filters.subcategoryId || '__none__'}
                onValueChange={(v) => update({ subcategoryId: v === '__none__' ? null : v })}
              >
                <SelectTrigger className="mt-2"><SelectValue placeholder="Sous-catégorie" /></SelectTrigger>
                <SelectContent className="max-h-64">
                  {subcategories.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </FilterGroup>

          <FilterGroup label="Marque">
            <Select
              value={filters.brandId || '__none__'}
              onValueChange={(v) => update({ brandId: v === '__none__' ? null : v })}
            >
              <SelectTrigger><SelectValue placeholder="Toutes" /></SelectTrigger>
              <SelectContent className="max-h-64">
                {brands.map((b) => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterGroup>

          <FilterGroup label="Constructeur">
            <Select
              value={filters.vehicleMakeId || '__none__'}
              onValueChange={(v) => update({ vehicleMakeId: v === '__none__' ? null : v, vehicleModelId: null })}
            >
              <SelectTrigger><SelectValue placeholder="Tous" /></SelectTrigger>
              <SelectContent className="max-h-64">
                {makes.map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filters.vehicleMakeId && models.length > 0 && (
              <Select
                value={filters.vehicleModelId || '__none__'}
                onValueChange={(v) => update({ vehicleModelId: v === '__none__' ? null : v })}
              >
                <SelectTrigger className="mt-2"><SelectValue placeholder="Modèle" /></SelectTrigger>
                <SelectContent className="max-h-64">
                  {models.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </FilterGroup>

          <FilterGroup label="Carburant">
            <Select
              value={filters.fuelTypeId || '__none__'}
              onValueChange={(v) => update({ fuelTypeId: v === '__none__' ? null : v })}
            >
              <SelectTrigger><SelectValue placeholder="Tous" /></SelectTrigger>
              <SelectContent>
                {fuelTypes.map((f) => (
                  <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterGroup>

          <FilterGroup label="Transmission">
            <Select
              value={filters.transmissionId || '__none__'}
              onValueChange={(v) => update({ transmissionId: v === '__none__' ? null : v })}
            >
              <SelectTrigger><SelectValue placeholder="Toutes" /></SelectTrigger>
              <SelectContent>
                {transmissions.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterGroup>

          <FilterGroup label="Prix (TND)">
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.minPrice ?? ''}
                onChange={(e) => update({ minPrice: e.target.value ? Number(e.target.value) : null })}
              />
              <Input
                type="number"
                placeholder="Max"
                value={filters.maxPrice ?? ''}
                onChange={(e) => update({ maxPrice: e.target.value ? Number(e.target.value) : null })}
              />
            </div>
          </FilterGroup>

          <FilterGroup label="Disponibilité">
            <div className="flex items-center gap-2">
              <Switch
                checked={filters.inStockOnly || false}
                onCheckedChange={(checked) => update({ inStockOnly: checked })}
                id="in-stock"
              />
              <Label htmlFor="in-stock" className="text-sm cursor-pointer">
                En stock uniquement
              </Label>
            </div>
          </FilterGroup>

          <FilterGroup label="Tri">
            <Select
              value={filters.sortBy || 'name'}
              onValueChange={(v) => update({ sortBy: v as SearchFilters['sortBy'] })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nom (A-Z)</SelectItem>
                <SelectItem value="price_asc">Prix croissant</SelectItem>
                <SelectItem value="price_desc">Prix décroissant</SelectItem>
                <SelectItem value="newest">Plus récents</SelectItem>
              </SelectContent>
            </Select>
          </FilterGroup>
        </div>

        <div className="mt-6 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={reset}>
            Réinitialiser
          </Button>
          <Button className="flex-1" onClick={() => setOpen(false)}>
            Appliquer
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-sm font-medium mb-2 block">{label}</Label>
      {children}
    </div>
  );
}
