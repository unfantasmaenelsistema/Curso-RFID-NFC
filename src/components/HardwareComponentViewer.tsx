import React, { useState } from 'react';
import { 
  Cpu, Radio, Zap, Info, Shield, Terminal, 
  HelpCircle, Sparkles, CheckCircle2, AlertTriangle, Layers, Eye 
} from 'lucide-react';

export interface HardwareHotspot {
  id: string;
  name: string;
  type: 'antenna' | 'mcu' | 'port' | 'led' | 'button' | 'storage';
  coordinates: { x: number; y: number; r?: number; width?: number; height?: number };
  shortRole: string;
  technicalDetails: string;
  pentestingUtility: string;
  associatedCommands?: string[];
  warningTip?: string;
}

export interface HardwareDevice {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  dimensions: string;
  frequencyRange: string;
  hotspots: HardwareHotspot[];
}

export const HARDWARE_DEVICES: HardwareDevice[] = [
  {
    id: 'proxmark3-rdv4',
    name: 'Proxmark3 RDV4 / Easy (Firmware Iceman)',
    subtitle: 'Placa PCB de Auditoría de Radiofrecuencia y Ciberseguridad Física',
    category: 'Instrumental Profesional de Laboratorio',
    dimensions: '82mm x 54mm (Formato tarjeta)',
    frequencyRange: '125 kHz (LF) y 13.56 MHz (HF)',
    hotspots: [
      {
        id: 'lf-antenna',
        name: 'Antena de Baja Frecuencia (LF 125 kHz)',
        type: 'antenna',
        coordinates: { x: 190, y: 155, r: 48 },
        shortRole: 'Bobina toroidal / espiral de alta inductancia para modulación 125 kHz.',
        technicalDetails: 'Circuito resonante LC sintonizado a 125 kHz. Requiere voltajes pico a pico superiores a 25V para interrogar tags de acceso a distancia de 2-5 cm.',
        pentestingUtility: 'Lectura, sniffing y clonado de EM4100, HID Prox II 26-bit, Indala, AWID y reescritura de chips T5577.',
        associatedCommands: ['lf search', 'lf tune', 'lf hid read', 'lf em 410x clone'],
        warningTip: 'No coloques metales ni llaves cerca durante el comando `hw tune`, ya que desintonizan la inductancia de la bobina.'
      },
      {
        id: 'hf-antenna',
        name: 'Antena de Alta Frecuencia (HF 13.56 MHz)',
        type: 'antenna',
        coordinates: { x: 410, y: 155, r: 52 },
        shortRole: 'Pistas concéntricas de cobre para acoplamiento inductivo a 13.56 MHz.',
        technicalDetails: 'Antena plana sintonizada para protocolos ISO/IEC 14443-A/B e ISO 15693. Voltaje de resonancia habitual: 15V - 30V.',
        pentestingUtility: 'Crackeo de Crypto-1 en MIFARE Classic (Darkside, Nested, Autopwn), volcado de memoria y emulación de tarjetas inteligentes.',
        associatedCommands: ['hf search', 'hf 14a info', 'hf mf autopwn', 'hf mf dump'],
        warningTip: 'Al auditar tarjetas con chip metálico (tarjetas de crédito de lujo), la lectura HF puede atenuarse significativamente.'
      },
      {
        id: 'mcu-arm',
        name: 'Microcontrolador ARM AT91SAM7S512',
        type: 'mcu',
        coordinates: { x: 275, y: 245, width: 65, height: 65 },
        shortRole: 'Cerebro de procesamiento: microcontrolador principal de 32 bits a 55 MHz.',
        technicalDetails: 'Microcontrolador Atmel de 512 KB de Flash ROM y 64 KB de SRAM. Ejecuta la lógica del firmware Iceman y procesa las peticiones de consola USB.',
        pentestingUtility: 'Ejecución de algoritmos de crackeo criptográfico Crapto1, desencapsulado de tramas de red y comunicación por puerto serie virtual.',
        associatedCommands: ['hw status', 'hw version'],
        warningTip: '¡Atención al comprar clones baratos! Los modelos antiguos con chip SAM7S256 (256 KB) no admiten las funciones completas de autopwn.'
      },
      {
        id: 'fpga-xilinx',
        name: 'FPGA Xilinx Spartan-II / XC2S',
        type: 'mcu',
        coordinates: { x: 360, y: 245, width: 60, height: 60 },
        shortRole: 'Procesamiento de señal en hardware en tiempo real sin latencia.',
        technicalDetails: 'Matriz de puertas programables de alta velocidad. Se encarga de la modulación y demodulación directa de RF a nivel de microsegundo.',
        pentestingUtility: 'Captura y demodulación precisa de tramas Manchester y Miller modificado sin pérdidas de timing.',
        associatedCommands: ['hw fpga info']
      },
      {
        id: 'usb-port',
        name: 'Puerto Micro-USB / USB-C de Comunicación',
        type: 'port',
        coordinates: { x: 540, y: 250, width: 35, height: 45 },
        shortRole: 'Alimentación eléctrica de 5V y conexión serie con el ordenador.',
        technicalDetails: 'Emula un puerto serie virtual COM / `/dev/ttyACM0` a 115200 baudios (o modo nativo de alta velocidad).',
        pentestingUtility: 'Control directo desde la consola terminal de Kali Linux, macOS o smartphones Android mediante Termux con cable OTG.',
        warningTip: 'Utiliza siempre cables de datos de buena calidad; los cables de solo carga impiden la detección del dispositivo en Linux.'
      },
      {
        id: 'led-bank',
        name: 'Banco de LEDs de Diagnóstico (A, B, C, D)',
        type: 'led',
        coordinates: { x: 260, y: 155, width: 45, height: 18 },
        shortRole: 'Indicadores luminosos de estado de campo y actividad de radio.',
        technicalDetails: 'Cuatro diodos emisores de luz: LED A (LF activo), LED B (HF activo), LED C (modo simulación/emulador), LED D (sniffing en proceso).',
        pentestingUtility: 'Permite confirmar visualmente que el dispositivo está interrogando el aire o capturando tramas sin mirar la pantalla.',
        associatedCommands: ['hw ping']
      },
      {
        id: 'user-button',
        name: 'Botón Multifunción de Hardware',
        type: 'button',
        coordinates: { x: 540, y: 80, width: 30, height: 25 },
        shortRole: 'Botón físico para modo autónomo (Standalone) y recuperación de arranque.',
        technicalDetails: 'Pulsador táctil SMD. Mantenido pulsado al conectar el cable USB fuerza el modo bootloader para flasheo de firmware seguro.',
        pentestingUtility: 'Permite operar el Proxmark3 en modo autónomo en el bolsillo para capturar credenciales sin necesidad de ordenador portátil.',
        associatedCommands: ['lf standalone', 'hf standalone']
      }
    ]
  },
  {
    id: 'flipper-zero',
    name: 'Flipper Zero (Módulo RFID & NFC)',
    subtitle: 'Dispositivo Táctico Autónomo de Reconocimiento Portátil',
    category: 'Herramienta de Campo Autónomo',
    dimensions: '100mm x 40mm x 25mm',
    frequencyRange: '125 kHz LF, 13.56 MHz NFC, Sub-1GHz, IR, iButton',
    hotspots: [
      {
        id: 'flipper-rfid-nfc-pad',
        name: 'Superficie de Lectura Dual (LF 125 kHz + NFC 13.56 MHz)',
        type: 'antenna',
        coordinates: { x: 260, y: 160, r: 50 },
        shortRole: 'Antenas integradas duales en la parte trasera del chasis.',
        technicalDetails: 'Combina una bobina ferrita LF y una antena planar NFC acopladas bajo la carcasa plástica.',
        pentestingUtility: 'Lectura, emulación de credenciales guardadas y extracción rápida de UID en bolsillo durante auditorías encubiertas.',
        associatedCommands: ['NFC Read', '125 kHz RFID Read', 'Emulate Card']
      },
      {
        id: 'flipper-screen',
        name: 'Pantalla LCD Monocromática Retroiluminada',
        type: 'storage',
        coordinates: { x: 420, y: 160, width: 90, height: 50 },
        shortRole: 'Pantalla de visualización autónoma de 1.4 pulgadas.',
        technicalDetails: 'Resolución de 128x64 píxeles. Muestra UIDs leídos, diccionarios y menús de emulación sin necesidad de periféricos.',
        pentestingUtility: 'Confirmación inmediata de UID, Facility Code y formato Wiegand capturado en segundos en el pasillo del cliente.'
      },
      {
        id: 'flipper-gpio',
        name: 'Pines de Expansión GPIO (3.3V / UART / SPI / I2C)',
        type: 'port',
        coordinates: { x: 460, y: 70, width: 85, height: 25 },
        shortRole: 'Cabezal de conexión para módulos externos y analizadores lógicos.',
        technicalDetails: '18 pines configurables. Permite conectar módulos externos de desarrollo, lectores Wiegand directos o analizadores de bus.',
        pentestingUtility: 'Conexión a cabezales de lectores de pared Wiegand mediante adaptadores para registrar tramas DATA0/DATA1.'
      }
    ]
  }
];

export const HardwareComponentViewer: React.FC = () => {
  const [selectedDevice, setSelectedDevice] = useState<HardwareDevice>(HARDWARE_DEVICES[0]);
  const [activeHotspotId, setActiveHotspotId] = useState<string>('lf-antenna');
  const [ledsActive, setLedsActive] = useState<boolean>(true);

  const activeHotspot = selectedDevice.hotspots.find(h => h.id === activeHotspotId) || selectedDevice.hotspots[0];

  const getHotspotBadgeColor = (type: HardwareHotspot['type']) => {
    switch (type) {
      case 'antenna': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      case 'mcu': return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      case 'port': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'led': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'button': return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      default: return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-2">
              <Cpu className="w-3.5 h-3.5" /> Visor Interactivo de Arquitectura de Hardware
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Diagrama Técnico de Componentes & Placa PCB
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Explora los componentes físicos clave de los dispositivos de auditoría. Haz clic en las bobinas, microcontroladores o puertos para entender su función electrónica y su utilidad en intrusión física y defensa.
            </p>
          </div>

          {/* Device Selector Buttons */}
          <div className="flex items-center gap-2">
            {HARDWARE_DEVICES.map(dev => (
              <button
                key={dev.id}
                onClick={() => {
                  setSelectedDevice(dev);
                  setActiveHotspotId(dev.hotspots[0].id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  selectedDevice.id === dev.id
                    ? 'bg-cyan-600 text-white border-cyan-500 shadow-md'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                {dev.name.split('(')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Split View: Interactive PCB SVG Canvas + Component Inspector Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Visual Blueprint */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <span className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-wider block">
                {selectedDevice.name}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {selectedDevice.dimensions} • {selectedDevice.frequencyRange}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setLedsActive(!ledsActive)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold border transition-all ${
                  ledsActive
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                LEDs: {ledsActive ? 'ENCENDIDOS' : 'APAGADOS'}
              </button>
            </div>
          </div>

          {/* SVG PCB Board Rendering */}
          <div className="relative bg-slate-900/90 rounded-2xl border border-slate-800/80 p-2 overflow-hidden flex items-center justify-center min-h-[340px]">
            {/* PCB Trace decorative background */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none"></div>

            <svg viewBox="0 0 620 340" className="w-full h-auto max-h-[380px] select-none">
              <defs>
                <linearGradient id="pcbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0f172a" />
                  <stop offset="100%" stopColor="#020617" />
                </linearGradient>
                <linearGradient id="goldPad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
                <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Main PCB Substrate Shape (Matte Dark Blue-Black Board) */}
              <rect
                x="30"
                y="20"
                width="560"
                height="300"
                rx="18"
                fill="url(#pcbGrad)"
                stroke="#334155"
                strokeWidth="2.5"
              />

              {/* Gold Plated Mounting Holes in 4 corners */}
              {[
                { cx: 50, cy: 40 },
                { cx: 570, cy: 40 },
                { cx: 50, cy: 300 },
                { cx: 570, cy: 300 }
              ].map((hole, idx) => (
                <g key={idx}>
                  <circle cx={hole.cx} cy={hole.cy} r="8" fill="url(#goldPad)" opacity="0.8" />
                  <circle cx={hole.cx} cy={hole.cy} r="4.5" fill="#000000" />
                </g>
              ))}

              {/* Decorative PCB Silkscreen Traces */}
              <path
                d="M 190 100 L 190 70 L 260 70 M 410 100 L 410 70 L 340 70 M 275 220 L 275 180 M 360 220 L 360 180 M 420 270 L 530 270"
                fill="none"
                stroke="#1e293b"
                strokeWidth="2"
                strokeDasharray="4 2"
              />

              {/* Printed Silkscreen Text */}
              <text x="60" y="55" fill="#64748b" fontSize="10" fontFamily="monospace" fontWeight="bold">
                PROXMARK3 RDV4 • REDTEAM REV.E
              </text>
              <text x="60" y="70" fill="#475569" fontSize="8" fontFamily="monospace">
                ICEMAN COMPLIANT • 512K AT91SAM7S
              </text>

              {/* LF Antenna Coil Graphic (Left) */}
              <g
                onClick={() => setActiveHotspotId('lf-antenna')}
                className="cursor-pointer group"
              >
                <circle
                  cx="190"
                  cy="155"
                  r="52"
                  fill="#0284c7"
                  fillOpacity={activeHotspotId === 'lf-antenna' ? 0.2 : 0.08}
                  stroke="#0284c7"
                  strokeWidth={activeHotspotId === 'lf-antenna' ? 3 : 1.5}
                />
                <circle cx="190" cy="155" r="42" fill="none" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="3 3" />
                <circle cx="190" cy="155" r="32" fill="none" stroke="#38bdf8" strokeWidth="1" />
                <circle cx="190" cy="155" r="22" fill="none" stroke="#7dd3fc" strokeWidth="1.2" />
                <circle cx="190" cy="155" r="10" fill="#0369a1" fillOpacity="0.4" />
                <text x="190" y="159" fill="#e0f2fe" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  LF 125k
                </text>
              </g>

              {/* HF Antenna Coil Graphic (Right) */}
              <g
                onClick={() => setActiveHotspotId('hf-antenna')}
                className="cursor-pointer group"
              >
                <circle
                  cx="410"
                  cy="155"
                  r="56"
                  fill="#10b981"
                  fillOpacity={activeHotspotId === 'hf-antenna' ? 0.2 : 0.08}
                  stroke="#10b981"
                  strokeWidth={activeHotspotId === 'hf-antenna' ? 3 : 1.5}
                />
                <circle cx="410" cy="155" r="46" fill="none" stroke="#34d399" strokeWidth="1.2" />
                <circle cx="410" cy="155" r="36" fill="none" stroke="#6ee7b7" strokeWidth="1" strokeDasharray="4 2" />
                <circle cx="410" cy="155" r="26" fill="none" stroke="#a7f3d0" strokeWidth="1" />
                <circle cx="410" cy="155" r="12" fill="#047857" fillOpacity="0.4" />
                <text x="410" y="159" fill="#ecfdf5" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  HF 13.56M
                </text>
              </g>

              {/* MCU ARM Chip Graphic */}
              <g
                onClick={() => setActiveHotspotId('mcu-arm')}
                className="cursor-pointer"
              >
                <rect
                  x="275"
                  y="245"
                  width="65"
                  height="65"
                  rx="4"
                  fill="#1e1b4b"
                  stroke={activeHotspotId === 'mcu-arm' ? '#a855f7' : '#6366f1'}
                  strokeWidth={activeHotspotId === 'mcu-arm' ? 2.5 : 1.5}
                />
                {/* Pins on edges */}
                {[-10, 0, 10, 20].map((offset, i) => (
                  <rect key={i} x={268} y={255 + offset} width="7" height="3" fill="#cbd5e1" />
                ))}
                {[-10, 0, 10, 20].map((offset, i) => (
                  <rect key={i} x={340} y={255 + offset} width="7" height="3" fill="#cbd5e1" />
                ))}
                <text x="307" y="275" fill="#e0e7ff" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  AT91SAM7S
                </text>
                <text x="307" y="290" fill="#a5b4fc" fontSize="7" textAnchor="middle" fontFamily="monospace">
                  512KB ARM
                </text>
              </g>

              {/* FPGA Chip Graphic */}
              <g
                onClick={() => setActiveHotspotId('fpga-xilinx')}
                className="cursor-pointer"
              >
                <rect
                  x="360"
                  y="245"
                  width="60"
                  height="65"
                  rx="4"
                  fill="#18181b"
                  stroke={activeHotspotId === 'fpga-xilinx' ? '#a855f7' : '#475569'}
                  strokeWidth={activeHotspotId === 'fpga-xilinx' ? 2.5 : 1.5}
                />
                <text x="390" y="275" fill="#f43f5e" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  XILINX
                </text>
                <text x="390" y="290" fill="#94a3b8" fontSize="7" textAnchor="middle" fontFamily="monospace">
                  SPARTAN FPGA
                </text>
              </g>

              {/* USB Port Graphic (Right side) */}
              <g
                onClick={() => setActiveHotspotId('usb-port')}
                className="cursor-pointer"
              >
                <rect
                  x="540"
                  y="250"
                  width="40"
                  height="45"
                  rx="3"
                  fill="#64748b"
                  stroke={activeHotspotId === 'usb-port' ? '#f59e0b' : '#94a3b8'}
                  strokeWidth={activeHotspotId === 'usb-port' ? 2.5 : 1.2}
                />
                <rect x="548" y="258" width="24" height="29" fill="#0f172a" />
                <rect x="554" y="265" width="12" height="15" fill="#e2e8f0" />
                <text x="560" y="310" fill="#94a3b8" fontSize="7" textAnchor="middle" fontFamily="monospace">
                  USB-C / UART
                </text>
              </g>

              {/* LED Bank Graphic */}
              <g
                onClick={() => setActiveHotspotId('led-bank')}
                className="cursor-pointer"
              >
                <rect x="260" y="150" width="50" height="20" rx="3" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                {/* 4 LEDs */}
                <circle cx="268" cy="160" r="3.5" fill={ledsActive ? '#ef4444' : '#450a0a'} filter={ledsActive ? 'url(#glowEffect)' : undefined} />
                <circle cx="278" cy="160" r="3.5" fill={ledsActive ? '#f59e0b' : '#451a03'} filter={ledsActive ? 'url(#glowEffect)' : undefined} />
                <circle cx="288" cy="160" r="3.5" fill={ledsActive ? '#10b981' : '#022c22'} filter={ledsActive ? 'url(#glowEffect)' : undefined} />
                <circle cx="298" cy="160" r="3.5" fill={ledsActive ? '#06b6d4' : '#083344'} filter={ledsActive ? 'url(#glowEffect)' : undefined} />
              </g>

              {/* Push Button Graphic */}
              <g
                onClick={() => setActiveHotspotId('user-button')}
                className="cursor-pointer"
              >
                <rect
                  x="540"
                  y="80"
                  width="30"
                  height="26"
                  rx="3"
                  fill="#1e293b"
                  stroke={activeHotspotId === 'user-button' ? '#f43f5e' : '#475569'}
                  strokeWidth={activeHotspotId === 'user-button' ? 2 : 1}
                />
                <circle cx="555" cy="93" r="6" fill="#f43f5e" opacity="0.8" />
                <text x="555" y="118" fill="#94a3b8" fontSize="7" textAnchor="middle" fontFamily="monospace">
                  BUTTON
                </text>
              </g>

              {/* Active Hotspot Crosshair Marker */}
              {activeHotspot && activeHotspot.coordinates.r && (
                <circle
                  cx={activeHotspot.coordinates.x}
                  cy={activeHotspot.coordinates.y}
                  r={activeHotspot.coordinates.r + 6}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                  className="animate-spin-slow origin-center"
                />
              )}
            </svg>
          </div>

          {/* Quick Hotspot Pills Navigator */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2">
            <span className="text-[11px] font-mono text-slate-500 mr-1">Seleccionar componente:</span>
            {selectedDevice.hotspots.map((hs) => {
              const isSelected = hs.id === activeHotspotId;
              return (
                <button
                  key={hs.id}
                  onClick={() => setActiveHotspotId(hs.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {hs.name.split('(')[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Technical Inspector Panel */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="border-b border-slate-800 pb-4">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getHotspotBadgeColor(activeHotspot.type)}`}>
                {activeHotspot.type}
              </span>
              <span className="font-mono text-xs text-slate-500">
                Componente #{activeHotspot.id}
              </span>
            </div>

            <h3 className="text-xl font-bold text-white">
              {activeHotspot.name}
            </h3>
            <p className="text-slate-300 text-xs mt-1.5 leading-relaxed font-medium">
              {activeHotspot.shortRole}
            </p>
          </div>

          {/* Detailed Specifications */}
          <div className="space-y-3 text-xs">
            <div>
              <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-1 text-[11px] flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-cyan-400" /> Funcionamiento Electrónico
              </h4>
              <p className="text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                {activeHotspot.technicalDetails}
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-1 text-[11px] flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" /> Aplicación en Pentesting & Red Team
              </h4>
              <p className="text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                {activeHotspot.pentestingUtility}
              </p>
            </div>

            {/* Warning or Maintenance Tip */}
            {activeHotspot.warningTip && (
              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-200/90 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="text-[11px] leading-relaxed">
                  <strong>Recomendación técnica:</strong> {activeHotspot.warningTip}
                </span>
              </div>
            )}

            {/* Associated CLI Commands */}
            {activeHotspot.associatedCommands && (
              <div>
                <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-1.5 text-[11px] flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-purple-400" /> Comandos de Control en Consola
                </h4>
                <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                  {activeHotspot.associatedCommands.map((cmd, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-cyan-300 font-semibold"
                    >
                      pm3 --&gt; {cmd}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
