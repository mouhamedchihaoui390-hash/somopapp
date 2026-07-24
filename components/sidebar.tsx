'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, Warehouse, FileSpreadsheet, Car,
  Users, Truck, ShoppingCart, ClipboardList, BarChart3, Settings,
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
    <aside className="hidden md:flex w-60 flex-col bg-sidebar h-screen sticky top-0 border-r border-sidebar-border">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
        <div className="flex h-8 w-8 items-center justify-center bg-primary text-primary-foreground font-display font-bold text-sm shrink-0">
          AP
        </div>
        <div className="min-w-0">
          <p className="font-display font-semibold text-sm leading-tight text-sidebar-foreground tracking-wide uppercase">
            AutoParts ERP
          </p>
          <p className="text-[11px] text-sidebar-muted font-mono">VW · Audi · SEAT · Škoda</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-3">
        {nav.map((item) => {
          const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex items-center gap-3 px-5 py-2.5 text-[13px] font-medium tracking-wide transition-colors',
                active
                  ? 'text-sidebar-foreground bg-sidebar-2'
                  : 'text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-2/60'
              )}
            >
              {active && <span className="absolute left-0 top-0 h-full w-[3px] bg-primary" />}
              <Icon className="h-[15px] w-[15px] shrink-0" />
              <span className="uppercase text-[11.5px] tracking-wider font-display">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="px-5 py-3 border-t border-sidebar-border text-[10.5px] text-sidebar-muted font-mono uppercase tracking-wide">
        Catalogue automobile
      </div>
    </aside>
  );
}
