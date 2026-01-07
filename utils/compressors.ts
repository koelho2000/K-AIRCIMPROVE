
import { CompressorModel } from '../types';

// Helper to generate a realistic VSD efficiency curve
const generateVSDCurve = (baseSEC: number) => [
  { flowPercentage: 20, specificPower: baseSEC * 1.25 },
  { flowPercentage: 40, specificPower: baseSEC * 1.10 },
  { flowPercentage: 60, specificPower: baseSEC * 1.02 },
  { flowPercentage: 80, specificPower: baseSEC },
  { flowPercentage: 100, specificPower: baseSEC * 1.01 },
];

export const COMPRESSOR_DATABASE: CompressorModel[] = [
  // --- ATLAS COPCO ---
  // GA Fixed Speed
  { id: 'ac-ga7', brand: 'Atlas Copco', model: 'GA 7', type: 'Parafuso Velocidade Fixa', nominalPowerKW: 7.5, flowLS: 21, pressureMaxBar: 10, specificPowerKW_M3min: 7.2, estimatedPrice: 6800 },
  { id: 'ac-ga11', brand: 'Atlas Copco', model: 'GA 11', type: 'Parafuso Velocidade Fixa', nominalPowerKW: 11, flowLS: 30, pressureMaxBar: 10, specificPowerKW_M3min: 6.8, estimatedPrice: 8500 },
  { id: 'ac-ga15', brand: 'Atlas Copco', model: 'GA 15', type: 'Parafuso Velocidade Fixa', nominalPowerKW: 15, flowLS: 42, pressureMaxBar: 10, specificPowerKW_M3min: 6.6, estimatedPrice: 10200 },
  { id: 'ac-ga22', brand: 'Atlas Copco', model: 'GA 22', type: 'Parafuso Velocidade Fixa', nominalPowerKW: 22, flowLS: 65, pressureMaxBar: 10, specificPowerKW_M3min: 6.4, estimatedPrice: 14500 },
  { id: 'ac-ga37', brand: 'Atlas Copco', model: 'GA 37', type: 'Parafuso Velocidade Fixa', nominalPowerKW: 37, flowLS: 112, pressureMaxBar: 10, specificPowerKW_M3min: 6.2, estimatedPrice: 19800 },
  { id: 'ac-ga55', brand: 'Atlas Copco', model: 'GA 55', type: 'Parafuso Velocidade Fixa', nominalPowerKW: 55, flowLS: 172, pressureMaxBar: 10, specificPowerKW_M3min: 6.1, estimatedPrice: 28000 },
  { id: 'ac-ga75', brand: 'Atlas Copco', model: 'GA 75', type: 'Parafuso Velocidade Fixa', nominalPowerKW: 75, flowLS: 235, pressureMaxBar: 10, specificPowerKW_M3min: 5.9, estimatedPrice: 39000 },
  { id: 'ac-ga90', brand: 'Atlas Copco', model: 'GA 90', type: 'Parafuso Velocidade Fixa', nominalPowerKW: 90, flowLS: 285, pressureMaxBar: 10, specificPowerKW_M3min: 5.8, estimatedPrice: 48000 },
  // GA VSD+ Series
  { id: 'ac-ga7vsd', brand: 'Atlas Copco', model: 'GA 7 VSD+', type: 'Parafuso VSD', nominalPowerKW: 7.5, flowLS: 24, pressureMaxBar: 13, specificPowerKW_M3min: 6.4, estimatedPrice: 11500, efficiencyCurve: generateVSDCurve(6.4) },
  { id: 'ac-ga11vsd', brand: 'Atlas Copco', model: 'GA 11 VSD+', type: 'Parafuso VSD', nominalPowerKW: 11, flowLS: 34, pressureMaxBar: 13, specificPowerKW_M3min: 6.2, estimatedPrice: 13800, efficiencyCurve: generateVSDCurve(6.2) },
  { id: 'ac-ga15vsd', brand: 'Atlas Copco', model: 'GA 15 VSD+', type: 'Parafuso VSD', nominalPowerKW: 15, flowLS: 48, pressureMaxBar: 13, specificPowerKW_M3min: 6.1, estimatedPrice: 16200, efficiencyCurve: generateVSDCurve(6.1) },
  { id: 'ac-ga22vsd', brand: 'Atlas Copco', model: 'GA 22 VSD+', type: 'Parafuso VSD', nominalPowerKW: 22, flowLS: 72, pressureMaxBar: 13, specificPowerKW_M3min: 5.9, estimatedPrice: 21000, efficiencyCurve: generateVSDCurve(5.9) },
  { id: 'ac-ga37vsd', brand: 'Atlas Copco', model: 'GA 37 VSD+', type: 'Parafuso VSD', nominalPowerKW: 37, flowLS: 125, pressureMaxBar: 13, specificPowerKW_M3min: 5.7, estimatedPrice: 29500, efficiencyCurve: generateVSDCurve(5.7) },
  { id: 'ac-ga55vsd', brand: 'Atlas Copco', model: 'GA 55 VSD+', type: 'Parafuso VSD', nominalPowerKW: 55, flowLS: 188, pressureMaxBar: 13, specificPowerKW_M3min: 5.5, estimatedPrice: 42000, efficiencyCurve: generateVSDCurve(5.5) },
  { id: 'ac-ga75vsd', brand: 'Atlas Copco', model: 'GA 75 VSD+', type: 'Parafuso VSD', nominalPowerKW: 75, flowLS: 245, pressureMaxBar: 13, specificPowerKW_M3min: 5.4, estimatedPrice: 58000, efficiencyCurve: generateVSDCurve(5.4) },
  { id: 'ac-ga90vsd', brand: 'Atlas Copco', model: 'GA 90 VSD+', type: 'Parafuso VSD', nominalPowerKW: 90, flowLS: 295, pressureMaxBar: 13, specificPowerKW_M3min: 5.3, estimatedPrice: 72000, efficiencyCurve: generateVSDCurve(5.3) },

  // --- KAESER ---
  // SM, SK, AS (Small/Medium)
  { id: 'ks-sm10', brand: 'Kaeser', model: 'SM 10', type: 'Parafuso Velocidade Fixa', nominalPowerKW: 5.5, flowLS: 15, pressureMaxBar: 11, specificPowerKW_M3min: 7.5, estimatedPrice: 5200 },
  { id: 'ks-sk22', brand: 'Kaeser', model: 'SK 22', type: 'Parafuso Velocidade Fixa', nominalPowerKW: 11, flowLS: 33, pressureMaxBar: 11, specificPowerKW_M3min: 6.9, estimatedPrice: 7900 },
  { id: 'ks-as31', brand: 'Kaeser', model: 'AS 31', type: 'Parafuso Velocidade Fixa', nominalPowerKW: 18.5, flowLS: 52, pressureMaxBar: 11, specificPowerKW_M3min: 6.6, estimatedPrice: 11200 },
  // ASD, BSD, CSD (Medium/Large)
  { id: 'ks-asd40', brand: 'Kaeser', model: 'ASD 40', type: 'Parafuso Velocidade Fixa', nominalPowerKW: 22, flowLS: 68, pressureMaxBar: 12, specificPowerKW_M3min: 6.4, estimatedPrice: 15800 },
  { id: 'ks-asd40v', brand: 'Kaeser', model: 'ASD 40 SFC', type: 'Parafuso VSD', nominalPowerKW: 22, flowLS: 75, pressureMaxBar: 12, specificPowerKW_M3min: 6.3, estimatedPrice: 22500, efficiencyCurve: generateVSDCurve(6.3) },
  { id: 'ks-bsd75', brand: 'Kaeser', model: 'BSD 75', type: 'Parafuso Velocidade Fixa', nominalPowerKW: 37, flowLS: 118, pressureMaxBar: 12, specificPowerKW_M3min: 6.2, estimatedPrice: 21500 },
  { id: 'ks-csd105', brand: 'Kaeser', model: 'CSD 105', type: 'Parafuso Velocidade Fixa', nominalPowerKW: 55, flowLS: 185, pressureMaxBar: 12, specificPowerKW_M3min: 6.1, estimatedPrice: 32000 },
  { id: 'ks-csd125v', brand: 'Kaeser', model: 'CSD 125 SFC', type: 'Parafuso VSD', nominalPowerKW: 75, flowLS: 242, pressureMaxBar: 12, specificPowerKW_M3min: 5.8, estimatedPrice: 49000, efficiencyCurve: generateVSDCurve(5.8) },
  // DSD (Large)
  { id: 'ks-dsd175', brand: 'Kaeser', model: 'DSD 175', type: 'Parafuso Velocidade Fixa', nominalPowerKW: 90, flowLS: 295, pressureMaxBar: 15, specificPowerKW_M3min: 5.9, estimatedPrice: 58000 },
  { id: 'ks-dsd240v', brand: 'Kaeser', model: 'DSD 240 SFC', type: 'Parafuso VSD', nominalPowerKW: 132, flowLS: 420, pressureMaxBar: 15, specificPowerKW_M3min: 5.6, estimatedPrice: 84000, efficiencyCurve: generateVSDCurve(5.6) },

  // --- INGERSOLL RAND ---
  { id: 'ir-rs11', brand: 'Ingersoll Rand', model: 'RS11i', type: 'Parafuso Velocidade Fixa', nominalPowerKW: 11, flowLS: 29, pressureMaxBar: 10, specificPowerKW_M3min: 7.0, estimatedPrice: 8800 },
  { id: 'ir-rs15', brand: 'Ingersoll Rand', model: 'RS15i', type: 'Parafuso Velocidade Fixa', nominalPowerKW: 15, flowLS: 41, pressureMaxBar: 10, specificPowerKW_M3min: 6.8, estimatedPrice: 10800 },
  { id: 'ir-rs22', brand: 'Ingersoll Rand', model: 'RS22i', type: 'Parafuso Velocidade Fixa', nominalPowerKW: 22, flowLS: 64, pressureMaxBar: 10, specificPowerKW_M3min: 6.5, estimatedPrice: 15200 },
  { id: 'ir-rs30', brand: 'Ingersoll Rand', model: 'RS30i', type: 'Parafuso Velocidade Fixa', nominalPowerKW: 30, flowLS: 88, pressureMaxBar: 10, specificPowerKW_M3min: 6.4, estimatedPrice: 18500 },
  { id: 'ir-rs37v', brand: 'Ingersoll Rand', model: 'RS37n VSD', type: 'Parafuso VSD', nominalPowerKW: 37, flowLS: 122, pressureMaxBar: 10, specificPowerKW_M3min: 6.2, estimatedPrice: 28500, efficiencyCurve: generateVSDCurve(6.2) },
  { id: 'ir-rs55v', brand: 'Ingersoll Rand', model: 'RS55n VSD', type: 'Parafuso VSD', nominalPowerKW: 55, flowLS: 185, pressureMaxBar: 10, specificPowerKW_M3min: 6.0, estimatedPrice: 45000, efficiencyCurve: generateVSDCurve(6.0) },
  { id: 'ir-rs75', brand: 'Ingersoll Rand', model: 'RS75i', type: 'Parafuso Velocidade Fixa', nominalPowerKW: 75, flowLS: 245, pressureMaxBar: 10, specificPowerKW_M3min: 5.9, estimatedPrice: 42000 },
  { id: 'ir-rs110v', brand: 'Ingersoll Rand', model: 'RS110n VSD', type: 'Parafuso VSD', nominalPowerKW: 110, flowLS: 365, pressureMaxBar: 10, specificPowerKW_M3min: 5.7, estimatedPrice: 82000, efficiencyCurve: generateVSDCurve(5.7) },
  { id: 'ir-rs160', brand: 'Ingersoll Rand', model: 'RS160i', type: 'Parafuso Velocidade Fixa', nominalPowerKW: 160, flowLS: 520, pressureMaxBar: 10, specificPowerKW_M3min: 5.6, estimatedPrice: 95000 },
];
