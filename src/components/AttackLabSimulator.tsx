import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, Play, Pause, RotateCcw, ArrowRight, ArrowLeft, 
  Terminal, ShieldCheck, CheckCircle2, AlertTriangle, Radio, 
  Cpu, Zap, Eye, HelpCircle, Layers, FastForward 
} from 'lucide-react';

export interface AttackStep {
  stepNumber: number;
  title: string;
  source: 'Reader' | 'Attacker' | 'Tag' | 'Network';
  target: 'Reader' | 'Attacker' | 'Tag' | 'Network';
  packetPayload: string;
  explanation: string;
  vulnerabilityDetails: string;
  defenseRecommendation: string;
  cliCommand?: string;
  highlightZone: 'crypto' | 'rf' | 'storage' | 'network';
}

export interface AttackScenario {
  id: string;
  name: string;
  category: string;
  standard: string;
  threatLevel: 'Crítico' | 'Alto' | 'Medio';
  description: string;
  prerequisites: string;
  actors: { name: string; role: string; type: 'reader' | 'attacker' | 'tag' }[];
  steps: AttackStep[];
}

export const ATTACK_SCENARIOS: AttackScenario[] = [
  {
    id: 'nested-attack',
    name: 'Ataque Nested (MIFARE Classic Crypto-1)',
    category: 'Criptoanálisis de Alta Frecuencia (13.56 MHz)',
    standard: 'ISO/IEC 14443-3A / Crypto-1',
    threatLevel: 'Crítico',
    description: 'Explota la correlación temporal y el generador de números pseudoaleatorios (PRNG) débil de NXP. Conociendo una sola clave (ej. Sector 0 por defecto), el atacante recupera las claves de todos los demás sectores sin fuerza bruta.',
    prerequisites: 'Tener al menos 1 clave conocida de cualquier sector (ej. FFFFFFFFFFFF o A0A1A2A3A4A5).',
    actors: [
      { name: 'Lector / Proxmark3', role: 'Inicia autenticaciones consecutivas sin cortar el campo RF', type: 'attacker' },
      { name: 'Tarjeta MIFARE Classic', role: 'Chip con PRNG determinista basado en LFSR de 16 bits', type: 'tag' }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Paso 1: Autenticación inicial en sector conocido (Sector 0)',
        source: 'Attacker',
        target: 'Tag',
        packetPayload: 'AUTH(Sector 0, Key A conocida: FFFFFFFFFFFF)',
        explanation: 'El atacante se autentica normalmente en el Sector 0 usando la clave por defecto. El chip valida la clave y arranca la sesión cifrada con Crypto-1.',
        vulnerabilityDetails: 'La tarjeta queda en estado autenticado manteniendo la alimentación del campo RF constante.',
        defenseRecommendation: 'Migrar a chips con autenticación mutua AES-128 (MIFARE DESFire EV2/EV3).',
        cliCommand: 'hf mf chk --dump',
        highlightZone: 'crypto'
      },
      {
        stepNumber: 2,
        title: 'Paso 2: Solicitud Nested de autenticación en Sector Objetivo (Sector 1)',
        source: 'Attacker',
        target: 'Tag',
        packetPayload: 'NESTED_AUTH(Sector 1) dentro de sesión cifrada',
        explanation: 'Sin apagar la antena, el atacante solicita autenticarse en el Sector 1 (cuya clave es desconocida). La tarjeta genera un nuevo número aleatorio (nonce Nt\').',
        vulnerabilityDetails: 'El generador de números pseudoaleatorios (PRNG) no es aleatorio real: avanza un número predecible de estados del registro LFSR por cada ciclo de reloj.',
        defenseRecommendation: 'Implementar TRNG (True Random Number Generator) certificado con entropía física.',
        cliCommand: 'hf mf nested 1 A FFFFFFFFFFFF',
        highlightZone: 'rf'
      },
      {
        stepNumber: 3,
        title: 'Paso 3: Recepción de Nonces y medición de distancia temporal (Δt)',
        source: 'Tag',
        target: 'Attacker',
        packetPayload: 'Nonce cifrado {Nt\'} (32 bits)',
        explanation: 'La tarjeta devuelve el nonce del Sector 1. El atacante conoce con exactitud cuántos microsegundos han transcurrido desde el nonce del Sector 0.',
        vulnerabilityDetails: 'Colapso del espacio de claves: de las 2^48 claves posibles de Crypto-1, solo unas 4.096 claves matemáticas coinciden con la diferencia entre Nt y Nt\'.',
        defenseRecommendation: 'Utilizar cifrados modernos resistentes a correlación de estados (AES/GCM).',
        cliCommand: 'hf mf autopwn',
        highlightZone: 'crypto'
      },
      {
        stepNumber: 4,
        title: 'Paso 4: Recuperación de la clave desconocida en milisegundos',
        source: 'Attacker',
        target: 'Tag',
        packetPayload: 'Clave recuperada: Key A = 1B 4F 99 C2 08 3A',
        explanation: 'El software Crapto1 resuelve la ecuación algebraica en el microcontrolador o portátil. Todas las 32 claves de los 16 sectores se descargan en segundos.',
        vulnerabilityDetails: 'Fallo total de confidencialidad en toda la tarjeta MIFARE Classic.',
        defenseRecommendation: 'Reemplazo inmediato por credenciales con claves diversificadas por tarjeta (KDF).',
        cliCommand: 'hf mf dump',
        highlightZone: 'storage'
      }
    ]
  },
  {
    id: 'replay-attack',
    name: 'Ataque de Reproducción / Replay Attack (LF 125 kHz)',
    category: 'Vulnerabilidad de Baja Frecuencia (125 kHz)',
    standard: 'HID Prox II / EM4100 / Wiegand',
    threatLevel: 'Crítico',
    description: 'En tecnologías de 125 kHz sin cifrado ni desafío criptográfico, la tarjeta transmite el mismo identificador una y otra vez. El atacante graba la señal y la reemite cuando desee.',
    prerequisites: 'Cualquier dispositivo receptor de 125 kHz (Proxmark3 o Flipper Zero).',
    actors: [
      { name: 'Lector de Pared Corporativo', role: 'Emite portadora 125 kHz constante y espera modulación Wiegand', type: 'reader' },
      { name: 'Atacante (Proxmark3 / Flipper)', role: 'Sniffa la señal y emula el identificador', type: 'attacker' },
      { name: 'Tarjeta Legítima (Víctima)', role: 'Transmite Facility Code + Card ID en texto claro', type: 'tag' }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Paso 1: Lectura legítima durante la jornada laboral',
        source: 'Tag',
        target: 'Reader',
        packetPayload: 'FSK 125 kHz: [Wiegand 26-bit: FC=112, CN=14592]',
        explanation: 'El empleado acerca su tarjeta corporativa para entrar a la oficina. El lector activa el relé y abre la puerta.',
        vulnerabilityDetails: 'La transmisión ocurre en texto plano en el aire. No existe cifrado, handshake ni verificación de frescura (sin nonces ni timestamp).',
        defenseRecommendation: 'Migrar lectores y credenciales a tecnologías con autenticación mutua (HID SEOS o MIFARE DESFire EV3).',
        cliCommand: 'lf search',
        highlightZone: 'rf'
      },
      {
        stepNumber: 2,
        title: 'Paso 2: Interceptación pasiva o clonación por proximidad',
        source: 'Tag',
        target: 'Attacker',
        packetPayload: 'Copia exacta de los 26 bits en memoria del atacante',
        explanation: 'Un atacante con un Flipper Zero en el bolsillo o un lector Proxmark3 en la mochila pasa cerca del empleado y captura la trama Wiegand en menos de 1 segundo.',
        vulnerabilityDetails: 'La tarjeta responde a cualquier lector que emita una portadora de 125 kHz sin pedir autorización.',
        defenseRecommendation: 'Bolsas y fundas protectoras Faraday para tarjetas de empleados.',
        cliCommand: 'lf hid read',
        highlightZone: 'rf'
      },
      {
        stepNumber: 3,
        title: 'Paso 3: Ataque Replay nocturno en el torno de acceso',
        source: 'Attacker',
        target: 'Reader',
        packetPayload: 'REPLAY: Simulación activa de FC=112, CN=14592',
        explanation: 'Fuera del horario laboral, el atacante aproxima el dispositivo al lector de pared y emite la misma modulación FSK capturada.',
        vulnerabilityDetails: 'El lector no tiene forma de distinguir entre la tarjeta de plástico legítima y el emulador del atacante.',
        defenseRecommendation: 'Sistemas con detección de jitter de emulación y protocolo OSDP v2 con canal cifrado.',
        cliCommand: 'lf hid sim --fc 112 --cn 14592',
        highlightZone: 'rf'
      },
      {
        stepNumber: 4,
        title: 'Paso 4: Apertura física no autorizada y acceso al edificio',
        source: 'Reader',
        target: 'Attacker',
        packetPayload: 'Relé de puerta activado (Acceso Concedido)',
        explanation: 'El controlador valida el Facility Code 112 y el Card Number 14592 en su base de datos y abre la cerradura electromecánica.',
        vulnerabilityDetails: 'Violación del perímetro de seguridad física sin forzar cerraduras ni dejar evidencia visible.',
        defenseRecommendation: 'Doble factor de autenticación física (Tarjeta + PIN o Biometría) en zonas críticas.',
        highlightZone: 'storage'
      }
    ]
  },
  {
    id: 'darkside-attack',
    name: 'Ataque Darkside (Fuga en Paridad de NACKs)',
    category: 'Criptoanálisis Teórico Avanzado',
    standard: 'MIFARE Classic / Courtois 2009',
    threatLevel: 'Crítico',
    description: 'Permite obtener la primera clave de una tarjeta MIFARE Classic cuando NO se conoce ninguna clave por defecto. Explota la respuesta NACK del chip que filtra bits de paridad cifrados.',
    prerequisites: 'Tarjeta MIFARE Classic con PRNG clásico (vulnerable a predicción de paridad).',
    actors: [
      { name: 'Atacante (Proxmark3 / mfcuk)', role: 'Envía intentos de autenticación calculados con paridad manipulada', type: 'attacker' },
      { name: 'Tarjeta MIFARE Classic', role: 'Devuelve código NACK de 4 bits con información de paridad', type: 'tag' }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Paso 1: Solicitud de autenticación sin claves previas',
        source: 'Attacker',
        target: 'Tag',
        packetPayload: 'AUTH(Sector 0) con clave conjeturada',
        explanation: 'El atacante solicita autenticarse en el Sector 0 sin conocer la clave secreta.',
        vulnerabilityDetails: 'La tarjeta devuelve un nonce Nt de 32 bits.',
        defenseRecommendation: 'Actualizar a MIFARE Plus o DESFire EV3 con cifrado estándar abierto.',
        cliCommand: 'hf mf darkside',
        highlightZone: 'rf'
      },
      {
        stepNumber: 2,
        title: 'Paso 2: Inyección de respuesta con paridad controlada',
        source: 'Attacker',
        target: 'Tag',
        packetPayload: 'Ar inválido + Bits de paridad manipulados',
        explanation: 'El atacante envía una respuesta deliberadamente incorrecta pero manipulando los bits de paridad para forzar una respuesta de error específica.',
        vulnerabilityDetails: 'La especificación de NXP envía una trama NACK de 4 bits cuando la paridad es correcta pero la autenticación falla.',
        defenseRecommendation: 'Diseñar protocolos donde los mensajes de error no filtren información de canal lateral.',
        cliCommand: 'mfcuk -C -R 0:A -v 2',
        highlightZone: 'crypto'
      },
      {
        stepNumber: 3,
        title: 'Paso 3: Fuga de información en la respuesta de error NACK',
        source: 'Tag',
        target: 'Attacker',
        packetPayload: 'NACK (0x5) cifrado con paridad observable',
        explanation: 'La tarjeta confirma que el bit de paridad coincidió con el keystream interno. Cada intercambio filtra 3 bits del estado interno del registro LFSR de 48 bits.',
        vulnerabilityDetails: 'Fuga de canal lateral matemático en el protocolo de enlace de radio.',
        defenseRecommendation: 'Implementar limitador de intentos de autenticación errónea (rate limiting).',
        highlightZone: 'crypto'
      },
      {
        stepNumber: 4,
        title: 'Paso 4: Recuperación de la primera clave secreta',
        source: 'Attacker',
        target: 'Tag',
        packetPayload: 'Primera clave recuperada: Key A = A0 B1 C2 D3 E4 F5',
        explanation: 'Tras aproximadamente 300 - 800 consultas (menos de 2 minutos), el atacante reconstruye el estado completo del generador y obtiene la primera clave.',
        vulnerabilityDetails: 'Una vez obtenida la primera clave, el atacante pasa inmediatamente al ataque Nested para crackear el resto de sectores.',
        defenseRecommendation: 'Desmantelar sistemas MIFARE Classic en infraestructuras críticas.',
        cliCommand: 'hf mf autopwn',
        highlightZone: 'storage'
      }
    ]
  },
  {
    id: 'relay-attack',
    name: 'Ataque de Relevo / Relay Attack (NFCGate)',
    category: 'Man-in-the-Middle a Distancia',
    standard: 'ISO 14443 / NFC Forum / Emulación HCE',
    threatLevel: 'Crítico',
    description: 'Puentea la comunicación entre la tarjeta de la víctima y el lector a kilómetros de distancia mediante internet móvil (4G/WiFi), eludiendo el cifrado ya que el atacante no necesita descifrar los datos.',
    prerequisites: '2 smartphones Android con NFC y la aplicación NFCGate conectada a un servidor de retransmisión.',
    actors: [
      { name: 'Lector Corporativo de Entrada', role: 'Inicia el handshake pensando que la tarjeta está en la puerta', type: 'reader' },
      { name: 'Cómplice B (Emulador en la puerta)', role: 'Emula el chip ante el lector de pared', type: 'attacker' },
      { name: 'Cómplice A (Lector en el metro)', role: 'Acerca el teléfono al bolsillo de la víctima', type: 'attacker' },
      { name: 'Tarjeta de la Víctima (En el bolsillo)', role: 'Responde legítimamente sin saber dónde está el lector', type: 'tag' }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Paso 1: Desafío emitido por el lector de la empresa',
        source: 'Reader',
        target: 'Attacker',
        packetPayload: 'Desafío AES / APDU: GetChallenge()',
        explanation: 'El cómplice B acerca su smartphone a la puerta de la oficina. El lector envía el primer comando APDU.',
        vulnerabilityDetails: 'El protocolo asume que si la tarjeta responde dentro del rango de microsegundos normales, está físicamente en la puerta.',
        defenseRecommendation: 'Protocolos de acotamiento de distancia (Distance Bounding) basados en tiempo de vuelo (Time of Flight - ToF).',
        highlightZone: 'rf'
      },
      {
        stepNumber: 2,
        title: 'Paso 2: Retransmisión por socket TCP/IP a través de Internet',
        source: 'Attacker',
        target: 'Attacker',
        packetPayload: 'Tunnel TCP: APDU retransmitido vía 4G a 15 km de distancia',
        explanation: 'La app NFCGate del cómplice B envía la trama sin modificar por la red al smartphone del cómplice A.',
        vulnerabilityDetails: 'La latencia de las redes móviles 4G/5G modernas (10-30 ms) entra dentro del tiempo de espera de respuesta (FWT - Frame Waiting Time) de muchos lectores comerciales.',
        defenseRecommendation: 'Reducir el timeout FWT al límite mínimo estricto permitido por la norma ISO 14443.',
        cliCommand: 'nfcgate-server --port 5566',
        highlightZone: 'network'
      },
      {
        stepNumber: 3,
        title: 'Paso 3: Interrogación a la tarjeta en el bolsillo de la víctima',
        source: 'Attacker',
        target: 'Tag',
        packetPayload: 'El smartphone A transmite el APDU a la tarjeta física',
        explanation: 'El cómplice A, situado junto a la víctima en una cafetería, inyecta el comando por la antena NFC de su teléfono.',
        vulnerabilityDetails: 'La tarjeta legítima calcula la firma criptográfica válida creyendo que está frente al lector del edificio.',
        defenseRecommendation: 'Fundas blindadas para tarjetas corporativas y bloqueo de lectura sin confirmación del usuario.',
        highlightZone: 'rf'
      },
      {
        stepNumber: 4,
        title: 'Paso 4: Respuesta criptográfica válida y apertura de la puerta',
        source: 'Attacker',
        target: 'Reader',
        packetPayload: 'Respuesta AES válida inyectada en el lector ➔ ¡PUERTA ABIERTA!',
        explanation: 'La respuesta viaja de vuelta por internet y el cómplice B la entrega al lector de la puerta. El torno se abre sin que ningún atacante haya conocido la clave AES.',
        vulnerabilityDetails: 'El cifrado AES-128 más seguro del mundo es inútil frente a un Relay Attack si no existe verificación de proximidad física (Proximity Check).',
        defenseRecommendation: 'Habilitar la función "Proximity Check" nativa de MIFARE DESFire EV2/EV3 que mide tiempos de respuesta por debajo de nanosegundos.',
        highlightZone: 'crypto'
      }
    ]
  }
];

export const AttackLabSimulator: React.FC = () => {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState<number>(0);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const scenario = ATTACK_SCENARIOS[selectedScenarioIndex];
  const step = scenario.steps[currentStepIndex];

  // Auto-play timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPlaying) {
      timer = setTimeout(() => {
        if (currentStepIndex < scenario.steps.length - 1) {
          setCurrentStepIndex(prev => prev + 1);
        } else {
          setIsPlaying(false);
        }
      }, 3500);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isPlaying, currentStepIndex, scenario.steps.length]);

  const handleNext = () => {
    if (currentStepIndex < scenario.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  const progressPercent = Math.round(((currentStepIndex + 1) / scenario.steps.length) * 100);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 border border-rose-500/30 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold mb-2">
              <Zap className="w-3.5 h-3.5 animate-pulse" /> Laboratorio Interactivo de Vectores de Ataque
            </div>
            <h2 className="text-2xl font-bold text-white">
              Simulador Visual de Flujo de Ataques & Desafío-Respuesta
            </h2>
            <p className="text-slate-300 text-sm mt-1 leading-relaxed">
              Analiza paso a paso los ataques más emblemáticos de la ciberseguridad física (Ataque Nested, Replay en 125 kHz, Darkside y Relay Attacks con NFCGate) observando la secuencia exacta de tramas entre el lector, el atacante y la credencial.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-md ${
                isPlaying 
                  ? 'bg-amber-600 hover:bg-amber-500 text-white' 
                  : 'bg-rose-600 hover:bg-rose-500 text-white'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? 'Pausar Simulación' : 'Reproducir Flujo'}</span>
            </button>

            <button
              onClick={handleReset}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
              title="Reiniciar paso a paso"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Scenario Selector Pills */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <div className="text-xs text-slate-400 font-mono mb-2 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Selecciona un Escenario de Ataque:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {ATTACK_SCENARIOS.map((sc, idx) => {
              const isSelected = selectedScenarioIndex === idx;
              return (
                <button
                  key={sc.id}
                  onClick={() => {
                    setSelectedScenarioIndex(idx);
                    setCurrentStepIndex(0);
                    setIsPlaying(false);
                  }}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    isSelected
                      ? 'bg-slate-800 border-rose-500 ring-1 ring-rose-500/40 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-bold text-white line-clamp-1">{sc.name.split('(')[0]}</span>
                    <span className={`px-1.5 py-0.2 rounded font-mono text-[10px] font-bold ${
                      sc.threatLevel === 'Crítico' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {sc.threatLevel}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{sc.category}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Walkthrough Container */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Scenario Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold uppercase">
                {scenario.category}
              </span>
              <span className="text-slate-400 text-xs font-mono">
                Estándar: {scenario.standard}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white">
              {scenario.name}
            </h3>
            <p className="text-slate-400 text-xs mt-1 max-w-3xl">
              {scenario.description}
            </p>
          </div>

          <div className="text-right sm:text-right">
            <span className="text-[11px] text-slate-500 font-mono block">Progreso del Ataque:</span>
            <span className="text-sm font-mono font-bold text-cyan-400">
              Paso {currentStepIndex + 1} de {scenario.steps.length} ({progressPercent}%)
            </span>
          </div>
        </div>

        {/* Progress Step Bar */}
        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div 
            className="h-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-400 transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        {/* Visual Animated Sequence / Flow Diagram */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 sm:p-8 relative overflow-hidden">
          {/* Subtle grid background */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-30 pointer-events-none"></div>

          {/* Actor Nodes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center relative z-10">
            {/* Actor 1: Reader */}
            <div className={`p-4 rounded-2xl border transition-all ${
              step.source === 'Reader' || step.target === 'Reader'
                ? 'bg-slate-800/90 border-cyan-500 ring-2 ring-cyan-500/30 shadow-lg shadow-cyan-500/10'
                : 'bg-slate-950/70 border-slate-800 opacity-60'
            }`}>
              <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mx-auto mb-2 shadow-inner">
                <Radio className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-white text-sm">Lector de Pared</h4>
              <span className="text-[11px] text-slate-400 font-mono block mt-0.5">Control de Accesos</span>
              {(step.source === 'Reader' || step.target === 'Reader') && (
                <span className="mt-2 inline-block px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold uppercase font-mono animate-pulse">
                  {step.source === 'Reader' ? 'Transmisor TX' : 'Receptor RX'}
                </span>
              )}
            </div>

            {/* Actor 2: Attacker (Proxmark3 / Sniffer) */}
            <div className={`p-4 rounded-2xl border transition-all ${
              step.source === 'Attacker' || step.target === 'Attacker'
                ? 'bg-slate-800/90 border-rose-500 ring-2 ring-rose-500/30 shadow-lg shadow-rose-500/10'
                : 'bg-slate-950/70 border-slate-800 opacity-60'
            }`}>
              <div className="w-12 h-12 rounded-xl bg-rose-950 border border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto mb-2 shadow-inner">
                <Cpu className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-white text-sm">Atacante / Proxmark3</h4>
              <span className="text-[11px] text-slate-400 font-mono block mt-0.5">Dispositivo de Pentesting</span>
              {(step.source === 'Attacker' || step.target === 'Attacker') && (
                <span className="mt-2 inline-block px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold uppercase font-mono animate-pulse">
                  {step.source === 'Attacker' ? 'Inyección TX' : 'Captura RX'}
                </span>
              )}
            </div>

            {/* Actor 3: Tag / Credential */}
            <div className={`p-4 rounded-2xl border transition-all ${
              step.source === 'Tag' || step.target === 'Tag'
                ? 'bg-slate-800/90 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-500/10'
                : 'bg-slate-950/70 border-slate-800 opacity-60'
            }`}>
              <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto mb-2 shadow-inner">
                <Layers className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-white text-sm">Tarjeta Víctima</h4>
              <span className="text-[11px] text-slate-400 font-mono block mt-0.5">Chip Transpondedor</span>
              {(step.source === 'Tag' || step.target === 'Tag') && (
                <span className="mt-2 inline-block px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase font-mono animate-pulse">
                  {step.source === 'Tag' ? 'Respuesta TX' : 'Interrogación RX'}
                </span>
              )}
            </div>
          </div>

          {/* Animated Packet Stream Banner */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold text-[11px]">
                  Flujo Activo: {step.source} ➔ {step.target}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-cyan-400 font-bold">{step.title}</span>
              </div>

              <div className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400 font-bold text-xs select-all">
                {step.packetPayload}
              </div>
            </div>
          </div>

          {/* Interactive Challenge-Response Sequence Ladder Diagram */}
          <div className="mt-6 pt-6 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-cyan-400" /> Diagrama de Secuencia Criptográfica (Challenge-Response)
              </span>
              <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                Haz clic en cualquier trama para saltar a ese paso
              </span>
            </div>

            <div className="bg-slate-950/80 rounded-xl border border-slate-800 p-4 space-y-2">
              {scenario.steps.map((s, idx) => {
                const isActive = currentStepIndex === idx;
                const isPassed = currentStepIndex > idx;

                // Determine directional layout
                const isReaderToAttacker = s.source === 'Reader' && s.target === 'Attacker';
                const isAttackerToReader = s.source === 'Attacker' && s.target === 'Reader';
                const isAttackerToTag = s.source === 'Attacker' && s.target === 'Tag';
                const isTagToAttacker = s.source === 'Tag' && s.target === 'Attacker';
                const isTagToReader = s.source === 'Tag' && s.target === 'Reader';
                const isSelf = s.source === s.target;

                return (
                  <div
                    key={s.stepNumber}
                    onClick={() => {
                      setCurrentStepIndex(idx);
                      setIsPlaying(false);
                    }}
                    className={`p-2.5 rounded-lg border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono ${
                      isActive
                        ? 'bg-slate-800/90 border-cyan-500 ring-1 ring-cyan-500/40 text-white shadow-md'
                        : isPassed
                        ? 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                        : 'bg-slate-950/50 border-slate-900 text-slate-500 hover:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                        isActive
                          ? 'bg-cyan-500 text-slate-950'
                          : isPassed
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {s.stepNumber}
                      </span>
                      <span className={`font-semibold ${isActive ? 'text-white' : 'text-slate-300'}`}>
                        {s.title.split(':')[1] || s.title}
                      </span>
                    </div>

                    {/* Visual Vector Arrow between Actors */}
                    <div className="flex items-center gap-2 px-3 py-1 rounded bg-slate-950/60 border border-slate-800 text-[11px]">
                      <span className={`font-bold ${
                        s.source === 'Reader' ? 'text-cyan-400' :
                        s.source === 'Attacker' ? 'text-rose-400' : 'text-emerald-400'
                      }`}>
                        {s.source}
                      </span>
                      
                      {/* Direction Icon & Type */}
                      <span className="text-slate-500 font-bold px-1">
                        {isSelf ? '⟲ (Túnel IP)' : '──►'}
                      </span>

                      <span className={`font-bold ${
                        s.target === 'Reader' ? 'text-cyan-400' :
                        s.target === 'Attacker' ? 'text-rose-400' : 'text-emerald-400'
                      }`}>
                        {s.target}
                      </span>

                      <span className="text-slate-600 hidden lg:inline">|</span>

                      <span className="text-slate-300 text-[11px] truncate max-w-xs hidden lg:inline">
                        {s.packetPayload}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.highlightZone === 'crypto' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                        s.highlightZone === 'rf' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                        s.highlightZone === 'network' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      }`}>
                        {s.highlightZone.toUpperCase()}
                      </span>
                      {isActive && (
                        <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold animate-pulse">
                          EN CURSO
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Detailed Step Analysis Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          {/* Left: What happens + Vulnerability details */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h4 className="font-bold text-white text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
              <Eye className="w-4 h-4 text-cyan-400" /> Detalle Técnico del Intercambio
            </h4>
            <p className="text-slate-300 leading-relaxed text-xs">
              {step.explanation}
            </p>

            <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 text-rose-200/90 space-y-1">
              <span className="font-bold text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Falla de Seguridad Explotada:
              </span>
              <p className="text-[11px] leading-relaxed">
                {step.vulnerabilityDetails}
              </p>
            </div>
          </div>

          {/* Right: Remediation & Command */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h4 className="font-bold text-white text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Medida de Remediación & Hardening
            </h4>
            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-200/90 space-y-1">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Recomendación para el Cliente:
              </span>
              <p className="text-[11px] leading-relaxed">
                {step.defenseRecommendation}
              </p>
            </div>

            {step.cliCommand && (
              <div className="space-y-1 font-mono pt-1">
                <span className="text-slate-400 text-[10px] block">Comando de terminal asociado:</span>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-cyan-400 font-bold flex items-center justify-between">
                  <span>pm3 --&gt; {step.cliCommand}</span>
                  <Terminal className="w-3.5 h-3.5 text-slate-500" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Step Navigation Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Paso Anterior
          </button>

          <div className="flex items-center gap-1.5">
            {scenario.steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStepIndex(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  currentStepIndex === i
                    ? 'w-6 bg-cyan-400'
                    : 'bg-slate-700 hover:bg-slate-500'
                }`}
                title={`Ir al paso ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={currentStepIndex === scenario.steps.length - 1}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md"
          >
            Siguiente Paso <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
