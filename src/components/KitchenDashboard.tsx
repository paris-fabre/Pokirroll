/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PokeOrder, Ingredient } from '../types';
import { ChefHat, CheckCircle2, Clock, Trash2, Check, ClipboardList, RefreshCw } from 'lucide-react';

interface KitchenDashboardProps {
  orders: PokeOrder[];
  ingredientsList: Ingredient[];
  onCompleteOrder: (orderId: string) => void;
  onClearHistory: () => void;
  onDeleteOrder: (orderId: string) => void;
}

export default function KitchenDashboard({
  orders,
  ingredientsList,
  onCompleteOrder,
  onClearHistory,
  onDeleteOrder,
}: KitchenDashboardProps) {
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  // Local checklists for active step-by-step prep state of orders so chefs can check items
  const [prepChecklists, setPrepChecklists] = useState<Record<string, string[]>>({});

  const filteredOrders = orders.filter((o) =>
    activeTab === 'pending'
      ? o.status === 'pending' || o.status === 'preparing'
      : o.status === 'completed'
  );

  // Helper to map item ids to names
  const getIngredientNames = (ids: string[]) => {
    return ids.map(id => {
      const ing = ingredientsList.find(i => i.id === id);
      return ing ? `${ing.icon} ${ing.name}` : id;
    });
  };

  const getIngredientColor = (id: string) => {
    const ing = ingredientsList.find(i => i.id === id);
    return ing ? ing.colors[0] : '#f43f5e';
  };

  // Toggle item in active chef preplist
  const handleTogglePrepItem = (orderId: string, itemKey: string) => {
    setPrepChecklists(prev => {
      const current = prev[orderId] || [];
      const updated = current.includes(itemKey)
        ? current.filter(k => k !== itemKey)
        : [...current, itemKey];
      return { ...prev, [orderId]: updated };
    });
  };

  return (
    <div className="space-y-6">
      {/* Tab Selectors & Summary info */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 p-4 rounded-2xl shadow-sm gap-4">
        {/* Left Side Tab Selector */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-sans text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ChefHat className="w-4 h-4" />
            <span>Pendientes Cocina</span>
            {orders.filter(o => o.status !== 'completed').length > 0 && (
              <span className="bg-rose-500 text-white font-mono text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {orders.filter(o => o.status !== 'completed').length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-sans text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'completed'
                ? 'bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Entregados</span>
            {orders.filter(o => o.status === 'completed').length > 0 && (
              <span className="bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                {orders.filter(o => o.status === 'completed').length}
              </span>
            )}
          </button>
        </div>

        {/* Clear/Delete History Trigger */}
        {activeTab === 'completed' && filteredOrders.length > 0 && (
          <button
            type="button"
            onClick={onClearHistory}
            className="flex items-center gap-1.5 font-sans font-medium text-xs text-rose-600 hover:text-rose-800 hover:underline dark:text-rose-400 dark:hover:text-rose-300 py-1.5 px-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-xl transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Limpiar Historial</span>
          </button>
        )}
      </div>

      {/* Main orders content */}
      <AnimatePresence mode="popLayout">
        {filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-3xl shadow-sm text-center px-6"
          >
            <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center mb-4 text-slate-400 dark:text-slate-600">
              <ClipboardList className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-display font-bold text-slate-800 dark:text-slate-200">
              {activeTab === 'pending' ? '¡Cocina al día!' : 'No hay pedidos completados'}
            </h4>
            <p className="text-slate-400 dark:text-slate-500 text-xs sm:text-sm mt-1 max-w-sm">
              {activeTab === 'pending'
                ? 'Todos los pedidos de poke bowls han sido preparados y entregados. Los nuevos pedidos aparecerán aquí al instante.'
                : 'Los pedidos que prepares y marques como entregados aparecerán listados aquí para referencia histórica.'}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredOrders.map((order) => {
              const checkedItems = prepChecklists[order.id] || [];
              const timeString = new Date(order.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              // Helper for checking if an ingredient has been checked off by the chef
              const checkKey = (category: string, id: string) => `${category}-${id}`;

              // Flatten all order keys to calculate total ingredients
              const totalIngredientsList: { category: string; id: string; label: string }[] = [];
              order.bases.forEach(id => totalIngredientsList.push({ category: 'base', id, label: 'Base' }));
              order.proteins.forEach(id => totalIngredientsList.push({ category: 'protein', id, label: 'Proteína' }));
              order.vegetables.forEach(id => totalIngredientsList.push({ category: 'vegetable', id, label: 'Verdura' }));
              order.extras.forEach(id => totalIngredientsList.push({ category: 'extra', id, label: 'Extra' }));
              order.sauces.forEach(id => totalIngredientsList.push({ category: 'sauce', id, label: 'Salsa' }));

              const checkedCount = totalIngredientsList.filter(item => 
                checkedItems.includes(checkKey(item.category, item.id))
              ).length;
              const totalCount = totalIngredientsList.length;
              const progressPercentage = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

              return (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, y: 30 }}
                  transition={{ type: 'spring', stiffness: 150, damping: 16 }}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-md overflow-hidden flex flex-col justify-between"
                >
                  {/* Top order metadata header */}
                  <div className="bg-slate-50 dark:bg-slate-950/70 p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 bg-rose-500 text-white rounded">
                          Ped #{order.orderNumber}
                        </span>
                        <h4 className="font-display font-bold text-slate-800 dark:text-slate-100 text-base">
                          {order.customerName || 'Cliente anónimo'}
                        </h4>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mt-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Enviado a las {timeString} UTC</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded block w-fit ml-auto">
                        Bowl: {order.size}
                      </span>
                    </div>
                  </div>

                  {/* Progress indicator bar for live prep checkoffs */}
                  {order.status !== 'completed' && (
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 relative overflow-hidden">
                      <motion.div
                        className="bg-gradient-to-r from-emerald-400 to-teal-500 h-full"
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  )}

                  {/* Delivery & Payment details banner */}
                  <div className="px-5 py-3 bg-rose-50/20 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800/80 text-xs space-y-2">
                    <div className="flex items-start gap-1.5 text-slate-700 dark:text-slate-300">
                      <span className="font-mono font-bold text-rose-500 dark:text-rose-450 uppercase text-[10px] min-w-[70px]">📍 Dirección:</span>
                      <span className="font-sans font-medium">{order.deliveryAddress || 'Retiro en el Local / Takeaway'}</span>
                    </div>
                    {order.deliveryNotes && (
                      <div className="flex items-start gap-1.5 text-slate-600 dark:text-slate-400">
                        <span className="font-mono font-bold text-slate-400 dark:text-slate-500 uppercase text-[10px] min-w-[70px]">💬 Notas:</span>
                        <span className="font-sans italic">"{order.deliveryNotes}"</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100/50 dark:border-slate-800/40">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-400 dark:text-slate-500 uppercase text-[10px]">💳 Pago:</span>
                        <span className="font-sans font-semibold text-slate-700 dark:text-slate-300">{order.paymentMethod}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full font-sans text-[10px] font-bold ${
                        order.paymentStatus === 'Aprobado / Pagado'
                          ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                          : 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>

                  {/* Step by step ingredients build workflow */}
                  <div className="p-5 flex-1 space-y-4">
                    <p className="text-xs uppercase font-semibold font-mono tracking-wider text-slate-400 dark:text-slate-500 pb-1 border-b border-slate-50 dark:border-slate-800 flex justify-between">
                      <span>Ingredientes a añadir:</span>
                      {order.status !== 'completed' && (
                        <span>{checkedCount}/{totalCount} listos</span>
                      )}
                    </p>

                    <div className="space-y-4">
                      {/* -- Bases -- */}
                      {order.bases.length > 0 && (
                        <div>
                          <p className="text-[10px] font-mono font-bold text-rose-500/80 dark:text-rose-400/85 uppercase">
                            Bases ({order.bases.length})
                          </p>
                          <ul className="grid grid-cols-1 gap-1.5 mt-1">
                            {order.bases.map((id) => {
                              const ing = ingredientsList.find(i => i.id === id);
                              const name = ing ? ing.name : id;
                              const icon = ing ? ing.icon : '🍚';
                              const key = checkKey('base', id);
                              const isItemChecked = checkedItems.includes(key);

                              return (
                                <li
                                  key={id}
                                  onClick={() => order.status !== 'completed' && handleTogglePrepItem(order.id, key)}
                                  className={`flex items-center gap-2 p-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                                    order.status === 'completed'
                                      ? 'bg-slate-50/50 dark:bg-slate-950/20 text-slate-400 dark:text-slate-500 line-through'
                                      : isItemChecked
                                        ? 'bg-emerald-500/10 text-slate-400 dark:text-slate-500 line-through dark:bg-emerald-950/20 border-emerald-500/10'
                                        : 'bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-200'
                                  }`}
                                >
                                  {order.status !== 'completed' && (
                                    <div className={`w-4.5 h-4.5 rounded border flex items-center justify-center transition-all ${
                                      isItemChecked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-700'
                                    }`}>
                                      {isItemChecked && <Check className="w-3 h-3" strokeWidth={3} />}
                                    </div>
                                  )}
                                  {ing?.imageUrl ? (
                                    <img
                                      src={ing.imageUrl}
                                      alt={name}
                                      referrerPolicy="no-referrer"
                                      className={`w-5 h-5 rounded-full object-cover shrink-0 ${isItemChecked ? 'grayscale opacity-40' : ''}`}
                                    />
                                  ) : (
                                    <span className="text-sm leading-none shrink-0">{icon}</span>
                                  )}
                                  <span>{name}</span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}

                      {/* -- Proteins -- */}
                      {order.proteins.length > 0 && (
                        <div>
                          <p className="text-[10px] font-mono font-bold text-rose-500/80 dark:text-rose-400/85 uppercase">
                            Proteínas ({order.proteins.length})
                          </p>
                          <ul className="grid grid-cols-1 gap-1.5 mt-1">
                            {order.proteins.map((id) => {
                              const ing = ingredientsList.find(i => i.id === id);
                              const name = ing ? ing.name : id;
                              const icon = ing ? ing.icon : '🍣';
                              const key = checkKey('protein', id);
                              const isItemChecked = checkedItems.includes(key);

                              return (
                                <li
                                  key={id}
                                  onClick={() => order.status !== 'completed' && handleTogglePrepItem(order.id, key)}
                                  className={`flex items-center gap-2 p-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                                    order.status === 'completed'
                                      ? 'bg-slate-50/50 dark:bg-slate-950/20 text-slate-400 dark:text-slate-500 line-through'
                                      : isItemChecked
                                        ? 'bg-emerald-500/10 text-slate-400 dark:text-slate-500 line-through dark:bg-emerald-950/20 border-emerald-500/10'
                                        : 'bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-200'
                                  }`}
                                >
                                  {order.status !== 'completed' && (
                                    <div className={`w-4.5 h-4.5 rounded border flex items-center justify-center transition-all ${
                                      isItemChecked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-700'
                                    }`}>
                                      {isItemChecked && <Check className="w-3 h-3" strokeWidth={3} />}
                                    </div>
                                  )}
                                  {ing?.imageUrl ? (
                                    <img
                                      src={ing.imageUrl}
                                      alt={name}
                                      referrerPolicy="no-referrer"
                                      className={`w-5 h-5 rounded-full object-cover shrink-0 ${isItemChecked ? 'grayscale opacity-40' : ''}`}
                                    />
                                  ) : (
                                    <span className="text-sm leading-none shrink-0">{icon}</span>
                                  )}
                                  <span>{name}</span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}

                      {/* -- Vegetables -- */}
                      {order.vegetables.length > 0 && (
                        <div>
                          <p className="text-[10px] font-mono font-bold text-rose-500/80 dark:text-rose-400/85 uppercase">
                            Verduras ({order.vegetables.length})
                          </p>
                          <ul className="grid grid-cols-1 gap-1.5 mt-1">
                            {order.vegetables.map((id) => {
                              const ing = ingredientsList.find(i => i.id === id);
                              const name = ing ? ing.name : id;
                              const icon = ing ? ing.icon : '🥒';
                              const key = checkKey('vegetable', id);
                              const isItemChecked = checkedItems.includes(key);

                              return (
                                <li
                                  key={id}
                                  onClick={() => order.status !== 'completed' && handleTogglePrepItem(order.id, key)}
                                  className={`flex items-center gap-2 p-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                                    order.status === 'completed'
                                      ? 'bg-slate-50/50 dark:bg-slate-950/20 text-slate-400 dark:text-slate-500 line-through'
                                      : isItemChecked
                                        ? 'bg-emerald-500/10 text-slate-400 dark:text-slate-500 line-through dark:bg-emerald-950/20 border-emerald-500/10'
                                        : 'bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-200'
                                  }`}
                                >
                                  {order.status !== 'completed' && (
                                    <div className={`w-4.5 h-4.5 rounded border flex items-center justify-center transition-all ${
                                      isItemChecked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-700'
                                    }`}>
                                      {isItemChecked && <Check className="w-3 h-3" strokeWidth={3} />}
                                    </div>
                                  )}
                                  {ing?.imageUrl ? (
                                    <img
                                      src={ing.imageUrl}
                                      alt={name}
                                      referrerPolicy="no-referrer"
                                      className={`w-5 h-5 rounded-full object-cover shrink-0 ${isItemChecked ? 'grayscale opacity-40' : ''}`}
                                    />
                                  ) : (
                                    <span className="text-sm leading-none shrink-0">{icon}</span>
                                  )}
                                  <span>{name}</span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}

                      {/* -- Extras -- */}
                      {order.extras.length > 0 && (
                        <div>
                          <p className="text-[10px] font-mono font-bold text-rose-500/80 dark:text-rose-400/85 uppercase">
                            Extras ({order.extras.length})
                          </p>
                          <ul className="grid grid-cols-1 gap-1.5 mt-1">
                            {order.extras.map((id) => {
                              const ing = ingredientsList.find(i => i.id === id);
                              const name = ing ? ing.name : id;
                              const icon = ing ? ing.icon : '🧅';
                              const key = checkKey('extra', id);
                              const isItemChecked = checkedItems.includes(key);

                              return (
                                <li
                                  key={id}
                                  onClick={() => order.status !== 'completed' && handleTogglePrepItem(order.id, key)}
                                  className={`flex items-center gap-2 p-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                                    order.status === 'completed'
                                      ? 'bg-slate-50/50 dark:bg-slate-950/20 text-slate-400 dark:text-slate-500 line-through'
                                      : isItemChecked
                                        ? 'bg-emerald-500/10 text-slate-400 dark:text-slate-500 line-through dark:bg-emerald-950/20 border-emerald-500/10'
                                        : 'bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-200'
                                  }`}
                                >
                                  {order.status !== 'completed' && (
                                    <div className={`w-4.5 h-4.5 rounded border flex items-center justify-center transition-all ${
                                      isItemChecked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-700'
                                    }`}>
                                      {isItemChecked && <Check className="w-3 h-3" strokeWidth={3} />}
                                    </div>
                                  )}
                                  {ing?.imageUrl ? (
                                    <img
                                      src={ing.imageUrl}
                                      alt={name}
                                      referrerPolicy="no-referrer"
                                      className={`w-5 h-5 rounded-full object-cover shrink-0 ${isItemChecked ? 'grayscale opacity-40' : ''}`}
                                    />
                                  ) : (
                                    <span className="text-sm leading-none shrink-0">{icon}</span>
                                  )}
                                  <span>{name}</span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}

                      {/* -- Sauces / Salsas -- */}
                      {order.sauces.length > 0 && (
                        <div>
                          <p className="text-[10px] font-mono font-bold text-rose-500/80 dark:text-rose-400/85 uppercase">
                            Salsas ({order.sauces.length})
                          </p>
                          <ul className="grid grid-cols-1 gap-1.5 mt-1">
                            {order.sauces.map((id) => {
                              const ing = ingredientsList.find(i => i.id === id);
                              const name = ing ? ing.name : id;
                              const icon = ing ? ing.icon : '🫙';
                              const key = checkKey('sauce', id);
                              const isItemChecked = checkedItems.includes(key);

                              return (
                                <li
                                  key={id}
                                  onClick={() => order.status !== 'completed' && handleTogglePrepItem(order.id, key)}
                                  className={`flex items-center gap-2 p-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                                    order.status === 'completed'
                                      ? 'bg-slate-50/50 dark:bg-slate-950/20 text-slate-400 dark:text-slate-500 line-through'
                                      : isItemChecked
                                        ? 'bg-emerald-500/10 text-slate-400 dark:text-slate-500 line-through dark:bg-emerald-950/20 border-emerald-500/10'
                                        : 'bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-200'
                                  }`}
                                >
                                  {order.status !== 'completed' && (
                                    <div className={`w-4.5 h-4.5 rounded border flex items-center justify-center transition-all ${
                                      isItemChecked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-700'
                                    }`}>
                                      {isItemChecked && <Check className="w-3 h-3" strokeWidth={3} />}
                                    </div>
                                  )}
                                  {ing?.imageUrl ? (
                                    <img
                                      src={ing.imageUrl}
                                      alt={name}
                                      referrerPolicy="no-referrer"
                                      className={`w-5 h-5 rounded-full object-cover shrink-0 ${isItemChecked ? 'grayscale opacity-40' : ''}`}
                                    />
                                  ) : (
                                    <span className="text-sm leading-none shrink-0">{icon}</span>
                                  )}
                                  <span>{name}</span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800/80 p-4 flex gap-2">
                    {order.status !== 'completed' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => onCompleteOrder(order.id)}
                          className="flex-1 flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-xl font-sans text-xs sm:text-sm font-medium transition-all shadow-sm active:scale-95 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Listo / Entregar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteOrder(order.id)}
                          title="Eliminar pedido sin completar"
                          className="bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-950/40 p-2.5 rounded-xl transition-all active:scale-95 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-500 font-medium">
                          <Check className="w-4 h-4 text-emerald-500" strokeWidth={3} />
                          Completado exitosamente
                        </span>
                        <button
                          type="button"
                          onClick={() => onDeleteOrder(order.id)}
                          title="Quitar"
                          className="hover:text-rose-500 p-1 rounded transition-colors cursor-pointer"
                        >
                          Quitar
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
