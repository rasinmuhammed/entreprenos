
import React from 'react';
import { GenUIElement } from '../../types';
import { GlassPane } from '../ui/GlassPane';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, TrendingDown, Target, Zap, Activity, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

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
        return <div key={el.id || idx} className="w-full h-px bg-white/10 my-4" />;
      default:
        return null;
    }
  };

  return (
    <GlassPane className="h-full p-6 overflow-y-auto custom-scrollbar bg-gradient-to-b from-nebula-900/50 to-nebula-950/50" hoverEffect>
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
  // Recursively call the main render logic from GenerativeWidget context would be cleaner,
  // but for this isolated file structure, we duplicate the switch or pass a render prop.
  // Ideally, GenerativeWidget refactors `renderElement` to be exported or passed down.
  // For simplicity, I'll instantiate the component logic here via the parent map above.
  // Actually, let's just reuse the sub-components logic:
  switch (child.type) {
    case 'layout': return <RenderLayout el={child} index={index} />;
    case 'card': return <RenderCard el={child} index={index} />;
    case 'text': return <RenderText el={child} />;
    case 'button': return <RenderButton el={child} />;
    case 'metric': return <RenderMetric el={child} index={index} />;
    case 'chart': return <RenderChart el={child} index={index} />;
    case 'list': return <RenderList el={child} />;
    case 'divider': return <div className="w-full h-px bg-white/10 my-4" />;
    default: return null;
  }
};

const RenderCard: React.FC<{ el: GenUIElement, index: number }> = ({ el, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="p-5 bg-white/5 border border-white/5 rounded-xl w-full h-full hover:border-white/10 transition-colors flex flex-col gap-4 relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      {el.children?.map((child, i) => (
        <RenderChildWrapper key={i} child={child} index={i} />
      ))}
    </motion.div>
  );
};

const RenderText: React.FC<{ el: GenUIElement }> = ({ el }) => {
  const variant = el.props?.variant || 'body';
  const content = typeof el.props?.content === 'object' ? JSON.stringify(el.props?.content) : el.props?.content;
  
  if (variant === 'h1') return <h1 className="text-2xl font-light text-white tracking-tight leading-tight">{content}</h1>;
  if (variant === 'h2') return <h2 className="text-sm font-medium text-white/90 uppercase tracking-wide flex items-center gap-2"><Zap className="w-3 h-3 text-tech-cyan" /> {content}</h2>;
  if (variant === 'caption') return <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">{content}</span>;
  if (variant === 'metric') return <div className="text-4xl font-mono font-light text-white tracking-tighter text-glow">{content}</div>;
  
  return <p className="text-sm text-white/70 leading-relaxed font-light">{content}</p>;
};

const RenderButton: React.FC<{ el: GenUIElement }> = ({ el }) => {
  const variant = el.props?.variant || 'primary';
  const label = el.props?.label || 'Action';
  
  return (
    <button className={`
      w-full px-4 py-3 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all
      ${variant === 'primary' 
        ? 'bg-tech-cyan/10 hover:bg-tech-cyan/20 border border-tech-cyan/30 text-tech-cyan hover:shadow-glow-cyan' 
        : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white'}
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
      <span className="text-[10px] text-white/40 font-mono uppercase tracking-wider mb-1">{label}</span>
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-light text-white tracking-tighter">{value}</span>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-mono ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      {/* Sparkline decoration */}
      <div className="w-full h-1 bg-white/5 mt-3 rounded-full overflow-hidden flex gap-0.5">
         {[...Array(5)].map((_, i) => (
            <div key={i} className={`h-full flex-1 rounded-full ${i > 1 ? (isPositive ? 'bg-emerald-500/40' : 'bg-rose-500/40') : 'bg-white/10'}`} />
         ))}
      </div>
    </motion.div>
  );
};

const RenderChart: React.FC<{ el: GenUIElement, index: number }> = ({ el, index }) => {
  const data = el.props?.data || [40, 60, 45, 70, 55, 80, 65];
  const type = el.props?.type || 'area';
  const color = el.props?.color === 'purple' ? '#8b5cf6' : el.props?.color === 'emerald' ? '#10b981' : '#06b6d4';
  const max = Math.max(...data);
  
  return (
    <div className="w-full h-32 flex items-end gap-1 mt-4 relative">
       {/* Simple SVG Line/Area Chart */}
       <svg viewBox={`0 0 ${data.length * 10} 100`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
          <defs>
            <linearGradient id={`grad-${index}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
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
       <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
          <div className="w-full h-px bg-white" />
          <div className="w-full h-px bg-white" />
          <div className="w-full h-px bg-white" />
       </div>
    </div>
  );
};

const RenderList: React.FC<{ el: GenUIElement }> = ({ el }) => {
  const items = el.props?.items || [];
  
  return (
    <div className="space-y-3 mt-2">
      {items.map((item: any, i: number) => (
        <div key={i} className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-lg group hover:bg-white/10 transition-colors">
           <div className="p-2 bg-nebula-900 rounded-md text-tech-cyan group-hover:text-white transition-colors">
              {item.status === 'alert' ? <AlertTriangle className="w-4 h-4 text-tech-rose" /> : 
               item.status === 'success' ? <CheckCircle2 className="w-4 h-4 text-tech-emerald" /> :
               <Activity className="w-4 h-4" />}
           </div>
           <div className="flex-1">
              <div className="text-sm text-white font-medium">{item.title}</div>
              <div className="text-xs text-white/40">{item.subtitle}</div>
           </div>
           {item.value && <div className="text-xs font-mono text-white/60">{item.value}</div>}
        </div>
      ))}
    </div>
  );
};
