
import React from 'react';
import { ProjectData, CalculatedResults, BudgetItem, BUDGET_CHAPTERS } from '../types';
import { PREDEFINED_MEASURES } from '../utils/measures';
import { generateDailyProfile } from './LoadDiagrams';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { CheckCircle, Zap, Clock, TrendingUp, Info, Droplet, Gauge, Target, DollarSign, FileText, Globe, MapPin, BarChart3, AlertTriangle, ListChecks, Award, Download, Printer, ShieldCheck, Leaf, Scale, Activity, Microscope, Building2, Fingerprint } from 'lucide-react';

interface Props {
  project: ProjectData;
  results: CalculatedResults;
}

export const Report: React.FC<Props> = ({ project, results }) => {
  const selectedMeasures = PREDEFINED_MEASURES.filter(m => project.selectedMeasureIds.includes(m.id));
  const baseProfile = generateDailyProfile(project.baseScenario);
  const propProfile = generateDailyProfile(project.proposedScenario);
  
  const dailyChartData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}h`,
    Base: baseProfile[i],
    Proposto: propProfile[i]
  }));

  const exportToHtml = () => {
    const content = document.getElementById('report-to-export')?.innerHTML;
    const styles = Array.from(document.styleSheets)
      .map(sheet => {
        try { return Array.from(sheet.cssRules).map(rule => rule.cssText).join(''); } 
        catch (e) { return ''; }
      }).join('');
    const html = `<html><head><style>${styles}</style><script src="https://cdn.tailwindcss.com"></script></head><body>${content}</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Relatorio_Auditoria_${project.clientName.replace(/\s/g, '_')}.html`;
    link.click();
  };

  const exportToDoc = () => {
    const content = document.getElementById('report-to-export')?.innerHTML;
    const pre = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export DOC</title></head><body>";
    const post = "</body></html>";
    const blob = new Blob([pre + content + post], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Relatorio_Auditoria_${project.clientName.replace(/\s/g, '_')}.doc`;
    link.click();
  };

  const pageClass = "bg-white text-slate-900 mx-auto w-[210mm] min-h-[297mm] p-[15mm] sm:p-[20mm] relative box-border flex flex-col shadow-2xl mb-12 border border-slate-100 page-break-after-always print:shadow-none print:m-0 print:border-none";

  return (
    <div className="report-root bg-slate-200 py-10 font-sans print:bg-white print:p-0">
      <style>{`
        @media print {
          .page-break-after-always { page-break-after: always !important; min-height: 297mm; display: block; }
          .no-print { display: none !important; }
          .budget-table-compact td, .budget-table-compact th { padding: 4px 6px !important; line-height: 1.0; font-size: 8px !important; }
          .budget-table-compact tr.chapter-row { background-color: #f8fafc !important; -webkit-print-color-adjust: exact; }
          .chart-container-print { height: 250px !important; width: 100% !important; }
        }
        .budget-table-compact { border-spacing: 0; width: 100%; border-collapse: collapse; }
        .budget-table-compact th { background-color: #0f172a; color: white; }
      `}</style>
      
      {/* Export Toolbar */}
      <div className="no-print max-w-[210mm] mx-auto mb-8 bg-slate-900 p-6 rounded-[2rem] shadow-2xl flex items-center justify-between">
         <div className="flex items-center gap-4 text-white">
            <div className="p-3 bg-blue-600 rounded-2xl"><FileText size={20}/></div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Audit Export Manager</p>
               <p className="text-lg font-black uppercase">Relatório Técnico Pro</p>
            </div>
         </div>
         <div className="flex gap-3">
            <button onClick={() => window.print()} className="px-6 py-3 bg-white text-slate-900 rounded-xl font-black text-[10px] uppercase flex items-center gap-2 hover:bg-slate-100 transition-all"><Printer size={14}/> Imprimir / PDF</button>
            <button onClick={exportToHtml} className="px-6 py-3 bg-slate-800 text-white rounded-xl font-black text-[10px] uppercase flex items-center gap-2 hover:bg-slate-700 transition-all border border-slate-700"><Globe size={14}/> HTML</button>
            <button onClick={exportToDoc} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase flex items-center gap-2 hover:bg-blue-700 transition-all"><Download size={14}/> Word (.doc)</button>
         </div>
      </div>

      <div id="report-to-export">
        {/* 1. CAPA */}
        <div className={pageClass}>
          <div className="h-full border-[10px] border-slate-900 p-16 flex flex-col justify-between items-center text-center flex-1">
            <div className="mt-10">
              <div className="w-40 h-40 bg-slate-900 text-white flex items-center justify-center text-7xl font-black italic mx-auto rounded-[2.5rem] shadow-2xl mb-8">K</div>
              <h2 className="text-xl font-light text-slate-500 uppercase tracking-[0.4em] mb-4">Eficiência em Sistemas de Ar</h2>
              <h1 className="text-5xl font-black text-slate-900 leading-[1.1] uppercase tracking-tighter">DIAGNÓSTICO ENERGÉTICO</h1>
              <div className="mt-6 flex items-center justify-center gap-3">
                <span className="px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-2"><Fingerprint size={12}/> Ref: {project.projectReference}</span>
              </div>
              <div className="w-24 h-2 bg-blue-600 mx-auto mt-10 rounded-full"></div>
            </div>
            
            <div className="space-y-10 w-full">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-black mb-3">Cliente e Instalação</p>
                <p className="text-4xl font-black text-slate-800 tracking-tight">{project.clientName}</p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-xl text-slate-600 font-bold">{project.installation}</p>
                <p className="text-base text-slate-400 font-medium flex items-center justify-center gap-2"><MapPin size={16}/> {project.location}</p>
              </div>
            </div>

            <div className="w-full border-t border-slate-100 pt-10 flex justify-between items-end">
              <div className="text-left">
                <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">Empresa Auditora</p>
                <p className="text-slate-900 text-xl font-black uppercase tracking-tight mb-4 flex items-center gap-2"><Building2 size={18} className="text-blue-600"/> {project.auditorCompany}</p>
                
                <p className="text-blue-600 text-2xl font-black uppercase tracking-tight">{project.technicianName}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Auditor Energético Responsável</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 font-mono text-base">{project.date}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. ÍNDICE */}
        <div className={pageClass}>
          <h2 className="text-4xl font-black mb-20 flex items-center gap-6">ÍNDICE DETALHADO <span className="flex-1 h-[2px] bg-slate-100"></span></h2>
          <div className="space-y-10 text-xl">
            {[
              { id: '01', title: 'Resumo Executivo e Resultados Globais' },
              { id: '02', title: 'Metodologia e Referenciais Técnicos (ISO 50001)' },
              { id: '03', title: 'Cenário Auditado: Análise do Sistema Atual' },
              { id: '04', title: 'Cenário Proposto: Estratégias de Eficiência' },
              { id: '05', title: 'Análise Cronológica de Carga e Fluxo (Diagramas)' },
              { id: '06', title: 'Plano de Investimento (CAPEX) Detalhado' },
              { id: '07', title: 'Parecer Técnico, Sustentabilidade e Conclusão' }
            ].map(item => (
              <div key={item.id} className="flex items-end gap-5">
                <span className="font-mono text-blue-600 font-black text-3xl leading-none">{item.id}</span>
                <span className="font-bold text-slate-800 uppercase text-base tracking-tight">{item.title}</span>
                <div className="flex-1 border-b-[2px] border-dotted border-slate-200 mb-2"></div>
                <span className="font-mono text-slate-400 text-base">{parseInt(item.id) + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 01. RESUMO EXECUTIVO */}
        <div className={pageClass}>
          <h2 className="text-[14px] font-black text-blue-600 uppercase tracking-widest mb-4">Capítulo 01</h2>
          <h3 className="text-4xl font-black text-slate-900 mb-12 uppercase tracking-tighter">Resumo Executivo</h3>
          <div className="space-y-10 text-slate-700 leading-relaxed text-lg text-justify">
            <div className="p-10 bg-slate-900 text-white rounded-[3rem] shadow-xl space-y-8">
               <h4 className="text-blue-400 font-black uppercase text-sm tracking-widest">Impacto da Intervenção Proposta</h4>
               <div className="grid grid-cols-2 gap-12">
                  <div className="space-y-2">
                     <p className="text-sm opacity-50 uppercase font-black">Poupança Anual Estimada</p>
                     <p className="text-5xl font-black text-emerald-400">{results.savingsEuro.toLocaleString()} € / Ano</p>
                  </div>
                  <div className="space-y-2">
                     <p className="text-sm opacity-50 uppercase font-black">Retorno do Investimento</p>
                     <p className="text-5xl font-black text-blue-400">{results.paybackYears.toFixed(1)} Anos</p>
                  </div>
               </div>
            </div>
            <p className="font-medium">O presente relatório detalha o diagnóstico energético efetuado à instalação fabril {project.installation}. Identificou-se um potencial de otimização crítico, com uma melhoria projetada no Consumo Específico (SEC) de <strong>{((1 - results.proposedSEC / results.baseSEC) * 100).toFixed(1)}%</strong>.</p>
            <div className="grid grid-cols-3 gap-6">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                    <Leaf className="text-emerald-500 mx-auto mb-3" size={32}/>
                    <p className="text-xs font-black uppercase mb-1">Impacto Carbono</p>
                    <p className="text-xl font-black">{(results.savingsEnergyKWh * 0.45 / 1000).toFixed(1)} Ton CO2</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                    <Zap className="text-blue-500 mx-auto mb-3" size={32}/>
                    <p className="text-xs font-black uppercase mb-1">Redução Energia</p>
                    <p className="text-xl font-black">{(results.savingsEnergyKWh / 1000).toFixed(1)} MWh/ano</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                    <Scale className="text-amber-500 mx-auto mb-3" size={32}/>
                    <p className="text-xs font-black uppercase mb-1">Rentabilidade</p>
                    <p className="text-xl font-black">{((results.savingsEuro / results.capexTotal) * 100).toFixed(1)}% ROI</p>
                </div>
            </div>
          </div>
        </div>

        {/* 02. METODOLOGIA */}
        <div className={pageClass}>
          <h2 className="text-[14px] font-black text-blue-600 uppercase tracking-widest mb-4">Capítulo 02</h2>
          <h3 className="text-4xl font-black text-slate-900 mb-12 uppercase tracking-tighter">Metodologia e Referenciais</h3>
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h4 className="flex items-center gap-2 font-black text-slate-800 uppercase text-xs border-b pb-2"><Microscope size={16} className="text-blue-500"/> Algoritmos de Cálculo</h4>
                    <p className="text-sm text-slate-600 leading-relaxed text-justify">
                        Os cálculos baseiam-se na <strong>Regra dos 7%</strong>: por cada bar de aumento de pressão acima de 7 bar, o consumo energético aumenta aprox. 7%. O Consumo Específico (SEC) é calculado sobre o <strong>Caudal Útil</strong> (corrigido pelo fator de fugas), garantindo que a poupança reflete o trabalho real executado.
                    </p>
                </div>
                <div className="space-y-4">
                    <h4 className="flex items-center gap-2 font-black text-slate-800 uppercase text-xs border-b pb-2"><ShieldCheck size={16} className="text-blue-500"/> Normativos Aplicados</h4>
                    <p className="text-sm text-slate-600 leading-relaxed text-justify">
                        Implementação das diretrizes da <strong>ISO 50001:2018</strong> e do <strong>Manual de Auditorias Energéticas do ADENE</strong>. A simulação de carga baseia-se num perfil cronológico de 8760 horas para capturar a variabilidade operacional anual.
                    </p>
                </div>
            </div>
            <div className="p-8 bg-slate-900 text-white rounded-[2.5rem]">
                <p className="text-[10px] font-black uppercase text-blue-400 mb-4 tracking-widest">Fórmula de Ouro da Eficiência (SEC)</p>
                <div className="flex items-center justify-center gap-8 py-6">
                    <div className="text-center font-mono italic">
                        <p className="border-b border-white pb-2 px-4 text-xl">Energia Anual Total (kWh)</p>
                        <p className="pt-2 px-4 text-xl">Volume de Ar Útil (m³)</p>
                    </div>
                    <span className="text-4xl font-black">=</span>
                    <span className="text-5xl font-black text-blue-400">kWh/m³</span>
                </div>
                <p className="text-[10px] text-center opacity-40 font-bold uppercase mt-4">Nota: Volume Útil considera a produção nominal menos o fator de fugas auditado.</p>
            </div>
          </div>
        </div>

        {/* 03. CENÁRIO BASE */}
        <div className={pageClass}>
          <h2 className="text-[14px] font-black text-red-600 uppercase tracking-widest mb-4">Capítulo 03</h2>
          <h3 className="text-4xl font-black text-slate-900 mb-12 uppercase tracking-tighter">Cenário Base (Auditado)</h3>
          <div className="space-y-8 flex-1">
            <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Consumo Específico Atual</p>
                    <p className="text-3xl font-black text-red-600">{results.baseSEC.toFixed(4)} <span className="text-xs opacity-40">kWh/m³</span></p>
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Custo OPEX Anual</p>
                    <p className="text-3xl font-black text-slate-900">{results.baseTotalOpex.toLocaleString()} <span className="text-xs opacity-40">€/ano</span></p>
                </div>
            </div>
            <table className="w-full text-sm border-collapse rounded-3xl overflow-hidden shadow-sm">
               <thead className="bg-slate-900 text-white">
                  <tr className="text-[10px] font-black uppercase tracking-widest"><th className="p-5 text-left">Indicador Técnico Medido</th><th className="p-5 text-right">Métrica Auditada</th></tr>
               </thead>
               <tbody className="divide-y divide-slate-100 bg-white">
                  {[
                    ["Tipo de Compressor", project.baseScenario.compressorType],
                    ["Caudal de Produção (m³/min)", (project.baseScenario.flowLS * 0.06).toFixed(2)],
                    ["Pressão de Rede", project.baseScenario.pressureBar + " bar"],
                    ["Nível de Fugas (Leakage)", project.baseScenario.leakPercentage + " %"],
                    ["Horas Anuais em Vazio", (project.baseScenario.hoursUnloadPerDay * project.baseScenario.daysPerWeek * project.baseScenario.weeksPerYear).toLocaleString() + " h"],
                    ["Manutenção Base", project.baseScenario.maintenanceCostEuroPerYear.toLocaleString() + " €/ano"]
                  ].map(([l, v], i) => (
                    <tr key={i}><td className="p-5 font-bold text-slate-600 uppercase text-[10px]">{l}</td><td className="p-5 text-right font-black text-slate-900">{v}</td></tr>
                  ))}
               </tbody>
            </table>
            <div className="p-8 bg-red-50 border-2 border-red-100 rounded-[2.5rem] flex gap-6 items-start">
              <AlertTriangle className="text-red-600 shrink-0" size={32}/>
              <div>
                <h5 className="font-black text-red-900 uppercase text-xs mb-2">Justificação Técnica da Ineficiência</h5>
                <p className="text-slate-700 text-sm leading-relaxed italic text-justify">
                    A operação atual demonstra um desperdício crítico durante os períodos de vazio. O custo da energia consumida sem produção de ar útil representa aproximadamente <strong>{((project.baseScenario.hoursUnloadPerDay / project.baseScenario.hoursLoadPerDay) * 100).toFixed(0)}%</strong> do custo energético direto. Além disso, o nível de fugas de {project.baseScenario.leakPercentage}% é considerado excessivo para padrões industriais modernos.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 04. CENÁRIO PROPOSTO */}
        <div className={pageClass}>
          <h2 className="text-[14px] font-black text-emerald-600 uppercase tracking-widest mb-4">Capítulo 04</h2>
          <h3 className="text-4xl font-black text-slate-900 mb-12 uppercase tracking-tighter">Cenário Proposto (Upgrade)</h3>
          <div className="space-y-8 flex-1">
            <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                    <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">Novo Consumo Específico</p>
                    <p className="text-3xl font-black text-emerald-700">{results.proposedSEC.toFixed(4)} <span className="text-xs opacity-40">kWh/m³</span></p>
                </div>
                <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                    <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">Poupança OPEX Estimada</p>
                    <p className="text-3xl font-black text-emerald-800">{results.savingsEuro.toLocaleString()} <span className="text-xs opacity-40">€/ano</span></p>
                </div>
            </div>
            <table className="w-full text-sm border-collapse rounded-3xl overflow-hidden shadow-sm">
               <thead className="bg-slate-900 text-white">
                  <tr className="text-[10px] font-black uppercase tracking-widest"><th className="p-5 text-left">Melhoria Projetada</th><th className="p-5 text-right">Alvo de Eficiência</th></tr>
               </thead>
               <tbody className="divide-y divide-slate-100 bg-white">
                  {[
                    ["Ativo OEM Proposto", project.proposedScenario.compressorType],
                    ["Tecnologia de Regulação", project.proposedScenario.compressorType.includes('VSD') ? 'Variável (Inversor)' : 'Fixa (Válvula)'],
                    ["Pressão Otimizada", project.proposedScenario.pressureBar + " bar"],
                    ["Alvo de Redução de Fugas", project.proposedScenario.leakPercentage + " %"],
                    ["Redução de Custo Energético", ((1 - results.proposedEnergyCost / results.baseEnergyCost) * 100).toFixed(1) + " %"],
                    ["Custo Manutenção Futuro", project.proposedScenario.maintenanceCostEuroPerYear.toLocaleString() + " €/ano"]
                  ].map(([l, v], i) => (
                    <tr key={i}><td className="p-5 font-bold text-slate-700 uppercase text-[10px]">{l}</td><td className="p-5 text-right font-black text-emerald-600">{v}</td></tr>
                  ))}
               </tbody>
            </table>
            <div className="p-8 bg-blue-50 border-2 border-blue-100 rounded-[2.5rem] flex gap-6 items-start">
              <CheckCircle className="text-blue-600 shrink-0" size={32}/>
              <div>
                <h5 className="font-black text-blue-900 uppercase text-xs mb-2">Análise de Eficiência Projetada</h5>
                <p className="text-slate-700 text-sm leading-relaxed italic text-justify">
                    A estratégia centra-se na substituição do ativo principal por tecnologia VSD (Variable Speed Drive), eliminando os tempos de funcionamento em vazio. Combinado com a redução de {project.baseScenario.pressureBar - project.proposedScenario.pressureBar} bar na rede e o plano de selagem de fugas, o sistema atingirá um ponto de rendimento ótimo com um SEC {((1 - results.proposedSEC / results.baseSEC) * 100).toFixed(1)}% inferior ao atual.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 05. ANÁLISE DE CARGA */}
        <div className={pageClass}>
          <h2 className="text-[14px] font-black text-blue-600 uppercase tracking-widest mb-4">Capítulo 05</h2>
          <h3 className="text-4xl font-black text-slate-900 mb-8 uppercase tracking-tighter">Diagramas de Carga</h3>
          <div className="space-y-12">
            <div className="h-[350px] chart-container-print bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-6 text-center tracking-widest">Perfil de Consumo Diário (Potência kW por Hora)</p>
                <ResponsiveContainer width="100%" height="80%">
                  <AreaChart data={dailyChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="hour" fontSize={8} tickLine={false} axisLine={false} />
                    <YAxis fontSize={8} tickLine={false} axisLine={false} unit="kW" />
                    <Area type="stepAfter" dataKey="Base" stroke="#ef4444" fill="#ef4444" fillOpacity={0.05} strokeWidth={2} name="Base" />
                    <Area type="stepAfter" dataKey="Proposto" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.05} strokeWidth={2} name="Proposto" />
                    <Legend iconType="circle" wrapperStyle={{paddingTop: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase'}} />
                  </AreaChart>
                </ResponsiveContainer>
            </div>
            <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-4">
                <h4 className="font-black text-slate-800 uppercase text-xs flex items-center gap-2"><BarChart3 size={16} className="text-blue-500"/> Notas Técnicas do Diagrama</h4>
                <p className="text-sm text-slate-600 leading-relaxed text-justify">
                    O diagrama acima ilustra a modulação de potência necessária para suprir a procura de ar comprimido. O Cenário Proposto (Azul) demonstra um consumo significativamente inferior durante os períodos produtivos devido à menor pressão e menor rácio de fugas, e a eliminação completa dos "degraus" de consumo em vazio presentes no cenário auditado (Vermelho).
                </p>
            </div>
          </div>
        </div>

        {/* 06. ORÇAMENTO CAPEX ESTRUTURADO (COMPACTO) */}
        <div className={pageClass}>
          <h2 className="text-[12px] font-black text-blue-600 uppercase tracking-widest mb-2">Capítulo 06</h2>
          <h3 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tighter">Plano de Investimento (CAPEX)</h3>
          <div className="flex-1 overflow-hidden border border-slate-200 rounded-2xl">
            <table className="w-full border-collapse budget-table-compact bg-white">
              <thead>
                <tr className="bg-slate-900 text-white font-black uppercase text-[8px] tracking-widest">
                  <th className="p-3 text-left w-2/3">Capítulo / Artigo de Investimento</th>
                  <th className="p-3 text-center">Qtd</th>
                  <th className="p-3 text-right">Unitário (€)</th>
                  <th className="p-3 text-right">Subtotal (€)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[8px]">
                {BUDGET_CHAPTERS.map((chapter, idx) => {
                  const items = project.budgetItems.filter(i => i.chapter === chapter);
                  const chapterTotal = items.reduce((a, b) => a + b.total, 0);
                  if (items.length === 0) return null;
                  return (
                    <React.Fragment key={chapter}>
                      <tr className="chapter-row bg-slate-50 font-black border-t-2 border-slate-200">
                        <td colSpan={3} className="p-3 text-blue-800 uppercase italic">Capítulo {idx + 1}: {chapter}</td>
                        <td className="p-3 text-right text-blue-800 font-black">{chapterTotal.toLocaleString()} €</td>
                      </tr>
                      {items.map(item => (
                        <tr key={item.id} className="text-slate-600">
                          <td className="p-2 pl-6">↳ {item.description}</td>
                          <td className="p-2 text-center">{item.quantity}</td>
                          <td className="p-2 text-right">{item.unitPrice.toLocaleString()} €</td>
                          <td className="p-2 text-right font-bold text-slate-900">{item.total.toLocaleString()} €</td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-900 text-white font-black border-t-4 border-blue-600">
                  <td colSpan={3} className="p-4 text-xs text-right uppercase tracking-[0.2em]">Total Geral de Investimento (CAPEX Estimado)</td>
                  <td className="p-4 text-sm text-right text-blue-400 font-black">{results.capexTotal.toLocaleString()} €</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="mt-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
              <Info className="text-blue-500 shrink-0" size={24}/>
              <p className="text-[9px] text-slate-500 italic leading-relaxed">
                  <strong>Aviso:</strong> O orçamento apresentado é uma estimativa técnica baseada nos preços médios OEM de mercado e diretrizes de licenciamento ADENE. O Capítulo 01 (10%) cobre as despesas de engenharia e gestão de projeto. Valores sujeitos a IVA à taxa legal em vigor.
              </p>
          </div>
        </div>

        {/* 07. PARECER TÉCNICO FINAL */}
        <div className={pageClass}>
          <h2 className="text-[14px] font-black text-blue-600 uppercase tracking-widest mb-4">Capítulo 07</h2>
          <h3 className="text-4xl font-black text-slate-900 mb-12 uppercase tracking-tighter">Parecer Técnico Final</h3>
          <div className="space-y-8 text-slate-700 text-base flex-1">
            <p className="text-justify leading-relaxed">
                Com base nos dados analisados, a implementação do Cenário Proposto é altamente recomendada sob o ponto de vista técnico e financeiro. A transição para tecnologia VSD e o controle sistemático da pressão e fugas garantem uma central de ar comprimido resiliente, eficiente e em conformidade com as metas de descarbonização industrial.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div className="p-8 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] space-y-4">
                <h4 className="font-black text-slate-900 uppercase text-xs">Sumário Económico</h4>
                <div className="space-y-3">
                  <div className="flex justify-between border-b pb-2 text-sm"><span>Investimento (CAPEX)</span><span className="font-black">{results.capexTotal.toLocaleString()} €</span></div>
                  <div className="flex justify-between border-b pb-2 text-sm"><span>Economia Anual (OPEX)</span><span className="font-black text-emerald-600">{results.savingsEuro.toLocaleString()} €</span></div>
                  <div className="flex justify-between pt-2 text-sm"><span>Período Payback</span><span className="font-black text-blue-600">{results.paybackYears.toFixed(1)} Anos</span></div>
                </div>
              </div>
              <div className="p-8 bg-blue-900 text-white rounded-[2.5rem] space-y-4 shadow-xl">
                <h4 className="font-black text-blue-300 uppercase text-xs">Compromisso Ambiental</h4>
                <div className="text-center py-4 bg-white/5 rounded-2xl">
                    <p className="text-[10px] font-black uppercase opacity-60 mb-2">Redução Anual de CO2</p>
                    <p className="text-4xl font-black text-emerald-400">{(results.savingsEnergyKWh * 0.45 / 1000).toFixed(1)} <span className="text-lg">Tons</span></p>
                </div>
              </div>
            </div>
            <div className="p-8 border-l-4 border-blue-600 bg-slate-50 rounded-r-3xl text-sm italic">
                "Este diagnóstico cumpre os requisitos de auditoria para acesso a fundos de apoio à eficiência energética e descarbonização da indústria."
            </div>
          </div>
          <div className="mt-12 pt-12 grid grid-cols-2 gap-24 border-t-2 border-slate-100">
            <div>
                <div className="h-16 w-32 border-b border-slate-300 mb-2 italic text-slate-300 flex items-end">Assinado digitalmente</div>
                <p className="font-black text-slate-900 text-xl uppercase mb-1">{project.technicianName}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Auditor Energético Especialista</p>
            </div>
            <div className="flex flex-col items-center">
                <p className="text-[10px] text-slate-300 font-black uppercase mb-12 tracking-widest">Validação Entidade Auditada</p>
                <div className="w-full h-[1px] bg-slate-200"></div>
                <p className="text-[8px] text-slate-300 uppercase mt-2">Data e Assinatura Responsável</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
