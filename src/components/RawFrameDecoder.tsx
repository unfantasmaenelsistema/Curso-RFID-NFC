import React, { useState, useMemo } from 'react';
import { 
  Terminal, Check, Copy, RotateCcw, AlertTriangle, CheckCircle2, 
  Sparkles, Layers, Radio, Cpu, HelpCircle, Info, ArrowRight, 
  Search, ShieldAlert, ShieldCheck, Binary, Sliders, ExternalLink, Code
} from 'lucide-react';

export type ProtocolType = 'ISO14443A' | 'ISO14443B' | 'ISO15693';

export interface FramePreset {
  id: string;
  name: string;
  protocol: ProtocolType;
  hex: string;
  isShortFrame?: boolean;
  hasCrcIncluded: boolean;
  explanation: string;
  commandName: string;
  sender: 'Reader (PCD)' | 'Tag (PICC)';
}

export const PRESET_FRAMES: FramePreset[] = [
  {
    id: 'reqa',
    name: 'REQA (Request A - Despertar Tarjetas)',
    protocol: 'ISO14443A',
    hex: '26',
    isShortFrame: true,
    hasCrcIncluded: false,
    explanation: 'Trama corta de 7 bits enviada por el lector para despertar tarjetas en estado IDLE en el campo RF. No lleva CRC por norma ISO.',
    commandName: 'REQA (Request Command)',
    sender: 'Reader (PCD)'
  },
  {
    id: 'wupa',
    name: 'WUPA (Wake-Up A - Despertar Forzado)',
    protocol: 'ISO14443A',
    hex: '52',
    isShortFrame: true,
    hasCrcIncluded: false,
    explanation: 'Despierta todas las tarjetas presentes, incluidas aquellas en estado HALT que ya fueron leídas previamente.',
    commandName: 'WUPA (Wake-Up Command)',
    sender: 'Reader (PCD)'
  },
  {
    id: 'anticoll-cl1',
    name: 'Anticolisión Cascada 1 (Petición de UID)',
    protocol: 'ISO14443A',
    hex: '93 20',
    isShortFrame: false,
    hasCrcIncluded: false,
    explanation: 'El lector solicita que todas las tarjetas transmitan los primeros 4 bytes de su identificador UID para resolver colisiones.',
    commandName: 'ANTICOLLISION Cascade Level 1 (NVB 0x20)',
    sender: 'Reader (PCD)'
  },
  {
    id: 'select-cl1',
    name: 'SELECT Cascade 1 con UID & BCC',
    protocol: 'ISO14443A',
    hex: '93 70 8F C2 34 1A 61 28 07',
    isShortFrame: false,
    hasCrcIncluded: true,
    explanation: 'El lector selecciona formalmente la tarjeta con UID [8F C2 34 1A], byte de paridad BCC [61] y CRC_A [28 07].',
    commandName: 'SELECT Cascade Level 1 (NVB 0x70)',
    sender: 'Reader (PCD)'
  },
  {
    id: 'sak-mifare',
    name: 'SAK (Respuesta Select Acknowledge)',
    protocol: 'ISO14443A',
    hex: '08 B6 DD',
    isShortFrame: false,
    hasCrcIncluded: true,
    explanation: 'Respuesta del chip tras el SELECT. El byte 0x08 identifica un chip MIFARE Classic 1K con UID de 4 bytes, seguido de CRC_A [B6 DD].',
    commandName: 'SAK (Select Acknowledge)',
    sender: 'Tag (PICC)'
  },
  {
    id: 'auth-sector-1',
    name: 'Auth Key A en Sector 1 (MIFARE Classic)',
    protocol: 'ISO14443A',
    hex: '60 04 F1 E2',
    isShortFrame: false,
    hasCrcIncluded: true,
    explanation: 'Comando 0x60 (Autenticación con Clave A) para acceder al Bloque 0x04 (Sector 1) protegido por CRC_A [F1 E2].',
    commandName: 'AUTH_A (Authentication Command)',
    sender: 'Reader (PCD)'
  },
  {
    id: 'read-block-4',
    name: 'READ Bloque 4 de Datos (16 Bytes)',
    protocol: 'ISO14443A',
    hex: '30 04 26 15',
    isShortFrame: false,
    hasCrcIncluded: true,
    explanation: 'Comando 0x30 (Lectura de memoria) sobre el bloque 0x04 con verificación CRC_A [26 15].',
    commandName: 'MIFARE READ Command',
    sender: 'Reader (PCD)'
  },
  {
    id: 'apdu-select-aid',
    name: 'APDU ISO 7816-4: SELECT Application',
    protocol: 'ISO14443A',
    hex: '00 A4 04 00 07 D2 76 00 00 85 01 01 00 35 F4',
    isShortFrame: false,
    hasCrcIncluded: true,
    explanation: 'Trama APDU de alto nivel encapsulada para seleccionar la aplicación NDEF de NFC Forum Type 4 en un chip DESFire o smartphone.',
    commandName: 'APDU SELECT FILE / AID',
    sender: 'Reader (PCD)'
  }
];

// ISO/IEC 14443-A CRC-16 Calculation
export function calculateCrcA(dataBytes: number[]): { low: number; high: number; hexStr: string; integerVal: number } {
  let wcrc = 0x6363; // Preset value for ISO 14443-A
  for (let i = 0; i < dataBytes.length; i++) {
    let byte = dataBytes[i];
    byte = (byte ^ (wcrc & 0x00FF)) & 0xFF;
    byte = (byte ^ ((byte << 4) & 0xFF)) & 0xFF;
    wcrc = ((wcrc >> 8) ^ (byte << 8) ^ (byte << 3) ^ ((byte >> 4) & 0x0F)) & 0xFFFF;
  }
  const low = wcrc & 0xFF;
  const high = (wcrc >> 8) & 0xFF;
  const hexStr = `${low.toString(16).padStart(2, '0').toUpperCase()} ${high.toString(16).padStart(2, '0').toUpperCase()}`;
  return { low, high, hexStr, integerVal: wcrc };
}

// ISO/IEC 14443-B CRC-16 Calculation
export function calculateCrcB(dataBytes: number[]): { low: number; high: number; hexStr: string; integerVal: number } {
  let wcrc = 0xFFFF; // Preset value for ISO 14443-B
  for (let i = 0; i < dataBytes.length; i++) {
    let byte = dataBytes[i];
    byte = (byte ^ (wcrc & 0x00FF)) & 0xFF;
    byte = (byte ^ ((byte << 4) & 0xFF)) & 0xFF;
    wcrc = ((wcrc >> 8) ^ (byte << 8) ^ (byte << 3) ^ ((byte >> 4) & 0x0F)) & 0xFFFF;
  }
  wcrc = (~wcrc) & 0xFFFF; // Invert output
  const low = wcrc & 0xFF;
  const high = (wcrc >> 8) & 0xFF;
  const hexStr = `${low.toString(16).padStart(2, '0').toUpperCase()} ${high.toString(16).padStart(2, '0').toUpperCase()}`;
  return { low, high, hexStr, integerVal: wcrc };
}

export const RawFrameDecoder: React.FC = () => {
  const [protocol, setProtocol] = useState<ProtocolType>('ISO14443A');
  const [hexInput, setHexInput] = useState<string>('93 70 8F C2 34 1A 61 28 07');
  const [hasCrcIncluded, setHasCrcIncluded] = useState<boolean>(true);
  const [isShortFrame, setIsShortFrame] = useState<boolean>(false);
  const [activePresetId, setActivePresetId] = useState<string>('select-cl1');
  const [selectedByteIndex, setSelectedByteIndex] = useState<number | null>(0);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Sanitize hex string into clean byte array
  const rawCleanHex = useMemo(() => {
    return hexInput.replace(/[^0-9a-fA-F]/g, '').toUpperCase();
  }, [hexInput]);

  const parsedBytes = useMemo(() => {
    const bytes: number[] = [];
    for (let i = 0; i < rawCleanHex.length; i += 2) {
      if (i + 1 < rawCleanHex.length) {
        bytes.push(parseInt(rawCleanHex.substr(i, 2), 16));
      }
    }
    return bytes;
  }, [rawCleanHex]);

  // Handle preset selection
  const handleSelectPreset = (p: FramePreset) => {
    setActivePresetId(p.id);
    setProtocol(p.protocol);
    setHexInput(p.hex);
    setHasCrcIncluded(p.hasCrcIncluded);
    setIsShortFrame(!!p.isShortFrame);
    setSelectedByteIndex(0);
  };

  // Frame Decomposition logic: Preamble, SOF, Payload, CRC, EOF
  const frameAnalysis = useMemo(() => {
    const totalBytesCount = parsedBytes.length;

    // Check if short frame (e.g., REQA 0x26 or WUPA 0x52)
    if (isShortFrame || (totalBytesCount === 1 && (parsedBytes[0] === 0x26 || parsedBytes[0] === 0x52))) {
      return {
        isShort: true,
        preamble: 'Portadora no modulada de 13.56 MHz continua',
        sof: 'Modulación al 100% (Pausa de duración ~2-3 µs sin subportadora)',
        payloadBytes: parsedBytes,
        crcBytes: [],
        eof: 'Nivel lógico alto (Fin de transmisión de 7 bits)',
        expectedCrc: null,
        isCrcValid: true,
        commandSemantic: parsedBytes[0] === 0x26 ? 'REQA (Request Standard)' : 'WUPA (Wake-Up All)',
        description: 'Trama corta de 7 bits utilizada exclusivamente durante la fase de activación y anticolisión. No incluye CRC-16.'
      };
    }

    // Standard frame with payload and optional trailing 2-byte CRC
    let payload: number[] = [];
    let crc: number[] = [];

    if (hasCrcIncluded && totalBytesCount >= 3) {
      // Last 2 bytes are treated as CRC-16
      payload = parsedBytes.slice(0, totalBytesCount - 2);
      crc = parsedBytes.slice(totalBytesCount - 2);
    } else {
      payload = [...parsedBytes];
      crc = [];
    }

    // Calculate expected CRC over payload
    const expectedCrcObj = protocol === 'ISO14443A' ? calculateCrcA(payload) : calculateCrcB(payload);
    
    let isCrcValid = false;
    if (crc.length === 2) {
      isCrcValid = crc[0] === expectedCrcObj.low && crc[1] === expectedCrcObj.high;
    }

    // Semantic analysis of first command byte
    let cmdTitle = 'Comando Desconocido / Datos Propietarios';
    if (payload.length > 0) {
      const firstByte = payload[0];
      if (firstByte === 0x93 || firstByte === 0x95 || firstByte === 0x97) {
        const cascadeLevel = firstByte === 0x93 ? '1' : firstByte === 0x95 ? '2' : '3';
        const nvb = payload[1] ? `(NVB 0x${payload[1].toString(16).toUpperCase()})` : '';
        cmdTitle = `ANTICOLLISION / SELECT Cascade Level ${cascadeLevel} ${nvb}`;
      } else if (firstByte === 0x60 || firstByte === 0x61) {
        cmdTitle = `MIFARE AUTH (${firstByte === 0x60 ? 'Clave A' : 'Clave B'}) en Bloque 0x${payload[1]?.toString(16).toUpperCase() || '?'}`;
      } else if (firstByte === 0x30) {
        cmdTitle = `MIFARE READ (Lectura Bloque 0x${payload[1]?.toString(16).toUpperCase() || '?'})`;
      } else if (firstByte === 0xA0) {
        cmdTitle = `MIFARE WRITE (Escritura Bloque 0x${payload[1]?.toString(16).toUpperCase() || '?'})`;
      } else if (firstByte === 0xE0) {
        cmdTitle = 'RATS (Request for Answer To Select - ISO 14443-4)';
      } else if (firstByte === 0x00 && payload[1] === 0xA4) {
        cmdTitle = 'APDU SELECT (ISO 7816-4)';
      } else if (firstByte === 0x08 && payload.length === 1) {
        cmdTitle = 'SAK (Select Acknowledge - MIFARE Classic 1K)';
      } else if (firstByte === 0x00 && payload[1] === 0x04) {
        cmdTitle = 'ATQA (Answer To Request A - UID 4 Bytes)';
      }
    }

    return {
      isShort: false,
      preamble: 'Portadora continua de 13.56 MHz estabilizada',
      sof: protocol === 'ISO14443A' ? 'Start Bit (Pausa de modulación al 100% OOK)' : 'Flanco de bajada + subportadora 848 kHz',
      payloadBytes: payload,
      crcBytes: crc,
      eof: 'Stop Bit + restablecimiento de campo continuo',
      expectedCrc: expectedCrcObj,
      isCrcValid: crc.length === 2 ? isCrcValid : null,
      commandSemantic: cmdTitle,
      description: 'Trama estándar ISO encapsulada con bytes de control y CRC.'
    };
  }, [parsedBytes, isShortFrame, hasCrcIncluded, protocol]);

  // Proxmark3 command recommendation
  const proxmarkCommand = useMemo(() => {
    const hexSpaced = parsedBytes.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join('');
    if (frameAnalysis.isShort) {
      return `hf 14a raw -s ${hexSpaced}`;
    }
    if (hasCrcIncluded) {
      return `hf 14a raw -c ${hexSpaced.slice(0, -4)}`;
    }
    return `hf 14a raw -c ${hexSpaced}`;
  }, [parsedBytes, frameAnalysis.isShort, hasCrcIncluded]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const selectedByteValue = selectedByteIndex !== null && parsedBytes[selectedByteIndex] !== undefined
    ? parsedBytes[selectedByteIndex]
    : null;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="max-w-4xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Binary className="w-3.5 h-3.5 animate-pulse" /> Decodificador de Capa Física y Enlace NFC
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Decodificador de Tramas en Bruto (Raw Frame Decoder)
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Descompón cualquier cadena hexadecimal capturada por un sniffer o Proxmark3 en sus componentes de bajo nivel: <strong>Preámbulo, SOF (Start of Frame), Carga Útil (Payload), Paridad Impar, CRC-16 y EOF (End of Frame)</strong>. Comprende qué viaja exactamente por el aire entre el lector y la tarjeta.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <div className="text-xs font-mono text-slate-400 mb-3 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Ejemplos de tramas reales del protocolo ISO 14443-A:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {PRESET_FRAMES.map((preset) => {
              const isSelected = activePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-slate-800 border-emerald-500 ring-1 ring-emerald-500/40 text-white shadow-md'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-bold text-white line-clamp-1">{preset.name.split('(')[0]}</span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">{preset.sender.split(' ')[0]}</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 truncate">{preset.hex}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Input Configuration & Interactive Editor */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Code className="w-4 h-4 text-cyan-400" /> Entrada de Trama Hexadecimal
            </h3>
            <span className="text-xs text-slate-400">
              Introduce una secuencia de bytes en formato hexadecimal (ej. 93 70 8F C2 34 1A 61 28 07)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={hasCrcIncluded}
                onChange={(e) => setHasCrcIncluded(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0"
              />
              <span>Los últimos 2 bytes son CRC</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isShortFrame}
                onChange={(e) => setIsShortFrame(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0"
              />
              <span>Trama corta (7 bits)</span>
            </label>
          </div>
        </div>

        {/* Text Input */}
        <div className="space-y-2">
          <div className="relative">
            <input
              type="text"
              value={hexInput}
              onChange={(e) => {
                setHexInput(e.target.value);
                setActivePresetId('');
              }}
              placeholder="Introduce bytes hexadecimales separados por espacio..."
              className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl py-3 px-4 text-base font-mono text-emerald-400 font-bold focus:outline-none focus:border-emerald-500 shadow-inner"
            />
            <div className="absolute right-3 top-3 text-xs font-mono text-slate-500">
              {parsedBytes.length} {parsedBytes.length === 1 ? 'Byte' : 'Bytes'}
            </div>
          </div>
        </div>

        {/* Visual Frame Anatomy Ribbon */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-400" /> Anatomía Visual de la Trama de Radio
            </span>
            <span>Haz clic en cualquier byte para inspeccionar sus bits</span>
          </div>

          {/* Animated Ribbon */}
          <div className="flex flex-wrap items-center gap-2 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 overflow-x-auto">
            {/* Preamble Block */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center shrink-0 min-w-[100px]">
              <span className="text-[10px] font-bold text-slate-500 uppercase font-mono block">Preámbulo</span>
              <span className="text-xs font-mono text-slate-300 font-bold">13.56 MHz</span>
              <span className="text-[9px] text-slate-500 block mt-0.5">Portadora CW</span>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />

            {/* SOF Block */}
            <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-center shrink-0 min-w-[90px]">
              <span className="text-[10px] font-bold text-cyan-400 uppercase font-mono block">SOF</span>
              <span className="text-xs font-mono text-cyan-300 font-bold">Start Bit</span>
              <span className="text-[9px] text-cyan-500 block mt-0.5">Pausa OOK</span>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />

            {/* Payload Bytes */}
            <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-950 border border-emerald-500/30 shrink-0">
              <span className="text-[10px] font-bold text-emerald-400 uppercase font-mono px-2 py-0.5 block">
                Carga Útil ({frameAnalysis.payloadBytes.length}B):
              </span>
              {frameAnalysis.payloadBytes.map((byteVal, idx) => {
                const isSelected = selectedByteIndex === idx;
                const hexStr = byteVal.toString(16).padStart(2, '0').toUpperCase();
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedByteIndex(idx)}
                    className={`px-3 py-2 rounded-lg font-mono font-extrabold text-sm transition-all ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 scale-105'
                        : 'bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800'
                    }`}
                    title={`Byte ${idx}: 0x${hexStr}`}
                  >
                    {hexStr}
                  </button>
                );
              })}
            </div>

            {/* CRC Bytes (if present) */}
            {frameAnalysis.crcBytes.length === 2 && (
              <>
                <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
                <div className={`flex items-center gap-1.5 p-1.5 rounded-xl border shrink-0 ${
                  frameAnalysis.isCrcValid 
                    ? 'bg-purple-950/40 border-purple-500/40' 
                    : 'bg-rose-950/40 border-rose-500/40'
                }`}>
                  <span className={`text-[10px] font-bold uppercase font-mono px-2 py-0.5 block ${
                    frameAnalysis.isCrcValid ? 'text-purple-400' : 'text-rose-400'
                  }`}>
                    CRC-16 ({frameAnalysis.isCrcValid ? 'Válido' : 'Inválido'}):
                  </span>
                  {frameAnalysis.crcBytes.map((crcByte, cIdx) => {
                    const globalIdx = frameAnalysis.payloadBytes.length + cIdx;
                    const isSelected = selectedByteIndex === globalIdx;
                    return (
                      <button
                        key={cIdx}
                        onClick={() => setSelectedByteIndex(globalIdx)}
                        className={`px-3 py-2 rounded-lg font-mono font-extrabold text-sm transition-all ${
                          isSelected
                            ? 'bg-purple-500 text-slate-950 shadow-md scale-105'
                            : 'bg-slate-900 text-purple-300 border border-purple-500/30'
                        }`}
                      >
                        {crcByte.toString(16).padStart(2, '0').toUpperCase()}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />

            {/* EOF Block */}
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-center shrink-0 min-w-[90px]">
              <span className="text-[10px] font-bold text-amber-400 uppercase font-mono block">EOF</span>
              <span className="text-xs font-mono text-amber-300 font-bold">Stop Bit</span>
              <span className="text-[9px] text-amber-500 block mt-0.5">Fin de Trama</span>
            </div>
          </div>
        </div>

        {/* Two-column Detail Breakdown: Byte Inspector & Semantic Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Left Column: Bit-level and Parity Inspector */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="flex items-center gap-2">
                <Binary className="w-4 h-4 text-cyan-400" />
                Inspección de Bits & Paridad Impar (Odd Parity)
              </span>
              {selectedByteValue !== null && (
                <span className="font-mono text-xs text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                  Byte [{selectedByteIndex}]: 0x{selectedByteValue.toString(16).padStart(2, '0').toUpperCase()} ({selectedByteValue})
                </span>
              )}
            </h4>

            {selectedByteValue !== null ? (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>Representación en 8 bits (LSB first en el aire):</span>
                    <span className="text-emerald-400 font-bold">
                      {selectedByteValue.toString(2).padStart(8, '0')}
                    </span>
                  </div>

                  {/* Visual Bit Grid */}
                  <div className="grid grid-cols-9 gap-1 text-center pt-1">
                    {[7, 6, 5, 4, 3, 2, 1, 0].map((bitIdx) => {
                      const bitVal = (selectedByteValue >> bitIdx) & 1;
                      return (
                        <div key={bitIdx} className="p-2 rounded bg-slate-900 border border-slate-800">
                          <span className="text-[9px] text-slate-500 block">b{bitIdx}</span>
                          <span className={`font-bold text-xs ${bitVal ? 'text-emerald-400' : 'text-slate-400'}`}>
                            {bitVal}
                          </span>
                        </div>
                      );
                    })}
                    {/* 9th bit: Odd Parity bit */}
                    {(() => {
                      // Calculate odd parity (number of 1s in byte + parity bit = odd)
                      const onesCount = selectedByteValue.toString(2).split('1').length - 1;
                      const oddParityBit = onesCount % 2 === 0 ? 1 : 0;
                      return (
                        <div className="p-2 rounded bg-indigo-950 border border-indigo-500/40">
                          <span className="text-[9px] text-indigo-300 block font-bold">P</span>
                          <span className="font-bold text-xs text-cyan-300">{oddParityBit}</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
                  <span className="font-bold text-cyan-400 flex items-center gap-1.5 text-[11px]">
                    <Info className="w-3.5 h-3.5" /> ¿Cómo viaja este byte por la radio?
                  </span>
                  <p className="text-[11px] text-slate-400">
                    En ISO 14443-A, cada byte de 8 bits se transmite enviando primero el bit menos significativo (b0 hasta b7). Inmediatamente después del bit 7, el hardware inyecta un <strong>bit de paridad impar</strong> para que el receptor descarte la trama si hubo ruido electromagnético.
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 font-mono">Selecciona un byte de la trama para inspeccionarlo.</p>
            )}
          </div>

          {/* Right Column: CRC Analysis & Proxmark3 Command */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                Control de Integridad CRC-16 ({protocol})
              </span>
              {frameAnalysis.isCrcValid !== null && (
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                  frameAnalysis.isCrcValid 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                }`}>
                  {frameAnalysis.isCrcValid ? 'CRC VÁLIDO' : 'CRC INCORRECTO'}
                </span>
              )}
            </h4>

            {/* Semantic Command Identification */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
              <span className="text-slate-400 text-[10px] uppercase font-mono font-bold block">
                Interpretación Semántica del Protocolo:
              </span>
              <p className="text-white font-bold text-sm">
                {frameAnalysis.commandSemantic}
              </p>
              <p className="text-slate-400 text-[11px]">
                {frameAnalysis.description}
              </p>
            </div>

            {/* Expected vs Actual CRC */}
            {frameAnalysis.expectedCrc && (
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-500 text-[10px] block">CRC CALCULADO:</span>
                  <span className="text-emerald-400 font-bold text-sm">
                    {frameAnalysis.expectedCrc.hexStr}
                  </span>
                  <span className="text-[10px] text-slate-500 block">Preset: 0x6363</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-500 text-[10px] block">CRC EN TRAMA:</span>
                  <span className={`font-bold text-sm ${frameAnalysis.isCrcValid ? 'text-purple-400' : 'text-rose-400'}`}>
                    {frameAnalysis.crcBytes.length === 2 
                      ? frameAnalysis.crcBytes.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')
                      : 'No incluido'}
                  </span>
                  <span className="text-[10px] text-slate-500 block">Últimos 2 bytes</span>
                </div>
              </div>
            )}

            {/* Copyable Proxmark3 Command */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 font-mono text-xs">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Comando Proxmark3 para inyectar esta trama:</span>
                <button
                  onClick={() => handleCopy(proxmarkCommand, 'pm3')}
                  className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold"
                >
                  {copiedText === 'pm3' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedText === 'pm3' ? '¡Copiado!' : 'Copiar'}</span>
                </button>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800 text-cyan-300 font-bold select-all text-[11px]">
                pm3 --&gt; {proxmarkCommand}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
