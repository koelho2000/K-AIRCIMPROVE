
import React, { useState, useMemo } from 'react';
import { ProjectData, CalculatedResults, ScenarioData } from '../types';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Legend, BarChart, Bar
} from 'recharts';
import { Clock, Calendar, BarChart3, Activity, Info, TrendingUp, Maximize2, Layers, Download, FileSpreadsheet } from 'lucide-react';

interface Props {
  project: ProjectData;
  results: CalculatedResults;
}

type ViewType = 'Daily' | 'Weekly' | 'Monthly' | 'Annual';

export const generateDailyProfile = (s: ScenarioData) => {
  return Array.from({ length: 24 }, (_, hour) => {
    const loadStart = s.loadStartTime;
    const loadEnd = (loadStart + s.hoursLoadPerDay) % 24;
    const unloadEnd = (loadEnd + s.hoursUnloadPerDay) % 24;

    let isLoad = false;
    if (loadStart < loadEnd) isLoad = hour >= loadStart && hour < loadEnd;
    else isLoad = hour >= loadStart || hour < loadEnd;

    let isUnload = false;
    if (loadEnd < unloadEnd) isUnload = hour >= loadEnd && hour < unloadEnd;
    else if (s.hoursUnloadPerDay > 0) isUnload = hour >= loadEnd || hour < unloadEnd;

    return isLoad ? s.powerLoadKW : isUnload ? s.powerUnloadKW : 0;
  });
};

export const generate8760Table = (s: ScenarioData) => {
  const profile = generateDailyProfile(s);
  const table = [];
  // 365 dias padrão
  for (let day = 0; day < 365; day++) {
    const dayOfWeek = day % 7;
    const weekOfYear = Math.floor(day / 7);
    const isWorkingWeek = weekOfYear < s.weeksPerYear;
    const isWorkingDay = dayOfWeek < s.daysPerWeek;

    for (let hour = 0; hour < 24; hour++) {
      const val = (isWorkingWeek && isWorkingDay) ? profile[hour] : 0;
      table.push(val);
    }
  }
  return table;
};

export const LoadDiagrams: React.FC<Props> = ({ project, results }) => {
  const [view, setView] = useState<ViewType>('Daily');

  const fullTable = useMemo(() => {
    const base = generate8760Table(project.baseScenario);
    const prop = generate8760Table(project.proposedScenario);
    return Array.from({ length: 8760 }, (_, i) => ({
      h: i,
      base: base[i] || 0,
      prop: prop[i] || 0
    }));
  }, [project]);

  const chartData = useMemo(() => {
    if (view === 'Daily') {
      return fullTable.slice(0, 24).map(d => ({ label: `${d.h % 24}h`, Base: d.base, Proposto: d.prop }));
    }
    if (view === 'Weekly') {
      return fullTable.slice(0, 168).filter((_, i) => i % 2 === 0).map(d => ({ label: `D${Math.floor(d.h/24)+1} ${d.h%24}h`, Base: d.base, Proposto: d.prop }));
    }
    if (view === 'Monthly') {
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      let cursor = 0;
      return months.map((m, i) => {
        const hours = daysInMonth[i] * 24;
        const slice = fullTable.slice(cursor, cursor + hours);
        cursor += hours;
        const baseKWh = slice.reduce((a, b) => a + b.base, 0);
        const propKWh = slice.reduce((a, b) => a + b.prop, 0);
        return { label: m, Base: baseKWh / 1000, Proposto: propKWh / 1000 };
      });
    }
    // Annual: Cronológico (365 pontos - média diária)
    return Array.from({ length: 365 }, (_, i) => {
      const start = i * 24;
      const end = (i + 1) * 24;
      const slice = fullTable.slice(start, end);
      const baseAvg = slice.reduce((a, b) => a + b.base, 0) / 24;
      const propAvg = slice.reduce((a, b) => a + b.prop, 0) / 24;
      return { label: `D${i+1}`, Base: baseAvg, Proposto: propAvg };
    });
  }, [view, fullTable]);

  const stats = useMemo(() => {
    const b = fullTable.map(d => d.base);
    const p = fullTable.map(d => d.prop);
    const totalBaseKWh = b.reduce((a,c)=>a+c,0);
    const totalPropKWh = p.reduce((a,c)=>a+c,0);
    return {
      base: { max: Math.max(...b, 0), total: totalBaseKWh },
      prop: { max: Math.max(...p, 0), total: totalPropKWh }
    };
  }, [fullTable]);

  const downloadCSV = () => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    
    let csv = 'Hora_Anual;Dia_do_Ano;Mes;Potencia_Base_kW;Potencia_Proposta_kW\n';
    
    let hourCounter = 0;
    daysInMonth.forEach((days, mIdx) => {
      for (let d = 1; d <= days; d++) {
        for (let h = 0; h < 24; h++) {
          const entry = fullTable[hourCounter];
          if (entry) {
            csv += `${hourCounter};${Math.floor(hourCounter/24)+1};${months[mIdx]};${entry.base.toFixed(2)};${entry.prop.toFixed(2)}\n`;
          }
          hourCounter++;
        }
      }
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `K-AIRCIMPROVE_Simulacao_8760h.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col xl:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
           <div className="p-5 bg-slate-900 text-white rounded-[1.5rem] shadow-xl shadow-blue-500/10"><BarChart3 size={28}/></div>
           <div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Análise de Carga 8760h</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Layers size={12} className="text-blue-500"/> Simulador de Fluxo de Potência Cronológico
              </p>
           </div>
        </div>
        <div className="flex bg-slate-200 p-1.5 rounded-2xl gap-1 shadow-inner">
          {(['Daily', 'Weekly', 'Monthly', 'Annual'] as ViewType[]).map((t) => (
            <button 
              key={t} 
              onClick={() => setView(t)} 
              className={`px-8 py-2.5 rounded-xl text-[10px] font-black transition-all ${view === t ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:bg-white/50'}`}
            >
              {t === 'Annual' ? 'PERFIL ANUAL' : t === 'Monthly' ? 'CONSUMO MENSAL' : t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 h-[550px] relative overflow-hidden">
        <div className="absolute top-8 left-10 z-10 flex flex-col md:flex-row md:items-center gap-6">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                 <div className="w-4 h-4 rounded-lg bg-red-500 shadow-sm"/>
                 <span className="text-[10px] font-black text-slate-500 uppercase">Auditado</span>
              </div>
              <div className="flex items-center gap-3">
                 <div className="w-4 h-4 rounded-lg bg-blue-500 shadow-sm"/>
                 <span className="text-[10px] font-black text-slate-500 uppercase">Proposto</span>
              </div>
           </div>
           <button 
             onClick={downloadCSV}
             className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
           >
             <FileSpreadsheet size={14}/>
             Exportar CSV 8760h
           </button>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          {view === 'Monthly' ? (
            <BarChart data={chartData} margin={{ top: 80, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="label" fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontWeight: 800}} />
              <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontWeight: 800}} unit=" MWh" />
              <Tooltip cursor={{fill: 'rgba(241, 245, 249, 0.4)'}} contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
              <Bar dataKey="Base" fill="#ef4444" radius={[6, 6, 0, 0]} name="Consumo Auditado" />
              <Bar dataKey="Proposto" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Consumo Proposto" />
            </BarChart>
          ) : (
            <AreaChart data={chartData} margin={{ top: 80, right: 20, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBase" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                <linearGradient id="colorProp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="label" fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontWeight: 800}} />
              <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontWeight: 800}} unit=" kW" />
              <Tooltip contentStyle={{borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
              <Area 
                type={view === 'Annual' ? 'monotone' : 'stepAfter'} 
                dataKey="Base" 
                stroke="#ef4444" 
                fill="url(#colorBase)" 
                strokeWidth={3} 
                name="Auditado" 
                animationDuration={1200} 
              />
              <Area 
                type={view === 'Annual' ? 'monotone' : 'stepAfter'} 
                dataKey="Proposto" 
                stroke="#3b82f6" 
                fill="url(#colorProp)" 
                strokeWidth={3} 
                name="Proposto" 
                animationDuration={1200} 
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 flex justify-between items-center shadow-sm">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Potência de Pico Auditada</p>
            <p className="text-4xl font-black text-red-500">{stats.base.max.toFixed(1)} <span className="text-sm">kW</span></p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Energia Anual Total</p>
            <p className="text-2xl font-black text-slate-700">{(stats.base.total / 1000).toFixed(1)} <span className="text-sm">MWh</span></p>
          </div>
        </div>
        <div className="p-8 bg-blue-50/50 rounded-[2.5rem] border border-blue-100 flex justify-between items-center shadow-sm">
          <div>
            <p className="text-[10px] font-black text-blue-400 uppercase mb-2">Potência de Pico Simulada</p>
            <p className="text-4xl font-black text-blue-600">{stats.prop.max.toFixed(1)} <span className="text-sm">kW</span></p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-blue-400 uppercase mb-2">Energia Anual Total</p>
            <p className="text-2xl font-black text-blue-800">{(stats.prop.total / 1000).toFixed(1)} <span className="text-sm">MWh</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};
