'use client';

import { useEffect, useState, useCallback } from 'react';
import { Car, X, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type VehicleSelection = {
  makeId: string | null;
  makeName: string | null;
  modelId: string | null;
  modelName: string | null;
  generationId: string | null;
  generationName: string | null;
  engineId: string | null;
  engineName: string | null;
};

type Option = { id: string; name: string };

export function VehicleSelector({
  value,
  onChange,
  compact = false,
}: {
  value: VehicleSelection;
  onChange: (sel: VehicleSelection) => void;
  compact?: boolean;
}) {
  const [makes, setMakes] = useState<Option[]>([]);
  const [models, setModels] = useState<Option[]>([]);
  const [generations, setGenerations] = useState<Option[]>([]);
  const [engines, setEngines] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase
      .from('vehicle_makes')
      .select('id, name')
      .order('name')
      .then(({ data }) => setMakes(data || []));
  }, []);

  const loadModels = useCallback(async (makeId: string) => {
    const { data } = await supabase
      .from('vehicle_models')
      .select('id, name')
      .eq('make_id', makeId)
      .order('name');
    setModels(data || []);
  }, []);

  const loadGenerations = useCallback(async (modelId: string) => {
    const { data } = await supabase
      .from('vehicle_generations')
      .select('id, name, year_start, year_end')
      .eq('model_id', modelId)
      .order('name');
    setGenerations(data || []);
  }, []);

  const loadEngines = useCallback(async (generationId: string) => {
    const { data } = await supabase
      .from('engines')
      .select('id, name, displacement, power_hp')
      .eq('generation_id', generationId)
      .order('name');
    setEngines(data || []);
  }, []);

  useEffect(() => {
    if (value.makeId) loadModels(value.makeId);
    else setModels([]);
  }, [value.makeId, loadModels]);

  useEffect(() => {
    if (value.modelId) loadGenerations(value.modelId);
    else setGenerations([]);
  }, [value.modelId, loadGenerations]);

  useEffect(() => {
    if (value.generationId) loadEngines(value.generationId);
    else setEngines([]);
  }, [value.generationId, loadEngines]);

  const handleMakeChange = (makeId: string) => {
    const make = makes.find((m) => m.id === makeId);
    onChange({
      makeId,
      makeName: make?.name || null,
      modelId: null,
      modelName: null,
      generationId: null,
      generationName: null,
      engineId: null,
      engineName: null,
    });
  };

  const handleModelChange = (modelId: string) => {
    const model = models.find((m) => m.id === modelId);
    onChange({
      ...value,
      modelId,
      modelName: model?.name || null,
      generationId: null,
      generationName: null,
      engineId: null,
      engineName: null,
    });
  };

  const handleGenerationChange = (generationId: string) => {
    const gen = generations.find((g) => g.id === generationId);
    onChange({
      ...value,
      generationId,
      generationName: gen?.name || null,
      engineId: null,
      engineName: null,
    });
  };

  const handleEngineChange = (engineId: string) => {
    const eng = engines.find((e) => e.id === engineId);
    onChange({
      ...value,
      engineId,
      engineName: eng?.name || null,
    });
  };

  const handleReset = () => {
    onChange({
      makeId: null,
      makeName: null,
      modelId: null,
      modelName: null,
      generationId: null,
      generationName: null,
      engineId: null,
      engineName: null,
    });
  };

  const hasSelection = value.makeId || value.modelId || value.generationId || value.engineId;

  if (compact && !hasSelection) {
    return (
      <Button variant="outline" size="sm" onClick={() => onChange({ ...value })}>
        <Car className="mr-2 h-4 w-4" />
        Sélectionner véhicule
      </Button>
    );
  }

  return (
    <div className={compact ? 'space-y-3' : 'space-y-4 p-4 rounded-lg border bg-card'}>
      {!compact && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-sm">Sélection du véhicule</h3>
          </div>
          {hasSelection && (
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <X className="mr-1 h-3 w-3" />
              Réinitialiser
            </Button>
          )}
        </div>
      )}

      <div className={`grid gap-3 ${compact ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}>
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Constructeur</Label>
          <Select
            value={value.makeId || '__none__'}
            onValueChange={handleMakeChange}
            disabled={loading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              {makes.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Modèle</Label>
          <Select
            value={value.modelId || '__none__'}
            onValueChange={handleModelChange}
            disabled={!value.makeId}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              {models.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Génération</Label>
          <Select
            value={value.generationId || '__none__'}
            onValueChange={handleGenerationChange}
            disabled={!value.modelId}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              {generations.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {g.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Moteur</Label>
          <Select
            value={value.engineId || '__none__'}
            onValueChange={handleEngineChange}
            disabled={!value.generationId}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              {engines.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasSelection && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {value.makeName && <Badge variant="secondary" className="text-xs">{value.makeName}</Badge>}
          {value.modelName && (
            <>
              <ChevronRight className="h-3 w-3 text-muted-foreground self-center" />
              <Badge variant="secondary" className="text-xs">{value.modelName}</Badge>
            </>
          )}
          {value.generationName && (
            <>
              <ChevronRight className="h-3 w-3 text-muted-foreground self-center" />
              <Badge variant="secondary" className="text-xs">{value.generationName}</Badge>
            </>
          )}
          {value.engineName && (
            <>
              <ChevronRight className="h-3 w-3 text-muted-foreground self-center" />
              <Badge variant="secondary" className="text-xs">{value.engineName}</Badge>
            </>
          )}
        </div>
      )}
    </div>
  );
}
