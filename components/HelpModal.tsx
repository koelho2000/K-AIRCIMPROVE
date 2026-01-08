
import React from 'react';
// Added Library and TrendingDown to the imports
import { X, Info, Book, Calculator, Target, BarChart3, FileText, Sparkles, Database, Layout, ShieldCheck, Zap, TrendingUp, Library, TrendingDown } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[3rem] shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
        <header className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/20">
              <Book size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Guia de Apoio K-AIRCIMPROVE</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Domine a Eficiência Energética Industrial</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-200 rounded-2xl transition-all text-slate-400 hover:text-slate-900">
            <X size={24} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-12">
          {/* Introdução */}
          <section className="space-y-4">
            <h3 className="text-lg font-black text-blue-600 uppercase tracking-tighter flex items-center gap-2">
              <Info size={18}/> O que é o K-AIRCIMPROVE?
            </h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              Esta é uma aplicação profissional desenhada para auditores e engenheiros de energia. Baseada nos manuais de referência da <strong>ADENE</strong> e na norma <strong>ISO 50001</strong>, permite simular com precisão o impacto técnico e financeiro de melhorias em centrais de ar comprimido.
            </p>
          </section>

          {/* Guia de Menus */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-6">
              <h4 className="font-black text-slate-900 uppercase text-xs flex items-center gap-2 border-b pb-3 border-slate-200">
                <Calculator size={16} className="text-blue-500"/> O Fluxo do Editor
              </h4>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xs shrink-0">1</div>
                  <div>
                    <p className="font-black text-[10px] uppercase text-slate-800">Dados do Projeto</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">Define o cliente e o custo da energia (€/kWh). Sem este custo, o ROI não será calculado.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xs shrink-0">2</div>
                  <div>
                    <p className="font-black text-[10px] uppercase text-slate-800">Cenário Auditado (Base)</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">Insere os dados reais medidos na fábrica. Atenção ao tempo em vazio e às fugas identificadas.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xs shrink-0">3</div>
                  <div>
                    <p className="font-black text-[10px] uppercase text-slate-800">Cenário Proposto</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">Simula a melhoria. Usa o botão <strong>"Sugerir Melhor Opção" ✨</strong> para deixar a IA escolher o compressor ideal.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xs shrink-0">4</div>
                  <div>
                    <p className="font-black text-[10px] uppercase text-slate-800">Orçamento (CAPEX)</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">Estrutura o custo da intervenção por capítulos. Podes adicionar artigos personalizados.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-6">
              <h4 className="font-black text-slate-900 uppercase text-xs flex items-center gap-2 border-b pb-3 border-slate-200">
                <Layout size={16} className="text-blue-500"/> Ferramentas Avançadas
              </h4>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="p-2 bg-white rounded-lg shadow-sm text-blue-500"><Library size={16}/></div>
                  <div>
                    <p className="font-black text-[10px] uppercase text-slate-800">Base OEM</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">Consulta especificações reais de fabricantes (Atlas Copco, Kaeser, etc.) para simulações fiáveis.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="p-2 bg-white rounded-lg shadow-sm text-blue-500"><BarChart3 size={16}/></div>
                  <div>
                    <p className="font-black text-[10px] uppercase text-slate-800">Diagramas 8760h</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">Análise cronológica completa. Exporta o perfil anual em CSV para auditorias detalhadas.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="p-2 bg-white rounded-lg shadow-sm text-blue-500"><FileText size={16}/></div>
                  <div>
                    <p className="font-black text-[10px] uppercase text-slate-800">Relatório Pro</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">Gera automaticamente o dossier para o cliente, incluindo pareceres técnicos e análise ESG.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Potencial de Resultados */}
          <section className="bg-slate-900 text-white rounded-[3rem] p-10 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-10"><TrendingUp size={120}/></div>
            <div className="relative z-10 space-y-8">
              <h4 className="font-black uppercase text-sm tracking-widest text-blue-400">Potencial de Resultados e Valor Agregado</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400"><Zap size={20}/><span className="font-black text-[10px] uppercase">Eficiência</span></div>
                  <p className="text-3xl font-black">15% a 40%</p>
                  <p className="text-[10px] opacity-60 font-bold leading-tight">Redução típica no consumo elétrico anual da central.</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-blue-400"><TrendingDown size={20}/><span className="font-black text-[10px] uppercase">Custos</span></div>
                  <p className="text-3xl font-black">{'<'} 3 Anos</p>
                  <p className="text-[10px] opacity-60 font-bold leading-tight">Payback médio para projetos de modernização VSD e reparação de fugas.</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-blue-300"><ShieldCheck size={20}/><span className="font-black text-[10px] uppercase">Compliance</span></div>
                  <p className="text-3xl font-black">ISO 50001</p>
                  <p className="text-[10px] opacity-60 font-bold leading-tight">Cálculos validados de acordo com normativas europeias de gestão de energia.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Dicas de Utilização */}
          <div className="p-8 bg-blue-50/50 rounded-[2.5rem] border border-blue-100">
             <h4 className="text-[10px] font-black text-blue-600 uppercase mb-4 tracking-widest">Dicas de Especialista</h4>
             <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] text-slate-600 font-medium list-disc pl-5">
               <li>Grava o teu projeto frequentemente para não perderes o progresso.</li>
               <li>Usa a exportação CSV nos diagramas para manipular dados em Excel.</li>
               <li>A IA analisa o tempo em vazio: se for {'>'}15%, ela sugerirá sempre tecnologia VSD.</li>
               <li>No orçamento, o "Lock Técnico" garante que não te esqueças de itens obrigatórios.</li>
             </ul>
          </div>
        </div>

        <footer className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button 
            onClick={onClose} 
            className="px-12 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
          >
            Entendido, vamos auditar!
          </button>
        </footer>
      </div>
    </div>
  );
};
