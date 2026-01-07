
import { ProjectData, CalculatedResults, ScenarioData } from '../types';

export const calculateScenarioStats = (s: ScenarioData, energyCost: number) => {
  // Ajuste de Pressão: 1 bar acima de 7 bar = +7% de potência (Referência Manual ADENE)
  const pressureFactor = 1 + (s.pressureBar - 7) * 0.07;
  const powerLoadAdjusted = s.powerLoadKW * pressureFactor;
  
  // Impacto de Fugas: As fugas obrigam o compressor a produzir mais para o mesmo trabalho útil
  const leakFactor = 1 + (s.leakPercentage / 100);
  
  const annualHoursLoad = s.hoursLoadPerDay * s.daysPerWeek * s.weeksPerYear;
  const annualHoursUnload = s.hoursUnloadPerDay * s.daysPerWeek * s.weeksPerYear;
  
  // Energia em carga já inclui o fator de pressão e o desperdício por fugas
  const energyLoad = annualHoursLoad * powerLoadAdjusted * leakFactor;
  const energyUnload = annualHoursUnload * s.powerUnloadKW;
  const annualEnergy = energyLoad + energyUnload;
  
  // Volume Útil (Ar que realmente chega às máquinas, descontando fugas)
  const annualVolumeTotal = annualHoursLoad * s.flowLS * 3.6;
  const annualVolumeUseful = annualVolumeTotal * (1 - (s.leakPercentage / 100));
  
  const energyCostAnnual = annualEnergy * energyCost;
  const totalOpex = energyCostAnnual + s.maintenanceCostEuroPerYear;
  
  // SEC baseado no Volume Útil (o que interessa ao cliente)
  const sec = annualVolumeUseful > 0 ? annualEnergy / annualVolumeUseful : 0;
  
  return {
    energy: annualEnergy,
    energyLoad,
    energyUnload,
    volumeUseful: annualVolumeUseful,
    volumeTotal: annualVolumeTotal,
    energyCost: energyCostAnnual,
    maintenanceCost: s.maintenanceCostEuroPerYear,
    totalOpex: totalOpex,
    sec: sec,
    hoursLoad: annualHoursLoad,
    hoursUnload: annualHoursUnload,
    pressureFactor,
    leakFactor,
    powerLoadAdjusted
  };
};

export const getResults = (project: ProjectData): CalculatedResults => {
  const base = calculateScenarioStats(project.baseScenario, project.energyCost);
  const proposed = calculateScenarioStats(project.proposedScenario, project.energyCost);
  
  const capexTotal = project.budgetItems.reduce((acc, item) => acc + item.total, 0);
  const savingsEuro = base.totalOpex - proposed.totalOpex;
  const paybackYears = savingsEuro > 0 ? capexTotal / savingsEuro : 0;

  return {
    baseEnergyKWh: base.energy,
    baseVolumeM3: base.volumeUseful,
    baseEnergyCost: base.energyCost,
    baseMaintenanceCost: base.maintenanceCost,
    baseTotalOpex: base.totalOpex,
    baseSEC: base.sec,
    
    proposedEnergyKWh: proposed.energy,
    proposedVolumeM3: proposed.volumeUseful,
    proposedEnergyCost: proposed.energyCost,
    proposedMaintenanceCost: proposed.maintenanceCost,
    proposedTotalOpex: proposed.totalOpex,
    proposedSEC: proposed.sec,
    
    savingsEnergyKWh: base.energy - proposed.energy,
    savingsEuro: savingsEuro,
    capexTotal: capexTotal,
    paybackYears: paybackYears,
    
    calculationSteps: [
      { 
        label: 'Penalização por Pressão (Base vs Prop)', 
        formula: '1 + (P_bar - 7) * 0.07', 
        value: `Base: x${base.pressureFactor.toFixed(2)} | Prop: x${proposed.pressureFactor.toFixed(2)}` 
      },
      { 
        label: 'Aumento de Consumo por Fugas (%)', 
        formula: '1 + (Fugas / 100)', 
        value: `Base: x${base.leakFactor.toFixed(2)} (+${project.baseScenario.leakPercentage}%) | Prop: x${proposed.leakFactor.toFixed(2)} (+${project.proposedScenario.leakPercentage}%)` 
      },
      { 
        label: 'Potência de Carga Corrigida (kW)', 
        formula: 'Pot_Nominal * F_Pressão * F_Fugas', 
        value: `Base: ${(project.baseScenario.powerLoadKW * base.pressureFactor * base.leakFactor).toFixed(1)} kW | Prop: ${(project.proposedScenario.powerLoadKW * proposed.pressureFactor * proposed.leakFactor).toFixed(1)} kW` 
      },
      { 
        label: 'Consumo Específico Útil (SEC)', 
        formula: 'Energia Total (kWh) / Volume Ar Útil (m³)', 
        value: `Base: ${base.sec.toFixed(4)} | Prop: ${proposed.sec.toFixed(4)} kWh/m³` 
      }
    ]
  };
};
