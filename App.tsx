
import React, { useState, useMemo, useEffect } from 'react';
import { ProjectData, CalculatedResults, BudgetItem, BudgetCategory, CompressorModel, BUDGET_CHAPTERS, BudgetChapter } from './types';
import { getResults } from './utils/calculations';
import { PREDEFINED_MEASURES } from './utils/measures';
import { COMPRESSOR_DATABASE } from './utils/compressors';
import { ScenarioForm } from './components/ScenarioForm';
import { Report } from './components/Report';
import { LoadDiagrams } from './components/LoadDiagrams';
import { CompressorDatabaseView } from './components/CompressorDatabaseView';
import { GoogleGenAI, Type } from '@google/genai';
import { 
  Save, FolderOpen, FileText, Calculator, ArrowRight, TrendingDown,
  Clock, Euro, Plus, Trash2, CheckCircle, Info, ListChecks, BarChart3, X, Target, Globe, BookOpen, Settings, Layout, Database, TrendingUp, AlertCircle, Library, FileSpreadsheet, Percent, Wallet, MapPin, ChevronDown, ChevronRight as ChevronRightIcon, Loader2, Lock, Sparkles, ShieldCheck, Activity, Scale, Microscope
} from 'lucide-react';

const INITIAL_PROJECT: ProjectData = {
  clientName: 'Indústria Têxtil Global',
  installation: 'Unidade Industrial Porto',
  location: 'Maia, Porto',
  date: new Date().toISOString().split('T')[0],
  technicianName: 'Eng. Ricardo Coelho',
  energyCost: 0.145,
  selectedMeasureIds: [], 
  customMeasures: [],
  budgetItems: [],
  baseScenario: {
    compressorType: 'Parafuso Velocidade Fixa',
    profileType: 'Turno Normal (08-17h)',
    loadStartTime: 8,
    hoursLoadPerDay: 12,
    hoursUnloadPerDay: 4,
    powerLoadKW: 45,
    powerUnloadKW: 15,
    flowLS: 120,
    pressureBar: 8.5,
    leakPercentage: 25,
    daysPerWeek: 5,
    weeksPerYear: 52,
    maintenanceCostEuroPerYear: 1800
  },
  proposedScenario: {
    compressorType: 'Parafuso VSD',
    profileType: 'Turno Normal (08-17h)',
    loadStartTime: 8,
    hoursLoadPerDay: 14,
    hoursUnloadPerDay: 0.5,
    powerLoadKW: 38,
    powerUnloadKW: 8,
    flowLS: 115,
    pressureBar: 7.0,
    leakPercentage: 5,
    daysPerWeek: 5,
    weeksPerYear: 52,
    maintenanceCostEuroPerYear: 1200
  }
};

type ViewMode = 'editor' | 'diagrams' | 'report' | 'database';
type EditorStep = 'project' | 'assumptions' | 'base' | 'measures' | 'proposed' | 'results' | 'budget' | 'financial';

const App: React.FC = () => {
  const [project, setProject] = useState<ProjectData>(INITIAL_PROJECT);
  const [view, setView] = useState<ViewMode>('editor');
  const [step, setStep] = useState<EditorStep>('project');
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set([BUDGET_CHAPTERS[0], BUDGET_CHAPTERS[2]]));
  const [isSuggesting, setIsSuggesting] = useState(false);

  // Lógica de Sincronização e Bloqueio de Medidas baseada na diferenciação técnica
  useEffect(() => {
    const forcedIds: string[] = [];
    if (project.proposedScenario.pressureBar < project.baseScenario.pressureBar) forcedIds.push('pressure_reduction');
    if (project.proposedScenario.leakPercentage < project.baseScenario.leakPercentage) forcedIds.push('leak_repair');
    if (project.proposedScenario.compressorType === 'Parafuso VSD' && project.baseScenario.compressorType !== 'Parafuso VSD') forcedIds.push('vsd_install');

    setProject(prev => {
      const current = new Set(prev.selectedMeasureIds);
      let changed = false;
      forcedIds.forEach(id => {
        if (!current.has(id)) {
          current.add(id);
          changed = true;
        }
      });
      if (!changed) return prev;

      const newBudget = [...prev.budgetItems];
      forcedIds.forEach(mId => {
        if (!newBudget.some(i => i.measureId === mId)) {
          const m = PREDEFINED_MEASURES.find(x => x.id === mId);
          m?.defaultBudgetTemplates.forEach(t => {
            newBudget.push({ ...t, id: Math.random().toString(36).substr(2, 9), measureId: mId, total: t.quantity * t.unitPrice });
          });
        }
      });

      return { ...prev, selectedMeasureIds: Array.from(current), budgetItems: newBudget };
    });
  }, [project.proposedScenario.pressureBar, project.proposedScenario.leakPercentage, project.proposedScenario.compressorType, project.baseScenario.pressureBar]);

  const results = useMemo(() => getResults(project), [project]);

  const handleModelSelect = (scenario: 'base' | 'proposed', model: CompressorModel) => {
    const target = scenario === 'base' ? project.baseScenario : project.proposedScenario;
    const updated = {
      ...target,
      compressorType: model.type,
      selectedModelId: model.id,
      powerLoadKW: model.nominalPowerKW,
      flowLS: model.flowLS,
      powerUnloadKW: model.type === 'Parafuso VSD' ? model.nominalPowerKW * 0.15 : model.nominalPowerKW * 0.35
    };
    setProject(prev => ({ ...prev, [scenario === 'base' ? 'baseScenario' : 'proposedScenario']: updated }));
  };

  const handleSuggestBest = async () => {
    setIsSuggesting(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Cálculo do Caudal Útil real necessário (Ar produzido - Fugas)
    const usefulFlowBase = project.baseScenario.flowLS * (1 - project.baseScenario.leakPercentage / 100);
    const hoursUnload = project.baseScenario.hoursUnloadPerDay;
    const hoursLoad = project.baseScenario.hoursLoadPerDay;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Analise as métricas de auditoria industrial e sugira o compressor OEM ideal:
- Caudal Útil Necessário: ${usefulFlowBase.toFixed(1)} L/s.
- Horas em Vazio Atuais: ${hoursUnload}h/dia (Desperdício crítico detectado se > 1h).
- Pressão Alvo: ${project.proposedScenario.pressureBar} bar.
- Base OEM: ${JSON.stringify(COMPRESSOR_DATABASE.map(m => ({ id: m.id, brand: m.brand, model: m.model, kw: m.nominalPowerKW, flow: m.flowLS, type: m.type })))}
Instrução: Priorize obrigatoriamente 'Parafuso VSD' se houver desperdício em vazio superior a 15% do tempo de carga. Retorne JSON {modelId, justification}.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              modelId: { type: Type.STRING },
              justification: { type: Type.STRING }
            },
            required: ['modelId', 'justification']
          }
        }
      });

      const data = JSON.parse(response.text || '{}');
      const model = COMPRESSOR_DATABASE.find(m => m.id === data.modelId);
      if (model) {
        handleModelSelect('proposed', model);
        alert(`SUGESTÃO IA:\n${model.brand} ${model.model}\n\nMotivo: ${data.justification}`);
      }
    } catch (err) {
      alert('Falha na conexão IA. Selecione manualmente na Base OEM.');
    } finally {
      setIsSuggesting(false);
    }
  };

  const toggleMeasure = (measureId: string) => {
    const isPressureForced = measureId === 'pressure_reduction' && project.proposedScenario.pressureBar < project.baseScenario.pressureBar;
    const isLeakForced = measureId === 'leak_repair' && project.proposedScenario.leakPercentage < project.baseScenario.leakPercentage;
    const isVsdForced = measureId === 'vsd_install' && (project.proposedScenario.compressorType === 'Parafuso VSD' && project.baseScenario.compressorType !== 'Parafuso VSD');

    if (isPressureForced || isLeakForced || isVsdForced) {
      alert("Bloqueio Técnico: Esta medida é intrínseca às melhorias definidas. Altere os valores no cenário proposto para remover.");
      return;
    }

    const isAlreadySelected = project.selectedMeasureIds.includes(measureId);
    let newBudgetItems = [...project.budgetItems];

    if (isAlreadySelected) {
      newBudgetItems = newBudgetItems.filter(item => item.measureId !== measureId);
      setProject(prev => ({
        ...prev,
        selectedMeasureIds: prev.selectedMeasureIds.filter(id => id !== measureId),
        budgetItems: newBudgetItems
      }));
    } else {
      const measure = PREDEFINED_MEASURES.find(m => m.id === measureId);
      if (measure) {
        const templates = measure.defaultBudgetTemplates.map(t => ({
          ...t,
          id: Math.random().toString(36).substr(2, 9),
          measureId: measureId,
          total: t.quantity * t.unitPrice
        }));
        newBudgetItems = [...newBudgetItems, ...templates];
      }
      setProject(prev => ({
        ...prev,
        selectedMeasureIds: [...prev.selectedMeasureIds, measureId],
        budgetItems: newBudgetItems
      }));
    }
  };

  const updateBudgetItem = (id: string, field: keyof BudgetItem, value: any) => {
    const updated = project.budgetItems.map(item => {
      if (item.id === id) {
        const up = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') up.total = up.quantity * up.unitPrice;
        return up;
      }
      return item;
    });
    setProject({ ...project, budgetItems: updated });
  };

  const toggleChapter = (chapter: string) => {
    setExpandedChapters(prev => {
      const next = new Set(prev);
      if (next.has(chapter)) next.delete(chapter);
      else next.add(chapter);
      return next;
    });
  };

  const addLineToChapter = (chapter: BudgetChapter) => {
    const newItem: BudgetItem = {
      id: Date.now().toString(),
      description: 'Novo Artigo Personalizado',
      category: 'Material',
      chapter: chapter,
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
    setProject({ ...project, budgetItems: [...project.budgetItems, newItem] });
  };

  const steps: {id: EditorStep, label: string, icon: any}[] = [
    { id: 'project', label: 'Dados Projeto', icon: Database },
    { id: 'assumptions', label: 'Metodologia', icon: BookOpen },
    { id: 'base', label: 'Auditado', icon: AlertCircle },
    { id: 'measures', label: 'Medidas', icon: ListChecks },
    { id: 'proposed', label: 'Proposto', icon: Target },
    { id: 'results', label: 'Resultados', icon: FileSpreadsheet },
    { id: 'budget', label: 'Orçamento', icon: Euro },
    { id: 'financial', label: 'Financeiro', icon: Wallet },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
      <header className="no-print bg-slate-900 text-white px-8 py-4 flex items-center justify-between sticky top-0 z-50 border-b border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-2xl italic shadow-blue-500/20 shadow-lg">K</div>
          <div><h1 className="text-xl font-bold tracking-tight leading-none mb-1 uppercase">K-AIRCIMPROVE</h1><p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Efficiency Audit Pro Suite</p></div>
        </div>
        <nav className="flex bg-slate-800 p-1.5 rounded-2xl gap-1 shadow-inner">
          {[{ id: 'editor', label: 'EDITOR', icon: Calculator }, { id: 'database', label: 'BASE OEM', icon: Library }, { id: 'diagrams', label: 'DIAGRAMAS', icon: BarChart3 }, { id: 'report', label: 'RELATÓRIO', icon: FileText }].map(v => (
            <button key={v.id} onClick={() => setView(v.id as ViewMode)} className={`px-7 py-2.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-2.5 ${view === v.id ? 'bg-blue-600 shadow-md text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}>
              <v.icon size={14}/> {v.label}
            </button>
          ))}
        </nav>
        <div className="text-right">
           <p className="text-[10px] text-slate-500 font-black uppercase tracking-tighter leading-none mb-1">Savings OPEX Anual</p>
           <p className="text-xl font-black text-emerald-400 leading-tight">{results.savingsEuro.toLocaleString()} €</p>
        </div>
      </header>

      {view === 'editor' && (
        <div className="no-print bg-white border-b border-slate-200 sticky top-[80px] z-40 overflow-x-auto shadow-sm">
          <div className="max-w-7xl mx-auto px-8 flex gap-2 py-3 min-w-max">
            {steps.map((s) => {
              const Icon = s.icon;
              const isActive = step === s.id;
              return (
                <button key={s.id} onClick={() => setStep(s.id)} className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl transition-all ${isActive ? 'bg-blue-600 text-white shadow-lg font-bold' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}>
                  <Icon size={14} className={isActive ? 'text-white' : 'text-blue-500/50'}/>
                  <span className="text-[10px] uppercase font-black tracking-tight">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col">
        {view === 'editor' && (
          <div className="max-w-7xl mx-auto w-full p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {step === 'project' && (
              <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-slate-100">
                <div className="flex items-center gap-5 mb-12"><Database className="text-blue-600" size={32}/><h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Dados Gerais do Diagnóstico</h3></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3"><label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Entidade Cliente</label><input value={project.clientName} onChange={e=>setProject({...project, clientName:e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-transparent outline-none focus:border-blue-500 focus:bg-white transition-all font-black text-xl text-slate-800"/></div>
                  <div className="space-y-3"><label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Instalação Fabril</label><input value={project.installation} onChange={e=>setProject({...project, installation:e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-transparent outline-none focus:border-blue-500 focus:bg-white transition-all font-black text-xl text-slate-800"/></div>
                  <div className="space-y-3"><label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><MapPin size={12}/> Localização / Morada</label><input value={project.location} onChange={e=>setProject({...project, location:e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-transparent outline-none focus:border-blue-500 focus:bg-white transition-all font-black text-xl text-slate-800"/></div>
                  <div className="space-y-3"><label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Auditor Responsável</label><input value={project.technicianName} onChange={e=>setProject({...project, technicianName:e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-transparent outline-none focus:border-blue-500 focus:bg-white transition-all font-black text-xl text-slate-800"/></div>
                  <div className="space-y-3"><label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Custo Energético Base (€/kWh)</label><input type="number" step="0.0001" value={project.energyCost} onChange={e=>setProject({...project, energyCost:parseFloat(e.target.value) || 0})} className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-transparent outline-none focus:border-blue-500 focus:bg-white transition-all font-mono text-xl font-black text-blue-600"/></div>
                </div>
              </div>
            )}

            {step === 'assumptions' && (
              <div className="space-y-10">
                <div className="bg-slate-900 p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-12 opacity-10"><ShieldCheck size={160} className="text-blue-400"/></div>
                  <div className="flex items-center gap-5 mb-10"><BookOpen className="text-blue-400" size={40}/><h3 className="text-3xl font-black text-white uppercase tracking-tight">Metodologia e Normativa</h3></div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                    <div className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 space-y-4">
                      <div className="flex items-center gap-3 text-blue-400"><Activity size={20}/><h4 className="font-black uppercase text-xs">ISO 50001:2018</h4></div>
                      <p className="text-sm text-slate-300 leading-relaxed italic">"Implementação do ciclo PDCA para gestão sistemática da eficiência energética em centrais de ar comprimido."</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 space-y-4">
                      <div className="flex items-center gap-3 text-emerald-400"><Scale size={20}/><h4 className="font-black uppercase text-xs">Algoritmo de Pressão</h4></div>
                      <p className="text-sm text-slate-300 leading-relaxed italic">"Regra dos 7%: Por cada bar de aumento de pressão acima de 7 bar, o consumo energético do compressor cresce aprox. 7%."</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 space-y-4">
                      <div className="flex items-center gap-3 text-orange-400"><Microscope size={20}/><h4 className="font-black uppercase text-xs">Consumo Específico</h4></div>
                      <p className="text-sm text-slate-300 leading-relaxed italic">"SEC = Energia Total (kWh) / Caudal Útil Produzido (m³). A métrica de ouro para comparar centrais de ar."</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-slate-100 space-y-8">
                     <h4 className="text-[11px] font-black uppercase text-slate-400 border-b pb-4">Fórmulas de Cálculo Aplicadas</h4>
                     <div className="space-y-6">
                        <div className="p-6 bg-slate-50 rounded-2xl space-y-2">
                           <p className="text-[9px] font-black text-blue-600 uppercase">Energia de Carga Corrigida</p>
                           <p className="font-mono text-sm font-bold">P_load_adj = P_nom * (1 + (P_bar - 7) * 0.07)</p>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-2xl space-y-2">
                           <p className="text-[9px] font-black text-blue-600 uppercase">Impacto das Fugas</p>
                           <p className="font-mono text-sm font-bold">V_util = V_total * (1 - Leak_Perc / 100)</p>
                        </div>
                     </div>
                  </div>
                  <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-slate-100 space-y-8">
                     <h4 className="text-[11px] font-black uppercase text-slate-400 border-b pb-4">Etapas do Diagnóstico K-AIRCIMPROVE</h4>
                     <div className="space-y-4">
                        {[
                          {step: "01", text: "Levantamento do Perfil de Carga (Medição Base)"},
                          {step: "02", text: "Identificação de Desperdícios (Vazio e Fugas)"},
                          {step: "03", text: "Simulação de Upgrade Tecnológico (VSD/Otimização)"},
                          {step: "04", text: "Análise de Viabilidade Económica e ROI"}
                        ].map(item => (
                          <div key={item.step} className="flex items-center gap-5 p-4 hover:bg-slate-50 rounded-2xl transition-all">
                             <span className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-xs">{item.step}</span>
                             <span className="font-bold text-slate-700 text-sm">{item.text}</span>
                          </div>
                        ))}
                     </div>
                  </div>
                </div>
              </div>
            )}

            {step === 'measures' && (
              <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-slate-100">
                <div className="flex items-center gap-5 mb-12"><ListChecks className="text-blue-600" size={32}/><h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Matriz de Medidas Sugeridas</h3></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {PREDEFINED_MEASURES.map(m => {
                    const isSel = project.selectedMeasureIds.includes(m.id);
                    const isForced = (m.id === 'pressure_reduction' && project.proposedScenario.pressureBar < project.baseScenario.pressureBar) || (m.id === 'leak_repair' && project.proposedScenario.leakPercentage < project.baseScenario.leakPercentage) || (m.id === 'vsd_install' && (project.proposedScenario.compressorType === 'Parafuso VSD' && project.baseScenario.compressorType !== 'Parafuso VSD'));
                    return (
                      <button key={m.id} onClick={() => toggleMeasure(m.id)} className={`text-left p-8 rounded-[2rem] border-2 transition-all relative overflow-hidden ${isSel ? 'border-blue-600 bg-blue-50/50 shadow-lg' : 'border-slate-100 bg-white hover:border-blue-200 shadow-sm'}`}>
                        {isForced && <div className="absolute top-4 right-4 text-blue-600 flex items-center gap-1 bg-blue-100 px-2 py-1 rounded-lg"><Lock size={12}/><span className="text-[8px] font-black uppercase">Lock Técnico</span></div>}
                        <CheckCircle size={28} className={`mb-6 ${isSel ? 'text-blue-600' : 'text-slate-200'}`}/>
                        <p className="font-black text-slate-900 mb-3 uppercase text-base">{m.title}</p>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">{m.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 'results' && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-slate-100">
                   <h4 className="text-[11px] font-black uppercase text-slate-400 mb-10 border-b pb-4">Eficiência do Consumo (SEC)</h4>
                   <div className="flex items-center justify-between gap-10">
                      <div className="text-center">
                         <p className="text-xs font-black text-red-500 mb-2 uppercase tracking-widest">Auditado</p>
                         <p className="text-5xl font-black text-slate-900">{results.baseSEC.toFixed(4)}</p>
                         <p className="text-[10px] font-black text-slate-400 uppercase mt-2">kWh/m³</p>
                      </div>
                      <ArrowRight className="text-slate-300" size={40}/>
                      <div className="text-center">
                         <p className="text-xs font-black text-emerald-500 mb-2 uppercase tracking-widest">Alvo Proposto</p>
                         <p className="text-5xl font-black text-emerald-600">{results.proposedSEC.toFixed(4)}</p>
                         <p className="text-[10px] font-black text-slate-400 uppercase mt-2">kWh/m³</p>
                      </div>
                   </div>
                   <div className="mt-14 p-10 bg-slate-900 text-white rounded-[2.5rem] text-center shadow-2xl">
                      <p className="text-[11px] font-black uppercase opacity-60 mb-3 tracking-widest">Ganho Líquido de Eficiência</p>
                      <p className="text-6xl font-black text-blue-400">{((1 - results.proposedSEC / results.baseSEC) * 100).toFixed(1)}%</p>
                   </div>
                </div>
                <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col justify-center">
                   <h4 className="text-[11px] font-black uppercase text-slate-400 mb-10 border-b pb-4">Poupança OPEX Estimada</h4>
                   <div className="space-y-8">
                      <div className="flex justify-between items-center p-8 bg-blue-600 text-white rounded-3xl shadow-xl shadow-blue-500/20">
                         <span className="text-sm font-black uppercase tracking-widest opacity-60">Poupança Anual</span>
                         <span className="text-3xl font-black">{results.savingsEuro.toLocaleString()} € / Ano</span>
                      </div>
                      <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 flex justify-between items-center">
                         <div className="text-left">
                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Volume Ar Útil</p>
                            <p className="text-2xl font-black text-slate-800">{results.proposedVolumeM3.toLocaleString()} m³/Ano</p>
                         </div>
                         <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Payback (PRI)</p>
                            <p className="text-2xl font-black text-blue-600">{results.paybackYears.toFixed(1)} Anos</p>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            )}

            {step === 'base' && <ScenarioForm accentColor="bg-red-500" title="Cenário Base (Auditado)" data={project.baseScenario} onChange={s=>setProject({...project, baseScenario:s})} onModelSelect={m=>handleModelSelect('base', m)}/>}
            {step === 'proposed' && <ScenarioForm accentColor="bg-emerald-500" title="Cenário Proposto" data={project.proposedScenario} onChange={s=>setProject({...project, proposedScenario:s})} onModelSelect={m=>handleModelSelect('proposed', m)} onSuggestBest={handleSuggestBest} isProposed={true}/>}
            
            {step === 'budget' && (
              <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-slate-100">
                <div className="flex justify-between items-center mb-12">
                  <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Plano de Investimento (CAPEX)</h3>
                  <div className="px-6 py-3 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-900/10"><p className="text-[10px] font-black uppercase opacity-50">Total Geral</p><p className="text-2xl font-black text-blue-400">{results.capexTotal.toLocaleString()} €</p></div>
                </div>
                <div className="space-y-6">
                  {BUDGET_CHAPTERS.map((chapter) => {
                    const items = project.budgetItems.filter(i => i.chapter === chapter);
                    const isExpanded = expandedChapters.has(chapter);
                    const chapterTotal = items.reduce((a, b) => a + b.total, 0);
                    return (
                      <div key={chapter} className="border border-slate-100 rounded-[2rem] overflow-hidden bg-slate-50/30">
                        <button onClick={() => toggleChapter(chapter)} className={`w-full flex items-center justify-between p-8 transition-colors ${isExpanded ? 'bg-white border-b shadow-sm' : 'hover:bg-white'}`}>
                          <div className="flex items-center gap-4 text-left">
                            <ChevronRightIcon size={20} className={`text-blue-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}/>
                            <p className="font-black text-slate-900 uppercase text-sm tracking-tight">{chapter}</p>
                          </div>
                          <p className="text-lg font-black text-slate-900">{chapterTotal.toLocaleString()} €</p>
                        </button>
                        {isExpanded && (
                          <div className="p-8 space-y-4 animate-in slide-in-from-top-4">
                            {items.map(item => (
                              <div key={item.id} className="flex gap-4 items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                                <input value={item.description} onChange={e=>updateBudgetItem(item.id, 'description', e.target.value)} className="flex-1 bg-transparent border-none outline-none font-bold text-slate-700"/>
                                <div className="flex items-center gap-4">
                                  <div className="text-right"><p className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1">Qtd</p><input type="number" value={item.quantity} onChange={e=>updateBudgetItem(item.id, 'quantity', parseFloat(e.target.value))} className="w-16 text-center bg-slate-50 rounded p-1 font-black outline-none border-b-2 border-transparent focus:border-blue-500"/></div>
                                  <div className="text-right"><p className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1">Unit (€)</p><input type="number" value={item.unitPrice} onChange={e=>updateBudgetItem(item.id, 'unitPrice', parseFloat(e.target.value))} className="w-24 text-right bg-slate-50 rounded p-1 font-black outline-none border-b-2 border-transparent focus:border-blue-500"/></div>
                                  <div className="text-right min-w-[80px]"><p className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1">Total</p><span className="font-black text-slate-900">{item.total.toLocaleString()} €</span></div>
                                  <button onClick={()=>setProject({...project, budgetItems: project.budgetItems.filter(i=>i.id !== item.id)})} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16}/></button>
                                </div>
                              </div>
                            ))}
                            <button onClick={() => addLineToChapter(chapter)} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-black text-slate-400 uppercase hover:text-blue-600 hover:border-blue-200 transition-all">+ Adicionar Artigo ao Orçamento</button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 'financial' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  <div className="bg-slate-900 p-12 rounded-[3.5rem] text-white shadow-2xl flex flex-col justify-center border-b-8 border-blue-600">
                    <TrendingUp className="text-blue-400 mb-8" size={40}/>
                    <p className="text-[11px] font-black uppercase opacity-50 mb-3 tracking-[0.2em]">Investimento CAPEX</p>
                    <p className="text-5xl font-black">{results.capexTotal.toLocaleString()} €</p>
                  </div>
                  <div className="bg-emerald-600 p-12 rounded-[3.5rem] text-white shadow-2xl flex flex-col justify-center border-b-8 border-emerald-400">
                    <TrendingDown className="text-white mb-8" size={40}/>
                    <p className="text-[11px] font-black uppercase opacity-60 mb-3 tracking-[0.2em]">Fluxo Poupança Anual</p>
                    <p className="text-5xl font-black">{results.savingsEuro.toLocaleString()} €</p>
                  </div>
                  <div className="bg-white p-12 rounded-[3.5rem] shadow-xl border border-slate-100 flex flex-col justify-center border-b-8 border-blue-500">
                    <Clock className="text-blue-600 mb-8" size={40}/>
                    <p className="text-[11px] font-black uppercase text-slate-400 mb-3 tracking-[0.2em]">Período de Retorno</p>
                    <p className="text-5xl font-black text-slate-900">{results.paybackYears.toFixed(1)} <span className="text-lg">Anos</span></p>
                  </div>
              </div>
            )}
          </div>
        )}

        {view === 'database' && <CompressorDatabaseView />}
        {view === 'diagrams' && <div className="max-w-7xl mx-auto w-full p-8"><LoadDiagrams project={project} results={results} /></div>}
        {view === 'report' && <div className="report-container p-4 animate-in zoom-in-95 duration-700"><Report project={project} results={results} /></div>}
      </main>

      {isSuggesting && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center">
           <div className="bg-white p-12 rounded-[3rem] shadow-2xl flex flex-col items-center gap-8 max-w-md text-center border-t-8 border-blue-600">
              <div className="relative">
                <Loader2 className="text-blue-600 animate-spin" size={64}/>
                <Sparkles className="absolute top-0 right-0 text-blue-400 animate-pulse" size={24}/>
              </div>
              <div>
                <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Análise IA em Curso</h4>
                <p className="text-slate-500 font-medium leading-relaxed">Cruzando dados de caudal útil e horas de vazio para determinar o compressor com a melhor curva de rendimento SEC.</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
