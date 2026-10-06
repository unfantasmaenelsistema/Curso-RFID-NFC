import React, { useState } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { CurriculumView } from './components/CurriculumView';
import { InteractiveTerminalLab } from './components/InteractiveTerminalLab';
import { HardwareKitGuide } from './components/HardwareKitGuide';
import { AttackMatrixView } from './components/AttackMatrixView';
import { CoursePlanner } from './components/CoursePlanner';
import { TechnicalGlossary } from './components/TechnicalGlossary';
import { FrequencySpectrumMap } from './components/FrequencySpectrumMap';
import { SignalVisualizer } from './components/SignalVisualizer';
import { RawFrameDecoder } from './components/RawFrameDecoder';
import { ParityCalculator } from './components/ParityCalculator';
import { WordlistGenerator } from './components/WordlistGenerator';
import { RiskScoringCalculator } from './components/RiskScoringCalculator';
import { CertificationModule } from './components/CertificationModule';
import { SyllabusExportModal } from './components/SyllabusExportModal';
import { 
  Radio, Shield, Terminal, BookOpen, Layers, CheckCircle2, 
  Sparkles, ArrowRight, Download, Award, Cpu, Zap 
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('temario');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [simuladorSubTab, setSimuladorSubTab] = useState<'terminal' | 'checklist' | 'ataques' | 'clonado'>('checklist');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenExport={() => setIsExportOpen(true)}
      />

      {/* Hero Welcome / Executive Answer Section */}
      <section className="border-b border-slate-800/80 bg-gradient-to-b from-slate-900/60 via-slate-950 to-slate-950 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
                <Radio className="w-3.5 h-3.5 animate-pulse" /> Propuesta de Temario Integral • 41 Horas • 78% Práctico
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Curso Definitivo de <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400">RFID y NFC</span> para Iniciación en Ciberseguridad
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Para que un alumno principiante no se pierda en fórmulas matemáticas y aprenda de forma <strong>100% práctica y aplicable</strong>, el temario óptimo sigue el modelo de <strong className="text-cyan-300">«Física → Baja Frecuencia (abierta) → Alta Frecuencia (Crypto-1 roto) → Casos Reales (Hoteles/Relay) → Defensa Criptográfica (AES-128)»</strong>.
              </p>

              {/* 3 Core Strengths of this Syllabus */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                  <Terminal className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h2 className="text-xs font-bold text-white">Comandos Reales</h2>
                    <p className="text-[11px] text-slate-400">Proxmark3 Iceman, libnfc, mfoc, mfcuk y MCT.</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                  <Cpu className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <h2 className="text-xs font-bold text-white">Hardware Asequible</h2>
                    <p className="text-[11px] text-slate-400">Desde móvil Android + ACR122U (35€) hasta Proxmark3.</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                  <Shield className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <h2 className="text-xs font-bold text-white">Red Team & Defensa</h2>
                    <p className="text-[11px] text-slate-400">Auditoría ética, CVSS y migración a DESFire EV3.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Card on the right */}
            <div className="lg:w-80 p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-2xl flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[11px] font-bold tracking-wider text-cyan-400 uppercase block mb-1">
                  Explorador Rápido
                </span>
                <h2 className="text-base font-bold text-white">
                  ¿Por dónde empezar?
                </h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Prueba el simulador de comandos de terminal interactivo para ver cómo responde una tarjeta real o consulta el temario detallado con sus 18 laboratorios.
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('simulador')}
                  className="w-full py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-md"
                >
                  <Terminal className="w-4 h-4" />
                  <span>Probar Simulador Virtual</span>
                </button>
                <button
                  onClick={() => setIsExportOpen(true)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-slate-700"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar Guía en Markdown</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Tab View Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'temario' && (
          <CurriculumView 
            onNavigateToSignals={() => setActiveTab('senales')} 
            onNavigateToSimulator={() => {
              setSimuladorSubTab('checklist');
              setActiveTab('simulador');
            }} 
            onNavigateToSpectrum={() => setActiveTab('espectro')}
            onNavigateToCloning={() => {
              setSimuladorSubTab('clonado');
              setActiveTab('simulador');
            }}
          />
        )}
        {activeTab === 'glosario' && <TechnicalGlossary />}
        {activeTab === 'espectro' && (
          <FrequencySpectrumMap onNavigateToSignals={() => setActiveTab('senales')} />
        )}
        {activeTab === 'senales' && (
          <SignalVisualizer onNavigateToSpectrum={() => setActiveTab('espectro')} />
        )}
        {activeTab === 'tramas' && <RawFrameDecoder />}
        {activeTab === 'paridad' && (
          <ParityCalculator onNavigateToFrames={() => setActiveTab('tramas')} />
        )}
        {activeTab === 'diccionarios' && <WordlistGenerator />}
        {activeTab === 'riesgo' && <RiskScoringCalculator />}
        {activeTab === 'simulador' && (
          <InteractiveTerminalLab 
            onNavigateToCertificate={() => setActiveTab('certificacion')} 
            defaultSubTab={simuladorSubTab}
          />
        )}
        {activeTab === 'matriz' && <AttackMatrixView />}
        {activeTab === 'hardware' && <HardwareKitGuide />}
        {activeTab === 'planificador' && <CoursePlanner />}
        {activeTab === 'certificacion' && <CertificationModule />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Radio className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-300 font-semibold">
              Temario Oficial de Ciberseguridad Física en Radiofrecuencia (RFID / NFC)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-500">
            <span>Diseñado para Formación Profesional, Grados y Red Team Academies</span>
            <span>•</span>
            <button
              onClick={() => setIsExportOpen(true)}
              className="text-cyan-400 hover:underline"
            >
              Exportar Temario Completo (.md / .json)
            </button>
          </div>
        </div>
      </footer>

      {/* Export Modal */}
      <SyllabusExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  );
}
