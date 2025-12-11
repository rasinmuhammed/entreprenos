
import React from 'react';
import { GenUIElement } from '../../types';
import { GlassPane } from '../ui/GlassPane';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, TrendingDown, Target, Zap, Activity, CheckCircle2, AlertTriangle, Layers, CreditCard, Users, Calendar } from 'lucide-react';

export const GenerativeWidget: React.FC<{ schema: GenUIElement }> = ({ schema }) => {
  if (!schema) return null;

  const renderElement = (el: GenUIElement, idx: number) => {
    switch (el.type) {
      case 'layout':
        return <RenderLayout key={el.id || idx} el={el} index={idx} />;
      case 'card':
        return <RenderCard key={el.id || idx} el={el} index={idx} />;
      case 'text':
        return <RenderText key={el.id || idx} el={el} />;
      case 'button':
        return <RenderButton key={el.id || idx} el={el} />;
      case 'metric':
        return <RenderMetric key={el.id || idx} el={el} index={idx} />;
      case 'chart':
        return <RenderChart key={el.id || idx} el={el} index={idx} />;
      case 'list':
        return <RenderList key={el.id || idx} el={el} />;
      case 'divider':
        return <div key={el.id || idx} className="w-full h-px bg-slate-200 my-4" />;
      default:
        return null;
    }
  };

  return (
    <GlassPane className="h-full p-6 overflow-y-auto custom-scrollbar bg-white" hoverEffect>
      {renderElement(schema, 0)}
    </GlassPane>
  );
};

// --- SUB-COMPONENTS ---

const RenderLayout: React.FC<{ el: GenUIElement, index: number }> = ({ el, index }) => {
  const isGrid = el.props?.type === 'grid';
  const direction = el.props?.direction === 'row' ? 'flex-row' : 'flex-col';
  const gap = el.props?.gap ? `gap-${el.props.gap}` : 'gap-6';
  const align = el.props?.align === 'center' ? 'items-center' : 'items-stretch';

  if (isGrid) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 w-full`}>
        {el.children?.map((child, i) => (
          <div key={i} className="h-full">
             <RenderChildWrapper child={child} index={i} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex ${direction} ${gap} ${align} w-full h-full`}>
      {el.children?.map((child, i) => (
        <RenderChildWrapper key={i} child={child} index={i} />
      ))}
    </div>
  );
};

const RenderChildWrapper: React.FC<{ child: GenUIElement, index: number }> = ({ child, index }) => {
  switch (child.type) {
    case 'layout': return <RenderLayout el={child} index={index} />;
    case 'card': return <RenderCard el={child} index={index} />;
    case 'text': return <RenderText el={child} />;
    case 'button': return <RenderButton el={child} />;
    case 'metric': return <RenderMetric el={child} index={index} />;
    case 'chart': return <RenderChart el={child} index={index} />;
    case 'list': return <RenderList el={child} />;
    case 'divider': return <div className="w-full h-px bg-slate-200 my-4" />;
    default: return null;
  }
};

const RenderCard: React.FC<{ el: GenUIElement, index: number }> = ({ el, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="p-5 bg-slate-50 border border-slate-200 rounded-xl w-full h-full hover:border-slate-300 transition-colors flex flex-col gap-4 relative overflow-hidden group shadow-sm"
    >
      {el.children?.map((child, i) => (
        <RenderChildWrapper key={i} child={child} index={i} />
      ))}
    </motion.div>
  );
};

const RenderText: React.FC<{ el: GenUIElement }> = ({ el }) => {
  const variant = el.props?.variant || 'body';
  const content = typeof el.props?.content === 'object' ? JSON.stringify(el.props?.content) : el.props?.content;
  
  if (variant === 'h1') return <h1 className="text-2xl font-bold text-ink-900 tracking-tight leading-tight">{content}</h1>;
  if (variant === 'h2') return <h2 className="text-sm font-bold text-ink-700 uppercase tracking-wide flex items-center gap-2"><Zap className="w-3 h-3 text-tech-purple" /> {content}</h2>;
  if (variant === 'caption') return <span className="text-[10px] font-mono text-ink-400 uppercase tracking-widest font-bold">{content}</span>;
  if (variant === 'metric') return <div className="text-4xl font-mono font-bold text-ink-900 tracking-tighter">{content}</div>;
  
  return <p className="text-sm text-ink-600 leading-relaxed font-medium">{content}</p>;
};

const RenderButton: React.FC<{ el: GenUIElement }> = ({ el }) => {
  const variant = el.props?.variant || 'primary';
  const label = el.props?.label || 'Action';
  
  return (
    <button className={`
      w-full px-4 py-3 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all font-bold shadow-sm
      ${variant === 'primary' 
        ? 'bg-tech-purple hover:bg-indigo-600 text-white shadow-md' 
        : 'bg-white hover:bg-slate-50 border border-slate-200 text-ink-600 hover:text-ink-900'}
    `}>
      {label}
      <ArrowRight className="w-3 h-3" />
    </button>
  );
};

const RenderMetric: React.FC<{ el: GenUIElement, index: number }> = ({ el, index }) => {
  const { label, value, trend } = el.props || {};
  const isPositive = trend >= 0;
  
  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: index * 0.1 }}
      className="flex flex-col"
    >
      <span className="text-[10px] text-ink-400 font-mono uppercase tracking-wider mb-1 font-bold">{label}</span>
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-ink-900 tracking-tighter">{value}</span>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${isPositive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      {/* Sparkline decoration */}
      <div className="w-full h-1 bg-slate-100 mt-3 rounded-full overflow-hidden flex gap-0.5">
         {[...Array(5)].map((_, i) => (
            <div key={i} className={`h-full flex-1 rounded-full ${i > 1 ? (isPositive ? 'bg-emerald-500' : 'bg-rose-500') : 'bg-slate-200'}`} />
         ))}
      </div>
    </motion.div>
  );
};

const RenderChart: React.FC<{ el: GenUIElement, index: number }> = ({ el, index }) => {
  const data = el.props?.data || [40, 60, 45, 70, 55, 80, 65];
  const color = el.props?.color === 'purple' ? '#6366F1' : el.props?.color === 'emerald' ? '#10B981' : '#06B6D4';
  const max = Math.max(...data);
  
  return (
    <div className="w-full h-32 flex items-end gap-1 mt-4 relative bg-white border border-slate-100 rounded-lg p-2">
       {/* Simple SVG Line/Area Chart */}
       <svg viewBox={`0 0 ${data.length * 10} 100`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
          <defs>
            <linearGradient id={`grad-${index}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.2" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <motion.path
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            d={`
              M 0 100
              ${data.map((d: number, i: number) => `L ${i * 10} ${100 - (d / max * 80)}`).join(' ')}
              L ${(data.length - 1) * 10} 100
              Z
            `}
            fill={`url(#grad-${index})`}
          />
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            d={`
              M 0 ${100 - (data[0] / max * 80)}
              ${data.map((d: number, i: number) => `L ${i * 10} ${100 - (d / max * 80)}`).join(' ')}
            `}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
       </svg>
       
       {/* Background Grid Lines */}
       <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
          <div className="w-full h-px bg-slate-300" />
          <div className="w-full h-px bg-slate-300" />
          <div className="w-full h-px bg-slate-300" />
       </div>
    </div>
  );
};

const RenderList: React.FC<{ el: GenUIElement }> = ({ el }) => {
  const items = el.props?.items || [];
  
  return (
    <div className="space-y-3 mt-2">
      {items.map((item: any, i: number) => (
        <div key={i} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg group hover:border-tech-purple/30 hover:shadow-sm transition-all">
           <div className="p-2 bg-slate-50 rounded-md text-tech-purple group-hover:bg-indigo-50 transition-colors">
              {item.status === 'alert' ? <AlertTriangle className="w-4 h-4 text-rose-500" /> : 
               item.status === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> :
               <Activity className="w-4 h-4" />}
           </div>
           <div className="flex-1">
              <div className="text-sm text-ink-900 font-bold">{item.title}</div>
              <div className="text-xs text-ink-500 font-medium">{item.subtitle}</div>
           </div>
           {item.value && <div className="text-xs font-mono text-ink-600 bg-slate-50 px-2 py-1 rounded border border-slate-100 font-bold">{item.value}</div>}
        </div>
      ))}
    </div>
  );
};
