'use client';

import { useEffect, useState } from 'react';
import { Truck, Plus, Mail, Phone, MapPin, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { getSuppliers } from '@/lib/services';
import { supabase } from '@/lib/supabase';
import type { Supplier } from '@/types/database';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', city: '', country: '', tax_id: '', contact_person: '', notes: '' });

  const load = () => getSuppliers(0).then((r) => setSuppliers(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const submit = async () => {
    await supabase.from('suppliers').insert(form);
    setOpen(false);
    setForm({ name: '', email: '', phone: '', address: '', city: '', country: '', tax_id: '', contact_person: '', notes: '' });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fournisseurs</h1>
          <p className="text-sm text-muted-foreground">{suppliers.length} fournisseurs</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Ajouter un fournisseur</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Ajouter un fournisseur</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Nom</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                <div><Label>Téléphone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              </div>
              <div><Label>Personne de contact</Label><Input value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} /></div>
              <div><Label>Adresse</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Ville</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
                <div><Label>Pays</Label><Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></div>
                <div><Label>Matricule fiscale</Label><Input value={form.tax_id} onChange={(e) => setForm({ ...form, tax_id: e.target.value })} /></div>
              </div>
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button><Button onClick={submit}>Enregistrer</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? <Skeleton className="h-64 rounded-lg" /> : suppliers.length === 0 ? (
        <Card><CardContent className="py-16 text-center">
          <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-lg font-medium">Aucun fournisseur pour le moment</p>
        </CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {suppliers.map((s) => (
            <Card key={s.id}>
              <CardContent className="p-4">
                <p className="font-medium">{s.name}</p>
                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {s.contact_person && <p className="flex items-center gap-1.5"><User className="h-3 w-3" />{s.contact_person}</p>}
                  {s.email && <p className="flex items-center gap-1.5"><Mail className="h-3 w-3" />{s.email}</p>}
                  {s.phone && <p className="flex items-center gap-1.5"><Phone className="h-3 w-3" />{s.phone}</p>}
                  {(s.city || s.country) && <p className="flex items-center gap-1.5"><MapPin className="h-3 w-3" />{[s.city, s.country].filter(Boolean).join(', ')}</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
