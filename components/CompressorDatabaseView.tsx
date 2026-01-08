
import React, { useState, useMemo } from 'react';
import { COMPRESSOR_DATABASE } from '../utils/compressors';
import { CompressorModel, Brand, CompressorType } from '../types';
import { Search, Filter, LineChart, Info, Box, Zap, Gauge, ChevronRight, BarChart2, DollarSign, Activity, CheckCircle2 } from 'lucide-react';
import { LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, AreaChart, Area } from 'recharts';

interface Props {
  onSelectForProposed?: (model: CompressorModel) => void;
}

export const CompressorDatabaseView: React.FC<Props> = ({ onSelectForProposed }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [brandFilter, setBrandFilter] = useState<Brand | 'All'>('All');
  const [typeFilter, setTypeFilter] = useState<CompressorType | 'All'>('All');
  const [selectedId, setSelectedId] = useState<string | null>(COMPRESSOR_DATABASE[0].id);

  const filteredDB = useMemo(() => {
    return COMPRESSOR_DATABASE.filter(c => {
      const matchSearch = c.model.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.brand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchBrand = brandFilter === 'All' || c.brand === brandFilter;
      const matchType = typeFilter === 'All' || c.type === typeFilter;
      return matchSearch && matchBrand && matchType;
    });
  }, [searchTerm, brandFilter, typeFilter]);

  const selectedModel = useMemo(() => 
    COMPRESSOR_DATABASE.find(c => c.id === selectedId), [selectedId]);

  const brands: (Brand | 'All')[] = ['All', 'Atlas Copco', 'Kaeser', 'Ingersoll Rand'];
  const types: (CompressorType | 'All')[] = ['All', 'Parafuso Velocidade Fixa', 'Parafuso VSD'];

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Search & Filters */}
      <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col xl:flex-row items-center gap-8">
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detalhes / Eficiência */}
        <div className="lg:col-span-5 space-y-8">
          {selectedModel ? (
            <div className="bg-white rounded-[3rem] shadow-2xl shadow-blue-500/10 border border-slate-100 p-12 space-y-10 animate-in slide-in-from-right-8 duration-500 relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[5rem] -mr-16 -mt-16 opacity-50"/>
              
              <div className="flex items-center gap-8 relative z-10">
                <div className="w-24 h-24 bg-slate-900 text-white rounded-[2rem] flex items-center justify-center font-black text-4xl italic shadow-2xl shadow-slate-900/20">
                  {selectedModel.brand.charAt(0)}
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-900 uppercase leading-tight mb-1">{selectedModel.model}</h3>
                  <p className="text-blue-600 font-black text-xs uppercase tracking-[0.2em]">{selectedModel.brand}</p>
                </div>
              </div>

              {onSelectForProposed && (
                <button 
                  onClick={() => onSelectForProposed(selectedModel)}
                  className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                >
                  <CheckCircle2 size={18} />
                  Selecionar para Cenário Proposto
                </button>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-2 flex items-center gap-2"><Gauge size={12} className="text-blue-500"/> Caudal Nominal</p>
                  <p className="text-2xl font-black text-slate-900">{(selectedModel.flowLS * 0.06).toFixed(2)} <span className="text-xs opacity-40 font-bold">m³/min</span></p>
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-2 flex items-center gap-2"><Zap size={12} className="text-blue-500"/> Consumo Específico</p>
                  <p className="text-2xl font-black text-slate-900">{selectedModel.specificPowerKW_M3min.toFixed(2)} <span className="text-xs opacity-40 font-bold">kW/m³min</span></p>
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <BarChart2 size={14} className="text-blue-600"/> Curva de Eficiência (SEC)
                  </p>
                  <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tight ${selectedModel.efficiencyCurve ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                    {selectedModel.efficiencyCurve ? 'Análise Dinâmica VSD' : 'Rendimento Estático'}
                  </span>
                </div>
                
                <div className="h-[240px] w-full border-2 border-slate-50 rounded-[2.5rem] p-8 bg-slate-50/30">
                  {selectedModel.efficiencyCurve ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={selectedModel.efficiencyCurve}>
                        <defs>
                          <linearGradient id="dbCurve" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="flowPercentage" fontSize={10} axisLine={false} tickLine={false} unit="%" tick={{fill: '#94a3b8', fontWeight: 700}} />
                        <YAxis domain={['auto', 'auto']} hide />
                        <Tooltip contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                        <Area type="monotone" dataKey="specificPower" stroke="#3b82f6" fill="url(#dbCurve)" strokeWidth={4} dot={{ r: 6, fill: '#3b82f6', strokeWidth: 3, stroke: '#fff' }} name="SEC kW/m³min" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                      <div className="p-6 bg-white rounded-full shadow-lg text-slate-300"><Activity size={48}/></div>
                      <div className="space-y-2">
                        <p className="text-xs text-slate-800 font-black uppercase tracking-tight">Rendimento Constante</p>
                        <p className="text-[10px] text-slate-400 font-bold px-12 leading-relaxed">Modelos de velocidade fixa operam num ponto de rendimento nominal único sem modulação de caudal eletrónica.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-8 bg-slate-900 text-white rounded-[2.5rem] shadow-2xl shadow-slate-900/20">
                <p className="text-[10px] font-black uppercase opacity-50 mb-4 tracking-[0.2em] flex items-center gap-2"><DollarSign size={12}/> Estimativa de Investimento (CAPEX)</p>
                <div className="flex items-baseline gap-3">
                  <p className="text-5xl font-black">{selectedModel.estimatedPrice.toLocaleString()}</p>
                  <p className="text-xl font-bold opacity-30">€</p>
                </div>
                <p className="text-[10px] mt-4 opacity-40 font-bold italic">* Valor de referência OEM - Sujeito a cotação final.</p>
              </div>
            </div>
          ) : (
            <div className="h-full bg-white rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-center text-slate-300 space-y-6">
               <Box size={80} strokeWidth={1}/>
               <div className="space-y-2">
                  <h4 className="font-black text-slate-900 uppercase tracking-tight">Seleção de Modelo</h4>
                  <p className="text-xs font-bold leading-relaxed max-w-[250px] mx-auto">Explore a nossa biblioteca de compressores selecionando um modelo na lista lateral.</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
