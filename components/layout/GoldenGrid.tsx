
import React from 'react';
import { WidgetData } from '../../types';
import { DynamicWidget } from '../modules/DynamicWidget';
import { motion, AnimatePresence } from 'framer-motion';

export const GoldenGrid: React.FC<{ widgets: WidgetData[] }> = ({ widgets }) => {
  // Defensive check: ensure widgets is an array
  if (!widgets || !Array.isArray(widgets) || widgets.length === 0) return null;

  return (
    // Removed 'max-w-7xl mx-auto' to allow full-width filling of the panel
    <div className="grid grid-cols-1 md:grid-cols-6 gap-6 w-full p-6 auto-rows-[minmax(180px,auto)]">
      {/* 
         The layout strategy attempts to approximate 1:1.618 visually using grid spans.
         The first item is the "Hero" (3x2 or 4x2).
         Subsequent items fill the void.
      */}
      <AnimatePresence mode="popLayout">
        {widgets.map((widget, index) => {
          let spanClass = "col-span-1 md:col-span-2 row-span-1"; // Default
          
          // Algorithmic layout based on index to create "Scientific" asymmetry
          if (index === 0) spanClass = "col-span-1 md:col-span-4 row-span-2";
          else if (index === 1) spanClass = "col-span-1 md:col-span-2 row-span-2";
          else if (index === 2) spanClass = "col-span-1 md:col-span-3 row-span-1";
          else if (index === 3) spanClass = "col-span-1 md:col-span-3 row-span-1";

          return (
            <motion.div
              layout
              key={widget.id}
              initial={{ opacity: 0, x: 50, filter: "blur(8px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.9, filter: "blur(8px)" }}
              transition={{ 
                type: "spring", 
                stiffness: 100, 
                damping: 15, 
                mass: 1,
                delay: index * 0.05 
              }}
              className={spanClass}
            >
              <DynamicWidget widget={widget} />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
