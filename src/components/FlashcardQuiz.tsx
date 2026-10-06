import React, { useState, useMemo } from 'react';
import { GLOSSARY_TERMS, GlossaryTerm } from '../data/glossaryData';
import { 
  Sparkles, RotateCw, CheckCircle2, XCircle, ArrowLeft, ArrowRight, 
  Shuffle, Award, HelpCircle, Eye, ShieldAlert, Terminal, RefreshCw, Layers 
} from 'lucide-react';

export const FlashcardQuiz: React.FC = () => {
  const [deck, setDeck] = useState<GlossaryTerm[]>([...GLOSSARY_TERMS]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());
  const [reviewIds, setReviewIds] = useState<Set<string>>(new Set());
  const [quizMode, setQuizMode] = useState<'flashcards' | 'test'>('flashcards');

  // Test mode state
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState<boolean>(false);
  const [testScore, setTestScore] = useState<number>(0);

  const currentCard = deck[currentIndex] || deck[0];

  // Generate 4 multiple-choice options for Test mode
  const testOptions = useMemo(() => {
    if (!currentCard) return [];
    const correctAnswer = currentCard.shortDefinition;
    const wrongAnswers = GLOSSARY_TERMS
      .filter(t => t.id !== currentCard.id)
      .map(t => t.shortDefinition)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    return [correctAnswer, ...wrongAnswers].sort(() => 0.5 - Math.random());
  }, [currentCard]);

  const handleNext = () => {
    setIsFlipped(false);
    setSelectedOption(null);
    setHasAnswered(false);
    if (currentIndex < deck.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setSelectedOption(null);
    setHasAnswered(false);
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else {
      setCurrentIndex(deck.length - 1);
    }
  };

  const handleShuffle = () => {
    const shuffled = [...deck].sort(() => 0.5 - Math.random());
    setDeck(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSelectedOption(null);
    setHasAnswered(false);
  };

  const markMastered = () => {
    setMasteredIds(prev => new Set(prev).add(currentCard.id));
    setReviewIds(prev => {
      const next = new Set(prev);
      next.delete(currentCard.id);
      return next;
    });
    handleNext();
  };

  const markReview = () => {
    setReviewIds(prev => new Set(prev).add(currentCard.id));
    setMasteredIds(prev => {
      const next = new Set(prev);
      next.delete(currentCard.id);
      return next;
    });
    handleNext();
  };

  const handleSelectOption = (option: string) => {
    if (hasAnswered) return;
    setSelectedOption(option);
    setHasAnswered(true);
    if (option === currentCard.shortDefinition) {
      setTestScore(prev => prev + 1);
      setMasteredIds(prev => new Set(prev).add(currentCard.id));
    } else {
      setReviewIds(prev => new Set(prev).add(currentCard.id));
    }
  };

  const progressPercentage = Math.round(((currentIndex + 1) / deck.length) * 100);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Controls bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs font-bold">
              AUTO-EVALUACIÓN DIDÁCTICA
            </span>
            <span className="text-slate-400 text-xs font-mono">
              Tarjeta {currentIndex + 1} de {deck.length}
            </span>
          </div>
          <h3 className="text-lg font-bold text-white">
            Tarjetas de Memoria & Retos del Glosario RFID/NFC
          </h3>
        </div>

        {/* Mode Switcher + Shuffle */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1 text-xs">
            <button
              onClick={() => { setQuizMode('flashcards'); setIsFlipped(false); }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                quizMode === 'flashcards'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Modo Flashcards
            </button>
            <button
              onClick={() => { setQuizMode('test'); setSelectedOption(null); setHasAnswered(false); }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                quizMode === 'test'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Modo Test (Quiz)
            </button>
          </div>

          <button
            onClick={handleShuffle}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
            title="Barajar tarjetas aleatoriamente"
          >
            <Shuffle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mastery Score Progress Banner */}
      <div className="grid grid-cols-3 gap-3 text-center text-xs">
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-slate-400 block text-[11px] mb-0.5">Progreso Mazo:</span>
          <span className="text-white font-mono font-bold text-sm">{progressPercentage}%</span>
        </div>
        <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20">
          <span className="text-emerald-400 block text-[11px] mb-0.5">Conceptos Dominados:</span>
          <span className="text-emerald-300 font-mono font-bold text-sm">{masteredIds.size}</span>
        </div>
        <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/20">
          <span className="text-amber-400 block text-[11px] mb-0.5">Por Repasar:</span>
          <span className="text-amber-300 font-mono font-bold text-sm">{reviewIds.size}</span>
        </div>
      </div>

      {/* FLASHCARD INTERACTIVE VIEW */}
      {quizMode === 'flashcards' ? (
        <div className="space-y-4">
          {/* 3D Flip Card Container */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="cursor-pointer group relative min-h-[300px] sm:min-h-[340px] rounded-3xl p-8 border-2 transition-all duration-300 flex flex-col justify-between shadow-2xl select-none bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-cyan-500/30 hover:border-cyan-400/60 hover:shadow-cyan-500/10"
          >
            {/* Top Info of Card */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                {currentCard.category}
              </span>
              <span className="text-xs font-mono text-slate-500 flex items-center gap-1 group-hover:text-cyan-400 transition-colors">
                <RotateCw className="w-3.5 h-3.5 animate-spin-slow" />
                {isFlipped ? 'Volver al anverso' : 'Haz clic para voltear'}
              </span>
            </div>

            {/* Front vs Back Content */}
            {!isFlipped ? (
              /* FRONT: Term + Clue */
              <div className="text-center py-8 space-y-4">
                <span className="text-[11px] text-slate-400 uppercase tracking-widest font-mono">
                  ¿Recuerdas qué significa y por qué importa?
                </span>
                <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                  {currentCard.term}
                </h2>
                {currentCard.acronym && (
                  <p className="text-cyan-400/90 font-mono text-sm max-w-md mx-auto">
                    {currentCard.acronym}
                  </p>
                )}
                <div className="pt-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-400 text-xs">
                    <HelpCircle className="w-3.5 h-3.5 text-cyan-400" /> Toca para revelar respuesta
                  </span>
                </div>
              </div>
            ) : (
              /* BACK: Definition + Security Impact */
              <div className="py-4 space-y-4 animate-fadeIn text-left">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">
                    Definición Técnica:
                  </h4>
                  <p className="text-slate-100 text-sm leading-relaxed font-medium">
                    {currentCard.shortDefinition}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/30 text-xs space-y-1">
                  <span className="font-bold text-rose-400 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" /> Impacto en Pentesting Físico:
                  </span>
                  <p className="text-rose-200/90 text-[11px] leading-relaxed">
                    {currentCard.cybersecurityImpact}
                  </p>
                </div>

                {currentCard.realWorldExample && (
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-400 flex items-center justify-between">
                    <span>Ejemplo: {currentCard.realWorldExample.value}</span>
                    <Terminal className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                )}
              </div>
            )}

            {/* Bottom Card Footer */}
            <div className="border-t border-slate-800/80 pt-4 flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>{isFlipped ? 'Respuesta revelada' : 'Anverso'}</span>
              <span>#{currentCard.id}</span>
            </div>
          </div>

          {/* Self-Assessment Response Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handlePrev}
                className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Anterior
              </button>
              <button
                onClick={handleNext}
                className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-800 transition-colors"
              >
                Siguiente <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={markReview}
                className="flex-1 sm:flex-initial px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Necesito Repasar
              </button>
              <button
                onClick={markMastered}
                className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-emerald-600/20"
              >
                <CheckCircle2 className="w-4 h-4" /> ¡Me lo sé!
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* MULTIPLE CHOICE TEST MODE */
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-mono text-cyan-400 font-bold block mb-1">
              PREGUNTA TIPO TEST
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              ¿Cuál es la definición correcta de <span className="text-cyan-400">{currentCard.term}</span>?
            </h3>
            {currentCard.acronym && (
              <span className="text-xs font-mono text-slate-400 mt-1 block">
                Pista: {currentCard.acronym}
              </span>
            )}
          </div>

          {/* 4 Options Grid */}
          <div className="space-y-3">
            {testOptions.map((opt, idx) => {
              const isSelected = selectedOption === opt;
              const isCorrect = opt === currentCard.shortDefinition;

              let btnClass = 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-900';
              if (hasAnswered) {
                if (isCorrect) {
                  btnClass = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-semibold ring-1 ring-emerald-500/40';
                } else if (isSelected) {
                  btnClass = 'bg-rose-950/60 border-rose-500 text-rose-200 ring-1 ring-rose-500/40';
                } else {
                  btnClass = 'bg-slate-950/40 border-slate-800/40 text-slate-500 opacity-60';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(opt)}
                  disabled={hasAnswered}
                  className={`w-full p-4 rounded-2xl border text-left text-xs transition-all flex items-start gap-3 ${btnClass}`}
                >
                  <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-700 font-mono font-bold flex items-center justify-center shrink-0 text-slate-300">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="mt-0.5 leading-relaxed flex-1">{opt}</span>
                  {hasAnswered && isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  )}
                  {hasAnswered && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback & Next Button */}
          {hasAnswered && (
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between animate-fadeIn">
              <div className="text-xs">
                {selectedOption === currentCard.shortDefinition ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> ¡Correcto! Has sumado 1 punto.
                  </span>
                ) : (
                  <span className="text-rose-400 font-bold flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" /> Respuesta incorrecta. Revisa la definición destacada en verde.
                  </span>
                )}
              </div>
              <button
                onClick={handleNext}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md"
              >
                Siguiente Pregunta <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
