'use client';

import { useEffect, useState } from 'react';
import { Car, Plus, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getVinRequests, createVinRequest, updateVinRequest } from '@/lib/services';
import type { VinRequest } from '@/types/database';

const statusConfig: Record<string, { color: string; icon: any }> = {
  pending: { color: 'text-amber-500', icon: Clock },
  processing: { color: 'text-blue-500', icon: Clock },
  resolved: { color: 'text-green-500', icon: CheckCircle2 },
  cancelled: { color: 'text-red-500', icon: XCircle },
};

export default function VinRequestsPage() {
  const [requests, setRequests] = useState<VinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [newReq, setNewReq] = useState({ vin: '', customer_name: '', customer_email: '', vehicle_info: '', requested_products: '', comments: '' });

  const load = () => {
    getVinRequests(0).then((r) => setRequests(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const submit = async () => {
    await createVinRequest(newReq);
    setCreateOpen(false);
    setNewReq({ vin: '', customer_name: '', customer_email: '', vehicle_info: '', requested_products: '', comments: '' });
    load();
  };

  const updateStatus = async (id: string, status: string) => {
    await updateVinRequest(id, { status });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Demandes VIN</h1>
          <p className="text-sm text-muted-foreground">Demandes de recherche de pièces par numéro d'identification du véhicule</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Nouvelle demande</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nouvelle demande VIN</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>VIN</Label><Input value={newReq.vin} onChange={(e) => setNewReq({ ...newReq, vin: e.target.value })} placeholder="VIN à 17 caractères" /></div>
              <div><Label>Nom du client</Label><Input value={newReq.customer_name} onChange={(e) => setNewReq({ ...newReq, customer_name: e.target.value })} /></div>
              <div><Label>Email du client</Label><Input value={newReq.customer_email} onChange={(e) => setNewReq({ ...newReq, customer_email: e.target.value })} /></div>
              <div><Label>Informations véhicule</Label><Input value={newReq.vehicle_info} onChange={(e) => setNewReq({ ...newReq, vehicle_info: e.target.value })} placeholder="Marque, modèle, année" /></div>
              <div><Label>Produits demandés</Label><Textarea value={newReq.requested_products} onChange={(e) => setNewReq({ ...newReq, requested_products: e.target.value })} rows={2} /></div>
              <div><Label>Commentaires</Label><Textarea value={newReq.comments} onChange={(e) => setNewReq({ ...newReq, comments: e.target.value })} rows={2} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Annuler</Button>
              <Button onClick={submit}>Envoyer la demande</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <Skeleton className="h-64 rounded-lg" />
      ) : requests.length === 0 ? (
        <Card><CardContent className="py-16 text-center">
          <Car className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-lg font-medium">Aucune demande VIN pour le moment</p>
          <p className="text-sm text-muted-foreground mt-1">Créez une nouvelle demande pour commencer</p>
        </CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {requests.map((req) => {
            const cfg = statusConfig[req.status] || statusConfig.pending;
            const Icon = cfg.icon;
            return (
              <Card key={req.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cfg.color}><Icon className="h-3 w-3 mr-1 inline" />{req.status}</Badge>
                        {req.vin && <span className="text-xs font-mono text-muted-foreground">{req.vin}</span>}
                      </div>
                      <p className="font-medium mt-2">{req.customer_name || 'Anonyme'}</p>
                      {req.customer_email && <p className="text-xs text-muted-foreground">{req.customer_email}</p>}
                      {req.vehicle_info && <p className="text-sm mt-2">{req.vehicle_info}</p>}
                      {req.requested_products && <p className="text-sm text-muted-foreground mt-1">Besoin: {req.requested_products}</p>}
                      {req.comments && <p className="text-xs text-muted-foreground mt-2 italic">"{req.comments}"</p>}
                      <p className="text-xs text-muted-foreground mt-2">{new Date(req.created_at).toLocaleString('fr-FR')}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t">
                    <Select value={req.status} onValueChange={(v) => updateStatus(req.id, v)}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">En attente</SelectItem>
                        <SelectItem value="processing">En cours</SelectItem>
                        <SelectItem value="resolved">Résolu</SelectItem>
                        <SelectItem value="cancelled">Annulé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
