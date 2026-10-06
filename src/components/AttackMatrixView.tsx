import React, { useState } from 'react';
import { ATTACK_MATRIX, AttackMatrixRow } from '../data/curriculumData';
import { AttackLabSimulator } from './AttackLabSimulator';
import { RiskScoringCalculator } from './RiskScoringCalculator';
import { ShieldAlert, ShieldCheck, Search, Filter, AlertTriangle, ArrowUpDown, Radio, Zap, Table, Scale } from 'lucide-react';

export const AttackMatrixView: React.FC = () => {
  const [subTab, setSubTab] = useState<'matrix' | 'simulator' | 'calculator'>('matrix');
  const [searchTerm, setSearchTerm] = useState('');
  const [freqFilter, setFreqFilter] = useState<'all' | 'LF' | 'HF'>('all');

  const filteredMatrix = ATTACK_MATRIX.filter((item) => {
    const matchesSearch = 
      item.technology.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.crypto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.realWorldUsage.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.recommendation.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFreq = 
      freqFilter === 'all' || 
      (freqFilter === 'LF' && item.frequency.includes('125 kHz')) ||
      (freqFilter === 'HF' && item.frequency.includes('13.56 MHz'));

    return matchesSearch && matchesFreq;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold mb-2">
            <ShieldAlert className="w-3.5 h-3.5" /> Matriz de Vulnerabilidades & Vectores de Ataque
          </div>
          <h2 className="text-2xl font-bold text-white">
            Comparativa de Tecnologías RFID/NFC vs Seguridad Real
          </h2>
          <p className="text-slate-300 text-sm mt-2 leading-relaxed">
            Un mapa de referencia esencial para que el auditor identifique en segundos el nivel de riesgo de una credencial en una auditoría física, desde protocolos obsoletos de texto claro hasta chips criptográficos con AES-128.
          </p>
        </div>
      </div>

      {/* Subtab Switcher: Matrix Table vs Attack Flow Simulator */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-2 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubTab('matrix')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              subTab === 'matrix'
                ? 'bg-rose-500 text-slate-950 font-bold shadow-lg shadow-rose-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>Matriz Comparativa de Tecnologías</span>
          </button>

          <button
            onClick={() => setSubTab('simulator')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              subTab === 'simulator'
                ? 'bg-rose-500 text-slate-950 font-bold shadow-lg shadow-rose-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Simulador de Flujo de Ataques</span>
          </button>

          <button
            onClick={() => setSubTab('calculator')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              subTab === 'calculator'
                ? 'bg-orange-500 text-slate-950 font-bold shadow-lg shadow-orange-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Scale className="w-4 h-4 text-orange-400" />
            <span>Calculadora de Riesgo CVSS</span>
          </button>
        </div>

        <div className="text-xs text-slate-400 font-mono hidden sm:block pr-2">
          {subTab === 'matrix' && '📊 Tabla de riesgos LF vs HF y mitigaciones'}
          {subTab === 'simulator' && '🎯 Walkthroughs animados de Replay, Nested, Darkside y Relay'}
          {subTab === 'calculator' && '⚖️ Cálculo de severidad CVSS v3.1 y priorización de estudio'}
        </div>
      </div>

      {subTab === 'simulator' ? (
        <AttackLabSimulator />
      ) : subTab === 'calculator' ? (
        <RiskScoringCalculator />
      ) : (
        <>
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Filtrar por tecnología (MIFARE, HID, Indala, DESFire, Saflok)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs text-slate-400">Banda RF:</span>
          <button
            onClick={() => setFreqFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              freqFilter === 'all'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFreqFilter('LF')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              freqFilter === 'LF'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            LF (125 kHz)
          </button>
          <button
            onClick={() => setFreqFilter('HF')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              freqFilter === 'HF'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            HF (13.56 MHz / NFC)
          </button>
        </div>
      </div>

      {/* Interactive Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-mono text-[11px]">
                <th className="py-3 px-4">Tecnología / Chip</th>
                <th className="py-3 px-4">Frecuencia</th>
                <th className="py-3 px-4">Criptografía en el Aire</th>
                <th className="py-3 px-4">Riesgo de Clonado</th>
                <th className="py-3 px-4">Caso de Uso Típico</th>
                <th className="py-3 px-4">Recomendación de Seguridad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredMatrix.map((item, idx) => {
                const isCritical = item.cloneRisk.includes('Crítico');
                const isSecure = item.cloneRisk.includes('Inviable') || item.cloneRisk.includes('Bajo');

                return (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                      {item.technology}
                    </td>

                    <td className="py-3 px-4 font-mono whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        item.frequency.includes('125 kHz')
                          ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                          : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                      }`}>
                        {item.frequency}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-300 text-xs">
                      {item.crypto}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 w-fit ${
                        isCritical 
                          ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30' 
                          : isSecure
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                      }`}>
                        {isCritical ? <ShieldAlert className="w-3 h-3 text-rose-400" /> : 
                         isSecure ? <ShieldCheck className="w-3 h-3 text-emerald-400" /> : 
                         <AlertTriangle className="w-3 h-3 text-amber-400" />}
                        {item.cloneRisk.split('(')[0]}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-400 text-xs max-w-xs">
                      {item.realWorldUsage}
                    </td>

                    <td className="py-3 px-4 text-xs font-medium text-cyan-300 max-w-xs">
                      {item.recommendation}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )}
</div>
);
};
