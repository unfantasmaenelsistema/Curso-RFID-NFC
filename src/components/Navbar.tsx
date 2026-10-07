import React from 'react';
import { Radio, BookOpen, Terminal, Cpu, ShieldAlert, Calendar, Download, Sparkles, Award, Activity, Calculator, Key, Scale, Binary } from 'lucide-react';

export type ActiveTab = 'temario' | 'glosario' | 'espectro' | 'senales' | 'tramas' | 'paridad' | 'diccionarios' | 'riesgo' | 'simulador' | 'hardware' | 'matriz' | 'planificador' | 'certificacion';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenExport: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenExport
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Radio className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-sm tracking-tight">RFID & NFC ACADEMY</span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  RED TEAM LAB
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
                Curso Práctico de Ciberseguridad Física y Radiofrecuencia
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 font-medium text-xs min-w-0 overflow-x-auto">
            <button
              onClick={() => setActiveTab('temario')}
              className={`shrink-0 px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeTab === 'temario'
                  ? 'bg-slate-800 text-cyan-400 font-bold border border-slate-700'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Temario Completo</span>
            </button>

            <button
              onClick={() => setActiveTab('glosario')}
              className={`shrink-0 px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeTab === 'glosario'
                  ? 'bg-slate-800 text-cyan-400 font-bold border border-slate-700'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Glosario</span>
            </button>

            <button
              onClick={() => setActiveTab('espectro')}
              className={`shrink-0 px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeTab === 'espectro'
                  ? 'bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-indigo-300 hover:bg-slate-900'
              }`}
            >
              <Radio className="w-4 h-4 text-indigo-400" />
              <span>Espectro RF</span>
            </button>

            <button
              onClick={() => setActiveTab('senales')}
              className={`shrink-0 px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeTab === 'senales'
                  ? 'bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-indigo-300 hover:bg-slate-900'
              }`}
            >
              <Activity className="w-4 h-4 text-indigo-400" />
              <span>Señales RF</span>
            </button>

            <button
              onClick={() => setActiveTab('tramas')}
              className={`shrink-0 px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeTab === 'tramas'
                  ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-900'
              }`}
            >
              <Binary className="w-4 h-4 text-emerald-400" />
              <span>Tramas Raw</span>
            </button>

            <button
              onClick={() => setActiveTab('paridad')}
              className={`shrink-0 px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeTab === 'paridad'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-900'
              }`}
            >
              <Calculator className="w-4 h-4 text-cyan-400" />
              <span>Paridad</span>
            </button>

            <button
              onClick={() => setActiveTab('diccionarios')}
              className={`shrink-0 px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeTab === 'diccionarios'
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-amber-300 hover:bg-slate-900'
              }`}
            >
              <Key className="w-4 h-4 text-amber-400" />
              <span>Diccionarios</span>
            </button>

            <button
              onClick={() => setActiveTab('riesgo')}
              className={`shrink-0 px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeTab === 'riesgo'
                  ? 'bg-orange-500/20 text-orange-300 font-bold border border-orange-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-orange-300 hover:bg-slate-900'
              }`}
            >
              <Scale className="w-4 h-4 text-orange-400" />
              <span>Riesgo CVSS</span>
            </button>

            <button
              onClick={() => setActiveTab('simulador')}
              className={`shrink-0 px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeTab === 'simulador'
                  ? 'bg-slate-800 text-cyan-400 font-bold border border-slate-700'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Laboratorio Virtual</span>
            </button>

            <button
              onClick={() => setActiveTab('matriz')}
              className={`shrink-0 px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeTab === 'matriz'
                  ? 'bg-slate-800 text-cyan-400 font-bold border border-slate-700'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Matriz de Ataques</span>
            </button>

            <button
              onClick={() => setActiveTab('hardware')}
              className={`shrink-0 px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeTab === 'hardware'
                  ? 'bg-slate-800 text-cyan-400 font-bold border border-slate-700'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>Hardware</span>
            </button>

            <button
              onClick={() => setActiveTab('planificador')}
              className={`shrink-0 px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeTab === 'planificador'
                  ? 'bg-slate-800 text-cyan-400 font-bold border border-slate-700'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Cronograma</span>
            </button>

            <button
              onClick={() => setActiveTab('certificacion')}
              className={`shrink-0 px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeTab === 'certificacion'
                  ? 'bg-amber-500/10 text-amber-300 font-bold border border-amber-500/30'
                  : 'text-slate-400 hover:text-amber-300 hover:bg-slate-900'
              }`}
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>Certificado</span>
            </button>
          </nav>

          {/* Action Button: Export */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenExport}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-cyan-600/20 transition-all hover:scale-[1.02]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden overflow-x-auto py-2 space-x-1 border-t border-slate-900 text-xs">
          <button
            onClick={() => setActiveTab('temario')}
            className={`px-2.5 py-1 rounded-md shrink-0 ${activeTab === 'temario' ? 'bg-slate-800 text-cyan-400 font-bold' : 'text-slate-400'}`}
          >
            Temario
          </button>
          <button
            onClick={() => setActiveTab('glosario')}
            className={`px-2.5 py-1 rounded-md shrink-0 ${activeTab === 'glosario' ? 'bg-slate-800 text-cyan-400 font-bold' : 'text-slate-400'}`}
          >
            Glosario
          </button>
          <button
            onClick={() => setActiveTab('espectro')}
            className={`px-2.5 py-1 rounded-md shrink-0 ${activeTab === 'espectro' ? 'bg-indigo-500/20 text-indigo-300 font-bold' : 'text-slate-400'}`}
          >
            Espectro RF
          </button>
          <button
            onClick={() => setActiveTab('senales')}
            className={`px-2.5 py-1 rounded-md shrink-0 ${activeTab === 'senales' ? 'bg-indigo-500/20 text-indigo-300 font-bold' : 'text-slate-400'}`}
          >
            Señales RF
          </button>
          <button
            onClick={() => setActiveTab('tramas')}
            className={`px-2.5 py-1 rounded-md shrink-0 ${activeTab === 'tramas' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400'}`}
          >
            Tramas Raw
          </button>
          <button
            onClick={() => setActiveTab('paridad')}
            className={`px-2.5 py-1 rounded-md shrink-0 ${activeTab === 'paridad' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'}`}
          >
            Paridad
          </button>
          <button
            onClick={() => setActiveTab('diccionarios')}
            className={`px-2.5 py-1 rounded-md shrink-0 ${activeTab === 'diccionarios' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400'}`}
          >
            Diccionarios
          </button>
          <button
            onClick={() => setActiveTab('riesgo')}
            className={`px-2.5 py-1 rounded-md shrink-0 ${activeTab === 'riesgo' ? 'bg-orange-500/20 text-orange-300 font-bold' : 'text-slate-400'}`}
          >
            Riesgo CVSS
          </button>
          <button
            onClick={() => setActiveTab('simulador')}
            className={`px-2.5 py-1 rounded-md shrink-0 ${activeTab === 'simulador' ? 'bg-slate-800 text-cyan-400 font-bold' : 'text-slate-400'}`}
          >
            Laboratorio
          </button>
          <button
            onClick={() => setActiveTab('matriz')}
            className={`px-2.5 py-1 rounded-md shrink-0 ${activeTab === 'matriz' ? 'bg-slate-800 text-cyan-400 font-bold' : 'text-slate-400'}`}
          >
            Matriz
          </button>
          <button
            onClick={() => setActiveTab('hardware')}
            className={`px-2.5 py-1 rounded-md shrink-0 ${activeTab === 'hardware' ? 'bg-slate-800 text-cyan-400 font-bold' : 'text-slate-400'}`}
          >
            Hardware
          </button>
          <button
            onClick={() => setActiveTab('planificador')}
            className={`px-2.5 py-1 rounded-md shrink-0 ${activeTab === 'planificador' ? 'bg-slate-800 text-cyan-400 font-bold' : 'text-slate-400'}`}
          >
            Cronograma
          </button>
          <button
            onClick={() => setActiveTab('certificacion')}
            className={`px-2.5 py-1 rounded-md shrink-0 ${activeTab === 'certificacion' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400'}`}
          >
            Certificado
          </button>
        </div>
      </div>
    </header>
  );
};
