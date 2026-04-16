/**
 * Maps canonical field names to arrays of known InBody column header aliases.
 * Covers InBody 120, 270, 370, 570, 770 export formats.
 * All aliases are stored lowercase with whitespace/special chars stripped
 * (normalisation is applied before matching).
 */
export const COLUMN_MAP: Record<string, string[]> = {
  // ─── Core metrics ────────────────────────────────────────────────────────
  weightKg: [
    "weight",
    "weightkg",
    "bodyweight",
    "bodyweightkg",
    "totalweight",
    "wt",
    "wtkg",
  ],
  bodyFatPercent: [
    "bodyfat",
    "bodyfatpercent",
    "bodyfatpercentage",
    "percentbodyfat",
    "pbf",
    "fatpercent",
    "fat%",
    "bodyfat%",
    "bf%",
    "bf",
    "percentagebodyfat",
  ],
  bodyFatMassKg: [
    "bodyfatmass",
    "bodyfatmasskg",
    "fatmass",
    "fatmasskg",
    "fat",
    "fatkg",
    "adiposemass",
  ],
  skeletalMuscleMassKg: [
    "skeletalmmusclemass",
    "skeletalmusclemass",
    "skeletalmusclemasskg",
    "smm",
    "smmkg",
    "musclemass",
    "musclemasskg",
    "leanmusclemass",
    "skeletalmuscle",
  ],
  leanBodyMassKg: [
    "leanbodymass",
    "leanbodymasskg",
    "lbm",
    "lbmkg",
    "fatfreemass",
    "fatfreemasskg",
    "ffm",
    "ffmkg",
    "leanbody",
    "softleanmass",   // InBody 270 export label
    "softlean",
  ],
  bmi: [
    "bmi",
    "bodymassindex",
    "massindex",
  ],

  // ─── Metabolic ───────────────────────────────────────────────────────────
  basalMetabolicRate: [
    "basalmetabolicrate",
    "bmr",
    "bmrkcal",
    "restingmetabolicrate",
    "rmr",
    "basalmetabolism",
  ],
  visceralFatLevel: [
    "visceralfatlevel",   // after paren-stripping: "Visceral Fat Level(Level)" → "visceralfatlevel"
    "visceralfat",
    "vfl",
    "vfat",
    "internalfatlevel",
  ],

  // ─── Body water ──────────────────────────────────────────────────────────
  totalBodyWaterL: [
    "totalbodywater",
    "totalbodywaterl",
    "tbw",
    "tbwl",
    "bodywater",
    "bodywaterl",
    "totalwater",
  ],
  intracellularWaterL: [
    "intracellularwater",
    "intracellularwaterl",
    "icw",
    "icwl",
    "intracellular",
  ],
  extracellularWaterL: [
    "extracellularwater",
    "extracellularwaterl",
    "ecw",
    "ecwl",
    "extracellular",
  ],

  // ─── Body composition ────────────────────────────────────────────────────
  proteinKg: [
    "protein",
    "proteinkg",
    "proteinmass",
    "proteinmasskg",
  ],
  mineralsKg: [
    "minerals",
    "mineralskg",
    "bonemineral",
    "bonemineralcontent",
    "bmc",
    "mineral",
  ],

  // ─── Segmental lean mass ─────────────────────────────────────────────────
  rightArmLeanKg: [
    "rightarmlean",
    "rightarmleanmass",  // InBody 270: "Right Arm Lean Mass"
    "rightarmleankgmass",
    "rightarmleankkg",
    "rightarm",
    "rarm",
    "rarmleankkg",
    "rarmlean",
    "rightarmleankg",
    "segmentalleananlaysis_rightarm",
    "leananlaysis_rightarm",
    "rightarmskeletalmuscle",
  ],
  leftArmLeanKg: [
    "leftarmlean",
    "leftarmleanmass",   // InBody 270: "Left Arm Lean Mass"
    "leftarmleankkg",
    "leftarm",
    "larm",
    "larmleankkg",
    "larmlean",
    "leftarmleankg",
    "segmentalleananalysis_leftarm",
    "leftarmskeletalmuscle",
  ],
  trunkLeanKg: [
    "trunklean",
    "trunkleanmass",     // InBody 270: "Trunk Lean Mass"
    "trunkleankkg",
    "trunk",
    "trunkleankg",
    "torsolean",
    "torsoleankkg",
    "trunkskeletalmuscle",
  ],
  rightLegLeanKg: [
    "rightleglean",
    "rightlegleanmass",  // InBody 270: "Right Leg Lean Mass"
    "rightlegleankkg",
    "rightleg",
    "rleg",
    "rleglean",
    "rightlegleankg",
    "rightlegskeletalmuscle",
  ],
  leftLegLeanKg: [
    "leftleglean",
    "leftlegleanmass",   // InBody 270: "Left leg Lean Mass" (lowercase 'l')
    "leftlegleankkg",
    "leftleg",
    "lleg",
    "lleglean",
    "leftlegleankg",
    "leftlegskeletalmuscle",
  ],

  // ─── Segmental fat mass ──────────────────────────────────────────────────
  rightArmFatKg: [
    "rightarmfat",
    "rightarmfatkg",
    "rightarmfatmass",
    "rarmfat",
    "segmentalfatanalysis_rightarm",
    "rightarmfatmasskg",
  ],
  leftArmFatKg: [
    "leftarmfat",
    "leftarmfatkg",
    "leftarmfatmass",
    "larmfat",
    "segmentalfatanalysis_leftarm",
    "leftarmfatmasskg",
  ],
  trunkFatKg: [
    "trunkfat",
    "trunkfatkg",
    "trunkfatmass",
    "torsofat",
    "torsofatkg",
    "segmentalfatanalysis_trunk",
    "trunkfatmasskg",
  ],
  rightLegFatKg: [
    "rightlegfat",
    "rightlegfatkg",
    "rightlegfatmass",
    "rlegfat",
    "segmentalfatanalysis_rightleg",
    "rightlegfatmasskg",
  ],
  leftLegFatKg: [
    "leftlegfat",
    "leftlegfatkg",
    "leftlegfatmass",
    "llegfat",
    "segmentalfatanalysis_leftleg",
    "leftlegfatmasskg",
  ],
};

/** Normalise a raw header string for comparison against COLUMN_MAP aliases. */
export function normaliseHeader(raw: string): string {
  return raw
    .replace(/\(.*?\)/g, "") // strip parenthetical units: (kg), (kcal), (Level), (kg/m²)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ""); // strip remaining whitespace, punctuation, symbols
}

/** Build a reverse lookup: normalised alias → canonical field name. */
export function buildAliasLookup(): Map<string, string> {
  const map = new Map<string, string>();
  for (const [field, aliases] of Object.entries(COLUMN_MAP)) {
    for (const alias of aliases) {
      map.set(normaliseHeader(alias), field);
    }
  }
  return map;
}
