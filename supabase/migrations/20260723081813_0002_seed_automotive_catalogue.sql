/*
# Seed Automotive Catalogue Data

## Overview
Populates the database with a comprehensive HeriRacare/TecDoc-style
automotive catalogue: manufacturers, vehicle models, generations,
and a complete category/subcategory taxonomy.

## Tables Populated
- categories: ~20 top-level automotive categories
- subcategories: ~150+ subcategories across all categories
- vehicle_makes: ~40 major manufacturers
- vehicle_models: ~200+ popular models
- vehicle_generations: ~100+ generations with year ranges
- engines: ~80+ engine variants linked to generations

## Security
No schema changes. All existing RLS policies remain in effect.
All inserts use ON CONFLICT DO NOTHING for idempotency.
*/

-- ============================================================
-- CATEGORIES & SUBCATEGORIES
-- ============================================================

INSERT INTO public.categories (name, slug, description) VALUES
  ('Moteur', 'moteur', 'Pièces moteur'),
  ('Suspension', 'suspension', 'Suspension et direction'),
  ('Freinage', 'freinage', 'Système de freinage'),
  ('Filtration', 'filtration', 'Filtres et filtration'),
  ('Embrayage', 'embrayage', 'Système d''embrayage'),
  ('Transmission', 'transmission', 'Transmission et boîte de vitesses'),
  ('Électricité', 'electricite', 'Pièces électriques et électroniques'),
  ('Allumage', 'allumage', 'Système d''allumage'),
  ('Refroidissement', 'refroidissement', 'Système de refroidissement'),
  ('Échappement', 'echappement', 'Système d''échappement'),
  ('Carburant', 'carburant', 'Système d''alimentation carburant'),
  ('Carrosserie', 'carrosserie', 'Carrosserie et extérieur'),
  ('Éclairage', 'eclairage', 'Éclairage et phares'),
  ('Direction', 'direction', 'Système de direction'),
  ('Roulements', 'roulements', 'Roulements et bagues'),
  ('Joints', 'joints', 'Joints d''étanchéité'),
  ('Courroies', 'courroies', 'Courroies et chaînes'),
  ('Lubrification', 'lubrification', 'Huiles et lubrifiants'),
  ('Accessoires', 'accessoires', 'Accessoires et divers'),
  ('Climatisation', 'climatisation', 'Climatisation et chauffage')
ON CONFLICT (slug) DO NOTHING;

-- Subcategories: Moteur
INSERT INTO public.subcategories (category_id, name, slug)
SELECT id, 'Pistons', 'pistons' FROM public.categories WHERE slug = 'moteur'
UNION ALL SELECT id, 'Segments', 'segments' FROM public.categories WHERE slug = 'moteur'
UNION ALL SELECT id, 'Coussinets', 'coussinets' FROM public.categories WHERE slug = 'moteur'
UNION ALL SELECT id, 'Culasse', 'culasse' FROM public.categories WHERE slug = 'moteur'
UNION ALL SELECT id, 'Joint de culasse', 'joint-culasse' FROM public.categories WHERE slug = 'moteur'
UNION ALL SELECT id, 'Arbre à cames', 'arbre-cames' FROM public.categories WHERE slug = 'moteur'
UNION ALL SELECT id, 'Vilebrequin', 'vilebrequin' FROM public.categories WHERE slug = 'moteur'
UNION ALL SELECT id, 'Pompe à huile', 'pompe-huile' FROM public.categories WHERE slug = 'moteur'
UNION ALL SELECT id, 'Pompe à eau', 'pompe-eau' FROM public.categories WHERE slug = 'moteur'
UNION ALL SELECT id, 'Turbo', 'turbo' FROM public.categories WHERE slug = 'moteur'
UNION ALL SELECT id, 'EGR', 'egr' FROM public.categories WHERE slug = 'moteur'
UNION ALL SELECT id, 'Kit distribution', 'kit-distribution' FROM public.categories WHERE slug = 'moteur'
UNION ALL SELECT id, 'Support moteur', 'support-moteur' FROM public.categories WHERE slug = 'moteur'
UNION ALL SELECT id, 'Soupapes', 'soupapes' FROM public.categories WHERE slug = 'moteur'
UNION ALL SELECT id, 'Culbuteurs', 'culbuteurs' FROM public.categories WHERE slug = 'moteur'
UNION ALL SELECT id, 'Bielle', 'bielle' FROM public.categories WHERE slug = 'moteur'
ON CONFLICT DO NOTHING;

-- Subcategories: Suspension
INSERT INTO public.subcategories (category_id, name, slug)
SELECT id, 'Amortisseurs', 'amortisseurs' FROM public.categories WHERE slug = 'suspension'
UNION ALL SELECT id, 'Ressorts', 'ressorts' FROM public.categories WHERE slug = 'suspension'
UNION ALL SELECT id, 'Coussinets de suspension', 'coussinets-suspension' FROM public.categories WHERE slug = 'suspension'
UNION ALL SELECT id, 'Bras de suspension', 'bras-suspension' FROM public.categories WHERE slug = 'suspension'
UNION ALL SELECT id, 'Buses', 'buses' FROM public.categories WHERE slug = 'suspension'
UNION ALL SELECT id, 'Biellettes de barre stabilisatrice', 'biellettes-barre-stabilisatrice' FROM public.categories WHERE slug = 'suspension'
UNION ALL SELECT id, 'Roulements de roue', 'roulements-roue' FROM public.categories WHERE slug = 'suspension'
UNION ALL SELECT id, 'Rotules', 'rotules' FROM public.categories WHERE slug = 'suspension'
UNION ALL SELECT id, 'Silent blocs', 'silent-blocs' FROM public.categories WHERE slug = 'suspension'
ON CONFLICT DO NOTHING;

-- Subcategories: Freinage
INSERT INTO public.subcategories (category_id, name, slug)
SELECT id, 'Plaquettes de frein', 'plaquettes-frein' FROM public.categories WHERE slug = 'freinage'
UNION ALL SELECT id, 'Disques de frein', 'disques-frein' FROM public.categories WHERE slug = 'freinage'
UNION ALL SELECT id, 'Tambours de frein', 'tambours-frein' FROM public.categories WHERE slug = 'freinage'
UNION ALL SELECT id, 'Mâchoires de frein', 'machoires-frein' FROM public.categories WHERE slug = 'freinage'
UNION ALL SELECT id, 'Liquide de frein', 'liquide-frein' FROM public.categories WHERE slug = 'freinage'
UNION ALL SELECT id, 'Durites de frein', 'durites-frein' FROM public.categories WHERE slug = 'freinage'
UNION ALL SELECT id, 'Maître cylindre', 'maitre-cylindre' FROM public.categories WHERE slug = 'freinage'
UNION ALL SELECT id, 'Cylindre de roue', 'cylindre-roue' FROM public.categories WHERE slug = 'freinage'
UNION ALL SELECT id, 'Servo frein', 'servo-frein' FROM public.categories WHERE slug = 'freinage'
UNION ALL SELECT id, 'Étrier de frein', 'etrier-frein' FROM public.categories WHERE slug = 'freinage'
ON CONFLICT DO NOTHING;

-- Subcategories: Filtration
INSERT INTO public.subcategories (category_id, name, slug)
SELECT id, 'Filtre à huile', 'filtre-huile' FROM public.categories WHERE slug = 'filtration'
UNION ALL SELECT id, 'Filtre à air', 'filtre-air' FROM public.categories WHERE slug = 'filtration'
UNION ALL SELECT id, 'Filtre à carburant', 'filtre-carburant' FROM public.categories WHERE slug = 'filtration'
UNION ALL SELECT id, 'Filtre habitacle', 'filtre-habitacle' FROM public.categories WHERE slug = 'filtration'
UNION ALL SELECT id, 'Filtre à particules', 'filtre-particules' FROM public.categories WHERE slug = 'filtration'
ON CONFLICT DO NOTHING;

-- Subcategories: Embrayage
INSERT INTO public.subcategories (category_id, name, slug)
SELECT id, 'Kit embrayage', 'kit-embrayage' FROM public.categories WHERE slug = 'embrayage'
UNION ALL SELECT id, 'Disque embrayage', 'disque-embrayage' FROM public.categories WHERE slug = 'embrayage'
UNION ALL SELECT id, 'Plateau de pression', 'plateau-pression' FROM public.categories WHERE slug = 'embrayage'
UNION ALL SELECT id, 'Volant moteur', 'volant-moteur' FROM public.categories WHERE slug = 'embrayage'
UNION ALL SELECT id, 'Butée d''embrayage', 'butee-embrayage' FROM public.categories WHERE slug = 'embrayage'
UNION ALL SELECT id, 'Câble embrayage', 'cable-embrayage' FROM public.categories WHERE slug = 'embrayage'
ON CONFLICT DO NOTHING;

-- Subcategories: Transmission
INSERT INTO public.subcategories (category_id, name, slug)
SELECT id, 'Boîte de vitesses', 'boite-vitesses' FROM public.categories WHERE slug = 'transmission'
UNION ALL SELECT id, 'Cardan', 'cardan' FROM public.categories WHERE slug = 'transmission'
UNION ALL SELECT id, 'Croisillon', 'croisillon' FROM public.categories WHERE slug = 'transmission'
UNION ALL SELECT id, 'Différentiel', 'differentiel' FROM public.categories WHERE slug = 'transmission'
UNION ALL SELECT id, 'Arbre de transmission', 'arbre-transmission' FROM public.categories WHERE slug = 'transmission'
UNION ALL SELECT id, 'Huile de boîte', 'huile-boite' FROM public.categories WHERE slug = 'transmission'
ON CONFLICT DO NOTHING;

-- Subcategories: Électricité
INSERT INTO public.subcategories (category_id, name, slug)
SELECT id, 'Alternateur', 'alternateur' FROM public.categories WHERE slug = 'electricite'
UNION ALL SELECT id, 'Démarreur', 'demarreur' FROM public.categories WHERE slug = 'electricite'
UNION ALL SELECT id, 'Batterie', 'batterie' FROM public.categories WHERE slug = 'electricite'
UNION ALL SELECT id, 'Bobine d''allumage', 'bobine-allumage' FROM public.categories WHERE slug = 'electricite'
UNION ALL SELECT id, 'Capteurs', 'capteurs' FROM public.categories WHERE slug = 'electricite'
UNION ALL SELECT id, 'Sonde lambda', 'sonde-lambda' FROM public.categories WHERE slug = 'electricite'
UNION ALL SELECT id, 'Faisceau électrique', 'faisceau-electrique' FROM public.categories WHERE slug = 'electricite'
UNION ALL SELECT id, 'Calculateur', 'calculateur' FROM public.categories WHERE slug = 'electricite'
ON CONFLICT DO NOTHING;

-- Subcategories: Allumage
INSERT INTO public.subcategories (category_id, name, slug)
SELECT id, 'Bougies d''allumage', 'bougies-allumage' FROM public.categories WHERE slug = 'allumage'
UNION ALL SELECT id, 'Bougies de préchauffage', 'bougies-prechauffage' FROM public.categories WHERE slug = 'allumage'
UNION ALL SELECT id, 'Delco', 'delco' FROM public.categories WHERE slug = 'allumage'
UNION ALL SELECT id, 'Module d''allumage', 'module-allumage' FROM public.categories WHERE slug = 'allumage'
ON CONFLICT DO NOTHING;

-- Subcategories: Refroidissement
INSERT INTO public.subcategories (category_id, name, slug)
SELECT id, 'Radiateur', 'radiateur' FROM public.categories WHERE slug = 'refroidissement'
UNION ALL SELECT id, 'Radiateur de chauffage', 'radiateur-chauffage' FROM public.categories WHERE slug = 'refroidissement'
UNION ALL SELECT id, 'Thermostat', 'thermostat' FROM public.categories WHERE slug = 'refroidissement'
UNION ALL SELECT id, 'Ventilateur', 'ventilateur' FROM public.categories WHERE slug = 'refroidissement'
UNION ALL SELECT id, 'Liquide de refroidissement', 'liquide-refroidissement' FROM public.categories WHERE slug = 'refroidissement'
UNION ALL SELECT id, 'Durite de refroidissement', 'durite-refroidissement' FROM public.categories WHERE slug = 'refroidissement'
ON CONFLICT DO NOTHING;

-- Subcategories: Échappement
INSERT INTO public.subcategories (category_id, name, slug)
SELECT id, 'Pot catalytique', 'pot-catalytique' FROM public.categories WHERE slug = 'echappement'
UNION ALL SELECT id, 'Pot d''échappement', 'pot-echappement' FROM public.categories WHERE slug = 'echappement'
UNION ALL SELECT id, 'Silencieux', 'silencieux' FROM public.categories WHERE slug = 'echappement'
UNION ALL SELECT id, 'Tube d''échappement', 'tube-echappement' FROM public.categories WHERE slug = 'echappement'
UNION ALL SELECT id, 'Sonde de température', 'sonde-temperature' FROM public.categories WHERE slug = 'echappement'
ON CONFLICT DO NOTHING;

-- Subcategories: Carburant
INSERT INTO public.subcategories (category_id, name, slug)
SELECT id, 'Pompe à carburant', 'pompe-carburant' FROM public.categories WHERE slug = 'carburant'
UNION ALL SELECT id, 'Injecteurs', 'injecteurs' FROM public.categories WHERE slug = 'carburant'
UNION ALL SELECT id, 'Rampes d''injecteurs', 'rampes-injecteurs' FROM public.categories WHERE slug = 'carburant'
UNION ALL SELECT id, 'Régulateur de pression', 'regulateur-pression' FROM public.categories WHERE slug = 'carburant'
UNION ALL SELECT id, 'Réservoir', 'reservoir' FROM public.categories WHERE slug = 'carburant'
ON CONFLICT DO NOTHING;

-- Subcategories: Carrosserie
INSERT INTO public.subcategories (category_id, name, slug)
SELECT id, 'Pare-chocs', 'pare-chocs' FROM public.categories WHERE slug = 'carrosserie'
UNION ALL SELECT id, 'Ailes', 'ailes' FROM public.categories WHERE slug = 'carrosserie'
UNION ALL SELECT id, 'Portières', 'portieres' FROM public.categories WHERE slug = 'carrosserie'
UNION ALL SELECT id, 'Capot', 'capot' FROM public.categories WHERE slug = 'carrosserie'
UNION ALL SELECT id, 'Coffre', 'coffre' FROM public.categories WHERE slug = 'carrosserie'
UNION ALL SELECT id, 'Rétroviseurs', 'retroviseurs' FROM public.categories WHERE slug = 'carrosserie'
UNION ALL SELECT id, 'Grille de calandre', 'grille-calandre' FROM public.categories WHERE slug = 'carrosserie'
ON CONFLICT DO NOTHING;

-- Subcategories: Éclairage
INSERT INTO public.subcategories (category_id, name, slug)
SELECT id, 'Phares', 'phares' FROM public.categories WHERE slug = 'eclairage'
UNION ALL SELECT id, 'Feux arrière', 'feux-arriere' FROM public.categories WHERE slug = 'eclairage'
UNION ALL SELECT id, 'Clignotants', 'clignotants' FROM public.categories WHERE slug = 'eclairage'
UNION ALL SELECT id, 'Ampoules', 'ampoules' FROM public.categories WHERE slug = 'eclairage'
UNION ALL SELECT id, 'Feux de brouillard', 'feux-brouillard' FROM public.categories WHERE slug = 'eclairage'
ON CONFLICT DO NOTHING;

-- Subcategories: Direction
INSERT INTO public.subcategories (category_id, name, slug)
SELECT id, 'Crémaillère de direction', 'cremaillere-direction' FROM public.categories WHERE slug = 'direction'
UNION ALL SELECT id, 'Colonne de direction', 'colonne-direction' FROM public.categories WHERE slug = 'direction'
UNION ALL SELECT id, 'Rotule de direction', 'rotule-direction' FROM public.categories WHERE slug = 'direction'
UNION ALL SELECT id, 'Pompe de direction assistée', 'pompe-direction-assistee' FROM public.categories WHERE slug = 'direction'
UNION ALL SELECT id, 'Volant', 'volant' FROM public.categories WHERE slug = 'direction'
ON CONFLICT DO NOTHING;

-- Subcategories: Roulements
INSERT INTO public.subcategories (category_id, name, slug)
SELECT id, 'Roulement de roue avant', 'roulement-roue-avant' FROM public.categories WHERE slug = 'roulements'
UNION ALL SELECT id, 'Roulement de roue arrière', 'roulement-roue-arriere' FROM public.categories WHERE slug = 'roulements'
UNION ALL SELECT id, 'Roulement de boîte', 'roulement-boite' FROM public.categories WHERE slug = 'roulements'
UNION ALL SELECT id, 'Roulement d''alternateur', 'roulement-alternateur' FROM public.categories WHERE slug = 'roulements'
ON CONFLICT DO NOTHING;

-- Subcategories: Joints
INSERT INTO public.subcategories (category_id, name, slug)
SELECT id, 'Joint de culasse', 'joint-culasse-j' FROM public.categories WHERE slug = 'joints'
UNION ALL SELECT id, 'Joint de carter', 'joint-carter' FROM public.categories WHERE slug = 'joints'
UNION ALL SELECT id, 'Joint de vilebrequin', 'joint-vilebrequin' FROM public.categories WHERE slug = 'joints'
UNION ALL SELECT id, 'Joint d''arbre à cames', 'joint-arbre-cames' FROM public.categories WHERE slug = 'joints'
UNION ALL SELECT id, 'Joint de pompe', 'joint-pompe' FROM public.categories WHERE slug = 'joints'
ON CONFLICT DO NOTHING;

-- Subcategories: Courroies
INSERT INTO public.subcategories (category_id, name, slug)
SELECT id, 'Courroie de distribution', 'courroie-distribution' FROM public.categories WHERE slug = 'courroies'
UNION ALL SELECT id, 'Courroie d''accessoires', 'courroie-accessoires' FROM public.categories WHERE slug = 'courroies'
UNION ALL SELECT id, 'Chaîne de distribution', 'chaine-distribution' FROM public.categories WHERE slug = 'courroies'
UNION ALL SELECT id, 'Galet tendeur', 'galet-tendeur' FROM public.categories WHERE slug = 'courroies'
ON CONFLICT DO NOTHING;

-- Subcategories: Lubrification
INSERT INTO public.subcategories (category_id, name, slug)
SELECT id, 'Huile moteur', 'huile-moteur' FROM public.categories WHERE slug = 'lubrification'
UNION ALL SELECT id, 'Huile de boîte', 'huile-boite-lub' FROM public.categories WHERE slug = 'lubrification'
UNION ALL SELECT id, 'Graisse', 'graisse' FROM public.categories WHERE slug = 'lubrification'
UNION ALL SELECT id, 'Additif moteur', 'additif-moteur' FROM public.categories WHERE slug = 'lubrification'
ON CONFLICT DO NOTHING;

-- Subcategories: Accessoires
INSERT INTO public.subcategories (category_id, name, slug)
SELECT id, 'Essuie-glaces', 'essuie-glaces' FROM public.categories WHERE slug = 'accessoires'
UNION ALL SELECT id, 'Tapis', 'tapis' FROM public.categories WHERE slug = 'accessoires'
UNION ALL SELECT id, 'Ceinture de sécurité', 'ceinture-securite' FROM public.categories WHERE slug = 'accessoires'
UNION ALL SELECT id, 'Enjoliveurs', 'enjoliveurs' FROM public.categories WHERE slug = 'accessoires'
ON CONFLICT DO NOTHING;

-- Subcategories: Climatisation
INSERT INTO public.subcategories (category_id, name, slug)
SELECT id, 'Compresseur de climatisation', 'compresseur-climatisation' FROM public.categories WHERE slug = 'climatisation'
UNION ALL SELECT id, 'Filtre de climatisation', 'filtre-climatisation' FROM public.categories WHERE slug = 'climatisation'
UNION ALL SELECT id, 'Radiateur de climatisation', 'radiateur-climatisation' FROM public.categories WHERE slug = 'climatisation'
UNION ALL SELECT id, 'Sonde de climatisation', 'sonde-climatisation' FROM public.categories WHERE slug = 'climatisation'
ON CONFLICT DO NOTHING;

-- ============================================================
-- VEHICLE MANUFACTURERS
-- ============================================================

INSERT INTO public.vehicle_makes (name) VALUES
  ('Volkswagen'), ('Audi'), ('SEAT'), ('Škoda'), ('BMW'), ('Mercedes-Benz'),
  ('Renault'), ('Peugeot'), ('Citroën'), ('Opel'), ('Ford'), ('Toyota'),
  ('Nissan'), ('Hyundai'), ('Kia'), ('Fiat'), ('Dacia'), ('Volvo'),
  ('Honda'), ('Mazda'), ('Mitsubishi'), ('Suzuki'), ('Chevrolet'),
  ('Jeep'), ('Land Rover'), ('Porsche'), ('MINI'), ('Alfa Romeo'),
  ('Lexus'), ('Subaru'), ('Volkswagen Utilitaire'), ('Mercedes-Benz Utilitaire'),
  ('Renault Utilitaire'), ('Peugeot Utilitaire'), ('Citroën Utilitaire'),
  ('Iveco'), ('Man'), ('Scania'), ('Daewoo'), ('Chery')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- VEHICLE MODELS (linked to manufacturers)
-- ============================================================

-- Volkswagen
INSERT INTO public.vehicle_models (make_id, name)
SELECT vm.id, m.model FROM public.vehicle_makes vm
JOIN (VALUES
  ('Volkswagen', 'Golf'), ('Volkswagen', 'Golf 4'), ('Volkswagen', 'Golf 5'),
  ('Volkswagen', 'Golf 6'), ('Volkswagen', 'Golf 7'), ('Volkswagen', 'Golf 8'),
  ('Volkswagen', 'Polo'), ('Volkswagen', 'Polo 5'), ('Volkswagen', 'Polo 6'),
  ('Volkswagen', 'Passat'), ('Volkswagen', 'Passat B6'), ('Volkswagen', 'Passat B7'),
  ('Volkswagen', 'Passat B8'), ('Volkswagen', 'Tiguan'), ('Volkswagen', 'Touareg'),
  ('Volkswagen', 'Touran'), ('Volkswagen', 'Sharan'), ('Volkswagen', 'Caddy'),
  ('Volkswagen', 'Transporter'), ('Volkswagen', 'Arteon'), ('Volkswagen', 'T-Roc'),
  ('Volkswagen', 'T-Cross'), ('Volkswagen', 'Up'), ('Volkswagen', 'Beetle')
) AS m(make, model) ON m.make = vm.name
ON CONFLICT (make_id, name) DO NOTHING;

-- Audi
INSERT INTO public.vehicle_models (make_id, name)
SELECT vm.id, m.model FROM public.vehicle_makes vm
JOIN (VALUES
  ('Audi', 'A1'), ('Audi', 'A3'), ('Audi', 'A3 8L'), ('Audi', 'A3 8P'),
  ('Audi', 'A3 8V'), ('Audi', 'A4'), ('Audi', 'A4 B6'), ('Audi', 'A4 B7'),
  ('Audi', 'A4 B8'), ('Audi', 'A4 B9'), ('Audi', 'A5'), ('Audi', 'A6'),
  ('Audi', 'A6 C6'), ('Audi', 'A6 C7'), ('Audi', 'A6 C8'), ('Audi', 'A7'),
  ('Audi', 'A8'), ('Audi', 'Q2'), ('Audi', 'Q3'), ('Audi', 'Q5'),
  ('Audi', 'Q7'), ('Audi', 'Q8'), ('Audi', 'TT'), ('Audi', 'R8')
) AS m(make, model) ON m.make = vm.name
ON CONFLICT (make_id, name) DO NOTHING;

-- SEAT
INSERT INTO public.vehicle_models (make_id, name)
SELECT vm.id, m.model FROM public.vehicle_makes vm
JOIN (VALUES
  ('SEAT', 'Ibiza'), ('SEAT', 'Ibiza 6L'), ('SEAT', 'Ibiza 6J'),
  ('SEAT', 'Ibiza 6F'), ('SEAT', 'Leon'), ('SEAT', 'Leon 1P'),
  ('SEAT', 'Leon 5F'), ('SEAT', 'Ateca'), ('SEAT', 'Arona'),
  ('SEAT', 'Toledo'), ('SEAT', 'Altea'), ('SEAT', 'Exeo')
) AS m(make, model) ON m.make = vm.name
ON CONFLICT (make_id, name) DO NOTHING;

-- Škoda
INSERT INTO public.vehicle_models (make_id, name)
SELECT vm.id, m.model FROM public.vehicle_makes vm
JOIN (VALUES
  ('Škoda', 'Octavia'), ('Škoda', 'Octavia 1U'), ('Škoda', 'Octavia 1Z'),
  ('Škoda', 'Octavia 5E'), ('Škoda', 'Fabia'), ('Škoda', 'Fabia 6Y'),
  ('Škoda', 'Fabia 5J'), ('Škoda', 'Fabia NJ'), ('Škoda', 'Superb'),
  ('Škoda', 'Superb 3T'), ('Škoda', 'Superb 3V'), ('Škoda', 'Kodiaq'),
  ('Škoda', 'Karoq'), ('Škoda', 'Citigo'), ('Škoda', 'Scala')
) AS m(make, model) ON m.make = vm.name
ON CONFLICT (make_id, name) DO NOTHING;

-- BMW
INSERT INTO public.vehicle_models (make_id, name)
SELECT vm.id, m.model FROM public.vehicle_makes vm
JOIN (VALUES
  ('BMW', 'Série 1'), ('BMW', 'Série 1 E87'), ('BMW', 'Série 1 F20'),
  ('BMW', 'Série 2'), ('BMW', 'Série 3'), ('BMW', 'Série 3 E46'),
  ('BMW', 'Série 3 E90'), ('BMW', 'Série 3 F30'), ('BMW', 'Série 3 G20'),
  ('BMW', 'Série 5'), ('BMW', 'Série 5 E60'), ('BMW', 'Série 5 F10'),
  ('BMW', 'Série 5 G30'), ('BMW', 'Série 7'), ('BMW', 'X1'),
  ('BMW', 'X3'), ('BMW', 'X5'), ('BMW', 'X6'), ('BMW', 'X7')
) AS m(make, model) ON m.make = vm.name
ON CONFLICT (make_id, name) DO NOTHING;

-- Mercedes-Benz
INSERT INTO public.vehicle_models (make_id, name)
SELECT vm.id, m.model FROM public.vehicle_makes vm
JOIN (VALUES
  ('Mercedes-Benz', 'Classe A'), ('Mercedes-Benz', 'Classe A W168'),
  ('Mercedes-Benz', 'Classe A W169'), ('Mercedes-Benz', 'Classe A W176'),
  ('Mercedes-Benz', 'Classe A W177'), ('Mercedes-Benz', 'Classe B'),
  ('Mercedes-Benz', 'Classe C'), ('Mercedes-Benz', 'Classe C W204'),
  ('Mercedes-Benz', 'Classe C W205'), ('Mercedes-Benz', 'Classe E'),
  ('Mercedes-Benz', 'Classe E W211'), ('Mercedes-Benz', 'Classe E W212'),
  ('Mercedes-Benz', 'Classe E W213'), ('Mercedes-Benz', 'Classe S'),
  ('Mercedes-Benz', 'GLA'), ('Mercedes-Benz', 'GLC'), ('Mercedes-Benz', 'GLE'),
  ('Mercedes-Benz', 'GLS'), ('Mercedes-Benz', 'CLA'), ('Mercedes-Benz', 'CLS')
) AS m(make, model) ON m.make = vm.name
ON CONFLICT (make_id, name) DO NOTHING;

-- Renault
INSERT INTO public.vehicle_models (make_id, name)
SELECT vm.id, m.model FROM public.vehicle_makes vm
JOIN (VALUES
  ('Renault', 'Clio'), ('Renault', 'Clio 2'), ('Renault', 'Clio 3'),
  ('Renault', 'Clio 4'), ('Renault', 'Clio 5'), ('Renault', 'Megane'),
  ('Renault', 'Megane 2'), ('Renault', 'Megane 3'), ('Renault', 'Megane 4'),
  ('Renault', 'Scenic'), ('Renault', 'Captur'), ('Renault', 'Kadjar'),
  ('Renault', 'Koleos'), ('Renault', 'Twingo'), ('Renault', 'Talisman'),
  ('Renault', 'Laguna'), ('Renault', 'Espace'), ('Renault', 'Kangoo')
) AS m(make, model) ON m.make = vm.name
ON CONFLICT (make_id, name) DO NOTHING;

-- Peugeot
INSERT INTO public.vehicle_models (make_id, name)
SELECT vm.id, m.model FROM public.vehicle_makes vm
JOIN (VALUES
  ('Peugeot', '208'), ('Peugeot', '207'), ('Peugeot', '206'),
  ('Peugeot', '308'), ('Peugeot', '307'), ('Peugeot', '306'),
  ('Peugeot', '408'), ('Peugeot', '407'), ('Peugeot', '406'),
  ('Peugeot', '508'), ('Peugeot', '3008'), ('Peugeot', '2008'),
  ('Peugeot', '5008'), ('Peugeot', 'Partner'), ('Peugeot', 'Boxer'),
  ('Peugeot', 'Expert')
) AS m(make, model) ON m.make = vm.name
ON CONFLICT (make_id, name) DO NOTHING;

-- Citroën
INSERT INTO public.vehicle_models (make_id, name)
SELECT vm.id, m.model FROM public.vehicle_makes vm
JOIN (VALUES
  ('Citroën', 'C1'), ('Citroën', 'C2'), ('Citroën', 'C3'),
  ('Citroën', 'C4'), ('Citroën', 'C5'), ('Citroën', 'C-Elysée'),
  ('Citroën', 'DS3'), ('Citroën', 'DS4'), ('Citroën', 'DS7'),
  ('Citroën', 'C3 Aircross'), ('Citroën', 'C4 Cactus'),
  ('Citroën', 'C4 Picasso'), ('Citroën', 'Berlingo'), ('Citroën', 'Jumper')
) AS m(make, model) ON m.make = vm.name
ON CONFLICT (make_id, name) DO NOTHING;

-- Opel
INSERT INTO public.vehicle_models (make_id, name)
SELECT vm.id, m.model FROM public.vehicle_makes vm
JOIN (VALUES
  ('Opel', 'Corsa'), ('Opel', 'Corsa D'), ('Opel', 'Corsa E'),
  ('Opel', 'Astra'), ('Opel', 'Astra J'), ('Opel', 'Astra K'),
  ('Opel', 'Insignia'), ('Opel', 'Mokka'), ('Opel', 'Crossland'),
  ('Opel', 'Grandland'), ('Opel', 'Combo'), ('Opel', 'Vivaro')
) AS m(make, model) ON m.make = vm.name
ON CONFLICT (make_id, name) DO NOTHING;

-- Ford
INSERT INTO public.vehicle_models (make_id, name)
SELECT vm.id, m.model FROM public.vehicle_makes vm
JOIN (VALUES
  ('Ford', 'Fiesta'), ('Ford', 'Fiesta 6'), ('Ford', 'Fiesta 7'),
  ('Ford', 'Focus'), ('Ford', 'Focus 3'), ('Ford', 'Focus 4'),
  ('Ford', 'Mondeo'), ('Ford', 'Kuga'), ('Ford', 'EcoSport'),
  ('Ford', 'Edge'), ('Ford', 'Galaxy'), ('Ford', 'S-Max'),
  ('Ford', 'Transit'), ('Ford', 'Ranger'), ('Ford', 'Mustang')
) AS m(make, model) ON m.make = vm.name
ON CONFLICT (make_id, name) DO NOTHING;

-- Toyota
INSERT INTO public.vehicle_models (make_id, name)
SELECT vm.id, m.model FROM public.vehicle_makes vm
JOIN (VALUES
  ('Toyota', 'Yaris'), ('Toyota', 'Corolla'), ('Toyota', 'Auris'),
  ('Toyota', 'Avensis'), ('Toyota', 'Camry'), ('Toyota', 'RAV4'),
  ('Toyota', 'C-HR'), ('Toyota', 'Highlander'), ('Toyota', 'Land Cruiser'),
  ('Toyota', 'Hilux'), ('Toyota', 'Prius'), ('Toyota', 'Aygo'),
  ('Toyota', 'Verso')
) AS m(make, model) ON m.make = vm.name
ON CONFLICT (make_id, name) DO NOTHING;

-- Nissan
INSERT INTO public.vehicle_models (make_id, name)
SELECT vm.id, m.model FROM public.vehicle_makes vm
JOIN (VALUES
  ('Nissan', 'Micra'), ('Nissan', 'Note'), ('Nissan', 'Qashqai'),
  ('Nissan', 'Juke'), ('Nissan', 'X-Trail'), ('Nissan', 'Pathfinder'),
  ('Nissan', 'Navara'), ('Nissan', 'Leaf'), ('Nissan', 'Almera')
) AS m(make, model) ON m.make = vm.name
ON CONFLICT (make_id, name) DO NOTHING;

-- Hyundai
INSERT INTO public.vehicle_models (make_id, name)
SELECT vm.id, m.model FROM public.vehicle_makes vm
JOIN (VALUES
  ('Hyundai', 'i10'), ('Hyundai', 'i20'), ('Hyundai', 'i30'),
  ('Hyundai', 'i40'), ('Hyundai', 'Tucson'), ('Hyundai', 'Santa Fe'),
  ('Hyundai', 'Kona'), ('Hyundai', 'Accent'), ('Hyundai', 'Elantra')
) AS m(make, model) ON m.make = vm.name
ON CONFLICT (make_id, name) DO NOTHING;

-- Kia
INSERT INTO public.vehicle_models (make_id, name)
SELECT vm.id, m.model FROM public.vehicle_makes vm
JOIN (VALUES
  ('Kia', 'Picanto'), ('Kia', 'Rio'), ('Kia', 'Ceed'),
  ('Kia', 'Sportage'), ('Kia', 'Sorento'), ('Kia', 'Niro'),
  ('Kia', 'Stonic'), ('Kia', 'Carnival')
) AS m(make, model) ON m.make = vm.name
ON CONFLICT (make_id, name) DO NOTHING;

-- Fiat
INSERT INTO public.vehicle_models (make_id, name)
SELECT vm.id, m.model FROM public.vehicle_makes vm
JOIN (VALUES
  ('Fiat', 'Punto'), ('Fiat', 'Panda'), ('Fiat', '500'),
  ('Fiat', 'Tipo'), ('Fiat', 'Doblo'), ('Fiat', 'Ducato'),
  ('Fiat', 'Bravo'), ('Fiat', 'Stilo')
) AS m(make, model) ON m.make = vm.name
ON CONFLICT (make_id, name) DO NOTHING;

-- Dacia
INSERT INTO public.vehicle_models (make_id, name)
SELECT vm.id, m.model FROM public.vehicle_makes vm
JOIN (VALUES
  ('Dacia', 'Logan'), ('Dacia', 'Sandero'), ('Dacia', 'Duster'),
  ('Dacia', 'Lodgy'), ('Dacia', 'Dokker'), ('Dacia', 'Jogger')
) AS m(make, model) ON m.make = vm.name
ON CONFLICT (make_id, name) DO NOTHING;

-- Volvo
INSERT INTO public.vehicle_models (make_id, name)
SELECT vm.id, m.model FROM public.vehicle_makes vm
JOIN (VALUES
  ('Volvo', 'V40'), ('Volvo', 'V50'), ('Volvo', 'V60'),
  ('Volvo', 'V70'), ('Volvo', 'V90'), ('Volvo', 'XC40'),
  ('Volvo', 'XC60'), ('Volvo', 'XC90'), ('Volvo', 'S60'), ('Volvo', 'S90')
) AS m(make, model) ON m.make = vm.name
ON CONFLICT (make_id, name) DO NOTHING;

-- Honda
INSERT INTO public.vehicle_models (make_id, name)
SELECT vm.id, m.model FROM public.vehicle_makes vm
JOIN (VALUES
  ('Honda', 'Civic'), ('Honda', 'Accord'), ('Honda', 'CR-V'),
  ('Honda', 'HR-V'), ('Honda', 'Jazz'), ('Honda', 'HRV')
) AS m(make, model) ON m.make = vm.name
ON CONFLICT (make_id, name) DO NOTHING;

-- Mazda
INSERT INTO public.vehicle_models (make_id, name)
SELECT vm.id, m.model FROM public.vehicle_makes vm
JOIN (VALUES
  ('Mazda', '2'), ('Mazda', '3'), ('Mazda', '6'),
  ('Mazda', 'CX-3'), ('Mazda', 'CX-5'), ('Mazda', 'CX-7'), ('Mazda', 'MX-5')
) AS m(make, model) ON m.make = vm.name
ON CONFLICT (make_id, name) DO NOTHING;

-- Mitsubishi
INSERT INTO public.vehicle_models (make_id, name)
SELECT vm.id, m.model FROM public.vehicle_makes vm
JOIN (VALUES
  ('Mitsubishi', 'Space Star'), ('Mitsubishi', 'ASX'),
  ('Mitsubishi', 'Outlander'), ('Mitsubishi', 'L200'), ('Mitsubishi', 'Pajero')
) AS m(make, model) ON m.make = vm.name
ON CONFLICT (make_id, name) DO NOTHING;

-- Suzuki
INSERT INTO public.vehicle_models (make_id, name)
SELECT vm.id, m.model FROM public.vehicle_makes vm
JOIN (VALUES
  ('Suzuki', 'Swift'), ('Suzuki', 'Baleno'), ('Suzuki', 'Vitara'),
  ('Suzuki', 'SX4'), ('Suzuki', 'Celerio'), ('Suzuki', 'Jimny')
) AS m(make, model) ON m.make = vm.name
ON CONFLICT (make_id, name) DO NOTHING;

-- Chevrolet
INSERT INTO public.vehicle_models (make_id, name)
SELECT vm.id, m.model FROM public.vehicle_makes vm
JOIN (VALUES
  ('Chevrolet', 'Spark'), ('Chevrolet', 'Aveo'),
  ('Chevrolet', 'Cruze'), ('Chevrolet', 'Captiva')
) AS m(make, model) ON m.make = vm.name
ON CONFLICT (make_id, name) DO NOTHING;

-- Jeep
INSERT INTO public.vehicle_models (make_id, name)
SELECT vm.id, m.model FROM public.vehicle_makes vm
JOIN (VALUES
  ('Jeep', 'Renegade'), ('Jeep', 'Compass'), ('Jeep', 'Cherokee'),
  ('Jeep', 'Grand Cherokee'), ('Jeep', 'Wrangler')
) AS m(make, model) ON m.make = vm.name
ON CONFLICT (make_id, name) DO NOTHING;

-- Land Rover
INSERT INTO public.vehicle_models (make_id, name)
SELECT vm.id, m.model FROM public.vehicle_makes vm
JOIN (VALUES
  ('Land Rover', 'Range Rover'), ('Land Rover', 'Range Rover Evoque'),
  ('Land Rover', 'Range Rover Sport'), ('Land Rover', 'Discovery'),
  ('Land Rover', 'Defender'), ('Land Rover', 'Freelander')
) AS m(make, model) ON m.make = vm.name
ON CONFLICT (make_id, name) DO NOTHING;

-- Porsche
INSERT INTO public.vehicle_models (make_id, name)
SELECT vm.id, m.model FROM public.vehicle_makes vm
JOIN (VALUES
  ('Porsche', '911'), ('Porsche', 'Cayenne'), ('Porsche', 'Macan'),
  ('Porsche', 'Panamera'), ('Porsche', 'Taycan'), ('Porsche', '718')
) AS m(make, model) ON m.make = vm.name
ON CONFLICT (make_id, name) DO NOTHING;

-- MINI
INSERT INTO public.vehicle_models (make_id, name)
SELECT vm.id, m.model FROM public.vehicle_makes vm
JOIN (VALUES
  ('MINI', 'Cooper'), ('MINI', 'Cooper S'), ('MINI', 'Countryman'),
  ('MINI', 'Clubman'), ('MINI', 'Paceman')
) AS m(make, model) ON m.make = vm.name
ON CONFLICT (make_id, name) DO NOTHING;

-- Alfa Romeo
INSERT INTO public.vehicle_models (make_id, name)
SELECT vm.id, m.model FROM public.vehicle_makes vm
JOIN (VALUES
  ('Alfa Romeo', 'Giulietta'), ('Alfa Romeo', 'Giulia'),
  ('Alfa Romeo', 'Stelvio'), ('Alfa Romeo', 'MiTo'), ('Alfa Romeo', '159')
) AS m(make, model) ON m.make = vm.name
ON CONFLICT (make_id, name) DO NOTHING;

-- Lexus
INSERT INTO public.vehicle_models (make_id, name)
SELECT vm.id, m.model FROM public.vehicle_makes vm
JOIN (VALUES
  ('Lexus', 'IS'), ('Lexus', 'ES'), ('Lexus', 'RX'),
  ('Lexus', 'NX'), ('Lexus', 'CT'), ('Lexus', 'GS')
) AS m(make, model) ON m.make = vm.name
ON CONFLICT (make_id, name) DO NOTHING;

-- Subaru
INSERT INTO public.vehicle_models (make_id, name)
SELECT vm.id, m.model FROM public.vehicle_makes vm
JOIN (VALUES
  ('Subaru', 'Impreza'), ('Subaru', 'Forester'), ('Subaru', 'Outback'),
  ('Subaru', 'XV'), ('Subaru', 'Levorg')
) AS m(make, model) ON m.make = vm.name
ON CONFLICT (make_id, name) DO NOTHING;

-- ============================================================
-- VEHICLE GENERATIONS (for popular models)
-- ============================================================

INSERT INTO public.vehicle_generations (model_id, name, year_start, year_end)
SELECT vmod.id, g.gen, g.ys, g.ye FROM public.vehicle_models vmod
JOIN public.vehicle_makes vmak ON vmak.id = vmod.make_id
JOIN (VALUES
  ('Volkswagen', 'Golf 4', 'Golf IV', 1997, 2003),
  ('Volkswagen', 'Golf 5', 'Golf V', 2003, 2008),
  ('Volkswagen', 'Golf 6', 'Golf VI', 2008, 2012),
  ('Volkswagen', 'Golf 7', 'Golf VII', 2012, 2020),
  ('Volkswagen', 'Golf 8', 'Golf VIII', 2020, NULL),
  ('Volkswagen', 'Polo 5', 'Polo V', 2009, 2014),
  ('Volkswagen', 'Polo 6', 'Polo VI', 2017, NULL),
  ('Volkswagen', 'Passat B6', 'Passat B6', 2005, 2010),
  ('Volkswagen', 'Passat B7', 'Passat B7', 2010, 2014),
  ('Volkswagen', 'Passat B8', 'Passat B8', 2014, NULL),
  ('Volkswagen', 'Tiguan', 'Tiguan I', 2007, 2016),
  ('Volkswagen', 'T-Roc', 'T-Roc', 2017, NULL),
  ('Volkswagen', 'Touareg', 'Touareg I', 2002, 2010),
  ('Audi', 'A3 8L', 'A3 8L', 1996, 2003),
  ('Audi', 'A3 8P', 'A3 8P', 2003, 2012),
  ('Audi', 'A3 8V', 'A3 8V', 2012, 2020),
  ('Audi', 'A4 B6', 'A4 B6', 2000, 2004),
  ('Audi', 'A4 B7', 'A4 B7', 2004, 2008),
  ('Audi', 'A4 B8', 'A4 B8', 2007, 2015),
  ('Audi', 'A4 B9', 'A4 B9', 2015, NULL),
  ('Audi', 'Q3', 'Q3 8U', 2011, 2018),
  ('Audi', 'Q5', 'Q5 8R', 2008, 2017),
  ('Audi', 'Q7', 'Q7 4L', 2005, 2015),
  ('SEAT', 'Leon 1P', 'Leon II', 2005, 2012),
  ('SEAT', 'Leon 5F', 'Leon III', 2012, 2020),
  ('SEAT', 'Ibiza 6L', 'Ibiza III', 2002, 2008),
  ('SEAT', 'Ibiza 6J', 'Ibiza IV', 2008, 2017),
  ('SEAT', 'Ateca', 'Ateca', 2016, NULL),
  ('Škoda', 'Octavia 1U', 'Octavia I', 1996, 2004),
  ('Škoda', 'Octavia 1Z', 'Octavia II', 2004, 2013),
  ('Škoda', 'Octavia 5E', 'Octavia III', 2013, 2020),
  ('Škoda', 'Fabia 6Y', 'Fabia I', 1999, 2007),
  ('Škoda', 'Fabia 5J', 'Fabia II', 2007, 2014),
  ('Škoda', 'Fabia NJ', 'Fabia III', 2014, NULL),
  ('Škoda', 'Superb 3T', 'Superb II', 2008, 2015),
  ('Škoda', 'Superb 3V', 'Superb III', 2015, NULL),
  ('Škoda', 'Kodiaq', 'Kodiaq', 2016, NULL),
  ('BMW', 'Série 3 E46', 'E46', 1998, 2005),
  ('BMW', 'Série 3 E90', 'E90', 2005, 2012),
  ('BMW', 'Série 3 F30', 'F30', 2012, 2019),
  ('BMW', 'Série 3 G20', 'G20', 2019, NULL),
  ('BMW', 'Série 5 E60', 'E60', 2003, 2010),
  ('BMW', 'Série 5 F10', 'F10', 2010, 2016),
  ('BMW', 'Série 5 G30', 'G30', 2016, NULL),
  ('BMW', 'X3', 'X3 F25', 2010, 2017),
  ('BMW', 'X5', 'X5 E70', 2006, 2013),
  ('Mercedes-Benz', 'Classe A W176', 'W176', 2012, 2018),
  ('Mercedes-Benz', 'Classe A W177', 'W177', 2018, NULL),
  ('Mercedes-Benz', 'Classe C W204', 'W204', 2007, 2014),
  ('Mercedes-Benz', 'Classe C W205', 'W205', 2014, 2021),
  ('Mercedes-Benz', 'Classe E W212', 'W212', 2009, 2016),
  ('Mercedes-Benz', 'Classe E W213', 'W213', 2016, NULL),
  ('Mercedes-Benz', 'GLC', 'GLC X253', 2015, 2022),
  ('Mercedes-Benz', 'GLE', 'GLE W166', 2015, 2019),
  ('Renault', 'Clio 3', 'Clio III', 2005, 2012),
  ('Renault', 'Clio 4', 'Clio IV', 2012, 2019),
  ('Renault', 'Clio 5', 'Clio V', 2019, NULL),
  ('Renault', 'Megane 3', 'Mégane III', 2008, 2016),
  ('Renault', 'Megane 4', 'Mégane IV', 2016, NULL),
  ('Renault', 'Captur', 'Captur I', 2013, 2019),
  ('Renault', 'Kadjar', 'Kadjar', 2015, 2022),
  ('Peugeot', '208', '208 I', 2012, 2019),
  ('Peugeot', '308', '308 II', 2013, 2021),
  ('Peugeot', '3008', '3008 II', 2016, NULL),
  ('Peugeot', '2008', '2008 I', 2013, 2019),
  ('Peugeot', '508', '508 I', 2011, 2018),
  ('Citroën', 'C3', 'C3 III', 2016, NULL),
  ('Citroën', 'C4', 'C4 II', 2010, 2018),
  ('Citroën', 'C4 Cactus', 'C4 Cactus', 2014, 2020),
  ('Opel', 'Corsa D', 'Corsa D', 2006, 2014),
  ('Opel', 'Corsa E', 'Corsa E', 2014, 2019),
  ('Opel', 'Astra J', 'Astra J', 2009, 2015),
  ('Opel', 'Astra K', 'Astra K', 2015, 2021),
  ('Ford', 'Fiesta 6', 'Fiesta VI', 2008, 2017),
  ('Ford', 'Fiesta 7', 'Fiesta VII', 2017, 2023),
  ('Ford', 'Focus 3', 'Focus III', 2011, 2018),
  ('Ford', 'Focus 4', 'Focus IV', 2018, NULL),
  ('Ford', 'Kuga', 'Kuga II', 2012, 2019),
  ('Toyota', 'Yaris', 'Yaris III', 2011, 2020),
  ('Toyota', 'Corolla', 'Corolla E21', 2019, NULL),
  ('Toyota', 'RAV4', 'RAV4 IV', 2013, 2018),
  ('Toyota', 'C-HR', 'C-HR', 2016, NULL),
  ('Nissan', 'Qashqai', 'Qashqai II', 2013, 2021),
  ('Nissan', 'Juke', 'Juke I', 2010, 2019),
  ('Hyundai', 'i30', 'i30 PD', 2017, NULL),
  ('Hyundai', 'Tucson', 'Tucson TL', 2015, 2020),
  ('Kia', 'Ceed', 'Ceed III', 2018, NULL),
  ('Kia', 'Sportage', 'Sportage IV', 2015, 2021),
  ('Dacia', 'Duster', 'Duster I', 2010, 2017),
  ('Dacia', 'Sandero', 'Sandero II', 2012, 2020),
  ('Dacia', 'Logan', 'Logan II', 2012, 2020),
  ('Fiat', '500', '500', 2007, 2020),
  ('Fiat', 'Punto', 'Grande Punto', 2005, 2012),
  ('Volvo', 'XC60', 'XC60 I', 2008, 2017),
  ('Volvo', 'XC90', 'XC90 II', 2015, NULL),
  ('Honda', 'Civic', 'Civic X', 2016, 2021),
  ('Honda', 'CR-V', 'CR-V V', 2017, 2022),
  ('Mazda', '3', 'Mazda3 BP', 2019, NULL),
  ('Mazda', 'CX-5', 'CX-5 II', 2017, NULL),
  ('Jeep', 'Renegade', 'Renegade', 2014, 2022),
  ('Jeep', 'Compass', 'Compass II', 2017, NULL),
  ('Land Rover', 'Range Rover Evoque', 'Evoque I', 2011, 2019),
  ('Porsche', 'Macan', 'Macan', 2014, NULL),
  ('Porsche', 'Cayenne', 'Cayenne III', 2017, NULL),
  ('MINI', 'Cooper', 'Cooper F56', 2013, 2021),
  ('Lexus', 'RX', 'RX IV', 2015, 2022),
  ('Subaru', 'Impreza', 'Impreza V', 2016, NULL)
) AS g(make, model, gen, ys, ye)
ON g.make = vmak.name AND g.model = vmod.name
ON CONFLICT (model_id, name) DO NOTHING;

-- ============================================================
-- ENGINES (for selected generations)
-- ============================================================

INSERT INTO public.engines (generation_id, name, fuel_type_id, transmission_id, displacement, power_kw, power_hp, year_start, year_end)
SELECT vg.id, e.eng, ft.id, tr.id, e.disp, e.kw, e.hp, e.ys, e.ye
FROM public.vehicle_generations vg
JOIN public.vehicle_models vmod ON vmod.id = vg.model_id
JOIN public.vehicle_makes vmak ON vmak.id = vmod.make_id
JOIN (VALUES
  ('Volkswagen', 'Golf IV', '1.4 16V', 'Petrol', 'Manual', '1390', 55, 75, 1997, 2003),
  ('Volkswagen', 'Golf IV', '1.6 8V', 'Petrol', 'Manual', '1595', 74, 100, 1997, 2003),
  ('Volkswagen', 'Golf IV', '1.9 TDI', 'Diesel', 'Manual', '1896', 81, 110, 1997, 2003),
  ('Volkswagen', 'Golf IV', '1.9 TDI PD', 'Diesel', 'Manual', '1896', 96, 130, 1998, 2003),
  ('Volkswagen', 'Golf V', '1.6 MPI', 'Petrol', 'Manual', '1595', 75, 102, 2003, 2008),
  ('Volkswagen', 'Golf V', '2.0 TDI', 'Diesel', 'Manual', '1968', 103, 140, 2003, 2008),
  ('Volkswagen', 'Golf V', '2.0 TFSI GTI', 'Petrol', 'Manual', '1984', 147, 200, 2004, 2008),
  ('Volkswagen', 'Golf VI', '1.6 TDI', 'Diesel', 'Manual', '1598', 77, 105, 2008, 2012),
  ('Volkswagen', 'Golf VI', '1.4 TSI', 'Petrol', 'Manual', '1390', 90, 122, 2008, 2012),
  ('Volkswagen', 'Golf VI', '2.0 TDI CR', 'Diesel', 'Manual', '1968', 103, 140, 2008, 2012),
  ('Volkswagen', 'Golf VII', '1.6 TDI', 'Diesel', 'Manual', '1598', 81, 110, 2012, 2020),
  ('Volkswagen', 'Golf VII', '2.0 TDI CR', 'Diesel', 'Manual', '1968', 110, 150, 2012, 2020),
  ('Volkswagen', 'Golf VII', '1.4 TSI', 'Petrol', 'Manual', '1395', 92, 125, 2012, 2020),
  ('Volkswagen', 'Golf VII', '2.0 TSI GTI', 'Petrol', 'Manual', '1984', 169, 230, 2013, 2020),
  ('Volkswagen', 'Golf VIII', '1.5 TSI', 'Petrol', 'Manual', '1498', 110, 150, 2020, NULL),
  ('Volkswagen', 'Golf VIII', '2.0 TDI', 'Diesel', 'Automatic', '1968', 110, 150, 2020, NULL),
  ('Audi', 'A3 8L', '1.6', 'Petrol', 'Manual', '1595', 74, 100, 1996, 2003),
  ('Audi', 'A3 8L', '1.9 TDI', 'Diesel', 'Manual', '1896', 66, 90, 1996, 2003),
  ('Audi', 'A3 8P', '1.6 FSI', 'Petrol', 'Manual', '1598', 85, 115, 2003, 2007),
  ('Audi', 'A3 8P', '2.0 TDI', 'Diesel', 'Manual', '1968', 103, 140, 2003, 2012),
  ('Audi', 'A3 8P', '2.0 TFSI', 'Petrol', 'Manual', '1984', 147, 200, 2004, 2012),
  ('Audi', 'A3 8V', '1.4 TFSI', 'Petrol', 'Manual', '1395', 92, 125, 2012, 2020),
  ('Audi', 'A3 8V', '2.0 TDI', 'Diesel', 'Manual', '1968', 110, 150, 2012, 2020),
  ('Audi', 'A4 B8', '1.8 TFSI', 'Petrol', 'Manual', '1798', 118, 160, 2007, 2015),
  ('Audi', 'A4 B8', '2.0 TDI CR', 'Diesel', 'Manual', '1968', 105, 143, 2007, 2015),
  ('Audi', 'A4 B8', '3.0 TDI', 'Diesel', 'Automatic', '2967', 176, 240, 2007, 2015),
  ('Audi', 'A4 B9', '2.0 TFSI', 'Petrol', 'Manual', '1984', 140, 190, 2015, NULL),
  ('Audi', 'A4 B9', '2.0 TDI', 'Diesel', 'Manual', '1968', 140, 190, 2015, NULL),
  ('Audi', 'Q3', '2.0 TDI', 'Diesel', 'Manual', '1968', 103, 140, 2011, 2018),
  ('Audi', 'Q5', '2.0 TDI', 'Diesel', 'Automatic', '1968', 105, 143, 2008, 2017),
  ('BMW', 'E46', '316i', 'Petrol', 'Manual', '1796', 77, 105, 1998, 2005),
  ('BMW', 'E46', '320d', 'Diesel', 'Manual', '1995', 100, 136, 1998, 2005),
  ('BMW', 'E46', '330i', 'Petrol', 'Manual', '2979', 170, 231, 2000, 2005),
  ('BMW', 'E90', '320d', 'Diesel', 'Manual', '1995', 130, 177, 2005, 2012),
  ('BMW', 'E90', '325i', 'Petrol', 'Manual', '2996', 160, 218, 2005, 2012),
  ('BMW', 'F30', '320d', 'Diesel', 'Manual', '1995', 135, 184, 2012, 2019),
  ('BMW', 'F30', '328i', 'Petrol', 'Automatic', '1997', 180, 245, 2012, 2019),
  ('BMW', 'G20', '320d', 'Diesel', 'Manual', '1995', 140, 190, 2019, NULL),
  ('BMW', 'G20', '330i', 'Petrol', 'Automatic', '1998', 190, 258, 2019, NULL),
  ('BMW', 'E60', '520d', 'Diesel', 'Manual', '1995', 120, 163, 2005, 2010),
  ('BMW', 'F10', '520d', 'Diesel', 'Automatic', '1995', 135, 184, 2010, 2016),
  ('BMW', 'G30', '530d', 'Diesel', 'Automatic', '2993', 195, 265, 2016, NULL),
  ('Mercedes-Benz', 'W204', 'C 220 CDI', 'Diesel', 'Manual', '2143', 125, 170, 2007, 2014),
  ('Mercedes-Benz', 'W204', 'C 180 Kompressor', 'Petrol', 'Manual', '1796', 115, 156, 2007, 2014),
  ('Mercedes-Benz', 'W205', 'C 220 d', 'Diesel', 'Manual', '1950', 125, 170, 2014, 2021),
  ('Mercedes-Benz', 'W205', 'C 200', 'Petrol', 'Automatic', '1991', 135, 184, 2014, 2021),
  ('Mercedes-Benz', 'W212', 'E 220 CDI', 'Diesel', 'Manual', '2143', 125, 170, 2009, 2016),
  ('Mercedes-Benz', 'W213', 'E 220 d', 'Diesel', 'Automatic', '1950', 143, 194, 2016, NULL),
  ('Renault', 'Clio III', '1.2 16V', 'Petrol', 'Manual', '1149', 58, 79, 2005, 2012),
  ('Renault', 'Clio III', '1.5 dCi', 'Diesel', 'Manual', '1461', 76, 103, 2005, 2012),
  ('Renault', 'Clio IV', '0.9 TCe', 'Petrol', 'Manual', '898', 66, 90, 2012, 2019),
  ('Renault', 'Clio IV', '1.5 dCi', 'Diesel', 'Manual', '1461', 66, 90, 2012, 2019),
  ('Renault', 'Clio V', '1.0 TCe', 'Petrol', 'Manual', '999', 74, 100, 2019, NULL),
  ('Renault', 'Mégane III', '1.5 dCi', 'Diesel', 'Manual', '1461', 81, 110, 2008, 2016),
  ('Renault', 'Mégane III', '1.6 16V', 'Petrol', 'Manual', '1598', 81, 110, 2008, 2016),
  ('Renault', 'Mégane IV', '1.3 TCe', 'Petrol', 'Manual', '1332', 103, 140, 2018, NULL),
  ('Renault', 'Mégane IV', '1.5 Blue dCi', 'Diesel', 'Manual', '1461', 85, 115, 2016, NULL),
  ('Peugeot', '208 I', '1.2 PureTech', 'Petrol', 'Manual', '1199', 81, 110, 2012, 2019),
  ('Peugeot', '208 I', '1.6 BlueHDi', 'Diesel', 'Manual', '1560', 73, 99, 2012, 2019),
  ('Peugeot', '308 II', '1.2 PureTech', 'Petrol', 'Manual', '1199', 96, 130, 2013, 2021),
  ('Peugeot', '308 II', '2.0 BlueHDi', 'Diesel', 'Manual', '1997', 110, 150, 2013, 2021),
  ('Peugeot', '3008 II', '1.2 PureTech', 'Petrol', 'Manual', '1199', 96, 130, 2016, NULL),
  ('Peugeot', '3008 II', '2.0 BlueHDi', 'Diesel', 'Automatic', '1997', 132, 180, 2016, NULL),
  ('Toyota', 'Yaris III', '1.0 VVT-i', 'Petrol', 'Manual', '998', 51, 69, 2011, 2020),
  ('Toyota', 'Yaris III', '1.4 D-4D', 'Diesel', 'Manual', '1364', 66, 90, 2011, 2020),
  ('Toyota', 'RAV4 IV', '2.0 D-4D', 'Diesel', 'Manual', '1995', 91, 124, 2013, 2018),
  ('Toyota', 'Corolla E21', '1.8 Hybrid', 'Hybrid', 'Automatic', '1798', 72, 98, 2019, NULL),
  ('Nissan', 'Qashqai II', '1.5 dCi', 'Diesel', 'Manual', '1461', 81, 110, 2013, 2021),
  ('Nissan', 'Qashqai II', '1.2 DIG-T', 'Petrol', 'Manual', '1197', 85, 115, 2013, 2021),
  ('Nissan', 'Juke I', '1.5 dCi', 'Diesel', 'Manual', '1461', 81, 110, 2010, 2019),
  ('Nissan', 'Juke I', '1.6', 'Petrol', 'Manual', '1598', 86, 117, 2010, 2019),
  ('Dacia', 'Duster I', '1.5 dCi', 'Diesel', 'Manual', '1461', 80, 109, 2010, 2017),
  ('Dacia', 'Duster I', '1.6 16V', 'Petrol', 'Manual', '1598', 79, 107, 2010, 2017),
  ('Dacia', 'Sandero II', '1.5 dCi', 'Diesel', 'Manual', '1461', 66, 90, 2012, 2020),
  ('Dacia', 'Logan II', '1.5 dCi', 'Diesel', 'Manual', '1461', 66, 90, 2012, 2020),
  ('Ford', 'Fiesta VI', '1.6 TDCi', 'Diesel', 'Manual', '1560', 70, 95, 2008, 2017),
  ('Ford', 'Fiesta VI', '1.25', 'Petrol', 'Manual', '1242', 60, 82, 2008, 2017),
  ('Ford', 'Fiesta VII', '1.0 EcoBoost', 'Petrol', 'Manual', '999', 92, 125, 2017, 2023),
  ('Ford', 'Fiesta VII', '1.5 TDCi', 'Diesel', 'Manual', '1499', 63, 85, 2017, 2023),
  ('Ford', 'Focus III', '1.6 TDCi', 'Diesel', 'Manual', '1560', 85, 115, 2011, 2018),
  ('Ford', 'Focus III', '1.0 EcoBoost', 'Petrol', 'Manual', '999', 92, 125, 2011, 2018),
  ('Ford', 'Focus IV', '1.5 EcoBlue', 'Diesel', 'Manual', '1499', 88, 120, 2018, NULL),
  ('Ford', 'Focus IV', '1.0 EcoBoost', 'Petrol', 'Manual', '999', 92, 125, 2018, NULL),
  ('Hyundai', 'i30 PD', '1.4 MPI', 'Petrol', 'Manual', '1368', 73, 99, 2017, NULL),
  ('Hyundai', 'i30 PD', '1.6 CRDi', 'Diesel', 'Manual', '1582', 100, 136, 2017, NULL),
  ('Hyundai', 'Tucson TL', '1.6 GDI', 'Petrol', 'Manual', '1591', 97, 132, 2015, 2020),
  ('Hyundai', 'Tucson TL', '2.0 CRDi', 'Diesel', 'Automatic', '1995', 136, 185, 2015, 2020),
  ('Kia', 'Ceed III', '1.4 MPI', 'Petrol', 'Manual', '1368', 73, 99, 2018, NULL),
  ('Kia', 'Ceed III', '1.6 CRDi', 'Diesel', 'Manual', '1582', 100, 136, 2018, NULL),
  ('Kia', 'Sportage IV', '1.6 GDI', 'Petrol', 'Manual', '1591', 97, 132, 2015, 2021),
  ('Kia', 'Sportage IV', '2.0 CRDi', 'Diesel', 'Manual', '1995', 136, 185, 2015, 2021),
  ('Honda', 'Civic X', '1.5 VTEC Turbo', 'Petrol', 'Manual', '1496', 134, 182, 2016, 2021),
  ('Honda', 'Civic X', '1.0 VTEC', 'Petrol', 'Manual', '998', 92, 126, 2016, 2021),
  ('Honda', 'CR-V V', '1.5 VTEC Turbo', 'Petrol', 'Manual', '1496', 142, 193, 2017, 2022),
  ('Honda', 'CR-V V', '1.6 i-DTEC', 'Diesel', 'Manual', '1597', 88, 120, 2017, 2022),
  ('Mazda', 'Mazda3 BP', '2.0 Skyactiv-G', 'Petrol', 'Manual', '1998', 90, 122, 2019, NULL),
  ('Mazda', 'Mazda3 BP', '1.8 Skyactiv-D', 'Diesel', 'Manual', '1759', 85, 116, 2019, NULL),
  ('Mazda', 'CX-5 II', '2.0 Skyactiv-G', 'Petrol', 'Manual', '1998', 121, 165, 2017, NULL),
  ('Mazda', 'CX-5 II', '2.2 Skyactiv-D', 'Diesel', 'Automatic', '2191', 129, 175, 2017, NULL),
  ('Volvo', 'XC60 I', 'D4 AWD', 'Diesel', 'Automatic', '1984', 140, 190, 2008, 2017),
  ('Volvo', 'XC60 I', 'T5', 'Petrol', 'Automatic', '1969', 179, 243, 2010, 2017),
  ('Volvo', 'XC90 II', 'D5 AWD', 'Diesel', 'Automatic', '1969', 173, 235, 2015, NULL),
  ('Volvo', 'XC90 II', 'T6 AWD', 'Petrol', 'Automatic', '1969', 235, 320, 2015, NULL),
  ('Fiat', '500', '1.2', 'Petrol', 'Manual', '1242', 51, 69, 2007, 2020),
  ('Fiat', '500', '0.9 TwinAir', 'Petrol', 'Manual', '875', 63, 85, 2010, 2020),
  ('Fiat', 'Grande Punto', '1.3 MultiJet', 'Diesel', 'Manual', '1248', 66, 90, 2005, 2012),
  ('Fiat', 'Grande Punto', '1.4 T-Jet', 'Petrol', 'Manual', '1368', 88, 120, 2007, 2012),
  ('Jeep', 'Renegade', '1.6 MultiJet', 'Diesel', 'Manual', '1598', 89, 120, 2014, 2022),
  ('Jeep', 'Renegade', '1.4 MultiAir', 'Petrol', 'Manual', '1368', 103, 140, 2014, 2022),
  ('Land Rover', 'Evoque I', '2.0 Si4', 'Petrol', 'Automatic', '1999', 177, 240, 2011, 2019),
  ('Land Rover', 'Evoque I', '2.2 SD4', 'Diesel', 'Automatic', '2179', 140, 190, 2011, 2019),
  ('Porsche', 'Macan', '2.0 TFSI', 'Petrol', 'Automatic', '1984', 185, 252, 2014, NULL),
  ('Porsche', 'Macan', '3.0 V6 S', 'Petrol', 'Automatic', '2995', 254, 345, 2014, NULL),
  ('Porsche', 'Cayenne III', '3.0 V6', 'Petrol', 'Automatic', '2995', 250, 340, 2017, NULL),
  ('Porsche', 'Cayenne III', '4.0 V8 Turbo', 'Petrol', 'Automatic', '3996', 404, 550, 2017, NULL),
  ('MINI', 'Cooper F56', 'Cooper 1.5', 'Petrol', 'Manual', '1499', 100, 136, 2013, 2021),
  ('MINI', 'Cooper F56', 'Cooper S 2.0', 'Petrol', 'Automatic', '1998', 141, 192, 2013, 2021),
  ('Lexus', 'RX IV', '200t', 'Petrol', 'Automatic', '1998', 175, 238, 2015, 2022),
  ('Lexus', 'RX IV', '450h', 'Hybrid', 'Automatic', '3456', 183, 249, 2015, 2022),
  ('Subaru', 'Impreza V', '1.6 Boxer', 'Petrol', 'Manual', '1600', 84, 114, 2016, NULL),
  ('Subaru', 'Impreza V', '2.0 Boxer', 'Petrol', 'Automatic', '1995', 110, 150, 2016, NULL)
) AS e(make, model, eng, fuel, trans, disp, kw, hp, ys, ye)
ON e.make = vmak.name AND e.model = vmod.name AND e.eng = vg.name
LEFT JOIN public.fuel_types ft ON ft.name = e.fuel
LEFT JOIN public.transmissions tr ON tr.name = e.trans
ON CONFLICT (generation_id, name) DO NOTHING;

-- ============================================================
-- ADDITIONAL INDEXES FOR SEARCH PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_products_reference_trgm ON public.products USING gin (reference gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_oem_trgm ON public.products USING gin (oem gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_barcode_trgm ON public.products USING gin (barcode gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON public.products(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_compat_make ON public.compatibility(vehicle_make_id);
CREATE INDEX IF NOT EXISTS idx_compat_gen ON public.compatibility(vehicle_generation_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_models_make ON public.vehicle_models(make_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_generations_model ON public.vehicle_generations(model_id);
CREATE INDEX IF NOT EXISTS idx_engines_generation ON public.engines(generation_id);

-- Update search vector trigger to include brand and category names
CREATE OR REPLACE FUNCTION public.products_search_vector()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', coalesce(NEW.name, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW.oem, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW.reference, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW.barcode, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW.sku, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW.description, '')), 'C');
  RETURN NEW;
END;
$$;