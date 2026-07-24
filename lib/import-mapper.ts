export type FieldKey =
  | 'name' | 'description' | 'category' | 'subcategory' | 'brand'
  | 'oem' | 'reference' | 'sku' | 'barcode' | 'image_url'
  | 'purchase_price' | 'selling_price' | 'tax_rate'
  | 'weight' | 'length' | 'width' | 'height'
  | 'min_stock' | 'max_stock' | 'stock' | 'warehouse' | 'shelf'
  | 'vehicle_make' | 'vehicle_model' | 'vehicle_generation'
  | 'engine' | 'fuel_type' | 'transmission' | 'year_start' | 'year_end'
  | 'tags' | 'notes' | 'status';

export type FieldDef = {
  key: FieldKey;
  label: string;
  aliases: string[];
  required?: boolean;
  type: 'text' | 'number' | 'price';
};

export const FIELD_DEFS: FieldDef[] = [
  { key: 'name', label: 'Product Name', aliases: ['name', 'product', 'product name', 'designation', 'libelle', 'titre', 'nom', 'description courte', 'designation'], required: true, type: 'text' },
  { key: 'description', label: 'Description', aliases: ['description', 'detail', 'details', 'long description', 'descriptif'], type: 'text' },
  { key: 'category', label: 'Category', aliases: ['category', 'categorie', 'cat', 'type', 'section', 'rayon'], type: 'text' },
  { key: 'subcategory', label: 'Subcategory', aliases: ['subcategory', 'sous categorie', 'sous-categorie', 'sub cat', 'sous rayon'], type: 'text' },
  { key: 'brand', label: 'Brand', aliases: ['brand', 'marque', 'fabricant', 'manufacturer', 'make', 'marque du produit', 'marque produit'], type: 'text' },
  { key: 'oem', label: 'OEM Number', aliases: ['oem', 'oem number', 'oem no', 'oem ref', 'numero oem', 'original equipment', 'oe number', 'oe'], type: 'text' },
  { key: 'reference', label: 'Reference', aliases: ['reference', 'ref', 'reference number', 'ref no', 'part number', 'part no', 'numero piece', 'code piece'], type: 'text' },
  { key: 'sku', label: 'Internal SKU', aliases: ['sku', 'code', 'internal ref', 'internal reference', 'code interne', 'reference interne', 'code piece', 'code produit'], type: 'text' },
  { key: 'barcode', label: 'Barcode', aliases: ['barcode', 'ean', 'ean13', 'upc', 'code barre', 'code a barres', 'gtin'], type: 'text' },
  { key: 'image_url', label: 'Image URL', aliases: ['image', 'image url', 'image link', 'photo', 'picture', 'img', 'lien image'], type: 'text' },
  { key: 'purchase_price', label: 'Purchase Price', aliases: ['purchase price', 'cost', 'cost price', 'prix achat', 'prix d achat', 'prix de revient', 'pa'], type: 'price' },
  { key: 'selling_price', label: 'Selling Price', aliases: ['selling price', 'sale price', 'price', 'prix vente', 'prix de vente', 'pv', 'tarif', 'prix ttc', 'prix ttc tnd', 'prix ttc tnd', 'prix'], type: 'price' },
  { key: 'tax_rate', label: 'Tax Rate', aliases: ['tax', 'tax rate', 'vat', 'tva', 'taxe'], type: 'number' },
  { key: 'weight', label: 'Weight', aliases: ['weight', 'poids', 'masse'], type: 'number' },
  { key: 'length', label: 'Length', aliases: ['length', 'longueur', 'long'], type: 'number' },
  { key: 'width', label: 'Width', aliases: ['width', 'largeur', 'larg'], type: 'number' },
  { key: 'height', label: 'Height', aliases: ['height', 'hauteur', 'haut'], type: 'number' },
  { key: 'min_stock', label: 'Min Stock', aliases: ['min stock', 'minimum stock', 'stock min', 'seuil', 'reorder point', 'stock minimum'], type: 'number' },
  { key: 'max_stock', label: 'Max Stock', aliases: ['max stock', 'maximum stock', 'stock max', 'stock maximum'], type: 'number' },
  { key: 'stock', label: 'Current Stock', aliases: ['stock', 'quantity', 'qty', 'quantite', 'qte', 'stock actuel', 'in stock', 'available stock'], type: 'number' },
  { key: 'warehouse', label: 'Warehouse', aliases: ['warehouse', 'entrepot', 'depot', 'store', 'magasin'], type: 'text' },
  { key: 'shelf', label: 'Shelf/Location', aliases: ['shelf', 'location', 'emplacement', 'allee', 'rack', 'bin', 'position'], type: 'text' },
  { key: 'vehicle_make', label: 'Vehicle Make', aliases: ['vehicle make', 'make', 'constructeur', 'marque vehicule', 'auto', 'vehicule marque', 'marque constructeur'], type: 'text' },
  { key: 'vehicle_model', label: 'Vehicle Model', aliases: ['vehicle model', 'model', 'modele', 'modele vehicule', 'modeles'], type: 'text' },
  { key: 'vehicle_generation', label: 'Vehicle Generation', aliases: ['generation', 'gen', 'version', 'phase', 'serie'], type: 'text' },
  { key: 'engine', label: 'Engine', aliases: ['engine', 'moteur', 'motor', 'motorisation', 'engine code', 'code moteur'], type: 'text' },
  { key: 'fuel_type', label: 'Fuel Type', aliases: ['fuel', 'fuel type', 'carburant', 'essence', 'diesel', 'energie'], type: 'text' },
  { key: 'transmission', label: 'Transmission', aliases: ['transmission', 'boite', 'gearbox', 'boite de vitesses'], type: 'text' },
  { key: 'year_start', label: 'Year Start', aliases: ['year start', 'from year', 'annee debut', 'annee min', 'debut', 'year from'], type: 'number' },
  { key: 'year_end', label: 'Year End', aliases: ['year end', 'to year', 'annee fin', 'annee max', 'fin', 'year to'], type: 'number' },
  { key: 'tags', label: 'Tags', aliases: ['tags', 'etiquettes', 'mots cles', 'keywords', 'labels'], type: 'text' },
  { key: 'notes', label: 'Notes', aliases: ['notes', 'remarque', 'remarques', 'commentaire', 'comments'], type: 'text' },
  { key: 'status', label: 'Status', aliases: ['status', 'statut', 'etat', 'active'], type: 'text' },
];

function normalize(s: string): string {
  return s
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // strip accents (é -> e, ç -> c, etc.) instead of deleting the letter
    .toLowerCase().trim().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').replace(/[^a-z0-9 ]/g, '').trim();
}

function similarity(a: string, b: string): number {
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) return 0.9;
  const wordsA = na.split(' ');
  const wordsB = nb.split(' ');
  const setB = new Set(wordsB);
  const intersection = wordsA.filter((w) => setB.has(w)).length;
  const unionSet = new Set<string>();
  for (const w of wordsA) unionSet.add(w);
  for (const w of wordsB) unionSet.add(w);
  const union = unionSet.size;
  return union > 0 ? intersection / union : 0;
}

export function autoMapColumns(headers: string[]): Record<string, FieldKey | null> {
  const mapping: Record<string, FieldKey | null> = {};
  const usedFields = new Set<FieldKey>();

  for (const header of headers) {
    let best: { field: FieldKey; score: number } | null = null;
    for (const def of FIELD_DEFS) {
      if (usedFields.has(def.key)) continue;
      const score = similarity(header, def.label);
      let aliasScore = score;
      for (const alias of def.aliases) {
        aliasScore = Math.max(aliasScore, similarity(header, alias));
      }
      if (!best || aliasScore > best.score) {
        best = { field: def.key, score: aliasScore };
      }
    }
    if (best && best.score >= 0.5) {
      mapping[header] = best.field;
      usedFields.add(best.field);
    } else {
      mapping[header] = null;
    }
  }
  return mapping;
}

export function parseValue(raw: any, type: 'text' | 'number' | 'price'): any {
  if (raw == null || raw === '') return null;
  if (type === 'number') {
    const n = typeof raw === 'number' ? raw : parseFloat(String(raw).replace(/[^\d.-]/g, ''));
    return isNaN(n) ? null : n;
  }
  if (type === 'price') {
    const n = typeof raw === 'number' ? raw : parseFloat(String(raw).replace(/[^\d.-]/g, ''));
    return isNaN(n) ? null : Math.round(n * 100) / 100;
  }
  return String(raw).trim();
}
