import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Radio, Play, Pause, RotateCcw, Sliders, Info, Zap, 
  HelpCircle, Eye, ShieldAlert, Cpu, Sparkles, CheckCircle2 
} from 'lucide-react';

export type ModulationType = 'ASK' | 'FSK' | 'PSK';

interface ProtocolPreset {
  name: string;
  type: ModulationType;
  bits: string;
  carrierCycles: number;
  modulationDepth: number;
  noiseLevel: number;
  frequencyLabel: string;
  realWorldCard: string;
  explanation: string;
}

const PRESETS: ProtocolPreset[] = [
  {
    name: 'EM4100 (125 kHz ASK)',
    type: 'ASK',
    bits: '10110010',
    carrierCycles: 4,
    modulationDepth: 85,
    noiseLevel: 4,
    frequencyLabel: '125 kHz LF',
    realWorldCard: 'Llaveros de garaje y comunidades residenciales',
    explanation: 'Modula la amplitud del campo magnético mediante absorción resistiva (Load Modulation). Los 1s mantienen portadora alta y los 0s atenúan la señal.'
  },
  {
    name: 'HID Prox II (125 kHz FSK)',
    type: 'FSK',
    bits: '11010011',
    carrierCycles: 4,
    modulationDepth: 100,
    noiseLevel: 3,
    frequencyLabel: '125 kHz LF',
    realWorldCard: 'Tarjetas corporativas de oficinas y tornos Wiegand',
    explanation: 'Alterna entre dos frecuencias cercanas: RF/8 (15.6 kHz) para bits "1" y RF/10 (12.5 kHz) para bits "0", ofreciendo mayor inmunidad al ruido ambiental.'
  },
  {
    name: 'Indala (125 kHz PSK)',
    type: 'PSK',
    bits: '10011010',
    carrierCycles: 5,
    modulationDepth: 100,
    noiseLevel: 2,
    frequencyLabel: '125 kHz LF',
    realWorldCard: 'Credenciales de alta resistencia y campus cerrados',
    explanation: 'Invierte la fase de la onda seno 180° cuando el bit conmuta. Produce saltos de fase nítidos característicos en el osciloscopio.'
  },
  {
    name: 'ISO 14443-A (13.56 MHz ASK 100% OOK)',
    type: 'ASK',
    bits: '11001010',
    carrierCycles: 6,
    modulationDepth: 100,
    noiseLevel: 1,
    frequencyLabel: '13.56 MHz HF',
    realWorldCard: 'MIFARE Classic, Ultralight y etiquetas NFC',
    explanation: 'On-Off Keying (OOK) al 100%: los huecos de pausa detienen casi por completo el campo magnético para delimitar los bits a 106 kbps.'
  }
];

interface SignalVisualizerProps {
  onNavigateToSpectrum?: () => void;
}

export const SignalVisualizer: React.FC<SignalVisualizerProps> = ({ onNavigateToSpectrum }) => {
  const [modulation, setModulation] = useState<ModulationType>('ASK');
  const [bitStream, setBitStream] = useState<string>('10110010');
  const [carrierCycles, setCarrierCycles] = useState<number>(5); // cycles per bit
  const [modulationDepth, setModulationDepth] = useState<number>(85); // %
  const [noiseLevel, setNoiseLevel] = useState<number>(3); // %
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [animationOffset, setAnimationOffset] = useState<number>(0);
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; bit: string; time: string } | null>(null);

  // Animation ticker for moving oscilloscope wave
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    let lastTime = performance.now();
    const animate = (currentTime: number) => {
      if (isPlaying) {
        const delta = (currentTime - lastTime) / 1000;
        setAnimationOffset(prev => (prev + delta * 30) % 1000);
      }
      lastTime = currentTime;
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying]);

  const sanitizedBits = useMemo(() => {
    const cleaned = bitStream.replace(/[^01]/g, '');
    return cleaned.length > 0 ? cleaned.slice(0, 16) : '1010';
  }, [bitStream]);

  const numBits = sanitizedBits.length;
  const svgWidth = 800;
  const svgHeightDigital = 80;
  const svgHeightAnalog = 180;
  const bitWidth = svgWidth / numBits;

  // Generate Digital Baseband Path (Square wave)
  const digitalPath = useMemo(() => {
    const points: string[] = [];
    const topY = 20;
    const bottomY = 65;

    sanitizedBits.split('').forEach((bit, i) => {
      const startX = i * bitWidth;
      const endX = (i + 1) * bitWidth;
      const y = bit === '1' ? topY : bottomY;

      if (i === 0) {
        points.push(`M ${startX} ${y}`);
      } else {
        // Vertical transition from previous bit
        const prevY = sanitizedBits[i - 1] === '1' ? topY : bottomY;
        points.push(`L ${startX} ${prevY}`);
        points.push(`L ${startX} ${y}`);
      }
      points.push(`L ${endX} ${y}`);
    });

    return points.join(' ');
  }, [sanitizedBits, bitWidth]);

  // Generate Modulated Analog Carrier Wave Path
  const analogWaveData = useMemo(() => {
    const totalSamples = 800;
    const centerY = svgHeightAnalog / 2;
    const maxAmplitude = 60;
    const pathPoints: [number, number][] = [];

    // Precalculate noise seed pattern
    for (let sample = 0; sample <= totalSamples; sample++) {
      const x = (sample / totalSamples) * svgWidth;
      const bitIndex = Math.min(Math.floor(x / bitWidth), numBits - 1);
      const currentBit = sanitizedBits[bitIndex];

      // Time parameter normalized within bit (0 to 1)
      const bitProgress = (x % bitWidth) / bitWidth;

      let amplitude = maxAmplitude;
      let phase = 0;
      let frequencyMultiplier = 1;

      if (modulation === 'ASK') {
        const depthFactor = modulationDepth / 100;
        if (currentBit === '0') {
          amplitude = maxAmplitude * (1 - depthFactor);
        } else {
          amplitude = maxAmplitude;
        }
      } else if (modulation === 'FSK') {
        // Frequency Shift Keying: bit '1' is higher frequency, bit '0' is lower
        frequencyMultiplier = currentBit === '1' ? 1.5 : 0.75;
      } else if (modulation === 'PSK') {
        // Phase Shift Keying: bit '0' introduces 180 degree phase shift (PI radians)
        phase = currentBit === '0' ? Math.PI : 0;
      }

      // Sine wave calculation
      const angularFreq = 2 * Math.PI * carrierCycles * frequencyMultiplier;
      const rawSine = Math.sin(angularFreq * bitProgress + phase - (isPlaying ? (animationOffset * 0.05) : 0));

      // Thermal Noise simulation
      const pseudoNoise = (Math.sin(sample * 13.7) + Math.cos(sample * 7.9)) * (noiseLevel * 0.25);

      const y = centerY - (rawSine * amplitude) + pseudoNoise;
      pathPoints.push([x, y]);
    }

    const svgPath = pathPoints.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt[0].toFixed(1)} ${pt[1].toFixed(1)}`).join(' ');
    return { path: svgPath, points: pathPoints };
  }, [sanitizedBits, numBits, bitWidth, carrierCycles, modulation, modulationDepth, noiseLevel, isPlaying, animationOffset]);

  const applyPreset = (preset: ProtocolPreset) => {
    setModulation(preset.type);
    setBitStream(preset.bits);
    setCarrierCycles(preset.carrierCycles);
    setModulationDepth(preset.modulationDepth);
    setNoiseLevel(preset.noiseLevel);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-2">
              <Radio className="w-3.5 h-3.5 animate-pulse" /> Laboratorio Virtual de Radiofrecuencia
            </div>
            <h2 className="text-2xl font-bold text-white">
              Visualizador de Señales y Modulaciones RFID (ASK / FSK / PSK)
            </h2>
            <p className="text-slate-300 text-sm mt-1 leading-relaxed">
              Comprende visualmente cómo los ceros y unos lógicos se transforman en perturbaciones electromagnéticas en el aire. Experimenta en vivo con la amplitud, la frecuencia y la fase de la onda portadora.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onNavigateToSpectrum && (
              <button
                onClick={onNavigateToSpectrum}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shrink-0"
              >
                <Radio className="w-4 h-4" />
                <span>Mapa del Espectro LF/HF/UHF</span>
              </button>
            )}

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-md ${
                isPlaying 
                  ? 'bg-amber-600 hover:bg-amber-500 text-white' 
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? 'Pausar Barrido' : 'Reanudar Señal'}</span>
            </button>

            <button
              onClick={() => {
                setBitStream('10110010');
                setCarrierCycles(5);
                setModulationDepth(85);
                setNoiseLevel(3);
              }}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
              title="Restablecer valores"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Real-world Protocol Quick Presets */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <div className="text-xs text-slate-400 font-mono mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Presets de Tecnologías Reales en Control de Accesos:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {PRESETS.map((p) => {
              const isSelected = modulation === p.type && bitStream === p.bits;
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
                    <span className="font-bold text-white">{p.name.split('(')[0]}</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-800 font-mono text-[10px] text-cyan-400 font-semibold">
                      {p.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{p.realWorldCard}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Interactive Oscilloscope Canvas */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Oscilloscope Header Grid info */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
            </div>
            <span className="font-mono text-xs text-slate-300 font-semibold">
              Osciloscopio Digital de RF — Canal A (Banda Base) & Canal B (Portadora Modulada)
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-cyan-400">Modulación: <strong>{modulation}</strong></span>
            <span className="text-slate-500">•</span>
            <span className="text-emerald-400">Tasa: <strong>{carrierCycles} ciclos/bit</strong></span>
            <span className="text-slate-500">•</span>
            <span className="text-purple-400">Ruido: <strong>{noiseLevel}%</strong></span>
          </div>
        </div>

        {/* 1. Digital Baseband (Canal A) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-cyan-400 font-semibold flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 inline-block"></span>
              CANAL A: Tren de Pulsos Binario (Banda Base Digital)
            </span>
            <span className="text-slate-500">Nivel lógico TTL (0V - 5V)</span>
          </div>

          <div className="bg-slate-900/90 rounded-2xl border border-slate-800/80 p-3 relative overflow-hidden">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeightDigital}`} className="w-full h-20 overflow-visible">
              {/* Vertical Bit Boundary Gridlines */}
              {sanitizedBits.split('').map((bit, idx) => (
                <g key={idx}>
                  <line
                    x1={idx * bitWidth}
                    y1={0}
                    x2={idx * bitWidth}
                    y2={svgHeightDigital}
                    stroke="#1e293b"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  {/* Bit Label Centered */}
                  <rect
                    x={idx * bitWidth + (bitWidth / 2) - 10}
                    y={2}
                    width={20}
                    height={16}
                    rx={4}
                    fill={bit === '1' ? '#0891b2' : '#334155'}
                    opacity={0.8}
                  />
                  <text
                    x={idx * bitWidth + (bitWidth / 2)}
                    y={14}
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {bit}
                  </text>
                </g>
              ))}

              {/* Digital waveform line */}
              <path
                d={digitalPath}
                fill="none"
                stroke="#22d3ee"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* 2. Modulated RF Carrier (Canal B) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 inline-block"></span>
              CANAL B: Señal de Radiofrecuencia Modulada (Campo Electromagnético)
            </span>
            <span className="text-slate-500">
              {modulation === 'ASK' && 'Variación de envolvente de amplitud'}
              {modulation === 'FSK' && 'Conmutación de dos frecuencias'}
              {modulation === 'PSK' && 'Inversión de fase 180° (Saltos bruscos)'}
            </span>
          </div>

          <div className="bg-slate-900/90 rounded-2xl border border-slate-800/80 p-3 relative overflow-hidden">
            {/* Oscilloscope Grid background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_24px] opacity-20 pointer-events-none"></div>

            <svg viewBox={`0 0 ${svgWidth} ${svgHeightAnalog}`} className="w-full h-44 overflow-visible relative z-10">
              {/* Bit boundary markers */}
              {sanitizedBits.split('').map((_, idx) => (
                <line
                  key={idx}
                  x1={idx * bitWidth}
                  y1={0}
                  x2={idx * bitWidth}
                  y2={svgHeightAnalog}
                  stroke="#334155"
                  strokeWidth="1"
                  strokeDasharray="2 4"
                />
              ))}

              {/* Zero Volt Center Reference Line */}
              <line
                x1={0}
                y1={svgHeightAnalog / 2}
                x2={svgWidth}
                y2={svgHeightAnalog / 2}
                stroke="#475569"
                strokeWidth="1"
                strokeDasharray="6 6"
              />

              {/* Glowing effect under the wave */}
              <path
                d={analogWaveData.path}
                fill="none"
                stroke="#10b981"
                strokeWidth="6"
                strokeOpacity="0.15"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Main Sine Wave Path */}
              <path
                d={analogWaveData.path}
                fill="none"
                stroke="#34d399"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Interactive Controls & Parameter Adjusters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 pt-4 border-t border-slate-800 text-xs">
          {/* Modulation Mode Selector */}
          <div className="space-y-2">
            <label className="text-slate-300 font-bold block flex items-center justify-between">
              <span>Tipo de Modulación:</span>
              <span className="font-mono text-cyan-400">{modulation}</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['ASK', 'FSK', 'PSK'] as const).map(mod => (
                <button
                  key={mod}
                  onClick={() => setModulation(mod)}
                  className={`py-2 px-1 rounded-xl font-bold font-mono text-center transition-all ${
                    modulation === mod
                      ? 'bg-cyan-500 text-slate-950 shadow-md'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {mod}
                </button>
              ))}
            </div>
          </div>

          {/* Binary Bitstream Input */}
          <div className="space-y-2">
            <label className="text-slate-300 font-bold block flex items-center justify-between">
              <span>Cadena de Bits (Binario):</span>
              <span className="font-mono text-slate-500">{sanitizedBits.length} bits</span>
            </label>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={bitStream}
                onChange={(e) => setBitStream(e.target.value.replace(/[^01]/g, ''))}
                maxLength={16}
                placeholder="10110010"
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl font-mono text-cyan-400 font-bold focus:outline-none focus:border-cyan-500 text-xs tracking-wider"
              />
              <button
                onClick={() => {
                  const randomBits = Array.from({ length: 8 }, () => Math.random() > 0.5 ? '1' : '0').join('');
                  setBitStream(randomBits);
                }}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-mono text-[11px] shrink-0 transition-colors"
                title="Generar bits aleatorios"
              >
                Aleatorio
              </button>
            </div>
          </div>

          {/* Carrier Cycles Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-slate-300 font-bold">
              <span>Ciclos de portadora por bit:</span>
              <span className="font-mono text-cyan-400">{carrierCycles} ciclos</span>
            </div>
            <input
              type="range"
              min="2"
              max="10"
              value={carrierCycles}
              onChange={(e) => setCarrierCycles(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>2 (Rápido)</span>
              <span>6</span>
              <span>10 (Lento)</span>
            </div>
          </div>

          {/* Modulation Depth or Noise Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-slate-300 font-bold">
              <span>{modulation === 'ASK' ? 'Profundidad de Amplitud:' : 'Ruido RF Térmico:'}</span>
              <span className="font-mono text-cyan-400">
                {modulation === 'ASK' ? `${modulationDepth}%` : `${noiseLevel}%`}
              </span>
            </div>
            {modulation === 'ASK' ? (
              <input
                type="range"
                min="10"
                max="100"
                value={modulationDepth}
                onChange={(e) => setModulationDepth(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            ) : (
              <input
                type="range"
                min="0"
                max="15"
                value={noiseLevel}
                onChange={(e) => setNoiseLevel(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            )}
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>{modulation === 'ASK' ? '10% (ISO 14443-B)' : '0% (Ideal)'}</span>
              <span>{modulation === 'ASK' ? '100% (OOK)' : '15% (Ruido Alto)'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Explanatory Technical Reference for Students */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-slate-300">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              ASK (Amplitude Shift Keying)
            </h3>
            <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono text-[10px]">Modulación de Carga</span>
          </div>
          <p className="leading-relaxed text-slate-400">
            Varía la amplitud del campo. Cuando la tarjeta conmuta una resistencia en paralelo con su antena, absorbe más energía del lector, reduciendo el voltaje detectado en la estación base.
          </p>
          <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-cyan-300">
            Usado en: EM4100, MIFARE Classic, NTAG213, ISO 14443-A/B.
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              FSK (Frequency Shift Keying)
            </h3>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px]">Doble Portadora</span>
          </div>
          <p className="leading-relaxed text-slate-400">
            Mantiene la amplitud fija pero conmuta entre dos frecuencias. Esto hace que la señal sea inmune a fluctuaciones de distancia y ruidos electromagnéticos de motores o fluorescentes.
          </p>
          <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-emerald-300">
            Usado en: HID Prox II (125 kHz FSK Wiegand), TI RFID.
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
              PSK (Phase Shift Keying)
            </h3>
            <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-mono text-[10px]">Salto de Fase</span>
          </div>
          <p className="leading-relaxed text-slate-400">
            Altera la fase de la onda sinusoidal en 180° exactamente en los bordes de transición de bit. Requiere demoduladores coherentes en el lector para detectar el desfase instantáneo.
          </p>
          <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-purple-300">
            Usado en: Indala (125 kHz PSK), Biphase Manchester.
          </div>
        </div>
      </div>
    </div>
  );
};
