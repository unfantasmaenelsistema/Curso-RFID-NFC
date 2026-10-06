import React, { useState } from 'react';
import { 
  CheckCircle2, Circle, Terminal, Copy, Check, Sparkles, 
  RotateCcw, Award, ChevronRight, HelpCircle, AlertCircle, ShieldCheck
} from 'lucide-react';

export interface LabTask {
  id: string;
  title: string;
  instruction: string;
  command?: string;
  explanation: string;
  verificationTip: string;
}

export interface GuidedLab {
  id: string;
  title: string;
  category: string;
  targetFrequency: string;
  estimatedTime: string;
  description: string;
  tasks: LabTask[];
}

export const GUIDED_LABS: GuidedLab[] = [
  {
    id: 'lab-hf-audit',
    title: 'Práctica Guiada: Identificación y Diagnóstico ISO 14443-A (HF)',
    category: 'Alta Frecuencia (13.56 MHz)',
    targetFrequency: '13.56 MHz',
    estimatedTime: '15 minutos',
    description: 'Guía paso a paso para inicializar el dispositivo de laboratorio, interrogar una credencial de alta frecuencia y verificar los parámetros de anticolisión (UID, ATQA y SAK).',
    tasks: [
      {
        id: 'task-1',
        title: 'Verificar sintonización de antenas',
        instruction: 'Ejecuta el auto-diagnóstico del hardware para comprobar que la bobina de 13.56 MHz está resonando con suficiente voltaje.',
        command: 'hw tune',
        explanation: 'El comando mide el voltaje de la antena HF. Debe entregar al menos ~15-20 V para una lectura estable sin pérdidas de paquetes.',
        verificationTip: 'Observa que en la sección "HF antenna" el voltaje sea superior a 18V.'
      },
      {
        id: 'task-2',
        title: 'Posicionar la tarjeta en la antena de alta frecuencia',
        instruction: 'Coloca la tarjeta de pruebas directamente sobre la bobina circular HF del lector.',
        explanation: 'El acoplamiento inductivo requiere proximidad directa (menos de 2-3 cm) y evitar superficies metálicas que atenúen el campo magnético.',
        verificationTip: 'Asegúrate de que la tarjeta quede centrada sobre la bobina sin moverse.'
      },
      {
        id: 'task-3',
        title: 'Ejecutar exploración y anticolisión (hf search)',
        instruction: 'Interroga el campo electromagnético en busca de transpondedores compatibles con la norma ISO 14443 Tipo A.',
        command: 'hf search',
        explanation: 'Envía los comandos estándar REQA/WUPA y ejecuta el ciclo de selección anticolisión para leer el UID, ATQA y SAK.',
        verificationTip: 'La consola debe imprimir los bytes de UID, ATQA y SAK en verde.'
      },
      {
        id: 'task-4',
        title: 'Analizar el byte SAK para determinar el modelo de silicio',
        instruction: 'Inspecciona el valor hexadecimal del Select Acknowledge (SAK).',
        explanation: 'Un SAK 0x08 indica un microcontrolador clásico con lógica cableada (MIFARE Classic 1K), mientras que un SAK 0x20 indica soporte de transporte ISO 14443-4.',
        verificationTip: 'Confirma si la credencial requiere análisis de sectores o protocolos criptográficos avanzados.'
      },
      {
        id: 'task-5',
        title: 'Comprobar presencia de claves de transporte por defecto',
        instruction: 'Verifica si la instalación utiliza claves de fábrica conocidas en los sectores accesibles.',
        command: 'hf mf chk --dump',
        explanation: 'Contrasta los trailers de sector contra el diccionario básico para auditar malas prácticas de configuración.',
        verificationTip: 'Revisa el reporte de sectores encontrados en la tabla de resultados.'
      }
    ]
  },
  {
    id: 'lab-lf-wiegand',
    title: 'Práctica Guiada: Análisis de Baja Frecuencia y Formato Wiegand',
    category: 'Baja Frecuencia (125 kHz)',
    targetFrequency: '125 kHz',
    estimatedTime: '12 minutos',
    description: 'Procedimiento metódico para escanear credenciales de 125 kHz y decodificar el identificador de instalación y usuario.',
    tasks: [
      {
        id: 'task-lf-1',
        title: 'Comprobar resonancia en 125 kHz',
        instruction: 'Ejecuta la sintonización para asegurar que la antena de baja frecuencia está ajustada a 125.00 kHz.',
        command: 'hw tune',
        explanation: 'La antena LF requiere alta inductancia; el voltaje pico debe superar habitualmente los 30V.',
        verificationTip: 'Comprueba que el voltaje LF sea óptimo en la salida de consola.'
      },
      {
        id: 'task-lf-2',
        title: 'Escanear portadora con lf search',
        instruction: 'Ejecuta la búsqueda de modulaciones habituales en 125 kHz (FSK, ASK, PSK).',
        command: 'lf search',
        explanation: 'El lector prueba consecutivamente demoduladores de EM4100, HID Prox, Indala, AWID y Keri.',
        verificationTip: 'El software identificará el protocolo exacto detectado en la bobina.'
      },
      {
        id: 'task-lf-3',
        title: 'Decodificar Facility Code y Card ID',
        instruction: 'Aísla los campos de la trama Wiegand decodificada.',
        explanation: 'En Wiegand 26 bits estándar, los bits 2 a 9 corresponden al Facility Code (edificio) y los bits 10 a 25 al Card Number (usuario).',
        verificationTip: 'Anota el código de instalación para documentarlo en el informe de laboratorio.'
      },
      {
        id: 'task-lf-4',
        title: 'Verificar medidas defensivas y ausencia de cifrado',
        instruction: 'Comprueba por qué este protocolo transmite en texto claro por el aire.',
        explanation: 'Los estándares clásicos de 125 kHz carecen de autenticación mutua, lo que permite replicar la señal con un chip T5577.',
        verificationTip: 'Identifica la recomendación de migración hacia tecnologías modernas con cifrado AES.'
      }
    ]
  }
];

interface StepByStepLabProps {
  onRunCommand?: (cmd: string) => void;
  onViewCertificate?: () => void;
}

export const StepByStepLab: React.FC<StepByStepLabProps> = ({ onRunCommand, onViewCertificate }) => {
  const [selectedLabIndex, setSelectedLabIndex] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const activeLab = GUIDED_LABS[selectedLabIndex];

  const toggleTask = (taskId: string) => {
    setCompletedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const handleCopy = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const totalTasks = activeLab.tasks.length;
  const completedCount = activeLab.tasks.filter(t => completedTasks[t.id]).length;
  const progressPercentage = Math.round((completedCount / totalTasks) * 100);
  const isFinished = progressPercentage === 100;

  const resetProgress = () => {
    setCompletedTasks({});
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header & Lab Selector */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs font-bold">
                MODO CHECKLIST PRÁCTICO
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-medium">
                {activeLab.targetFrequency}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                ⏱️ {activeLab.estimatedTime}
              </span>
            </div>

            <h3 className="text-xl font-bold text-white">
              {activeLab.title}
            </h3>

            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              {activeLab.description}
            </p>
          </div>

          {/* Selector of guided labs */}
          <div className="flex flex-col gap-2 shrink-0">
            <span className="text-[11px] text-slate-400 font-mono">Seleccionar Práctica:</span>
            <div className="flex gap-2">
              {GUIDED_LABS.map((lab, idx) => (
                <button
                  key={lab.id}
                  onClick={() => {
                    setSelectedLabIndex(idx);
                    setCompletedTasks({});
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                    selectedLabIndex === idx
                      ? 'bg-cyan-600 text-white border-cyan-500 shadow-md'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  Práctica {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-semibold flex items-center gap-2">
              Progreso de la sesión de laboratorio:
              <span className="font-mono text-cyan-400 font-bold">{completedCount} de {totalTasks} tareas</span>
            </span>
            <div className="flex items-center gap-3">
              <span className="font-mono font-bold text-sm text-cyan-400">{progressPercentage}%</span>
              <button
                onClick={resetProgress}
                className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
                title="Reiniciar lista"
              >
                <RotateCcw className="w-3 h-3" /> Reiniciar
              </button>
            </div>
          </div>

          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div 
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                isFinished 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                  : 'bg-gradient-to-r from-cyan-500 to-indigo-500'
              }`}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Completion Banner if finished */}
      {isFinished && (
        <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">¡Práctica de Laboratorio Completada con Éxito!</h4>
              <p className="text-emerald-200/80 text-xs mt-0.5">
                Has verificado paso a paso el procedimiento metodológico de análisis y diagnóstico.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onViewCertificate && (
              <button
                onClick={onViewCertificate}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md"
              >
                <Award className="w-4 h-4" />
                <span>Generar Certificado</span>
              </button>
            )}
            <button
              onClick={resetProgress}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors shadow-sm"
            >
              Repetir Práctica
            </button>
          </div>
        </div>
      )}

      {/* Tasks Checklist Grid */}
      <div className="space-y-3">
        {activeLab.tasks.map((task, idx) => {
          const isDone = !!completedTasks[task.id];

          return (
            <div
              key={task.id}
              className={`p-4 rounded-xl border transition-all ${
                isDone
                  ? 'bg-slate-900/40 border-emerald-500/40 opacity-90'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left: Checkbox & Step Info */}
                <div className="flex items-start gap-3 flex-1">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="mt-0.5 text-slate-400 hover:text-cyan-400 transition-colors focus:outline-none"
                    aria-label={isDone ? 'Marcar como pendiente' : 'Marcar como completada'}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-950" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-600 hover:text-cyan-400" />
                    )}
                  </button>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-cyan-400">Paso {idx + 1}</span>
                      <h4 className={`text-sm font-semibold transition-colors ${isDone ? 'text-slate-400 line-through' : 'text-white'}`}>
                        {task.title}
                      </h4>
                    </div>

                    <p className="text-slate-300 text-xs leading-relaxed">
                      {task.instruction}
                    </p>

                    {/* Explanatory Technical Note */}
                    <p className="text-slate-400 text-[11px] leading-relaxed pt-1">
                      <strong className="text-slate-300">Fundamento técnico:</strong> {task.explanation}
                    </p>

                    {/* Verification tip */}
                    <div className="pt-1.5 flex items-start gap-1.5 text-[11px] text-cyan-300/90">
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span><strong>Verificación:</strong> {task.verificationTip}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Command Box & Actions if task has a CLI command */}
                {task.command && (
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                    <div className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-400 flex items-center gap-2 shadow-inner">
                      <span>{task.command}</span>
                      <button
                        onClick={() => handleCopy(task.command!)}
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        title="Copiar comando"
                      >
                        {copiedCmd === task.command ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {onRunCommand && (
                      <button
                        onClick={() => {
                          onRunCommand(task.command!);
                          if (!isDone) toggleTask(task.id);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                        title="Ejecutar en la consola virtual interactiva"
                      >
                        <Terminal className="w-3 h-3" />
                        <span>Ejecutar</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
