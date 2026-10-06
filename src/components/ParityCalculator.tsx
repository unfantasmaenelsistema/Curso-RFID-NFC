import React, { useState, useMemo } from 'react';
import { 
  Calculator, Check, Copy, RotateCcw, AlertTriangle, ShieldCheck, 
  Terminal, Sparkles, HelpCircle, Layers, Grid, Cpu, Radio 
} from 'lucide-react';

export type ParityMode = 'EM4100' | 'WIEGAND26' | 'ISO14443A' | 'CUSTOM';

interface PresetData {
  name: string;
  mode: ParityMode;
  hex: string;
  description: string;
}

const PRESETS: PresetData[] = [
  {
    name: 'EM4100 Llavero Garaje (5 Bytes)',
    mode: 'EM4100',
    hex: '1E 00 48 9B 13',
    description: 'Estructura clásica de 64 bits con paridad bidimensional (10 filas horizontales + 4 columnas verticales).'
  },
  {
    name: 'HID Prox II Wiegand 26-bit',
    mode: 'WIEGAND26',
    hex: '70 39 00', // FC: 112, CN: 14592
    description: '1 bit de paridad par al inicio (primeros 12 bits) y 1 bit de paridad impar al final (últimos 12 bits).'
  },
  {
    name: 'ISO 14443-A Anticolisión (UID)',
    mode: 'ISO14443A',
    hex: 'A3 B4 2C 19',
    description: '1 bit de paridad impar (Odd Parity) transmitido tras cada byte de 8 bits en la capa física de radio.'
  }
];

export interface ParityCalculatorProps {
  onNavigateToFrames?: () => void;
}

export const ParityCalculator: React.FC<ParityCalculatorProps> = ({ onNavigateToFrames }) => {
  const [mode, setMode] = useState<ParityMode>('EM4100');
  const [hexInput, setHexInput] = useState<string>('1E 00 48 9B 13');
  const [copied, setCopied] = useState<boolean>(false);

  // Clean hex string (strip spaces, colons, dashes)
  const cleanedHex = useMemo(() => {
    return hexInput.replace(/[^0-9a-fA-F]/g, '').toUpperCase();
  }, [hexInput]);

  // Convert hex string to array of byte numbers
  const bytes = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i < cleanedHex.length; i += 2) {
      if (i + 1 < cleanedHex.length) {
        arr.push(parseInt(cleanedHex.substr(i, 2), 16));
      }
    }
    return arr;
  }, [cleanedHex]);

  // Helper to calculate parity of a number with specified bit length
  const calcParity = (num: number, bitLength: number, type: 'even' | 'odd'): number => {
    let count = 0;
    for (let b = 0; b < bitLength; b++) {
      if ((num >> b) & 1) count++;
    }
    return type === 'even' ? (count % 2 === 0 ? 0 : 1) : (count % 2 === 0 ? 1 : 0);
  };

  // 1. EM4100 Calculation (10 nibbles, 10 horizontal parities, 4 column parities, 9 preamble bits)
  const em4100Data = useMemo(() => {
    // Requires 5 bytes = 10 nibbles
    const paddedHex = (cleanedHex + '0000000000').slice(0, 10);
    const nibbles: { hexChar: string; val: number; bits: number[]; parityBit: number }[] = [];
    
    for (let i = 0; i < 10; i++) {
      const val = parseInt(paddedHex[i], 16);
      const b0 = (val >> 3) & 1;
      const b1 = (val >> 2) & 1;
      const b2 = (val >> 1) & 1;
      const b3 = val & 1;
      const onesCount = b0 + b1 + b2 + b3;
      const parityBit = onesCount % 2 === 0 ? 0 : 1; // Even parity
      nibbles.push({
        hexChar: paddedHex[i],
        val,
        bits: [b0, b1, b2, b3],
        parityBit
      });
    }

    // Vertical parity for each column (4 columns)
    const colParities: number[] = [0, 0, 0, 0];
    for (let col = 0; col < 4; col++) {
      let colOnes = 0;
      for (let row = 0; row < 10; row++) {
        colOnes += nibbles[row].bits[col];
      }
      colParities[col] = colOnes % 2 === 0 ? 0 : 1; // Even parity
    }

    // Construct 64-bit frame bitstring
    // 9 leader bits: 111111111
    let frame64 = '111111111';
    nibbles.forEach(n => {
      frame64 += n.bits.join('') + n.parityBit;
    });
    frame64 += colParities.join('') + '0'; // 1 stop bit '0'

    return {
      nibbles,
      colParities,
      frame64,
      totalLength: frame64.length
    };
  }, [cleanedHex]);

  // 2. Wiegand 26-bit Calculation (1 parity bit + 8 bit FC + 16 bit CN + 1 parity bit)
  const wiegandData = useMemo(() => {
    // Extract first 3 bytes (24 bits)
    const b0 = bytes[0] || 0;
    const b1 = bytes[1] || 0;
    const b2 = bytes[2] || 0;

    const fc = b0; // 8-bit Facility Code (bits 1-8)
    const cn = (b1 << 8) | b2; // 16-bit Card ID (bits 9-24)

    // 24 data bits:
    const data24Bits: number[] = [];
    for (let b = 7; b >= 0; b--) data24Bits.push((fc >> b) & 1);
    for (let b = 15; b >= 0; b--) data24Bits.push((cn >> b) & 1);

    // Leading Even Parity covers first 12 bits (bits 1 to 12)
    const first12 = data24Bits.slice(0, 12);
    const onesFirst12 = first12.reduce((acc, v) => acc + v, 0);
    const leadingEvenParity = onesFirst12 % 2 === 0 ? 0 : 1;

    // Trailing Odd Parity covers last 12 bits (bits 13 to 24)
    const last12 = data24Bits.slice(12, 24);
    const onesLast12 = last12.reduce((acc, v) => acc + v, 0);
    const trailingOddParity = onesLast12 % 2 === 0 ? 1 : 0;

    const full26Bits = [leadingEvenParity, ...data24Bits, trailingOddParity];

    return {
      fc,
      cn,
      first12,
      last12,
      leadingEvenParity,
      trailingOddParity,
      full26Bits: full26Bits.join('')
    };
  }, [bytes]);

  // 3. ISO 14443-A Odd Parity per Byte
  const iso14443AData = useMemo(() => {
    return bytes.map(byteVal => {
      const bits: number[] = [];
      for (let b = 7; b >= 0; b--) {
        bits.push((byteVal >> b) & 1);
      }
      const onesCount = bits.reduce((a, c) => a + c, 0);
      const oddParity = onesCount % 2 === 0 ? 1 : 0; // Odd parity
      return {
        hex: byteVal.toString(16).padStart(2, '0').toUpperCase(),
        byteVal,
        bits,
        onesCount,
        oddParity
      };
    });
  }, [bytes]);

  const handleCopyResult = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const applyPreset = (preset: PresetData) => {
    setMode(preset.mode);
    setHexInput(preset.hex);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-2">
              <Calculator className="w-3.5 h-3.5" /> Herramienta de Laboratorio & Tramas de Radio
            </div>
            <h2 className="text-2xl font-bold text-white">
              Calculadora de Paridad y Estructura de Tramas RFID
            </h2>
            <p className="text-slate-300 text-sm mt-1 leading-relaxed">
              Comprende cómo los protocolos RFID utilizan bits de paridad horizontal y vertical para detectar errores de radio, y cómo el criptoanálisis (como el ataque <strong>Darkside</strong> de MIFARE) explota la fuga de información en los bits de paridad.
            </p>
          </div>

          {onNavigateToFrames && (
            <button
              onClick={onNavigateToFrames}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shrink-0 self-start md:self-auto"
            >
              <Terminal className="w-4 h-4" />
              <span>Decodificador de Tramas Raw ➜</span>
            </button>
          )}
        </div>

        {/* Quick Presets */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <div className="text-xs text-slate-400 font-mono mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Presets de Credenciales Habituales:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {PRESETS.map((p) => {
              const isSelected = mode === p.mode && hexInput === p.hex;
              return (
                <button
                  key={p.name}
                  onClick={() => applyPreset(p)}
                  className={`p-2.5 rounded-xl text-left border transition-all ${
                    isSelected
                      ? 'bg-slate-800 border-cyan-500 ring-1 ring-cyan-500/30'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-bold text-white">{p.name}</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-800 font-mono text-[10px] text-cyan-400 font-semibold">
                      {p.mode}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{p.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Input & Mode Selector Controls */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Mode Selector Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'EM4100', label: 'EM4100 (Matriz 64-bit LF)' },
              { id: 'WIEGAND26', label: 'Wiegand 26-bit (H10301)' },
              { id: 'ISO14443A', label: 'ISO 14443-A (Odd Parity HF)' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setMode(tab.id as ParityMode)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  mode === tab.id
                    ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleCopyResult(
              mode === 'EM4100' ? em4100Data.frame64 :
              mode === 'WIEGAND26' ? wiegandData.full26Bits :
              iso14443AData.map(d => `${d.hex}:${d.oddParity}`).join(' ')
            )}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? '¡Trama Copiada!' : 'Copiar Bits de Trama'}</span>
          </button>
        </div>

        {/* Hex Input Bar */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
            <span>Introduce datos en formato Hexadecimal (separados por espacio o continuos):</span>
            <span className="font-mono text-cyan-400 text-[11px]">{bytes.length} bytes detectados</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={hexInput}
              onChange={(e) => setHexInput(e.target.value)}
              placeholder="Ej: 1E 00 48 9B 13 o A3 B4 2C 19"
              className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-cyan-300 font-mono text-sm tracking-wider focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
            />
            <button
              onClick={() => setHexInput('')}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-xs transition-colors"
              title="Limpiar"
            >
              Borrar
            </button>
          </div>
        </div>
      </div>

      {/* MODE 1: EM4100 2D PARITY MATRIX VIEW */}
      {mode === 'EM4100' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Grid className="w-4 h-4 text-cyan-400" /> Matriz de Paridad Bidimensional EM4100 (64 bits)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                9 bits cabecera ('111111111') + 10 filas de 4 bits de datos con paridad par + 4 bits columna + 1 bit de parada ('0').
              </p>
            </div>
            <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
              Total: 64 bits transmitidos
            </span>
          </div>

          {/* Matrix Visual Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                  <th className="py-2 px-3 text-left">Fila / Nibble</th>
                  <th className="py-2 px-3">Hex</th>
                  <th className="py-2 px-3 text-cyan-400">Bit 3 (MSB)</th>
                  <th className="py-2 px-3 text-cyan-400">Bit 2</th>
                  <th className="py-2 px-3 text-cyan-400">Bit 1</th>
                  <th className="py-2 px-3 text-cyan-400">Bit 0 (LSB)</th>
                  <th className="py-2 px-3 text-amber-400 font-bold bg-amber-950/20">Paridad Fila (Even)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {/* Header row indicator */}
                <tr className="bg-slate-950/60 text-slate-500 text-[11px]">
                  <td colSpan={7} className="py-1 px-3 text-left font-sans">
                    ▲ Cabecera de sincronismo (9 unos continuos): <span className="font-mono text-cyan-400 font-bold">1 1 1 1 1 1 1 1 1</span>
                  </td>
                </tr>

                {/* 10 Nibble Rows */}
                {em4100Data.nibbles.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2 px-3 text-left font-sans text-slate-400">
                      Nibble {idx + 1} {idx < 2 ? '(ID Cliente)' : '(Serial)'}
                    </td>
                    <td className="py-2 px-3 font-bold text-white bg-slate-950/50">
                      {row.hexChar}
                    </td>
                    {row.bits.map((b, bIdx) => (
                      <td key={bIdx} className={`py-2 px-3 font-bold ${b === 1 ? 'text-cyan-400' : 'text-slate-600'}`}>
                        {b}
                      </td>
                    ))}
                    <td className="py-2 px-3 font-bold text-amber-300 bg-amber-950/30 border-l border-slate-800">
                      {row.parityBit}
                    </td>
                  </tr>
                ))}

                {/* Column Parity Row */}
                <tr className="bg-amber-950/20 border-t-2 border-amber-500/40 text-amber-300 font-bold">
                  <td colSpan={2} className="py-2.5 px-3 text-left font-sans">
                    Paridad Columna (Even):
                  </td>
                  {em4100Data.colParities.map((cp, cpIdx) => (
                    <td key={cpIdx} className="py-2.5 px-3">
                      {cp}
                    </td>
                  ))}
                  <td className="py-2.5 px-3 text-slate-400 bg-slate-900 border-l border-slate-800 font-sans text-[11px]">
                    Stop: <span className="font-mono font-bold text-white">0</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Full Frame Bitstream String */}
          <div className="space-y-1.5 pt-2">
            <span className="text-xs font-bold text-slate-300 font-mono">Trama completa generada (64 bits crudos):</span>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 break-all select-all tracking-wider">
              {em4100Data.frame64}
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: WIEGAND 26-BIT FORMAT */}
      {mode === 'WIEGAND26' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400" /> Desglose Wiegand 26 Bits (H10301)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Protocolo corporativo: Bit 1 (Paridad Par) + Bits 2-9 (Facility Code) + Bits 10-25 (Card ID) + Bit 26 (Paridad Impar).
            </p>
          </div>

          {/* Decoded Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 block font-mono">FACILITY CODE (Código de Edificio):</span>
              <span className="text-cyan-400 font-bold text-2xl font-mono">{wiegandData.fc}</span>
              <span className="text-[11px] text-slate-500 block">8 bits (Rango 0 - 255)</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 block font-mono">CARD NUMBER (ID Empleado / Usuario):</span>
              <span className="text-emerald-400 font-bold text-2xl font-mono">{wiegandData.cn}</span>
              <span className="text-[11px] text-slate-500 block">16 bits (Rango 0 - 65,535)</span>
            </div>
          </div>

          {/* Parity Calculation Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-cyan-400">Bit 1: Paridad Par (Even)</span>
                <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold text-sm">
                  {wiegandData.leadingEvenParity}
                </span>
              </div>
              <p className="text-slate-400 text-[11px] font-sans">
                Calculado sobre los primeros 12 bits de datos (FC + primeros 4 bits de CN). Si la suma de 1s es par, da 0; si es impar, da 1.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-amber-400">Bit 26: Paridad Impar (Odd)</span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-sm">
                  {wiegandData.trailingOddParity}
                </span>
              </div>
              <p className="text-slate-400 text-[11px] font-sans">
                Calculado sobre los últimos 12 bits de datos (últimos 12 bits de CN). Si la suma de 1s es par, da 1; si es impar, da 0.
              </p>
            </div>
          </div>

          {/* Bitstream */}
          <div className="space-y-1.5 pt-2">
            <span className="text-xs font-bold text-slate-300 font-mono">Secuencia completa de 26 bits:</span>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-white break-all flex flex-wrap gap-1">
              <span className="text-cyan-400 font-bold underline" title="Paridad Par">{wiegandData.leadingEvenParity}</span>
              <span className="text-slate-300 tracking-widest">{wiegandData.full26Bits.slice(1, 25)}</span>
              <span className="text-amber-400 font-bold underline" title="Paridad Impar">{wiegandData.trailingOddParity}</span>
            </div>
          </div>
        </div>
      )}

      {/* MODE 3: ISO 14443-A ODD PARITY PER BYTE */}
      {mode === 'ISO14443A' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" /> Paridad Impar ISO 14443-A (9 bits por byte en el aire)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              En radio HF (13.56 MHz), cada byte de 8 bits se transmite acompañado de 1 bit de paridad impar (Odd Parity).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {iso14443AData.map((d, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2">
                <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">Byte {idx + 1}:</span>
                  <span className="text-cyan-400 font-bold text-sm">0x{d.hex}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500 text-[10px] block">BITS (MSB ➔ LSB):</span>
                  <span className="text-slate-200 tracking-wider font-bold block">{d.bits.join('')}</span>
                </div>

                <div className="flex justify-between items-center pt-1 border-t border-slate-800/80">
                  <span className="text-slate-400 text-[11px]">Bit Paridad Impar:</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                    {d.oddParity}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Cryptographic Security Tip: Darkside Parity Leakage */}
          <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs space-y-1.5">
            <h4 className="font-bold text-purple-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> ¿Por qué es crucial en Ciberseguridad? (Ataque Darkside)
            </h4>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              En las tarjetas <strong>MIFARE Classic</strong>, cuando el algoritmo Crypto-1 está activo, los bits de paridad también están cifrados con el keystream. Sin embargo, en el ataque <strong>Darkside (Courtois 2009)</strong>, cuando el atacante envía una autenticación incorrecta, la tarjeta responde con un NACK que filtra los bits de paridad. Esto permitió revertir el generador PRNG y recuperar la primera clave de la tarjeta en pocos segundos sin conocer ninguna clave previa.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
