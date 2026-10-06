import React, { useState } from 'react';
import { HARDWARE_KITS, HardwareKit } from '../data/curriculumData';
import { HardwareComponentViewer } from './HardwareComponentViewer';
import { AntennaRangeVisualizer } from './AntennaRangeVisualizer';
import { 
  Cpu, ShoppingCart, AlertTriangle, CheckCircle2, Shield, Wrench, 
  ExternalLink, Zap, HelpCircle, Info, Sparkles, Layers, Sliders, Radio
} from 'lucide-react';

export const HardwareKitGuide: React.FC = () => {
  const [subTab, setSubTab] = useState<'kits' | 'diagram' | 'antennas'>('kits');
  const [selectedKit, setSelectedKit] = useState<HardwareKit>(HARDWARE_KITS[1]); // Default to Intermediate Pentester

  return (
    <div className="space-y-8">
      {/* Introduction Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-2">
            <Cpu className="w-3.5 h-3.5" /> Guía de Adquisición de Hardware para el Alumno
          </div>
          <h2 className="text-2xl font-bold text-white">
            Kits de Laboratorio Recomendados por Presupuesto
          </h2>
          <p className="text-slate-300 text-sm mt-2 leading-relaxed">
            Uno de los mayores errores al empezar en RFID/NFC es gastar cientos de euros en dispositivos redundantes o comprar chips equivocados. A continuación tienes 3 configuraciones optimizadas para que el estudiante o la academia monte el laboratorio sin despilfarro.
          </p>
        </div>
      </div>

      {/* Sub-tab Switcher: Purchasing Kits vs Interactive PCB Diagram */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-2 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubTab('kits')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              subTab === 'kits'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Kits de Compra por Presupuesto</span>
          </button>

          <button
            onClick={() => setSubTab('diagram')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              subTab === 'diagram'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Visor Interactivo de Hardware & Placa PCB</span>
          </button>

          <button
            onClick={() => setSubTab('antennas')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              subTab === 'antennas'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Simulador de Antenas & Alcance</span>
          </button>
        </div>

        <div className="text-xs text-slate-400 font-mono hidden sm:block pr-2">
          {subTab === 'kits' && '💰 3 niveles de inversión optimizados'}
          {subTab === 'diagram' && '🔍 Inspecciona bobinas, microcontroladores y puertos'}
          {subTab === 'antennas' && '📡 Simula el alcance según forma de la bobina y orientación'}
        </div>
      </div>

      {subTab === 'diagram' && <HardwareComponentViewer />}
      {subTab === 'antennas' && <AntennaRangeVisualizer />}
      {subTab === 'kits' && (
        <>
          {/* Tier Selector */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {HARDWARE_KITS.map((kit) => {
          const isSelected = kit.tier === selectedKit.tier;
          const badgeColor = 
            kit.tier.includes('Básico') ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
            kit.tier.includes('Intermedio') ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30 ring-1 ring-cyan-500/40' :
            'text-purple-400 bg-purple-500/10 border-purple-500/30';

          return (
            <div
              key={kit.tier}
              onClick={() => setSelectedKit(kit)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'bg-slate-800/90 border-cyan-500 shadow-xl ring-2 ring-cyan-500/20'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
              }`}
            >
              {kit.tier.includes('Intermedio') && (
                <div className="absolute top-0 right-0 bg-cyan-500 text-slate-950 text-[10px] font-bold px-3 py-0.5 rounded-bl-lg uppercase tracking-wider">
                  Opción Más Recomendada
                </div>
              )}

              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${badgeColor}`}>
                  {kit.tier}
                </span>
                <span className="text-lg font-bold text-white font-mono">
                  {kit.budgetEur}
                </span>
              </div>

              <h3 className="text-base font-bold text-white mt-1">
                {kit.tier.split('/')[0]}
              </h3>

              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                {kit.targetAudience}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">{kit.items.length} componentes</span>
                <span className={`font-semibold ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`}>
                  {isSelected ? 'Ver desglose ↓' : 'Seleccionar'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Kit Breakdown */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-cyan-400" />
              Lista de la Compra: {selectedKit.tier} ({selectedKit.budgetEur})
            </h3>
            <p className="text-slate-400 text-xs mt-1">
              Material imprescindible para completar los laboratorios de este nivel.
            </p>
          </div>
        </div>

        {/* Component Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono text-[11px]">
                <th className="py-2.5 px-3">Componente / Herramienta</th>
                <th className="py-2.5 px-3">Precio Aprox.</th>
                <th className="py-2.5 px-3">Utilidad en el Curso</th>
                <th className="py-2.5 px-3 text-right">Prioridad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {selectedKit.items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-semibold text-white font-sans flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0"></span>
                    {item.name}
                  </td>
                  <td className="py-3 px-3 text-cyan-400 font-bold">
                    {item.approxPrice}
                  </td>
                  <td className="py-3 px-3 text-slate-300 font-sans">
                    {item.purpose}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      item.isEssential 
                        ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {item.isEssential ? 'Imprescindible' : 'Opcional'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pros & Cons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800 text-xs">
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
            <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Ventajas de esta configuración:
            </h4>
            <ul className="space-y-1.5 text-slate-300">
              {selectedKit.pros.map((p, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span> {p}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-2">
            <h4 className="font-bold text-amber-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Limitaciones a tener en cuenta:
            </h4>
            <ul className="space-y-1.5 text-slate-300">
              {selectedKit.cons.map((c, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">!</span> {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Critical Buyer Warnings for Beginners (Avoiding Scams & Brick Hazards) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          Consejos Críticos para no tirar el dinero al comprar hardware
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="font-bold text-cyan-400 flex items-center gap-1.5">
              1. Proxmark3: Ojo con el chip SAM7S
            </h4>
            <p className="leading-relaxed">
              En AliExpress existen clones muy baratos de Proxmark3 Easy con chip de <strong>256 KB</strong> de memoria flash. <strong>Evítalos</strong>: el firmware moderno Iceman requiere <strong>512 KB</strong> para compilar todas las funciones de sniffing y autopwn. Asegúrate de que la descripción diga explícitamente <em>"512K AT91SAM7S512"</em>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
              2. Magic Cards: Gen1a vs Gen2 (CUID)
            </h4>
            <p className="leading-relaxed">
              Si vas a usar un smartphone con <strong>Mifare Classic Tool (MCT)</strong>, necesitas tarjetas <strong>Gen2 (CUID)</strong>. Las Gen1a solo se pueden reprogramar con Proxmark3 o ACR122U mediante comandos chinos especiales que la pila NFC estándar de Android rechaza por seguridad.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="font-bold text-purple-400 flex items-center gap-1.5">
              3. ¿Flipper Zero sustituye al Proxmark3?
            </h4>
            <p className="leading-relaxed">
              No. El Flipper Zero es brillante para leer y reproducir rápidamente en auditorías encubiertas de Red Team, pero <strong>no tiene capacidad de sniffing pasivo en tiempo real</strong> para capturar nonces de Crypto-1 entre lector y tarjeta, ni permite análisis fino de sintonización de bobinas RF.
            </p>
          </div>
        </div>
      </div>
    </>
  )}
</div>
);
};
