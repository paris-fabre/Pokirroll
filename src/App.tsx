/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  ChefHat, 
  Trash2, 
  Send, 
  Sparkles, 
  Check, 
  HelpCircle,
  Eye, 
  Moon, 
  Sun,
  LayoutGrid,
  Info,
  Clock,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Plus,
  UtensilsCrossed
} from 'lucide-react';

import { Ingredient, SelectedIngredients, PokeOrder, BowlSize } from './types';
import { INITIAL_INGREDIENTS, CATEGORIES_METADATA } from './data';
import DigitalBowl from './components/DigitalBowl';
import IngredientSelector from './components/IngredientSelector';
import KitchenDashboard from './components/KitchenDashboard';

export default function App() {
  // Theme state
  const [darkTheme, setDarkTheme] = useState<boolean>(false);

  // Apply light class to body/wrapper dynamically
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark');
    localStorage.setItem('pokirroll-theme', 'light');
  }, []);

  // Kitchen lock states
  const [isKitchenUnlocked, setIsKitchenUnlocked] = useState<boolean>(false);
  const [kitchenPasswordInput, setKitchenPasswordInput] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');

  // General App navigation state: 'kiosk' (ordering stage) vs 'kitchen' (chef stage)
  const [currentTab, setCurrentTab] = useState<'kiosk' | 'kitchen'>('kiosk');

  // Ingredients and their availability/stock status
  const [ingredients, setIngredients] = useState<Ingredient[]>(() => {
    const saved = localStorage.getItem('pokirroll-ingredients');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error loading ingredients, fallback to initial", e);
      }
    }
    return INITIAL_INGREDIENTS;
  });

  // Save ingredients to storage whenever updated
  useEffect(() => {
    localStorage.setItem('pokirroll-ingredients', JSON.stringify(ingredients));
  }, [ingredients]);

  // Current order building state
  const [selection, setSelection] = useState<SelectedIngredients>({
    size: 'Mediano',
    bases: [],
    proteins: [],
    vegetables: [],
    extras: [],
    sauces: []
  });

  // Kitchen Orders State
  const [orders, setOrders] = useState<PokeOrder[]>(() => {
    const saved = localStorage.getItem('pokirroll-orders');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Pre-populate with standard simulated orders if empty to showcase the system beautifully
        if (parsed.length === 0) {
          return getMockOrders();
        }
        return parsed;
      } catch (e) {
        console.error("Error parsing orders:", e);
      }
    }
    return getMockOrders();
  });

  // Save orders to storage whenever updated
  useEffect(() => {
    localStorage.setItem('pokirroll-orders', JSON.stringify(orders));
  }, [orders]);

  // Checkout modal state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [lastSubmittedOrder, setLastSubmittedOrder] = useState<PokeOrder | null>(null);

  // Delivery & Payment systems state
  const [deliveryOption, setDeliveryOption] = useState<'delivery' | 'takeaway'>('delivery');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentMethodUnion, setPaymentMethodUnion] = useState<'Efectivo' | 'Mercado Pago / Transferencia' | 'Tarjeta de Crédito / Débito'>('Efectivo');

  // Simulated Card Payment State
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccessAnimating, setPaymentSuccessAnimating] = useState(false);
  const [paymentFeedbackMsg, setPaymentFeedbackMsg] = useState('');

  // Kiosk flow active category tab
  const [activeCategory, setActiveCategory] = useState<'size' | 'base' | 'protein' | 'vegetable' | 'extra' | 'sauce'>('size');

  // Category navigation chain for buttons
  const categoryChain: ('size' | 'base' | 'protein' | 'vegetable' | 'extra' | 'sauce')[] = [
    'size', 'base', 'protein', 'vegetable', 'extra', 'sauce'
  ];

  // Helper mock orders
  function getMockOrders(): PokeOrder[] {
    return [
      {
        id: 'ord-mock-1',
        customerName: 'Santiago Giménez',
        size: 'Grande',
        bases: ['b_arroz_sushi', 'b_mix_verdes'],
        proteins: ['p_salmon_crudo', 'p_langostinos'],
        vegetables: ['v_pepino', 'v_palta', 'v_zanahoria'],
        extras: ['e_cebolla_crispy', 'e_philadelphia'],
        sauces: ['s_soja', 's_teriyaki'],
        timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(), // 12 mins ago
        status: 'pending',
        orderNumber: 8,
        deliveryAddress: 'Av. Corrientes 1530, Piso 5A, CABA',
        deliveryNotes: 'Tocar timbre 5A, portero visor',
        paymentMethod: 'Tarjeta de Crédito / Débito',
        paymentStatus: 'Aprobado / Pagado'
      },
      {
        id: 'ord-mock-2',
        customerName: 'Delfina Solís',
        size: 'Mediano',
        bases: ['b_arroz_yamani'],
        proteins: ['p_tofu', 'p_salmon_cocido'],
        vegetables: ['v_palta', 'v_cebolla_morada'],
        extras: ['e_alga_nori', 'e_mango'],
        sauces: ['s_ponzu'],
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
        status: 'pending',
        orderNumber: 9,
        deliveryAddress: 'Retiro en el Local / Takeaway',
        paymentMethod: 'Efectivo',
        paymentStatus: 'Pendiente de pago'
      }
    ];
  }

  // Handle stock toggling for any ingredient
  const handleToggleStock = (ingredientId: string) => {
    setIngredients(prev => prev.map(item => {
      if (item.id === ingredientId) {
        const nextAvailable = !item.available;
        
        // If we are making it unavailable, remove it from the active selection to avoid issues
        if (!nextAvailable) {
          setSelection(sel => ({
            ...sel,
            bases: sel.bases.filter(id => id !== ingredientId),
            proteins: sel.proteins.filter(id => id !== ingredientId),
            vegetables: sel.vegetables.filter(id => id !== ingredientId),
            extras: sel.extras.filter(id => id !== ingredientId),
            sauces: sel.sauces.filter(id => id !== ingredientId),
          }));
        }

        return { ...item, available: nextAvailable };
      }
      return item;
    }));
  };

  // Helper to retrieve category list of active selection
  const getSelectedKeysForCategory = (cat: string): string[] => {
    if (cat === 'base') return selection.bases;
    if (cat === 'protein') return selection.proteins;
    if (cat === 'vegetable') return selection.vegetables;
    if (cat === 'extra') return selection.extras;
    if (cat === 'sauce') return selection.sauces;
    return [];
  };

  // Handle ingredient selection limits and validation state
  const handleSelectIngredient = (id: string) => {
    const ing = ingredients.find(i => i.id === id);
    if (!ing || !ing.available) return;

    const cat = ing.category;
    const max = CATEGORIES_METADATA[cat].max;

    setSelection(prev => {
      if (cat === 'base') {
        const exists = prev.bases.includes(id);
        if (exists) return { ...prev, bases: prev.bases.filter(x => x !== id) };
        if (prev.bases.length >= max) {
          // Replace second or append
          return { ...prev, bases: [...prev.bases.slice(1), id] };
        }
        return { ...prev, bases: [...prev.bases, id] };
      }
      if (cat === 'protein') {
        const exists = prev.proteins.includes(id);
        if (exists) return { ...prev, proteins: prev.proteins.filter(x => x !== id) };
        if (prev.proteins.length >= max) {
          return { ...prev, proteins: [...prev.proteins.slice(1), id] };
        }
        return { ...prev, proteins: [...prev.proteins, id] };
      }
      if (cat === 'vegetable') {
        const exists = prev.vegetables.includes(id);
        if (exists) return { ...prev, vegetables: prev.vegetables.filter(x => x !== id) };
        if (prev.vegetables.length >= max) {
          return { ...prev, vegetables: [...prev.vegetables.slice(1), id] };
        }
        return { ...prev, vegetables: [...prev.vegetables, id] };
      }
      if (cat === 'extra') {
        const exists = prev.extras.includes(id);
        if (exists) return { ...prev, extras: prev.extras.filter(x => x !== id) };
        if (prev.extras.length >= max) {
          return { ...prev, extras: [...prev.extras.slice(1), id] };
        }
        return { ...prev, extras: [...prev.extras, id] };
      }
      if (cat === 'sauce') {
        const exists = prev.sauces.includes(id);
        if (exists) return { ...prev, sauces: prev.sauces.filter(x => x !== id) };
        if (prev.sauces.length >= max) {
          return { ...prev, sauces: [...prev.sauces.slice(1), id] };
        }
        return { ...prev, sauces: [...prev.sauces, id] };
      }
      return prev;
    });
  };

  const handleSelectSize = (sz: BowlSize) => {
    setSelection(prev => ({ ...prev, size: sz }));
  };

  // Navigate step wizard
  const handleNextStep = () => {
    const currentIndex = categoryChain.indexOf(activeCategory);
    if (currentIndex < categoryChain.length - 1) {
      setActiveCategory(categoryChain[currentIndex + 1]);
    } else {
      // Last step: open checkout modal
      setIsCheckoutOpen(true);
    }
  };

  const handlePrevStep = () => {
    const currentIndex = categoryChain.indexOf(activeCategory);
    if (currentIndex > 0) {
      setActiveCategory(categoryChain[currentIndex - 1]);
    }
  };

  // Submit new customized order to the Kitchen Queue
  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) return;
    
    if (deliveryOption === 'delivery' && !deliveryAddress.trim()) {
      alert('Por favor para envíos a domicilio debés ingresar una dirección.');
      return;
    }

    const startDispatch = (payStatus: 'Pendiente de pago' | 'Aprobado / Pagado') => {
      // Create a random order number from 1 to 99
      const orderNum = Math.floor(Math.random() * 98) + 1;

      const newOrder: PokeOrder = {
        id: `ord-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        customerName: customerName.trim(),
        size: selection.size,
        bases: selection.bases,
        proteins: selection.proteins,
        vegetables: selection.vegetables,
        extras: selection.extras,
        sauces: selection.sauces,
        timestamp: new Date().toISOString(),
        status: 'pending',
        orderNumber: orderNum,
        deliveryAddress: deliveryOption === 'delivery' ? deliveryAddress.trim() : 'Retiro en el Local / Takeaway',
        deliveryNotes: deliveryOption === 'delivery' && deliveryNotes.trim() ? deliveryNotes.trim() : undefined,
        paymentMethod: paymentMethodUnion,
        paymentStatus: payStatus
      };

      setOrders(prev => [newOrder, ...prev]);
      setLastSubmittedOrder(newOrder);
      setIsCheckoutOpen(false);

      // Reset selection state
      setSelection({
        size: 'Mediano',
        bases: [],
        proteins: [],
        vegetables: [],
        extras: [],
        sauces: []
      });
      setCustomerName('');
      setDeliveryAddress('');
      setDeliveryNotes('');
      setCardNumber('');
      setCardExpiry('');
      setCardCvv('');
      setCardName('');
      setPaymentMethodUnion('Efectivo');
      setDeliveryOption('delivery');
      setActiveCategory('size');
    };

    if (paymentMethodUnion !== 'Efectivo') {
      setIsProcessingPayment(true);
      setPaymentFeedbackMsg('Estableciendo conexión encriptada de pago...');
      
      setTimeout(() => {
        setPaymentFeedbackMsg('Verificando fondos y token de seguridad...');
        
        setTimeout(() => {
          setPaymentFeedbackMsg(`¡Operación autorizada exitosamente!`);
          setPaymentSuccessAnimating(true);
          
          setTimeout(() => {
            setIsProcessingPayment(false);
            setPaymentSuccessAnimating(false);
            setPaymentFeedbackMsg('');
            startDispatch('Aprobado / Pagado');
          }, 1100);
        }, 1200);
      }, 1000);
    } else {
      startDispatch('Pendiente de pago');
    }
  };

  // Complete/Serve an order from the kitchen
  const handleCompleteOrder = (orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'completed' } : o));
  };

  // Delete an order from queue or logs
  const handleDeleteOrder = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
  };

  // Clear all history completed orders
  const handleClearHistory = () => {
    setOrders(prev => prev.filter(o => o.status !== 'completed'));
  };

  // helper to translate string arrays to concrete ingredient records
  const getSelectedIngredientsByCat = (cat: 'base' | 'protein' | 'vegetable' | 'extra' | 'sauce') => {
    const ids = getSelectedKeysForCategory(cat);
    return ingredients.filter(i => ids.includes(i.id));
  };

  // Reset demo databases
  const handleResetDemo = () => {
    if (window.confirm("¿Restaurar valores de stock predeterminados y vaciar comanda?")) {
      setIngredients(INITIAL_INGREDIENTS);
      setOrders(getMockOrders());
      setSelection({
        size: 'Mediano',
        bases: [],
        proteins: [],
        vegetables: [],
        extras: [],
        sauces: []
      });
      setActiveCategory('size');
    }
  };

  return (
    <div className="min-h-screen bg-white transition-colors duration-300 font-sans text-black flex flex-col justify-between">
      
      {/* --- PREMIUM GLOBAL HEADER --- */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-150 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-rose-200">
            <span className="text-xl">🍣</span>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-display font-bold bg-gradient-to-r from-rose-600 to-amber-500 bg-clip-text text-transparent transform origin-left">
              Pokirroll
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-500 font-mono tracking-wider">
              POKE BOWL DIGITAL CREATOR
            </p>
          </div>
        </div>

        {/* Header center tabs: Client Kiosk vs Kitchen dashboard */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setCurrentTab('kiosk')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all cursor-pointer ${
              currentTab === 'kiosk'
                ? 'bg-white text-rose-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Armar Pedido</span>
            <span className="sm:hidden">Armar</span>
          </button>
          <button
            type="button"
            onClick={() => setCurrentTab('kitchen')}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all cursor-pointer ${
              currentTab === 'kitchen'
                ? 'bg-white text-rose-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Monitor Cocina</span>
            <span className="sm:hidden">Cocina</span>
            
            {/* Realtime flashing badge to let user know pending items inside kitchen */}
            {orders.filter(o => o.status !== 'completed').length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            )}
          </button>
        </div>

        {/* Global toggles */}
        <div className="flex items-center gap-2">
          {/* Quick Demo reset helper */}
          <button
            type="button"
            onClick={handleResetDemo}
            className="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-rose-600 bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
            title="Restaurar valores de fábrica"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* --- MAIN PAGE CONTENT WRAPPER --- */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Banner Alert displaying testing hint */}
        <div className="mb-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-800 dark:text-amber-300 text-xs sm:text-sm">
          <div className="flex items-start gap-2.5">
            <Info className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Simulador de Stock & Comanda</p>
              <p className="text-xs opacity-90 mt-0.5">
                Podés definir un ingrediente como <b>Sin stock</b> en el selector para verlo en gris/deshabilitado. 
                Los pedidos se envían directo a la solapa <b>Monitor Cocina</b> para ser armados de cero.
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={() => {
              // Set some items out of stock on click for speedy showcase!
              setIngredients(prev => prev.map(item => 
                ['b_arroz_yamani', 'p_atun_rojo', 'v_edamame', 'e_mango'].includes(item.id) 
                  ? { ...item, available: false } 
                  : item
              ));
            }}
            className="shrink-0 text-amber-700 hover:text-amber-900 dark:text-amber-200 dark:hover:text-amber-100 font-bold bg-amber-500/20 py-1.5 px-3 rounded-lg border border-amber-500/30 transition-all cursor-pointer active:scale-95"
          >
            Simular agotados
          </button>
        </div>

        <AnimatePresence mode="wait">
          {currentTab === 'kiosk' ? (
            
            /* ========================================================================= */
            /* ================ ARMADO DE BOWL INTERACTIVO (KIOSKO) ================== */
            /* ========================================================================= */
            <motion.div
              key="pane-kiosk"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              
              {/* LEFT SIDE COLUMN: DIGITAL BOWL RENDER VIEW (Sticky so it scrolls beautifully) */}
              <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
                
                {/* Main Visual Render Box */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-6 shadow-md overflow-hidden relative group">
                  <div className="absolute top-4 left-4">
                    <p className="text-[10px] font-mono font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">
                      Vaporera Visual 2D
                    </p>
                    <h2 className="text-xl font-display font-bold text-slate-800 dark:text-slate-100">
                      Vista en Vivo
                    </h2>
                  </div>

                  {/* High Quality Digital bowl renderer widget */}
                  <DigitalBowl
                    size={selection.size}
                    selectedBases={getSelectedIngredientsByCat('base')}
                    selectedProteins={getSelectedIngredientsByCat('protein')}
                    selectedVegetables={getSelectedIngredientsByCat('vegetable')}
                    selectedExtras={getSelectedIngredientsByCat('extra')}
                    selectedSauces={getSelectedIngredientsByCat('sauce')}
                  />

                  {/* Indicator to assist user */}
                  <div className="text-center text-xs text-slate-400 dark:text-slate-500 italic pb-2">
                    {selection.bases.length + selection.proteins.length + selection.vegetables.length === 0 
                      ? 'Empezá a agregar ingredientes abajo para ver cómo se añaden...' 
                      : '¡Se agregan e interactúan en tiempo real en tu bowl!'}
                  </div>
                </div>

                {/* Sub-Card: Current summary specs listing */}
                <div className="bg-slate-100/60 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-5 space-y-4">
                  <h4 className="font-display font-medium text-slate-700 dark:text-slate-300 text-sm border-b border-slate-200/50 dark:border-slate-850 pb-2">
                    Resumen de armado:
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                    <li className="flex justify-between">
                      <span className="font-mono">Tamaño:</span>
                      <strong className="text-rose-500 font-semibold">{selection.size}</strong>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-mono">Bases ({selection.bases.length}):</span>
                      <span className="text-right truncate max-w-xs block font-medium text-slate-700 dark:text-slate-300">
                        {selection.bases.length > 0 
                          ? getSelectedIngredientsByCat('base').map(i => i.name).join(', ')
                          : 'Ninguna'
                        }
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-mono">Proteínas ({selection.proteins.length}):</span>
                      <span className="text-right truncate max-w-xs block font-medium text-slate-700 dark:text-slate-300">
                        {selection.proteins.length > 0 
                          ? getSelectedIngredientsByCat('protein').map(i => i.name).join(', ')
                          : 'Ninguna'
                        }
                      </span>
                    </li>
                    <li className="flex justify-between text-xs">
                      <span className="font-mono">Verduras ({selection.vegetables.length}):</span>
                      <span className="text-right truncate max-w-xs block font-medium text-slate-700 dark:text-slate-300">
                        {selection.vegetables.length > 0 
                          ? getSelectedIngredientsByCat('vegetable').map(i => i.name).join(', ')
                          : 'Ninguna'
                        }
                      </span>
                    </li>
                    <li className="flex justify-between text-xs">
                      <span className="font-mono">Extras ({selection.extras.length}):</span>
                      <span className="text-right truncate max-w-xs block font-medium text-slate-700 dark:text-slate-300">
                        {selection.extras.length > 0 
                          ? getSelectedIngredientsByCat('extra').map(i => i.name).join(', ')
                          : 'Ninguna'
                        }
                      </span>
                    </li>
                    <li className="flex justify-between text-xs">
                      <span className="font-mono">Salsas ({selection.sauces.length}):</span>
                      <span className="text-right truncate max-w-xs block font-medium text-slate-700 dark:text-slate-300">
                        {selection.sauces.length > 0 
                          ? getSelectedIngredientsByCat('sauce').map(i => i.name).join(', ')
                          : 'Ninguna'
                        }
                      </span>
                    </li>
                  </ul>

                  {/* Immediate fast Action bottom clear */}
                  {(selection.bases.length > 0 || selection.proteins.length > 0 || selection.vegetables.length > 0 || selection.extras.length > 0 || selection.sauces.length > 0) && (
                    <button
                      type="button"
                      onClick={() => setSelection({ size: 'Mediano', bases: [], proteins: [], vegetables: [], extras: [], sauces: [] })}
                      className="w-full py-1.5 px-3 text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Limpiar recipiente</span>
                    </button>
                  )}
                </div>

                {/* Last Order alert callback widget */}
                {lastSubmittedOrder && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 rounded-2xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                        <Check className="w-4 h-4" strokeWidth={3} />
                      </div>
                      <div>
                        <p className="font-semibold">Pedido #{lastSubmittedOrder.orderNumber} enviado</p>
                        <p className="opacity-95">¡Cocina ya lo recibió para armarlo!</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentTab('kitchen')}
                      className="font-bold underline uppercase tracking-wider text-[10px] hover:text-emerald-950 dark:hover:text-emerald-100 cursor-pointer"
                    >
                      Ver Monitor
                    </button>
                  </motion.div>
                )}
              </div>

              {/* RIGHT SIDE COLUMN: INTERACTIVE SELECTION WIZARD PANEL */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Horizontal flow steps indicator bar */}
                <div className="flex bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 p-3 rounded-2xl shadow-sm justify-between gap-1 overflow-x-auto scrollbar-none">
                  {categoryChain.map((catKey) => {
                    const isActive = activeCategory === catKey;
                    const label = CATEGORIES_METADATA[catKey as keyof typeof CATEGORIES_METADATA]?.label || 'Tamaño';
                    
                    // calculate filled checks
                    const hasItems = catKey === 'size' 
                      ? true 
                      : getSelectedKeysForCategory(catKey).length > 0;

                    const stepIcons = {
                      size: '📏',
                      base: '🍚',
                      protein: '🍣',
                      vegetable: '🥒',
                      extra: '🧅',
                      sauce: '🫙'
                    }[catKey];

                    return (
                      <button
                        key={catKey}
                        type="button"
                        onClick={() => setActiveCategory(catKey)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                          isActive
                            ? 'bg-rose-500 text-white shadow-sm'
                            : hasItems && catKey !== 'size'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                              : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="text-sm">{stepIcons}</span>
                        <span>{label}</span>
                        {catKey !== 'size' && getSelectedKeysForCategory(catKey).length > 0 && (
                          <span className={`text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center ${
                            isActive 
                              ? 'bg-white text-rose-500 font-bold' 
                              : 'bg-emerald-500 text-white text-[10px]'
                          }`}>
                            {getSelectedKeysForCategory(catKey).length}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Current Category Selection Screen */}
                <div className="transition-all duration-300">
                  {activeCategory === 'size' ? (
                    
                    /* TAMAÑO VIEW */
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-2xl p-5 shadow-sm space-y-4">
                      <div>
                        <h3 className="text-xl font-display font-semibold text-slate-800 dark:text-slate-100">
                          1. Elegí el Tamaño de Bowl
                        </h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                          Los diámetros y raciones se configuran de acuerdo al apetito.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                        {(['Chico', 'Mediano', 'Grande'] as BowlSize[]).map((sz) => {
                          const isSelected = selection.size === sz;
                          const sizeDetails = {
                            Chico: { desc: 'Ideal para almuerzos ligeros', text: '1 Base, 1 Prot, 3 Verd', badge: 'Light' },
                            Mediano: { desc: 'La medida equilibrada recomendada', text: 'Hasta 2 Bases y Proteínas', badge: 'Estándar' },
                            Grande: { desc: 'Para un gran apetito sin límites', text: 'Máxima capacidad e ingredientes', badge: 'Poke Premium' }
                          }[sz];

                          return (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => handleSelectSize(sz)}
                              className={`p-5 rounded-2xl text-left border flex flex-col justify-between h-40 transition-all duration-300 cursor-pointer ${
                                isSelected
                                  ? 'border-rose-500 bg-rose-50/25 dark:bg-rose-950/15 ring-2 ring-rose-500/10'
                                  : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/20'
                              }`}
                            >
                              <div className="flex justify-between items-start w-full">
                                <span className="text-3xl">🥣</span>
                                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                                  isSelected 
                                    ? 'bg-rose-500 text-white' 
                                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                }`}>
                                  {sizeDetails.badge}
                                </span>
                              </div>

                              <div>
                                <h4 className={`text-base font-display font-semibold ${
                                  isSelected ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-200'
                                }`}>
                                  {sz}
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                  {sizeDetails.desc}
                                </p>
                                <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-2">
                                  {sizeDetails.text}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    
                    /* GENERAL INGREDIENTS ARRAYS GRID VIEW */
                    (() => {
                      const cat = activeCategory as Exclude<typeof activeCategory, 'size'>;
                      const meta = CATEGORIES_METADATA[cat];
                      return (
                        <IngredientSelector
                          ingredients={ingredients.filter(i => i.category === cat)}
                          title={meta.label}
                          maxSelections={meta.max}
                          selectedIds={getSelectedKeysForCategory(cat)}
                          description={meta.desc}
                          onSelect={handleSelectIngredient}
                          onToggleStock={handleToggleStock}
                        />
                      );
                    })()
                  )}
                </div>

                {/* Navigation and Checkout buttons */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    disabled={activeCategory === 'size'}
                    onClick={handlePrevStep}
                    className={`flex items-center gap-2 py-3 px-5 rounded-xl font-medium text-sm transition-all border ${
                      activeCategory === 'size'
                        ? 'opacity-40 border-slate-200 text-slate-400 dark:border-slate-800 cursor-not-allowed'
                        : 'border-slate-200 text-slate-600 dark:border-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer active:scale-95'
                    }`}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Anterior</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="flex items-center gap-2 py-3 px-6 rounded-xl font-medium text-sm transition-all bg-rose-600 hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-700 text-white shadow-md cursor-pointer active:scale-95"
                  >
                    <span>{activeCategory === 'sauce' ? 'Revisar & Enviar ➔' : 'Siguiente'}</span>
                    {activeCategory !== 'sauce' && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>

                {/* Interactive Ingredient stock availability helper indicator */}
                <div className="bg-slate-100/50 dark:bg-slate-900/10 border border-slate-200/40 dark:border-slate-800/40 rounded-xl p-4 text-xs text-slate-400 dark:text-slate-500 space-y-1">
                  <p className="font-semibold flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>¿Cómo funciona el stock deshabilitado en Pokirroll?</span>
                  </p>
                  <p>
                    Puedes usar el interruptor <b>"Disponibilidad"</b> ubicado en cada tarjeta individual. Al poner un ingrediente en "Agotado/Sin", 
                    su imagen inmediatamente se torna en escala de gris apagado y no es clickeable. Esto cumple la especificación de control de inventariado del restaurante.
                  </p>
                </div>
              </div>

            </motion.div>
          ) : (
            
            /* ========================================================================= */
            /* ================ KITCHEN DASHBOARD VIEW (PANTALLA COCINA) ============= */
            /* ========================================================================= */
            !isKitchenUnlocked ? (
              <motion.div
                key="pane-kitchen-locked"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="max-w-md mx-auto my-12 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm text-center space-y-6"
              >
                <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-rose-500 text-2xl">
                  🔒
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-black">
                    Acceso Restringido (Local)
                  </h2>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Este monitor es de uso exclusivo para el personal del local. Introducí la contraseña para visualizar la cola de producción.
                  </p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (kitchenPasswordInput === '1234') {
                      setIsKitchenUnlocked(true);
                      setPasswordError('');
                      setKitchenPasswordInput('');
                    } else {
                      setPasswordError('Contraseña incorrecta. Por favor intente nuevamente.');
                    }
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-2 text-left">
                    <label htmlFor="kitchen-password" className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                      Contraseña de Acceso:
                    </label>
                    <input
                      id="kitchen-password"
                      type="password"
                      placeholder="••••"
                      value={kitchenPasswordInput}
                      onChange={(e) => {
                        setKitchenPasswordInput(e.target.value);
                        if (passwordError) setPasswordError('');
                      }}
                      className="w-full text-center px-4 py-3 rounded-xl border border-slate-200 focus:border-black focus:ring-1 focus:ring-black/25 outline-none transition-all text-lg font-bold bg-slate-55 text-black tracking-[0.5em]"
                      autoFocus
                    />
                    {passwordError && (
                      <p className="text-xs text-rose-600 font-semibold mt-1">
                        ⚠️ {passwordError}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-6 rounded-xl font-semibold text-xs tracking-wider uppercase bg-black text-white hover:bg-slate-900 transition-colors cursor-pointer active:scale-95"
                  >
                    Ingresar al Monitor
                  </button>
                </form>

                <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400">
                  <p>🔑 Contraseña de demostración: <strong className="font-mono text-black font-bold">1234</strong></p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="pane-kitchen"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-display font-bold text-black flex items-center gap-2">
                      <ChefHat className="w-8 h-8 text-rose-500" />
                      <span>Pantalla de Comandas de Cocina</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500">
                      Acá los cocineros reciben los pedidos personalizados listos para ensamblar. No hay nada pre-armado.
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3 self-start sm:self-center">
                    <button
                      type="button"
                      onClick={() => setIsKitchenUnlocked(false)}
                      className="text-xs font-semibold px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                    >
                      <span>🔒 Bloquear Monitor</span>
                    </button>
                    
                    {/* Simulated buzzer count indicator */}
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs py-1.5 px-3 rounded-full font-mono font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                      <span>KITCHEN READY</span>
                    </div>
                  </div>
                </div>

                {/* Central full board dashboard widget */}
                <KitchenDashboard
                  orders={orders}
                  ingredientsList={ingredients}
                  onCompleteOrder={handleCompleteOrder}
                  onClearHistory={handleClearHistory}
                  onDeleteOrder={handleDeleteOrder}
                />
              </motion.div>
            )
          )}
        </AnimatePresence>
      </main>

      {/* --- FOOTER AT BOTTOM --- */}
      <footer className="bg-white/80 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800/80 py-5 px-6 text-center text-xs text-slate-400 dark:text-slate-550 flex flex-col sm:flex-row justify-between items-center max-w-7xl w-full mx-auto gap-3">
        <p>© 2026 Pokirroll Inc. – Ensaladas de Sushi Armadas al Instante.</p>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-mono uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded">
            Ingredientes Frescos Diarios
          </span>
          <span className="text-[10px] font-mono text-slate-350">
            v1.2 // PERSISTENCIA LOCAL OK
          </span>
        </div>
      </footer>

      {/* --- MODAL DIALOGUE: CHECKOUT / ENVIAR PEDIDO A COCINA --- */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop opacity */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!isProcessingPayment) setIsCheckoutOpen(false);
              }}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            {/* Content box popup */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 relative z-10 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              {/* Secure Payment Handshake Simulation Overlay */}
              <AnimatePresence>
                {isProcessingPayment && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-white/95 dark:bg-slate-900/98 rounded-3xl z-30 flex flex-col items-center justify-center p-6 text-center"
                  >
                    {!paymentSuccessAnimating ? (
                      <div className="space-y-4">
                        <div className="relative w-16 h-16 mx-auto">
                          <div className="absolute inset-0 rounded-full border-4 border-slate-100 dark:border-slate-800 border-t-rose-500 animate-spin" />
                          <div className="absolute inset-2 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500 text-xl font-bold">
                            🔐
                          </div>
                        </div>
                        <div>
                          <h4 className="font-display font-bold text-slate-800 dark:text-slate-100 text-lg">
                            Procesando Pago Seguro
                          </h4>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                            {paymentFeedbackMsg || 'Iniciando gateway encriptado SSL...'}
                          </p>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 dark:text-slate-550 bg-slate-100 dark:bg-slate-950 px-2.5 py-1 rounded inline-block">
                          TXN_ID: TXN_SIM_{Math.floor(Math.random() * 900000 + 100000)}
                        </div>
                      </div>
                    ) : (
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="space-y-4"
                      >
                        <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center text-2xl mx-auto shadow-md">
                          ✓
                        </div>
                        <div>
                          <h4 className="font-display font-bold text-emerald-600 dark:text-emerald-400 text-lg">
                            ¡Pago Aprobado!
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            El pago está verificado. Enviando comanda en vivo a la cocina...
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🛍️</span>
                  <h3 className="text-xl font-display font-bold text-slate-800 dark:text-slate-100">
                    Finalizar pedido
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm py-1 px-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Order quick overview */}
              <div className="p-4 bg-slate-50/50 dark:bg-slate-950/40 rounded-2xl border border-slate-100/80 dark:border-slate-850/50 space-y-2 text-xs">
                <p className="font-mono text-slate-400 font-bold uppercase text-[9px] tracking-wider">Tu Poke Bowl Personalizado:</p>
                <div className="grid grid-cols-3 gap-y-1.5 select-none">
                  <span className="font-semibold text-slate-400 dark:text-slate-500">Bowl:</span>
                  <span className="col-span-2 text-rose-600 dark:text-rose-400 font-bold">{selection.size}</span>

                  <span className="font-semibold text-slate-400 dark:text-slate-500">Bases:</span>
                  <span className="col-span-2 font-medium text-slate-700 dark:text-slate-300">
                    {selection.bases.length > 0 
                      ? getSelectedIngredientsByCat('base').map(i => i.name).join(', ')
                      : 'Ninguna'
                    }
                  </span>

                  <span className="font-semibold text-slate-400 dark:text-slate-500">Proteínas:</span>
                  <span className="col-span-2 font-medium text-slate-700 dark:text-slate-300">
                    {selection.proteins.length > 0 
                      ? getSelectedIngredientsByCat('protein').map(i => i.name).join(', ')
                      : 'Ninguna'
                    }
                  </span>

                  <span className="font-semibold text-slate-400 dark:text-slate-500">Verduras:</span>
                  <span className="col-span-2 font-medium text-slate-700 dark:text-slate-300">
                    {selection.vegetables.length > 0 
                      ? getSelectedIngredientsByCat('vegetable').map(i => i.name).join(', ')
                      : 'Ninguna'
                    }
                  </span>

                  <span className="font-semibold text-slate-400 dark:text-slate-500">Extras:</span>
                  <span className="col-span-2 font-medium text-slate-700 dark:text-slate-300">
                    {selection.extras.length > 0 
                      ? getSelectedIngredientsByCat('extra').map(i => i.name).join(', ')
                      : 'Ninguna'
                    }
                  </span>

                  <span className="font-semibold text-slate-400 dark:text-slate-500">Salsas:</span>
                  <span className="col-span-2 font-medium text-slate-700 dark:text-slate-300">
                    {selection.sauces.length > 0 
                      ? getSelectedIngredientsByCat('sauce').map(i => i.name).join(', ')
                      : 'Ninguna'
                    }
                  </span>
                </div>
              </div>

              {/* Form validation */}
              <form onSubmit={handleSubmitOrder} className="space-y-4">
                
                {/* Nombre de cliente */}
                <div className="space-y-1.5">
                  <label htmlFor="client-name-input" className="block text-xs font-mono font-bold text-slate-550 dark:text-slate-400 uppercase">
                    Nombre del Cliente (Para llamarte):
                  </label>
                  <input
                    id="client-name-input"
                    type="text"
                    required
                    placeholder="Escribí tu nombre (ej: Marina L.)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-200 outline-none transition-all text-xs bg-slate-50 dark:bg-slate-950 dark:border-slate-800 dark:focus:border-rose-500/80 text-slate-800 dark:text-slate-100"
                    autoFocus
                  />
                </div>

                {/* 1. Modalidad de Entrega */}
                <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                  <label className="block text-xs font-mono font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wider">
                    1. Modalidad de Entrega:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDeliveryOption('delivery')}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        deliveryOption === 'delivery'
                          ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold'
                          : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850'
                      }`}
                    >
                      <span>🚚 Envío a Domicilio</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryOption('takeaway')}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        deliveryOption === 'takeaway'
                          ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold'
                          : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850'
                      }`}
                    >
                      <span>🛍️ Retiro Takeaway</span>
                    </button>
                  </div>
                </div>

                {/* Conditional Delivery Inputs */}
                {deliveryOption === 'delivery' ? (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label htmlFor="delivery-address-input" className="block text-[11px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase">
                        Dirección del Delivery * :
                      </label>
                      <input
                        id="delivery-address-input"
                        type="text"
                        required={deliveryOption === 'delivery'}
                        placeholder="Ej: Av. de Mayo 1370, Piso 4B, Montserrat"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-rose-500 outline-none text-xs bg-slate-50 dark:bg-slate-950 dark:border-slate-800 text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="delivery-notes-input" className="block text-[11px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase">
                        Indicaciones / Teléfono (Opcional):
                      </label>
                      <input
                        id="delivery-notes-input"
                        type="text"
                        placeholder="Ej: Tocar timbre 4B, portón negro grande"
                        value={deliveryNotes}
                        onChange={(e) => setDeliveryNotes(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-rose-500 outline-none text-xs bg-slate-50 dark:bg-slate-950 dark:border-slate-800 text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800/40 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                    <p className="font-semibold text-slate-700 dark:text-slate-200">📍 Retiro en sucursal:</p>
                    <p className="font-mono">Av. Corrientes 1400, Buenos Aires (Sede Central)</p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">¡Listo para retirar en 15 minutos!</p>
                  </div>
                )}

                {/* 2. Sistema de Pago */}
                <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                  <label className="block text-xs font-mono font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wider">
                    2. Sistema de Pago:
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {([
                      { key: 'Efectivo', label: '💵 Efectivo' },
                      { key: 'Mercado Pago / Transferencia', label: '📱 Mercado Pago' },
                      { key: 'Tarjeta de Crédito / Débito', label: '💳 Tarjeta' }
                    ] as const).map((pm) => (
                      <button
                        key={pm.key}
                        type="button"
                        onClick={() => {
                          setPaymentMethodUnion(pm.key);
                          if (pm.key === 'Efectivo') {
                            setCardNumber('');
                            setCardExpiry('');
                            setCardCvv('');
                            setCardName('');
                          }
                        }}
                        className={`py-2 px-1 rounded-xl border text-[11px] font-bold text-center transition-all cursor-pointer ${
                          paymentMethodUnion === pm.key
                            ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-450'
                            : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850'
                        }`}
                      >
                        {pm.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interactive Mercado Pago simulation */}
                {paymentMethodUnion === 'Mercado Pago / Transferencia' && (
                  <div className="p-4 bg-blue-50/40 dark:bg-blue-950/10 border border-blue-100/50 dark:border-blue-900/20 rounded-2xl space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 shrink-0 bg-sky-500 rounded-xl flex items-center justify-center text-white font-extrabold text-sm shadow-sm select-none">
                        mp
                      </div>
                      <div className="text-xs">
                        <p className="font-bold text-sky-750 dark:text-sky-400">Transferencia o Pasarela Mercado Pago</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">Acreditación inmediata simulada con token bancario.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-sky-100 dark:border-sky-900/10 gap-3">
                      <div className="text-[11px] space-y-0.5">
                        <p className="font-mono text-slate-400 uppercase text-[9px] font-bold">ALIAS DE TRANSFERENCIA:</p>
                        <p className="font-mono font-bold text-sky-600 dark:text-sky-400 select-all">pokirroll.sushi.mp</p>
                        <p className="text-[10px] text-slate-400">Titular: Pokirroll Bowl Oficial</p>
                      </div>
                      
                      {/* Fake styled QR code */}
                      <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 p-1 flex flex-wrap gap-0.5 justify-center items-center shrink-0">
                        {Array.from({ length: 16 }).map((_, i) => (
                          <div key={i} className={`w-2 h-2 ${Math.random() > 0.45 ? 'bg-slate-800 dark:bg-slate-200' : 'bg-transparent'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Real-time styled Credit Card inputs */}
                {paymentMethodUnion === 'Tarjeta de Crédito / Débito' && (
                  <div className="space-y-3">
                    {/* Visual Virtual Card mockup widget */}
                    <div className="w-full h-32 bg-gradient-to-br from-slate-900 via-rose-955 to-slate-950 rounded-2xl p-4 text-white relative shadow-lg overflow-hidden flex flex-col justify-between border border-white/5">
                      {/* Chips & Network brand logo */}
                      <div className="flex justify-between items-center">
                        <div className="w-8 h-6 bg-slate-700/40 border border-slate-600/35 rounded p-0.5 flex flex-col justify-between">
                          <div className="border-b border-amber-400/40 h-1.5" />
                          <div className="border-b border-amber-450/40 h-1.5" />
                        </div>
                        <span className="font-mono text-[10px] font-bold tracking-widest text-slate-300">VISA DEBIT/CREDIT</span>
                      </div>

                      {/* Card number label */}
                      <div className="font-mono text-sm tracking-widest text-center my-1 select-none text-rose-200">
                        {cardNumber ? cardNumber.replace(/(\d{4})/g, '$1 ').trim() : '•••• •••• •••• ••••'}
                      </div>

                      {/* Name / Expiry */}
                      <div className="flex justify-between text-[10px] font-mono text-slate-300">
                        <div>
                          <p className="text-[8px] uppercase tracking-wider text-slate-400">Titular de Tarjeta</p>
                          <p className="font-bold truncate max-w-[210px] uppercase">{cardName || 'JUAN PÉREZ'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[8px] uppercase tracking-wider text-slate-400">Vence</p>
                          <p className="font-bold">{cardExpiry || 'MM/AA'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Entry Fields */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="col-span-2 space-y-1">
                        <label htmlFor="card-number-input" className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase">Número de Tarjeta *</label>
                        <input
                          id="card-number-input"
                          type="text"
                          required={paymentMethodUnion === 'Tarjeta de Crédito / Débito'}
                          maxLength={16}
                          placeholder="4545120048801812"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 outline-none bg-slate-50 dark:bg-slate-950 dark:border-slate-800 text-slate-800 dark:text-slate-100 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="card-expiry-input" className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase">Vencimiento *</label>
                        <input
                          id="card-expiry-input"
                          type="text"
                          required={paymentMethodUnion === 'Tarjeta de Crédito / Débito'}
                          placeholder="MM/AA"
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => {
                            let v = e.target.value;
                            if (v.length === 2 && !v.includes('/') && !e.target.value.endsWith('/')) v += '/';
                            setCardExpiry(v);
                          }}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 outline-none bg-slate-50 dark:bg-slate-950 dark:border-slate-800 text-slate-800 dark:text-slate-100 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="card-cvv-input" className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase">Cód. Seguridad *</label>
                        <input
                          id="card-cvv-input"
                          type="password"
                          required={paymentMethodUnion === 'Tarjeta de Crédito / Débito'}
                          placeholder="123"
                          maxLength={3}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 outline-none bg-slate-50 dark:bg-slate-950 dark:border-slate-800 text-slate-800 dark:text-slate-100 text-xs"
                        />
                      </div>

                      <div className="col-span-2 space-y-1">
                        <label htmlFor="card-name-input" className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase">Nombre en la tarjeta *</label>
                        <input
                          id="card-name-input"
                          type="text"
                          required={paymentMethodUnion === 'Tarjeta de Crédito / Débito'}
                          placeholder="Escribí el nombre exacto de la tarjeta"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 outline-none bg-slate-50 dark:bg-slate-950 dark:border-slate-800 text-slate-850 dark:text-slate-100 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-rose-500/5 text-rose-700 dark:text-rose-450 p-3 rounded-xl border border-rose-500/10 text-xs flex gap-2">
                  <UtensilsCrossed className="w-4.5 h-4.5 shrink-0" />
                  <span>
                    El pedido se enviará al circuito de cocina. Los cocineros prepararán sobre la marcha esta comanda exacta.
                  </span>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCheckoutOpen(false)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-705 dark:text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-850 transition-all cursor-pointer"
                  >
                    Seguir Editando
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-200 dark:shadow-none flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Confirmar & Pagar</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
