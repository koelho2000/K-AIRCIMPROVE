
import React, { useMemo } from 'react';
import { ScenarioData, CompressorType, CompressorModel, ProfileType } from '../types';
import { COMPRESSOR_DATABASE } from '../utils/compressors';
import { Clock, Zap, Gauge, Box, Droplet, Layout, AlertCircle, Settings, ChevronRight, Library, Sparkles, TrendingUp, Calendar, Activity, Lightbulb, BrainCircuit, HelpCircle, Copy } from 'lucide-react';

interface Props {
  title: string;
  data: ScenarioData;
  onChange: (newData: ScenarioData) => void;
  accentColor: string;
  onModelSelect?: (model: CompressorModel) => void;
  onNavigateToDatabase?: () => void;
  onSuggestBest?: () => void;
  onSuggestStrategy?: () => void;
  onCopyFromBase?: () => void;
  isProposed?: boolean;
}

const PROFILES: Record<ProfileType, Partial<ScenarioData>> = {
  'Turno Normal (08-17h)': { loadStartTime: 8, hoursLoadPerDay: 8, hoursUnloadPerDay: 1 },
  'Turno Duplo (06-22h)': { loadStartTime: 6, hoursLoadPerDay: 14, hoursUnloadPerDay: 2 },
  'Contínuo (24h)': { loadStartTime: 0, hoursLoadPerDay: 20, hoursUnloadPerDay: 4 },
  'Personalizado': {}
};

export const ScenarioForm: React.FC<Props> = ({ 
  title, 
  data, 
  onChange, 
  accentColor, 
  onModelSelect, 
  onNavigateToDatabase,
  onSuggestBest,
  onSuggestStrategy,
  onCopyFromBase,
  isProposed 
}) => {
  const handleChange = (field: keyof ScenarioData, value: any) => {
    let newValue = value;
    
    if (field === 'daysPerWeek') newValue = Math.min(7, Math.max(0, value));
    if (field === 'weeksPerYear') newValue = Math.min(52, Math.max(0, value));
    if (field === 'hoursLoadPerDay') {
      newValue = Math.min(24, Math.max(0, value));
      if (newValue + data.hoursUnloadPerDay > 24) {
        onChange({ ...data, hoursLoadPerDay: newValue, hoursUnloadPerDay: Math.max(0, 24 - newValue) });
        return;
      }
    }
    if (field === 'hoursUnloadPerDay') {
      newValue = Math.min(24, Math.max(0, value));
      if (newValue + data.hoursLoadPerDay > 24) {
        onChange({ ...data, hoursUnloadPerDay: newValue, hoursLoadPerDay: Math.max(0, 24 - newValue) });
        return;
      }
    }

    if (field === 'profileType' && value !== 'Personalizado') {
      const profile = PROFILES[value as ProfileType];
      onChange({ ...data, profileType: value as ProfileType, ...profile });
      return;
    }

    onChange({ ...data, [field]: newValue });
  };

  const metrics = useMemo(() => {
    const pressureFactor = 1 + (data.pressureBar - 7) * 0.07;
    const powerLoadAdjusted = data.powerLoadKW * pressureFactor;
    const leakFactor = 1 + (data.leakPercentage / 100);
    
    const dailyEnergy = (data.hoursLoadPerDay * powerLoadAdjusted * leakFactor) + (data.hoursUnloadPerDay * data.powerUnloadKW);
    const annualEnergy = dailyEnergy * data.daysPerWeek * data.weeksPerYear;
    
    return {
      daily: dailyEnergy,
      annual: annualEnergy,
      flowM3Min: data.flowLS * 0.06
    };
  }, [data]);

  const totalHours = data.hoursLoadPerDay + data.hoursUnloadPerDay;
  const isInvalidHours = totalHours > 24;

  const inputClass = "w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-700 text-base shadow-inner-sm";
  const labelClass = "flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] mb-2 px-1";

  return (
    <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 h-full flex flex-col animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <h3 className="text-2xl font-black text-slate-800 flex items-center gap-4">
          <span className={`w-3 h-10 ${accentColor} rounded-full`}></span>
          {title}
        </h3>
        
        <div className="flex items-center gap-3">
           <div className="px-6 py-3 bg-slate-900 text-white rounded-2xl flex items-center gap-4 shadow-xl shadow-slate-900/10">
              <div className="text-center">
                 <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1">Consumo Dia</p>
                 <p className="text-lg font-black leading-none">{metrics.daily.toFixed(1)} <span className="text-[10px] opacity-40">kWh</span></p>
              </div>
              <div className="w-px h-6 bg-white/10"/>
              <div className="text-center">
                 <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1">Consumo Anual</p>
                 <p className="text-lg font-black leading-none">{(metrics.annual / 1000).toFixed(1)} <span className="text-[10px] opacity-40">MWh</span></p>
              </div>
           </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 flex-1">
        <div className="space-y-8">
           <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-4">
                <p className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-2"><Settings size={12}/> Seleção de Ativos OEM</p>
              </div>

              <div>
                <label className={labelClass}><Box size={14} className="text-blue-500"/> Banco de Dados de Compressores</label>
                <div className="flex gap-2">
                  <select 
                    className={inputClass}
                    value={data.selectedModelId || ''}
                    onChange={(e) => {
                      const model = COMPRESSOR_DATABASE.find(m => m.id === e.target.value);
                      if (model && onModelSelect) onModelSelect(model);
                    }}
                  >
                    <option value="">-- Introdução Manual --</option>
                    {COMPRESSOR_DATABASE.map(m => (
                      <option key={m.id} value={m.id}>{m.brand} • {m.model} ({m.nominalPowerKW}kW)</option>
                    ))}
                  </select>
                </div>
              </div>

              {isProposed && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={onSuggestBest}
                      className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 hover:bg-blue-700 transition-all"
                    >
                      <Sparkles size={14}/>
                      Sugerir Modelo ✨
                    </button>
                    <button 
                      onClick={onSuggestStrategy}
                      className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 hover:bg-emerald-700 transition-all"
                    >
                      <HelpCircle size={14}/>
                      Ajuda & Estratégias IA 💡
                    </button>
                  </div>
                  <p className="text-[9px] text-slate-400 font-bold px-1 italic text-center">A IA analisa o Cenário Base para orientar as suas escolhas de eficiência.</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-2">
                 <div>
                    <label className={labelClass}><Gauge size={14} className="text-blue-500"/> Pressão (bar)</label>
                    <input type="number" step="0.1" value={data.pressureBar} onChange={(e) => handleChange('pressureBar', parseFloat(e.target.value) || 0)} className={inputClass} />
                 </div>
                 <div>
                    <label className={labelClass}><Activity size={14} className="text-blue-500"/> Caudal (L/s)</label>
                    <input type="number" value={data.flowLS} onChange={(e) => handleChange('flowLS', parseFloat(e.target.value) || 0)} className={inputClass} />
                    <p className="text-[9px] text-blue-600 mt-2 font-black px-1 italic">Conv: {metrics.flowM3Min.toFixed(2)} m³/min</p>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-6">
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <label className={labelClass}><Zap size={14} className="text-blue-500"/> kW Carga</label>
                <input type="number" value={data.powerLoadKW} onChange={(e) => handleChange('powerLoadKW', parseFloat(e.target.value) || 0)} className={inputClass} />
              </div>
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <label className={labelClass}><Zap size={14} className="text-blue-500"/> kW Vazio</label>
                <input type="number" value={data.powerUnloadKW} onChange={(e) => handleChange('powerUnloadKW', parseFloat(e.target.value) || 0)} className={inputClass} />
              </div>
           </div>
        </div>

        <div className="space-y-8">
           <div className="p-8 bg-blue-50/30 rounded-[2rem] border border-blue-100 space-y-6">
              <div className="flex items-center justify-between mb-4 border-b border-blue-100 pb-2">
                <p className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-2"><Layout size={12}/> Planeamento Operacional</p>
                {isProposed && onCopyFromBase && (
                  <button 
                    onClick={onCopyFromBase}
                    className="flex items-center gap-1.5 px-3 py-1 bg-white border border-blue-200 rounded-lg text-[8px] font-black text-blue-600 uppercase hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                    title="Copiar horário e dias do cenário base"
                  >
                    <Copy size={10}/>
                    Copiar do Base
                  </button>
                )}
              </div>
              <div>
                <label className={labelClass}>Perfil de Horário Diário</label>
                <select className={inputClass} value={data.profileType} onChange={(e) => handleChange('profileType', e.target.value)}>
                  {Object.keys(PROFILES).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              
              <div className={`p-6 rounded-2xl border-2 transition-all ${isInvalidHours ? 'bg-red-50 border-red-200' : 'bg-white border-blue-100 shadow-sm'}`}>
                <div className="flex justify-between items-center mb-6">
                   <span className="text-[10px] font-black text-slate-400 uppercase">Distribuição de 24h</span>
                   <span className={`text-xs font-black ${isInvalidHours ? 'text-red-600' : 'text-blue-600'}`}>{totalHours}h / 24h</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase mb-2 block">Horas Carga</label>
                    <input type="number" step="0.5" value={data.hoursLoadPerDay} onChange={(e) => handleChange('hoursLoadPerDay', parseFloat(e.target.value) || 0)} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase mb-2 block">Horas Vazio</label>
                    <input type="number" step="0.5" value={data.hoursUnloadPerDay} onChange={(e) => handleChange('hoursUnloadPerDay', parseFloat(e.target.value) || 0)} className={inputClass} />
                  </div>
                </div>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-6">
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                 <label className={labelClass}><Droplet size={14} className="text-blue-500"/> Fugas (%)</label>
                 <input type="number" value={data.leakPercentage} onChange={(e) => handleChange('leakPercentage', parseFloat(e.target.value) || 0)} className={inputClass} />
              </div>
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                 <label className={labelClass}><Clock size={14} className="text-blue-500"/> Dias/Semana</label>
                 <input type="number" max="7" value={data.daysPerWeek} onChange={(e) => handleChange('daysPerWeek', parseInt(e.target.value) || 0)} className={inputClass} />
              </div>
           </div>
        </div>
      </div>

      <div className="mt-12 flex gap-4 overflow-x-auto pb-2">
         <div className="shrink-0 p-5 bg-slate-50 rounded-3xl border border-slate-100 min-w-[200px]">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Caudal Útil (Audit)</p>
            <p className="text-xl font-black text-slate-800">{(data.flowLS * (1 - data.leakPercentage/100)).toFixed(1)} L/s</p>
         </div>
         <div className="shrink-0 p-5 bg-slate-50 rounded-3xl border border-slate-100 min-w-[200px]">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Caudal Nominal (m³/min)</p>
            <p className="text-xl font-black text-blue-600">{metrics.flowM3Min.toFixed(2)} m³/min</p>
         </div>
      </div>
    </div>
  );
};
