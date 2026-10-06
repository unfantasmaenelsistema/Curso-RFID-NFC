import React, { useState, useRef } from 'react';
import { 
  Award, Download, Printer, CheckCircle2, Shield, Calendar, 
  User, Sparkles, QrCode, FileText, Check, Copy, Share2 
} from 'lucide-react';

export const CertificationModule: React.FC = () => {
  const [studentName, setStudentName] = useState('Alejandro Navarro Gómez');
  const [studentId, setStudentId] = useState('SEC-2026-RFID-8924');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [specialization, setSpecialization] = useState('Especialista en Auditoría de Radiofrecuencia (RFID / NFC) y Pentesting Físico');
  const [instructorName, setInstructorName] = useState('Equipo Docente Red Team & Ciberseguridad Física');
  const [copiedLink, setCopiedLink] = useState(false);

  const certRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyVerification = () => {
    const text = `Credencial Verificada: ${studentId} | Alumno: ${studentName} | Curso: Seguridad en RFID & NFC`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border border-amber-500/20 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-2">
              <Award className="w-3.5 h-3.5" /> Módulo de Acreditación Oficial
            </div>
            <h2 className="text-2xl font-bold text-white">
              Emisión de Certificado de Finalización de Curso
            </h2>
            <p className="text-slate-300 text-sm mt-1 leading-relaxed">
              Genera tu certificado acreditativo con identificador criptográfico único, competencias adquiridas y diseño profesional listo para imprimir o adjuntar en tu currículum y perfil de LinkedIn.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Guardar en PDF</span>
            </button>
            <button
              onClick={handleCopyVerification}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors border border-slate-700"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? '¡Verificación Copiada!' : 'Copiar Hash Verificable'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Editor Controls & Live Certificate Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Inputs */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <User className="w-4 h-4 text-cyan-400" />
              Datos del Alumno & Credencial
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  Nombre Completo del Alumno:
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium focus:outline-none focus:border-cyan-500 text-xs"
                  placeholder="Ej: Laura Martínez Santos"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  Identificador / Hash de Certificado:
                </label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-cyan-400 font-mono focus:outline-none focus:border-cyan-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  Fecha de Emisión:
                </label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  Mención de Especialidad:
                </label>
                <input
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  Autoridad Certificadora / Docente:
                </label>
                <input
                  type="text"
                  value={instructorName}
                  onChange={(e) => setInstructorName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                El certificado incluye el sello criptográfico verificable y las 41 horas lectivas del programa formativo.
              </span>
            </div>
          </div>

          {/* Endorsed Competencies Overview */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-xs space-y-2">
            <h4 className="font-bold text-slate-300">Competencias Validadas:</h4>
            <div className="space-y-1.5 text-slate-400 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                <span>Auditoría de protocolos ISO 14443-A/B e ISO 15693</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Criptoanálisis de Crypto-1 en MIFARE Classic 1K/4K</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>Clonación y emulación LF 125 kHz con chip Atmel T5577</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                <span>Defensa y despliegue de MIFARE DESFire EV3 con AES-128</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Certificate Viewport */}
        <div className="lg:col-span-8">
          <div 
            ref={certRef}
            className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-4 border-double border-amber-500/40 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden text-slate-100 select-none print:m-0 print:border-black print:text-black print:bg-white"
          >
            {/* Background Watermark Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
              <Award className="w-[500px] h-[500px] text-amber-300" />
            </div>

            {/* Corner Decorative Ornaments */}
            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-amber-400/60"></div>
            <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-amber-400/60"></div>
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-amber-400/60"></div>
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-amber-400/60"></div>

            {/* Certificate Header */}
            <div className="text-center space-y-3 relative z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 font-mono text-xs uppercase tracking-widest font-bold">
                ★ CERTIFICADO DE ACREDITACIÓN PROFESIONAL ★
              </div>

              <h1 className="text-2xl sm:text-3xl font-serif tracking-wider font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 uppercase mt-2">
                Academia de Ciberseguridad Física & RFID/NFC
              </h1>

              <p className="text-slate-400 text-xs tracking-widest uppercase font-mono">
                Laboratorio de Seguridad en Radiofrecuencia y Control de Accesos
              </p>
            </div>

            {/* Recipient Statement */}
            <div className="text-center my-8 space-y-3 relative z-10">
              <p className="text-slate-300 text-sm font-serif italic">
                Por cuanto ha completado satisfactoriamente los 6 módulos formativos y los 18 laboratorios prácticos de auditoría, se otorga el presente diploma a:
              </p>

              <div className="py-2">
                <span className="text-2xl sm:text-4xl font-serif font-extrabold text-white tracking-wide border-b-2 border-amber-400/50 pb-2 inline-block px-8">
                  {studentName || 'Nombre del Alumno'}
                </span>
              </div>

              <p className="text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto pt-3 leading-relaxed">
                Por haber demostrado competencia técnica sobresaliente en el título de:
              </p>

              <p className="text-cyan-400 font-bold text-sm sm:text-base tracking-wide font-mono">
                {specialization}
              </p>

              <p className="text-slate-400 text-xs font-mono">
                Carga lectiva: <strong>41 Horas</strong> (78% Laboratorio Práctico con instrumental Proxmark3, LibNFC y análisis criptográfico)
              </p>
            </div>

            {/* Footer with Signatures & Hash */}
            <div className="mt-12 pt-6 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end relative z-10 text-xs">
              {/* Left: Security Seal / QR */}
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-slate-900 border border-amber-500/30 p-2 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
                  <Shield className="w-8 h-8" />
                </div>
                <div className="text-[11px] font-mono">
                  <span className="text-amber-400 block font-bold">SELLO OFICIAL</span>
                  <span className="text-slate-400">Acreditación Red Team</span>
                </div>
              </div>

              {/* Center: ID and Date */}
              <div className="text-center font-mono text-[11px] space-y-1">
                <span className="text-slate-500 block">ID DE VERIFICACIÓN:</span>
                <span className="text-cyan-400 font-bold block">{studentId}</span>
                <span className="text-slate-400 block">Emitido el: {issueDate}</span>
              </div>

              {/* Right: Signature */}
              <div className="text-right sm:text-right space-y-1">
                <div className="border-b border-slate-700 pb-1 inline-block min-w-[140px] text-center">
                  <span className="font-serif italic text-amber-200 text-sm">Comité Evaluador</span>
                </div>
                <span className="text-slate-400 text-[10px] block font-mono">
                  {instructorName}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
