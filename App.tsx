
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ProjectData, CalculatedResults, BudgetItem, BudgetCategory, CompressorModel, BUDGET_CHAPTERS, BudgetChapter, ScenarioData } from './types';
import { getResults } from './utils/calculations';
import { PREDEFINED_MEASURES } from './utils/measures';
import { COMPRESSOR_DATABASE } from './utils/compressors';
import { ScenarioForm } from './components/ScenarioForm';
import { Report } from './components/Report';
import { LoadDiagrams } from './components/LoadDiagrams';
import { CompressorDatabaseView } from './components/CompressorDatabaseView';
import { HelpModal } from './components/HelpModal';
import { AIAdvisorModal, AIAdvisorData } from './components/AIAdvisorModal';
import { GoogleGenAI, Type } from '@google/genai';
import { 
  Save, FolderOpen, FileText, Calculator, ArrowRight, TrendingDown,
  Clock, Euro, Plus, Trash2, CheckCircle, Info, ListChecks, BarChart3, X, Target, Globe, BookOpen, Settings, Layout, Database, TrendingUp, AlertCircle, Library, FileSpreadsheet, Percent, Wallet, MapPin, ChevronDown, ChevronRight as ChevronRightIcon, Loader2, Lock, Sparkles, ShieldCheck, Activity, Scale, Microscope, Download, Upload, HelpCircle, BrainCircuit, RefreshCw, AlertTriangle, FilePlus, Building2, Fingerprint, ChevronRight, ExternalLink, Thermometer, Droplet, Layers, Zap
} from 'lucide-react';

const APP_VERSION = "v3.0.5-PRO";

// Helper para inicializar o orçamento com rigor técnico no arranque e em atualizações
const generateTechnicalBudget = (selectedIds: string[], scenario: ScenarioData): BudgetItem[] => {
  let items: BudgetItem[] = [];
  const activeMeasures = PREDEFINED_MEASURES.filter(m => selectedIds.includes(m.id));

  activeMeasures.forEach(m => {
    m.defaultBudgetTemplates.forEach(t => {
      let finalUnitPrice = t.unitPrice;
      
      // Capitulo 4: Fornecimento (Preço OEM se selecionado)
      if (m.id === 'vsd_install' && t.chapter.includes('4. Fornecimento de novos equipamentos')) {
        const model = COMPRESSOR_DATABASE.find(cd => cd.id === scenario.selectedModelId);
        if (model) finalUnitPrice = model.estimatedPrice;
      }

      // Capitulo 5: Adaptação Civil (Baseado na potência -> rigor técnico)
      if (m.id === 'vsd_install' && t.chapter.includes('5. Obras de adaptação civil')) {
        // Estimativa técnica: maciço e ventilação proporcional à potência
        finalUnitPrice = Math.max(1200, scenario.powerLoadKW * 100);
      }

      items.push({
        ...t,
        id: Math.random().toString(36).substr(2, 9),
        measureId: m.id,
        unitPrice: finalUnitPrice,
        total: t.quantity * finalUnitPrice
      });
    });
  });

  // Capítulo 1: Estudos e Projetos (10% sobre o subtotal técnico cumulativo)
  const technicalSubtotal = items.reduce((a, b) => a + b.total, 0);
  if (technicalSubtotal > 0) {
    const fee = technicalSubtotal * 0.10;
    items.push({
      id: 'auto-project-fee',
      measureId: 'global_project',
      description: 'Estudos Prévios, Projeto de Execução e Licenciamento Técnico (10% Capex)',
      category: 'Serviço',
      chapter: BUDGET_CHAPTERS[0],
      quantity: 1,
      unitPrice: fee,
      total: fee
    });
  }

  return items;
};

const INITIAL_BASE: ScenarioData = {
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
};

// Cenário proposto por defeito como introdução manual e igual ao base
const INITIAL_PROPOSED: ScenarioData = {
  ...INITIAL_BASE,
  selectedModelId: undefined, 
};

const INITIAL_MEASURES = ['vsd_install', 'leak_repair', 'pressure_reduction'];

const INITIAL_PROJECT: ProjectData = {
  clientName: 'Indústria Têxtil Global',
  installation: 'Unidade Industrial Porto',
  location: 'Maia, Porto',
  date: new Date().toISOString().split('T')[0],
  technicianName: 'Engº José Coelho',
  auditorCompany: 'Koelho2000',
  projectReference: 'FO-XX-XX',
  energyCost: 0.145,
  selectedMeasureIds: INITIAL_MEASURES, 
  customMeasures: [],
  budgetItems: generateTechnicalBudget(INITIAL_MEASURES, INITIAL_PROPOSED),
  baseScenario: INITIAL_BASE,
  proposedScenario: INITIAL_PROPOSED
};

type ViewMode = 'editor' | 'diagrams' | 'report' | 'database';
type EditorStep = 'project' | 'assumptions' | 'base' | 'measures' | 'proposed' | 'results' | 'budget' | 'financial';

const App: React.FC = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [project, setProject] = useState<ProjectData>(INITIAL_PROJECT);
  const [view, setView] = useState<ViewMode>('editor');
  const [step, setStep] = useState<EditorStep>('project');
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set([BUDGET_CHAPTERS[0], BUDGET_CHAPTERS[3], BUDGET_CHAPTERS[4]]));
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showAIAdvisor, setShowAIAdvisor] = useState(false);
  const [aiAdvisorData, setAIAdvisorData] = useState<AIAdvisorData | null>(null);
  
  const [lastBaseForBudget, setLastBaseForBudget] = useState<string>(JSON.stringify(INITIAL_PROJECT.baseScenario));
  const [isBudgetDirty, setIsBudgetDirty] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const currentBaseStr = JSON.stringify(project.baseScenario);
    if (currentBaseStr !== lastBaseForBudget) {
      setIsBudgetDirty(true);
    }
  }, [project.baseScenario, project.proposedScenario.selectedModelId, lastBaseForBudget]);

  // Sincronização automática de medidas forçadas por alterações técnicas
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
      setIsBudgetDirty(true);
      return { ...prev, selectedMeasureIds: Array.from(current) };
    });
  }, [project.proposedScenario.pressureBar, project.proposedScenario.leakPercentage, project.proposedScenario.compressorType, project.baseScenario.pressureBar]);

  const results = useMemo(() => getResults(project), [project]);

  const handleUpdateBudget = () => {
    setIsSuggesting(true);
    setTimeout(() => {
      setProject(prev => {
        const updatedItems = generateTechnicalBudget(prev.selectedMeasureIds, prev.proposedScenario);
        return { ...prev, budgetItems: updatedItems };
      });
      
      setLastBaseForBudget(JSON.stringify(project.baseScenario));
      setIsBudgetDirty(false);
      setIsSuggesting(false);
    }, 1200);
  };

  const handleNewProject = () => {
    if (window.confirm('Tem a certeza que deseja criar um novo projeto? Todos os dados atuais não gravados serão perdidos.')) {
      setProject(INITIAL_PROJECT);
      setView('editor');
      setStep('project');
      setIsBudgetDirty(false);
      setLastBaseForBudget(JSON.stringify(INITIAL_PROJECT.baseScenario));
    }
  };

  const handleSaveProject = () => {
    const dataStr = JSON.stringify(project, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const fileName = `K-AIR_${project.clientName.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleOpenProject = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.clientName && json.baseScenario && json.proposedScenario) {
          setProject(json);
          setStep('project');
          setLastBaseForBudget(JSON.stringify(json.baseScenario));
          setIsBudgetDirty(false);
          alert('Projeto carregado com sucesso!');
        } else {
          alert('Erro: Ficheiro inválido.');
        }
      } catch (err) {
        alert('Erro ao ler o ficheiro.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

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
    if (scenario === 'proposed') setIsBudgetDirty(true);
  };

  const handleSuggestBest = async () => {
    setIsSuggesting(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const usefulFlowBase = project.baseScenario.flowLS * (1 - project.baseScenario.leakPercentage / 100);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Analise as métricas de auditoria industrial e sugira o compressor OEM ideal da base de dados fornecida. Caudal Útil Necessário: ${usefulFlowBase.toFixed(1)} L/s. Base OEM: ${JSON.stringify(COMPRESSOR_DATABASE.map(m => ({ id: m.id, brand: m.brand, model: m.model, kw: m.nominalPowerKW, flow: m.flowLS, type: m.type })))}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: { modelId: { type: Type.STRING }, justification: { type: Type.STRING } },
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
      alert('Falha na conexão IA.');
    } finally { setIsSuggesting(false); }
  };

  const handleSuggestStrategy = async () => {
    setIsSuggesting(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Como um especialista em ar comprimido e eficiência energética (ISO 50001), analise os dados auditados (Base: ${JSON.stringify(project.baseScenario)}) e proponha 4 estratégias concretas em JSON.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: { overview: { type: Type.STRING }, strategies: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING }, impact: { type: Type.STRING }, technicalReason: { type: Type.STRING }, category: { type: Type.STRING } }, required: ['title', 'description', 'impact', 'technicalReason', 'category'] } }, technicalAdvice: { type: Type.STRING } },
            required: ['overview', 'strategies', 'technicalAdvice']
          }
        }
      });
      const data = JSON.parse(response.text || '{}') as AIAdvisorData;
      setAIAdvisorData(data);
      setShowAIAdvisor(true);
    } catch (err) { alert('Erro ao gerar consultoria IA.'); }
    finally { setIsSuggesting(false); }
  };

  const handleCopyOperationalFromBase = () => {
    setProject(prev => ({
      ...prev,
      proposedScenario: {
        ...prev.proposedScenario,
        profileType: prev.baseScenario.profileType,
        loadStartTime: prev.baseScenario.loadStartTime,
        hoursLoadPerDay: prev.baseScenario.hoursLoadPerDay,
        hoursUnloadPerDay: prev.baseScenario.hoursUnloadPerDay,
        daysPerWeek: prev.baseScenario.daysPerWeek,
        weeksPerYear: prev.baseScenario.weeksPerYear,
      }
    }));
  };

  const toggleMeasure = (measureId: string) => {
    const isForced = (measureId === 'pressure_reduction' && project.proposedScenario.pressureBar < project.baseScenario.pressureBar) || 
                     (measureId === 'leak_repair' && project.proposedScenario.leakPercentage < project.baseScenario.leakPercentage) || 
                     (measureId === 'vsd_install' && (project.proposedScenario.compressorType === 'Parafuso VSD' && project.baseScenario.compressorType !== 'Parafuso VSD'));
    if (isForced) { alert("Bloqueio Técnico: Medida intrínseca."); return; }
    
    const isAlreadySelected = project.selectedMeasureIds.includes(measureId);
    setProject(prev => {
      const newIds = isAlreadySelected 
        ? prev.selectedMeasureIds.filter(id => id !== measureId)
        : [...prev.selectedMeasureIds, measureId];
      return { ...prev, selectedMeasureIds: newIds };
    });
    setIsBudgetDirty(true);
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
      if (next.has(chapter)) next.delete(chapter); else next.add(chapter);
      return next;
    });
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

  if (showIntro) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white overflow-hidden relative">
        {/* Background Glows */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-600/10 blur-[120px] rounded-full animate-pulse delay-700" />
        
        <div className="relative z-10 flex flex-col items-center max-w-2xl text-center space-y-12 animate-in fade-in zoom-in-95 duration-1000">
          <div className="flex flex-col items-center gap-6">
            <div className="w-32 h-32 bg-blue-600 rounded-[2.5rem] flex items-center justify-center font-black text-6xl italic shadow-2xl shadow-blue-500/30">K</div>
            <div className="space-y-2">
              <h1 className="text-6xl font-black tracking-tighter uppercase leading-none">K-AIRCIMPROVE</h1>
              <p className="text-xs font-black text-blue-400 uppercase tracking-[0.5em] opacity-80">Audit & Energy Pro Suite</p>
            </div>
          </div>

          <div className="h-px w-24 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

          <div className="space-y-4">
            <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-md mx-auto">
              Plataforma profissional para diagnósticos de ar comprimido, cálculos de ROI e relatórios de conformidade energética industrial.
            </p>
            <div className="flex items-center justify-center gap-4">
              <span className="px-4 py-1.5 bg-slate-800 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-700">{APP_VERSION}</span>
              <span className="px-4 py-1.5 bg-slate-800 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-700">{INITIAL_PROJECT.date}</span>
            </div>
          </div>

          <button 
            onClick={() => setShowIntro(false)}
            className="group px-16 py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-[2rem] font-black text-lg uppercase tracking-widest transition-all shadow-2xl shadow-blue-600/20 active:scale-95 flex items-center gap-4"
          >
            Seguinte
            <ChevronRight className="group-hover:translate-x-2 transition-transform" size={24}/>
          </button>
        </div>

        <footer className="absolute bottom-10 left-0 w-full px-12 flex flex-col items-center gap-4 animate-in slide-in-from-bottom-8 duration-1000 delay-300">
          <div className="flex items-center gap-3">
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Desenvolvido por</span>
             <span className="text-sm font-black text-white uppercase tracking-tight">Koelho2000</span>
          </div>
          <a 
            href="https://www.koelho2000.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase tracking-widest hover:text-blue-300 transition-colors"
          >
            www.koelho2000.com
            <ExternalLink size={12}/>
          </a>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
      <header className="no-print bg-slate-900 text-white px-8 py-4 flex items-center justify-between sticky top-0 z-50 border-b border-slate-800 shadow-xl">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => setShowIntro(true)}>
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-2xl italic shadow-blue-500/20 shadow-lg">K</div>
            <div className="hidden sm:block"><h1 className="text-xl font-bold tracking-tight leading-none mb-1 uppercase">K-AIRCIMPROVE</h1><p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Efficiency Audit Pro Suite</p></div>
          </div>
          <div className="h-10 w-px bg-slate-800 hidden md:block" />
          <div className="flex items-center gap-2">
            <button onClick={handleNewProject} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-tight"><FilePlus size={16}/> Novo</button>
            <input type="file" ref={fileInputRef} onChange={handleOpenProject} accept=".json" className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-tight"><FolderOpen size={16}/> Abrir</button>
            <button onClick={handleSaveProject} className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-tight shadow-lg shadow-blue-500/10"><Save size={16}/> Gravar</button>
            <button onClick={() => setShowHelp(true)} className="p-2.5 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-tight ml-2"><HelpCircle size={16}/> Ajuda</button>
          </div>
        </div>
        <nav className="flex bg-slate-800 p-1.5 rounded-2xl gap-1 shadow-inner">
          {[{ id: 'editor', label: 'EDITOR', icon: Calculator }, { id: 'database', label: 'BASE OEM', icon: Library }, { id: 'diagrams', label: 'DIAGRAMAS', icon: BarChart3 }, { id: 'report', label: 'RELATÓRIO', icon: FileText }].map(v => (
            <button key={v.id} onClick={() => setView(v.id as ViewMode)} className={`px-7 py-2.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-2.5 ${view === v.id ? 'bg-blue-600 shadow-md text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}><v.icon size={14}/> {v.label}</button>
          ))}
        </nav>
        <div className="text-right hidden lg:block">
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
                  <Icon size={14} className={isActive ? 'text-white' : 'text-blue-500/50'}/><span className="text-[10px] uppercase font-black tracking-tight">{s.label}</span>
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
                  <div className="space-y-3"><label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Fingerprint size={12}/> Referência do Projeto</label><input value={project.projectReference} onChange={e=>setProject({...project, projectReference:e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-transparent outline-none focus:border-blue-500 focus:bg-white transition-all font-black text-xl text-slate-800"/></div>
                  <div className="space-y-3"><label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Instalação Fabril</label><input value={project.installation} onChange={e=>setProject({...project, installation:e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-transparent outline-none focus:border-blue-500 focus:bg-white transition-all font-black text-xl text-slate-800"/></div>
                  <div className="space-y-3"><label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><MapPin size={12}/> Localização / Morada</label><input value={project.location} onChange={e=>setProject({...project, location:e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-transparent outline-none focus:border-blue-500 focus:bg-white transition-all font-black text-xl text-slate-800"/></div>
                  <div className="space-y-3"><label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Building2 size={12}/> Empresa Auditora</label><input value={project.auditorCompany} onChange={e=>setProject({...project, auditorCompany:e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-transparent outline-none focus:border-blue-500 focus:bg-white transition-all font-black text-xl text-slate-800"/></div>
                  <div className="space-y-3"><label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Auditor Responsável</label><input value={project.technicianName} onChange={e=>setProject({...project, technicianName:e.target.value})} className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-transparent outline-none focus:border-blue-500 focus:bg-white transition-all font-black text-xl text-slate-800"/></div>
                  <div className="space-y-3"><label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Custo Energético Base (€/kWh)</label><input type="number" step="0.0001" value={project.energyCost} onChange={e=>setProject({...project, energyCost:parseFloat(e.target.value) || 0})} className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-transparent outline-none focus:border-blue-500 focus:bg-white transition-all font-mono text-xl font-black text-blue-600"/></div>
                </div>
              </div>
            )}

            {step === 'assumptions' && (
              <div className="space-y-12">
                <div className="bg-slate-900 p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-12 opacity-10"><ShieldCheck size={160} className="text-blue-400"/></div>
                  <div className="flex flex-col md:flex-row items-center justify-between gap-10 mb-12 relative z-10">
                    <div className="flex items-center gap-6">
                      <div className="p-4 bg-blue-600/20 rounded-[1.5rem] text-blue-400 border border-blue-500/30">
                        <BookOpen size={40}/>
                      </div>
                      <div>
                        <h3 className="text-4xl font-black text-white uppercase tracking-tighter">Metodologia e Normativa</h3>
                        <p className="text-blue-400 font-black text-[10px] uppercase tracking-[0.3em] mt-2">Referencial Técnico Baseado no Manual ADENE</p>
                      </div>
                    </div>
                    <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Última Revisão Manual</p>
                      <p className="text-lg font-black text-white">ADENE 2016 / Koelho PRO 2025</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                    {/* Normas ISO */}
                    <div className="bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 space-y-6 hover:border-blue-500/50 transition-all group">
                      <div className="flex items-center gap-3 text-blue-400">
                        <ShieldCheck size={24} className="group-hover:scale-110 transition-transform"/>
                        <h4 className="font-black uppercase text-sm tracking-tight">Fundamentos Normativos</h4>
                      </div>
                      <div className="space-y-4">
                        <div className="flex gap-3">
                          <span className="text-[10px] font-black px-2 py-1 bg-blue-600/20 text-blue-400 rounded-lg h-fit">ISO 50001</span>
                          <p className="text-[11px] text-slate-300 leading-relaxed italic">Gestão de Eficiência Energética através do ciclo PDCA.</p>
                        </div>
                        <div className="flex gap-3">
                          <span className="text-[10px] font-black px-2 py-1 bg-blue-600/20 text-blue-400 rounded-lg h-fit">ISO 1217</span>
                          <p className="text-[11px] text-slate-300 leading-relaxed italic">Normalização FAD (Free Air Delivery) em condições de admissão 20°C/1bar.</p>
                        </div>
                        <div className="flex gap-3">
                          <span className="text-[10px] font-black px-2 py-1 bg-blue-600/20 text-blue-400 rounded-lg h-fit">ISO 8573</span>
                          <p className="text-[11px] text-slate-300 leading-relaxed italic">Classes de pureza e tratamento de ar (partículas/óleo/água).</p>
                        </div>
                      </div>
                    </div>

                    {/* Algoritmos ADENE */}
                    <div className="bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 space-y-6 hover:border-emerald-500/50 transition-all group">
                      <div className="flex items-center gap-3 text-emerald-400">
                        <Microscope size={24} className="group-hover:scale-110 transition-transform"/>
                        <h4 className="font-black uppercase text-sm tracking-tight">Algoritmos de Performance</h4>
                      </div>
                      <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                          <div className="p-1 bg-emerald-500/20 rounded-full mt-1"><ChevronRight size={10} className="text-emerald-400"/></div>
                          <p className="text-xs text-slate-300 leading-relaxed"><strong>Regra dos 7%:</strong> Cada 1 bar de pressão acima de 7 bar penaliza a potência em ~7%.</p>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="p-1 bg-emerald-500/20 rounded-full mt-1"><ChevronRight size={10} className="text-emerald-400"/></div>
                          <p className="text-xs text-slate-300 leading-relaxed"><strong>Fator Temperatura:</strong> Aumento de 3°C na aspiração reduz eficiência em 1%.</p>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="p-1 bg-emerald-500/20 rounded-full mt-1"><ChevronRight size={10} className="text-emerald-400"/></div>
                          <p className="text-xs text-slate-300 leading-relaxed"><strong>Análise LCC:</strong> 80% do custo de vida é Energia, 12% Investimento, 8% Manutenção.</p>
                        </li>
                      </ul>
                    </div>

                    {/* Metodologia de Auditoria */}
                    <div className="bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 space-y-6 hover:border-amber-500/50 transition-all group">
                      <div className="flex items-center gap-3 text-amber-400">
                        <Layers size={24} className="group-hover:scale-110 transition-transform"/>
                        <h4 className="font-black uppercase text-sm tracking-tight">Protocolo de Diagnóstico</h4>
                      </div>
                      <div className="space-y-4">
                         <p className="text-xs text-slate-300 leading-relaxed border-l-2 border-amber-500/30 pl-4">
                           Monitorização baseada em registo cronológico de <strong>7 dias consecutivos</strong> (8760h simuladas) para captura de turnos e fins-de-semana.
                         </p>
                         <p className="text-xs text-slate-300 leading-relaxed border-l-2 border-amber-500/30 pl-4">
                           Cálculo centrado no <strong>Caudal Útil</strong>: Diferenciação clara entre ar produzido e ar desperdiçado por fugas (auditado entre 20-40% na indústria média).
                         </p>
                         <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 flex gap-3 items-center">
                            <AlertTriangle size={16} className="text-amber-400 shrink-0"/>
                            <p className="text-[10px] text-amber-100 font-bold uppercase tracking-tight">Rigor Crítico: Fugas & Usos Inapropriados</p>
                         </div>
                      </div>
                    </div>
                  </div>

                  {/* Memorial de Fórmulas */}
                  <div className="mt-10 p-10 bg-black/40 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
                    <div className="absolute bottom-0 right-0 p-10 opacity-5 -mb-5 group-hover:opacity-10 transition-opacity"><Activity size={180} /></div>
                    <div className="flex items-center gap-3 text-blue-400 mb-8 border-b border-white/10 pb-4">
                      {/* Fixed: Added Zap to imports to resolve the missing name error */}
                      <Zap size={20}/>
                      <h4 className="font-black uppercase text-xs tracking-widest">Memorial Técnico de Fórmulas (SEC Pro)</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                       <div className="space-y-4 text-center">
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Energia Anual Total</p>
                          <div className="bg-white/5 p-4 rounded-2xl font-mono text-white text-lg border border-white/5">
                             E = (H<sub>L</sub> × P<sub>L</sub>) + (H<sub>U</sub> × P<sub>U</sub>)
                          </div>
                          <p className="text-[8px] text-slate-400 font-medium leading-relaxed">H<sub>L</sub>: Horas Carga | P<sub>L</sub>: Potência Corrigida<br/>H<sub>U</sub>: Horas Vazio | P<sub>U</sub>: Potência Vazio</p>
                       </div>
                       
                       <div className="space-y-4 text-center">
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Caudal Útil Global</p>
                          <div className="bg-white/5 p-4 rounded-2xl font-mono text-white text-lg border border-white/5">
                             V<sub>ú</sub> = V<sub>T</sub> × (1 - F<sub>%</sub>)
                          </div>
                          <p className="text-[8px] text-slate-400 font-medium leading-relaxed">V<sub>T</sub>: Volume Produzido Bruto<br/>F<sub>%</sub>: Percentagem de Fugas Auditada</p>
                       </div>

                       <div className="space-y-4 text-center scale-110">
                          <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Eficiência Específica Útil</p>
                          <div className="bg-blue-600/20 p-4 rounded-2xl font-mono text-blue-400 text-lg border border-blue-500/30 shadow-lg shadow-blue-500/5">
                             SEC = (E / V<sub>ú</sub>) × 60
                          </div>
                          <p className="text-[8px] text-blue-300 font-black uppercase mt-2">Unidade: kWh / m³ / min</p>
                       </div>
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

            {step === 'base' && <ScenarioForm accentColor="bg-red-500" title="Cenário Base (Auditado)" data={project.baseScenario} onChange={s=>setProject({...project, baseScenario:s})} onModelSelect={m=>handleModelSelect('base', m)}/>}
            {step === 'proposed' && <ScenarioForm accentColor="bg-emerald-500" title="Cenário Proposto" data={project.proposedScenario} onChange={s=>setProject({...project, proposedScenario:s})} onModelSelect={m=>handleModelSelect('proposed', m)} onSuggestBest={handleSuggestBest} onSuggestStrategy={handleSuggestStrategy} onCopyFromBase={handleCopyOperationalFromBase} isProposed={true}/>}
            
            {step === 'results' && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-slate-100">
                   <h4 className="text-[11px] font-black uppercase text-slate-400 mb-10 border-b pb-4">Eficiência do Consumo (SEC)</h4>
                   <div className="flex items-center justify-between gap-10">
                      <div className="text-center"><p className="text-xs font-black text-red-500 mb-2 uppercase tracking-widest">Auditado</p><p className="text-5xl font-black text-slate-900">{results.baseSEC.toFixed(2)}</p><p className="text-[10px] font-black text-slate-400 uppercase mt-2">kWh/m³/min</p></div>
                      <ArrowRight className="text-slate-300" size={40}/>
                      <div className="text-center"><p className="text-xs font-black text-emerald-500 mb-2 uppercase tracking-widest">Alvo Proposto</p><p className="text-5xl font-black text-emerald-600">{results.proposedSEC.toFixed(2)}</p><p className="text-[10px] font-black text-slate-400 uppercase mt-2">kWh/m³/min</p></div>
                   </div>
                   <div className="mt-14 p-10 bg-slate-900 text-white rounded-[2.5rem] text-center shadow-2xl">
                      <p className="text-[11px] font-black uppercase opacity-60 mb-3 tracking-widest">Ganho Líquido de Eficiência</p>
                      <p className="text-6xl font-black text-blue-400">{((1 - results.proposedSEC / results.baseSEC) * 100).toFixed(1)}%</p>
                   </div>
                </div>
                <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col justify-center">
                   <h4 className="text-[11px] font-black uppercase text-slate-400 mb-10 border-b pb-4">Poupança OPEX Estimada</h4>
                   <div className="space-y-8">
                      <div className="flex justify-between items-center p-8 bg-blue-600 text-white rounded-3xl shadow-xl shadow-blue-500/20"><span className="text-sm font-black uppercase tracking-widest opacity-60">Poupança Anual</span><span className="text-3xl font-black">{results.savingsEuro.toLocaleString()} € / Ano</span></div>
                   </div>
                </div>
              </div>
            )}

            {step === 'budget' && (
              <div className="space-y-8">
                {isBudgetDirty && (
                  <div className="bg-amber-50 border-l-8 border-amber-500 p-8 rounded-[2rem] shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-6">
                      <div className="p-4 bg-amber-100 rounded-2xl text-amber-600"><AlertTriangle size={32} /></div>
                      <div><h4 className="text-xl font-black text-amber-900 uppercase tracking-tight">Orçamento Desatualizado</h4><p className="text-sm text-amber-700 font-medium">Foram detetadas alterações técnicas nos cenários. É necessário recalcular o CAPEX.</p></div>
                    </div>
                    <button onClick={handleUpdateBudget} className="px-8 py-4 bg-amber-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-amber-700 transition-all shadow-xl shadow-amber-600/20 active:scale-95 whitespace-nowrap"><RefreshCw size={18} /> Atualizar Orçamento</button>
                  </div>
                )}
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
                            <div className="flex items-center gap-4 text-left"><ChevronRightIcon size={20} className={`text-blue-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}/><p className="font-black text-slate-900 uppercase text-sm tracking-tight">{chapter}</p></div>
                            <p className="text-lg font-black text-slate-900">{chapterTotal.toLocaleString()} €</p>
                          </button>
                          {isExpanded && (
                            <div className="p-8 space-y-4 animate-in slide-in-from-top-4">
                              {items.map(item => (
                                <div key={item.id} className="flex gap-4 items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                                  <input value={item.description} onChange={e=>updateBudgetItem(item.id, 'description', e.target.value)} className="flex-1 bg-transparent border-none outline-none font-bold text-slate-700"/>
                                  <div className="flex items-center gap-4">
                                    <div className="text-right min-w-[80px]"><p className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1">Total</p><span className="font-black text-slate-900">{item.total.toLocaleString()} €</span></div>
                                    <button onClick={()=>setProject({...project, budgetItems: project.budgetItems.filter(i=>i.id !== item.id)})} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16}/></button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {step === 'financial' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="bg-slate-900 p-12 rounded-[3.5rem] text-white shadow-2xl flex flex-col justify-center border-b-8 border-blue-600"><TrendingUp className="text-blue-400 mb-8" size={40}/><p className="text-[11px] font-black uppercase opacity-50 mb-3 tracking-[0.2em]">Investimento CAPEX</p><p className="text-5xl font-black">{results.capexTotal.toLocaleString()} €</p></div>
                <div className="bg-emerald-600 p-12 rounded-[3.5rem] text-white shadow-2xl flex flex-col justify-center border-b-8 border-emerald-400"><TrendingDown className="text-white mb-8" size={40}/><p className="text-[11px] font-black uppercase opacity-60 mb-3 tracking-[0.2em]">Fluxo Poupança Anual</p><p className="text-5xl font-black">{results.savingsEuro.toLocaleString()} €</p></div>
                <div className="bg-white p-12 rounded-[3.5rem] shadow-xl border border-slate-100 flex flex-col justify-center border-b-8 border-blue-500"><Clock className="text-blue-600 mb-8" size={40}/><p className="text-[11px] font-black uppercase text-slate-400 mb-3 tracking-[0.2em]">Período de Retorno</p><p className="text-5xl font-black text-slate-900">{results.paybackYears.toFixed(1)} <span className="text-lg">Anos</span></p></div>
              </div>
            )}
          </div>
        )}

        {view === 'database' && <CompressorDatabaseView baseFlow={project.baseScenario.flowLS} onSelectForProposed={(model) => { handleModelSelect('proposed', model); setView('editor'); setStep('proposed'); }} />}
        {view === 'diagrams' && <div className="max-w-7xl mx-auto w-full p-8"><LoadDiagrams project={project} results={results} /></div>}
        {view === 'report' && <div className="report-container p-4 animate-in zoom-in-95 duration-700"><Report project={project} results={results} /></div>}
      </main>
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
      <AIAdvisorModal isOpen={showAIAdvisor} onClose={() => setShowAIAdvisor(false)} data={aiAdvisorData} />
      {isSuggesting && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[120] flex items-center justify-center">
           <div className="bg-white p-12 rounded-[3rem] shadow-2xl flex flex-col items-center gap-8 max-w-md text-center border-t-8 border-emerald-600">
              <div className="relative"><Loader2 className="text-emerald-600 animate-spin" size={64}/><BrainCircuit className="absolute top-0 right-0 text-emerald-400 animate-pulse" size={24}/></div>
              <div><h4 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Processando Técnico</h4><p className="text-slate-500 font-medium leading-relaxed">O sistema está a aplicar as diretrizes do ADENE para recalcular os vetores de investimento com rigor.</p></div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
