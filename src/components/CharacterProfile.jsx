import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { sha256hex } from '../lib/crypto'

// ── Hero library ──────────────────────────────────────────────────────────────

export const HERO_LIBRARY = {
  'Spider-Man': {
    role: 'Friendly Neighborhood Hero', tagline: 'With great power comes great responsibility.',
    color: '#f87171', bg: '#1a0a0a',
    stats: [{ label: 'Webs shot', value: '∞' }, { label: 'Pizzas delivered', value: '42' }, { label: 'Uncles lost', value: '1' }],
    svg: <svg width="80" height="124" viewBox="0 0 80 124" fill="none">
      {/* Blue legs */}
      <rect x="20" y="84" width="17" height="38" rx="3" fill="#1d4ed8"/>
      <rect x="43" y="84" width="17" height="38" rx="3" fill="#1d4ed8"/>
      {/* Red body */}
      <rect x="20" y="50" width="40" height="36" rx="4" fill="#dc2626"/>
      {/* Spider symbol */}
      <ellipse cx="40" cy="62" rx="5" ry="7" fill="#111"/>
      <path d="M30 58 L40 64 M50 58 L40 64 M28 66 L40 68 M52 66 L40 68" stroke="#111" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Blue arms */}
      <rect x="6" y="52" width="13" height="28" rx="4" fill="#1d4ed8"/>
      <rect x="61" y="52" width="13" height="28" rx="4" fill="#1d4ed8"/>
      {/* Red gloves */}
      <rect x="6" y="74" width="13" height="10" rx="4" fill="#dc2626"/>
      <rect x="61" y="74" width="13" height="10" rx="4" fill="#dc2626"/>
      {/* Web from right hand */}
      <path d="M74 76 Q88 60 90 44" stroke="#e2e8f0" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.7"/>
      {/* Head — red with web lines */}
      <ellipse cx="40" cy="34" rx="16" ry="17" fill="#dc2626"/>
      {/* Web lines on mask */}
      <path d="M40 17 L40 51" stroke="#991b1b" strokeWidth="0.8"/>
      <path d="M24 28 L56 40" stroke="#991b1b" strokeWidth="0.8"/>
      <path d="M24 40 L56 28" stroke="#991b1b" strokeWidth="0.8"/>
      <path d="M28 20 L52 48" stroke="#991b1b" strokeWidth="0.8"/>
      <path d="M28 48 L52 20" stroke="#991b1b" strokeWidth="0.8"/>
      <ellipse cx="40" cy="34" rx="16" ry="17" fill="none" stroke="#991b1b" strokeWidth="0.8"/>
      {/* Blue around eyes */}
      <path d="M24 30 Q40 18 56 30 Q56 42 40 46 Q24 42 24 30Z" fill="#1d4ed8"/>
      {/* White lens eyes */}
      <ellipse cx="32" cy="32" rx="6" ry="5" fill="white" opacity="0.95"/>
      <ellipse cx="48" cy="32" rx="6" ry="5" fill="white" opacity="0.95"/>
    </svg>,
  },

  Batman: {
    role: 'Dark Knight', tagline: 'I am vengeance. I am the night.',
    color: '#fcd34d', bg: '#1e293b',
    stats: [{ label: 'Gadgets', value: '∞' }, { label: 'Villains caught', value: '247' }, { label: 'Capes owned', value: '1' }],
    svg: <svg width="80" height="124" viewBox="0 0 80 124" fill="none">
      <path d="M16 52 Q2 20 0 0 Q16 30 40 36 Q64 30 80 0 Q78 20 64 52Z" fill="#1C1917"/>
      <path d="M16 52 Q4 80 8 124 Q40 100 72 124 Q76 80 64 52Z" fill="#111827"/>
      <rect x="20" y="52" width="40" height="36" rx="4" fill="#1C1917"/>
      <path d="M28 66 Q34 58 40 66 Q46 58 52 66 Q48 74 40 70 Q32 74 28 66Z" fill="#374151"/>
      <rect x="20" y="80" width="40" height="8" rx="2" fill="#D97706"/>
      <rect x="36" y="79" width="8" height="10" rx="2" fill="#92400E"/>
      <rect x="20" y="86" width="17" height="24" rx="3" fill="#1C1917"/>
      <rect x="43" y="86" width="17" height="24" rx="3" fill="#1C1917"/>
      <rect x="18" y="104" width="21" height="9" rx="3" fill="#111827"/>
      <rect x="41" y="104" width="21" height="9" rx="3" fill="#111827"/>
      <rect x="6" y="54" width="12" height="28" rx="4" fill="#1C1917"/>
      <rect x="62" y="54" width="12" height="28" rx="4" fill="#1C1917"/>
      <ellipse cx="40" cy="36" rx="16" ry="16" fill="#1C1917"/>
      <path d="M24 36 Q26 20 40 18 Q54 20 56 36 Q54 26 40 24 Q26 26 24 36Z" fill="#111827"/>
      <polygon points="28,22 24,6 34,18" fill="#111827"/>
      <polygon points="52,22 56,6 46,18" fill="#111827"/>
      <rect x="30" y="34" width="8" height="3" rx="1.5" fill="white" opacity="0.85"/>
      <rect x="42" y="34" width="8" height="3" rx="1.5" fill="white" opacity="0.85"/>
    </svg>,
  },

  Thor: {
    role: 'God of Thunder', tagline: 'I am Thor, son of Odin.',
    color: '#60a5fa', bg: '#0f1f3d',
    stats: [{ label: 'Lightnings', value: '∞' }, { label: 'Mjolnir throws', value: '∞' }, { label: 'Worthiness', value: '100%' }],
    svg: <svg width="80" height="124" viewBox="0 0 80 124" fill="none">
      {/* Cape — red */}
      <path d="M18 52 Q6 24 4 2 Q18 28 40 34 Q62 28 76 2 Q74 24 62 52Z" fill="#dc2626"/>
      <path d="M18 52 Q8 80 12 124 Q40 106 68 124 Q72 80 62 52Z" fill="#b91c1c"/>
      {/* Silver armor body */}
      <rect x="20" y="52" width="40" height="38" rx="4" fill="#94a3b8"/>
      {/* Armor circles */}
      <circle cx="40" cy="62" r="6" fill="#cbd5e1"/>
      <circle cx="40" cy="62" r="3" fill="#60a5fa"/>
      {/* Armor lines */}
      <rect x="20" y="74" width="40" height="4" rx="1" fill="#7c8fa3"/>
      <rect x="20" y="80" width="40" height="4" rx="1" fill="#7c8fa3"/>
      {/* Belt */}
      <rect x="20" y="84" width="40" height="6" rx="2" fill="#d97706"/>
      {/* Legs */}
      <rect x="22" y="88" width="16" height="34" rx="3" fill="#1e3a5f"/>
      <rect x="42" y="88" width="16" height="34" rx="3" fill="#1e3a5f"/>
      {/* Boots */}
      <rect x="20" y="110" width="20" height="12" rx="3" fill="#374151"/>
      <rect x="40" y="110" width="20" height="12" rx="3" fill="#374151"/>
      {/* Arms */}
      <rect x="6" y="52" width="13" height="30" rx="4" fill="#94a3b8"/>
      <rect x="61" y="52" width="13" height="30" rx="4" fill="#94a3b8"/>
      {/* Mjolnir — left hand */}
      <rect x="0" y="72" width="10" height="14" rx="2" fill="#6b7280"/>
      <rect x="3" y="62" width="4" height="12" rx="1" fill="#9ca3af"/>
      <rect x="-2" y="68" width="14" height="4" rx="1" fill="#9ca3af"/>
      {/* Lightning bolt on hammer */}
      <path d="M3 70 L6 74 L4 74 L7 78" stroke="#fbbf24" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Head */}
      <ellipse cx="40" cy="34" rx="16" ry="16" fill="#c8a882"/>
      {/* Winged helmet */}
      <path d="M24 32 Q22 20 40 14 Q58 20 56 32 Q52 18 40 16 Q28 18 24 32Z" fill="#94a3b8"/>
      {/* Wings on helmet */}
      <path d="M24 28 Q14 20 12 28 Q14 34 24 32Z" fill="#e2e8f0"/>
      <path d="M24 28 Q16 22 14 30 Q16 36 24 34Z" fill="#cbd5e1"/>
      <path d="M56 28 Q66 20 68 28 Q66 34 56 32Z" fill="#e2e8f0"/>
      <path d="M56 28 Q64 22 66 30 Q64 36 56 34Z" fill="#cbd5e1"/>
      {/* Blonde beard */}
      <path d="M28 44 Q34 52 40 50 Q46 52 52 44 Q48 50 40 48 Q32 50 28 44Z" fill="#d97706"/>
      {/* Eyes — blue */}
      <ellipse cx="33" cy="32" rx="4" ry="3.5" fill="#fff"/>
      <ellipse cx="47" cy="32" rx="4" ry="3.5" fill="#fff"/>
      <circle cx="33" cy="33" r="2.5" fill="#1d4ed8"/>
      <circle cx="47" cy="33" r="2.5" fill="#1d4ed8"/>
      {/* Blonde hair flowing */}
      <path d="M24 28 Q18 40 20 56" stroke="#d97706" strokeWidth="5" fill="none" strokeLinecap="round"/>
      <path d="M56 28 Q62 40 60 56" stroke="#d97706" strokeWidth="5" fill="none" strokeLinecap="round"/>
    </svg>,
  },

  Catwoman: {
    role: 'The Cat', tagline: 'Life\'s a bitch. Now so am I.',
    color: '#c084fc', bg: '#0d0010',
    stats: [{ label: 'Heists pulled', value: '∞' }, { label: 'Lives remaining', value: '6' }, { label: 'Whip cracks', value: '∞' }],
    svg: <svg width="80" height="124" viewBox="0 0 80 124" fill="none">
      {/* Black sleek bodysuit */}
      <rect x="20" y="52" width="40" height="36" rx="4" fill="#111"/>
      {/* Zipper line */}
      <line x1="40" y1="52" x2="40" y2="88" stroke="#374151" strokeWidth="1"/>
      {/* Arms */}
      <rect x="6" y="52" width="13" height="30" rx="4" fill="#111"/>
      <rect x="61" y="52" width="13" height="30" rx="4" fill="#111"/>
      {/* Whip — right hand */}
      <path d="M74 72 Q86 58 80 46 Q76 52 72 60" stroke="#6b7280" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Legs */}
      <rect x="20" y="86" width="17" height="36" rx="3" fill="#111"/>
      <rect x="43" y="86" width="17" height="36" rx="3" fill="#111"/>
      {/* Boots */}
      <rect x="18" y="110" width="21" height="12" rx="3" fill="#1c1c1c"/>
      <rect x="41" y="110" width="21" height="12" rx="3" fill="#1c1c1c"/>
      {/* Head */}
      <ellipse cx="40" cy="34" rx="14" ry="15" fill="#c8a882"/>
      {/* Cat mask + ears */}
      <path d="M26 30 Q28 14 40 12 Q52 14 54 30 Q50 20 40 18 Q30 20 26 30Z" fill="#111"/>
      {/* Cat ears */}
      <polygon points="28,22 24,8 34,20" fill="#111"/>
      <polygon points="52,22 56,8 46,20" fill="#111"/>
      {/* Inner ear pink */}
      <polygon points="29,21 26,11 33,19" fill="#c084fc" opacity="0.5"/>
      <polygon points="51,21 54,11 47,19" fill="#c084fc" opacity="0.5"/>
      {/* Mask across eyes */}
      <rect x="26" y="28" width="28" height="10" rx="3" fill="#111"/>
      {/* Eyes — green, slanted */}
      <ellipse cx="33" cy="33" rx="4.5" ry="3" fill="#fff"/>
      <ellipse cx="47" cy="33" rx="4.5" ry="3" fill="#fff"/>
      <ellipse cx="33" cy="33" rx="2" ry="3" fill="#16a34a"/>
      <ellipse cx="47" cy="33" rx="2" ry="3" fill="#16a34a"/>
      {/* Smirk */}
      <path d="M34 44 Q40 48 46 44" stroke="#be123c" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>,
  },

  Hulk: {
    role: 'Incredible', tagline: 'Hulk SMASH!',
    color: '#4ade80', bg: '#14532d',
    stats: [{ label: 'Rage level', value: '∞' }, { label: 'Tanks smashed', value: '312' }, { label: 'Pants torn', value: '∞' }],
    svg: <svg width="80" height="124" viewBox="0 0 80 124" fill="none">
      {/* Body — wide and muscular */}
      <rect x="12" y="52" width="56" height="40" rx="6" fill="#16a34a"/>
      {/* Chest muscles */}
      <ellipse cx="28" cy="64" rx="10" ry="8" fill="#15803d"/>
      <ellipse cx="52" cy="64" rx="10" ry="8" fill="#15803d"/>
      {/* Torn purple pants */}
      <rect x="14" y="86" width="22" height="30" rx="3" fill="#7c3aed"/>
      <rect x="44" y="86" width="22" height="30" rx="3" fill="#7c3aed"/>
      <path d="M14 108 L20 124 M36 108 L30 124" stroke="#6d28d9" strokeWidth="2"/>
      <path d="M44 108 L50 124 M66 108 L60 124" stroke="#6d28d9" strokeWidth="2"/>
      {/* Arms — huge */}
      <rect x="0" y="50" width="14" height="36" rx="6" fill="#16a34a"/>
      <rect x="66" y="50" width="14" height="36" rx="6" fill="#16a34a"/>
      {/* Fists */}
      <rect x="0" y="80" width="14" height="12" rx="4" fill="#15803d"/>
      <rect x="66" y="80" width="14" height="12" rx="4" fill="#15803d"/>
      {/* Head — large */}
      <ellipse cx="40" cy="36" rx="20" ry="18" fill="#16a34a"/>
      {/* Brow ridge */}
      <path d="M22 30 Q32 24 40 28 Q48 24 58 30" stroke="#15803d" strokeWidth="4" fill="none" strokeLinecap="round"/>
      {/* Eyes — angry */}
      <ellipse cx="31" cy="34" rx="5" ry="4" fill="#fff"/>
      <ellipse cx="49" cy="34" rx="5" ry="4" fill="#fff"/>
      <circle cx="31" cy="35" r="2.5" fill="#166534"/>
      <circle cx="49" cy="35" r="2.5" fill="#166534"/>
      {/* Nose */}
      <path d="M36 40 Q40 44 44 40" stroke="#15803d" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Mouth — grimace */}
      <path d="M28 46 Q34 42 40 44 Q46 42 52 46" stroke="#15803d" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* Hair */}
      <path d="M22 28 Q24 14 40 12 Q56 14 58 28 Q52 18 40 16 Q28 18 22 28Z" fill="#166534"/>
    </svg>,
  },

  'Scarlet Witch': {
    role: 'Chaos Magic', tagline: 'I am not a monster. I am a mother.',
    color: '#f43f5e', bg: '#1a000a',
    stats: [{ label: 'Realities bent', value: '∞' }, { label: 'Avengers defeated', value: '∞' }, { label: 'Visions', value: '∞' }],
    svg: <svg width="80" height="124" viewBox="0 0 80 124" fill="none">
      {/* Red bodysuit / jacket */}
      <rect x="20" y="50" width="40" height="40" rx="4" fill="#be123c"/>
      {/* Dark corset / center */}
      <rect x="30" y="50" width="20" height="40" rx="2" fill="#9f1239"/>
      {/* Glowing hands / magic circles */}
      <circle cx="8" cy="72" r="9" fill="#f43f5e" opacity="0.25"/>
      <circle cx="8" cy="72" r="6" fill="#f43f5e" opacity="0.4"/>
      <circle cx="8" cy="72" r="3" fill="#fda4af"/>
      <circle cx="72" cy="72" r="9" fill="#f43f5e" opacity="0.25"/>
      <circle cx="72" cy="72" r="6" fill="#f43f5e" opacity="0.4"/>
      <circle cx="72" cy="72" r="3" fill="#fda4af"/>
      {/* Arms */}
      <rect x="6" y="52" width="13" height="26" rx="4" fill="#be123c"/>
      <rect x="61" y="52" width="13" height="26" rx="4" fill="#be123c"/>
      {/* Red legs */}
      <rect x="20" y="88" width="17" height="34" rx="3" fill="#9f1239"/>
      <rect x="43" y="88" width="17" height="34" rx="3" fill="#9f1239"/>
      {/* Boots */}
      <rect x="18" y="108" width="21" height="14" rx="3" fill="#7f1d1d"/>
      <rect x="41" y="108" width="21" height="14" rx="3" fill="#7f1d1d"/>
      {/* Head */}
      <ellipse cx="40" cy="33" rx="14" ry="15" fill="#d4a0a0"/>
      {/* Dark hair */}
      <path d="M26 28 Q22 40 24 60" stroke="#1c0a0a" strokeWidth="6" fill="none" strokeLinecap="round"/>
      <path d="M54 28 Q58 40 56 60" stroke="#1c0a0a" strokeWidth="6" fill="none" strokeLinecap="round"/>
      <path d="M26 28 Q28 12 40 10 Q52 12 54 28" fill="#1c0a0a"/>
      {/* Scarlet crown/tiara */}
      <path d="M26 22 L30 14 L34 20 L40 10 L46 20 L50 14 L54 22" stroke="#f43f5e" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Eyes — glowing red */}
      <ellipse cx="33" cy="33" rx="4.5" ry="3.5" fill="#fff"/>
      <ellipse cx="47" cy="33" rx="4.5" ry="3.5" fill="#fff"/>
      <circle cx="33" cy="34" r="2.5" fill="#f43f5e"/>
      <circle cx="47" cy="34" r="2.5" fill="#f43f5e"/>
      {/* Lips */}
      <path d="M34 44 Q40 48 46 44" stroke="#f43f5e" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>,
  },

  Robin: {
    role: 'Boy Wonder', tagline: 'Holy smokes, Batman!',
    color: '#f87171', bg: '#1e3a2a',
    stats: [{ label: 'Somersaults', value: '∞' }, { label: 'Batman saves', value: '89' }, { label: 'Exclamations', value: '∞' }],
    svg: <svg width="80" height="124" viewBox="0 0 80 124" fill="none">
      <path d="M18 52 Q6 22 4 4 Q18 28 40 34 Q62 28 76 4 Q74 22 62 52Z" fill="#dc2626"/>
      <path d="M18 52 Q8 78 12 124 Q40 104 68 124 Q72 78 62 52Z" fill="#b91c1c"/>
      <rect x="22" y="52" width="36" height="34" rx="4" fill="#dc2626"/>
      <path d="M32 60 L32 74 M32 60 Q42 60 42 65 Q42 70 32 70 M36 70 L42 74" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <rect x="22" y="78" width="36" height="8" rx="2" fill="#16a34a"/>
      <rect x="35" y="77" width="10" height="10" rx="2" fill="#15803d"/>
      <rect x="22" y="84" width="15" height="26" rx="3" fill="#1e3a2a"/>
      <rect x="43" y="84" width="15" height="26" rx="3" fill="#1e3a2a"/>
      <rect x="20" y="104" width="19" height="9" rx="3" fill="#111"/>
      <rect x="41" y="104" width="19" height="9" rx="3" fill="#111"/>
      <rect x="8" y="54" width="12" height="26" rx="4" fill="#dc2626"/>
      <rect x="60" y="54" width="12" height="26" rx="4" fill="#dc2626"/>
      <rect x="8" y="74" width="12" height="8" rx="3" fill="#111"/>
      <rect x="60" y="74" width="12" height="8" rx="3" fill="#111"/>
      <ellipse cx="40" cy="36" rx="15" ry="15" fill="#f9a8d4"/>
      <path d="M26 34 Q33 30 37 34 Q40 31 43 34 Q47 30 54 34 Q54 39 40 39 Q26 39 26 34Z" fill="#111"/>
      <path d="M26 30 Q28 22 40 22 Q52 22 54 30 Q50 24 40 23 Q30 24 26 30Z" fill="#92400e"/>
      <ellipse cx="33" cy="35" rx="3" ry="2" fill="#fff" opacity="0.9"/>
      <ellipse cx="47" cy="35" rx="3" ry="2" fill="#fff" opacity="0.9"/>
    </svg>,
  },

  'John Rambo': {
    role: 'One Man Army', tagline: 'They drew first blood.',
    color: '#fbbf24', bg: '#1a0f00',
    stats: [{ label: 'Enemies defeated', value: '∞' }, { label: 'Arrows fired', value: '632' }, { label: 'Explosions survived', value: '∞' }],
    svg: <svg width="80" height="124" viewBox="0 0 80 124" fill="none">
      {/* Torn camo pants */}
      <rect x="20" y="84" width="17" height="38" rx="3" fill="#4d5a2e"/>
      <rect x="43" y="84" width="17" height="38" rx="3" fill="#4d5a2e"/>
      {/* Camo pattern */}
      <rect x="22" y="88" width="6" height="5" rx="1" fill="#3d4826" opacity="0.7"/>
      <rect x="30" y="94" width="5" height="5" rx="1" fill="#3d4826" opacity="0.7"/>
      <rect x="45" y="90" width="7" height="4" rx="1" fill="#3d4826" opacity="0.7"/>
      {/* Shirtless muscular torso */}
      <rect x="20" y="50" width="40" height="36" rx="4" fill="#c8905a"/>
      {/* Muscle definition */}
      <ellipse cx="31" cy="62" rx="8" ry="7" fill="#b87a48"/>
      <ellipse cx="49" cy="62" rx="8" ry="7" fill="#b87a48"/>
      <rect x="37" y="52" width="6" height="34" rx="2" fill="#b87a48"/>
      {/* Ammo belt across chest */}
      <path d="M14 58 Q40 52 66 64" stroke="#d97706" strokeWidth="4" fill="none" strokeLinecap="round"/>
      <path d="M14 62 Q40 56 66 68" stroke="#d97706" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5"/>
      {/* Arms — muscular */}
      <rect x="5" y="50" width="15" height="30" rx="5" fill="#c8905a"/>
      <rect x="60" y="50" width="15" height="30" rx="5" fill="#c8905a"/>
      {/* M60 machine gun */}
      <rect x="60" y="72" width="26" height="5" rx="2" fill="#374151"/>
      <rect x="66" y="68" width="6" height="14" rx="1" fill="#4b5563"/>
      <rect x="76" y="70" width="10" height="3" rx="1" fill="#6b7280"/>
      {/* Head */}
      <ellipse cx="40" cy="33" rx="14" ry="15" fill="#c8905a"/>
      {/* Red headband */}
      <rect x="26" y="24" width="28" height="7" rx="2" fill="#dc2626"/>
      {/* Headband tails */}
      <path d="M54 27 Q64 22 66 28 Q62 30 55 29Z" fill="#dc2626"/>
      <path d="M54 29 Q62 32 63 38 Q58 36 55 31Z" fill="#dc2626"/>
      {/* Dark hair */}
      <path d="M26 24 Q28 14 40 12 Q52 14 54 24" fill="#1c1208"/>
      {/* Eyes — intense */}
      <ellipse cx="33" cy="33" rx="4" ry="3.5" fill="#fff"/>
      <ellipse cx="47" cy="33" rx="4" ry="3.5" fill="#fff"/>
      <circle cx="33" cy="34" r="2.5" fill="#4d3a1a"/>
      <circle cx="47" cy="34" r="2.5" fill="#4d3a1a"/>
      {/* Stubble / determined jaw */}
      <path d="M30 44 Q40 50 50 44" stroke="#8b6f4a" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <rect x="28" y="44" width="24" height="6" rx="2" fill="#a07848" opacity="0.3"/>
    </svg>,
  },

  Wolverine: {
    role: 'Mutant X-Man', tagline: 'I\'m the best there is at what I do.',
    color: '#fbbf24', bg: '#1c1206',
    stats: [{ label: 'Healing factor', value: '∞' }, { label: 'Claws', value: '6' }, { label: 'Age', value: '200+' }],
    svg: <svg width="80" height="124" viewBox="0 0 80 124" fill="none">
      {/* Yellow suit */}
      <path d="M20 52 L14 124 H66 L60 52Z" fill="#d97706"/>
      {/* Blue stripe on sides */}
      <rect x="14" y="52" width="8" height="72" rx="0" fill="#1e40af"/>
      <rect x="58" y="52" width="8" height="72" rx="0" fill="#1e40af"/>
      {/* Belt */}
      <rect x="20" y="82" width="40" height="8" rx="2" fill="#92400e"/>
      {/* Arms — yellow */}
      <rect x="6" y="52" width="12" height="32" rx="4" fill="#d97706"/>
      <rect x="62" y="52" width="12" height="32" rx="4" fill="#d97706"/>
      {/* Adamantium claws — left */}
      <rect x="0" y="66" width="3" height="22" rx="1" fill="#e2e8f0" transform="rotate(-10 0 66)"/>
      <rect x="4" y="64" width="3" height="22" rx="1" fill="#e2e8f0" transform="rotate(-3 4 64)"/>
      <rect x="8" y="64" width="3" height="22" rx="1" fill="#e2e8f0" transform="rotate(4 8 64)"/>
      {/* Head */}
      <ellipse cx="40" cy="34" rx="15" ry="15" fill="#dbb896"/>
      {/* Cowl — yellow with ears/points */}
      <path d="M25 28 Q26 14 40 10 Q54 14 55 28 Q52 18 40 16 Q28 18 25 28Z" fill="#d97706"/>
      {/* Mask ears/points */}
      <polygon points="26,22 22,6 32,18" fill="#d97706"/>
      <polygon points="54,22 58,6 48,18" fill="#d97706"/>
      {/* Blue mask around eyes */}
      <path d="M25 28 Q28 22 34 24 Q40 26 46 24 Q52 22 55 28 Q52 34 40 34 Q28 34 25 28Z" fill="#1e40af"/>
      {/* Eyes — intense */}
      <ellipse cx="33" cy="30" rx="3.5" ry="3" fill="#fff"/>
      <ellipse cx="47" cy="30" rx="3.5" ry="3" fill="#fff"/>
      <circle cx="33" cy="31" r="2" fill="#92400e"/>
      <circle cx="47" cy="31" r="2" fill="#92400e"/>
      {/* Sideburns */}
      <rect x="25" y="32" width="6" height="14" rx="2" fill="#4b3200"/>
      <rect x="49" y="32" width="6" height="14" rx="2" fill="#4b3200"/>
      {/* Grimace */}
      <path d="M33 44 Q40 41 47 44" stroke="#92400e" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>,
  },

  'Wonder Woman': {
    role: 'Amazon Princess', tagline: 'Fight for those who cannot.',
    color: '#fbbf24', bg: '#1e1a2e',
    stats: [{ label: 'Battles won', value: '∞' }, { label: 'Lassos thrown', value: '1,204' }, { label: 'Gods defeated', value: '7' }],
    svg: <svg width="80" height="124" viewBox="0 0 80 124" fill="none">
      {/* Skirt/armor lower */}
      <path d="M22 80 L16 124 H64 L58 80Z" fill="#b91c1c"/>
      {/* Gold trim skirt */}
      <path d="M22 80 L20 90 H60 L58 80Z" fill="#d97706"/>
      {/* Body armor */}
      <rect x="22" y="50" width="36" height="32" rx="4" fill="#b91c1c"/>
      {/* Gold eagle chest */}
      <path d="M30 62 Q40 56 50 62 Q46 70 40 68 Q34 70 30 62Z" fill="#d97706"/>
      {/* Arms */}
      <rect x="8" y="52" width="12" height="28" rx="4" fill="#d4a574"/>
      <rect x="60" y="52" width="12" height="28" rx="4" fill="#d4a574"/>
      {/* Bracelets */}
      <rect x="8" y="72" width="12" height="6" rx="2" fill="#d97706"/>
      <rect x="60" y="72" width="12" height="6" rx="2" fill="#d97706"/>
      {/* Lasso */}
      <path d="M72 62 Q82 50 78 72 Q76 80 72 78" stroke="#d97706" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* Head */}
      <ellipse cx="40" cy="34" rx="15" ry="16" fill="#d4a574"/>
      {/* Tiara */}
      <path d="M26 26 L40 18 L54 26 L50 30 L40 22 L30 30Z" fill="#d97706"/>
      <polygon points="40,18 38,24 42,24" fill="#dc2626"/>
      {/* Hair — black, long */}
      <path d="M26 28 Q18 50 22 80 Q26 50 26 28Z" fill="#111"/>
      <path d="M54 28 Q62 50 58 80 Q54 50 54 28Z" fill="#111"/>
      <path d="M26 28 Q40 20 54 28" fill="#111"/>
      {/* Eyes */}
      <ellipse cx="34" cy="34" rx="4" ry="3" fill="#fff"/>
      <ellipse cx="46" cy="34" rx="4" ry="3" fill="#fff"/>
      <circle cx="34" cy="35" r="2" fill="#1e3a8a"/>
      <circle cx="46" cy="35" r="2" fill="#1e3a8a"/>
      {/* Lips */}
      <path d="M34 44 Q40 48 46 44" stroke="#dc2626" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>,
  },

  'Ninja Leo': {
    role: 'TMNT Blue Leader', tagline: 'A true ninja never gives up.',
    color: '#38bdf8', bg: '#0a1a10',
    stats: [{ label: 'Katana slashes', value: '∞' }, { label: 'Pizza slices', value: '∞' }, { label: 'Shredder battles', value: '47' }],
    svg: <svg width="80" height="124" viewBox="0 0 80 124" fill="none">
      {/* Green body */}
      <rect x="20" y="52" width="40" height="36" rx="6" fill="#4ade80"/>
      {/* Shell — brown oval on back implied by darker center */}
      <ellipse cx="40" cy="68" rx="16" ry="14" fill="#86efac"/>
      <ellipse cx="40" cy="68" rx="12" ry="10" fill="#4ade80"/>
      {/* Shell pattern */}
      <path d="M34 60 L40 56 L46 60 L46 74 L40 78 L34 74Z" fill="#86efac" opacity="0.5"/>
      {/* Belt — brown with buckle */}
      <rect x="20" y="82" width="40" height="7" rx="2" fill="#92400e"/>
      <rect x="36" y="81" width="8" height="9" rx="2" fill="#78350f"/>
      {/* Green arms */}
      <rect x="6" y="52" width="13" height="28" rx="5" fill="#4ade80"/>
      <rect x="61" y="52" width="13" height="28" rx="5" fill="#4ade80"/>
      {/* Katanas on back — crossing */}
      <rect x="24" y="36" width="3" height="46" rx="1" fill="#94a3b8" transform="rotate(-12 24 36)"/>
      <rect x="30" y="34" width="3" height="46" rx="1" fill="#94a3b8" transform="rotate(12 30 34)"/>
      <rect x="22" y="36" width="6" height="6" rx="1" fill="#d97706" transform="rotate(-12 22 36)"/>
      <rect x="28" y="34" width="6" height="6" rx="1" fill="#d97706" transform="rotate(12 28 34)"/>
      {/* Green legs */}
      <rect x="20" y="88" width="17" height="34" rx="4" fill="#4ade80"/>
      <rect x="43" y="88" width="17" height="34" rx="4" fill="#4ade80"/>
      {/* Head — round, green */}
      <ellipse cx="40" cy="34" rx="17" ry="16" fill="#4ade80"/>
      {/* Blue bandana */}
      <rect x="23" y="28" width="34" height="12" rx="2" fill="#38bdf8"/>
      {/* Bandana knot tails */}
      <path d="M57 34 Q68 30 70 36 Q66 38 58 36Z" fill="#38bdf8"/>
      <path d="M57 36 Q66 40 68 46 Q62 44 58 38Z" fill="#38bdf8"/>
      {/* Eyes — white in bandana holes */}
      <ellipse cx="33" cy="34" rx="4" ry="4" fill="white"/>
      <ellipse cx="47" cy="34" rx="4" ry="4" fill="white"/>
      <circle cx="33" cy="35" r="2.5" fill="#111"/>
      <circle cx="47" cy="35" r="2.5" fill="#111"/>
      {/* Mouth — determined */}
      <path d="M34 44 Q40 48 46 44" stroke="#166534" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>,
  },

  Joker: {
    role: 'Clown Prince of Crime', tagline: 'Why so serious?',
    color: '#a78bfa', bg: '#1a0a2e',
    stats: [{ label: 'Laughs per day', value: '∞' }, { label: 'Schemes foiled', value: '142' }, { label: 'Sanity', value: '0' }],
    svg: <svg width="80" height="124" viewBox="0 0 80 124" fill="none">
      {/* Purple coat */}
      <path d="M16 52 Q8 80 10 124 H38V86H42V124H70 Q72 80 64 52Z" fill="#7c3aed"/>
      {/* Green vest */}
      <rect x="24" y="52" width="32" height="36" rx="2" fill="#16a34a"/>
      {/* White shirt / tie */}
      <rect x="34" y="52" width="12" height="36" rx="0" fill="#f8fafc"/>
      <path d="M38 56 L40 78 L42 56" fill="#dc2626"/>
      {/* Arms */}
      <rect x="6" y="52" width="12" height="32" rx="4" fill="#7c3aed"/>
      <rect x="62" y="52" width="12" height="32" rx="4" fill="#7c3aed"/>
      {/* White gloves */}
      <rect x="6" y="78" width="12" height="10" rx="4" fill="#f8fafc"/>
      <rect x="62" y="78" width="12" height="10" rx="4" fill="#f8fafc"/>
      {/* Legs */}
      <rect x="18" y="88" width="18" height="34" rx="3" fill="#7c3aed"/>
      <rect x="44" y="88" width="18" height="34" rx="3" fill="#7c3aed"/>
      {/* Head — white face */}
      <ellipse cx="40" cy="34" rx="16" ry="17" fill="#f0f4f8"/>
      {/* Green hair */}
      <path d="M24 28 Q22 10 30 6 Q40 2 50 6 Q58 10 56 28 Q52 14 40 12 Q28 14 24 28Z" fill="#16a34a"/>
      {/* Eyebrows — menacing */}
      <path d="M26 26 Q30 22 34 25" stroke="#16a34a" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M46 25 Q50 22 54 26" stroke="#16a34a" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* Eyes */}
      <ellipse cx="32" cy="32" rx="4" ry="4" fill="#fff"/>
      <ellipse cx="48" cy="32" rx="4" ry="4" fill="#fff"/>
      <circle cx="32" cy="33" r="2.5" fill="#7c3aed"/>
      <circle cx="48" cy="33" r="2.5" fill="#7c3aed"/>
      {/* Chelsea smile */}
      <path d="M24 44 Q32 38 40 42 Q48 38 56 44" stroke="#dc2626" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M24 44 Q26 50 32 46" stroke="#dc2626" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M56 44 Q54 50 48 46" stroke="#dc2626" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Red cheeks */}
      <circle cx="26" cy="40" r="5" fill="#fca5a5" opacity="0.5"/>
      <circle cx="54" cy="40" r="5" fill="#fca5a5" opacity="0.5"/>
    </svg>,
  },

  Predator: {
    role: 'The Hunter', tagline: 'If it bleeds, we can kill it.',
    color: '#34d399', bg: '#0a1a12',
    stats: [{ label: 'Trophies taken', value: '∞' }, { label: 'Planets visited', value: '40+' }, { label: 'Honour kills', value: '∞' }],
    svg: <svg width="80" height="124" viewBox="0 0 80 124" fill="none">
      {/* Body — alien armor */}
      <rect x="18" y="52" width="44" height="40" rx="4" fill="#4a5240"/>
      {/* Armor plates */}
      <path d="M18 56 L38 52 L62 56 L58 72 L40 76 L22 72Z" fill="#565f4a"/>
      {/* Netting texture lines */}
      <path d="M18 58 L62 70 M18 64 L62 76 M18 70 L52 80" stroke="#3d4534" strokeWidth="0.5" opacity="0.6"/>
      <path d="M22 52 L28 80 M34 52 L38 80 M46 52 L50 80 M58 52 L60 80" stroke="#3d4534" strokeWidth="0.5" opacity="0.6"/>
      {/* Shoulder cannon */}
      <rect x="58" y="44" width="14" height="8" rx="3" fill="#565f4a"/>
      <rect x="66" y="36" width="6" height="18" rx="3" fill="#374151"/>
      <circle cx="69" cy="36" r="3" fill="#dc2626"/>
      {/* Armor legs */}
      <rect x="20" y="90" width="17" height="32" rx="3" fill="#4a5240"/>
      <rect x="43" y="90" width="17" height="32" rx="3" fill="#4a5240"/>
      {/* Leg armor plates */}
      <rect x="20" y="96" width="17" height="6" rx="1" fill="#565f4a"/>
      <rect x="43" y="96" width="17" height="6" rx="1" fill="#565f4a"/>
      {/* Arms */}
      <rect x="6" y="52" width="12" height="30" rx="4" fill="#4a5240"/>
      <rect x="62" y="52" width="12" height="30" rx="4" fill="#4a5240"/>
      {/* Wristblades */}
      <path d="M6 78 L0 68 M8 78 L3 66 M10 78 L6 65" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"/>
      {/* Head — mandibles + dreadlocks */}
      <ellipse cx="40" cy="30" rx="16" ry="18" fill="#6b7a52"/>
      {/* Dreadlocks */}
      <path d="M26 24 Q20 30 18 44 Q22 36 26 32Z" fill="#4a5240"/>
      <path d="M28 20 Q22 26 20 40 Q24 32 28 28Z" fill="#4a5240"/>
      <path d="M32 16 Q28 22 26 36 Q30 28 34 24Z" fill="#4a5240"/>
      <path d="M54 24 Q60 30 62 44 Q58 36 54 32Z" fill="#4a5240"/>
      <path d="M52 20 Q58 26 60 40 Q56 32 52 28Z" fill="#4a5240"/>
      <path d="M48 16 Q52 22 54 36 Q50 28 46 24Z" fill="#4a5240"/>
      {/* Helmet/face — alien */}
      <ellipse cx="40" cy="30" rx="14" ry="16" fill="#5a6848"/>
      {/* Three laser dots targeting */}
      <circle cx="34" cy="28" r="1.5" fill="#dc2626"/>
      <circle cx="40" cy="26" r="1.5" fill="#dc2626"/>
      <circle cx="46" cy="28" r="1.5" fill="#dc2626"/>
      {/* Eyes — two glowing */}
      <ellipse cx="33" cy="32" rx="4" ry="3" fill="#111"/>
      <ellipse cx="47" cy="32" rx="4" ry="3" fill="#111"/>
      <circle cx="33" cy="32" r="2.5" fill="#34d399"/>
      <circle cx="47" cy="32" r="2.5" fill="#34d399"/>
      {/* Mandibles */}
      <path d="M28 42 Q24 48 26 54" stroke="#4a5240" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M28 42 Q26 50 30 56" stroke="#4a5240" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M52 42 Q56 48 54 54" stroke="#4a5240" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M52 42 Q54 50 50 56" stroke="#4a5240" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>,
  },

  'Agent 007': {
    role: 'Secret Agent', tagline: 'Bond. James Bond.',
    color: '#94a3b8', bg: '#0f172a',
    stats: [{ label: 'Missions', value: '∞' }, { label: 'Martinis', value: 'shaken' }, { label: 'Gadgets used', value: '∞' }],
    svg: <svg width="80" height="124" viewBox="0 0 80 124" fill="none">
      {/* Black tuxedo */}
      <path d="M22 52 L18 124 H62 L58 52Z" fill="#111827"/>
      {/* White shirt */}
      <path d="M34 52 L32 70 L40 68 L48 70 L46 52Z" fill="#f8fafc"/>
      {/* Bow tie */}
      <path d="M34 56 L40 60 L46 56 L40 53Z" fill="#111"/>
      {/* Lapels */}
      <path d="M22 52 L30 70 L34 52Z" fill="#1e293b"/>
      <path d="M58 52 L50 70 L46 52Z" fill="#1e293b"/>
      {/* Arms */}
      <rect x="8" y="52" width="12" height="34" rx="4" fill="#111827"/>
      <rect x="60" y="52" width="12" height="34" rx="4" fill="#111827"/>
      {/* Gun in hand */}
      <rect x="2" y="78" width="16" height="7" rx="2" fill="#374151"/>
      <rect x="6" y="73" width="5" height="8" rx="1" fill="#374151"/>
      <rect x="2" y="83" width="5" height="3" rx="1" fill="#4b5563"/>
      {/* White gloves */}
      <rect x="60" y="80" width="12" height="8" rx="3" fill="#f8fafc"/>
      {/* Legs / trousers */}
      <rect x="20" y="90" width="18" height="32" rx="3" fill="#111827"/>
      <rect x="42" y="90" width="18" height="32" rx="3" fill="#111827"/>
      {/* Shoes */}
      <rect x="18" y="114" width="22" height="8" rx="3" fill="#0f172a"/>
      <rect x="40" y="114" width="22" height="8" rx="3" fill="#0f172a"/>
      {/* Head */}
      <ellipse cx="40" cy="34" rx="14" ry="15" fill="#dbb896"/>
      {/* Hair — slicked */}
      <path d="M26 28 Q28 14 40 12 Q52 14 54 28 Q50 18 40 16 Q30 18 26 28Z" fill="#374151"/>
      <path d="M26 28 Q24 24 26 20 Q28 14 40 12" fill="#374151"/>
      {/* Eyes */}
      <ellipse cx="33" cy="33" rx="4" ry="3" fill="#fff"/>
      <ellipse cx="47" cy="33" rx="4" ry="3" fill="#fff"/>
      <circle cx="33" cy="34" r="2" fill="#1e3a8a"/>
      <circle cx="47" cy="34" r="2" fill="#1e3a8a"/>
      {/* Determined mouth */}
      <path d="M33 44 Q40 47 47 44" stroke="#92400e" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* 007 badge */}
      <rect x="26" y="63" width="14" height="8" rx="2" fill="#d97706"/>
      <text x="33" y="70" textAnchor="middle" fontSize="5" fontWeight="bold" fill="#000">007</text>
    </svg>,
  },

  Superman: {
    role: 'Man of Steel', tagline: 'Truth, Justice, and the American Way.',
    color: '#60a5fa', bg: '#0c1445',
    stats: [{ label: 'Planets saved', value: '3' }, { label: 'Kryptonite weakness', value: '1' }, { label: 'Speed', value: 'c' }],
    svg: <svg width="80" height="124" viewBox="0 0 80 124" fill="none">
      {/* Cape */}
      <path d="M18 52 Q4 24 2 0 Q18 28 40 34 Q62 28 78 0 Q76 24 62 52Z" fill="#dc2626"/>
      <path d="M18 52 Q6 80 10 124 Q40 106 70 124 Q74 80 62 52Z" fill="#b91c1c"/>
      {/* Blue suit body */}
      <rect x="20" y="52" width="40" height="36" rx="4" fill="#1e40af"/>
      {/* S shield */}
      <path d="M30 60 L30 80 Q40 84 50 80 L50 60 Q40 56 30 60Z" fill="#fbbf24"/>
      <path d="M33 63 L33 77 Q40 80 47 77 L47 63 Q40 60 33 63Z" fill="#dc2626"/>
      <path d="M33 68 L40 63 L47 68 L40 73Z" fill="#fbbf24"/>
      {/* Red trunks */}
      <rect x="26" y="80" width="28" height="10" rx="2" fill="#dc2626"/>
      {/* Belt */}
      <rect x="24" y="80" width="32" height="5" rx="2" fill="#fbbf24"/>
      {/* Legs */}
      <rect x="22" y="88" width="16" height="34" rx="3" fill="#1e40af"/>
      <rect x="42" y="88" width="16" height="34" rx="3" fill="#1e40af"/>
      {/* Boots */}
      <rect x="20" y="108" width="20" height="14" rx="3" fill="#dc2626"/>
      <rect x="40" y="108" width="20" height="14" rx="3" fill="#dc2626"/>
      {/* Arms */}
      <rect x="6" y="52" width="13" height="30" rx="4" fill="#1e40af"/>
      <rect x="61" y="52" width="13" height="30" rx="4" fill="#1e40af"/>
      {/* Head */}
      <ellipse cx="40" cy="34" rx="15" ry="16" fill="#c8a882"/>
      {/* Black hair + curl */}
      <path d="M26 28 Q28 12 40 10 Q52 12 54 28 Q50 16 40 14 Q30 16 26 28Z" fill="#111"/>
      <path d="M36 12 Q38 6 42 10" stroke="#111" strokeWidth="3" fill="none" strokeLinecap="round"/>
      {/* Eyes — blue */}
      <ellipse cx="33" cy="33" rx="4" ry="3.5" fill="#fff"/>
      <ellipse cx="47" cy="33" rx="4" ry="3.5" fill="#fff"/>
      <circle cx="33" cy="34" r="2.5" fill="#1e40af"/>
      <circle cx="47" cy="34" r="2.5" fill="#1e40af"/>
      {/* Smile */}
      <path d="M33 44 Q40 50 47 44" stroke="#92400e" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>,
  },

  Loki: {
    role: 'God of Mischief', tagline: 'I am burdened with glorious purpose.',
    color: '#a78bfa', bg: '#130d2a',
    stats: [{ label: 'Lies told', value: '∞' }, { label: 'Betrayals', value: '∞' }, { label: 'Deaths survived', value: '4' }],
    svg: <svg width="80" height="124" viewBox="0 0 80 124" fill="none">
      {/* Black/green robes */}
      <path d="M20 52 L12 124 H68 L60 52Z" fill="#14532d"/>
      {/* Black overlay */}
      <path d="M28 52 L22 124 H58 L52 52Z" fill="#111827"/>
      {/* Gold trim */}
      <path d="M20 52 L22 60 L28 52Z" fill="#d97706"/>
      <path d="M60 52 L58 60 L52 52Z" fill="#d97706"/>
      <rect x="20" y="78" width="40" height="4" rx="1" fill="#d97706"/>
      {/* Arms */}
      <rect x="6" y="52" width="12" height="34" rx="4" fill="#14532d"/>
      <rect x="62" y="52" width="12" height="34" rx="4" fill="#14532d"/>
      {/* Sceptre — right hand */}
      <rect x="68" y="56" width="3" height="32" rx="1.5" fill="#d97706"/>
      <ellipse cx="69.5" cy="54" rx="5" ry="4" fill="#60a5fa"/>
      <ellipse cx="69.5" cy="54" rx="3" ry="2.5" fill="#93c5fd"/>
      {/* Legs */}
      <rect x="22" y="92" width="15" height="30" rx="3" fill="#111827"/>
      <rect x="43" y="92" width="15" height="30" rx="3" fill="#111827"/>
      {/* Head */}
      <ellipse cx="40" cy="33" rx="14" ry="15" fill="#c8b89a"/>
      {/* Horned helmet — iconic */}
      <path d="M26 28 Q28 12 40 8 Q52 12 54 28 Q50 16 40 14 Q30 16 26 28Z" fill="#d97706"/>
      {/* Long curved horns */}
      <path d="M26 24 Q18 10 14 2 Q20 8 26 20" stroke="#d97706" strokeWidth="5" fill="none" strokeLinecap="round"/>
      <path d="M54 24 Q62 10 66 2 Q60 8 54 20" stroke="#d97706" strokeWidth="5" fill="none" strokeLinecap="round"/>
      {/* Horn tips */}
      <circle cx="14" cy="2" r="3" fill="#d97706"/>
      <circle cx="66" cy="2" r="3" fill="#d97706"/>
      {/* Black hair — sleek, long */}
      <path d="M26 26 Q22 38 24 52" stroke="#111" strokeWidth="6" fill="none" strokeLinecap="round"/>
      <path d="M54 26 Q58 38 56 52" stroke="#111" strokeWidth="6" fill="none" strokeLinecap="round"/>
      {/* Eyes — green, cunning */}
      <ellipse cx="33" cy="32" rx="4" ry="3.5" fill="#fff"/>
      <ellipse cx="47" cy="32" rx="4" ry="3.5" fill="#fff"/>
      <circle cx="33" cy="33" r="2.5" fill="#16a34a"/>
      <circle cx="47" cy="33" r="2.5" fill="#16a34a"/>
      {/* Smirk */}
      <path d="M33 43 Q40 49 47 43" stroke="#92400e" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M45 43 Q48 46 47 43" stroke="#92400e" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>,
  },
  'Captain America': {
    role: 'Super Soldier', tagline: 'I can do this all day.',
    color: '#60a5fa', bg: '#0a1628',
    stats: [{ label: 'Shield throws', value: '∞' }, { label: 'Wars survived', value: '2' }, { label: 'Values', value: '∞' }],
    svg: <svg width="80" height="124" viewBox="0 0 80 124" fill="none">
      {/* Blue suit */}
      <rect x="18" y="52" width="44" height="42" rx="4" fill="#1e40af"/>
      {/* Red stripes on torso */}
      <rect x="18" y="60" width="44" height="6" rx="0" fill="#dc2626"/>
      <rect x="18" y="72" width="44" height="6" rx="0" fill="#dc2626"/>
      {/* Star */}
      <polygon points="40,58 42,64 48,64 43,68 45,74 40,70 35,74 37,68 32,64 38,64" fill="#f8fafc"/>
      {/* Blue legs */}
      <rect x="20" y="92" width="17" height="30" rx="3" fill="#1e40af"/>
      <rect x="43" y="92" width="17" height="30" rx="3" fill="#1e40af"/>
      {/* Boots */}
      <rect x="18" y="112" width="21" height="10" rx="3" fill="#1e3a8a"/>
      <rect x="41" y="112" width="21" height="10" rx="3" fill="#1e3a8a"/>
      {/* Arms */}
      <rect x="6" y="52" width="12" height="32" rx="4" fill="#1e40af"/>
      <rect x="62" y="52" width="12" height="32" rx="4" fill="#1e40af"/>
      {/* Shield (round, on left arm) */}
      <circle cx="0" cy="70" r="14" fill="#dc2626"/>
      <circle cx="0" cy="70" r="10" fill="#f8fafc"/>
      <circle cx="0" cy="70" r="6" fill="#1e40af"/>
      <polygon points="0,66 1,69 4,69 2,71 3,74 0,72 -3,74 -2,71 -4,69 -1,69" fill="#f8fafc"/>
      {/* Head with helmet */}
      <ellipse cx="40" cy="34" rx="15" ry="16" fill="#1e40af"/>
      {/* A on helmet */}
      <path d="M36 44 L40 26 L44 44 M37.5 38 H42.5" stroke="#f8fafc" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Wing details */}
      <path d="M26 30 Q20 26 18 30 Q20 34 26 32Z" fill="#f8fafc"/>
      <path d="M54 30 Q60 26 62 30 Q60 34 54 32Z" fill="#f8fafc"/>
      {/* Eyes */}
      <ellipse cx="33" cy="34" rx="4" ry="3" fill="#fff"/>
      <ellipse cx="47" cy="34" rx="4" ry="3" fill="#fff"/>
      <circle cx="33" cy="35" r="2" fill="#1e3a8a"/>
      <circle cx="47" cy="35" r="2" fill="#1e3a8a"/>
    </svg>,
  },

  'Harry Potter': {
    role: 'The Chosen One', tagline: 'It does not do to dwell on dreams.',
    color: '#a78bfa', bg: '#1a0d2e',
    stats: [{ label: 'Spells mastered', value: '∞' }, { label: 'Horcruxes destroyed', value: '7' }, { label: 'Deaths', value: '1.5' }],
    svg: <svg width="80" height="124" viewBox="0 0 80 124" fill="none">
      {/* Black robes */}
      <path d="M20 52 L10 124 H70 L60 52Z" fill="#111827"/>
      {/* Gryffindor tie */}
      <path d="M36 52 L34 76 L40 74 L46 76 L44 52Z" fill="#dc2626"/>
      <path d="M36 52 L34 58 L40 56 L46 58 L44 52Z" fill="#fbbf24"/>
      <path d="M35 62 L33 68 L40 66 L47 68 L45 62Z" fill="#fbbf24"/>
      {/* Wand in right hand */}
      <rect x="64" y="64" width="3" height="24" rx="1.5" fill="#92400e" transform="rotate(20 64 64)"/>
      {/* Arms */}
      <rect x="8" y="54" width="12" height="28" rx="4" fill="#111827"/>
      <rect x="60" y="54" width="12" height="28" rx="4" fill="#111827"/>
      {/* Legs */}
      <rect x="20" y="92" width="17" height="30" rx="3" fill="#111827"/>
      <rect x="43" y="92" width="17" height="30" rx="3" fill="#111827"/>
      {/* Head */}
      <ellipse cx="40" cy="34" rx="14" ry="15" fill="#d4a574"/>
      {/* Messy dark hair */}
      <path d="M26 28 Q27 12 40 10 Q53 12 54 28 Q50 16 40 14 Q30 16 26 28Z" fill="#1c1208"/>
      <path d="M26 28 Q24 20 28 14" stroke="#1c1208" strokeWidth="4" fill="none" strokeLinecap="round"/>
      <path d="M46 14 Q50 18 54 24" stroke="#1c1208" strokeWidth="3" fill="none" strokeLinecap="round"/>
      {/* Round glasses */}
      <circle cx="33" cy="33" r="6" fill="none" stroke="#374151" strokeWidth="1.5"/>
      <circle cx="47" cy="33" r="6" fill="none" stroke="#374151" strokeWidth="1.5"/>
      <line x1="39" y1="33" x2="41" y2="33" stroke="#374151" strokeWidth="1.5"/>
      {/* Eyes behind glasses */}
      <circle cx="33" cy="34" r="3" fill="#16a34a"/>
      <circle cx="47" cy="34" r="3" fill="#16a34a"/>
      {/* Lightning bolt scar */}
      <path d="M39 18 L41 23 L38 23 L40 28" stroke="#fbbf24" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Mouth */}
      <path d="M34 44 Q40 48 46 44" stroke="#92400e" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>,
  },

  Voldemort: {
    role: 'Dark Lord', tagline: 'There is no good and evil. There is only power.',
    color: '#94a3b8', bg: '#0d0d14',
    stats: [{ label: 'Horcruxes made', value: '7' }, { label: 'Followers', value: '∞' }, { label: 'Noses', value: '0' }],
    svg: <svg width="80" height="124" viewBox="0 0 80 124" fill="none">
      {/* Black robes */}
      <path d="M18 52 L8 124 H72 L62 52Z" fill="#0d0d1a"/>
      {/* Dark green accent */}
      <path d="M34 52 L32 80 L40 78 L48 80 L46 52Z" fill="#064e3b"/>
      {/* Arms in robes */}
      <rect x="6" y="52" width="14" height="36" rx="4" fill="#111827"/>
      <rect x="60" y="52" width="14" height="36" rx="4" fill="#111827"/>
      {/* Skeletal hands */}
      <path d="M6 82 L4 94 M9 82 L8 94 M12 82 L12 94 M15 82 L14 94" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round"/>
      {/* Wand */}
      <rect x="62" y="80" width="2.5" height="20" rx="1" fill="#d1d5db" transform="rotate(10 62 80)"/>
      {/* Head — pale, bald, elongated */}
      <ellipse cx="40" cy="32" rx="14" ry="18" fill="#e8e6e0"/>
      {/* No hair — completely bald */}
      {/* Snake-like nostrils instead of nose */}
      <circle cx="38" cy="38" r="2" fill="#c8c4bc"/>
      <circle cx="42" cy="38" r="2" fill="#c8c4bc"/>
      {/* Red slit eyes */}
      <ellipse cx="32" cy="30" rx="5" ry="3" fill="#fff"/>
      <ellipse cx="48" cy="30" rx="5" ry="3" fill="#fff"/>
      <ellipse cx="32" cy="30" rx="2" ry="3" fill="#dc2626"/>
      <ellipse cx="48" cy="30" rx="2" ry="3" fill="#dc2626"/>
      {/* Thin cruel mouth */}
      <path d="M30 46 Q40 42 50 46" stroke="#9ca3af" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* Dark Lord aura */}
      <ellipse cx="40" cy="32" rx="18" ry="22" fill="none" stroke="#4c1d95" strokeWidth="1" opacity="0.5"/>
    </svg>,
  },

  Terminator: {
    role: 'T-800 Model 101', tagline: 'I\'ll be back.',
    color: '#f87171', bg: '#0a0a0a',
    stats: [{ label: 'Targets eliminated', value: 'classified' }, { label: 'Catchphrases', value: '3' }, { label: 'Humanity', value: '0' }],
    svg: <svg width="80" height="124" viewBox="0 0 80 124" fill="none">
      {/* Black jacket / endoskeleton base */}
      <rect x="18" y="52" width="44" height="44" rx="2" fill="#1f2937"/>
      {/* Endoskeleton chest detail */}
      <rect x="26" y="58" width="28" height="4" rx="1" fill="#374151"/>
      <rect x="28" y="66" width="24" height="3" rx="1" fill="#374151"/>
      <rect x="26" y="72" width="28" height="3" rx="1" fill="#374151"/>
      <rect x="30" y="78" width="20" height="3" rx="1" fill="#374151"/>
      {/* Arms — mechanical */}
      <rect x="6" y="52" width="12" height="36" rx="2" fill="#1f2937"/>
      <rect x="62" y="52" width="12" height="36" rx="2" fill="#1f2937"/>
      {/* Metal arm bands */}
      <rect x="6" y="60" width="12" height="3" rx="0" fill="#374151"/>
      <rect x="62" y="60" width="12" height="3" rx="0" fill="#374151"/>
      <rect x="6" y="72" width="12" height="3" rx="0" fill="#374151"/>
      <rect x="62" y="72" width="12" height="3" rx="0" fill="#374151"/>
      {/* Gun — Shotgun */}
      <rect x="62" y="82" width="20" height="5" rx="2" fill="#4b5563"/>
      <rect x="74" y="80" width="4" height="9" rx="1" fill="#374151"/>
      {/* Legs */}
      <rect x="20" y="94" width="17" height="28" rx="2" fill="#111827"/>
      <rect x="43" y="94" width="17" height="28" rx="2" fill="#111827"/>
      {/* Metal joints at knees */}
      <rect x="20" y="106" width="17" height="4" rx="0" fill="#374151"/>
      <rect x="43" y="106" width="17" height="4" rx="0" fill="#374151"/>
      {/* Head — damaged, half chrome half flesh */}
      <ellipse cx="40" cy="32" rx="15" ry="16" fill="#9ca3af"/>
      {/* Flesh side — left */}
      <path d="M25 24 Q26 16 40 14 Q40 14 40 48 Q26 48 25 24Z" fill="#c8a882"/>
      {/* Exposed skull right */}
      <rect x="40" y="16" width="14" height="30" rx="2" fill="#6b7280"/>
      {/* Endoskeleton details on chrome side */}
      <rect x="46" y="22" width="10" height="2" rx="1" fill="#4b5563"/>
      <rect x="44" y="28" width="12" height="2" rx="1" fill="#4b5563"/>
      {/* Red eye — terminator */}
      <ellipse cx="47" cy="32" rx="5" ry="4" fill="#111"/>
      <circle cx="47" cy="32" r="3" fill="#dc2626"/>
      <circle cx="47" cy="32" r="1.5" fill="#fee2e2"/>
      {/* Human eye left */}
      <ellipse cx="32" cy="32" rx="4" ry="3.5" fill="#fff"/>
      <circle cx="32" cy="33" r="2.5" fill="#4b5563"/>
      {/* Grimace / damage on lower face */}
      <path d="M28 44 Q34 40 40 42" stroke="#92400e" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M44 42 Q48 46 52 42" stroke="#6b7280" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>,
  },
}


// ── Helpers ───────────────────────────────────────────────────────────────────

function roleOf(name) { return name === 'Batman' ? 'admin' : 'user' }


const HEROES_KEY = 'batcave_heroes'
function getHeroes() {
  try { return JSON.parse(localStorage.getItem(HEROES_KEY) || '["Batman","Robin"]') }
  catch { return ['Batman', 'Robin'] }
}
function saveHeroes(list) { localStorage.setItem(HEROES_KEY, JSON.stringify(list)) }


// ── Invite link ───────────────────────────────────────────────────────────────

function SendInvite({ currentUser, onSent }) {
  const [email, setEmail]   = useState('')
  const [status, setStatus] = useState(null)
  const [msg, setMsg]       = useState('')

  const baseUrl = `${window.location.origin}${window.location.pathname}`
  const iStyle  = { border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none', fontFamily: 'inherit', background: '#f9fafb', color: '#111827', width: '100%', boxSizing: 'border-box' }

  const send = async () => {
    const trimEmail = email.trim()
    if (!trimEmail || !trimEmail.includes('@')) { setStatus('error'); setMsg('Enter a valid email'); return }
    setStatus('sending')
    try {
      await supabase.rpc('add_invite', { p_email: trimEmail, p_invited_by: currentUser || 'Batman' })
      const inviteUrl = `${baseUrl}?invite&email=${encodeURIComponent(trimEmail)}`
      const { error } = await supabase.functions.invoke('send-invite', {
        body: { email: trimEmail, inviteUrl, inviterName: currentUser || 'Batman' }
      })
      if (error) throw error
      setEmail('')
      onSent?.()
      setStatus('ok'); setMsg(`Invite sent to ${trimEmail} ✓`)
      setTimeout(() => setStatus(null), 4000)
    } catch (e) {
      setStatus('error'); setMsg(e.message || 'Failed to send')
      setTimeout(() => setStatus(null), 4000)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div>
        <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>Email</div>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="hero@example.com" style={iStyle}
          onFocus={e => { e.currentTarget.style.borderColor = '#93c5fd'; e.currentTarget.style.background = '#fff' }}
          onBlur={e =>  { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#f9fafb' }}
        />
      </div>
      {status === 'ok'    && <div style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>{msg}</div>}
      {status === 'error' && <div style={{ fontSize: 12, color: '#ef4444' }}>{msg}</div>}
      <button onClick={send} disabled={status === 'sending'}
        style={{ padding: '9px 0', borderRadius: 8, border: 'none', background: status === 'sending' ? '#6b7280' : '#111827', color: '#fff', fontSize: 13, fontWeight: 600, cursor: status === 'sending' ? 'default' : 'pointer', fontFamily: 'inherit', transition: 'background 0.2s' }}
        onMouseEnter={e => { if (status !== 'sending') e.currentTarget.style.background = '#1f2937' }}
        onMouseLeave={e => { if (status !== 'sending') e.currentTarget.style.background = '#111827' }}
      >
        {status === 'sending' ? 'Sending…' : '✉ Send invite'}
      </button>
    </div>
  )
}

// ── UI helpers ────────────────────────────────────────────────────────────────

function SectionTitle({ children }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
      {children}
    </div>
  )
}

// ── Email field ───────────────────────────────────────────────────────────────

function EmailField({ user }) {
  const [email, setEmail] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase.rpc('get_heroes').then(({ data }) => {
      const me = data?.find(h => h.name === user)
      if (me?.email) setEmail(me.email)
    })
  }, [user])

  const handle = async () => {
    await supabase.rpc('update_hero_email', { p_name: user, p_email: email.trim() })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 11, color: '#6b7280' }}>Email</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handle()}
          placeholder="hero@batcave.com"
          style={{ flex: 1, border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none', fontFamily: 'inherit', background: '#f9fafb', color: '#111827', boxSizing: 'border-box' }}
          onFocus={e => { e.currentTarget.style.borderColor = '#93c5fd'; e.currentTarget.style.background = '#fff' }}
          onBlur={e =>  { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#f9fafb' }}
        />
        <button onClick={handle} style={{ padding: '8px 14px', borderRadius: 8, border: 'none', flexShrink: 0, background: saved ? '#059669' : '#111827', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.2s' }}>
          {saved ? '✓' : 'Save'}
        </button>
      </div>
    </div>
  )
}

// ── Change password ───────────────────────────────────────────────────────────

function ChangePassword({ user }) {
  const [current, setCurrent] = useState('')
  const [next, setNext]       = useState('')
  const [confirm, setConfirm] = useState('')
  const [status, setStatus]   = useState(null)
  const [msg, setMsg]         = useState('')

  const iStyle = { width: '100%', boxSizing: 'border-box', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none', fontFamily: 'inherit', background: '#f9fafb', color: '#111827' }

  const handle = async () => {
    if (next.length < 4) { setStatus('error'); setMsg('New code must be 4+ chars'); return }
    if (next !== confirm) { setStatus('error'); setMsg('Codes do not match'); return }

    // Verify current code against DB
    const currentHash = await sha256hex(current)
    const { data: ok } = await supabase.rpc('verify_hero_secret', { p_name: user, p_hash: currentHash })
    if (!ok) { setStatus('error'); setMsg('Wrong current code'); return }

    // Save new code
    const newHash = await sha256hex(next)
    await supabase.rpc('update_hero_secret', { p_name: user, p_hash: newHash })
    setCurrent(''); setNext(''); setConfirm('')
    setStatus('ok'); setMsg('Secret code updated ✓')
    setTimeout(() => setStatus(null), 3000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {[['Current code', current, setCurrent], ['New code', next, setNext], ['Confirm new code', confirm, setConfirm]].map(([label, val, setVal]) => (
        <div key={label}>
          <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>{label}</div>
          <input type="password" value={val} onChange={e => setVal(e.target.value)} placeholder="••••••••" style={iStyle}
            onFocus={e => { e.currentTarget.style.borderColor = '#93c5fd'; e.currentTarget.style.background = '#fff' }}
            onBlur={e =>  { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#f9fafb' }}
          />
        </div>
      ))}
      {status && <div style={{ fontSize: 12, color: status === 'ok' ? '#059669' : '#ef4444', padding: '4px 0' }}>{msg}</div>}
      <button onClick={handle} style={{ marginTop: 2, padding: '9px 0', borderRadius: 8, border: 'none', background: '#111827', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
        onMouseEnter={e => e.currentTarget.style.background = '#1f2937'}
        onMouseLeave={e => e.currentTarget.style.background = '#111827'}
      >Update secret code</button>
    </div>
  )
}

// ── Heroes list (admin) ───────────────────────────────────────────────────────

function HeroesList({ currentUser }) {
  const [heroes, setHeroes]           = useState(getHeroes)
  const [invites, setInvites]         = useState([])
  const [accessReqs, setAccessReqs]   = useState([])
  const [approvingEmail, setApprovingEmail] = useState(null)

  const refresh = () => {
    supabase.rpc('get_invites').then(({ data }) => setInvites(data || []))
    supabase.rpc('get_access_requests').then(({ data }) => setAccessReqs(data || []))
  }

  useEffect(() => { refresh() }, [])

  const baseUrl = `${window.location.origin}${window.location.pathname}`

  const approveRequest = async (email) => {
    setApprovingEmail(email)
    await supabase.rpc('add_invite', { p_email: email, p_invited_by: currentUser || 'Batman' })
    const inviteUrl = `${baseUrl}?invite&email=${encodeURIComponent(email)}`
    await supabase.functions.invoke('send-invite', { body: { email, inviteUrl, inviterName: currentUser || 'Batman' } })
    await supabase.rpc('remove_access_request', { p_email: email })
    setApprovingEmail(null)
    refresh()
  }

  const declineRequest = async (email) => {
    await supabase.rpc('remove_access_request', { p_email: email })
    refresh()
  }

  const libraryNames = Object.keys(HERO_LIBRARY)
  const registered   = heroes
  const available    = libraryNames.filter(n => !heroes.map(h => h.toLowerCase()).includes(n.toLowerCase()))

  const remove = (name) => {
    if (name === 'Batman' || name === 'Robin') return
    const next = heroes.filter(h => h !== name)
    saveHeroes(next); setHeroes(next)
  }

  const HeroRow = ({ name, inTeam }) => {
    const char = HERO_LIBRARY[name]
    const r    = roleOf(name)
    const isCore = name === 'Batman' || name === 'Robin'

    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '9px 12px', borderRadius: 10,
        background: inTeam ? '#f9fafb' : '#fafafa',
        border: '1px solid ' + (inTeam ? '#f0f0f0' : '#e5e7eb'),
        opacity: inTeam ? 1 : 0.75,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Mini hero avatar */}
          <div style={{
            width: 34, height: 34, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
            background: char?.bg || '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {char ? (
              <div style={{ transform: 'scale(0.28) translateY(30px)', transformOrigin: 'top center', width: 80 }}>
                {char.svg}
              </div>
            ) : (
              <span style={{ fontSize: 14, fontWeight: 700, color: '#93c5fd' }}>{name[0]}</span>
            )}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: inTeam ? '#111827' : '#6b7280' }}>{name}</span>
              {inTeam && (
                <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 99, background: r === 'admin' ? '#fef9c3' : '#f3f4f6', color: r === 'admin' ? '#92400e' : '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{r}</span>
              )}
            </div>
            <div style={{ fontSize: 11, color: '#9ca3af' }}>
              {char?.role || 'Unknown'}
            </div>
          </div>
        </div>

        {inTeam && !isCore && (
          <button onClick={() => remove(name)} title="Remove from team" style={{ width: 24, height: 24, border: '1px solid #fecaca', borderRadius: 6, background: '#fff', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
          </button>
        )}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* In team */}
      <div>
        <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, marginBottom: 6 }}>In team · {registered.length}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {registered.map(name => <HeroRow key={name} name={name} inTeam={true} />)}
        </div>
      </div>

      {/* Available from library */}
      {available.length > 0 && (
        <div>
          <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, marginBottom: 6 }}>Not in team · {available.length}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {available.map(name => <HeroRow key={name} name={name} inTeam={false} />)}
          </div>
        </div>
      )}

      {/* Access requests */}
      {accessReqs.length > 0 && (
        <div>
          <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, marginBottom: 6 }}>
            Запросы доступа · {accessReqs.length}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {accessReqs.map(req => (
              <div key={req.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 10, background: '#f0f9ff', border: '1px solid #bae6fd' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#0ea5e9', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: '#0c4a6e', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.email}</div>
                  <div style={{ fontSize: 10, color: '#0369a1', marginTop: 1 }}>
                    {new Date(req.requested_at).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                  <button onClick={() => approveRequest(req.email)} disabled={approvingEmail === req.email}
                    style={{ padding: '4px 10px', borderRadius: 7, border: '1px solid #86efac', background: approvingEmail === req.email ? '#f3f4f6' : '#f0fdf4', color: '#15803d', fontSize: 12, fontWeight: 600, cursor: approvingEmail === req.email ? 'default' : 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
                    onMouseEnter={e => { if (approvingEmail !== req.email) e.currentTarget.style.background = '#dcfce7' }}
                    onMouseLeave={e => { if (approvingEmail !== req.email) e.currentTarget.style.background = '#f0fdf4' }}
                  >
                    {approvingEmail === req.email ? '…' : '✓ Approve'}
                  </button>
                  <button onClick={() => declineRequest(req.email)}
                    style={{ width: 26, height: 26, border: '1px solid #fecaca', borderRadius: 7, background: '#fff', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                    title="Decline"
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending invites */}
      {invites.length > 0 && (
        <div>
          <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, marginBottom: 6 }}>
            Pending · {invites.length}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {invites.map(inv => (
              <div key={inv.id} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '9px 12px', borderRadius: 10,
                background: '#fffbeb', border: '1px solid #fde68a',
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: '#92400e', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inv.email}</div>
                  <div style={{ fontSize: 10, color: '#b45309', marginTop: 1 }}>
                    invited by {inv.invited_by} · {new Date(inv.invited_at).toLocaleDateString()}
                  </div>
                </div>
                <button onClick={async () => {
                  await supabase.rpc('remove_invite', { p_email: inv.email })
                  refreshInvites()
                }} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 15, color: '#d97706', padding: '2px 6px', borderRadius: 6,
                  lineHeight: 1,
                }}
                  title="Cancel invite"
                  onMouseEnter={e => e.currentTarget.style.background = '#fef3c7'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >×</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Email invite */}
      <div style={{ paddingTop: 4 }}>
        <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 10 }}>Send email invite</div>
        <SendInvite currentUser={currentUser} onSent={refresh} />
      </div>
    </div>
  )
}

// ── Danger zone ───────────────────────────────────────────────────────────────

function DangerZone({ user }) {
  const [input, setInput]   = useState('')
  const [status, setStatus] = useState(null)
  const [errMsg, setErrMsg] = useState('')

  const confirmed = input === 'delete'

  const handleDelete = async () => {
    if (!confirmed || status === 'deleting') return
    setStatus('deleting')
    const { error } = await supabase.rpc('delete_hero', { p_name: user })
    if (error) { setStatus('error'); setErrMsg(error.message); return }
    sessionStorage.clear()
    window.location.reload()
  }

  return (
    <div style={{ border: '1px solid #fecaca', borderRadius: 12, padding: 16, background: '#fff5f5' }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#dc2626', marginBottom: 6 }}>⚠ Danger Zone</div>
      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12, lineHeight: 1.6 }}>
        This will permanently delete your account and all data. Type <span style={{ fontFamily: 'monospace', background: '#fee2e2', padding: '1px 5px', borderRadius: 4, color: '#b91c1c' }}>delete</span> to confirm.
      </div>
      <input
        value={input} onChange={e => setInput(e.target.value)}
        placeholder="delete"
        style={{ width: '100%', boxSizing: 'border-box', border: '1px solid ' + (confirmed ? '#dc2626' : '#e5e7eb'), borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none', fontFamily: 'inherit', background: '#fff', color: '#111827', marginBottom: 10, transition: 'border-color 0.2s' }}
        onFocus={e => { if (!confirmed) e.currentTarget.style.borderColor = '#fca5a5' }}
        onBlur={e  => { if (!confirmed) e.currentTarget.style.borderColor = '#e5e7eb' }}
      />
      {status === 'error' && <div style={{ fontSize: 12, color: '#ef4444', marginBottom: 8 }}>{errMsg}</div>}
      <button
        onClick={handleDelete}
        disabled={!confirmed || status === 'deleting'}
        style={{ width: '100%', padding: '9px 0', borderRadius: 8, border: 'none', background: confirmed ? '#dc2626' : '#f3f4f6', color: confirmed ? '#fff' : '#9ca3af', fontSize: 13, fontWeight: 600, cursor: confirmed && status !== 'deleting' ? 'pointer' : 'default', fontFamily: 'inherit', transition: 'background 0.2s' }}
        onMouseEnter={e => { if (confirmed && status !== 'deleting') e.currentTarget.style.background = '#b91c1c' }}
        onMouseLeave={e => { if (confirmed && status !== 'deleting') e.currentTarget.style.background = '#dc2626' }}
      >
        {status === 'deleting' ? 'Deleting…' : 'Delete my account'}
      </button>
    </div>
  )
}


// ── Controls panel (admin only) ───────────────────────────────────────────────

export function ControlsPanel({ user, onClose }) {
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 800, background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(2px)' }} />
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 380, zIndex: 900, background: '#fff', boxShadow: '-8px 0 40px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', overflowY: 'auto', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid #f0f0f0', position: 'sticky', top: 0, background: '#fff', zIndex: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Controls</span>
          <button onClick={onClose} style={{ width: 28, height: 28, border: '1px solid #e5e7eb', borderRadius: 7, background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#111827' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.color = '#6b7280' }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
          </button>
        </div>

        <div style={{ padding: '20px 20px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <SectionTitle>🦸 Hero roster</SectionTitle>
            <HeroesList currentUser={user} />
          </div>
        </div>
      </div>
    </>
  )
}


// ── Main component ────────────────────────────────────────────────────────────

export default function CharacterProfile({ user, role, onClose }) {
  const char = HERO_LIBRARY[user] || { role: 'Hero', tagline: 'Every hero has a story.', color: '#60a5fa', bg: '#1e2a3a', stats: [], svg: null }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 800, background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(2px)' }} />
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 360, zIndex: 900, background: '#fff', boxShadow: '-8px 0 40px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', overflowY: 'auto', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid #f0f0f0', position: 'sticky', top: 0, background: '#fff', zIndex: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Character</span>
          <button onClick={onClose} style={{ width: 28, height: 28, border: '1px solid #e5e7eb', borderRadius: 7, background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#111827' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.color = '#6b7280' }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
          </button>
        </div>

        <div style={{ padding: '0 20px 32px', display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* Hero card */}
          <div style={{ marginTop: 20, borderRadius: 16, background: char.bg, padding: '28px 24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ filter: `drop-shadow(0 0 20px ${char.color}55)` }}>{char.svg}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: char.color, marginTop: 12 }}>{user}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{char.role}</span>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '2px 8px', borderRadius: 99, background: role === 'admin' ? 'rgba(252,211,77,0.15)' : 'rgba(255,255,255,0.08)', color: role === 'admin' ? '#fcd34d' : 'rgba(255,255,255,0.4)', border: '1px solid ' + (role === 'admin' ? 'rgba(252,211,77,0.3)' : 'rgba(255,255,255,0.1)') }}>{role}</span>
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontStyle: 'italic', marginTop: 8, textAlign: 'center', lineHeight: 1.5 }}>"{char.tagline}"</div>
            {char.stats.length > 0 && (
              <div style={{ display: 'flex', gap: 0, marginTop: 20, width: '100%', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, overflow: 'hidden' }}>
                {char.stats.map((s, i) => (
                  <div key={s.label} style={{ flex: 1, padding: '10px 6px', textAlign: 'center', borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: char.color }}>{s.value}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2, letterSpacing: '0.06em' }}>{s.label.toUpperCase()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <SectionTitle>📧 Email</SectionTitle>
            <EmailField user={user} />
          </div>

          {/* Secret code */}
          <div>
            <SectionTitle>🔑 Secret code</SectionTitle>
            <ChangePassword user={user} />
          </div>

          {/* Danger zone */}
          {user !== 'Batman' && (
            <DangerZone user={user} />
          )}

        </div>
      </div>
    </>
  )
}
