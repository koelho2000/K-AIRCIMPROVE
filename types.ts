
export type CompressorType = 'Parafuso Velocidade Fixa' | 'Parafuso VSD' | 'Pistão' | 'Centrífugo' | 'Outro';
export type BudgetCategory = 'Equipamento' | 'Material' | 'Mão de Obra' | 'Serviço';
export type Brand = 'Atlas Copco' | 'Kaeser' | 'Ingersoll Rand' | 'Generic';
export type ProfileType = 'Turno Normal (08-17h)' | 'Turno Duplo (06-22h)' | 'Contínuo (24h)' | 'Personalizado';

export const BUDGET_CHAPTERS = [
  "1. Estudos e Projetos de Execução",
  "2. Trabalhos preparatórios e preliminares",
  "3. Desmontagem e desativação do sistema existente",
  "4. Fornecimento de novos equipamentos",
  "5. Obras de adaptação civil",
  "6. Instalação mecânica",
  "7. Instalação elétrica",
  "8. Ensaios, comissionamento e colocação em serviço",
  "9. Formação, documentação e garantias",
  "10. Trabalhos finais e entrega da obra"
] as const;

export type BudgetChapter = typeof BUDGET_CHAPTERS[number];

export interface CompressorModel {
  id: string;
  brand: Brand;
  model: string;
  type: CompressorType;
  nominalPowerKW: number;
  flowLS: number;
  pressureMaxBar: number;
  specificPowerKW_M3min: number;
  efficiencyCurve?: { flowPercentage: number; specificPower: number }[];
  estimatedPrice: number;
  // Novos campos técnicos
  dimensions: string; // "C x L x A (mm)"
  weightKG: number;
  currentA: number; // Consumo em Amperes
  voltageV: number; // Tensão (400V padrão industrial)
}

export interface PredefinedMeasure {
  id: string;
  title: string;
  description: string;
  impactType: 'power' | 'flow' | 'pressure' | 'unload' | 'multi';
  suggestedImpact: string;
  defaultBudgetTemplates: Array<{
    description: string;
    category: BudgetCategory;
    chapter: BudgetChapter;
    quantity: number;
    unitPrice: number;
  }>;
}

export interface ScenarioData {
  compressorType: CompressorType;
  selectedModelId?: string;
  profileType: ProfileType;
  loadStartTime: number;
  hoursLoadPerDay: number;
  hoursUnloadPerDay: number;
  powerLoadKW: number;
  powerUnloadKW: number;
  flowLS: number;
  pressureBar: number;
  leakPercentage: number;
  daysPerWeek: number;
  weeksPerYear: number;
  maintenanceCostEuroPerYear: number;
}

export interface BudgetItem {
  id: string;
  measureId?: string;
  description: string;
  category: BudgetCategory;
  chapter: BudgetChapter;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ProjectData {
  clientName: string;
  installation: string;
  location: string;
  date: string;
  technicianName: string;
  energyCost: number;
  selectedMeasureIds: string[];
  customMeasures: string[];
  budgetItems: BudgetItem[];
  baseScenario: ScenarioData;
  proposedScenario: ScenarioData;
}

export interface CalculatedResults {
  baseEnergyKWh: number;
  baseVolumeM3: number;
  baseEnergyCost: number;
  baseMaintenanceCost: number;
  baseTotalOpex: number;
  baseSEC: number; 
  proposedEnergyKWh: number;
  proposedVolumeM3: number;
  proposedEnergyCost: number;
  proposedMaintenanceCost: number;
  proposedTotalOpex: number;
  proposedSEC: number;
  savingsEnergyKWh: number;
  savingsEuro: number;
  capexTotal: number;
  paybackYears: number;
  calculationSteps: {
    label: string;
    formula: string;
    value: string;
  }[];
}
