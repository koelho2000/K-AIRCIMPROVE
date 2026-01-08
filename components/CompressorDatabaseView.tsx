import React, { useState, useMemo } from 'react';
import { COMPRESSOR_DATABASE } from '../utils/compressors';
import { CompressorModel, Brand, CompressorType } from '../types';
import { 
  Search, Filter, LineChart, Info, Box, Zap, Gauge, ChevronRight, 
  BarChart2, DollarSign, Activity, CheckCircle2, SlidersHorizontal, 
  ArrowRightLeft, Ruler, Weight, Scale, X, Plus, Trash2, AlertCircle, TrendingUp, TrendingDown 
} from 'lucide-react';
import { LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, AreaChart, Area } from 'recharts';

interface Props {
  onSelectForProposed?: (model: CompressorModel) => void;
  baseFlow?: number;
}

export const CompressorDatabaseView: React.FC<Props> = ({ onSelectForProposed, baseFlow }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [brandFilter, setBrandFilter] = useState<Brand | 'All'>('All');
  const [typeFilter, setTypeFilter] = useState<CompressorType | 'All'>('All');
  const [useFlowFilter, setUseFlowFilter] = useState(false);
  const [flowMargin, setFlowMargin] = useState(10);
  const [selectedId, setSelectedId] = useState<string | null>(COMPRESSOR_DATABASE[0].id);
  
  // Estado para comparação
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);
  const [isCompareView, setIsCompareView] = useState(false);

  const filteredDB = useMemo(() => {
    return COMPRESSOR_DATABASE.filter(c => {
      const matchSearch = c.model.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.brand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchBrand = brandFilter === 'All' || c.brand === brandFilter;
      const matchType = typeFilter === 'All' || c.type === typeFilter;
      
      let matchFlow = true;
      if (useFlowFilter && baseFlow) {
        const minFlow = baseFlow * (1 - flowMargin / 100);
        const maxFlow = baseFlow * (1 + flowMargin / 100);
        matchFlow = c.flowLS >= minFlow && c.flowLS <= maxFlow;
      }

      return matchSearch && matchBrand && matchType && matchFlow;
    });
  }, [searchTerm, brandFilter, typeFilter, useFlowFilter, flowMargin, baseFlow]);

  const selectedModel = useMemo(() => 
    COMPRESSOR_DATABASE.find(c => c.id === selectedId), [selectedId]);

  const comparisonModels = useMemo(() => 
    comparisonIds.map(id => COMPRESSOR_DATABASE.find(c => c.id === id)!).filter(Boolean), [comparisonIds]);

  const toggleComparison = (id: string) => {
    setComparisonIds(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id);
      if (prev.length >= 5) {
        alert("Pode comparar no máximo 5 equipamentos simultaneamente.");
        return prev;
      }
      return [...prev, id];
    });
  };

  const brands: (Brand | 'All')[] = ['All', 'Atlas Copco', 'Kaeser', 'Ingersoll Rand'];
  const types: (CompressorType | 'All')[] = ['All', 'Parafuso Velocidade Fixa', 'Parafuso VSD'];

  // Função para determinar o melhor valor de uma lista para uma propriedade
  const getBestValue = (prop: keyof CompressorModel, mode: 'min' | 'max') => {
    const values = comparisonModels
      .map(m => m[prop])
      .filter((v): v is number => typeof v === 'number');
    
    if (values.length === 0) return 0;
    return mode === 'min' ? Math.min(...values) : Math.max(...values);
  };

  if (isCompareView) {
    return (
      <div className="max-w-7xl mx-auto p-8 space-y-10 animate-in zoom-in-95 duration-500 pb-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <button 
              onClick={() => setIsCompareView(false)}
              className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all shadow-xl"
            >
              <X size={20}/>
            </button>
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-none">Comparativo Técnico</h2>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-2">Análise de Performance Multi-Ativos</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black uppercase border border-emerald-100">
                <TrendingDown size={14}/> Melhor Valor
             </div>
             <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-xl text-[10px] font-black uppercase border border-red-100">
                <TrendingUp size={14}/> Pior Valor
             </div>
          </div>
        </div>

        <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="p-10 text-left w-64 border-r border-white/5">Característica</th>
                  {comparisonModels.map(m => (
                    <th key={m.id} className="p-10 text-center min-w-[200px] border-r border-white/5 last:border-0">
                      <p className="text-[10px] font-black uppercase text-blue-400 mb-2">{m.brand}</p>
                      <p className="text-2xl font-black">{m.model}</p>
                      <button 
                        onClick={() => toggleComparison(m.id)}
                        className="mt-4 text-[10px] font-black uppercase text-white/40 hover:text-red-400 transition-colors flex items-center gap-2 mx-auto"
                      >
                        <Trash2 size={12}/> Remover
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { label: 'Tipo Tecnologia', prop: 'type', format: (v: any) => v.includes('VSD') ? 'Variável (VSD)' : 'Fixa' },
                  { label: 'Potência Nominal (kW)', prop: 'nominalPowerKW', mode: 'min' },
                  { label: 'Caudal (m³/min)', prop: 'flowLS', format: (v: number) => (v * 0.06).toFixed(2), mode: 'max' },
                  { label: 'Caudal (L/s)', prop: 'flowLS', mode: 'max' },
                  { label: 'Pressão Máxima (bar)', prop: 'pressureMaxBar', mode: 'max' },
                  { label: 'Consumo Específico (kW/m³min)', prop: 'specificPowerKW_M3min', mode: 'min' },
                  { label: 'Corrente Nominal (A)', prop: 'currentA', mode: 'min' },
                  { label: 'Peso Líquido (kg)', prop: 'weightKG', mode: 'min' },
                  { label: 'Dimensões (mm)', prop: 'dimensions' },
                  { label: 'Tensão (V)', prop: 'voltageV' },
                  { label: 'Investimento Est. (€)', prop: 'estimatedPrice', format: (v: number) => v.toLocaleString() + ' €', mode: 'min' },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-8 font-black text-slate-400 uppercase text-[10px] border-r border-slate-100 tracking-widest">{row.label}</td>
                    {comparisonModels.map(m => {
                      const val = m[row.prop as keyof CompressorModel];
                      let isBest = false;
                      let isWorst = false;

                      if (row.mode && typeof val === 'number') {
                        const best = getBestValue(row.prop as keyof CompressorModel, row.mode as 'min' | 'max');
                        const worst = getBestValue(row.prop as keyof CompressorModel, row.mode === 'min' ? 'max' : 'min');
                        isBest = val === best;
                        isWorst = val === worst && best !== worst;
                      }

                      return (
                        <td key={m.id} className={`p-8 text-center font-black text-lg border-r border-slate-100 last:border-0 ${
                          isBest ? 'text-emerald-600 bg-emerald-50/20' : isWorst ? 'text-red-600 bg-red-50/20' : 'text-slate-800'
                        }`}>
                          {row.format ? (row.format as any)(val) : (typeof val === 'object' ? null : (val as any))}
                          {isBest && <span className="block text-[8px] uppercase tracking-tighter mt-1 opacity-60">Ideal</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-10 bg-slate-900 text-white rounded-[3.5rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="space-y-4 max-w-2xl text-center md:text-left">
            <h4 className="text-xl font-black uppercase tracking-tight text-blue-400 flex items-center gap-3">
              <Scale size={24}/> Análise de Mais-Valia
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed italic">
              A comparação técnica revela as divergências de rendimento específicas de cada fabricante. Modelos com menor SEC (Consumo Específico) e menor Corrente Nominal permitem poupanças operacionais acumuladas que frequentemente superam a diferença no custo de aquisição (CAPEX) em menos de 18 meses.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {comparisonModels.map(m => (
              <button 
                key={m.id}
                onClick={() => { onSelectForProposed?.(m); setIsCompareView(false); }}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl"
              >
                Selecionar {m.model}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Floating Comparison Bar */}
      {comparisonIds.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[80] bg-slate-900 text-white px-8 py-5 rounded-[2.5rem] shadow-2xl border border-white/10 flex items-center gap-8 animate-in slide-in-from-bottom-10">
          <div className="flex items-center gap-4 border-r border-white/10 pr-8">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-lg shadow-lg">
              {comparisonIds.length}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest">Selecionados</p>
              <p className="text-[9px] text-blue-400 font-bold uppercase">Max 5 Unidades</p>
            </div>
          </div>
          <div className="flex gap-2">
            {comparisonModels.map(m => (
              <div key={m.id} className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center font-black text-[10px] relative group overflow-hidden border border-white/5">
                {m.model.split(' ')[1] || m.model.charAt(0)}
                <button 
                  onClick={() => toggleComparison(m.id)}
                  className="absolute inset-0 bg-red-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={16}/>
                </button>
              </div>
            ))}
          </div>
          <button 
            onClick={() => setIsCompareView(true)}
            className="ml-4 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl flex items-center gap-3"
          >
            <Scale size={16}/> Comparar Agora
          </button>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center gap-8">
        <div className="w-full flex flex-col xl:flex-row items-center justify-between gap-8">
          <div className="shrink-0 text-center xl:text-left">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-none">Base de Dados OEM</h2>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-2">Biblioteca Técnica de Ativos Industriais</p>
          </div>
          
          <div className="flex-1 flex flex-col md:flex-row w-full gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20}/>
              <input 
                type="text" 
                placeholder="Pesquisar modelo (ex: GA 37, ASD 40...)" 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold transition-all"
              />
            </div>
            <div className="flex gap-4">
              <select 
                value={brandFilter} 
                onChange={e => setBrandFilter(e.target.value as any)}
                className="px-6 py-4 bg-white border border-slate-200 rounded-[1.5rem] outline-none font-bold text-xs uppercase tracking-tight shadow-sm hover:border-blue-300 transition-colors"
              >
                {brands.map(b => <option key={b} value={b}>{b === 'All' ? 'TODAS AS MARCAS' : b.toUpperCase()}</option>)}
              </select>
              <select 
                value={typeFilter} 
                onChange={e => setTypeFilter(e.target.value as any)}
                className="px-6 py-4 bg-white border border-slate-200 rounded-[1.5rem] outline-none font-bold text-xs uppercase tracking-tight shadow-sm hover:border-blue-300 transition-colors"
              >
                {types.map(t => <option key={t} value={t}>{t === 'All' ? 'TODOS OS TIPOS' : t === 'Parafuso Velocidade Fixa' ? 'VEL. FIXA' : 'VSD'}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Smart Flow Filter */}
        {baseFlow && (
          <div className="w-full p-6 bg-blue-50/50 border border-blue-100 rounded-[2rem] flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl transition-all ${useFlowFilter ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-200'}`}>
                <ArrowRightLeft size={20} />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">Filtro de Caudal Inteligente</h4>
                <p className="text-[10px] text-slate-500 font-bold">Base: <span className="text-blue-600">{baseFlow} L/s</span> • {(baseFlow * 0.06).toFixed(2)} m³/min</p>
              </div>
            </div>

            <div className="flex-1 max-w-xl w-full flex items-center gap-6">
               <div className="flex-1 flex flex-col gap-2">
                 <div className="flex justify-between px-1">
                   <span className="text-[9px] font-black text-slate-400 uppercase">Margem de Erro Caudal</span>
                   <span className="text-[9px] font-black text-blue-600 uppercase">± {flowMargin}%</span>
                 </div>
                 <input 
                   type="range" 
                   min="5" 
                   max="50" 
                   step="5"
                   value={flowMargin}
                   onChange={e => setFlowMargin(parseInt(e.target.value))}
                   className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                 />
                 <div className="flex justify-between px-1 text-[8px] font-bold text-slate-400">
                    <span>{ (baseFlow * (1 - flowMargin/100)).toFixed(1) } L/s</span>
                    <span>{ (baseFlow * (1 + flowMargin/100)).toFixed(1) } L/s</span>
                 </div>
               </div>
               <div className="h-10 w-px bg-blue-200/50 hidden lg:block" />
               <button 
                 onClick={() => setUseFlowFilter(!useFlowFilter)}
                 className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${
                   useFlowFilter ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'
                 }`}
               >
                 {useFlowFilter ? 'Filtro Ativado' : 'Ativar Filtro de Caudal'}
               </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Listagem */}
        <div className="lg:col-span-7 bg-white rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <div className="flex items-center gap-3">
              <Activity size={18} className="text-blue-500"/>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Catálogo Técnico</span>
            </div>
            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full">{filteredDB.length} Modelos</span>
          </div>
          <div className="overflow-y-auto max-h-[700px] custom-scrollbar">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white/95 backdrop-blur-md z-10 border-b">
                <tr className="text-left text-[10px] font-black text-slate-400 uppercase">
                  <th className="p-8">Marca e Modelo</th>
                  <th className="p-8">Tecnologia</th>
                  <th className="p-8 text-center">P (kW)</th>
                  <th className="p-8 text-right pr-12">Caudal (m³/min)</th>
                  <th className="p-8 text-center">Comparar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredDB.map(c => (
                  <tr 
                    key={c.id} 
                    onClick={() => setSelectedId(c.id)}
                    className={`cursor-pointer transition-all duration-300 group ${selectedId === c.id ? 'bg-blue-600' : 'hover:bg-slate-50'}`}
                  >
                    <td className="p-8">
                      <p className={`font-black uppercase text-base leading-none mb-1.5 ${selectedId === c.id ? 'text-white' : 'text-slate-900'}`}>{c.model}</p>
                      <p className={`text-[10px] font-bold uppercase tracking-wider ${selectedId === c.id ? 'text-blue-100' : 'text-blue-600'}`}>{c.brand}</p>
                    </td>
                    <td className="p-8">
                      <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-tight shadow-sm ${
                        selectedId === c.id 
                          ? 'bg-white/20 text-white' 
                          : c.type.includes('VSD') ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {c.type === 'Parafuso Velocidade Fixa' ? 'Fixa' : 'Variável (VSD)'}
                      </span>
                    </td>
                    <td className={`p-8 text-center font-black text-lg ${selectedId === c.id ? 'text-white' : 'text-slate-700'}`}>{c.nominalPowerKW}</td>
                    <td className={`p-8 text-right pr-12 font-black text-lg ${selectedId === c.id ? 'text-white' : 'text-slate-700'}`}>{(c.flowLS * 0.06).toFixed(2)}</td>
                    <td className="p-8 text-center">
                       <button 
                         onClick={(e) => { e.stopPropagation(); toggleComparison(c.id); }}
                         className={`p-3 rounded-xl transition-all ${
                           comparisonIds.includes(c.id) 
                             ? 'bg-emerald-500 text-white' 
                             : selectedId === c.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400 hover:bg-blue-100 hover:text-blue-600'
                         }`}
                       >
                         {comparisonIds.includes(c.id) ? <CheckCircle2 size={20}/> : <Plus size={20}/>}
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detalhes / Eficiência */}
        <div className="lg:col-span-5 space-y-8">
          {selectedModel ? (
            <div className="bg-white rounded-[3rem] shadow-2xl shadow-blue-500/10 border border-slate-100 p-10 space-y-8 animate-in slide-in-from-right-8 duration-500 relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[5rem] -mr-16 -mt-16 opacity-50"/>
              
              <div className="flex items-center gap-6 relative z-10">
                <div className="w-20 h-20 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center font-black text-3xl italic shadow-2xl shadow-slate-900/20">
                  {selectedModel.brand.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 uppercase leading-tight mb-1">{selectedModel.model}</h3>
                  <p className="text-blue-600 font-black text-xs uppercase tracking-[0.2em]">{selectedModel.brand}</p>
                </div>
              </div>

              {onSelectForProposed && (
                <button 
                  onClick={() => onSelectForProposed(selectedModel)}
                  className="w-full py-4 bg-blue-600 text-white rounded-[1.2rem] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                >
                  <CheckCircle2 size={16} />
                  Selecionar para Cenário Proposto
                </button>
              )}

              {/* Dados Técnicos Novos */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-2 flex items-center gap-2 tracking-widest"><Ruler size={12} className="text-blue-500"/> Dimensões (mm)</p>
                  <p className="text-sm font-black text-slate-900">{selectedModel.dimensions}</p>
                </div>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-2 flex items-center gap-2 tracking-widest"><Weight size={12} className="text-blue-500"/> Peso Líquido</p>
                  <p className="text-sm font-black text-slate-900">{selectedModel.weightKG} <span className="text-[10px] opacity-40">kg</span></p>
                </div>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-2 flex items-center gap-2 tracking-widest"><Zap size={12} className="text-blue-500"/> Consumo Elétrico</p>
                  <p className="text-sm font-black text-slate-900">{selectedModel.currentA} <span className="text-[10px] opacity-40 text-blue-600 font-black">A</span></p>
                </div>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-2 flex items-center gap-2 tracking-widest"><Zap size={12} className="text-blue-500"/> Tensão Nominal</p>
                  <p className="text-sm font-black text-slate-900">{selectedModel.voltageV} <span className="text-[10px] opacity-40">V</span></p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-2 flex items-center gap-2 tracking-widest"><Gauge size={12} className="text-blue-500"/> Caudal Nominal</p>
                  <p className="text-xl font-black text-slate-900">{(selectedModel.flowLS * 0.06).toFixed(2)} <span className="text-[10px] opacity-40 font-bold">m³/min</span></p>
                </div>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-2 flex items-center gap-2 tracking-widest"><Zap size={12} className="text-blue-500"/> SEC OEM</p>
                  <p className="text-xl font-black text-slate-900">{selectedModel.specificPowerKW_M3min.toFixed(2)} <span className="text-[10px] opacity-40 font-bold">kW/m³min</span></p>
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[9px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <BarChart2 size={12} className="text-blue-600"/> Eficiência Energética
                  </p>
                  <span className={`text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-tight ${selectedModel.efficiencyCurve ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                    {selectedModel.efficiencyCurve ? 'Modulação VSD' : 'Rendimento Fixo'}
                  </span>
                </div>
                
                <div className="h-[200px] w-full border border-slate-100 rounded-[2rem] p-6 bg-slate-50/30">
                  {selectedModel.efficiencyCurve ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={selectedModel.efficiencyCurve}>
                        <defs>
                          <linearGradient id="dbCurve" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="flowPercentage" fontSize={9} axisLine={false} tickLine={false} unit="%" tick={{fill: '#94a3b8', fontWeight: 700}} />
                        <YAxis domain={['auto', 'auto']} hide />
                        <Tooltip contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                        <Area type="monotone" dataKey="specificPower" stroke="#3b82f6" fill="url(#dbCurve)" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} name="SEC" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                      <div className="p-4 bg-white rounded-full shadow-lg text-slate-200"><Activity size={32}/></div>
                      <div className="space-y-1">
                        <p className="text-[9px] text-slate-800 font-black uppercase tracking-tight">Carga Nominal Única</p>
                        <p className="text-[8px] text-slate-400 font-bold px-8 leading-relaxed">Compressores de velocidade fixa não possuem modulação eletrónica de caudal por inversor.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 bg-slate-900 text-white rounded-[2rem] shadow-2xl shadow-slate-900/20">
                <p className="text-[8px] font-black uppercase opacity-50 mb-3 tracking-[0.2em] flex items-center gap-2"><DollarSign size={10}/> Investimento Estimado</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-black">{selectedModel.estimatedPrice.toLocaleString()}</p>
                  <p className="text-lg font-bold opacity-30">€</p>
                </div>
                <p className="text-[8px] mt-3 opacity-30 font-bold italic">* Valores médios de mercado para equipamentos novos.</p>
              </div>
            </div>
          ) : (
            <div className="h-full bg-white rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-center text-slate-300 space-y-6">
               <Box size={80} strokeWidth={1}/>
               <div className="space-y-2">
                  <h4 className="font-black text-slate-900 uppercase tracking-tight">Detalhes do Modelo</h4>
                  <p className="text-xs font-bold leading-relaxed max-w-[200px] mx-auto">Selecione um equipamento para analisar as dimensões e especificações elétricas.</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
