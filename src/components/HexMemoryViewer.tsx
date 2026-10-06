import React, { useState } from 'react';
import { Eye, Shield, Key, FileText, CheckCircle2 } from 'lucide-react';

interface SectorData {
  sector: number;
  keyA: string;
  accessBits: string;
  keyB: string;
  blocks: string[];
  isDefaultKey: boolean;
}

interface HexMemoryViewerProps {
  sectors: SectorData[];
  revealedKeys: Record<string, boolean>; // key format "sector-A" or "sector-B"
}

export const HexMemoryViewer: React.FC<HexMemoryViewerProps> = ({
  sectors,
  revealedKeys
}) => {
  const [selectedBlockInfo, setSelectedBlockInfo] = useState<string | null>(null);

  // Helper to convert hex pairs to ASCII
  const hexToAscii = (hexStr: string) => {
    const cleaned = hexStr.replace(/\s+/g, '');
    let ascii = '';
    for (let i = 0; i < cleaned.length; i += 2) {
      const part = cleaned.substr(i, 2);
      const code = parseInt(part, 16);
      if (code >= 32 && code <= 126) {
        ascii += String.fromCharCode(code);
      } else {
        ascii += '.';
      }
    }
    return ascii;
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl font-mono text-xs">
      {/* Header bar */}
      <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
          </div>
          <span className="text-slate-300 font-semibold text-xs ml-2">MIFARE Classic 1K — Mapa de Memoria Hexadecimal</span>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500/30 border border-emerald-400 inline-block"></span> UID (Bloque 0)
          </span>
          <span className="flex items-center gap-1 text-cyan-400">
            <span className="w-2.5 h-2.5 rounded bg-cyan-500/30 border border-cyan-400 inline-block"></span> Datos / ASCII
          </span>
          <span className="flex items-center gap-1 text-amber-400">
            <span className="w-2.5 h-2.5 rounded bg-amber-500/30 border border-amber-400 inline-block"></span> Key A / B
          </span>
          <span className="flex items-center gap-1 text-purple-400">
            <span className="w-2.5 h-2.5 rounded bg-purple-500/30 border border-purple-400 inline-block"></span> Access Bits
          </span>
        </div>
      </div>

      {/* Hex grid */}
      <div className="p-4 overflow-x-auto max-h-[460px] overflow-y-auto divide-y divide-slate-900">
        {sectors.map((sec) => {
          const isKeyARevealed = revealedKeys[`${sec.sector}-A`] || sec.isDefaultKey;
          const isKeyBRevealed = revealedKeys[`${sec.sector}-B`] || sec.isDefaultKey;

          return (
            <div key={sec.sector} className="py-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold text-[11px]">
                    Sector {sec.sector}
                  </span>
                  <span className={`text-[11px] px-2 py-0.5 rounded flex items-center gap-1 ${
                    sec.isDefaultKey ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}>
                    {sec.isDefaultKey ? '⚠️ Clave de fábrica por defecto' : '🔒 Clave personalizada'}
                  </span>
                </div>
                <span className="text-slate-500 text-[10px]">Bloques {sec.sector * 4} - {sec.sector * 4 + 3}</span>
              </div>

              <div className="space-y-1">
                {sec.blocks.map((blkHex, idx) => {
                  const absoluteBlockNum = sec.sector * 4 + idx;
                  const isBlock0 = absoluteBlockNum === 0;
                  const isTrailer = idx === 3;
                  const ascii = hexToAscii(blkHex);

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        if (isBlock0) setSelectedBlockInfo(`Bloque 0: Contiene UID del fabricante (${blkHex.substring(0, 11)}) y datos ATQA/SAK. En tarjetas estándar es de solo lectura; en tarjetas mágicas Gen1a/Gen2 es escribible.`);
                        else if (isTrailer) setSelectedBlockInfo(`Bloque ${absoluteBlockNum} (Sector Trailer): Contiene Key A (6 bytes), Access Bits (4 bytes) y Key B (6 bytes). Controla permisos de lectura y escritura del sector.`);
                        else setSelectedBlockInfo(`Bloque ${absoluteBlockNum} (Datos): Almacena información en bruto o bloques de valor (saldo, habitaciones, identificadores de empleado). ASCII: "${ascii.trim()}".`);
                      }}
                      className={`grid grid-cols-12 gap-2 p-1.5 rounded transition-colors cursor-pointer hover:bg-slate-900/80 items-center ${
                        isBlock0 ? 'bg-emerald-950/20 border-l-2 border-emerald-500' :
                        isTrailer ? 'bg-amber-950/20 border-l-2 border-amber-500' :
                        'border-l-2 border-transparent'
                      }`}
                    >
                      <div className="col-span-1 text-slate-500 text-[11px]">
                        [{absoluteBlockNum < 10 ? `0${absoluteBlockNum}` : absoluteBlockNum}]
                      </div>

                      {/* Hex Data representation */}
                      <div className="col-span-8 flex flex-wrap gap-1 font-mono tracking-wider">
                        {isTrailer ? (
                          <>
                            <span className="text-amber-400 font-semibold">
                              {isKeyARevealed ? sec.keyA : '?? ?? ?? ?? ?? ??'}
                            </span>
                            <span className="text-purple-400 font-semibold ml-1">
                              {sec.accessBits}
                            </span>
                            <span className="text-amber-300 font-semibold ml-1">
                              {isKeyBRevealed ? sec.keyB : '?? ?? ?? ?? ?? ??'}
                            </span>
                          </>
                        ) : isBlock0 ? (
                          <>
                            <span className="text-emerald-400 font-bold">{blkHex.substring(0, 11)}</span>
                            <span className="text-slate-400">{blkHex.substring(12)}</span>
                          </>
                        ) : (
                          <span className="text-cyan-300">{blkHex}</span>
                        )}
                      </div>

                      {/* ASCII preview */}
                      <div className="col-span-3 text-slate-400 text-right truncate text-[11px] select-none">
                        |{ascii}|
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Info footer */}
      {selectedBlockInfo && (
        <div className="p-3 bg-slate-900 border-t border-slate-800 text-slate-300 text-xs flex items-start gap-2">
          <Eye className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <p>{selectedBlockInfo}</p>
        </div>
      )}
    </div>
  );
};
