
import React from 'react';
import { ProjectData, CalculatedResults, BudgetItem, BUDGET_CHAPTERS } from '../types';
import { PREDEFINED_MEASURES } from '../utils/measures';
import { generateDailyProfile } from './LoadDiagrams';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { CheckCircle, Zap, Clock, TrendingUp, Info, Droplet, Gauge, Target, DollarSign, FileText, Globe, MapPin, BarChart3, AlertTriangle, ListChecks, Award, Download, Printer, ShieldCheck, Leaf } from 'lucide-react';

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

  const pageClass = "bg-white text-slate-900 mx-auto w-[210mm] min-h-[297mm] p-[25mm] relative box-border flex flex-col shadow-2xl mb-12 border border-slate-100 page-break-after-always print:shadow-none print:m-0 print:border-none";

  return (
    <div className="report-root bg-slate-200 py-10 font-sans print:bg-white print:p-0">
      <style>{`
        @media print {
          .page-break-after-always { page-break-after: always !important; min-height: 297mm; display: block; }
          .no-print { display: none !important; }
        }
      `}</style>
      
      {/* Export Toolbar */}
      <div className="no-print max-w-[210mm] mx-auto mb-8 bg-slate-900 p-6 rounded-[2rem] shadow-2xl flex items-center justify-between">
         <div className="flex items-center gap-4 text-white">
            <div className="p-3 bg-blue-600 rounded-2xl"><FileText size={20}/></div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Audit Export Manager</p>
               <p className="text-lg font-black uppercase">Exportar Relatório Final</p>
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
            <div className="mt-20">
              <div className="w-48 h-48 bg-slate-900 text-white flex items-center justify-center text-8xl font-black italic mx-auto rounded-[3rem] shadow-2xl mb-12">K</div>
              <h2 className="text-2xl font-light text-slate-500 uppercase tracking-[0.5em] mb-6">Industrial Efficiency Diagnostic</h2>
              <h1 className="text-6xl font-black text-slate-900 leading-[1.1] uppercase tracking-tighter">Relatório Técnico de Auditoria</h1>
              <div className="w-32 h-2.5 bg-blue-600 mx-auto mt-14 rounded-full"></div>
            </div>
            <div className="space-y-12">
              <div>
                <p className="text-[12px] uppercase tracking-[0.4em] text-slate-400 font-black mb-4">Entidade Auditada</p>
                <p className="text-5xl font-black text-slate-800 tracking-tight">{project.clientName}</p>
              </div>
              <div className="flex flex-col gap-3">
                <p className="text-2xl text-slate-600 font-bold">{project.installation}</p>
                <p className="text-xl text-slate-400 font-medium flex items-center justify-center gap-2"><MapPin size={20}/> {project.location}</p>
              </div>
            </div>
            <div className="w-full border-t border-slate-100 pt-12 flex justify-between items-end">
              <div className="text-left">
                <p className="text-blue-600 text-2xl font-black uppercase tracking-tight">{project.technicianName}</p>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Auditor Energético Especialista</p>
              </div>
              <p className="text-slate-400 font-mono text-lg">{project.date}</p>
            </div>
          </div>
        </div>

        {/* 2. ÍNDICE */}
        <div className={pageClass}>
          <h2 className="text-4xl font-black mb-20 flex items-center gap-6">ÍNDICE DETALHADO <span className="flex-1 h-[2px] bg-slate-100"></span></h2>
          <div className="space-y-10 text-xl">
            {[
              { id: '01', title: 'Resumo Executivo e Objetivos Estratégicos' },
              { id: '02', title: 'Metodologia e Normativos de Cálculo (ISO 50001)' },
              { id: '03', title: 'Cenário Base (Sistema de Ar Auditado)' },
              { id: '04', title: 'Cenário Proposto (Upgrade e Otimização)' },
              { id: '05', title: 'Análise de Carga Diária e Eficiência de Fluxo' },
              { id: '06', title: 'Orçamento CAPEX Estruturado por Capítulos' },
              { id: '07', title: 'Parecer Técnico e Viabilidade Económica' }
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
          <h3 className="text-4xl font-black text-slate-900 mb-12 uppercase tracking-tighter">Resumo Executivo e Objetivos</h3>
          <div className="space-y-10 text-slate-700 leading-relaxed text-lg">
            <div className="p-10 bg-slate-900 text-white rounded-[3rem] shadow-xl space-y-8">
               <h4 className="text-blue-400 font-black uppercase text-sm tracking-widest">Principais Resultados Identificados</h4>
               <div className="grid grid-cols-2 gap-12">
                  <div className="space-y-2">
                     <p className="text-sm opacity-50 uppercase font-black">Poupança OPEX Estimada</p>
                     <p className="text-5xl font-black text-emerald-400">{results.savingsEuro.toLocaleString()} € / Ano</p>
                  </div>
                  <div className="space-y-2">
                     <p className="text-sm opacity-50 uppercase font-black">Período de Retorno (PRI)</p>
                     <p className="text-5xl font-black text-blue-400">{results.paybackYears.toFixed(1)} Anos</p>
                  </div>
               </div>
            </div>
            <div className="space-y-6">
              <h4 className="font-black text-slate-900 uppercase">Análise de Objetivos</h4>
              <p className="text-justify">A auditoria à central de {project.installation} visa alinhar a produção de ar comprimido com as metas globais de descarbonização e eficiência operacional. O objetivo central é a redução do SEC de <strong>{results.baseSEC.toFixed(4)}</strong> para <strong>{results.proposedSEC.toFixed(4)} kWh/m³</strong>, representando um ganho direto de {((1 - results.proposedSEC / results.baseSEC) * 100).toFixed(0)}% na rentabilidade energética dos ativos.</p>
            </div>
          </div>
        </div>

        {/* 02. METODOLOGIA */}
        <div className={pageClass}>
          <h2 className="text-[14px] font-black text-blue-600 uppercase tracking-widest mb-4">Capítulo 02</h2>
          <h3 className="text-4xl font-black text-slate-900 mb-12 uppercase tracking-tighter">Metodologia e Normativos</h3>
          <div className="space-y-12 text-slate-700 leading-relaxed text-lg">
            <div className="space-y-6">
              <h4 className="font-black text-slate-900 uppercase flex items-center gap-3"><Award className="text-blue-600"/> Enquadramento Legal (ISO 50001)</h4>
              <p className="text-justify">A metodologia aplicada baseia-se no ciclo PDCA (Plan-Do-Check-Act) da <strong>ISO 50001</strong>. O diagnóstico energético foca-se na identificação dos "Significant Energy Uses" (SEUs). Os cálculos de poupança seguem o manual de referência da <strong>ADENE</strong>, utilizando modelos de reflexão linear para correlação entre produção de ar e consumo elétrico.</p>
            </div>
            <div className="p-10 bg-slate-50 border-2 border-slate-100 rounded-[3rem] space-y-8">
              <h4 className="font-black text-slate-900 uppercase text-center border-b pb-4">Algoritmos de Simulação de Potência</h4>
              <div className="grid grid-cols-1 gap-8">
                <div className="space-y-2">
                  <p className="text-blue-600 font-black text-xs uppercase">Impacto da Pressão de Rede</p>
                  <p className="text-sm">Aplica-se a regra de penalização de 7% por cada bar excedente. Reduzir a pressão de {project.baseScenario.pressureBar} bar para {project.proposedScenario.pressureBar} bar gera uma poupança imediata de aprox. {((project.baseScenario.pressureBar - project.proposedScenario.pressureBar) * 7).toFixed(1)}%.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 03. CENÁRIO BASE */}
        <div className={pageClass}>
          <h2 className="text-[14px] font-black text-red-600 uppercase tracking-widest mb-4">Capítulo 03</h2>
          <h3 className="text-4xl font-black text-slate-900 mb-12 uppercase tracking-tighter">Cenário Base (Estado Auditado)</h3>
          <div className="space-y-12 flex-1">
            <table className="w-full text-sm border-collapse rounded-3xl overflow-hidden shadow-sm">
               <thead>
                  <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
                     <th className="p-5 text-left">Parâmetro Técnico Auditado</th>
                     <th className="p-5 text-right">Valor Medido / Estimado</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 bg-slate-50/50">
                  {[
                    ["Ativo Instalado", project.baseScenario.compressorType],
                    ["Caudal Nominal (L/s)", project.baseScenario.flowLS + " L/s"],
                    ["Caudal Nominal (m³/min)", (project.baseScenario.flowLS * 0.06).toFixed(2) + " m³/min"],
                    ["Potência Nominal em Carga", project.baseScenario.powerLoadKW + " kW"],
                    ["Potência em Vazio (Unload)", project.baseScenario.powerUnloadKW + " kW"],
                    ["Pressão de Serviço Média", project.baseScenario.pressureBar + " bar"],
                    ["Fugas na Rede Identificadas", project.baseScenario.leakPercentage + " %"],
                    ["Consumo Específico (SEC)", results.baseSEC.toFixed(4) + " kWh/m³"]
                  ].map(([label, val], i) => (
                    <tr key={i}>
                      <td className="p-5 font-bold text-slate-600 uppercase text-[11px]">{label}</td>
                      <td className="p-5 text-right font-black text-slate-900 text-base">{val}</td>
                    </tr>
                  ))}
               </tbody>
            </table>
            <div className="p-10 border-2 border-red-100 bg-red-50/20 rounded-[3rem] flex gap-8 items-start relative overflow-hidden">
              <AlertTriangle className="text-red-600 shrink-0" size={32}/>
              <div className="space-y-5 relative z-10">
                <h4 className="text-xl font-black text-red-900 uppercase tracking-tight">Nota de Análise do Auditor (Cenário Base)</h4>
                <p className="text-slate-700 leading-relaxed italic text-lg text-justify">"O cenário auditado revela ineficiências graves: o compressor atual gasta {project.baseScenario.hoursUnloadPerDay} horas diárias em vazio, consumindo {project.baseScenario.powerUnloadKW} kW sem gerar ar útil. A pressão excessiva e fugas de {project.baseScenario.leakPercentage}% representam um desperdício direto superior a {(results.baseEnergyCost * 0.4).toLocaleString()} € anuais."</p>
              </div>
            </div>
          </div>
        </div>

        {/* 04. CENÁRIO PROPOSTO */}
        <div className={pageClass}>
          <h2 className="text-[14px] font-black text-emerald-600 uppercase tracking-widest mb-4">Capítulo 04</h2>
          <h3 className="text-4xl font-black text-slate-900 mb-12 uppercase tracking-tighter">Cenário Proposto (Upgrade)</h3>
          <div className="space-y-12 flex-1">
            <table className="w-full text-sm border-collapse rounded-3xl overflow-hidden shadow-sm">
               <thead>
                  <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
                     <th className="p-5 text-left">Parâmetro Técnico Otimizado</th>
                     <th className="p-5 text-right">Valor Projetado Alvo</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 bg-emerald-50/30">
                  {[
                    ["Equipamento Proposto", project.proposedScenario.compressorType],
                    ["Caudal Nominal Proposto (m³/min)", (project.proposedScenario.flowLS * 0.06).toFixed(2) + " m³/min"],
                    ["Potência Nominal", project.proposedScenario.powerLoadKW + " kW"],
                    ["Pressão de Serviço Otimizada", project.proposedScenario.pressureBar + " bar"],
                    ["Meta de Fugas Pós-Intervenção", project.proposedScenario.leakPercentage + " %"],
                    ["SEC Projetado", results.proposedSEC.toFixed(4) + " kWh/m³"],
                    ["Poupança Energia Anual", results.savingsEnergyKWh.toLocaleString() + " kWh"],
                    ["Economia Financeira Alvo", results.savingsEuro.toLocaleString() + " €/ano"]
                  ].map(([label, val], i) => (
                    <tr key={i}>
                      <td className="p-5 font-bold text-slate-800 uppercase text-[11px]">{label}</td>
                      <td className="p-5 text-right font-black text-emerald-700 text-base">{val}</td>
                    </tr>
                  ))}
               </tbody>
            </table>
            {/* NOVO: Nota de Análise do Auditor (Cenário Proposto) */}
            <div className="p-10 border-2 border-emerald-100 bg-emerald-50/20 rounded-[3rem] flex gap-8 items-start relative overflow-hidden">
              <Target className="text-emerald-600 shrink-0" size={32}/>
              <div className="space-y-5 relative z-10">
                <h4 className="text-xl font-black text-emerald-900 uppercase tracking-tight">Nota de Análise do Auditor (Cenário Proposto)</h4>
                <p className="text-slate-700 leading-relaxed italic text-lg text-justify">"A solução projetada visa a modernização tecnológica da central. Ao transitar para um sistema {project.proposedScenario.compressorType}, garantimos uma modulação de potência estritamente linear com a procura. A redução sistemática das fugas para {project.proposedScenario.leakPercentage}% é crítica para assegurar que o novo investimento opere na sua curva de máxima eficiência, maximizando o ROI."</p>
              </div>
            </div>
          </div>
        </div>

        {/* 05. ANÁLISE DE CARGA DIÁRIA */}
        <div className={pageClass}>
          <h2 className="text-[14px] font-black text-blue-600 uppercase tracking-widest mb-4">Capítulo 05</h2>
          <h3 className="text-4xl font-black text-slate-900 mb-10 uppercase tracking-tighter">Análise de Carga Diária</h3>
          <div className="h-[380px] w-full bg-slate-50 border-2 border-slate-100 rounded-[3rem] p-10 mb-12">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyChartData}>
                <defs>
                  <linearGradient id="repBase" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                  <linearGradient id="repProp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="hour" fontSize={11} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 700}} />
                <YAxis fontSize={11} axisLine={false} tickLine={false} unit=" kW" tick={{fill: '#94a3b8', fontWeight: 700}} />
                <Legend verticalAlign="top" align="right" height={40}/>
                <Area type="stepAfter" dataKey="Base" stroke="#ef4444" fill="url(#repBase)" strokeWidth={4} name="Auditado (kW)" />
                <Area type="stepAfter" dataKey="Proposto" stroke="#3b82f6" fill="url(#repProp)" strokeWidth={4} name="Otimizado (kW)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {/* NOVO: Nota de Análise do Auditor (Análise da Carga Diária) */}
          <div className="p-10 border-2 border-blue-100 bg-blue-50/20 rounded-[3rem] flex gap-8 items-start relative overflow-hidden">
            <BarChart3 className="text-blue-600 shrink-0" size={32}/>
            <div className="space-y-5 relative z-10">
              <h4 className="text-xl font-black text-blue-900 uppercase tracking-tight">Nota de Análise do Auditor (Carga Diária)</h4>
              <p className="text-slate-700 leading-relaxed italic text-lg text-justify">"O histograma acima evidencia a 'morta' energética em regime de vazio do sistema atual. No cenário proposto, a área azul representa um perfil de consumo 'just-in-time', onde o desperdício noturno e de transição de turnos é virtualmente eliminado. Observa-se que a base proposta estabiliza a potência média {results.proposedEnergyKWh < results.baseEnergyKWh ? 'abaixo' : 'dentro'} dos limites de segurança operacional."</p>
            </div>
          </div>
        </div>

        {/* 06. ORÇAMENTO CAPEX ESTRUTURADO */}
        <div className={pageClass}>
          <h2 className="text-[14px] font-black text-blue-600 uppercase tracking-widest mb-4">Capítulo 06</h2>
          <h3 className="text-4xl font-black text-slate-900 mb-12 uppercase tracking-tighter">Orçamento CAPEX Estruturado</h3>
          <div className="flex-1 overflow-hidden">
            <table className="w-full text-xs border-collapse rounded-3xl overflow-hidden shadow-sm">
              <thead className="bg-slate-900 text-white font-black uppercase tracking-widest">
                <tr><th className="p-5 text-left">Capítulo / Descritivo Artigo</th><th className="p-5 text-center">Qtd</th><th className="p-5 text-right">Unitário (€)</th><th className="p-5 text-right">Subtotal (€)</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {BUDGET_CHAPTERS.map(chapter => {
                  const items = project.budgetItems.filter(i => i.chapter === chapter);
                  const chapterTotal = items.reduce((a, b) => a + b.total, 0);
                  if (items.length === 0) return null;
                  return (
                    <React.Fragment key={chapter}>
                      <tr className="bg-slate-50 font-black"><td colSpan={3} className="p-4 text-blue-700 uppercase tracking-tight text-[11px]">{chapter}</td><td className="p-4 text-right text-blue-700">{chapterTotal.toLocaleString()} €</td></tr>
                      {items.map(item => (
                        <tr key={item.id} className="text-slate-600 border-l border-r"><td className="p-4 pl-10 flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"/>{item.description}</td><td className="p-4 text-center">{item.quantity}</td><td className="p-4 text-right">{item.unitPrice.toLocaleString()} €</td><td className="p-4 text-right font-bold text-slate-900">{item.total.toLocaleString()} €</td></tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-900 text-white font-black border-t-4 border-blue-600">
                <tr><td colSpan={3} className="p-8 text-2xl text-right uppercase tracking-[0.2em]">Total Geral Investimento (CAPEX)</td><td className="p-8 text-3xl text-right text-blue-400">{results.capexTotal.toLocaleString()} €</td></tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* 07. PARECER TÉCNICO FINAL (MELHORADO) */}
        <div className={pageClass}>
          <h2 className="text-[14px] font-black text-blue-600 uppercase tracking-widest mb-4">Capítulo 07</h2>
          <h3 className="text-4xl font-black text-slate-900 mb-12 uppercase tracking-tighter">Parecer Técnico e Viabilidade Económica</h3>
          
          <div className="space-y-8 text-slate-700 leading-relaxed text-base flex-1">
            <section className="space-y-4">
              <h4 className="font-black text-slate-900 uppercase flex items-center gap-2"><ShieldCheck size={18} className="text-blue-600"/> Conclusão de Eficiência Energética</h4>
              <p className="text-justify">
                A presente auditoria técnica conclui que a implementação do Cenário Proposto resultará num ganho de eficiência sistémica de <strong>{((1 - results.proposedSEC / results.baseSEC) * 100).toFixed(1)}%</strong>. 
                A transição do SEC de {results.baseSEC.toFixed(4)} para {results.proposedSEC.toFixed(4)} kWh/m³ posiciona a unidade de {project.installation} como uma referência setorial em termos de sustentabilidade pneumática. 
                A substituição tecnológica e a gestão de fugas são os vetores fundamentais desta melhoria.
              </p>
            </section>

            <div className="grid grid-cols-2 gap-8">
              <div className="p-8 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] space-y-4">
                <h4 className="font-black text-slate-900 uppercase text-xs flex items-center gap-2"><DollarSign size={14} className="text-emerald-600"/> Viabilidade Financeira</h4>
                <div className="space-y-3">
                  <div className="flex justify-between border-b pb-2"><span>Investimento Inicial</span><span className="font-black">{results.capexTotal.toLocaleString()} €</span></div>
                  <div className="flex justify-between border-b pb-2"><span>Economia OPEX Anual</span><span className="font-black text-emerald-600">{results.savingsEuro.toLocaleString()} €</span></div>
                  <div className="flex justify-between pt-2"><span>Payback Período</span><span className="font-black text-blue-600">{results.paybackYears.toFixed(1)} Anos</span></div>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight mt-4">
                  Considerando um custo de capital (WACC) de 6% e uma inflação energética média de 4%, o Valor Atual Líquido (VAL) a 5 anos é francamente positivo.
                </p>
              </div>

              <div className="p-8 bg-blue-900 text-white rounded-[2.5rem] space-y-4 shadow-xl">
                <h4 className="font-black text-blue-300 uppercase text-xs flex items-center gap-2"><Leaf size={14}/> Impacto Ambiental (ESG)</h4>
                <div className="space-y-4">
                  <div className="text-center py-4 bg-white/5 rounded-2xl">
                    <p className="text-[10px] uppercase opacity-50">Redução Emissões CO2</p>
                    <p className="text-3xl font-black text-emerald-400">{(results.savingsEnergyKWh * 0.45 / 1000).toFixed(1)} Ton <span className="text-xs">/ Ano</span></p>
                  </div>
                  <p className="text-xs opacity-70 leading-relaxed italic">
                    "A poupança de {results.savingsEnergyKWh.toLocaleString()} kWh anuais equivale à retirada de aprox. {Math.round(results.savingsEnergyKWh / 5000)} veículos de combustão da estrada por ano."
                  </p>
                </div>
              </div>
            </div>

            <section className="space-y-4 pt-4 border-t border-slate-100">
              <h4 className="font-black text-slate-900 uppercase text-sm">Parecer do Auditor Responsável</h4>
              <p className="text-justify text-slate-600 italic">
                "Face aos indicadores de rentabilidade apresentados, o auditor recomenda a execução imediata dos capítulos 01 a 05 do orçamento CAPEX. O período de retorno inferior a 3 anos é considerado de 'baixo risco' para o setor têxtil. Recomenda-se ainda a implementação de uma monitorização contínua (sub-metering) para validar as poupanças em tempo real e garantir a manutenção do SEC proposto ao longo do ciclo de vida dos novos ativos."
              </p>
            </section>
          </div>

          <div className="mt-12 pt-12 grid grid-cols-2 gap-24 border-t-2 border-slate-100">
            <div>
               <p className="font-black text-slate-900 text-2xl uppercase mb-1 tracking-tighter">{project.technicianName}</p>
               <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">Auditor Sénior • Especialista Ar Comprimido</p>
            </div>
            <div className="flex flex-col items-center">
               <p className="text-xs text-slate-300 font-black uppercase tracking-widest mb-12">Aceitação e Validação Cliente</p>
               <div className="w-full h-[1px] bg-slate-200"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
