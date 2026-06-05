/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Ingredient } from './types';

export const INITIAL_INGREDIENTS: Ingredient[] = [
  // --- BASES ---
  { id: 'b_arroz_sushi', name: 'Arroz de sushi', category: 'base', colors: ['#ffffff', '#f4f4f5'], icon: '🍚', imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=250&h=250&q=80', available: true },
  { id: 'b_arroz_yamani', name: 'Arroz yamani', category: 'base', colors: ['#c4a482', '#9f815b'], icon: '🌾', imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=250&h=250&q=80', available: true },
  { id: 'b_mix_verdes', name: 'Mix de verdes', category: 'base', colors: ['#22c55e', '#15803d'], icon: '🥬', imageUrl: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=250&h=250&q=80', available: true },
  { id: 'b_arroz_comun', name: 'Arroz común', category: 'base', colors: ['#f8fafc', '#e2e8f0'], icon: '🍲', imageUrl: 'https://images.unsplash.com/photo-1516685018646-549198525c1b?auto=format&fit=crop&w=250&h=250&q=80', available: true },
  { id: 'b_quinoa', name: 'Quinoa', category: 'base', colors: ['#eab308', '#ca8a04'], icon: '🌱', imageUrl: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=250&h=250&q=80', available: true },

  // --- PROTEINS ---
  { id: 'p_salmon_crudo', name: 'Salmón crudo', category: 'protein', colors: ['#fca5a5', '#ef4444'], icon: '🍣', imageUrl: 'https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=250&h=250&q=80', available: true },
  { id: 'p_salmon_cocido', name: 'Salmón cocido', category: 'protein', colors: ['#fbcfe8', '#f472b6'], icon: '🐟', imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=250&h=250&q=80', available: true },
  { id: 'p_langostinos', name: 'Langostinos', category: 'protein', colors: ['#fda4af', '#f43f5e'], icon: '🍤', imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=250&h=250&q=80', available: true },
  { id: 'p_pollo', name: 'Pollo', category: 'protein', colors: ['#fcd34d', '#d97706'], icon: '🍗', imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=250&h=250&q=80', available: true },
  { id: 'p_tofu', name: 'Tofu', category: 'protein', colors: ['#f1f5f9', '#cbd5e1'], icon: '⬜', imageUrl: 'https://images.unsplash.com/photo-1546069901-34448557ee6e?auto=format&fit=crop&w=250&h=250&q=80', available: true },
  { id: 'p_atun_rojo', name: 'Atún rojo', category: 'protein', colors: ['#991b1b', '#7f1d1d'], icon: '🥩', imageUrl: 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?auto=format&fit=crop&w=250&h=250&q=80', available: true },

  // --- VEGETABLES ---
  { id: 'v_pepino', name: 'Pepino', category: 'vegetable', colors: ['#86efac', '#22c55e'], icon: '🥒', imageUrl: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=250&h=250&q=80', available: true },
  { id: 'v_cebolla_morada', name: 'Cebolla morada', category: 'vegetable', colors: ['#d946ef', '#a21caf'], icon: '🧅', imageUrl: 'https://images.unsplash.com/photo-1620574387735-3624d75b2dbc?auto=format&fit=crop&w=250&h=250&q=80', available: true },
  { id: 'v_zanahoria', name: 'Zanahoria', category: 'vegetable', colors: ['#fb923c', '#ea580c'], icon: '🥕', imageUrl: 'https://images.unsplash.com/photo-1590868309235-db84fed5610a?auto=format&fit=crop&w=250&h=250&q=80', available: true },
  { id: 'v_edamame', name: 'Edamame', category: 'vegetable', colors: ['#4ade80', '#16a34a'], icon: '🫛', imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=250&h=250&q=80', available: false }, // Let's set Edamame false by default to show grey selection and test the feature!
  { id: 'v_palta', name: 'Palta', category: 'vegetable', colors: ['#a7f3d0', '#10b981'], icon: '🥑', imageUrl: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=250&h=250&q=80', available: true },
  { id: 'v_brotes_soja', name: 'Brotes de soja', category: 'vegetable', colors: ['#fef08a', '#eab308'], icon: '🌱', imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=250&h=250&q=80', available: true },

  // --- EXTRAS ---
  { id: 'e_cebolla_crispy', name: 'Cebolla crispy', category: 'extra', colors: ['#b45309', '#78350f'], icon: '🧅', imageUrl: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=250&h=250&q=80', available: true },
  { id: 'e_alga_nori', name: 'Alga nori', category: 'extra', colors: ['#1e293b', '#0f172a'], icon: '⬛', imageUrl: 'https://images.unsplash.com/photo-1607301401229-08085d3420f1?auto=format&fit=crop&w=250&h=250&q=80', available: true },
  { id: 'e_batata_frita', name: 'Batata frita', category: 'extra', colors: ['#f59e0b', '#ca8a04'], icon: '🍟', imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=250&h=250&q=80', available: true },
  { id: 'e_wasabi', name: 'Wasabi', category: 'extra', colors: ['#4ade80', '#22c55e'], icon: '🟢', imageUrl: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=250&h=250&q=80', available: true },
  { id: 'e_jengibre', name: 'Jengibre', category: 'extra', colors: ['#fbcfe8', '#fda4af'], icon: '🍥', imageUrl: 'https://images.unsplash.com/photo-1617093727282-ebee9b4cfdf5?auto=format&fit=crop&w=250&h=250&q=80', available: true },
  { id: 'e_philadelphia', name: 'Philadelphia', category: 'extra', colors: ['#f8fafc', '#ffffff'], icon: '🧀', imageUrl: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=250&h=250&q=80', available: true },
  { id: 'e_mango', name: 'Mango', category: 'extra', colors: ['#facc15', '#f59e0b'], icon: '🥭', imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=250&h=250&q=80', available: true },

  // --- SAUCES ---
  { id: 's_soja', name: 'Soja', category: 'sauce', colors: ['#172554', '#090d16'], icon: '🫙', imageUrl: 'https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?auto=format&fit=crop&w=250&h=250&q=80', available: true },
  { id: 's_ponzu', name: 'Ponzu', category: 'sauce', colors: ['#451a03', '#1c0a00'], icon: '🥃', imageUrl: 'https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=250&h=250&q=80', available: true },
  { id: 's_maracuya', name: 'Maracuyá', category: 'sauce', colors: ['#facc15', '#eab308'], icon: '🟡', imageUrl: 'https://images.unsplash.com/photo-1534531173927-aeb928d54385?auto=format&fit=crop&w=250&h=250&q=80', available: true },
  { id: 's_teriyaki', name: 'Teriyaki', category: 'sauce', colors: ['#2d1500', '#1f0d01'], icon: '🧉', imageUrl: 'https://images.unsplash.com/photo-1603532648955-039310d9ed75?auto=format&fit=crop&w=250&h=250&q=80', available: true },
  { id: 's_picante', name: 'Picante', category: 'sauce', colors: ['#ef4444', '#b91c1c'], icon: '🔥', imageUrl: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=250&h=250&q=80', available: true }
];

export const CATEGORIES_METADATA = {
  size: { label: 'Tamaño', max: 1, desc: 'Elegí el tamaño del bowl' },
  base: { label: 'Bases', max: 2, desc: 'Elegí hasta 2 bases' },
  protein: { label: 'Proteínas', max: 2, desc: 'Elegí hasta 2 proteínas' },
  vegetable: { label: 'Verduras', max: 4, desc: 'Elegí hasta 4 verduras' },
  extra: { label: 'Extras', max: 3, desc: 'Elegí hasta 3 extras' },
  sauce: { label: 'Salsas', max: 2, desc: 'Elegí hasta 2 salsas' }
};
