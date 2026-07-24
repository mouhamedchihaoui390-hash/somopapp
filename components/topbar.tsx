'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Bell, Sun, Moon, Menu, X, Clock, Package, Tag, Car, ChevronRight } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { BinTag } from '@/components/ui/bin-tag';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar } from '@/components/sidebar';
import { instantSearch, getRecentSearches, addRecentSearch, clearRecentSearches, type SearchResult } from '@/lib/search';
import Link from 'next/link';

export function Topbar() {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('read', false)
      .then(({ count }) => setNotifCount(count || 0));
  }, []);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  const debouncedSearch = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    if (debouncedSearch.current) clearTimeout(debouncedSearch.current);
    if (query.trim().length < 2) {
      setResults(null);
      return;
    }
    debouncedSearch.current = setTimeout(async () => {
      const res = await instantSearch(query);
      setResults(res);
    }, 250);
    return () => {
      if (debouncedSearch.current) clearTimeout(debouncedSearch.current);
    };
  }, [query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const loadNotifications = async () => {
    const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(10);
    setNotifications(data || []);
  };

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    loadNotifications();
    setNotifCount((c) => Math.max(0, c - 1));
  };

  const handleSearchSubmit = useCallback(() => {
    if (query.trim().length < 2) return;
    addRecentSearch(query);
    setShowResults(false);
    router.push(`/products?q=${encodeURIComponent(query)}`);
  }, [query, router]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (activeIndex >= 0 && results) {
        const allItems = [
          ...results.categories.map((c) => `/products?categoryId=${c.id}`),
          ...results.brands.map((b) => `/products?brandId=${b.id}`),
          ...results.vehicleModels.map((m) => `/products?vehicleMakeId=${(m as any).make?.id}&vehicleModelId=${m.id}`),
          ...results.products.map((p) => `/products/${p.id}`),
        ];
        if (allItems[activeIndex]) {
          addRecentSearch(query);
          setShowResults(false);
          router.push(allItems[activeIndex]);
          return;
        }
      }
      handleSearchSubmit();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, (results?.products.length || 0) + (results?.categories.length || 0) + (results?.brands.length || 0) + (results?.vehicleModels.length || 0) - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Escape') {
      setShowResults(false);
    }
  };

  const allResultCount = results
    ? results.categories.length + results.brands.length + results.vehicleModels.length + results.products.length
    : 0;

  let itemIndex = -1;
  const nextIndex = () => { itemIndex++; return itemIndex; };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border bg-card px-4 md:px-6 shadow-panel">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <Sidebar />
        </SheetContent>
      </Sheet>

      <div ref={searchRef} className="relative flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher produit, référence, OEM, véhicule..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowResults(true); setActiveIndex(-1); }}
            onFocus={() => setShowResults(true)}
            onKeyDown={handleKeyDown}
            className="pl-9"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setResults(null); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {showResults && query.trim().length >= 2 && (
          <div className="absolute top-full mt-1 w-full rounded-lg border bg-popover shadow-lg max-h-[28rem] overflow-y-auto z-50">
            {allResultCount === 0 && !recentSearches.length && (
              <p className="px-4 py-3 text-sm text-muted-foreground">Aucun résultat trouvé</p>
            )}

            {allResultCount === 0 && recentSearches.length > 0 && (
              <div className="p-2">
                <div className="flex items-center justify-between px-2 py-1">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Recherches récentes
                  </span>
                  <button onClick={() => { clearRecentSearches(); setRecentSearches([]); }} className="text-xs text-primary hover:underline">
                    Effacer
                  </button>
                </div>
                {recentSearches.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setQuery(s); }}
                    className="flex items-center gap-2 w-full px-3 py-2 hover:bg-accent rounded-md text-sm"
                  >
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    {s}
                  </button>
                ))}
              </div>
            )}

            {results && results.categories.length > 0 && (
              <div className="p-2 border-b">
                <p className="text-xs font-medium text-muted-foreground px-2 py-1 flex items-center gap-1">
                  <Tag className="h-3 w-3" /> Catégories
                </p>
                {results.categories.map((c) => {
                  const idx = nextIndex();
                  return (
                    <Link
                      key={c.id}
                      href={`/products?categoryId=${c.id}`}
                      onClick={() => { setShowResults(false); addRecentSearch(query); }}
                      className={`flex items-center gap-2 w-full px-3 py-2 hover:bg-accent rounded-md text-sm ${activeIndex === idx ? 'bg-accent' : ''}`}
                    >
                      <Tag className="h-3 w-3 text-muted-foreground" />
                      {c.name}
                    </Link>
                  );
                })}
              </div>
            )}

            {results && results.brands.length > 0 && (
              <div className="p-2 border-b">
                <p className="text-xs font-medium text-muted-foreground px-2 py-1 flex items-center gap-1">
                  <Tag className="h-3 w-3" /> Marques
                </p>
                {results.brands.map((b) => {
                  const idx = nextIndex();
                  return (
                    <Link
                      key={b.id}
                      href={`/products?brandId=${b.id}`}
                      onClick={() => { setShowResults(false); addRecentSearch(query); }}
                      className={`flex items-center gap-2 w-full px-3 py-2 hover:bg-accent rounded-md text-sm ${activeIndex === idx ? 'bg-accent' : ''}`}
                    >
                      <Tag className="h-3 w-3 text-muted-foreground" />
                      {b.name}
                    </Link>
                  );
                })}
              </div>
            )}

            {results && results.vehicleModels.length > 0 && (
              <div className="p-2 border-b">
                <p className="text-xs font-medium text-muted-foreground px-2 py-1 flex items-center gap-1">
                  <Car className="h-3 w-3" /> Véhicules
                </p>
                {results.vehicleModels.map((m) => {
                  const idx = nextIndex();
                  return (
                    <Link
                      key={m.id}
                      href={`/products?vehicleMakeId=${(m as any).make?.id}&vehicleModelId=${m.id}`}
                      onClick={() => { setShowResults(false); addRecentSearch(query); }}
                      className={`flex items-center gap-2 w-full px-3 py-2 hover:bg-accent rounded-md text-sm ${activeIndex === idx ? 'bg-accent' : ''}`}
                    >
                      <Car className="h-3 w-3 text-muted-foreground" />
                      {(m as any).make?.name} {m.name}
                    </Link>
                  );
                })}
              </div>
            )}

            {results && results.products.length > 0 && (
              <div className="p-2">
                <p className="text-xs font-medium text-muted-foreground px-2 py-1 flex items-center gap-1">
                  <Package className="h-3 w-3" /> Produits
                </p>
                {results.products.map((p) => {
                  const idx = nextIndex();
                  return (
                    <Link
                      key={p.id}
                      href={`/products/${p.id}`}
                      onClick={() => { setShowResults(false); addRecentSearch(query); }}
                      className={`flex items-center gap-3 px-3 py-2 hover:bg-accent rounded-md text-sm ${activeIndex === idx ? 'bg-accent' : ''}`}
                    >
                      <div className="h-8 w-8 rounded bg-muted flex items-center justify-center text-xs font-medium shrink-0">
                        {p.image_url ? 'IMG' : p.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{p.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {(p.oem || p.reference) && <BinTag>{p.oem || p.reference}</BinTag>}
                        </div>
                      </div>
                      {p.selling_price && (
                        <span className="font-mono text-xs font-medium shrink-0 tabular">
                          {Number(p.selling_price).toFixed(3)} TND
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}

            {allResultCount > 0 && (
              <div className="p-2 border-t">
                <button
                  onClick={handleSearchSubmit}
                  className="flex items-center gap-2 w-full px-3 py-2 hover:bg-accent rounded-md text-sm font-medium text-primary"
                >
                  Voir tous les résultats
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => { loadNotifications(); setNotifOpen(!notifOpen); }}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {notifCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center text-xs">
            {notifCount}
          </Badge>
        )}
      </Button>

      {notifOpen && (
        <div className="absolute top-full right-4 mt-2 w-80 rounded-lg border bg-popover shadow-lg z-50 max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">Aucune notification</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`px-4 py-3 border-b last:border-0 ${!n.read ? 'bg-accent/50' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{n.title}</p>
                    {n.body && <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>}
                  </div>
                  {!n.read && (
                    <button onClick={() => markRead(n.id)} className="text-xs text-primary hover:underline shrink-0">
                      Marquer comme lu
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <Button variant="ghost" size="icon" onClick={toggleTheme}>
        {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      </Button>
    </header>
  );
}
