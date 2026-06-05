/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Ingredient, BowlSize } from '../types';

interface DigitalBowlProps {
  size: BowlSize;
  selectedBases: Ingredient[];
  selectedProteins: Ingredient[];
  selectedVegetables: Ingredient[];
  selectedExtras: Ingredient[];
  selectedSauces: Ingredient[];
}

export default function DigitalBowl({
  size,
  selectedBases,
  selectedProteins,
  selectedVegetables,
  selectedExtras,
  selectedSauces,
}: DigitalBowlProps) {
  // Map size to visual scale
  const sizeScale = {
    Chico: 0.85,
    Mediano: 1.0,
    Grande: 1.15,
  }[size];

  // Render bases
  const renderBases = () => {
    return selectedBases.flatMap((base, index) => {
      const isVerdes = base.id === 'b_mix_verdes';
      const isSushi = base.id === 'b_arroz_sushi' || base.id === 'b_arroz_comun';
      const isYamani = base.id === 'b_arroz_yamani';
      const isQuinoa = base.id === 'b_quinoa';
      
      const count = isVerdes ? 22 : isQuinoa ? 50 : 25; // Dense grains for high-quality volumetric effect
      const color1 = base.colors[0];
      const color2 = base.colors[1] || base.colors[0];

      return Array.from({ length: count }).map((_, i) => {
        // Distribute within lower part of the bowl
        // X: 80 to 320, Y: 180 to 250
        const angle = (i / count) * Math.PI + (index * 0.1);
        const radiusX = 110 + (i % 3) * 10;
        const radiusY = 40 + (i % 2) * 10;
        const x = 200 + Math.cos(angle) * radiusX * 0.9;
        const y = 220 + Math.sin(angle) * radiusY * 0.8;
        const rotation = (i * 37) % 360;

        return {
          id: `${base.id}-${i}`,
          x,
          y,
          rotation,
          color1,
          color2,
          isVerdes,
          isSushi,
          isYamani,
          isQuinoa,
          baseIndex: index,
          baseId: base.id,
        };
      });
    });
  };

  // Deterministic generator of pile coordinates constrained inside the bowl's opening ellipse
  const getPileCoordinates = (
    pileIndex: number,
    totalPiles: number,
    itemIndex: number,
    itemCount: number,
    id: string
  ) => {
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Arrange starting angles in a circle to place non-overlapping piles around the rim
    const baseAngle = (pileIndex / totalPiles) * 2 * Math.PI + 0.55;
    
    // Spread individual elements within this pile's sector
    const spreadAngle = 0.22;
    const offsetAngle = (itemIndex - (itemCount - 1) / 2) * spreadAngle + ((hash * (itemIndex + 1)) % 5) * 0.03;
    const finalAngle = baseAngle + offsetAngle;
    
    // Radius ranges from 45 to 80 (well inside the bowl's opening of rx=145)
    const baseRadius = 45 + ((hash + itemIndex * 19) % 36);
    
    const x = 200 + Math.cos(finalAngle) * baseRadius;
    const y = 195 + Math.sin(finalAngle) * baseRadius * 0.28; // compressed Y-axis to match 3D bowl perspective
    
    const rotation = (finalAngle * 180) / Math.PI + 90 + ((itemIndex * 31) % 40) - 20;
    
    return { x, y, rotation };
  };

  // Render proteins
  const renderProteins = (pileIndices: Record<string, number>, totalPiles: number) => {
    return selectedProteins.flatMap((protein) => {
      // Create specific layouts for protein cubes or slices
      const isSalmon = protein.id === 'p_salmon_crudo' || protein.id === 'p_salmon_cocido';
      const isTuna = protein.id === 'p_atun_rojo';
      const isShrimp = protein.id === 'p_langostinos';
      const isChicken = protein.id === 'p_pollo';
      const isTofu = protein.id === 'p_tofu';

      const count = 6;
      const color1 = protein.colors[0];
      const color2 = protein.colors[1] || protein.colors[0];
      const pileIndex = pileIndices[protein.id] ?? 0;

      return Array.from({ length: count }).map((_, i) => {
        const { x, y, rotation } = getPileCoordinates(pileIndex, totalPiles, i, count, protein.id);

        return {
          id: `${protein.id}-${i}`,
          x,
          y,
          rotation,
          color1,
          color2,
          isSalmon,
          isTuna,
          isShrimp,
          isChicken,
          isTofu,
          emoji: protein.icon
        };
      });
    });
  };

  // Render vegetables
  const renderVegetables = (pileIndices: Record<string, number>, totalPiles: number) => {
    return selectedVegetables.flatMap((veg) => {
      const count = 5;
      const color1 = veg.colors[0];
      const color2 = veg.colors[1] || veg.colors[0];
      const pileIndex = pileIndices[veg.id] ?? 0;

      return Array.from({ length: count }).map((_, i) => {
        const { x, y, rotation } = getPileCoordinates(pileIndex, totalPiles, i, count, veg.id);

        return {
          id: `${veg.id}-${i}`,
          x,
          y,
          rotation,
          color1,
          color2,
          vegId: veg.id,
          emoji: veg.icon
        };
      });
    });
  };

  // Render extras
  const renderExtras = (pileIndices: Record<string, number>, totalPiles: number) => {
    return selectedExtras.flatMap((extra) => {
      const isScattered = extra.id === 'e_cebolla_crispy' || extra.id === 'e_alga_nori';
      const count = extra.id === 'e_cebolla_crispy' ? 12 : extra.id === 'e_alga_nori' ? 8 : 4;
      const color1 = extra.colors[0];
      const color2 = extra.colors[1] || extra.colors[0];
      const pileIndex = pileIndices[extra.id] ?? 0;

      return Array.from({ length: count }).map((_, i) => {
        let x, y, rotation;
        if (isScattered) {
          // Scatter ingredients evenly across the opening of the bowl mouth using golden ratio/polar layout
          const radius = 25 + ((i * 31) % 70); // 25px to 95px from center
          const scatterAngle = (i / count) * Math.PI * 2 + (i * 0.45);
          x = 200 + Math.cos(scatterAngle) * radius;
          y = 195 + Math.sin(scatterAngle) * radius * 0.28;
          rotation = (i * 59) % 360;
        } else {
          // Grouped pile
          const coords = getPileCoordinates(pileIndex, totalPiles, i, count, extra.id);
          x = coords.x;
          y = coords.y;
          rotation = coords.rotation;
        }

        return {
          id: `${extra.id}-${i}`,
          x,
          y,
          rotation,
          color1,
          color2,
          extraId: extra.id,
          emoji: extra.icon
        };
      });
    });
  };

  // Find all active piled ingredients to distribute them in sectors
  const activePiles: { id: string }[] = [];
  selectedProteins.forEach(p => activePiles.push({ id: p.id }));
  selectedVegetables.forEach(v => activePiles.push({ id: v.id }));
  selectedExtras.forEach(e => {
    // Only pile selected non-scattered extras
    if (e.id !== 'e_cebolla_crispy' && e.id !== 'e_alga_nori') {
      activePiles.push({ id: e.id });
    }
  });

  const pileIndices: Record<string, number> = {};
  activePiles.forEach((pile, idx) => {
    pileIndices[pile.id] = idx;
  });
  const totalPiles = activePiles.length || 1;

  const basesItems = renderBases();
  const proteinsItems = renderProteins(pileIndices, totalPiles);
  const veggiesItems = renderVegetables(pileIndices, totalPiles);
  const extrasItems = renderExtras(pileIndices, totalPiles);

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-[320px] sm:h-[400px]">
      {/* Background shadow glow */}
      <div className="absolute w-[280px] sm:w-[360px] h-[60px] bg-slate-900/10 dark:bg-black/30 rounded-[100%] blur-xl bottom-12 transition-all duration-300" style={{ transform: `scale(${sizeScale})` }} />

      {/* Main SVG Graphic Canvas */}
      <motion.svg
        className="w-full max-w-[400px] h-full z-10 select-none overflow-visible"
        viewBox="0 0 400 400"
        animate={{ scale: sizeScale }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      >
        {/* --- BACK GRID DECORATION (SUBTLE YET CLEAN) --- */}
        <line x1="50" y1="200" x2="350" y2="200" stroke="#cbd5e1" strokeDasharray="3 3" opacity="0.2" className="dark:stroke-slate-700" />
        <line x1="200" y1="50" x2="200" y2="350" stroke="#cbd5e1" strokeDasharray="3 3" opacity="0.2" className="dark:stroke-slate-700" />

        {/* --- BACKGROUND BOWL INSIDE --- */}
        {/* Generates depth for the inner bowl */}
        <ellipse cx="200" cy="200" rx="145" ry="85" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="2" className="dark:fill-slate-800 dark:stroke-slate-700" />
        
        {/* SVG definitions for dynamic base masks and gradients */}
        <defs>
          {/* Master clipping path constraint of the inner bowl bottom area */}
          <clipPath id="bed-ellipse-clip">
            <ellipse cx="200" cy="210" rx="141" ry="74" />
          </clipPath>

          {/* Dynamic dynamic vertical column slices depending on bases count chosen */}
          {selectedBases.map((base, index) => {
            const totalBases = selectedBases.length;
            const xStart = 50 + (index * (300 / totalBases));
            const width = 300 / totalBases;
            return (
              <clipPath id={`base-column-clip-${index}`} key={`${base.id}-${index}`}>
                <rect x={xStart} y="110" width={width} height="190" />
              </clipPath>
            );
          })}

          <radialGradient id="bowlInnerShadow" cx="50%" cy="50%" r="50%">
            <stop offset="60%" stopColor="#000000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.15" />
          </radialGradient>

          {/* Premium base ingredients filling bed gradients */}
          <linearGradient id="grad-b_arroz_sushi" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="70%" stopColor="#f8f9fa" />
            <stop offset="100%" stopColor="#e9ecef" />
          </linearGradient>

          <linearGradient id="grad-b_arroz_yamani" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#dfd0be" />
            <stop offset="60%" stopColor="#c5a684" />
            <stop offset="100%" stopColor="#a38466" />
          </linearGradient>

          <linearGradient id="grad-b_mix_verdes" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="50%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>

          <linearGradient id="grad-b_arroz_comun" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fdfdfd" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>

          <linearGradient id="grad-b_quinoa" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="60%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>

          <linearGradient id="grad-fallback-base" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
        </defs>

        <ellipse cx="200" cy="200" rx="143" ry="83" fill="url(#bowlInnerShadow)" />

        {/* --- LAYER 1: BASES (At the bottom) --- */}
        <g id="layer-bases" clipPath="url(#bed-ellipse-clip)">
          {/* 1. Draw solid beds filled with base ingredient colors to fully occupy the bottom of the bowl */}
          {selectedBases.map((base, index) => {
            const gradId = `grad-${base.id}`;
            const clipColumn = `url(#base-column-clip-${index})`;
            const isVerdes = base.id === 'b_mix_verdes';

            return (
              <g key={`bg-${base.id}-${index}`} clipPath={clipColumn}>
                {/* Full physical Bed representing the selected base ingredient */}
                <ellipse
                  cx="200"
                  cy="210"
                  rx="141"
                  ry="74"
                  fill={`url(#${gradId})`}
                  opacity="0.96"
                />

                {/* Overlaid layered leaves forest structures if Mix de Verdes */}
                {isVerdes && (
                  <g opacity="0.65">
                    <path d="M 100,200 Q 150,170 240,195 T 320,230" fill="none" stroke="#166534" strokeWidth="12" />
                    <path d="M 80,225 Q 160,180 220,220 T 310,240" fill="none" stroke="#14532d" strokeWidth="10" />
                    <path d="M 130,210 Q 200,165 260,205 T 300,250" fill="none" stroke="#15803d" strokeWidth="8" />
                  </g>
                )}
              </g>
            );
          })}

          {/* 2. Layer individual particles and grains falling down on top of the solid bed in their respective columns */}
          <AnimatePresence>
            {basesItems.map((item) => {
              const clipColumn = `url(#base-column-clip-${item.baseIndex})`;
              return (
                <motion.g
                  key={item.id}
                  clipPath={clipColumn}
                  initial={{ y: -180, opacity: 0, x: item.x + Math.sin(item.y)*20 }}
                  animate={{ y: item.y, x: item.x, opacity: 1 }}
                  exit={{ y: 240, opacity: 0, scale: 0.1 }}
                  transition={{ type: 'spring', stiffness: 90, damping: 12, delay: Math.random() * 0.15 }}
                >
                  {item.isVerdes ? (
                    // Nice visual mix de verdes (organic green leaf shape)
                    <path
                      d="M 0,-10 C 6,-16 14,-10 10,-2 C 7,5 -3,8 -8,2 C -11,-3 -5,-5 0,-10 Z"
                      fill={item.color1}
                      stroke={item.color2}
                      strokeWidth="1"
                      transform={`rotate(${item.rotation}) scale(1.4)`}
                      opacity="0.9"
                    />
                  ) : item.isSushi || item.isYamani ? (
                    // Grain of rice (small clean oval)
                    <ellipse
                      cx="0" cy="0" rx="7" ry="4"
                      fill={item.color1}
                      stroke={item.color2}
                      strokeWidth="0.8"
                      transform={`rotate(${item.rotation})`}
                    />
                  ) : item.isQuinoa ? (
                    // Tiny tiny seeds
                    <circle
                      cx="0" cy="0" r="3.2"
                      fill={item.color1}
                      stroke={item.color2}
                      strokeWidth="0.5"
                      transform={`rotate(${item.rotation})`}
                    />
                  ) : (
                    // General fallback grain
                    <ellipse
                      cx="0" cy="0" rx="6" ry="3.5"
                      fill={item.color1}
                      stroke={item.color2}
                      strokeWidth="0.8"
                      transform={`rotate(${item.rotation})`}
                    />
                  )}
                </motion.g>
              );
            })}
          </AnimatePresence>
        </g>

        {/* --- LAYER 2: PROTEINS (Mid level, chunks/shapes) --- */}
        <g id="layer-proteins">
          <AnimatePresence>
            {proteinsItems.map((item) => (
              <motion.g
                key={item.id}
                initial={{ y: -200, opacity: 0, x: item.x + Math.cos(item.y)*30 }}
                animate={{ y: item.y, x: item.x, opacity: 1 }}
                exit={{ y: 240, opacity: 0, scale: 0.1 }}
                transition={{ type: 'spring', stiffness: 120, damping: 14, delay: Math.random() * 0.1 }}
              >
                {item.isSalmon || item.isTuna ? (
                  // Visual Cube representing salmon/tuna fillet with delicious marbled lines
                  <g transform={`rotate(${item.rotation})`}>
                    <rect x="-12" y="-12" width="24" height="24" rx="4" fill={item.color1} stroke={item.color2} strokeWidth="1" />
                    {/* Salmon stripes */}
                    <line x1="-8" y1="-8" x2="8" y2="8" stroke="#ffe4e6" strokeWidth="1.5" opacity="0.6" />
                    <line x1="-3" y1="-9" x2="9" y2="3" stroke="#ffe4e6" strokeWidth="1.5" opacity="0.6" />
                    <line x1="-9" y1="-3" x2="3" y2="9" stroke="#ffe4e6" strokeWidth="1.5" opacity="0.6" />
                  </g>
                ) : item.isShrimp ? (
                  // Visual pink shrimp (curved shapes with tail)
                  <g transform={`rotate(${item.rotation}) scale(1.2)`}>
                    <path
                      d="M -10,6 C -5,12 8,10 10,-2 C 11,-8 6,-11 3,-8 C 1,-6 -2,2 -4,3 C -6,4 -8,3 -10,6 Z"
                      fill={item.color1}
                      stroke={item.color2}
                      strokeWidth="1"
                    />
                    {/* Tiger stripes on shrimp */}
                    <path d="M 0,8 Q 2,4 4,7" stroke="#fda4af" strokeWidth="1" fill="none" />
                    <path d="M 4,5 Q 6,1 8,4" stroke="#fda4af" strokeWidth="1" fill="none" />
                  </g>
                ) : item.isTofu ? (
                  // Simple sleek tofu cubes with white surface
                  <g transform={`rotate(${item.rotation})`}>
                    <rect x="-11" y="-11" width="22" height="22" rx="2" fill={item.color1} stroke={item.color2} strokeWidth="1.2" />
                    {/* Shadow facet */}
                    <polygon points="-11,-11 -5,-11 -5,11 -11,11" fill="rgba(0,0,0,0.03)" />
                  </g>
                ) : (
                  // Chicken cube (rougher looking, slightly golden brown gradient)
                  <g transform={`rotate(${item.rotation})`}>
                    <path
                      d="M -11,-9 C -8,-12 4,-12 11,-8 C 13,0 10,12 2,11 C -6,10 -13,4 -11,-9 Z"
                      fill={item.color1}
                      stroke={item.color2}
                      strokeWidth="1"
                    />
                    <circle cx="-3" cy="-2" r="1.5" fill="#ca8a04" opacity="0.5" />
                    <circle cx="4" cy="3" r="2.2" fill="#d97706" opacity="0.3" />
                  </g>
                )}
              </motion.g>
            ))}
          </AnimatePresence>
        </g>

        {/* --- LAYER 3: VEGETABLES (Crisp greens, purples, oranges) --- */}
        <g id="layer-vegetables">
          <AnimatePresence>
            {veggiesItems.map((item) => (
              <motion.g
                key={item.id}
                initial={{ y: -220, opacity: 0, x: item.x + Math.sin(item.y)*25 }}
                animate={{ y: item.y, x: item.x, opacity: 1 }}
                exit={{ y: 240, opacity: 0, scale: 0.1 }}
                transition={{ type: 'spring', stiffness: 130, damping: 15, delay: Math.random() * 0.1 }}
              >
                {item.vegId === 'v_pepino' ? (
                  // Round cucumber slice! Beautiful
                  <g transform={`rotate(${item.rotation}) scale(1.3)`}>
                    <circle cx="0" cy="0" r="11" fill={item.color1} stroke={item.color2} strokeWidth="2.2" />
                    {/* Fleshy core and seed segments */}
                    <circle cx="0" cy="0" r="7" fill="#f0fdf4" opacity="0.9" />
                    <circle cx="-3" cy="-2" r="1" fill="#4ade80" />
                    <circle cx="3" cy="-2" r="1" fill="#4ade80" />
                    <circle cx="0" cy="4" r="1" fill="#4ade80" />
                  </g>
                ) : item.vegId === 'v_cebolla_morada' ? (
                  // Purple crescent sliver
                  <path
                    d="M -14,0 A 14,14 0 0,1 14,0 A 11,11 0 0,0 -14,0"
                    fill={item.color1}
                    stroke={item.color2}
                    strokeWidth="1"
                    transform={`rotate(${item.rotation}) scale(1.2)`}
                  />
                ) : item.vegId === 'v_zanahoria' ? (
                  // Long orange julienne sticks
                  <rect
                    x="-12" y="-2" width="24" height="4.5" rx="1"
                    fill={item.color1}
                    stroke={item.color2}
                    strokeWidth="0.8"
                    transform={`rotate(${item.rotation})`}
                  />
                ) : item.vegId === 'v_edamame' ? (
                  // Clean green bean
                  <g transform={`rotate(${item.rotation}) scale(1.2)`}>
                    <path
                      d="M -10,0 C -6,-5 6,-5 10,0 C 6,5 -6,5 -10,0 Z"
                      fill={item.color1}
                      stroke={item.color2}
                      strokeWidth="1.2"
                    />
                    <circle cx="-4" cy="0" r="2.5" fill="#15803d" opacity="0.3" />
                    <circle cx="4" cy="0" r="2.5" fill="#15803d" opacity="0.3" />
                  </g>
                ) : item.vegId === 'v_palta' ? (
                  // Elegant Avocado slice
                  <path
                    d="M -16,0 C -12,8 4,14 14,7 C 18,3 15,-6 8,-4 C 1, -2 -6,-4 -16,0 Z"
                    fill={item.color1}
                    stroke={item.color2}
                    strokeWidth="1.2"
                    transform={`rotate(${item.rotation}) scale(1.2)`}
                  />
                ) : (
                  // Brotes de soja: delicate sprouts (yin-yang curvi leaf-tail)
                  <g transform={`rotate(${item.rotation})`}>
                    <path d="M -10,-10 Q -5,0 10,5" stroke={item.color1} strokeWidth="2" fill="none" strokeLinecap="round" />
                    <path d="M 8,4 Q 10,0 12,3" fill="#eab308" />
                  </g>
                )}
              </motion.g>
            ))}
          </AnimatePresence>
        </g>

        {/* --- LAYER 4: EXTRAS (Top layer crispy bits, dollops) --- */}
        <g id="layer-extras">
          <AnimatePresence>
            {extrasItems.map((item) => (
              <motion.g
                key={item.id}
                initial={{ y: -240, opacity: 0, x: item.x + Math.cos(item.y)*15 }}
                animate={{ y: item.y, x: item.x, opacity: 1 }}
                exit={{ y: 240, opacity: 0, scale: 0.1 }}
                transition={{ type: 'spring', stiffness: 140, damping: 16, delay: Math.random() * 0.08 }}
              >
                {item.extraId === 'e_cebolla_crispy' ? (
                  // Crispy onions crumbs
                  <circle
                    cx="0" cy="0" r={(item.x % 3) + 2}
                    fill={item.color1}
                    stroke={item.color2}
                    strokeWidth="0.5"
                    transform={`rotate(${item.rotation})`}
                  />
                ) : item.extraId === 'e_alga_nori' ? (
                  // Little black squares of seaweed/nori
                  <rect
                    x="-8" y="-8" width="16" height="11" rx="1.5"
                    fill={item.color1}
                    stroke={item.color2}
                    strokeWidth="1"
                    transform={`rotate(${item.rotation})`}
                  />
                ) : item.extraId === 'e_philadelphia' ? (
                  // Soft cloud cream cheese block
                  <path
                    d="M -7,-5 C -10,-8 -8,-10 -5,-7 C -2,-13 4,-10 6,-6 C 11,-4 8,-2 5,-3 C 3,4 -2,8 -7,-5 Z"
                    fill={item.color1}
                    stroke={item.color2}
                    strokeWidth="0.8"
                    transform={`rotate(${item.rotation}) scale(1.1)`}
                  />
                ) : item.extraId === 'e_batata_frita' ? (
                  // Long batata fries
                  <rect
                    x="-14" y="-3" width="28" height="5" rx="1.5"
                    fill={item.color1}
                    stroke={item.color2}
                    strokeWidth="1"
                    transform={`rotate(${item.rotation})`}
                  />
                ) : item.extraId === 'e_wasabi' ? (
                  // Perfect swirling vector wasabi dollop with ridges
                  <g transform={`rotate(${item.rotation}) scale(1.1)`}>
                    <path
                      d="M 0,8 C -6,8 -10,4 -7,-1 C -5,-4 -4,-9 0,-11 C 4,-9 5,-4 7,-1 C 10,4 6,8 0,8 Z"
                      fill={item.color1}
                      stroke={item.color2}
                      strokeWidth="1"
                    />
                    <path d="M -4,2 Q 0,-3 4,2" fill="none" stroke={item.color2} strokeWidth="0.8" opacity="0.6" />
                    <path d="M -2,-3 Q 0,-7 2,-3" fill="none" stroke={item.color2} strokeWidth="0.8" opacity="0.6" />
                  </g>
                ) : item.extraId === 'e_jengibre' ? (
                  // Delicate pickled ginger slices ribbon folding
                  <g transform={`rotate(${item.rotation}) scale(1.1)`}>
                    <path
                      d="M -8,5 C -12,2 -9,-6 -4,-4 C 1,-2 6,-9 10,-3 C 12,2 5,8 -8,5 Z"
                      fill={item.color1}
                      stroke={item.color2}
                      strokeWidth="0.8"
                    />
                    <path d="M -5,-1 Q -1,-4 3,-1" fill="none" stroke={item.color2} strokeWidth="0.8" opacity="0.6" />
                  </g>
                ) : item.extraId === 'e_mango' ? (
                  // Fine cut gold mango cubes
                  <g transform={`rotate(${item.rotation})`}>
                    <rect x="-8" y="-8" width="16" height="16" rx="3.5" fill={item.color1} stroke={item.color2} strokeWidth="1" />
                    <line x1="-3" y1="-3" x2="3" y2="3" stroke={item.color2} strokeWidth="1.2" opacity="0.4" />
                  </g>
                ) : (
                  // Fallback generic seed drawing for ultimate security
                  <circle
                    cx="0" cy="0" r="4"
                    fill={item.color1}
                    stroke={item.color2}
                    strokeWidth="0.8"
                    transform={`rotate(${item.rotation})`}
                  />
                )}
              </motion.g>
            ))}
          </AnimatePresence>
        </g>

        {/* --- LAYER 5: SALSAS (Beautiful drizzle lines cascading over everything) --- */}
        <g id="layer-sauces">
          <AnimatePresence>
            {selectedSauces.map((sauce, index) => {
              const mainColor = sauce.colors[0];
              const isSoja = sauce.id === 's_soja' || sauce.id === 's_ponzu' || sauce.id === 's_teriyaki';
              const isMaracuya = sauce.id === 's_maracuya';
              const strokeColor = sauce.colors[1] || mainColor;

              // Generate nice glossy bezier squiggles for drizzle mapping, restricted within bowl mouth ellipse
              // Drizzle 1: Left to right waves
              // Drizzle 2: Diagonal grid waves
              const pathD = index === 0
                ? "M 115,185 Q 155,160 200,195 T 285,185"
                : "M 130,210 Q 200,175 270,210";

              return (
                <motion.g
                  key={sauce.id}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.85 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                >
                  {/* Glossy shadow of drizzle for depth */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="8"
                    strokeLinecap="round"
                    opacity="0.12"
                    transform="translate(1, 3)"
                  />
                  {/* main glaze drizzle */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={mainColor}
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                  {/* shine overlay */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeDasharray="40 85"
                    opacity="0.5"
                  />
                  {/* Passionfruit seeds if maracuya */}
                  {isMaracuya && (
                    <g>
                      <circle cx="150" cy="175" r="2" fill="#000000" />
                      <circle cx="210" cy="195" r="2" fill="#000000" />
                      <circle cx="250" cy="185" r="2" fill="#000000" />
                    </g>
                  )}
                  {/* Tiny glowing droplets dripping at the ends */}
                  <motion.circle
                    cx={index === 0 ? 285 : 270}
                    cy={index === 0 ? 185 : 210}
                    r="4.5"
                    fill={mainColor}
                    animate={{ y: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.8 + index }}
                  />
                </motion.g>
              );
            })}
          </AnimatePresence>
        </g>

        {/* --- FRONT BOWL OVERLAY (CERAMIC SURFACE & HIGHLIGHTS) --- */}
        {/* The bottom curves/glass of our delicious Poke Bowl */}
        <path
          d="M 55,200 C 55,290 120,310 200,310 C 280,310 345,290 345,200 C 345,220 280,240 200,240 C 120,240 55,220 55,200 Z"
          fill="#e2e8f0"
          stroke="#cbd5e1"
          strokeWidth="2.5"
          className="fill-slate-100 stroke-slate-300 dark:fill-slate-900/90 dark:stroke-slate-700"
        />

        {/* Outer Lip of the Bowl Rim */}
        <ellipse
          cx="200"
          cy="200"
          rx="145"
          ry="40"
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="3.5"
          className="stroke-slate-300/80 dark:stroke-slate-600/80"
          transform="translate(0, 0)"
        />

        {/* Inner rim highlight */}
        <ellipse
          cx="200"
          cy="200"
          rx="144"
          ry="39"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.2"
          opacity="0.8"
          className="dark:stroke-slate-500/40"
        />

        {/* Ceramic bowl rim reflection gloss */}
        <path
          d="M 68,198 C 90,215 150,225 200,225 C 250,225 310,215 332,198"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.4"
        />

        {/* Brand label plate "Pokirroll" stamped on front of the bowl */}
        <g transform="translate(200, 268)">
          <rect x="-42" y="-9" width="84" height="18" rx="5" fill="#fca5a5" className="fill-rose-100 dark:fill-rose-950/60" stroke="#f43f5e" strokeWidth="1" />
          <text x="0" y="4" textAnchor="middle" fill="#be123c" className="text-[10px] font-sans font-bold tracking-wider uppercase fill-rose-700 dark:fill-rose-300">
            POKIRROLL
          </text>
        </g>
      </motion.svg>
      
      {/* Absolute overlay badge display for sizing */}
      <div className="absolute right-4 top-4 bg-white/95 dark:bg-slate-800/95 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 text-xs py-1.5 px-3 rounded-full font-sans shadow-sm flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>Bowl: <strong className="font-semibold text-rose-500 dark:text-rose-400">{size}</strong></span>
      </div>
    </div>
  );
}
