'use client';

import { useEffect, useState } from 'react';
import { Settings as SettingsIcon, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('settings').select('*').then(({ data }) => {
      const map: Record<string, string> = {};
      for (const s of data || []) map[s.key] = s.value || '';
      setSettings(map);
      setLoading(false);
    });
  }, []);

  const save = async () => {
    setSaving(true);
    for (const [key, value] of Object.entries(settings)) {
      await supabase.from('settings').upsert({ key, value, updated_at: new Date().toISOString() });
    }
    setSaving(false);
  };

  if (loading) return <Skeleton className="h-64 rounded-lg" />;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-sm text-muted-foreground">Configurez votre système ERP</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><SettingsIcon className="h-5 w-5" /> Paramètres généraux</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><Label>Nom de l'entreprise</Label><Input value={settings.company_name || ''} onChange={(e) => setSettings({ ...settings, company_name: e.target.value })} /></div>
          <div><Label>Devise</Label><Input value={settings.currency || ''} onChange={(e) => setSettings({ ...settings, currency: e.target.value })} placeholder="TND, EUR..." /></div>
          <div><Label>Seuil de stock faible</Label><Input type="number" value={settings.low_stock_threshold || ''} onChange={(e) => setSettings({ ...settings, low_stock_threshold: e.target.value })} /></div>
          <Button onClick={save} disabled={saving}><Save className="mr-2 h-4 w-4" />{saving ? 'Enregistrement...' : 'Enregistrer'}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
