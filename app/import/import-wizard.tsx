'use client';
export const dynamic = 'force-dynamic';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import {
  Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2,
  ArrowRight, ArrowLeft, Database, RefreshCw, Download,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { autoMapColumns, parseValue, FIELD_DEFS } from '@/lib/import-mapper';
import type { FieldKey } from '@/lib/import-mapper';
import { supabase } from '@/lib/supabase';

type Step = 'upload' | 'preview' | 'mapping' | 'validation' | 'import' | 'summary';
type RowData = Record<string, any>;
type ImportSummary = {
  imported: number;
  updated: number;
  errors: number;
  warnings: number;
  skipped: number;
  duration: number;
  errorDetails: string[];
};

export default function ImportWizardPage() {
  const [step, setStep] = useState<Step>('upload');
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState<RowData[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, FieldKey | null>>({});
  const [validation, setValidation] = useState<{ errors: any[]; warnings: any[]; valid: boolean } | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState('');
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [parseError, setParseError] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setFileName(file.name);
    setParseError('');
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const jsonRows = XLSX.utils.sheet_to_json<RowData>(ws, { defval: '' });
        if (jsonRows.length === 0) {
          setParseError('The file contains no data rows.');
          return;
        }
        const cols = Object.keys(jsonRows[0]);
        setRows(jsonRows);
        setHeaders(cols);
        setMapping(autoMapColumns(cols));
        setStep('preview');
      } catch (err) {
        setParseError('Failed to parse file: ' + (err as Error).message);
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
  });

  const steps: { key: Step; label: string; num: number }[] = [
    { key: 'upload', label: 'Télécharger', num: 1 },
    { key: 'preview', label: 'Aperçu', num: 2 },
    { key: 'mapping', label: 'Correspondance', num: 3 },
    { key: 'validation', label: 'Validation', num: 4 },
    { key: 'import', label: 'Import', num: 5 },
    { key: 'summary', label: 'Résumé', num: 6 },
  ];
  const currentNum = steps.find((s) => s.key === step)?.num || 1;

  const runValidation = () => {
    const errors: any[] = [];
    const warnings: any[] = [];

    rows.forEach((row, idx) => {
      const mapped: Record<string, any> = {};
      for (const [header, field] of Object.entries(mapping)) {
        if (field) mapped[field] = row[header];
      }
      const rowNum = idx + 2;
      if (!mapped.name || String(mapped.name).trim() === '') {
        errors.push({ row: rowNum, message: 'Missing product name' });
      }
      if (!mapped.oem && !mapped.reference && !mapped.sku && !mapped.barcode) {
        warnings.push({ row: rowNum, message: 'No identifier (OEM, reference, SKU, or barcode)' });
      }
      if (mapped.selling_price != null) {
        const p = parseFloat(String(mapped.selling_price));
        if (isNaN(p) || p < 0) errors.push({ row: rowNum, message: 'Invalid selling price' });
      }
      if (mapped.stock != null) {
        const s = parseInt(String(mapped.stock), 10);
        if (isNaN(s) || s < 0) errors.push({ row: rowNum, message: 'Invalid stock quantity' });
      }
    });

    setValidation({ errors, warnings, valid: errors.length === 0 });
    setStep('validation');
  };

  const doImport = async () => {
    setStep('import');
    setImportProgress(0);
    setImportStatus('Préparation...');

    const start = Date.now();
    let imported = 0, updated = 0, errors = 0, warnings = 0, skipped = 0;
    const errorDetails: string[] = [];

    const batchSize = 50;
    const total = rows.length;

    for (let i = 0; i < total; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      setImportStatus(`Importation des lignes ${i + 1}–${Math.min(i + batchSize, total)} sur ${total}...`);

      for (let j = 0; j < batch.length; j++) {
        const row = batch[j];
        const mapped: Record<string, any> = {};
        for (const [header, field] of Object.entries(mapping)) {
          if (field) {
            const def = FIELD_DEFS.find((d) => d.key === field);
            mapped[field] = def ? parseValue(row[header], def.type) : row[header];
          }
        }

        if (!mapped.name) { skipped++; continue; }

        try {
          const { data: existing } = await supabase
            .from('products')
            .select('id')
            .or(`oem.eq.${mapped.oem || '___none___'},barcode.eq.${mapped.barcode || '___none___'},sku.eq.${mapped.sku || '___none___'}`)
            .limit(1)
            .maybeSingle();

          let categoryId: string | null = null;
          let subcategoryId: string | null = null;
          let brandId: string | null = null;

          if (mapped.category) {
            const { data: cat } = await supabase.from('categories').select('id').eq('name', mapped.category).maybeSingle();
            if (cat) { categoryId = cat.id; }
            else {
              const { data: newCat } = await supabase.from('categories').insert({ name: mapped.category }).select('id').single();
              categoryId = newCat?.id || null;
            }
          }

          if (mapped.subcategory && categoryId) {
            const { data: sub } = await supabase.from('subcategories').select('id').eq('category_id', categoryId).eq('name', mapped.subcategory).maybeSingle();
            if (sub) { subcategoryId = sub.id; }
            else {
              const { data: newSub } = await supabase.from('subcategories').insert({ category_id: categoryId, name: mapped.subcategory }).select('id').single();
              subcategoryId = newSub?.id || null;
            }
          }

          if (mapped.brand) {
            const { data: br } = await supabase.from('brands').select('id').eq('name', mapped.brand).maybeSingle();
            if (br) { brandId = br.id; }
            else {
              const { data: newBr } = await supabase.from('brands').insert({ name: mapped.brand }).select('id').single();
              brandId = newBr?.id || null;
            }
          }

          const productData: any = {
            name: mapped.name, description: mapped.description || null,
            category_id: categoryId, subcategory_id: subcategoryId, brand_id: brandId,
            sku: mapped.sku || null, oem: mapped.oem || null, reference: mapped.reference || mapped.sku || null,
            barcode: mapped.barcode || null, image_url: mapped.image_url || null,
            weight: mapped.weight || null, length: mapped.length || null, width: mapped.width || null, height: mapped.height || null,
            purchase_price: mapped.purchase_price || 0, selling_price: mapped.selling_price || 0,
            tax_rate: mapped.tax_rate || 0, min_stock: mapped.min_stock || 0, max_stock: mapped.max_stock || 0,
            status: mapped.status || 'active',
            tags: mapped.tags ? String(mapped.tags).split(/[,;]/).map((t: string) => t.trim()).filter(Boolean) : null,
            notes: mapped.notes || null,
          };

          let productId: string;

          if (existing) {
            const { data: upd, error } = await supabase.from('products').update(productData).eq('id', existing.id).select('id').single();
            if (error) throw error;
            productId = upd.id;
            updated++;
          } else {
            const { data: ins, error } = await supabase.from('products').insert(productData).select('id').single();
            if (error) throw error;
            productId = ins.id;
            imported++;
          }

          if (mapped.stock != null && mapped.stock > 0) {
            const { data: wh } = await supabase.from('warehouses').select('id').limit(1).maybeSingle();
            if (wh) {
              const { data: inv } = await supabase.from('inventory').select('id, quantity').eq('product_id', productId).eq('warehouse_id', wh.id).maybeSingle();
              if (inv) {
                await supabase.from('inventory').update({ quantity: (inv as any).quantity + mapped.stock, shelf: mapped.shelf || null }).eq('id', (inv as any).id);
              } else {
                await supabase.from('inventory').insert({ product_id: productId, warehouse_id: wh.id, quantity: mapped.stock, shelf: mapped.shelf || null });
              }
              await supabase.from('stock_movements').insert({ product_id: productId, warehouse_id: wh.id, movement_type: 'in', quantity: mapped.stock, reference: `Import ${fileName}`, notes: 'Excel import' });
            }
          }

          if (mapped.vehicle_make && mapped.vehicle_model) {
            const { data: mk } = await supabase.from('vehicle_makes').select('id').eq('name', mapped.vehicle_make).maybeSingle();
            let makeId = mk?.id;
            if (!makeId) { const { data: nm } = await supabase.from('vehicle_makes').insert({ name: mapped.vehicle_make }).select('id').single(); makeId = nm?.id; }
            if (makeId) {
              const { data: md } = await supabase.from('vehicle_models').select('id').eq('make_id', makeId).eq('name', mapped.vehicle_model).maybeSingle();
              let modelId = md?.id;
              if (!modelId) { const { data: nmd } = await supabase.from('vehicle_models').insert({ make_id: makeId, name: mapped.vehicle_model }).select('id').single(); modelId = nmd?.id; }
              if (modelId) {
                let generationId: string | null = null;
                if (mapped.vehicle_generation) {
                  const { data: gn } = await supabase.from('vehicle_generations').select('id').eq('model_id', modelId).eq('name', mapped.vehicle_generation).maybeSingle();
                  if (gn) { generationId = gn.id; }
                  else { const { data: ngn } = await supabase.from('vehicle_generations').insert({ model_id: modelId, name: mapped.vehicle_generation, year_start: mapped.year_start || null, year_end: mapped.year_end || null }).select('id').single(); generationId = ngn?.id || null; }
                }
                await supabase.from('compatibility').insert({ product_id: productId, vehicle_make_id: makeId, vehicle_model_id: modelId, vehicle_generation_id: generationId, year_start: mapped.year_start || null, year_end: mapped.year_end || null });
              }
            }
          }
        } catch (err) {
          errors++;
          errorDetails.push(`Row ${i + j + 2}: ${(err as Error).message}`);
        }
      }

      setImportProgress(Math.round(((i + batchSize) / total) * 100));
    }

    setImportStatus('Finalisation...');
    await supabase.from('activity_logs').insert({ action: 'excel_import', entity: 'products', detail: `Imported ${imported}, updated ${updated}, errors ${errors}` });
    await supabase.from('notifications').insert({ type: 'import_completed', title: 'Excel Import Completed', body: `${imported} new, ${updated} updated, ${errors} errors`, link: '/products' });

    setSummary({ imported, updated, errors, warnings, skipped, duration: Math.round((Date.now() - start) / 1000), errorDetails });
    setStep('summary');
  };

  const downloadReport = () => {
    if (!summary) return;
    const lines = [
      'Rapport d\'import', '============', `Fichier: ${fileName}`, `Date: ${new Date().toLocaleString('fr-FR')}`, `Durée: ${summary.duration}s`, '',
      `Produits importés: ${summary.imported}`, `Produits mis à jour: ${summary.updated}`,
      `Erreurs: ${summary.errors}`, `Avertissements: ${summary.warnings}`, `Lignes ignorées: ${summary.skipped}`, '',
      'Détails des erreurs:', ...(summary.errorDetails.length ? summary.errorDetails : ['Aucune']),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `import-report-${Date.now()}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Assistant d'import Excel</h1>
        <p className="text-sm text-muted-foreground">Importez votre catalogue de pièces automobiles depuis Excel ou CSV</p>
      </div>

      <div className="flex items-center justify-between">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center flex-1">
            <div className={`flex flex-col items-center ${step === s.key ? 'text-primary' : currentNum > s.num ? 'text-green-500' : 'text-muted-foreground'}`}>
              <div className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-medium border-2 ${step === s.key ? 'border-primary bg-primary text-primary-foreground' : currentNum > s.num ? 'border-green-500 bg-green-500 text-white' : 'border-muted'}`}>
                {currentNum > s.num ? <CheckCircle2 className="h-5 w-5" /> : s.num}
              </div>
              <span className="text-xs mt-1 hidden sm:block">{s.label}</span>
            </div>
            {i < steps.length - 1 && <div className="flex-1 h-0.5 bg-muted mx-2" />}
          </div>
        ))}
      </div>

      {step === 'upload' && (
        <Card>
          <CardContent className="p-6">
            <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'}`}>
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">{isDragActive ? 'Déposez le fichier ici' : 'Glissez-déposez votre fichier Excel'}</p>
              <p className="text-sm text-muted-foreground mt-1">Formats supportés: XLSX, XLS, CSV</p>
              <p className="text-xs text-muted-foreground mt-2">Fichiers volumineux supportés (100 000+ lignes)</p>
            </div>
            {parseError && <div className="mt-4 flex items-center gap-2 text-sm text-red-500"><AlertCircle className="h-4 w-4" /> {parseError}</div>}
            <div className="mt-6 p-4 rounded-lg bg-muted/50">
              <p className="text-sm font-medium mb-2 flex items-center gap-2"><FileSpreadsheet className="h-4 w-4" /> Colonnes attendues (auto-détectées):</p>
              <div className="flex flex-wrap gap-1.5">
                {FIELD_DEFS.slice(0, 12).map((f) => <Badge key={f.key} variant="outline" className="text-xs">{f.label}</Badge>)}
                <Badge variant="outline" className="text-xs">+{FIELD_DEFS.length - 12} more</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'preview' && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center justify-between"><span>Aperçu du fichier: {fileName}</span><Badge>{rows.length.toLocaleString('fr-FR')} lignes</Badge></CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader><TableRow>{headers.slice(0, 8).map((h) => <TableHead key={h} className="whitespace-nowrap">{h}</TableHead>)}</TableRow></TableHeader>
                  <TableBody>
                    {rows.slice(0, 5).map((row, i) => (
                      <TableRow key={i}>{headers.slice(0, 8).map((h) => <TableCell key={h} className="text-xs max-w-[160px] truncate">{String(row[h] || '')}</TableCell>)}</TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Affichage des 5 premières lignes sur {rows.length.toLocaleString('fr-FR')}</p>
            </CardContent>
          </Card>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep('upload')}><ArrowLeft className="mr-2 h-4 w-4" /> Retour</Button>
            <Button onClick={() => setStep('mapping')}>Vérifier la correspondance <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </div>
        </div>
      )}

      {step === 'mapping' && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Correspondance des colonnes</CardTitle><p className="text-sm text-muted-foreground">Les colonnes ont été auto-correspondées. Ajustez si nécessaire.</p></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {headers.map((header) => (
                  <div key={header} className="flex items-center gap-3 py-1.5">
                    <div className="w-1/3 text-sm font-medium truncate">{header}</div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    <Select value={mapping[header] || '__none__'} onValueChange={(v) => setMapping({ ...mapping, [header]: v === '__none__' ? null : v as FieldKey })}>
                      <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">— Ignorer —</SelectItem>
                        {FIELD_DEFS.map((f) => <SelectItem key={f.key} value={f.key}>{f.label}{f.required ? ' *' : ''}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep('preview')}><ArrowLeft className="mr-2 h-4 w-4" /> Retour</Button>
            <Button onClick={runValidation}>Valider les données <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </div>
        </div>
      )}

      {step === 'validation' && validation && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2">{validation.valid ? <><CheckCircle2 className="h-5 w-5 text-green-500" /> Validation réussie</> : <><AlertCircle className="h-5 w-5 text-red-500" /> Problèmes de validation détectés</>}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 rounded-lg bg-red-500/10"><p className="text-2xl font-bold text-red-500">{validation.errors.length}</p><p className="text-xs text-muted-foreground">Erreurs</p></div>
                <div className="text-center p-3 rounded-lg bg-amber-500/10"><p className="text-2xl font-bold text-amber-500">{validation.warnings.length}</p><p className="text-xs text-muted-foreground">Avertissements</p></div>
                <div className="text-center p-3 rounded-lg bg-green-500/10"><p className="text-2xl font-bold text-green-500">{rows.length - validation.errors.length}</p><p className="text-xs text-muted-foreground">Lignes valides</p></div>
              </div>
              {validation.errors.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2 text-red-500">Erreurs:</p>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {validation.errors.slice(0, 20).map((e, i) => <p key={i} className="text-xs text-muted-foreground">Row {e.row}: {e.message}</p>)}
                    {validation.errors.length > 20 && <p className="text-xs text-muted-foreground">...et {validation.errors.length - 20} autres</p>}
                  </div>
                </div>
              )}
              {validation.warnings.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2 text-amber-500">Avertissements:</p>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {validation.warnings.slice(0, 15).map((w, i) => <p key={i} className="text-xs text-muted-foreground">Row {w.row}: {w.message}</p>)}
                  </div>
                </div>
              )}
              <p className="text-sm text-muted-foreground">{validation.valid ? 'Toutes les lignes ont passé la validation. Vous pouvez procéder à l\'import.' : 'Les lignes avec erreurs seront ignorées pendant l\'import. Les avertissements sont informatifs.'}</p>
            </CardContent>
          </Card>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep('mapping')}><ArrowLeft className="mr-2 h-4 w-4" /> Retour</Button>
            <Button onClick={doImport} disabled={rows.length === 0}><Database className="mr-2 h-4 w-4" /> Démarrer l\'import ({rows.length} lignes)</Button>
          </div>
        </div>
      )}

      {step === 'import' && (
        <Card>
          <CardContent className="p-8 space-y-4">
            <div className="text-center"><Loader2 className="h-12 w-12 mx-auto animate-spin text-primary mb-4" /><p className="text-lg font-medium">{importStatus}</p></div>
            <Progress value={importProgress} className="h-2" />
            <p className="text-center text-sm text-muted-foreground">{importProgress}% complété</p>
          </CardContent>
        </Card>
      )}

      {step === 'summary' && summary && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-500" /> Import terminé</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <SummaryStat label="Importés" value={summary.imported} color="text-green-500" />
                <SummaryStat label="Mis à jour" value={summary.updated} color="text-blue-500" />
                <SummaryStat label="Erreurs" value={summary.errors} color="text-red-500" />
                <SummaryStat label="Avertissements" value={summary.warnings} color="text-amber-500" />
                <SummaryStat label="Ignorés" value={summary.skipped} color="text-muted-foreground" />
                <SummaryStat label="Durée" value={`${summary.duration}s`} color="text-muted-foreground" />
              </div>
              {summary.errorDetails.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2 text-red-500">Détails des erreurs:</p>
                  <div className="max-h-40 overflow-y-auto space-y-1 p-3 rounded-lg bg-muted">
                    {summary.errorDetails.slice(0, 30).map((e, i) => <p key={i} className="text-xs text-muted-foreground">{e}</p>)}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          <div className="flex justify-between">
            <Button variant="outline" onClick={downloadReport}><Download className="mr-2 h-4 w-4" /> Télécharger le rapport</Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setStep('upload'); setRows([]); setSummary(null); }}><RefreshCw className="mr-2 h-4 w-4" /> Nouvel import</Button>
              <a href="/products"><Button>Voir les produits</Button></a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryStat({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="text-center p-4 rounded-lg border">
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
