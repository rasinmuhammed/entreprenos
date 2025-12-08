
import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { GlassPane } from '../ui/GlassPane';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, AlertTriangle, PieChart, Play, TrendingDown, Activity, Wallet } from 'lucide-react';
import { analyzeFinancialHealth } from '../../services/geminiService';
import { FinancialScenario } from '../../types';

export const FinancialForecaster: React.FC = () => {
  const { 
    context, 
    financialInputs, 
    setFinancialInputs, 
    financialHealth, 
    setFinancialHealth, 
    isAnalyzingFinance, 
    setAnalyzingFinance 
  } = useAppStore();

  const [activeScenario, setActiveScenario] = useState<number>(0);

  const handleRunAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!context) return;
    setAnalyzingFinance(true);
    try {
      const result = await analyzeFinancialHealth(financialInputs, context);
      setFinancialHealth(result);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzingFinance(false);
    }
  };

  const handleInputChange = (field: keyof typeof financialInputs, value: string) => {
    setFinancialInputs({ ...financialInputs, [field]: parseFloat(value) || 0 });
  };

  const currentScenario: FinancialScenario | null = financialHealth ? financialHealth.scenarios[activeScenario] : null;

  return (
    <div className="h-[calc(100vh-6rem)] overflow-hidden flex gap-6 p-6">
      
      {/* LEFT: INPUT CONSOLE */}
      <GlassPane className="w-80 flex flex-col p-6 bg-nebula-900/40">
        <div className="flex items-center gap-2 mb-6 text-white/80">
          <Wallet className="w-5 h-5 text-emerald-400" />
          <h2 className="font-light tracking-wide">Cash Console</h2>
        </div>

        <form onSubmit={handleRunAnalysis} className="space-y-6">
          <InputGroup 
             label="Cash on Hand" 
             value={financialInputs.cashOnHand} 
             onChange={(v) => handleInputChange('cashOnHand', v)} 
             icon={<DollarSign className="w-3 h-3 text-emerald-400" />}
          />
          <InputGroup 
             label="Monthly Burn" 
             value={financialInputs.monthlyBurn} 
             onChange={(v) => handleInputChange('monthlyBurn', v)} 
             icon={<TrendingDown className="w-3 h-3 text-rose-400" />}
          />
          <InputGroup 
             label="Monthly Revenue" 
             value={financialInputs.monthlyRevenue} 
             onChange={(v) => handleInputChange('monthlyRevenue', v)} 
             icon={<TrendingUp className="w-3 h-3 text-cyan-400" />}
          />
          <InputGroup 
             label="Growth Rate (%)" 
             value={financialInputs.growthRate} 
             onChange={(v) => handleInputChange('growthRate', v)} 
             icon={<Activity className="w-3 h-3 text-purple-400" />}
          />

          <button 
            type="submit" 
            disabled={isAnalyzingFinance}
            className="w-full py-4 mt-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-glow"
          >
            {isAnalyzingFinance ? (
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
               <>
                 <Play className="w-4 h-4 fill-current" /> Run Simulation
               </>
            )}
          </button>
        </form>

        {financialHealth && (
           <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/5">
             <div className="text-[10px] uppercase font-mono text-white/40 mb-2">CFO Critique</div>
             <p className="text-xs text-white/70 leading-relaxed italic">
               "{financialHealth.cfoCritique}"
             </p>
           </div>
        )}
      </GlassPane>

      {/* RIGHT: VISUALIZER */}
      <div className="flex-1 flex flex-col gap-6">
        {financialHealth ? (
           <>
             {/* HEADER STATS */}
             <div className="grid grid-cols-3 gap-6">
               <StatCard 
                 label="Runway" 
                 value={`${currentScenario?.runwayMonths.toFixed(1)} Months`} 
                 subValue="Until cash zero"
                 color={currentScenario?.runwayMonths! < 6 ? "text-rose-400" : "text-white"}
               />
               <StatCard 
                 label="Profitability" 
                 value={currentScenario?.profitabilityDate || "Never"} 
                 subValue="Break-even point"
                 color="text-cyan-400"
               />
               <StatCard 
                 label="Burn Status" 
                 value={financialHealth.burnRateAssessment} 
                 subValue="Efficiency Score"
                 color={financialHealth.burnRateAssessment === 'Critical' ? "text-rose-400" : "text-emerald-400"}
               />
             </div>

             {/* CHART AREA */}
             <GlassPane className="flex-1 p-8 flex flex-col relative overflow-hidden">
                <div className="flex justify-between items-center mb-8">
                   <h3 className="text-xl font-light text-white">Projected Cash Balance (12 Months)</h3>
                   <div className="flex bg-white/5 p-1 rounded-lg">
                      {financialHealth.scenarios?.map((s, idx) => (
                        <button
                          key={s.name}
                          onClick={() => setActiveScenario(idx)}
                          className={`px-4 py-1.5 rounded-md text-xs font-mono uppercase transition-all ${
                            activeScenario === idx ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white'
                          }`}
                        >
                          {s.name}
                        </button>
                      ))}
                   </div>
                </div>

                <div className="flex-1 flex items-end justify-between gap-2 px-4 relative z-10">
                   {currentScenario?.projectionData?.map((val, idx) => {
                     const maxVal = Math.max(...(currentScenario?.projectionData || []));
                     const heightPct = Math.max((val / maxVal) * 100, 5); // min 5% height
                     return (
                       <div key={idx} className="flex-1 flex flex-col justify-end group relative">
                          <div className="text-[9px] text-white/0 group-hover:text-white/60 text-center mb-2 transition-colors font-mono">
                            ${(val / 1000).toFixed(0)}k
                          </div>
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: `${heightPct}%` }}
                            transition={{ duration: 0.5, delay: idx * 0.05 }}
                            className={`w-full rounded-t-md relative hover:opacity-80 transition-opacity cursor-pointer ${
                              val < 0 ? 'bg-rose-500/50' : 'bg-gradient-to-t from-emerald-600/50 to-emerald-400/80'
                            }`}
                          >
                             {val < 0 && <div className="absolute inset-x-0 bottom-full mb-2 text-center text-[9px] text-rose-400 font-bold">DEATH</div>}
                          </motion.div>
                          <div className="text-[9px] text-white/20 text-center mt-2 font-mono">M{idx+1}</div>
                       </div>
                     );
                   })}
                   
                   {/* Zero Line */}
                   <div className="absolute left-0 right-0 bottom-6 h-px bg-rose-500/30 border-b border-dashed border-rose-500/50 pointer-events-none" />
                </div>

                <div className="mt-8 p-4 bg-tech-cyan/5 border border-tech-cyan/10 rounded-xl">
                   <div className="flex items-start gap-3">
                      <div className="p-2 bg-tech-cyan/20 rounded-lg">
                        <Activity className="w-4 h-4 text-tech-cyan" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-tech-cyan uppercase tracking-wider mb-1">AI Strategic Advice</div>
                        <p className="text-sm text-white/80 leading-relaxed">{currentScenario?.advice}</p>
                      </div>
                   </div>
                </div>
             </GlassPane>
           </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
             <PieChart className="w-24 h-24 text-emerald-400/20 mb-4" />
             <h3 className="text-xl text-white font-light">Financial Model Not Generated</h3>
             <p className="text-white/40 max-w-sm mt-2">Enter your current metrics in the Cash Console to generate a Monte Carlo simulation.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const InputGroup: React.FC<{ label: string, value: number, onChange: (v: string) => void, icon: React.ReactNode }> = ({ label, value, onChange, icon }) => (
  <div className="group">
    <label className="text-[10px] font-mono uppercase tracking-wider text-white/40 mb-1.5 flex items-center gap-2 group-focus-within:text-tech-cyan transition-colors">
       {icon} {label}
    </label>
    <div className="bg-nebula-950 border border-white/10 rounded-lg overflow-hidden group-focus-within:border-tech-cyan/50 transition-colors">
      <input 
        type="number" 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent px-4 py-3 text-white font-mono focus:outline-none"
      />
    </div>
  </div>
);

const StatCard: React.FC<{ label: string, value: string, subValue: string, color?: string }> = ({ label, value, subValue, color = "text-white" }) => (
  <GlassPane className="p-6">
    <div className="text-[10px] font-mono uppercase text-white/40 tracking-widest mb-2">{label}</div>
    <div className={`text-3xl font-light tracking-tight mb-1 ${color}`}>{value}</div>
    <div className="text-[10px] text-white/30">{subValue}</div>
  </GlassPane>
);
