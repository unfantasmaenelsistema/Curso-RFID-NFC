import React, { useState, useEffect } from 'react';
import { GLOSSARY_TERMS, GlossaryTerm } from '../data/glossaryData';
import { FlashcardQuiz } from './FlashcardQuiz';
import { 
  BookOpen, Search, ShieldAlert, Sparkles, Terminal, Tag, Copy, 
  Check, ChevronRight, AlertTriangle, Cpu, Radio, Key, Filter, ExternalLink, Layers, X
} from 'lucide-react';

export const TechnicalGlossary: React.FC = () => {
  const [viewMode, setViewMode] = useState<'dictionary' | 'flashcards'>('dictionary');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedTermId, setExpandedTermId] = useState<string | null>('uid');
  const [copiedValue, setCopiedValue] = useState<string | null>(null);

  const categories = [
    'all',
    'Protocolos & Tramas',
    'Familias de Tarjetas',
    'Criptografía & Seguridad',
    'Hardware & Herramientas'
  ] as const;

  const trimmedQuery = searchTerm.trim().toLowerCase();

  const filteredTerms = GLOSSARY_TERMS.filter((item) => {
    const matchesSearch = 
      trimmedQuery === '' ||
      item.term.toLowerCase().includes(trimmedQuery) ||
      (item.acronym && item.acronym.toLowerCase().includes(trimmedQuery)) ||
      item.shortDefinition.toLowerCase().includes(trimmedQuery) ||
      item.detailedExplanation.toLowerCase().includes(trimmedQuery) ||
      item.cybersecurityImpact.toLowerCase().includes(trimmedQuery) ||
      item.relatedTerms.some(rt => rt.toLowerCase().includes(trimmedQuery));

    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Automatically expand the card when searching for a specific term (e.g. UID or SAK)
  useEffect(() => {
    if (trimmedQuery.length > 0) {
      const exactMatch = filteredTerms.find(t => 
        t.term.toLowerCase() === trimmedQuery || 
        t.id === trimmedQuery.toLowerCase()
      );
      if (exactMatch) {
        setExpandedTermId(exactMatch.id);
      } else if (filteredTerms.length === 1) {
        setExpandedTermId(filteredTerms[0].id);
      }
    }
  }, [trimmedQuery]);

  const handleCopy = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedValue(val);
    setTimeout(() => setCopiedValue(null), 2000);
  };

  // Helper to visually highlight search query matches in text
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-cyan-500/30 text-cyan-200 px-0.5 rounded font-bold">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const getCategoryColor = (cat: GlossaryTerm['category']) => {
    switch (cat) {
      case 'Protocolos & Tramas':
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
      case 'Familias de Tarjetas':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Criptografía & Seguridad':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'Hardware & Herramientas':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default:
        return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-2">
            <BookOpen className="w-3.5 h-3.5" /> Glosario Técnico & Conceptos Clave para Alumnos
          </div>
          <h2 className="text-2xl font-bold text-white">
            Diccionario de Radiofrecuencia y Ciberseguridad Física
          </h2>
          <p className="text-slate-300 text-sm mt-2 leading-relaxed">
            Una guía rápida de consulta para asimilar los acrónimos y estándares imprescindibles (UID, ATR/ATQA, SAK, MIFARE Classic, DESFire, Proxmark3, etc.) y entender exactamente <strong className="text-cyan-300">por qué importan al auditar un sistema</strong>.
          </p>
        </div>

        {/* Quick jump pills for top requested terms */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-mono text-[11px]">Términos más consultados:</span>
          {['UID', 'ATR / ATQA', 'SAK', 'MIFARE Classic', 'MIFARE DESFire', 'Proxmark3', 'Crypto-1', 'Wiegand'].map((termName) => {
            const found = GLOSSARY_TERMS.find(t => t.term.toLowerCase().includes(termName.toLowerCase()));
            if (!found) return null;
            return (
              <button
                key={termName}
                onClick={() => {
                  setViewMode('dictionary');
                  setSelectedCategory('all');
                  setSearchTerm('');
                  setExpandedTermId(found.id);
                  const el = document.getElementById(`term-${found.id}`);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-950/80 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-cyan-300 transition-colors font-mono"
              >
                {found.term}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sub-tab Switcher: Dictionary vs Flashcards Quiz */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-2 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('dictionary')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              viewMode === 'dictionary'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Diccionario Técnico (Lista Completa)</span>
          </button>

          <button
            onClick={() => setViewMode('flashcards')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              viewMode === 'flashcards'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Tarjetas de Memoria & Quiz de Auto-evaluación</span>
          </button>
        </div>

        <div className="text-xs text-slate-400 font-mono hidden sm:block pr-2">
          {viewMode === 'dictionary' ? `${filteredTerms.length} términos listados` : '🧠 Modo interactivo para fijar conocimientos'}
        </div>
      </div>

      {viewMode === 'flashcards' ? (
        <FlashcardQuiz />
      ) : (
        <>
          {/* Search & Filter Controls */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Dynamic Search Bar with live counter and clear button */}
              <div className="relative flex-1 max-w-lg">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-cyan-400" />
                <input
                  type="text"
                  placeholder="Buscar en tiempo real por término, acrónimo o concepto (ej: UID, SAK, ATR, DESFire)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-20 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all font-medium"
                />

                {/* Right tools inside search input: Clear button + Counter */}
                <div className="absolute right-2 top-2 flex items-center gap-1.5">
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Borrar búsqueda"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700/80 text-[10px] font-mono text-cyan-400">
                    {filteredTerms.length}
                  </span>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-500 mr-1" />
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      selectedCategory === cat
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat === 'all' ? 'Todos' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Keyword Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400 pt-1">
              <span className="font-mono text-[10px] text-slate-500 mr-1">Búsqueda rápida:</span>
              {['UID', 'SAK', 'ATR', 'MIFARE Classic', 'DESFire', 'Proxmark3', 'Crypto-1', 'Wiegand'].map((kw) => (
                <button
                  key={kw}
                  onClick={() => setSearchTerm(kw)}
                  className={`px-2 py-0.5 rounded-md font-mono transition-colors ${
                    searchTerm.toLowerCase() === kw.toLowerCase()
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                      : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800'
                  }`}
                >
                  {kw}
                </button>
              ))}
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-slate-500 hover:text-rose-400 underline ml-2 transition-colors"
                >
                  Limpiar filtro
                </button>
              )}
            </div>
          </div>

          {/* Terms Grid / List */}
          <div className="grid grid-cols-1 gap-4">
            {filteredTerms.length === 0 ? (
              <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3">
                <p className="text-slate-400 text-sm">
                  No se encontraron conceptos técnicos que coincidan con <strong className="text-white">"{searchTerm}"</strong>.
                </p>
                <div className="flex flex-wrap justify-center gap-2 pt-1 text-xs">
                  <span className="text-slate-500 text-xs">¿Buscabas alguno de estos términos?</span>
                  {['UID', 'SAK', 'DESFire', 'Proxmark3'].map(sugg => (
                    <button
                      key={sugg}
                      onClick={() => setSearchTerm(sugg)}
                      className="px-2.5 py-1 rounded bg-slate-800 text-cyan-400 font-mono text-xs hover:bg-slate-700"
                    >
                      {sugg}
                    </button>
                  ))}
                </div>
                <div>
                  <button
                    onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
                    className="mt-2 px-4 py-1.5 bg-cyan-600 text-white rounded-lg text-xs font-semibold hover:bg-cyan-500"
                  >
                    Mostrar todos los términos
                  </button>
                </div>
              </div>
            ) : (
              filteredTerms.map((item) => {
                const isExpanded = expandedTermId === item.id;
                const categoryBadge = getCategoryColor(item.category);

                return (
                  <div
                    key={item.id}
                    id={`term-${item.id}`}
                    className={`rounded-2xl border transition-all overflow-hidden ${
                      isExpanded
                        ? 'bg-slate-900/90 border-cyan-500/80 shadow-xl ring-1 ring-cyan-500/20'
                        : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-900/80 hover:border-slate-700'
                    }`}
                  >
                    {/* Term Card Header */}
                    <div
                      onClick={() => setExpandedTermId(isExpanded ? null : item.id)}
                      className="p-5 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            {highlightMatch(item.term, trimmedQuery)}
                          </h3>
                          {item.acronym && (
                            <span className="text-xs font-mono text-cyan-400/90 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
                              {highlightMatch(item.acronym, trimmedQuery)}
                            </span>
                          )}
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${categoryBadge}`}>
                            {item.category}
                          </span>
                        </div>

                        <p className="text-slate-300 text-xs sm:text-sm line-clamp-2">
                          {highlightMatch(item.shortDefinition, trimmedQuery)}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                        <span className="text-xs font-mono text-cyan-400 font-semibold hidden sm:inline">
                          {isExpanded ? 'Plegar detalles' : 'Ver análisis en seguridad'}
                        </span>
                        <div className={`p-1.5 rounded-lg bg-slate-800 text-slate-400 transition-transform ${isExpanded ? 'rotate-90 text-cyan-400' : ''}`}>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    {/* Expanded Detailed Information */}
                    {isExpanded && (
                      <div className="p-5 pt-0 border-t border-slate-800/80 space-y-4 text-xs mt-2 animate-fadeIn">
                        {/* Deep Explanation */}
                        <div className="pt-3">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-cyan-400" /> Explicación Técnica Detallada
                          </h4>
                          <p className="text-slate-300 text-xs leading-relaxed">
                            {highlightMatch(item.detailedExplanation, trimmedQuery)}
                          </p>
                        </div>

                        {/* Cybersecurity Impact Warning Box */}
                        <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-1.5">
                          <h4 className="font-bold text-rose-400 flex items-center gap-2 text-xs">
                            <ShieldAlert className="w-4 h-4 text-rose-400" />
                            ¿Por qué es crítico para un Pentester / Auditor de Seguridad?
                          </h4>
                          <p className="text-rose-200/90 text-xs leading-relaxed">
                            {highlightMatch(item.cybersecurityImpact, trimmedQuery)}
                          </p>
                        </div>

                    {/* Real World Example / Hex Payload if available */}
                    {item.realWorldExample && (
                      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                            <Terminal className="w-3.5 h-3.5" /> {item.realWorldExample.label}:
                          </span>
                          <button
                            onClick={() => handleCopy(item.realWorldExample!.value)}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors flex items-center gap-1"
                          >
                            {copiedValue === item.realWorldExample.value ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-[10px] text-emerald-400">Copiado</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span className="text-[10px]">Copiar</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="p-2 rounded bg-slate-900 border border-slate-800 text-emerald-400 font-bold text-xs select-all">
                          {item.realWorldExample.value}
                        </div>

                        <p className="text-slate-400 text-[11px] font-sans">
                          {item.realWorldExample.explanation}
                        </p>
                      </div>
                    )}

                    {/* Related Terms links */}
                    {item.relatedTerms && item.relatedTerms.length > 0 && (
                      <div className="pt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="text-slate-500 font-mono">Términos relacionados:</span>
                        {item.relatedTerms.map((rt, idx) => {
                          const target = GLOSSARY_TERMS.find(t => t.term.toLowerCase().includes(rt.toLowerCase()));
                          return (
                            <button
                              key={idx}
                              onClick={() => {
                                if (target) {
                                  setExpandedTermId(target.id);
                                  const el = document.getElementById(`term-${target.id}`);
                                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                } else {
                                  setSearchTerm(rt);
                                }
                              }}
                              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 transition-colors font-mono"
                            >
                              #{rt}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </>
  )}
</div>
);
};
