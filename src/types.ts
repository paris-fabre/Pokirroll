/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type BowlSize = 'Chico' | 'Mediano' | 'Grande';

export interface Ingredient {
  id: string;
  name: string;
  category: 'base' | 'protein' | 'vegetable' | 'extra' | 'sauce';
  colors: string[]; // hex codes or tailwind color classes
  icon: string; // Emoji character or simple label
  imageUrl?: string; // High-resolution realistic image URL
  available: boolean; // True by default. Can be toggled to false to demonstrate 'gris / deshabilitado'
}

export interface SelectedIngredients {
  size: BowlSize;
  bases: string[];       // IDs of selected bases (up to 2)
  proteins: string[];    // IDs of selected proteins (up to 2)
  vegetables: string[];  // IDs of selected vegetables (up to 4)
  extras: string[];      // IDs of selected extras (up to 3)
  sauces: string[];      // IDs of selected sauces (up to 2)
}

export interface PokeOrder {
  id: string;
  customerName: string;
  size: BowlSize;
  bases: string[];
  proteins: string[];
  vegetables: string[];
  extras: string[];
  sauces: string[];
  timestamp: string;
  status: 'pending' | 'preparing' | 'completed';
  orderNumber: number;
  deliveryAddress: string;
  deliveryNotes?: string;
  paymentMethod: 'Efectivo' | 'Mercado Pago / Transferencia' | 'Tarjeta de Crédito / Débito';
  paymentStatus: 'Pendiente de pago' | 'Aprobado / Pagado';
}
