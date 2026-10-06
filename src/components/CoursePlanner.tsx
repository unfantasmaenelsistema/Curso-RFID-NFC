import React, { useState } from 'react';
import { COURSE_MODULES } from '../data/curriculumData';
import { Calendar, Clock, Award, Target, FileText, CheckCircle, Flame, GraduationCap, Compass, BookOpen } from 'lucide-react';

export const CoursePlanner: React.FC = () => {
  const [selectedFormat, setSelectedFormat] = useState<'bootcamp' | 'universidad' | 'autoestudio'>('bootcamp');
  const [practiceRatio, setPracticeRatio] = useState<number>(75); // 75% practical

  const formats = {
    bootcamp: {
      name: 'Bootcamp Intensivo (1 Semana)',
      totalHours: 35,
      schedule: 'Lunes a Viernes, 7 horas diarias con descansos técnicos',
      target: 'Profesionales de ciberseguridad, pentesters IT que quieren dominar lo físico, y cuerpos de seguridad',
      badge: 'Modo Inmersivo Red Team',
      highlights: [
        'Día 1: Física, herramientas de bajo coste y triage de antenas',
        'Día 2: Dominio de 125 kHz (HID Prox, EM4100, Atmel T5577)',
        'Día 3: Crackeo Crypto-1 en MIFARE Classic (Darkside, Nested, Autopwn)',
        'Día 4: Saflok, hoteles, manipulación de saldos y Relay Attacks con NFCGate',
        'Día 5: CTF Presencial de Intrusión Física + Entrega de Informes'
      ]
    },
    universidad: {
      name: 'Asignatura / Módulo FP (10 Semanas)',
      totalHours: 60,
      schedule: '2 sesiones semanales de 3 horas (1h Teoría + 2h Laboratorio)',
      target: 'Grados en Ciberseguridad, Ingeniería Informática o Curso de Especialización FP',
      badge: 'Formación Académica Reglada',
      highlights: [
        'Semanas 1-2: Propagación de ondas, diseño de bobinas LC y estándares ISO',
        'Semanas 3-4: Entorno de laboratorio con Kali, LibNFC y firmware Iceman',
        'Semanas 5-6: Protocolos de baja frecuencia y clonación de credenciales',
        'Semanas 7-8: Criptoanálisis de MIFARE y debilidades de generadores PRNG',
        'Semana 9: Defensas modernas: DESFire EV3, HID SEOS y protocolo OSDP',
        'Semana 10: Presentación de proyectos y auditoría técnica documentada'
      ]
    },
    autoestudio: {
      name: 'Curso Online a tu Ritmo',
      totalHours: 45,
      schedule: 'Vídeos grabados + laboratorios guiados paso a paso + comunidad Discord',
      target: 'Estudiantes autodidactas, aficionados al hardware hacking y profesionales con horarios rotativos',
      badge: 'Flexibilidad Total',
      highlights: [
        'Módulos modulares con retos autoevaluables',
        'Repositorio GitHub con volcados .bin de ejemplo para analizar sin hardware',
        'Soporte para resolver bloqueos en comandos de Proxmark3 y flasheo',
        'Certificado de finalización tras superar el CTF virtual de radiofrecuencia'
      ]
    }
  };

  const current = formats[selectedFormat];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
            <Calendar className="w-3.5 h-3.5" /> Metodología Didáctica & Planificación de Horas
          </div>
          <h2 className="text-2xl font-bold text-white">
            Estructuración Pedagógica y Sistema de Evaluación
          </h2>
          <p className="text-slate-300 text-sm mt-2 leading-relaxed">
            Adapta el temario al formato de impartición que mejor se ajuste a tus alumnos. El temario está diseñado modularmente para escalar desde un bootcamp de 5 días hasta un cuatrimestre universitario completo.
          </p>
        </div>
      </div>

      {/* Format Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(['bootcamp', 'universidad', 'autoestudio'] as const).map((fmtKey) => {
          const item = formats[fmtKey];
          const isSelected = selectedFormat === fmtKey;
          const icons = {
            bootcamp: <Flame className="w-4 h-4 text-rose-400" />,
            universidad: <GraduationCap className="w-4 h-4 text-cyan-400" />,
            autoestudio: <Compass className="w-4 h-4 text-emerald-400" />
          };

          return (
            <button
              key={fmtKey}
              onClick={() => setSelectedFormat(fmtKey)}
              className={`text-left p-5 rounded-2xl border transition-all relative overflow-hidden ${
                isSelected
                  ? 'bg-slate-800/90 border-cyan-500 shadow-xl ring-2 ring-cyan-500/20'
                  : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/40 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  {icons[fmtKey]}
                </span>
                <span className="text-xs font-mono font-bold text-cyan-400">
                  {item.totalHours} Horas
                </span>
              </div>

              <h3 className="text-base font-bold text-white mt-1">
                {item.name}
              </h3>

              <p className="text-slate-400 text-xs mt-2 line-clamp-2">
                {item.schedule}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-semibold text-slate-300">
                {item.badge}
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail View of Chosen Format */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-2">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-400" />
              Cronograma Recomendado: {current.name}
            </h3>
            <p className="text-slate-400 text-xs mt-1">
              Perfil de alumnado: {current.target}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Horario tipo:</span>
            <span className="text-xs font-mono text-cyan-300 font-semibold">{current.schedule}</span>
          </div>
        </div>

        {/* Schedule Milestones */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Secuencia Temporal de Contenidos:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {current.highlights.map((step, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 flex items-start gap-3">
                <span className="w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400 font-mono font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span className="mt-0.5 leading-relaxed">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Evaluation Criteria Grid */}
        <div className="pt-4 border-t border-slate-800">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" /> Criterios de Evaluación y Calificación del Alumno
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">1. Cuaderno de Laboratorios</span>
                <span className="text-cyan-400 font-mono font-bold text-sm">40%</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Entrega de volcados binarios (.bin), trazas PCAP de sniffing y comandos ejecutados durante las 18 prácticas guiadas.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">2. CTF Práctico de RF</span>
                <span className="text-rose-400 font-mono font-bold text-sm">35%</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Prueba práctica en vivo: El profesor entrega una tarjeta anónima y el alumno debe identificarla, crackearla y abrir un relé de control de acceso.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">3. Informe de Auditoría</span>
                <span className="text-emerald-400 font-mono font-bold text-sm">25%</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Redacción de informe profesional simulado para el cliente: resumen ejecutivo, clasificación CVSS de las vulnerabilidades y plan de migración a DESFire EV3.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
