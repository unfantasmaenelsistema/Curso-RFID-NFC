import React, { useState, useMemo } from 'react';
import { 
  Radio, Sliders, RotateCcw, AlertTriangle, CheckCircle2, ShieldAlert, 
  ShieldCheck, Zap, Info, HelpCircle, Compass, Layers, Eye, Sparkles, 
  Maximize2, ArrowRight, Gauge, Activity, Cpu
} from 'lucide-react';

export type AntennaGeometry = 'circular' | 'rectangular' | 'uhf-patch';
export type FrequencyBand = '125kHz' | '13.56MHz' | '868MHz';

export interface AntennaPreset {
  id: string;
  name: string;
  geometry: AntennaGeometry;
  frequency: FrequencyBand;
  powerMw: number;
  distanceCm: number;
  angleDeg: number;
  offsetCm: number;
  description: string;
  pentesterTip: string;
}

export const ANTENNA_PRESETS: AntennaPreset[] = [
  {
    id: 'coaxial-optimal',
    name: 'Alineación Coaxial Óptima (Lectura Perfecta)',
    geometry: 'circular',
    frequency: '13.56MHz',
    powerMw: 200,
    distanceCm: 3,
    angleDeg: 0,
    offsetCm: 0,
    description: 'Tarjeta perfectamente paralela al lector a 3 cm de distancia. El vector de campo magnético B atraviesa perpendicularmente el área de la espira.',
    pentesterTip: 'Es la posición de referencia en laboratorio. Entrega el 100% del acoplamiento inductivo teórico (cos 0° = 1).'
  },
  {
    id: 'null-spot-90',
    name: 'Ángulo Muerto Crítico / Null Spot (90°)',
    geometry: 'circular',
    frequency: '13.56MHz',
    powerMw: 200,
    distanceCm: 2,
    angleDeg: 90,
    offsetCm: 0,
    description: 'La tarjeta está a solo 2 cm pero colocada DE CANTO (perpendicular a la bobina). Las líneas de campo magnético no atraviesan la espira.',
    pentesterTip: '¡El flujo magnético es CERO (cos 90° = 0)! La tarjeta permanece apagada aunque esté a 1 cm del lector. Falla clásica en tornos de metro.'
  },
  {
    id: 'edge-offset',
    name: 'Desalineación Lateral en Esquina de Lector',
    geometry: 'rectangular',
    frequency: '125kHz',
    powerMw: 250,
    distanceCm: 4,
    angleDeg: 25,
    offsetCm: 4,
    description: 'Típico en lectores de pared (HID MiniProx). El usuario acerca la tarjeta a una esquina o borde exterior en lugar del centro.',
    pentesterTip: 'En bobinas rectangulares, el campo decae abruptamente fuera del perímetro del marco de cobre.'
  },
  {
    id: 'uhf-long-range',
    name: 'UHF Campo Lejano Radiante (868 MHz)',
    geometry: 'uhf-patch',
    frequency: '868MHz',
    powerMw: 1000,
    distanceCm: 350, // 3.5 meters
    angleDeg: 15,
    offsetCm: 20,
    description: 'Antena tipo parche UHF con lóbulo directivo emitiendo 1W hacia una etiqueta dipolo pasiva a 3.5 metros.',
    pentesterTip: 'El campo lejano se rige por la ecuación de Friis (caída 1/d²). Si la etiqueta se gira 90° en polarización lineal, la lectura cae a cero.'
  }
];

export const AntennaRangeVisualizer: React.FC = () => {
  const [geometry, setGeometry] = useState<AntennaGeometry>('circular');
  const [frequency, setFrequency] = useState<FrequencyBand>('13.56MHz');
  const [powerMw, setPowerMw] = useState<number>(200); // 50 to 2000 mW
  const [distanceCm, setDistanceCm] = useState<number>(3); // 0 to 15 cm in LF/HF, or up to 600 in UHF
  const [angleDeg, setAngleDeg] = useState<number>(0); // 0 to 90 degrees
  const [offsetCm, setOffsetCm] = useState<number>(0); // -8 to +8 cm
  const [activePresetId, setActivePresetId] = useState<string>('coaxial-optimal');

  // Handle preset application
  const applyPreset = (preset: AntennaPreset) => {
    setActivePresetId(preset.id);
    setGeometry(preset.geometry);
    setFrequency(preset.frequency);
    setPowerMw(preset.powerMw);
    setDistanceCm(preset.distanceCm);
    setAngleDeg(preset.angleDeg);
    setOffsetCm(preset.offsetCm);
  };

  // Electromagnetic coupling and read range physics calculation
  const physicsResult = useMemo(() => {
    const isUHF = frequency === '868MHz';
    const angleRad = (angleDeg * Math.PI) / 180;
    const cosFactor = Math.abs(Math.cos(angleRad)); // Orientation alignment factor

    if (isUHF) {
      // UHF Far-field (Friis transmission backscatter)
      // Normalized distance in meters
      const distMeters = Math.max(distanceCm / 100, 0.2);
      const powerWatts = powerMw / 1000;
      
      // Received power proportional to Pt * Gt * Gr * (lambda / 4pi d)^2 * cos^2(angle)
      const wavelengthM = 0.345; // 868 MHz
      const pathLoss = Math.pow(wavelengthM / (4 * Math.PI * distMeters), 2);
      const rxPowerUWatts = powerWatts * pathLoss * 1e6 * Math.pow(cosFactor, 2);

      // Activation threshold for passive UHF chip is typically -18 dBm (~15 µW)
      const thresholdUWatts = 12.0;
      const isActivated = rxPowerUWatts >= thresholdUWatts;
      const margin = isActivated ? Math.min((rxPowerUWatts / thresholdUWatts) * 100, 300) : 0;
      const maxRangeMeters = Math.sqrt((powerWatts * Math.pow(wavelengthM / (4 * Math.PI), 2) * 1e6 * Math.pow(cosFactor, 2)) / thresholdUWatts);

      return {
        isActivated,
        isMarginal: isActivated && rxPowerUWatts < thresholdUWatts * 1.5,
        couplingPercent: Math.min(Math.round((rxPowerUWatts / thresholdUWatts) * 50), 100),
        inducedVoltageV: (Math.sqrt(rxPowerUWatts * 50) / 100).toFixed(2), // Equivalent RF voltage
        cosFactor: cosFactor.toFixed(3),
        maxRangeFormatted: `${maxRangeMeters.toFixed(1)} m`,
        magneticFieldAm: `${(rxPowerUWatts).toFixed(1)} µW`,
        diagnostic: isActivated
          ? 'Potencia RF suficiente para activar el demodulador de la etiqueta UHF.'
          : 'Potencia insuficiente por atenuación en espacio libre (1/d²) o despolarización angular.'
      };
    } else {
      // LF / HF Near-field inductive magnetic coupling (B-field)
      // Coil radius approximation in cm
      const radiusCm = geometry === 'circular' ? 3.5 : 4.0;
      const powerFactor = Math.sqrt(powerMw / 200); // Current scales with sqrt(P)

      // Total axial/radial effective distance squared
      const totalR2 = Math.pow(distanceCm, 2) + Math.pow(offsetCm, 2);
      
      // Axial magnetic field B(z) = B0 * r^2 / (r^2 + z^2)^(3/2) * cos(theta)
      // Geometry factor: rectangular has slightly broader lateral lobe but steeper corner drop
      const geoCorrection = geometry === 'rectangular' 
        ? Math.max(1 - Math.pow(Math.abs(offsetCm) / 7, 2), 0.1)
        : Math.max(1 - Math.pow(Math.abs(offsetCm) / 6, 2), 0.05);

      const fieldB = (Math.pow(radiusCm, 2) / Math.pow(Math.pow(radiusCm, 2) + totalR2, 1.5)) * powerFactor * cosFactor * geoCorrection;

      // Tag activation threshold: induced voltage V_ind = omega * N * B * A * cos(theta)
      // Normalized field threshold is ~0.08
      const thresholdField = 0.045;
      const isActivated = fieldB >= thresholdField && cosFactor > 0.08;
      const isMarginal = isActivated && fieldB < thresholdField * 1.35;
      const couplingPercent = Math.min(Math.round((fieldB / thresholdField) * 50), 100);
      const inducedVoltage = (fieldB * 35).toFixed(1); // Approximate induced peak volts

      // Maximum theoretical axial range
      const maxAxialRange = Math.sqrt(Math.pow(Math.pow(radiusCm, 2) * powerFactor * cosFactor / thresholdField, 2 / 3) - Math.pow(radiusCm, 2));
      const formattedMaxRange = !isNaN(maxAxialRange) && maxAxialRange > 0 ? `${maxAxialRange.toFixed(1)} cm` : '0 cm';

      let diagnosticMsg = '';
      if (!isActivated) {
        if (cosFactor <= 0.08) {
          diagnosticMsg = '¡ÁNGULO MUERTO! Las líneas de flujo magnético no cruzan el área de la bobina (cos θ ≈ 0).';
        } else if (Math.abs(offsetCm) > 5) {
          diagnosticMsg = 'Desalineación lateral excesiva: la tarjeta está fuera del área del bucle de cobre.';
        } else {
          diagnosticMsg = 'Distancia excesiva: en campo cercano el campo magnético decae como 1/d³.';
        }
      } else if (isMarginal) {
        diagnosticMsg = 'Zona marginal: el chip apenas supera el umbral de alimentación. Posible jitter de paquetes.';
      } else {
        diagnosticMsg = 'Acoplamiento inductivo óptimo: alimentación estable de la EEPROM del chip.';
      }

      return {
        isActivated,
        isMarginal,
        couplingPercent,
        inducedVoltageV: `${inducedVoltage} V`,
        cosFactor: cosFactor.toFixed(3),
        maxRangeFormatted: formattedMaxRange,
        magneticFieldAm: `${(fieldB * 15).toFixed(2)} A/m`,
        diagnostic: diagnosticMsg
      };
    }
  }, [geometry, frequency, powerMw, distanceCm, angleDeg, offsetCm]);

  // Visual coordinates for SVG simulator
  const svgWidth = 600;
  const svgHeight = 320;
  const readerX = 140;
  const readerY = svgHeight / 2;

  // Normalized distance on canvas
  const isUHF = frequency === '868MHz';
  const canvasDistancePx = isUHF 
    ? Math.min((distanceCm / 600) * 320 + 40, 380)
    : Math.min((distanceCm / 15) * 320 + 30, 380);

  const canvasOffsetYPx = isUHF
    ? Math.max(Math.min((offsetCm / 100) * 80, 100), -100)
    : Math.max(Math.min((offsetCm / 8) * 80, 100), -100);

  const tagX = readerX + canvasDistancePx;
  const tagY = readerY + canvasOffsetYPx;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
              <Compass className="w-3.5 h-3.5 animate-pulse" /> Simulación de Acoplamiento y Geometría de Antenas
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Simulador Visual de Alcance & Orientación de Antenas RFID / NFC
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Experimenta cómo la geometría de la bobina (circular vs rectangular vs UHF), la potencia de transmisión y el <strong>ángulo de orientación de la tarjeta ($\cos\theta$)</strong> determinan el alcance real y provocan los famosos «ángulos muertos» (Null Spots).
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => applyPreset(ANTENNA_PRESETS[0])}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer Parámetros</span>
            </button>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <div className="text-xs font-mono text-slate-400 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Escenarios de Orientación Críticos para Pentesters:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {ANTENNA_PRESETS.map((p) => {
              const isSelected = activePresetId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => applyPreset(p)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-slate-800 border-indigo-500 ring-1 ring-indigo-500/40 text-white shadow-md'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-white line-clamp-1">{p.name.split('(')[0]}</span>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">{p.frequency}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{p.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Interactive Simulation Canvas & Live Heatmap */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400" />
                Campo Electromagnético y Posición de la Tarjeta
              </h3>
              <span className="text-xs text-slate-400">
                Visualización en tiempo real de las isolíneas de campo electromagnético B(z)
              </span>
            </div>

            {/* Live Activation Badge */}
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 border shadow-sm ${
                physicsResult.isActivated 
                  ? physicsResult.isMarginal
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              }`}>
                {physicsResult.isActivated ? (
                  physicsResult.isMarginal ? (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      <span>SEÑAL MARGINAL (DÉBIL)</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>CHIP ACTIVADO (LECTURA OK)</span>
                    </>
                  )
                ) : (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    <span>SIN ENERGÍA (APAGADO)</span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* SVG Radiation and Tag Visualizer Canvas */}
          <div className="relative rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-inner p-2">
            <svg 
              viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
              className="w-full h-auto select-none"
            >
              <defs>
                {/* Radial Glow Gradient for Reader Antenna */}
                <radialGradient id="readerGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                  <stop offset="60%" stopColor="#3b82f6" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0" />
                </radialGradient>

                <linearGradient id="fluxLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0.2" />
                </linearGradient>
              </defs>

              {/* Grid Background Lines */}
              <pattern id="gridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
              </pattern>
              <rect width={svgWidth} height={svgHeight} fill="url(#gridPattern)" opacity="0.6" />

              {/* Radiation Iso-field Ellipses radiating from Reader */}
              {[40, 80, 130, 190, 260].map((radius, idx) => {
                const opacity = Math.max(0.6 - idx * 0.12, 0.08);
                const rx = radius * (geometry === 'rectangular' ? 1.3 : 1.0);
                const ry = radius * (geometry === 'rectangular' ? 0.8 : 1.0);
                return (
                  <ellipse
                    key={idx}
                    cx={readerX}
                    cy={readerY}
                    rx={rx}
                    ry={ry}
                    fill="none"
                    stroke={idx <= 2 ? '#06b6d4' : '#6366f1'}
                    strokeWidth={idx === 1 ? '1.5' : '1'}
                    strokeDasharray={idx > 2 ? '4 4' : 'none'}
                    opacity={opacity}
                  />
                );
              })}

              {/* Central Axis Line (z-axis) */}
              <line 
                x1={readerX} 
                y1={readerY} 
                x2={svgWidth - 20} 
                y2={readerY} 
                stroke="#475569" 
                strokeWidth="1" 
                strokeDasharray="3 3" 
              />

              {/* Reader Antenna Representation */}
              {geometry === 'circular' ? (
                <g>
                  {/* Circular Coil Windings */}
                  <circle cx={readerX} cy={readerY} r="35" fill="none" stroke="#f59e0b" strokeWidth="3" opacity="0.9" />
                  <circle cx={readerX} cy={readerY} r="31" fill="none" stroke="#d97706" strokeWidth="2" opacity="0.7" />
                  <circle cx={readerX} cy={readerY} r="27" fill="none" stroke="#b45309" strokeWidth="1.5" opacity="0.5" />
                  <circle cx={readerX} cy={readerY} r="45" fill="url(#readerGlow)" />
                  <text x={readerX} y={readerY - 48} fill="#f59e0b" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                    Bobina Circular LF/HF
                  </text>
                </g>
              ) : geometry === 'rectangular' ? (
                <g>
                  {/* Rectangular Coil Windings */}
                  <rect x={readerX - 25} y={readerY - 45} width="50" height="90" rx="6" fill="none" stroke="#f59e0b" strokeWidth="3" opacity="0.9" />
                  <rect x={readerX - 21} y={readerY - 41} width="42" height="82" rx="4" fill="none" stroke="#d97706" strokeWidth="2" opacity="0.7" />
                  <rect x={readerX - 35} y={readerY - 55} width="70" height="110" rx="8" fill="url(#readerGlow)" />
                  <text x={readerX} y={readerY - 58} fill="#f59e0b" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                    Marco Rectangular de Pared
                  </text>
                </g>
              ) : (
                <g>
                  {/* UHF Patch Antenna */}
                  <rect x={readerX - 20} y={readerY - 40} width="40" height="80" rx="4" fill="#312e81" stroke="#818cf8" strokeWidth="2" />
                  {/* Directive radiation cone */}
                  <polygon 
                    points={`${readerX + 20},${readerY - 20} ${readerX + 220},${readerY - 90} ${readerX + 220},${readerY + 90} ${readerX + 20},${readerY + 20}`} 
                    fill="url(#fluxLineGrad)" 
                    opacity="0.25" 
                  />
                  <text x={readerX} y={readerY - 50} fill="#818cf8" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                    Parche Directivo UHF
                  </text>
                </g>
              )}

              {/* Tag / Credential Graphic (Rotated by angleDeg at (tagX, tagY)) */}
              <g transform={`translate(${tagX}, ${tagY}) rotate(${angleDeg})`}>
                {/* Shadow */}
                <rect 
                  x="-25" 
                  y="-40" 
                  width="50" 
                  height="80" 
                  rx="4" 
                  fill="#000" 
                  opacity="0.4" 
                />

                {/* Card Body */}
                <rect 
                  x="-25" 
                  y="-40" 
                  width="50" 
                  height="80" 
                  rx="4" 
                  fill={physicsResult.isActivated ? '#0f172a' : '#1e1b4b'} 
                  stroke={
                    physicsResult.isActivated 
                      ? physicsResult.isMarginal ? '#f59e0b' : '#10b981' 
                      : '#ef4444'
                  } 
                  strokeWidth={physicsResult.isActivated ? '2.5' : '1.5'} 
                />

                {/* Embedded Coil Lines inside the Card */}
                <rect x="-21" y="-36" width="42" height="72" rx="3" fill="none" stroke="#64748b" strokeWidth="0.8" opacity="0.6" />
                <rect x="-18" y="-33" width="36" height="66" rx="2" fill="none" stroke="#64748b" strokeWidth="0.8" opacity="0.4" />

                {/* Silicon Microchip Square */}
                <rect 
                  x="-6" 
                  y="-6" 
                  width="12" 
                  height="12" 
                  rx="2" 
                  fill={physicsResult.isActivated ? '#10b981' : '#ef4444'} 
                  stroke="#fff" 
                  strokeWidth="0.5" 
                />

                {/* Activation Glow or Warning cross */}
                {physicsResult.isActivated && (
                  <circle cx="0" cy="0" r="16" fill="#10b981" opacity="0.2" className="animate-ping" />
                )}

                {/* Normal Vector Arrow (indicates orientation) */}
                <line x1="0" y1="0" x2="35" y2="0" stroke="#38bdf8" strokeWidth="1.5" />
                <polygon points="35,0 30,-3 30,3" fill="#38bdf8" />
              </g>

              {/* Tag Center Label */}
              <text 
                x={tagX} 
                y={tagY + 55} 
                fill={physicsResult.isActivated ? '#34d399' : '#f87171'} 
                fontSize="11" 
                fontWeight="bold" 
                textAnchor="middle" 
                fontFamily="monospace"
              >
                {physicsResult.isActivated ? `V_ind: ${physicsResult.inducedVoltageV}` : 'V_ind = 0V'}
              </text>

              {/* Angle indicator text */}
              <text 
                x={tagX} 
                y={tagY - 50} 
                fill="#94a3b8" 
                fontSize="10" 
                textAnchor="middle" 
                fontFamily="monospace"
              >
                θ = {angleDeg}° (cos: {physicsResult.cosFactor})
              </text>
            </svg>
          </div>

          {/* Diagnostic Note */}
          <div className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
            physicsResult.isActivated
              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
              : 'bg-rose-950/20 border-rose-500/30 text-rose-200'
          }`}>
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Diagnóstico Físico:</strong>
              <p className="leading-relaxed mt-0.5">{physicsResult.diagnostic}</p>
            </div>
          </div>
        </div>

        {/* Right Column (1/3): Interactive Parameter Controls */}
        <div className="space-y-6">
          {/* Controls Box */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <h4 className="text-xs font-bold text-white uppercase font-mono flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sliders className="w-4 h-4 text-cyan-400" /> Parámetros de Antena & Tarjeta
            </h4>

            {/* Geometry Selector */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono text-slate-400 block font-bold">1. Geometría de Antena del Lector:</span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'circular', label: 'Circular (LF/HF)' },
                  { id: 'rectangular', label: 'Rectangular' },
                  { id: 'uhf-patch', label: 'Parche UHF' }
                ].map((g) => (
                  <button
                    key={g.id}
                    onClick={() => {
                      setGeometry(g.id as any);
                      if (g.id === 'uhf-patch') {
                        setFrequency('868MHz');
                        setDistanceCm(300);
                      } else {
                        setFrequency('13.56MHz');
                        setDistanceCm(3);
                      }
                      setActivePresetId('');
                    }}
                    className={`py-2 px-1 text-[11px] font-bold rounded-xl text-center transition-all ${
                      geometry === g.id
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Distance Slider (Z) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 font-bold">Distancia Axial (Z):</span>
                <span className="text-cyan-400 font-extrabold">{distanceCm} {isUHF ? 'cm (3m)' : 'cm'}</span>
              </div>
              <input
                type="range"
                min={isUHF ? 30 : 0}
                max={isUHF ? 600 : 15}
                step={isUHF ? 10 : 0.5}
                value={distanceCm}
                onChange={(e) => {
                  setDistanceCm(parseFloat(e.target.value));
                  setActivePresetId('');
                }}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0 cm</span>
                <span>{isUHF ? '6 metros' : '15 cm'}</span>
              </div>
            </div>

            {/* Orientation Angle Slider (Theta) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 font-bold">Ángulo de Inclinación (θ):</span>
                <span className="text-amber-400 font-extrabold">{angleDeg}° ({angleDeg === 90 ? 'Ángulo Nulo' : 'Normal'})</span>
              </div>
              <input
                type="range"
                min="0"
                max="90"
                step="5"
                value={angleDeg}
                onChange={(e) => {
                  setAngleDeg(parseInt(e.target.value));
                  setActivePresetId('');
                }}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0° (Paralelo)</span>
                <span>45°</span>
                <span className="text-rose-400 font-bold">90° (Canto)</span>
              </div>
            </div>

            {/* Lateral Offset Slider (Y) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 font-bold">Desalineación Lateral (Y):</span>
                <span className="text-purple-400 font-extrabold">{offsetCm} cm</span>
              </div>
              <input
                type="range"
                min={isUHF ? -100 : -8}
                max={isUHF ? 100 : 8}
                step={isUHF ? 5 : 0.5}
                value={offsetCm}
                onChange={(e) => {
                  setOffsetCm(parseFloat(e.target.value));
                  setActivePresetId('');
                }}
                className="w-full accent-purple-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Centrado (0)</span>
                <span>Borde Exterior</span>
              </div>
            </div>

            {/* Power Output Slider (mW) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 font-bold">Potencia del Lector (RF Power):</span>
                <span className="text-emerald-400 font-extrabold">{powerMw} mW</span>
              </div>
              <input
                type="range"
                min="50"
                max="2000"
                step="50"
                value={powerMw}
                onChange={(e) => {
                  setPowerMw(parseInt(e.target.value));
                  setActivePresetId('');
                }}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>50 mW (Bajo)</span>
                <span>200 mW (USB)</span>
                <span>2W (Largo alcance)</span>
              </div>
            </div>
          </div>

          {/* Real-time RF Physics Metrics Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 font-mono text-xs">
            <h4 className="text-xs font-bold text-white uppercase flex items-center gap-2 border-b border-slate-800 pb-3">
              <Activity className="w-4 h-4 text-emerald-400" /> Métricas de Acoplamiento Inducido
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] block">ACOPLAMIENTO:</span>
                <span className="text-white font-bold text-base">{physicsResult.couplingPercent}%</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] block">ALCANCE MÁXIMO:</span>
                <span className="text-cyan-400 font-bold text-base">{physicsResult.maxRangeFormatted}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] block">FACTOR COS(θ):</span>
                <span className="text-amber-400 font-bold text-base">{physicsResult.cosFactor}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] block">INTENSIDAD CAMPO:</span>
                <span className="text-emerald-400 font-bold text-sm">{physicsResult.magneticFieldAm}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
