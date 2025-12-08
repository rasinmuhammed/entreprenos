
import React from 'react';
import { GenUIElement } from '../../types';
import { GlassPane } from '../ui/GlassPane';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, TrendingUp } from 'lucide-react';

export const GenerativeWidget: React.FC<{ schema: GenUIElement }> = ({ schema }) => {
  if (!schema) return null;

  const safeRender = (content: any) => {
    if (typeof content === 'string' || typeof content === 'number') return content;
    if (typeof content === 'object' && content !== null) {
       return content.label || content.value || content.text || JSON.stringify(content);
    }
    return '';
  };

  const renderElement = (el: GenUIElement) => {
    switch (el.type) {
      case 'layout':
        const direction = el.props?.direction === 'row' ? 'flex-row' : 'flex-col';
        const gap = el.props?.gap ? `gap-${el.props.gap}` : 'gap-4';
        const align = el.props?.align === 'center' ? 'items-center' : 'items-start';
        return (
          <div key={el.id} className={`flex ${direction} ${gap} ${align} w-full`}>
            {el.children?.map(renderElement)}
          </div>
        );

      case 'card':
        return (
          <div key={el.id} className="p-4 bg-white/5 border border-white/5 rounded-xl w-full">
            {el.children?.map(renderElement)}
          </div>
        );

      case 'text':
        const variant = el.props?.variant || 'body';
        const color = el.props?.color || 'text-white';
        let className = 'text-sm';
        if (variant === 'h1') className = 'text-2xl font-light mb-2';
        if (variant === 'h2') className = 'text-lg font-medium mb-1';
        if (variant === 'caption') className = 'text-xs opacity-50 font-mono uppercase tracking-wider';
        if (variant === 'metric') className = 'text-3xl font-mono text-glow';
        
        return (
          <div key={el.id} className={`${className} ${color}`}>
            {safeRender(el.props?.content)}
          </div>
        );

      case 'button':
        return (
          <button 
            key={el.id} 
            className="px-4 py-2 bg-tech-cyan/20 hover:bg-tech-cyan/30 text-tech-cyan border border-tech-cyan/50 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all w-full justify-center"
          >
            {safeRender(el.props?.label)}
            {el.props?.icon === 'arrow' && <ArrowRight className="w-3 h-3" />}
          </button>
        );

      case 'metric':
        return (
          <div key={el.id} className="flex flex-col">
            <span className="text-[10px] text-white/40 font-mono uppercase">{safeRender(el.props?.label)}</span>
            <span className="text-xl text-white font-mono">{safeRender(el.props?.value)}</span>
            {el.props?.trend && (
              <span className={`text-[9px] ${el.props.trend > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {el.props.trend > 0 ? '+' : ''}{el.props.trend}%
              </span>
            )}
          </div>
        );

      case 'chart':
        // Simplified visual placeholder for a chart
        return (
          <div key={el.id} className="w-full h-24 flex items-end gap-1 mt-2">
             {[40, 60, 30, 80, 50, 90, 70].map((h, i) => (
               <div key={i} className="flex-1 bg-white/10 rounded-t-sm hover:bg-tech-cyan transition-colors" style={{ height: `${h}%` }} />
             ))}
          </div>
        );

      case 'divider':
        return <div key={el.id} className="w-full h-px bg-white/10 my-2" />;

      default:
        return null;
    }
  };

  return (
    <GlassPane className="h-full p-6 overflow-y-auto custom-scrollbar" hoverEffect>
      {renderElement(schema)}
    </GlassPane>
  );
};
