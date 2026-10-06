import React, { useState } from 'react';
import { 
  Radio, Cpu, CheckCircle2, Circle, AlertTriangle, ArrowRight, 
  ArrowLeft, RotateCcw, Copy, Check, Play, ShieldAlert, ShieldCheck, 
  Sparkles, Terminal, Activity, Eye, Zap, HelpCircle, Layers, Unlock, Lock
} from 'lucide-react';

export interface CloningStep {
  stepNumber: number;
  title: string;
  phaseName: string;
  command: string;
  hardwareAction: string;
  signalDetails: {
    frequency: string;
    modulation: string;
    voltage: string;
    coupling: string;
  };
  terminalOutput: string[];
  explanation: string;
  troubleshootingTip: string;
}

export const CLONING_STEPS: CloningStep[] = [
  {
    stepNumber: 1,
    title: 'Diagnóstico de Antena & Sintonización (Antenna Tuning)',
    phaseName: 'Fase 1: Preparación Física',
    command: 'hw tune',
    hardwareAction: 'Conecta el Proxmark3 por USB. Retira cualquier tarjeta de la antena para medir el voltaje en vacío.',
    signalDetails: {
      frequency: '125.00 kHz (LF)',
      modulation: 'Portadora no modulada CW',
      voltage: '34.2 V pico a pico (Óptimo > 28V)',
      coupling: 'Campo magnético B en circuito LC resonante'
    },
    terminalOutput: [
      '[#] Ejecutando diagnósticos de antena...',
      '[+] Medición de voltaje pico a pico en bobinas:',
      '[+]   Antena LF (125 kHz) : 34.2 V @ 125.00 kHz [Sintonizada OK]',
      '[+]   Antena HF (13.56 MHz): 22.4 V @ 13.56 MHz [Sintonizada OK]',
      '[+] Microcontrolador SAM7S512 detectado. FPGA Spartan-II activa.',
      '[+] Estado: Antena lista para captura de baja frecuencia.'
    ],
    explanation: 'Antes de intentar leer cualquier credencial, es imperativo comprobar que la bobina cilíndrica de 125 kHz está resonando con suficiente voltaje. Un voltaje inferior a 18V indica tornillos flojos en la antena dual o interferencias metálicas cercanas.',
    troubleshootingTip: 'Si el voltaje es inferior a 20V, aleja el Proxmark3 de mesas de acero o carcasas de ordenadores portátiles.'
  },
  {
    stepNumber: 2,
    title: 'Captura de Señal FSK & Lectura de la Credencial Legítima',
    phaseName: 'Fase 2: Captura & Demodulación',
    command: 'lf hid read',
    hardwareAction: 'Coloca la tarjeta HID Prox corporativa sobre la bobina cilíndrica LF del Proxmark3.',
    signalDetails: {
      frequency: '125 kHz FSK (RF/8 = 15.6 kHz y RF/10 = 12.5 kHz)',
      modulation: 'FSK2a (Frequency Shift Keying)',
      voltage: 'Cae a ~27.8 V por absorción de carga del chip',
      coupling: 'Acoplamiento inductivo mutuo en campo cercano (1-3 cm)'
    },
    terminalOutput: [
      '[#] Buscando modulación HID Prox (FSK 125 kHz)...',
      '[+] [=] Formato Wiegand detectado: HID Prox H10301 (26-bit)',
      '[+] [=] Facility Code (FC) : 112 [0x70]',
      '[+] [=] Card Number   (CN) : 14592 [0x3900]',
      '[+] [=] Paridad Par (b0)   : 1 (Válida)',
      '[+] [=] Paridad Impar (b25): 0 (Válida)',
      '[+] [=] Raw Hex Dump       : 2006ec7200',
      '[+] Señal FSK capturada en búfer de muestras. Listo para clonar.'
    ],
    explanation: 'El lector emite 125 kHz y la tarjeta responde alternando entre dos frecuencias subportadoras: 15.6 kHz para bits "1" y 12.5 kHz para bits "0". El Proxmark3 demodula la señal y extrae el Facility Code (112) y el Card Number (14592) en texto plano.',
    troubleshootingTip: 'Si no detecta la tarjeta a la primera, ejecuta `lf search` para probar todas las modulaciones LF (EM4100, Indala, Keri, etc.).'
  },
  {
    stepNumber: 3,
    title: 'Programación de Tarjeta Virgen T5577 (Clonado Físico)',
    phaseName: 'Fase 3: Grabación en Chip Mágico',
    command: 'lf hid clone -w H10301 --fc 112 --cn 14592',
    hardwareAction: 'Retira la tarjeta legítima y coloca una tarjeta regrabable T5577 (o llavero azul T5577) sobre la bobina.',
    signalDetails: {
      frequency: '125 kHz con pulsos de escritura en Bloque 0 y Bloque 1',
      modulation: 'Modulación de amplitud con huecos de escritura',
      voltage: '32.0 V durante programación EEPROM',
      coupling: 'Sobrescritura de registros analógicos del chip T5577'
    },
    terminalOutput: [
      '[#] Programando chip Atmel/Microchip T5577 en modo HID H10301...',
      '[+] Configurando Bloque 0 (Control Block): 0x00147040 (Modulación FSK2a, divisor RF/50)',
      '[+] Escribiendo Bloque 1 (Datos Wiegand): 0x2006ec72',
      '[+] Escribiendo Bloque 2 (Terminador)   : 0x00000000',
      '[+] Esperando ciclo de escritura EEPROM (20 ms)...',
      '[+] [=] Verificando tarjeta clonada...',
      '[+] [=] HID Prox H10301 detectado con éxito: FC=112, CN=14592',
      '[+] ¡CLONADO COMPLETADO! La tarjeta virgen es ahora un clon idéntico.'
    ],
    explanation: 'El chip T5577 es un circuito integrado de emulación universal. El Proxmark3 configura su registro de control analógico para imitar la frecuencia de reloj y la modulación FSK de HID Prox, y graba los 26 bits en su memoria no volátil.',
    troubleshootingTip: 'Si la escritura falla con error de verificación, comprueba si la tarjeta T5577 tiene contraseña de fábrica ejecutando `lf t55xx detect`.'
  },
  {
    stepNumber: 4,
    title: 'Emulación Activa de Antena en el Lector de Pared',
    phaseName: 'Fase 4: Simulación en Directo',
    command: 'lf hid sim -w H10301 --fc 112 --cn 14592',
    hardwareAction: 'Aproxima la antena del Proxmark3 a 2-5 cm del lector corporativo de la puerta (Lector HID MiniProx / Thinline).',
    signalDetails: {
      frequency: '125 kHz emitida por el lector de pared',
      modulation: 'Modulación de carga activa (Load Modulation inducida por FPGA)',
      voltage: 'El Proxmark3 detecta el campo del lector externo',
      coupling: 'El Proxmark3 se comporta como transpondedor pasivo en el aire'
    },
    terminalOutput: [
      '[#] Iniciando emulación activa de HID Prox...',
      '[+] Formato: H10301 (26-bit) | FC: 112 | CN: 14592',
      '[+] Esperando campo magnético del lector de pared (125 kHz)...',
      '[+] [!] Campo de lector detectado (Frecuencia: 125.04 kHz).',
      '[+] Transmitiendo trama Wiegand modulada en FSK2a...',
      '[+] [=] Lector de pared ha recibido la trama.',
      '[+] [RELÉ ACTIVADO] LED del lector cambia de ROJO a VERDE.',
      '[+] ¡PUERTA ABIERTA! Acceso físico concedido sin tarjeta plástica.'
    ],
    explanation: 'La FPGA del Proxmark3 actúa como una tarjeta virtual: detecta la portadora de 125 kHz emitida por el lector de la empresa y absorbe energía conmutando resistencias internas para simular la modulación FSK. El lector valida el ID en su base de datos y activa el electroimán de la puerta.',
    troubleshootingTip: 'Mantén la bobina LF alineada paralelamente al logotipo de HID en el centro del lector de pared para máxima transferencia de energía.'
  }
];

export const AntennaCloningLab: React.FC = () => {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [copiedCmd, setCopiedCmd] = useState<boolean>(false);
  const [isSimulatingExecution, setIsSimulatingExecution] = useState<boolean>(false);
  const [readerState, setReaderState] = useState<'locked' | 'unlocked'>('locked');
  const [placementError, setPlacementError] = useState<boolean>(false);

  const step = CLONING_STEPS[currentStepIdx];
  const progressPercent = Math.round(((currentStepIdx + 1) / CLONING_STEPS.length) * 100);

  const handleNext = () => {
    if (currentStepIdx < CLONING_STEPS.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
      setIsSimulatingExecution(false);
      setReaderState('locked');
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(prev => prev - 1);
      setIsSimulatingExecution(false);
      setReaderState('locked');
    }
  };

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(step.command);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const handleSimulateCommand = () => {
    setIsSimulatingExecution(true);
    if (step.stepNumber === 4) {
      // Unlock door after 1.5s
      setTimeout(() => {
        setReaderState('unlocked');
      }, 1500);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <Radio className="w-3.5 h-3.5 animate-pulse" /> Laboratorio Práctico de Antenas & Clonación LF
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Práctica Guiada: Clonado & Emulación de HID Prox II con Proxmark3
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Aprende paso a paso cómo capturar la modulación FSK de una credencial corporativa de 125 kHz, analizar su sintonización electromagnética, programarla en un chip T5577 y emularla en vivo frente a un lector de pared.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setCurrentStepIdx(0);
                setIsSimulatingExecution(false);
                setReaderState('locked');
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reiniciar Práctica</span>
            </button>
          </div>
        </div>

        {/* Progress Step Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Progreso del Laboratorio:</span>
            <span className="text-amber-400 font-bold">
              Paso {currentStepIdx + 1} de {CLONING_STEPS.length} ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-400 transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Interactive Step Guidance & Terminal Runner */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Step Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-2">
            <div>
              <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {step.phaseName}
              </span>
              <h3 className="text-xl font-extrabold text-white mt-1.5">
                {step.title}
              </h3>
            </div>
            <div className="text-left sm:text-right font-mono text-xs text-slate-400">
              Frecuencia: <span className="text-amber-400 font-bold">{step.signalDetails.frequency}</span>
            </div>
          </div>

          {/* Hardware Physical Action Box */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-cyan-400 uppercase font-mono flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" /> Acción Física con el Hardware:
            </span>
            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
              {step.hardwareAction}
            </p>
          </div>

          {/* Interactive Command Runner */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] uppercase tracking-wider">Comando de Terminal a Ejecutar:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCommand}
                  className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold text-[11px]"
                >
                  {copiedCmd ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCmd ? '¡Copiado!' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-emerald-400 font-bold text-sm">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">pm3 --&gt;</span>
                <span className="text-white">{step.command}</span>
              </div>
              <button
                onClick={handleSimulateCommand}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Ejecutar en Laboratorio</span>
              </button>
            </div>
          </div>

          {/* Simulated Terminal Output Console */}
          <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs space-y-2 shadow-inner">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                <span className="text-slate-400 font-bold ml-1">Terminal Proxmark3 Iceman v4.16854</span>
              </div>
              <span>/dev/ttyACM0 @ 115200</span>
            </div>

            <div className="space-y-1 pt-1 min-h-[140px] text-slate-300 text-[11px] leading-relaxed">
              {isSimulatingExecution ? (
                <>
                  <div className="text-cyan-400 font-bold">pm3 --&gt; {step.command}</div>
                  {step.terminalOutput.map((line, idx) => (
                    <div key={idx} className={line.includes('[+]') ? 'text-emerald-400' : line.includes('[!]') ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                      {line}
                    </div>
                  ))}
                  <div className="text-cyan-400 font-bold pt-2 animate-pulse">pm3 --&gt; _</div>
                </>
              ) : (
                <div className="text-slate-600 italic py-6 text-center">
                  Pulsa el botón «Ejecutar en Laboratorio» para enviar la instrucción y ver la respuesta de la antena.
                </div>
              )}
            </div>
          </div>

          {/* Pedagogical Explanation & Troubleshooting */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-cyan-400" /> Explicación Teórica del Paso:
              </span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {step.explanation}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Consejo de Resolución de Problemas:
              </span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {step.troubleshootingTip}
              </p>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <button
              onClick={handlePrev}
              disabled={currentStepIdx === 0}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Paso Anterior
            </button>

            <button
              onClick={handleNext}
              disabled={currentStepIdx === CLONING_STEPS.length - 1}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md"
            >
              Siguiente Paso <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column (1/3): Visual Hardware Simulation (Antenna & Reader Interaction) */}
        <div className="space-y-6">
          {/* Signal & RF Physical Parameter Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h4 className="text-xs font-bold text-white uppercase font-mono flex items-center gap-2 border-b border-slate-800 pb-3">
              <Activity className="w-4 h-4 text-amber-400" /> Estado Electromagnético en Vivo
            </h4>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] block">MODULACIÓN EN EL AIRE:</span>
                <span className="text-white font-bold text-xs">{step.signalDetails.modulation}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] block">VOLTAJE EN BOBINA LF:</span>
                <span className="text-emerald-400 font-bold text-sm">{step.signalDetails.voltage}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] block">ACOPLAMIENTO FÍSICO:</span>
                <span className="text-slate-300 text-xs font-sans">{step.signalDetails.coupling}</span>
              </div>
            </div>
          </div>

          {/* Interactive Wall Reader Emulation Box */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <h4 className="text-xs font-bold text-white uppercase font-mono flex items-center justify-center gap-2 border-b border-slate-800 pb-3">
              <Radio className="w-4 h-4 text-cyan-400" /> Lector de Pared Corporativo (HID MiniProx)
            </h4>

            {/* Visual Door Lock & Reader Graphic */}
            <div className={`p-6 rounded-2xl border transition-all ${
              readerState === 'unlocked'
                ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/40 shadow-xl shadow-emerald-500/20'
                : 'bg-slate-900/60 border-slate-800'
            }`}>
              {/* Reader LED Light */}
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className={`w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center ${
                  readerState === 'unlocked'
                    ? 'bg-emerald-500 border-emerald-300 shadow-lg shadow-emerald-500 animate-pulse'
                    : 'bg-rose-600 border-rose-400 shadow-md shadow-rose-600'
                }`}>
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                </div>
                <span className={`text-xs font-mono font-extrabold uppercase tracking-wider ${
                  readerState === 'unlocked' ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {readerState === 'unlocked' ? 'ACCESO CONCEDIDO' : 'ACCESO DENEGADO / EN REPOSO'}
                </span>
              </div>

              {/* Lock Status Icon */}
              <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-3 bg-slate-950 border border-slate-800">
                {readerState === 'unlocked' ? (
                  <Unlock className="w-8 h-8 text-emerald-400 animate-bounce" />
                ) : (
                  <Lock className="w-8 h-8 text-rose-500" />
                )}
              </div>

              <div className="text-xs text-slate-300 font-mono">
                {readerState === 'unlocked' ? (
                  <span className="text-emerald-400 font-bold block">
                    ¡Cerradura electromagnética abierta! (Relé Wiegand activado)
                  </span>
                ) : (
                  <span className="text-slate-400 block">
                    Puerta cerrada. Esperando emulación de trama Wiegand...
                  </span>
                )}
              </div>
            </div>

            {step.stepNumber === 4 && (
              <button
                onClick={handleSimulateCommand}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <Zap className="w-4 h-4" />
                <span>Simular Aproximación del Proxmark3 al Lector</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
