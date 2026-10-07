import React, { useState } from 'react';
import { COURSE_MODULES, Module, Lesson } from '../data/curriculumData';
import { 
  BookOpen, Terminal, Shield, Award, Clock, ChevronDown, ChevronRight, 
  CheckCircle2, AlertTriangle, Layers, Tag, ExternalLink, Copy, Check, Filter, Search, Radio
} from 'lucide-react';

const THEORY_PAGE_BY_MODULE: Record<number, string> = {
  1: 'modulo-1-fundamentos-rf.html',
  2: 'modulo-2-arsenal-pentesting.html',
  3: 'modulo-3-baja-frecuencia-125khz.html',
  4: 'modulo-4-alta-frecuencia-mifare.html',
  5: 'modulo-5-ataques-mundo-real.html',
  6: 'modulo-6-defensa-hardening-legal.html',
};

interface CurriculumViewProps {
  onNavigateToSignals?: () => void;
  onNavigateToSimulator?: () => void;
  onNavigateToSpectrum?: () => void;
  onNavigateToCloning?: () => void;
}

export const CurriculumView: React.FC<CurriculumViewProps> = ({ 
  onNavigateToSignals, 
  onNavigateToSimulator,
  onNavigateToSpectrum,
  onNavigateToCloning
}) => {
  const [selectedModuleId, setSelectedModuleId] = useState<string>(COURSE_MODULES[0].id);
  const [activeLesson, setActiveLesson] = useState<Lesson>(COURSE_MODULES[0].lessons[0]);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const selectedModule = COURSE_MODULES.find(m => m.id === selectedModuleId) || COURSE_MODULES[0];

  const handleCopyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  // Filter lessons if searching
  const filteredLessons = selectedModule.lessons.filter(l => {
    const matchesSearch = l.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          l.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          l.keyConcepts.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDiff = selectedDifficulty === 'all' || l.difficulty === selectedDifficulty;
    return matchesSearch && matchesDiff;
  });

  return (
    <div className="space-y-8">
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>DURACIÓN TOTAL</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white">41 Horas</div>
          <div className="text-xs text-slate-400 mt-1">6 Módulos progresivos</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>ENFOQUE PRÁCTICO</span>
            <Terminal className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">78% Labs</div>
          <div className="text-xs text-slate-400 mt-1">Prácticas reales con hardware</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>LABS Y RETOS</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">18 Laboratorios</div>
          <div className="text-xs text-slate-400 mt-1">Paso a paso con soluciones</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>PERFIL DE SALIDA</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">Pentester Físico</div>
          <div className="text-xs text-slate-400 mt-1">Capaz de auditar accesos reales</div>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Selecciona un Módulo del Programa:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {COURSE_MODULES.map((mod) => {
            const isSelected = mod.id === selectedModuleId;
            return (
              <button
                key={mod.id}
                onClick={() => {
                  setSelectedModuleId(mod.id);
                  setActiveLesson(mod.lessons[0]);
                }}
                className={`text-left p-3 rounded-xl border transition-all relative overflow-hidden ${
                  isSelected
                    ? 'bg-slate-800 border-cyan-500 shadow-md ring-1 ring-cyan-500/30'
                    : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="font-mono font-bold text-cyan-400">M0{mod.number}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                    {mod.durationHours}h
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-white line-clamp-1">
                  {mod.title.split(':')[0]}
                </h4>
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="text-emerald-400 font-semibold">{mod.practicePercentage}% Práctica</span>
                  <span className="font-mono text-slate-500">{mod.lessons.length} Labs</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Module Detail Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800/80 to-slate-900 border border-slate-800 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs font-bold">
                MÓDULO {selectedModule.number}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-medium">
                {selectedModule.tagFrequency}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                {selectedModule.durationHours} Horas Lectivas
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white">
              {selectedModule.title}
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-3xl">
              {selectedModule.description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            {THEORY_PAGE_BY_MODULE[selectedModule.number] && (
              <a
                href={`teoria/${THEORY_PAGE_BY_MODULE[selectedModule.number]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all hover:scale-[1.02]"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Leer Teoría Completa del Módulo</span>
              </a>
            )}
            {selectedModule.number === 1 && onNavigateToSpectrum && (
              <button
                onClick={onNavigateToSpectrum}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all hover:scale-[1.02]"
              >
                <span>📡 Mapa del Espectro LF/HF/UHF</span>
              </button>
            )}
            {selectedModule.number === 1 && onNavigateToSignals && (
              <button
                onClick={onNavigateToSignals}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all hover:scale-[1.02] border border-slate-700"
              >
                <span>⚡ Modulaciones ASK/FSK/PSK</span>
              </button>
            )}
            {selectedModule.number === 2 && onNavigateToCloning && (
              <button
                onClick={onNavigateToCloning}
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all hover:scale-[1.02]"
              >
                <span>🏷️ Lab de Clonado HID Prox & T5577</span>
              </button>
            )}
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Distribución Pedagógica:</span>
              <span className="text-xs font-bold text-emerald-400">{selectedModule.practicePercentage}% Práctica / {100 - selectedModule.practicePercentage}% Teoría</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Difficulty Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar lección, protocolo (Darkside, Wiegand, T5577, UID)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs text-slate-400">Dificultad:</span>
          {(['all', 'Principiante', 'Intermedio', 'Avanzado'] as const).map(diff => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedDifficulty === diff
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {diff === 'all' ? 'Todas' : diff}
            </button>
          ))}
        </div>
      </div>

      {/* Lessons List + Selected Lesson Deep-Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Lessons in this Module */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-semibold">
            <span>LECCIONES ({filteredLessons.length})</span>
            <span>DURACIÓN</span>
          </div>

          <div className="space-y-2">
            {filteredLessons.map((les) => {
              const isCurrent = les.id === activeLesson.id;
              const diffColors = {
                'Principiante': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                'Intermedio': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
                'Avanzado': 'text-rose-400 bg-rose-500/10 border-rose-500/20'
              };

              return (
                <div
                  key={les.id}
                  onClick={() => setActiveLesson(les)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-slate-800/95 border-cyan-500 shadow-md ring-1 ring-cyan-500/20'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${diffColors[les.difficulty]}`}>
                      {les.difficulty}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {les.duration}
                    </span>
                  </div>

                  <h4 className="text-white font-semibold text-sm line-clamp-2">
                    {les.title}
                  </h4>

                  <p className="text-slate-400 text-xs mt-1 line-clamp-2">
                    {les.summary}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-slate-800/70 flex items-center justify-between text-[11px]">
                    <span className="text-cyan-400 font-mono flex items-center gap-1">
                      <Terminal className="w-3 h-3" />
                      {les.practicalExercise.title.split(':')[0]}
                    </span>
                    <ChevronRight className={`w-4 h-4 transition-transform ${isCurrent ? 'text-cyan-400 translate-x-1' : 'text-slate-600'}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active Lesson Full Blueprint */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          {/* Header */}
          <div className="border-b border-slate-800 pb-4">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-mono font-semibold">
                LECCIÓN {activeLesson.id.replace('les-', '').replace('-', '.')}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Tiempo estimado: {activeLesson.duration}
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-semibold capitalize">
                Tipo: {activeLesson.type}
              </span>
            </div>

            <h3 className="text-xl font-bold text-white">
              {activeLesson.title}
            </h3>
            <p className="text-slate-300 text-xs mt-2 leading-relaxed">
              {activeLesson.summary}
            </p>
          </div>

          {/* Objectives */}
          <div>
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2.5 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Objetivos de Aprendizaje Práctico
            </h4>
            <div className="space-y-1.5">
              {activeLesson.objectives.map((obj, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-1.5"></span>
                  <span>{obj}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Concepts / Vocabulary */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4 text-purple-400" /> Conceptos y Vocabulario Clave
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {activeLesson.keyConcepts.map((kc, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-200 text-xs font-mono"
                >
                  {kc}
                </span>
              ))}
            </div>
          </div>

          {/* Tools & Hardware Used */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" /> Hardware y Software en este Laboratorio
            </h4>
            <div className="flex flex-wrap gap-2">
              {activeLesson.toolsUsed.map((tool, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-medium"
                >
                  ⚡ {tool}
                </span>
              ))}
            </div>
          </div>

          {/* Practical Exercise Box */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                {activeLesson.practicalExercise.title}
              </h4>
              <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                100% Hands-on
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {activeLesson.practicalExercise.description}
            </p>

            {/* Terminal Commands if any */}
            {activeLesson.practicalExercise.commands && (
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-semibold text-slate-400 block font-mono">
                  Comandos de Terminal (Proxmark3 / Linux):
                </span>
                {activeLesson.practicalExercise.commands.map((cmdItem, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-cyan-400 font-bold block">{cmdItem.cmd}</span>
                      <span className="text-slate-400 text-[11px]">{cmdItem.desc}</span>
                    </div>

                    <button
                      onClick={() => handleCopyCommand(cmdItem.cmd)}
                      className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                      title="Copiar comando"
                    >
                      {copiedCmd === cmdItem.cmd ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Expected Result */}
            <div className="pt-2 border-t border-slate-900 flex items-start gap-2 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-300">Resultado esperado de la práctica: </span>
                <span className="text-slate-400">{activeLesson.practicalExercise.expectedResult}</span>
              </div>
            </div>

            {/* Contextual Interactive Shortcuts */}
            <div className="pt-3 border-t border-slate-900/80 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] text-slate-400 font-mono">
                Laboratorios y simuladores vinculados a esta lección:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {selectedModuleId === 'mod-1' && onNavigateToSpectrum && (
                  <button
                    onClick={onNavigateToSpectrum}
                    className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>Mapa Espectro & Antenas</span>
                  </button>
                )}
                {selectedModuleId === 'mod-1' && onNavigateToSignals && (
                  <button
                    onClick={onNavigateToSignals}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 font-semibold text-xs flex items-center gap-1.5 transition-colors border border-indigo-500/30"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Osciloscopio Señales</span>
                  </button>
                )}
                {onNavigateToCloning && (selectedModuleId === 'mod-2' || activeLesson.id.includes('2-')) && (
                  <button
                    onClick={onNavigateToCloning}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Lab Clonado HID Prox</span>
                  </button>
                )}
                {onNavigateToSimulator && (
                  <button
                    onClick={onNavigateToSimulator}
                    className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Simulador de Ataques</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
