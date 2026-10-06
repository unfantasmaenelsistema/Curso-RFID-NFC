import React, { useState } from 'react';
import { AntennaRangeVisualizer } from './AntennaRangeVisualizer';
import { 
  Radio, Cpu, ShieldAlert, ShieldCheck, Zap, Info, Search, 
  Layers, ArrowRight, CheckCircle2, AlertTriangle, HelpCircle, 
  ExternalLink, Sparkles, Sliders, Droplets, Magnet, Compass, Eye
} from 'lucide-react';

export interface FrequencyBand {
  id: 'lf' | 'hf' | 'uhf' | 'microwave';
  name: string;
  shortName: string;
  frequencyRange: string;
  exactFrequencies: string[];
  wavelength: string;
  wavelengthMeters: number;
  couplingType: string;
  typicalRange: string;
  antennaType: string;
  dataRate: string;
  standards: string[];
  color: {
    bg: string;
    border: string;
    text: string;
    badge: string;
    glow: string;
    bar: string;
  };
  representativeTechs: {
    name: string;
    description: string;
    usage: string;
    securityLevel: 'Vulnerable / Sin Cifrado' | 'Cifrado Roto' | 'Seguro con AES-128';
    riskBadgeColor: string;
  }[];
  waterMetalBehavior: {
    water: string;
    metal: string;
    humanBody: string;
  };
  pentestingTools: string[];
  summary: string;
}

export const FREQUENCY_BANDS: FrequencyBand[] = [
  {
    id: 'lf',
    name: 'Baja Frecuencia (Low Frequency - LF)',
    shortName: 'LF 125 - 134 kHz',
    frequencyRange: '125 kHz - 134.2 kHz',
    exactFrequencies: ['125.0 kHz (Control de accesos general)', '134.2 kHz (Microchips animales ISO 11784/85)'],
    wavelength: '~2.400 metros (2,4 km)',
    wavelengthMeters: 2400,
    couplingType: 'Acoplamiento Inductivo de Campo Cercano Magnético (B-Field)',
    typicalRange: '1 cm a 10 cm (Campo cercano puro)',
    antennaType: 'Bobina de hilo de cobre enrollado con núcleo de aire o ferrita (cientos de vueltas concéntricas)',
    dataRate: '~2 a 8 kbps (Muy lenta)',
    standards: ['De-facto HID Prox / EM4100', 'ISO 11784 / ISO 11785 (Veterinaria FDX-B / HDX)', 'ISO 18000-2'],
    color: {
      bg: 'bg-amber-950/30',
      border: 'border-amber-500/40',
      text: 'text-amber-400',
      badge: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      glow: 'shadow-amber-500/10',
      bar: 'from-amber-600 to-yellow-500'
    },
    representativeTechs: [
      {
        name: 'HID Prox II (125 kHz)',
        description: 'Transmite formato Wiegand de 26 a 37 bits modulado en FSK. Sin desafío criptográfico.',
        usage: 'Acceso a edificios de oficinas, parkings corporativos y puertas de tornos.',
        securityLevel: 'Vulnerable / Sin Cifrado',
        riskBadgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
      },
      {
        name: 'EM4100 / EM4200 (125 kHz)',
        description: 'Chip de lectura única de 64 bits modulado en ASK/Manchester. Clona en 1 segundo a T5577.',
        usage: 'Llaveros de comunidades residenciales, piscinas públicas e intercomunicadores.',
        securityLevel: 'Vulnerable / Sin Cifrado',
        riskBadgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
      },
      {
        name: 'Indala (125 kHz PSK)',
        description: 'Modulación por desplazamiento de fase con scrambling pseudoaleatorio pero estático.',
        usage: 'Campus universitarios, hospitales y plantas industriales.',
        securityLevel: 'Vulnerable / Sin Cifrado',
        riskBadgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
      }
    ],
    waterMetalBehavior: {
      water: 'Excelente penetración. El agua casi no atenúa las ondas magnéticas a 125 kHz.',
      metal: 'Atenuación severa por corrientes de Foucault (Eddy currents). Requiere lámina de ferrita.',
      humanBody: 'Atraviesa el tejido humano sin absorberse significativamente (usado en ganado y perros).'
    },
    pentestingTools: [
      'Proxmark3 (antena LF 125 kHz con comando lf search / lf clone)',
      'Flipper Zero (antena RFID 125 kHz integrada)',
      'Clonadores manuales azules tipo "Handheld RFID Copier" (10€ en Amazon)'
    ],
    summary: 'La tecnología más antigua y extendida en edificios. No posee autenticación mutua: la tarjeta vomita su identificador UID en bucle continuo tan pronto como recibe energía electromagnética del lector.'
  },
  {
    id: 'hf',
    name: 'Alta Frecuencia & NFC (High Frequency - HF)',
    shortName: 'HF 13.56 MHz (NFC)',
    frequencyRange: '13.56 MHz (Banda ISM mundial)',
    exactFrequencies: ['13.56 MHz (Estándar mundial ISO/IEC 14443 & ISO 15693 & NFC Forum)'],
    wavelength: '~22,1 metros',
    wavelengthMeters: 22.1,
    couplingType: 'Acoplamiento Inductivo Resonante de Campo Cercano (LC Resonator a 13.56 MHz)',
    typicalRange: '2 cm a 10 cm (Intercambio intencionado y seguro a corta distancia)',
    antennaType: 'Espiras planas de pista de cobre o aluminio grabado en lámina de plástico (3 a 6 espiras)',
    dataRate: '106 kbps, 212 kbps, 424 kbps hasta 848 kbps',
    standards: ['ISO/IEC 14443 Type A & B', 'ISO/IEC 18092 (NFCIP-1)', 'ISO/IEC 15693 (Vicinity)', 'FeliCa JIS X 6319-4'],
    color: {
      bg: 'bg-cyan-950/30',
      border: 'border-cyan-500/40',
      text: 'text-cyan-400',
      badge: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
      glow: 'shadow-cyan-500/10',
      bar: 'from-cyan-600 to-teal-400'
    },
    representativeTechs: [
      {
        name: 'MIFARE Classic 1K / 4K (13.56 MHz)',
        description: 'Chip con cifrado propietario Crypto-1 de 48 bits. Roto por ataques matemáticos Nested/Darkside.',
        usage: 'Tarjetas de transporte urbano, credenciales universitarias y llaves de hotel.',
        securityLevel: 'Cifrado Roto',
        riskBadgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
      },
      {
        name: 'MIFARE DESFire EV2 / EV3 (13.56 MHz)',
        description: 'Cripto-controlador con autenticación mutua basada en hardware AES-128 y CMAC de 3 pasos.',
        usage: 'Accesos de alta seguridad corporativa, infraestructuras críticas y pagos bancarios.',
        securityLevel: 'Seguro con AES-128',
        riskBadgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
      },
      {
        name: 'NFC Forum Type 2 / NTAG213/215/216',
        description: 'Etiquetas abiertas con memoria EEPROM leíbles por cualquier smartphone nativo.',
        usage: 'Marketing interactivo, amiibos de videojuegos, configuración Wi-Fi y tarjetas de visita digitales.',
        securityLevel: 'Vulnerable / Sin Cifrado',
        riskBadgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
      }
    ],
    waterMetalBehavior: {
      water: 'Atenuación moderada. El agua y los líquidos disipan parte del campo magnético.',
      metal: 'Corrientes parasitarias desintonizan la frecuencia de 13.56 MHz. Requiere lámina aislante de ferrita anti-metal.',
      humanBody: 'Poco afectado por los dedos, pero el cuerpo completo atenúa si la tarjeta se coloca detrás de la espalda.'
    },
    pentestingTools: [
      'Cualquier smartphone Android con lector NFC (apps NFC Tools, MCT - Mifare Classic Tool)',
      'Lector USB ACR122U (soporta libnfc, mfoc, mfcuk en Linux)',
      'Proxmark3 RDV4 con antena HF (comandos hf 14a search, hf mf autopwn, hf 15 search)'
    ],
    summary: 'La banda rey de las credenciales modernas y pagos móviles. Permite comunicación bidireccional compleja con intercambio de comandos criptográficos APDU. El estándar NFC es un subconjunto de HF a 13.56 MHz.'
  },
  {
    id: 'uhf',
    name: 'Ultra Alta Frecuencia (Ultra High Frequency - UHF)',
    shortName: 'UHF 860 - 960 MHz',
    frequencyRange: '860 MHz - 960 MHz (868 MHz Europa / 915 MHz América)',
    exactFrequencies: ['865 - 868 MHz (Normativa ETSI en Europa)', '902 - 928 MHz (Normativa FCC en EEUU y América)'],
    wavelength: '~31 a 35 centímetros (0,34 m)',
    wavelengthMeters: 0.34,
    couplingType: 'Acoplamiento Electromagnético Radiante de Campo Lejano (Far-field Backscatter Modulation)',
    typicalRange: '1 metro a 12 metros (Lectura masiva a distancia sin contacto directo)',
    antennaType: 'Antena dipolo serigrafiada en plata/aluminio con trazos en zigzag optimizada para campo lejano',
    dataRate: '40 a 640 kbps (Transmisión rápida de inventario simultáneo masivo)',
    standards: ['EPCglobal Class 1 Gen 2 (EPC Gen2)', 'ISO/IEC 18000-6C', 'RAIN RFID'],
    color: {
      bg: 'bg-purple-950/30',
      border: 'border-purple-500/40',
      text: 'text-purple-400',
      badge: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
      glow: 'shadow-purple-500/10',
      bar: 'from-purple-600 to-indigo-500'
    },
    representativeTechs: [
      {
        name: 'EPC Gen2 / Impinj Monza / Alien Higgs',
        description: 'Etiquetas pasivas de bajo coste (~0,05€) con memoria TID de 64 bits y memoria EPC programable.',
        usage: 'Logística de retail (Zara, Decathlon), cajas de almacén, peajes automáticos y cronometraje deportivo.',
        securityLevel: 'Vulnerable / Sin Cifrado',
        riskBadgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
      },
      {
        name: 'UHF con Criptografía Cripto Gen2v2 (NXP UCODE DNA)',
        description: 'Chips UHF avanzados con autenticación criptográfica cripto-asistida y contraseñas de lectura/bloqueo.',
        usage: 'Matriculación de vehículos de alta seguridad, peajes electrónicos protegidos y control aduanero.',
        securityLevel: 'Seguro con AES-128',
        riskBadgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
      }
    ],
    waterMetalBehavior: {
      water: 'Absorción severa. El agua líquida absorbe intensamente la energía UHF (el cuerpo humano apantalla la señal).',
      metal: 'Reflexión directa del campo electromagnético. Requiere etiquetas "on-metal" con espaciador dieléctrico.',
      humanBody: 'Si una persona se interpone físicamente entre la antena y la etiqueta, la lectura cae drásticamente.'
    },
    pentestingTools: [
      'Lectores de desarrollo UHF ThingMagic / Impinj R420',
      'Módulos portátiles UHF YRM100 / M5Stack UHF RFID',
      'SDR (Software Defined Radio como HackRF One, RTL-SDR o BladeRF para captura de portadora a 868 MHz)'
    ],
    summary: 'Diseñado para inventario logístico masivo (hasta 800 etiquetas por segundo en un arco). En ciberseguridad, su vector principal es la fuga de privacidad por lectura encubierta a distancia (lectura de ropa de peatones a 5 metros sin que se enteren).'
  },
  {
    id: 'microwave',
    name: 'Microondas / SHF (Super High Frequency)',
    shortName: 'SHF 2.45 & 5.8 GHz',
    frequencyRange: '2.45 GHz y 5.8 GHz',
    exactFrequencies: ['2.45 GHz (Banda ISM compartida con Wi-Fi/Bluetooth)', '5.8 GHz (Banda DSRC de telepeaje europeo)'],
    wavelength: '~5 a 12 centímetros',
    wavelengthMeters: 0.05,
    couplingType: 'Propagación de Radiación Electromagnética Microondas Directa',
    typicalRange: '5 metros a 50 metros (A menudo etiquetas semipasivas o activas con batería BAP)',
    antennaType: 'Antenas microstrip tipo parche (Patch antenna) de dimensiones milimétricas',
    dataRate: 'Hasta varios Mbps',
    standards: ['ISO/IEC 18000-4 (2.45 GHz)', 'CEN DSRC EN 12253 (5.8 GHz Telepeaje)', 'IEEE 802.11/BLE RTLS'],
    color: {
      bg: 'bg-rose-950/30',
      border: 'border-rose-500/40',
      text: 'text-rose-400',
      badge: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
      glow: 'shadow-rose-500/10',
      bar: 'from-rose-600 to-pink-500'
    },
    representativeTechs: [
      {
        name: 'Telepeaje Vía-T / DSRC (5.8 GHz)',
        description: 'Dispositivos de parabrisas (OBU) que interactúan a 120 km/h en pórticos de autopistas.',
        usage: 'Peajes sin barrera (Free-flow tolling) y control de flotas de camiones.',
        securityLevel: 'Seguro con AES-128',
        riskBadgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
      },
      {
        name: 'Balizas de Localización en Tiempo Real RTLS (2.45 GHz)',
        description: 'Transpondedores activos con batería interna que transmiten telemetría periódica.',
        usage: 'Seguimiento de equipamiento médico en hospitales y contenedores marítimos en puertos.',
        securityLevel: 'Vulnerable / Sin Cifrado',
        riskBadgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
      }
    ],
    waterMetalBehavior: {
      water: 'Absorción máxima por moléculas polares de agua (misma frecuencia de los hornos microondas a 2.45 GHz).',
      metal: 'Apantallamiento total. El metal refleja totalmente el haz microondas.',
      humanBody: 'El cuerpo humano actúa como una pared absorbente de la señal.'
    },
    pentestingTools: [
      'HackRF One / USRP con antenas de 2.4 / 5 GHz',
      'Wireshark con interfaces de captura inalámbricas DSRC',
      'Flipper Zero con módulo Wi-Fi / ESP32 para banda 2.4 GHz'
    ],
    summary: 'Utilizado en aplicaciones donde la velocidad del vehículo es muy alta (autopistas) o se requiere localización tridimensional en almacenes y puertos. Generalmente requiere dispositivos activos con batería.'
  }
];

export interface FrequencySpectrumMapProps {
  onNavigateToSignals?: () => void;
}

export const FrequencySpectrumMap: React.FC<FrequencySpectrumMapProps> = ({ onNavigateToSignals }) => {
  const [selectedBandId, setSelectedBandId] = useState<'lf' | 'hf' | 'uhf' | 'microwave'>('hf');
  const [activeTab, setActiveTab] = useState<'spectrum' | 'comparison' | 'antennas' | 'wizard'>('spectrum');
  
  // Wizard state for interactive identifier
  const [wizardAnswers, setWizardAnswers] = useState<{
    phoneReads?: boolean;
    distance?: 'touch' | 'meters' | 'long';
    appearance?: 'thick' | 'thin' | 'sticker' | 'tag';
  }>({});

  const selectedBand = FREQUENCY_BANDS.find(b => b.id === selectedBandId) || FREQUENCY_BANDS[1];

  // Wizard evaluation logic
  const wizardDiagnosis = (() => {
    if (wizardAnswers.phoneReads === true) {
      return {
        band: 'HF (13.56 MHz / NFC)',
        chipLikely: 'MIFARE Classic, NTAG213/215/216, MIFARE Ultralight o DESFire',
        explanation: 'Si tu smartphone lee o hace sonar la tarjeta al acercarla, trabaja indudablemente a 13.56 MHz (HF). Los teléfonos comerciales NUNCA tienen antenas de 125 kHz ni de 868 MHz.',
        actionGuide: 'Usa la app NFC Tools o Mifare Classic Tool (MCT) para comprobar si el Sector 0 tiene clave FFFFFFFFFFFF o si el UID es de 4 o 7 bytes.',
        badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
      };
    }

    if (wizardAnswers.appearance === 'thick') {
      return {
        band: 'LF (125 kHz)',
        chipLikely: 'HID Prox II Clamshell o EM4100',
        explanation: 'Las tarjetas gruesas con ranura para cinta o numeración serigrafiada de 5 dígitos (ej. [14592 112]) son típicamente HID Prox II de 125 kHz con modulación FSK.',
        actionGuide: 'Usa una Proxmark3 con el comando `lf search` o un Flipper Zero para clonar el ID a una tarjeta regrabable T5577.',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
      };
    }

    if (wizardAnswers.appearance === 'sticker' || wizardAnswers.distance === 'meters') {
      return {
        band: 'UHF (860 - 960 MHz EPC Gen2)',
        chipLikely: 'Impinj Monza, Alien Higgs o NXP UCODE',
        explanation: 'Las pegatinas transparentes con antenas de plata grabadas en zigzag o lecturas en arcos a varios metros de distancia corresponden a la banda UHF EPC Gen2.',
        actionGuide: 'Se auditan con lectores UHF portátiles (como YRM100 o ThingMagic) o SDRs a 868 MHz / 915 MHz.',
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40'
      };
    }

    if (wizardAnswers.distance === 'touch' && wizardAnswers.phoneReads === false) {
      return {
        band: 'Probablemente LF 125 kHz (o HF con protocolo propietario)',
        chipLikely: 'EM4100, Indala, HID Prox o iCLASS propietario',
        explanation: 'Si requiere contacto cercano (1-5 cm) pero tu teléfono no reacciona en absoluto, suele ser un llavero o tarjeta de 125 kHz (incompatible con teléfonos), o bien una tarjeta HF iCLASS con protocolo no soportado por Android.',
        actionGuide: 'Comprueba con una Proxmark3 ejecutando primero `lf search` y luego `hf search` para confirmar la frecuencia exacta.',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
      };
    }

    return null;
  })();

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="max-w-4xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
            <Radio className="w-3.5 h-3.5 animate-pulse" /> Fundamentos de Física Electromagnética en Ciberseguridad
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Mapa del Espectro de Radiofrecuencia RFID y NFC (LF vs HF vs UHF)
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Uno de los errores más graves del auditor novato es intentar clonar una tarjeta de oficina con su teléfono móvil o comprar una antena equivocada para su Proxmark3. Comprender la longitud de onda, el tipo de acoplamiento físico y la banda de frecuencia es el primer paso obligatorio para no perder tiempo ni dinero.
          </p>
        </div>

        {/* Sub-view Navigation Switcher */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-slate-800">
          <button
            onClick={() => setActiveTab('spectrum')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'spectrum'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 font-bold'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Explorador Visual del Espectro (Bandas & Física)</span>
          </button>

          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'comparison'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 font-bold'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Tabla Diferenciadora: HID Prox vs MIFARE vs UHF</span>
          </button>

          <button
            onClick={() => setActiveTab('antennas')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'antennas'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 font-bold'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Simulador de Antenas y Alcance (Circular vs Rectangular)</span>
          </button>

          <button
            onClick={() => setActiveTab('wizard')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'wizard'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 font-bold'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Asistente: «¿Qué tarjeta tengo en la mano?»</span>
          </button>

          {onNavigateToSignals && (
            <button
              onClick={onNavigateToSignals}
              className="px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all bg-slate-900/80 text-indigo-300 hover:text-white border border-indigo-500/30 hover:border-indigo-500/60 ml-auto"
            >
              <Zap className="w-4 h-4 text-indigo-400" />
              <span>Ver Osciloscopio de Modulaciones ➜</span>
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: SPECTRUM EXPLORER */}
      {activeTab === 'spectrum' && (
        <div className="space-y-6">
          {/* Visual Interactive Electromagnetic Spectrum Bar */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                  Escala Logarítmica del Espectro Electromagnético
                </span>
                <h3 className="text-base font-bold text-white">
                  Haz clic en una banda para inspeccionar su física y vulnerabilidades
                </h3>
              </div>
              <span className="text-xs font-mono text-cyan-400">
                Frecuencia: {selectedBand.frequencyRange}
              </span>
            </div>

            {/* Interactive Visual Band Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              {FREQUENCY_BANDS.map((band) => {
                const isSelected = band.id === selectedBandId;
                return (
                  <button
                    key={band.id}
                    onClick={() => setSelectedBandId(band.id)}
                    className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                      isSelected
                        ? `${band.color.bg} ${band.color.border} ring-2 ring-current ${band.color.text} shadow-lg ${band.color.glow}`
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-full ${
                        isSelected ? band.color.badge : 'bg-slate-800 text-slate-300'
                      }`}>
                        {band.shortName.split(' ')[0]}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {band.wavelength}
                      </span>
                    </div>

                    <div className="font-bold text-sm text-white line-clamp-1">
                      {band.name.split('(')[0]}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {band.frequencyRange}
                    </div>

                    {/* Progress Indicator line */}
                    <div className="mt-3 w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${band.color.bar} ${isSelected ? 'w-full' : 'w-2/3 opacity-40'}`}></div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Physical Characteristics Summary Card of the Selected Band */}
            <div className={`mt-6 p-6 rounded-2xl border ${selectedBand.color.bg} ${selectedBand.color.border} space-y-6 transition-all`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                <div>
                  <span className={`text-xs font-bold font-mono uppercase px-2.5 py-0.5 rounded-full ${selectedBand.color.badge}`}>
                    Banda Seleccionada
                  </span>
                  <h3 className="text-xl font-extrabold text-white mt-1">
                    {selectedBand.name}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    {selectedBand.summary}
                  </p>
                </div>

                <div className="text-left md:text-right shrink-0">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Longitud de Onda Teórica (λ = c / f)</span>
                  <span className={`text-lg font-mono font-extrabold ${selectedBand.color.text}`}>
                    {selectedBand.wavelength}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Rango típico: {selectedBand.typicalRange}
                  </span>
                </div>
              </div>

              {/* Physical Parameters Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
                <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl space-y-1">
                  <span className="text-slate-400 text-[10px] block uppercase font-bold flex items-center gap-1.5">
                    <Magnet className="w-3.5 h-3.5 text-cyan-400" /> Acoplamiento Físico:
                  </span>
                  <p className="text-slate-200 font-sans text-xs">
                    {selectedBand.couplingType}
                  </p>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl space-y-1">
                  <span className="text-slate-400 text-[10px] block uppercase font-bold flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-amber-400" /> Formato de Antena:
                  </span>
                  <p className="text-slate-200 font-sans text-xs">
                    {selectedBand.antennaType}
                  </p>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl space-y-1">
                  <span className="text-slate-400 text-[10px] block uppercase font-bold flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-emerald-400" /> Tasa de Datos (Bitrate):
                  </span>
                  <p className="text-slate-200 font-sans text-xs">
                    {selectedBand.dataRate}
                  </p>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl space-y-1">
                  <span className="text-slate-400 text-[10px] block uppercase font-bold flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" /> Estándares Clave:
                  </span>
                  <p className="text-slate-200 font-sans text-xs">
                    {selectedBand.standards.join(', ')}
                  </p>
                </div>
              </div>

              {/* Behavior in Water and Near Metal */}
              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-white uppercase font-mono flex items-center gap-2">
                  <Droplets className="w-3.5 h-3.5 text-cyan-400" /> Comportamiento con Agua, Metal y Cuerpo Humano:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <span className="font-semibold text-cyan-300 block text-[11px]">Agua y Líquidos:</span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">{selectedBand.waterMetalBehavior.water}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <span className="font-semibold text-amber-300 block text-[11px]">Superficies Metálicas:</span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">{selectedBand.waterMetalBehavior.metal}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <span className="font-semibold text-purple-300 block text-[11px]">Cuerpo Humano:</span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">{selectedBand.waterMetalBehavior.humanBody}</p>
                  </div>
                </div>
              </div>

              {/* Technologies in this Band */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white uppercase font-mono flex items-center gap-2">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Tecnologías Representativas y Nivel de Seguridad:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {selectedBand.representativeTechs.map((tech, i) => (
                    <div key={i} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{tech.name}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${tech.riskBadgeColor}`}>
                          {tech.securityLevel}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        {tech.description}
                      </p>
                      <div className="text-[11px] text-slate-500 font-mono pt-1 border-t border-slate-800">
                        <strong className="text-slate-400">Uso real:</strong> {tech.usage}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pentesting Tools for this Band */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-white uppercase font-mono flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5 text-emerald-400" /> Herramientas de Pentesting para esta banda ({selectedBand.shortName}):
                </span>
                <ul className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-slate-300 font-mono">
                  {selectedBand.pentestingTools.map((tool, i) => (
                    <li key={i} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-2">
                      <span className="text-cyan-400 font-bold shrink-0">➜</span>
                      <span>{tool}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: DIRECT COMPARISON TABLE (HID Prox vs MIFARE vs UHF) */}
      {activeTab === 'comparison' && (
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-2">
              <Layers className="w-3.5 h-3.5" /> Cara a Cara Tecnológico
            </div>
            <h3 className="text-xl font-bold text-white">
              Diferenciación Práctica: HID Prox (125 kHz) vs MIFARE Classic / DESFire (13.56 MHz) vs EPC Gen2 (UHF)
            </h3>
            <p className="text-slate-400 text-xs mt-1 leading-relaxed">
              La siguiente matriz sintetiza las diferencias operativas y de seguridad que cualquier auditor debe saber antes de iniciar un test de intrusión físico.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-800 rounded-2xl overflow-hidden">
              <thead className="bg-slate-900 text-slate-300 uppercase font-mono text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-bold text-white">Parámetro Técnico</th>
                  <th className="py-3.5 px-4 text-amber-400 font-bold bg-amber-950/20">
                    HID Prox II (LF 125 kHz)
                  </th>
                  <th className="py-3.5 px-4 text-cyan-400 font-bold bg-cyan-950/20">
                    MIFARE Classic / DESFire (HF 13.56 MHz)
                  </th>
                  <th className="py-3.5 px-4 text-purple-400 font-bold bg-purple-950/20">
                    EPC Gen2 / Alien / Monza (UHF 868 MHz)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-sans">
                <tr className="hover:bg-slate-900/40">
                  <td className="py-3.5 px-4 font-bold text-white font-mono">Frecuencia / Banda</td>
                  <td className="py-3.5 px-4 text-slate-300 font-mono">125 kHz (Baja Frecuencia)</td>
                  <td className="py-3.5 px-4 text-slate-300 font-mono">13.56 MHz (Alta Frecuencia / NFC)</td>
                  <td className="py-3.5 px-4 text-slate-300 font-mono">865-868 MHz (EU) / 915 MHz (US)</td>
                </tr>

                <tr className="hover:bg-slate-900/40">
                  <td className="py-3.5 px-4 font-bold text-white font-mono">Tipo de Acoplamiento</td>
                  <td className="py-3.5 px-4 text-slate-300">Inductivo magnético (bobina concentrada)</td>
                  <td className="py-3.5 px-4 text-slate-300">Inductivo resonante (LC plano)</td>
                  <td className="py-3.5 px-4 text-slate-300">Electromagnético de campo lejano (Backscatter)</td>
                </tr>

                <tr className="hover:bg-slate-900/40">
                  <td className="py-3.5 px-4 font-bold text-white font-mono">Distancia de Lectura</td>
                  <td className="py-3.5 px-4 text-slate-300">1 a 8 cm</td>
                  <td className="py-3.5 px-4 text-slate-300">2 a 10 cm</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold">1 a 12 metros</td>
                </tr>

                <tr className="hover:bg-slate-900/40">
                  <td className="py-3.5 px-4 font-bold text-white font-mono">Formato Físico Habitual</td>
                  <td className="py-3.5 px-4 text-slate-300">Tarjeta rígida clamshell gruesa o llavero gota azul</td>
                  <td className="py-3.5 px-4 text-slate-300">Tarjeta fina ISO 7810 o smartphone con NFC</td>
                  <td className="py-3.5 px-4 text-slate-300">Pegatina de papel con zigzag o etiqueta colgante</td>
                </tr>

                <tr className="hover:bg-slate-900/40">
                  <td className="py-3.5 px-4 font-bold text-white font-mono">Lectura en Smartphones</td>
                  <td className="py-3.5 px-4 text-rose-400 font-bold">❌ IMPOSIBLE (Sin hardware 125k)</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold">✅ SÍ (Cualquier Android con NFC)</td>
                  <td className="py-3.5 px-4 text-rose-400 font-bold">❌ IMPOSIBLE (Sin lector UHF externo)</td>
                </tr>

                <tr className="hover:bg-slate-900/40">
                  <td className="py-3.5 px-4 font-bold text-white font-mono">Criptografía / Handshake</td>
                  <td className="py-3.5 px-4 text-rose-400">
                    <strong>Ninguna.</strong> Envía el ID en texto claro sin pedir contraseña.
                  </td>
                  <td className="py-3.5 px-4 text-amber-300">
                    <strong>Crypto-1</strong> (Classic, roto) o <strong>AES-128</strong> (DESFire EV3, seguro).
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    Generalmente sin cifrar (memoria EPC abierta); contraseñas de lectura/kill opcionales.
                  </td>
                </tr>

                <tr className="hover:bg-slate-900/40">
                  <td className="py-3.5 px-4 font-bold text-white font-mono">Vulnerabilidad Principal</td>
                  <td className="py-3.5 px-4 text-rose-300">
                    <strong>Clonado inmediato y Replay.</strong> Una tarjeta T5577 graba el UID en 1 segundo.
                  </td>
                  <td className="py-3.5 px-4 text-amber-300">
                    <strong>Ataques Nested/Darkside</strong> en Classic; <strong>Relay Attack</strong> en DESFire si no hay ToF.
                  </td>
                  <td className="py-3.5 px-4 text-purple-300">
                    <strong>Lectura oculta masiva a 6 metros</strong> (espionaje de inventario y tracking de peatones).
                  </td>
                </tr>

                <tr className="hover:bg-slate-900/40">
                  <td className="py-3.5 px-4 font-bold text-white font-mono">Herramienta de Pentesting</td>
                  <td className="py-3.5 px-4 font-mono text-cyan-300">
                    Proxmark3 (`lf hid read` / `lf hid sim`), Flipper Zero
                  </td>
                  <td className="py-3.5 px-4 font-mono text-cyan-300">
                    Proxmark3 (`hf mf autopwn`), ACR122U, Android MCT
                  </td>
                  <td className="py-3.5 px-4 font-mono text-cyan-300">
                    Lector ThingMagic, HackRF One / RTL-SDR a 868 MHz
                  </td>
                </tr>

                <tr className="hover:bg-slate-900/40">
                  <td className="py-3.5 px-4 font-bold text-white font-mono">Remediación de Seguridad</td>
                  <td className="py-3.5 px-4 text-emerald-300">
                    Sustituir de inmediato por MIFARE DESFire EV3 u OSDP v2.
                  </td>
                  <td className="py-3.5 px-4 text-emerald-300">
                    Deshabilitar Crypto-1; migrar a AES con diversificación KDF.
                  </td>
                  <td className="py-3.5 px-4 text-emerald-300">
                    Activar contraseñas de bloqueo y chips con criptografía UCODE DNA.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: ANTENNA RANGE & GEOMETRY SIMULATOR */}
      {activeTab === 'antennas' && (
        <div className="space-y-6">
          <AntennaRangeVisualizer />
        </div>
      )}

      {/* VIEW 4: INTERACTIVE IDENTIFIER WIZARD */}
      {activeTab === 'wizard' && (
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
              <Compass className="w-3.5 h-3.5" /> Asistente de Reconocimiento Rápido
            </div>
            <h3 className="text-xl font-bold text-white">
              ¿Qué tipo de tarjeta o credencial tienes delante?
            </h3>
            <p className="text-slate-400 text-xs mt-1 leading-relaxed">
              Responde a estas 3 preguntas observables a simple vista para que el sistema identifique la banda de frecuencia, el chip probable y el vector de auditoría recomendado.
            </p>
          </div>

          {/* Interactive Question Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Question 1: Smartphone NFC Test */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <span className="text-cyan-400 text-xs font-mono font-bold block">Pregunta 1: Prueba de Smartphone</span>
              <h4 className="text-sm font-bold text-white">¿Tu teléfono Android con NFC la detecta o emite un sonido?</h4>
              <p className="text-[11px] text-slate-400">Pasa la tarjeta por la parte trasera de un móvil con NFC activado.</p>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setWizardAnswers(prev => ({ ...prev, phoneReads: true }))}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                    wizardAnswers.phoneReads === true
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Sí, la lee / vibra
                </button>
                <button
                  onClick={() => setWizardAnswers(prev => ({ ...prev, phoneReads: false }))}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                    wizardAnswers.phoneReads === false
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  No reacciona
                </button>
              </div>
            </div>

            {/* Question 2: Physical Appearance */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <span className="text-amber-400 text-xs font-mono font-bold block">Pregunta 2: Aspecto Visual</span>
              <h4 className="text-sm font-bold text-white">¿Cómo es físicamente la tarjeta o etiqueta?</h4>
              <p className="text-[11px] text-slate-400">Observa el grosor, ranuras o patrones visibles al trasluz.</p>
              <div className="space-y-1.5 pt-2">
                {[
                  { id: 'thick', label: 'Gruesa con ranura (Clamshell 1.8mm)' },
                  { id: 'thin', label: 'Tarjeta fina normal tipo crédito (0.76mm)' },
                  { id: 'sticker', label: 'Pegatina transparente con zigzag de aluminio' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setWizardAnswers(prev => ({ ...prev, appearance: item.id as any }))}
                    className={`w-full py-1.5 px-3 rounded-xl text-xs text-left transition-all ${
                      wizardAnswers.appearance === item.id
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Question 3: Operational Distance */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <span className="text-purple-400 text-xs font-mono font-bold block">Pregunta 3: Distancia de Lectura</span>
              <h4 className="text-sm font-bold text-white">¿A qué distancia suele abrir la puerta o leerse?</h4>
              <p className="text-[11px] text-slate-400">Observa cómo interactúa en el lector de pared o torno.</p>
              <div className="space-y-1.5 pt-2">
                {[
                  { id: 'touch', label: 'Casi pegada al lector (1 - 5 cm)' },
                  { id: 'meters', label: 'A varios metros (peaje o arco de tienda)' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setWizardAnswers(prev => ({ ...prev, distance: item.id as any }))}
                    className={`w-full py-1.5 px-3 rounded-xl text-xs text-left transition-all ${
                      wizardAnswers.distance === item.id
                        ? 'bg-purple-500 text-slate-950 font-bold shadow-md'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Diagnostic Result Box */}
          {wizardDiagnosis ? (
            <div className="p-6 rounded-2xl bg-slate-900 border border-cyan-500/40 shadow-xl space-y-3 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full ${wizardDiagnosis.badgeColor}`}>
                    Diagnóstico Automático
                  </span>
                  <h4 className="text-lg font-extrabold text-white mt-1">
                    Banda Identificada: {wizardDiagnosis.band}
                  </h4>
                </div>
                <div className="text-left sm:text-right font-mono text-xs text-slate-400">
                  Familia probable: <strong className="text-white">{wizardDiagnosis.chipLikely}</strong>
                </div>
              </div>

              <p className="text-slate-300 text-xs leading-relaxed">
                {wizardDiagnosis.explanation}
              </p>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white">Siguiente paso de pentesting recomendado:</span>
                  <p className="text-slate-300 font-mono text-[11px] mt-0.5">{wizardDiagnosis.actionGuide}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center text-xs text-slate-400 font-mono">
              Selecciona las respuestas en las 3 preguntas superiores para obtener la clasificación inmediata.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
