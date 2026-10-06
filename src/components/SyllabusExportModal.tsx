import React, { useState } from 'react';
import { COURSE_MODULES, HARDWARE_KITS, ATTACK_MATRIX } from '../data/curriculumData';
import { GLOSSARY_TERMS } from '../data/glossaryData';
import { FREQUENCY_BANDS } from './FrequencySpectrumMap';
import { Copy, Check, Download, FileText, X, Sparkles, Printer } from 'lucide-react';

interface SyllabusExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SyllabusExportModal: React.FC<SyllabusExportModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [exportFormat, setExportFormat] = useState<'markdown' | 'json'>('markdown');

  if (!isOpen) return null;

  const generateMarkdown = () => {
    let md = `# Plan de Estudios: Curso Práctico de Ciberseguridad en RFID & NFC\n\n`;
    md += `> **Enfoque:** 100% Práctico y Orientado a Pentesters Físicos Junior\n`;
    md += `> **Duración total:** 41 Horas Lectivas (78% Práctica en Laboratorio)\n`;
    md += `> **Requisitos:** Conocimientos básicos de Linux y terminal. No se requieren conocimientos previos de radiofrecuencia.\n\n`;

    md += `## 📚 Índice Modular de Contenidos\n\n`;
    COURSE_MODULES.forEach((mod) => {
      md += `### Módulo ${mod.number}: ${mod.title} (${mod.durationHours}h - ${mod.practicePercentage}% Práctica)\n`;
      md += `*${mod.subtitle}*\n\n`;
      md += `${mod.description}\n\n`;
      md += `#### Lecciones y Laboratorios:\n`;
      mod.lessons.forEach((les, idx) => {
        md += `1. **${les.title}** (${les.duration} - Dificultad: ${les.difficulty})\n`;
        md += `   - **Resumen:** ${les.summary}\n`;
        md += `   - **Objetivos:** ${les.objectives.join('; ')}\n`;
        md += `   - **Herramientas:** ${les.toolsUsed.join(', ')}\n`;
        md += `   - **Laboratorio:** *${les.practicalExercise.title}*\n`;
        if (les.practicalExercise.commands) {
          md += `     - Comandos clave: \`${les.practicalExercise.commands.map(c => c.cmd).join('` | `')}\`\n`;
        }
        md += `\n`;
      });
      md += `\n---\n\n`;
    });

    md += `## 🛠️ Hardware Recomendado para el Alumno\n\n`;
    HARDWARE_KITS.forEach((kit) => {
      md += `### ${kit.tier} (Presupuesto: ${kit.budgetEur})\n`;
      md += `- Destinado a: ${kit.targetAudience}\n`;
      md += `- Componentes:\n`;
      kit.items.forEach((item) => {
        md += `  - **${item.name}** (~${item.approxPrice}): ${item.purpose} (${item.isEssential ? 'Imprescindible' : 'Opcional'})\n`;
      });
      md += `\n`;
    });

    md += `## 📖 Glosario Técnico Esencial para Principiantes\n\n`;
    GLOSSARY_TERMS.forEach((gt) => {
      md += `### ${gt.term} ${gt.acronym ? `(${gt.acronym})` : ''} [${gt.category}]\n`;
      md += `- **Definición:** ${gt.shortDefinition}\n`;
      md += `- **Detalle:** ${gt.detailedExplanation}\n`;
      md += `- **Impacto en Seguridad:** ${gt.cybersecurityImpact}\n`;
      if (gt.realWorldExample) {
        md += `- **Ejemplo real:** \`${gt.realWorldExample.value}\` (${gt.realWorldExample.explanation})\n`;
      }
      md += `\n`;
    });

    md += `## 📡 Mapa del Espectro de Radiofrecuencia (LF vs HF vs UHF)\n\n`;
    FREQUENCY_BANDS.forEach((band) => {
      md += `### ${band.name} (${band.frequencyRange})\n`;
      md += `- **Longitud de onda:** ${band.wavelength}\n`;
      md += `- **Acoplamiento:** ${band.couplingType}\n`;
      md += `- **Rango operativo:** ${band.typicalRange}\n`;
      md += `- **Tecnologías clave:** ${band.representativeTechs.map(t => `${t.name} [${t.securityLevel}]`).join(', ')}\n`;
      md += `- **Comportamiento en agua/metal:** Agua (${band.waterMetalBehavior.water}), Metal (${band.waterMetalBehavior.metal})\n\n`;
    });

    return md;
  };

  const generateJson = () => {
    return JSON.stringify(
      {
        courseTitle: "Curso Práctico de Ciberseguridad en RFID y NFC",
        totalHours: 41,
        modules: COURSE_MODULES,
        hardwareKits: HARDWARE_KITS,
        attackMatrix: ATTACK_MATRIX,
        technicalGlossary: GLOSSARY_TERMS,
        frequencyBands: FREQUENCY_BANDS
      },
      null,
      2
    );
  };

  const textContent = exportFormat === 'markdown' ? generateMarkdown() : generateJson();

  const handleCopy = () => {
    navigator.clipboard.writeText(textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([textContent], { type: exportFormat === 'markdown' ? 'text/markdown' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = exportFormat === 'markdown' ? 'temario_rfid_nfc_ciberseguridad.md' : 'temario_rfid_nfc.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">
              Exportar Guía Docente y Temario Completo
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Format Switcher */}
        <div className="px-6 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Formato:</span>
            <button
              onClick={() => setExportFormat('markdown')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                exportFormat === 'markdown'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Markdown (.md)
            </button>
            <button
              onClick={() => setExportFormat('json')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                exportFormat === 'json'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              JSON Estructurado
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '¡Copiado!' : 'Copiar Portapapeles'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar Archivo</span>
            </button>
          </div>
        </div>

        {/* Text Preview Content */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs bg-slate-950 text-slate-300 select-all leading-relaxed whitespace-pre-wrap">
          {textContent}
        </div>
      </div>
    </div>
  );
};
