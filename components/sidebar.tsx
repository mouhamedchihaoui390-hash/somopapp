'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, Warehouse, FileSpreadsheet, Car,
  Users, Truck, ShoppingCart, ClipboardList, BarChart3, Settings,
  Wrench,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const nav = [
  { href: '/', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/products', label: 'Produits', icon: Package },
  { href: '/inventory', label: 'Inventaire', icon: Warehouse },
  { href: '/import', label: 'Importer Excel', icon: FileSpreadsheet },
  { href: '/vin-requests', label: 'Demandes VIN', icon: Car },
  { href: '/customers', label: 'Clients', icon: Users },
  { href: '/suppliers', label: 'Fournisseurs', icon: Truck },
  { href: '/purchase-orders', label: "Commandes d'achat", icon: ShoppingCart },
  { href: '/sales-orders', label: 'Commandes de vente', icon: ClipboardList },
  { href: '/reports', label: 'Rapports', icon: BarChart3 },
  { href: '/settings', label: 'Paramètres', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-card h-screen sticky top-0">
      <div className="flex items-center gap-2 px-6 py-5 border-b">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Wrench className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold text-sm leading-tight">AutoParts ERP</p>
          <p className="text-xs text-muted-foreground">Pièces détachées</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {nav.map((item) => {
          const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-6 py-3 border-t text-xs text-muted-foreground">
        Catalogue automobile intelligent
      </div>
    </aside>
  );
}
