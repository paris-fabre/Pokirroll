/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Ingredient } from '../types';
import { Ban, ToggleLeft, ToggleRight, Check } from 'lucide-react';

interface IngredientSelectorProps {
  ingredients: Ingredient[];
  title: string;
  maxSelections: number;
  selectedIds: string[];
  description?: string;
  onSelect: (id: string) => void;
  onToggleStock: (id: string) => void;
}

export default function IngredientSelector({
  ingredients,
  title,
  maxSelections,
  selectedIds,
  description,
  onSelect,
  onToggleStock,
}: IngredientSelectorProps) {
  const currentCount = selectedIds.length;
  const isMaxReached = currentCount >= maxSelections;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Header section with counts */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <h3 className="text-xl font-display font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span>{title}</span>
            <span className="text-xs font-mono font-medium py-0.5 px-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              Máx {maxSelections}
            </span>
          </h3>
          {description && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              {description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs font-mono text-slate-400 dark:text-slate-500">Seleccionados:</span>
          <span className={`text-sm font-mono font-bold px-2 py-0.5 rounded ${
            currentCount === maxSelections 
              ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400' 
              : currentCount > 0 
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' 
                : 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
          }`}>
            {currentCount}/{maxSelections}
          </span>
        </div>
      </div>

      {/* Grid of options */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {ingredients.map((item) => {
          const isSelected = selectedIds.includes(item.id);
          const isAvailable = item.available;
          const bgGradient = item.colors[1] 
            ? `linear-gradient(135deg, ${item.colors[0]} 0%, ${item.colors[1]} 100%)`
            : item.colors[0];

          return (
            <div
              key={item.id}
              className={`relative group flex flex-col justify-between border rounded-xl overflow-hidden transition-all duration-300 bg-slate-50/50 dark:bg-slate-950/40 ${
                !isAvailable
                  ? 'border-slate-200/50 dark:border-slate-800/40 opacity-60'
                  : isSelected
                    ? 'border-rose-500/80 bg-rose-50/20 dark:bg-rose-950/15 ring-2 ring-rose-500/10'
                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700'
              }`}
            >
              {/* Main select click area */}
              <button
                type="button"
                disabled={!isAvailable}
                onClick={() => onSelect(item.id)}
                className={`w-full text-left p-3.5 flex flex-col items-center justify-center gap-2.5 transition-all text-slate-800 dark:text-slate-200 ${
                  isAvailable ? 'cursor-pointer active:scale-95' : 'cursor-not-allowed'
                }`}
              >
                {/* Visual Icon Representation */}
                <div className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-inner transition-transform duration-300 group-hover:scale-105"
                     style={{ background: isAvailable ? bgGradient : '#94a3b8' }}>
                  
                  {/* Color Marbled Overlay */}
                  {isAvailable && (
                    <div className="absolute inset-0.5 rounded-full bg-white/10 mix-blend-overlay" />
                  )}

                  {/* Gray Filter if unavailable */}
                  {!isAvailable && (
                    <div className="absolute inset-0 rounded-full bg-slate-400/80 mix-blend-saturation flex items-center justify-center">
                      <Ban className="w-6 h-6 text-slate-100" />
                    </div>
                  )}

                  {/* Color-based representation matching the bowl palette */}
                  <span className={`text-2xl z-10 select-none filter drop-shadow-md transition-transform duration-300 ${
                    !isAvailable ? 'grayscale opacity-30' : 'group-hover:scale-110'
                  }`} role="img" aria-label={item.name}>
                    {item.icon}
                  </span>

                  {/* Selected check ring indicator */}
                  {isSelected && isAvailable && (
                    <motion.div
                      layoutId={`check-ring-${item.id}`}
                      className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-0.5 shadow-md flex items-center justify-center"
                    >
                      <Check className="w-3.5 h-3.5" strokeWidth={3} />
                    </motion.div>
                  )}
                </div>

                {/* Name Label */}
                <div className="text-center w-full">
                  <p className={`text-xs font-medium tracking-wide ${
                    !isAvailable 
                      ? 'text-slate-400 dark:text-slate-600 line-through' 
                      : isSelected 
                        ? 'text-rose-600 font-semibold dark:text-rose-400' 
                        : 'text-slate-600 dark:text-slate-300'
                  }`}>
                    {item.name}
                  </p>
                  
                  {!isAvailable && (
                    <span className="inline-block text-[9px] font-mono uppercase bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 px-1.5 py-0.5 rounded mt-1 select-none">
                      Sin stock
                    </span>
                  )}
                </div>
              </button>

              {/* Admin Panel: Quick Toggle Stock button to exhibit functionality easily! */}
              <div className="border-t border-slate-100 dark:border-slate-800/80 px-2 py-1.5 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 bg-slate-100/50 dark:bg-slate-900/60 font-sans">
                <span className="font-mono">Disponibilidad</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStock(item.id);
                  }}
                  className="flex items-center gap-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 active:scale-95 transition-colors p-0.5 rounded cursor-pointer"
                  title="Cambiar estado de stock para probar funcionalidad en gris / deshabilitado"
                >
                  {isAvailable ? (
                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-500">
                      <span>Ok</span>
                      <ToggleRight className="w-4 h-4 fill-emerald-100 dark:fill-none" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-rose-500">
                      <span>Sin</span>
                      <ToggleLeft className="w-4 h-4 fill-rose-100 dark:fill-none" />
                    </div>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
