import React, { useState, useMemo } from 'react';
import { 
  Key, Download, Copy, Check, Sparkles, ShieldAlert, Terminal, 
  RotateCcw, Sliders, FileText, CheckCircle2, Clock, AlertTriangle, Cpu, Layers 
} from 'lucide-react';

export const FACTORY_KEYS = [
  'FFFFFFFFFFFF', // Clave universal de fábrica NXP
  'A0A1A2A3A4A5', // Clave estándar de transporte A
  'B0B1B2B3B4B5', // Clave estándar de transporte B
  'D3F7D3F7D3F7', // NFC Forum Mad Key (Directory Sector 0)
  '000000000000', // Ceros de fábrica
  'A0B0C0D0E0F0', // Secuencia ascendente par
  'A1B1C1D1E1F1', // Secuencia ascendente impar
  '1A2B3C4D5E6F', // Alternancia hex
  '123456789ABC', // Incremental estándar
  '010203040506', // Bytes secuenciales
  '112233445566', // Pares repetidos
  '4D3A99C351DD', // Clave común de tornos de transporte
  '1A982C7E459A', // Clave común vending
  'AA55AA55AA55', // Patrón binario alternante
  '55AA55AA55AA',
  '714C5C886E97', // Tarjetas universitarias heredadas
  '587EE5F9350F'  // Sistemas de parking europeos
];

export const WordlistGenerator: React.FC = () => {
  const [includeFactoryKeys, setIncludeFactoryKeys] = useState(true);
  const [includeSequential, setIncludeSequential] = useState(true);
  const [includeRepeatedNibbles, setIncludeRepeatedNibbles] = useState(true);
  const [includeUidDerivations, setIncludeUidDerivations] = useState(true);
  const [targetUid, setTargetUid] = useState('A3 B4 2C 19');
  const [includeDates, setIncludeDates] = useState(true);
  const [customPrefix, setCustomPrefix] = useState('');
  const [customRangeCount, setCustomRangeCount] = useState(16);
  const [copied, setCopied] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pm3' | 'mct'>('pm3');

  // Sanitize UID
  const cleanUid = useMemo(() => {
    return targetUid.replace(/[^0-9a-fA-F]/g, '').toUpperCase();
  }, [targetUid]);

  // Generate wordlist dynamically based on toggles
  const generatedKeys = useMemo(() => {
    const keySet = new Set<string>();

    // 1. Factory default keys
    if (includeFactoryKeys) {
      FACTORY_KEYS.forEach(k => keySet.add(k.toUpperCase()));
    }

    // 2. Sequential & Common numeric patterns
    if (includeSequential) {
      const seqPatterns = [
        '000000000001', '000000000002', '000000000003',
        '123456123456', '654321654321', '000102030405',
        '010203010203', '987654321012', '111111111111',
        '222222222222', '333333333333', '444444444444',
        '555555555555', '666666666666', '777777777777',
        '888888888888', '999999999999', 'AAAAAAAAAAAA',
        'BBBBBBBBBBBB', 'CCCCCCCCCCCC', 'DDDDDDDDDDDD',
        'EEEEEEEEEEEE'
      ];
      seqPatterns.forEach(k => keySet.add(k));
    }

    // 3. Repeated Nibbles / Byte patterns
    if (includeRepeatedNibbles) {
      const bytesToRepeat = ['00', '11', '22', '33', '44', '55', 'AA', 'BB', 'CC', 'FF', 'A0', 'B0', '1A', '2B'];
      bytesToRepeat.forEach(b => {
        keySet.add(b.repeat(6)); // 12 hex chars
      });
    }

    // 4. UID-based Derivations (common in weak proprietary systems)
    if (includeUidDerivations && cleanUid.length >= 8) {
      const uid4 = cleanUid.slice(0, 8); // 4 bytes = 8 hex chars
      // UID + 0000
      keySet.add(uid4 + '0000');
      // 0000 + UID
      keySet.add('0000' + uid4);
      // UID + FFFF
      keySet.add(uid4 + 'FFFF');
      // FFFF + UID
      keySet.add('FFFF' + uid4);
      // Inverted UID + 0000
      const revUid = (uid4.match(/../g) || []).reverse().join('');
      keySet.add(revUid + '0000');
      keySet.add('0000' + revUid);
      // Repeated first 2 bytes
      const first2Bytes = uid4.slice(0, 4);
      keySet.add(first2Bytes.repeat(3));
    }

    // 5. Date-based Patterns (Years 2015 to 2026 + 0000)
    if (includeDates) {
      for (let y = 2018; y <= 2026; y++) {
        keySet.add(`${y}01010000`); // YYYY01010000
        keySet.add(`0000${y}0101`);
        keySet.add(`${y}${y}0000`);
      }
    }

    // 6. Custom Prefix + Incremental Suffix Range
    if (customPrefix.trim()) {
      const cleanPrefix = customPrefix.replace(/[^0-9a-fA-F]/g, '').toUpperCase();
      const neededLength = 12 - cleanPrefix.length;
      if (neededLength > 0 && neededLength <= 6) {
        for (let i = 0; i < Math.min(customRangeCount, 256); i++) {
          const suffix = i.toString(16).padStart(neededLength, '0').toUpperCase();
          keySet.add((cleanPrefix + suffix).slice(0, 12));
        }
      }
    }

    return Array.from(keySet).sort();
  }, [
    includeFactoryKeys, 
    includeSequential, 
    includeRepeatedNibbles, 
    includeUidDerivations, 
    cleanUid, 
    includeDates, 
    customPrefix, 
    customRangeCount
  ]);

  // Output string formatting
  const formattedText = useMemo(() => {
    if (exportFormat === 'mct') {
      let mct = `# Diccionario generado para Mifare Classic Tool (MCT)\n`;
      mct += `# Total de claves: ${generatedKeys.length}\n`;
      generatedKeys.forEach(k => {
        mct += `${k}\n`;
      });
      return mct;
    } else {
      // Proxmark3 .dic format: one 12-char key per line
      return generatedKeys.join('\n');
    }
  }, [generatedKeys, exportFormat]);

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = exportFormat === 'mct' ? 'custom_keys.keys' : 'custom_keys.dic';
    const blob = new Blob([formattedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Estimated audit duration on Proxmark3 (hf mf chk tests approx 100-150 keys per second against all 16 sectors)
  const estimatedSeconds = Math.max(1, Math.round(generatedKeys.length / 80));

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-2">
              <Key className="w-3.5 h-3.5" /> Generador de Diccionarios de Claves Crypto-1
            </div>
            <h2 className="text-2xl font-bold text-white">
              Constructor de Diccionarios para Auditoría MIFARE Classic
            </h2>
            <p className="text-slate-300 text-sm mt-1 leading-relaxed">
              Crea archivos de claves personalizados (formato <code>.dic</code> para Proxmark3 o <code>.keys</code> para MCT en Android) combinando claves de fábrica de NXP, secuencias numéricas, años de instalación y derivaciones basadas en el UID del chip de laboratorio.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '¡Copiado!' : 'Copiar Claves'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-cyan-600/20"
            >
              <Download className="w-4 h-4" />
              <span>Descargar {exportFormat === 'mct' ? '.keys' : '.dic'}</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Row */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-slate-500 text-[10px] block">TOTAL CLAVES:</span>
            <span className="text-cyan-400 font-bold text-base">{generatedKeys.length}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-slate-500 text-[10px] block">TIEMPO ESTIMADO PM3:</span>
            <span className="text-emerald-400 font-bold text-base">~{estimatedSeconds}s</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-slate-500 text-[10px] block">SECTORES AUDITADOS:</span>
            <span className="text-white font-bold text-base">16 Sectores</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-slate-500 text-[10px] block">FORMATO DESTINO:</span>
            <span className="text-amber-400 font-bold text-base">{exportFormat.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Main Split Layout: Filter Toggles + Generated Keys Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Pattern Toggles and Generator Rules */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Patrones de Claves a Incluir
            </h3>

            {/* Toggles */}
            <div className="space-y-3 text-xs">
              {/* Factory Defaults */}
              <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={includeFactoryKeys}
                  onChange={(e) => setIncludeFactoryKeys(e.target.checked)}
                  className="mt-0.5 rounded text-cyan-500 focus:ring-0 accent-cyan-500"
                />
                <div>
                  <span className="text-white font-bold block">Claves de Fábrica & Transporte NXP ({FACTORY_KEYS.length})</span>
                  <span className="text-slate-400 text-[11px] leading-relaxed">
                    Incluye <code>FFFFFFFFFFFF</code>, <code>A0A1A2A3A4A5</code>, <code>D3F7D3F7D3F7</code> y valores por defecto de fabricantes.
                  </span>
                </div>
              </label>

              {/* Sequential / Numeric */}
              <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={includeSequential}
                  onChange={(e) => setIncludeSequential(e.target.checked)}
                  className="mt-0.5 rounded text-cyan-500 focus:ring-0 accent-cyan-500"
                />
                <div>
                  <span className="text-white font-bold block">Secuencias Numéricas & Repeticiones</span>
                  <span className="text-slate-400 text-[11px] leading-relaxed">
                    Patrones triviales configurados por técnicos (ej. <code>123456123456</code>, <code>111111111111</code>, <code>010203040506</code>).
                  </span>
                </div>
              </label>

              {/* Repeated Nibbles */}
              <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={includeRepeatedNibbles}
                  onChange={(e) => setIncludeRepeatedNibbles(e.target.checked)}
                  className="mt-0.5 rounded text-cyan-500 focus:ring-0 accent-cyan-500"
                />
                <div>
                  <span className="text-white font-bold block">Pares de Bytes Repetidos</span>
                  <span className="text-slate-400 text-[11px] leading-relaxed">
                    Claves formadas por un byte repetido 6 veces (ej. <code>AAAAAA AAAAAA</code>, <code>555555 555555</code>).
                  </span>
                </div>
              </label>

              {/* UID-Derived Patterns */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeUidDerivations}
                    onChange={(e) => setIncludeUidDerivations(e.target.checked)}
                    className="rounded text-cyan-500 focus:ring-0 accent-cyan-500"
                  />
                  <span className="text-white font-bold">Derivaciones basadas en UID de la Tarjeta</span>
                </label>
                <div className="pl-6 space-y-1">
                  <span className="text-slate-400 text-[11px] block">Introduce el UID objetivo:</span>
                  <input
                    type="text"
                    value={targetUid}
                    onChange={(e) => setTargetUid(e.target.value)}
                    placeholder="A3 B4 2C 19"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-cyan-400 font-mono text-xs focus:outline-none focus:border-cyan-500 uppercase"
                  />
                  <span className="text-[10px] text-slate-500 block">
                    Genera claves como <code>{cleanUid.slice(0, 8)}0000</code> y versiones invertidas.
                  </span>
                </div>
              </div>

              {/* Dates */}
              <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={includeDates}
                  onChange={(e) => setIncludeDates(e.target.checked)}
                  className="mt-0.5 rounded text-cyan-500 focus:ring-0 accent-cyan-500"
                />
                <div>
                  <span className="text-white font-bold block">Años de Instalación Recientes</span>
                  <span className="text-slate-400 text-[11px] leading-relaxed">
                    Combina los años 2018-2026 con rellenos de ceros y fechas de inicio de año.
                  </span>
                </div>
              </label>

              {/* Custom Prefix Range */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-white font-bold block">Prefijo Personalizado + Rango Incremental</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Prefijo (hasta 10 hex):</span>
                    <input
                      type="text"
                      value={customPrefix}
                      onChange={(e) => setCustomPrefix(e.target.value)}
                      placeholder="Ej: A0A1"
                      maxLength={10}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-amber-300 font-mono text-xs focus:outline-none focus:border-cyan-500 uppercase"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Cantidad a generar:</span>
                    <select
                      value={customRangeCount}
                      onChange={(e) => setCustomRangeCount(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 text-xs focus:outline-none focus:border-cyan-500"
                    >
                      <option value={16}>16 claves (0x00 - 0x0F)</option>
                      <option value={32}>32 claves</option>
                      <option value={64}>64 claves</option>
                      <option value={128}>128 claves</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Format Selector */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Formato de Salida:</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setExportFormat('pm3')}
                  className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold transition-all ${
                    exportFormat === 'pm3'
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Proxmark3 (.dic)
                </button>
                <button
                  onClick={() => setExportFormat('mct')}
                  className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold transition-all ${
                    exportFormat === 'mct'
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  MCT Android (.keys)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Wordlist Preview & Terminal Command Box */}
        <div className="lg:col-span-7 space-y-4">
          {/* CLI Instructions box */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
            <span className="text-cyan-400 font-bold flex items-center gap-1.5">
              <Terminal className="w-4 h-4" /> Cómo utilizar este diccionario en el Laboratorio:
            </span>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-[11px] space-y-1">
              <div>
                <span className="text-slate-500"># En Proxmark3 (iceman firmware):</span>
              </div>
              <div className="text-emerald-400 font-bold">
                pm3 --&gt; hf mf chk --dump -k custom_keys.dic
              </div>
              <div className="text-slate-400 text-[10px] pt-1">
                Prueba automáticamente cada clave contra los 16 sectores y descarga los bloques descifrados.
              </div>
            </div>
          </div>

          {/* Textarea / Key List Display */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                Vista Previa del Archivo ({generatedKeys.length} claves únicas de 48 bits)
              </span>
              <span className="text-slate-500 text-[11px]">12 caracteres HEX por línea</span>
            </div>

            <div className="p-4 font-mono text-xs max-h-[380px] overflow-y-auto space-y-1 bg-slate-950/95 selection:bg-cyan-500/30">
              {generatedKeys.map((keyStr, idx) => (
                <div key={idx} className="flex items-center justify-between hover:bg-slate-900/60 px-2 py-0.5 rounded group">
                  <span className="text-slate-600 text-[10px] select-none w-8">
                    {idx + 1}.
                  </span>
                  <span className={`font-bold tracking-widest ${
                    FACTORY_KEYS.includes(keyStr) ? 'text-amber-300' :
                    keyStr.startsWith(cleanUid.slice(0, 4)) ? 'text-cyan-300' :
                    'text-slate-200'
                  }`}>
                    {keyStr}
                  </span>
                  <span className="text-[10px] text-slate-600 font-sans group-hover:text-slate-400 transition-colors">
                    {FACTORY_KEYS.includes(keyStr) ? 'Fábrica NXP' : 'Patrón derivado'}
                  </span>
                </div>
              ))}
            </div>

            {/* Bottom Footer Info */}
            <div className="p-3 bg-slate-900/80 border-t border-slate-800 text-slate-400 text-xs flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Sin duplicados • Ordenado alfanuméricamente
              </span>
              <button
                onClick={handleCopy}
                className="text-cyan-400 hover:text-cyan-300 font-semibold underline text-xs"
              >
                Copiar todo al portapapeles
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
