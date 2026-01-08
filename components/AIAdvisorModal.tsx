
import React from 'react';
import { X, BrainCircuit, Target, TrendingUp, Zap, Droplet, Gauge, CheckCircle2, AlertCircle } from 'lucide-react';

export interface AIStrategy {
  title: string;
  description: string;
  impact: string;
  technicalReason: string;
  category: 'pressure' | 'leaks' | 'technology' | 'operational';
}

export interface AIAdvisorData {
  overview: string;
  strategies: AIStrategy[];
  technicalAdvice: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: AIAdvisorData | null;
}

export const AIAdvisorModal: React.FC<Props> = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  const categoryIcons = {
    pressure: <Gauge className="text-blue-500" size={20}/>,
    leaks: <Droplet className="text-emerald-500" size={20}/>,
    technology: <Zap className="text-amber-500" size={20}/>,
    operational: <BrainCircuit className="text-indigo-500" size={20}/>
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[3rem] shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
        <header className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-600 rounded-2xl text-white shadow-lg shadow-emerald-500/20">
              <BrainCircuit size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Consultoria Estratégica IA</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Análise de Eficiência e Recomendações Técnicas</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-200 rounded-2xl transition-all text-slate-400 hover:text-slate-900">
            <X size={24} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-10">
          <section className="bg-slate-900 text-white rounded-[2.5rem] p-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12"><TrendingUp size={100}/></div>
             <div className="relative z-10 space-y-4">
               <h3 className="text-blue-400 font-black uppercase text-xs tracking-widest flex items-center gap-2"><Target size={14}/> Diagnóstico Executivo</h3>
               <p className="text-lg font-medium leading-relaxed italic">"{data.overview}"</p>
             </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.strategies.map((s, i) => (
              <div key={i} className="p-8 bg-slate-50 border border-slate-100 rounded-[2rem] space-y-4 hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      {categoryIcons[s.category]}
                      <h4 className="font-black text-slate-900 uppercase text-xs">{s.title}</h4>
                   </div>
                   <span className="text-[9px] font-black bg-white px-3 py-1 rounded-full text-slate-400 uppercase shadow-sm">{s.category}</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">{s.description}</p>
                <div className="pt-4 border-t border-slate-200 space-y-3">
                   <div className="flex gap-2">
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0"/>
                      <p className="text-[11px] font-bold text-slate-800 uppercase tracking-tight">Impacto: <span className="text-emerald-600">{s.impact}</span></p>
                   </div>
                   <p className="text-[10px] text-slate-400 leading-relaxed italic">{s.technicalReason}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-8 bg-blue-50 border border-blue-100 rounded-[2rem] space-y-4">
             <div className="flex items-center gap-2 text-blue-600 mb-2">
                <AlertCircle size={20}/>
                <h4 className="text-[11px] font-black uppercase tracking-widest">Parecer Técnico Final para o Cenário Proposto</h4>
             </div>
             <p className="text-slate-700 text-sm leading-relaxed font-medium">
               {data.technicalAdvice}
             </p>
          </div>
        </div>

        <footer className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button 
            onClick={onClose} 
            className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-95"
          >
            Fechar Consultoria
          </button>
        </footer>
      </div>
    </div>
  );
};
