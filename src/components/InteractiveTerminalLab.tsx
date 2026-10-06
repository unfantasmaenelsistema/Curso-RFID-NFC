import React, { useState } from 'react';
import { SIMULATED_CARDS, SimulatedCard } from '../data/simulatedCardsData';
import { HexMemoryViewer } from './HexMemoryViewer';
import { StepByStepLab } from './StepByStepLab';
import { AttackLabSimulator } from './AttackLabSimulator';
import { AntennaCloningLab } from './AntennaCloningLab';
import { Terminal, Radio, Play, RefreshCw, Cpu, ShieldAlert, Sparkles, Copy, Check, Zap, ListChecks } from 'lucide-react';

interface InteractiveTerminalLabProps {
  onNavigateToCertificate?: () => void;
  defaultSubTab?: 'terminal' | 'checklist' | 'ataques' | 'clonado';
}

export const InteractiveTerminalLab: React.FC<InteractiveTerminalLabProps> = ({ onNavigateToCertificate, defaultSubTab }) => {
  const [activeSubTab, setActiveSubTab] = useState<'terminal' | 'checklist' | 'ataques' | 'clonado'>(defaultSubTab || 'checklist');
  const [selectedCard, setSelectedCard] = useState<SimulatedCard>(SIMULATED_CARDS[0]);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    '[+] Proxmark3 RDV4 con firmware Iceman v4.16854 detectado.',
    '[+] Puerto /dev/ttyACM0 inicializado a 115200 bauds.',
    '[+] Coloca una tarjeta sobre la antena y ejecuta un comando de búsqueda o autopwn.',
    'pm3 --> '
  ]);
  const [inputCmd, setInputCmd] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});
  const [clonedSuccess, setClonedSuccess] = useState<string | null>(null);

  const appendLogs = (lines: string[]) => {
    setConsoleLogs(prev => [...prev, ...lines, 'pm3 --> ']);
  };

  const handleRunCommand = (commandStr: string) => {
    const cmd = commandStr.trim().toLowerCase();
    if (!cmd) return;

    setIsProcessing(true);
    setInputCmd('');

    setTimeout(() => {
      if (cmd === 'clear' || cmd === 'cls') {
        setConsoleLogs(['pm3 --> ']);
        setIsProcessing(false);
        return;
      }

      if (cmd === 'hw tune' || cmd === 'hw status') {
        appendLogs([
          `[#] Ejecutando diagnósticos de antena...`,
          `[+] Medición de voltaje pico a pico:`,
          `[+]   Antena LF (125 kHz): 34.2 V @ 125.00 kHz (Sintonizada OK)`,
          `[+]   Antena HF (13.56 MHz): 21.8 V @ 13.56 MHz (Sintonizada OK)`,
          `[+] Microcontrolador: SAM57J 512Kb - FPGA: Xilinx Spartan-II`
        ]);
        setIsProcessing(false);
        return;
      }

      if (cmd === 'lf search') {
        if (selectedCard.frequency.includes('125 kHz')) {
          if (selectedCard.id === 'card-hid-prox') {
            appendLogs([
              `[#] Buscando modulación LF (125/134 kHz)...`,
              `[+] [=] Formato encontrado: HID Prox (FSK 125 kHz)`,
              `[+] [=] Formato Wiegand: 26 bits (H10301)`,
              `[+] [=] Facility Code (FC): ${selectedCard.lfData?.facilityCode}`,
              `[+] [=] Card Number   (CN): ${selectedCard.lfData?.cardNumber}`,
              `[+] [=] Raw Hex: ${selectedCard.lfData?.rawHex}`,
              `[+] [?] ¿Deseas clonarlo a una T5577? Ejecuta: lf hid clone --fc ${selectedCard.lfData?.facilityCode} --cn ${selectedCard.lfData?.cardNumber}`
            ]);
          } else {
            appendLogs([
              `[#] Buscando modulación LF...`,
              `[+] [=] Formato encontrado: EM410x (Manchester 125 kHz)`,
              `[+] [=] Raw ID: ${selectedCard.uid}`,
              `[+] [=] Paridad horizontal y vertical: VÁLIDA`,
              `[+] [?] Para clonar ejecuta: lf em 410x clone --id ${selectedCard.uid.replace(/\s+/g, '')}`
            ]);
          }
        } else {
          appendLogs([
            `[#] Buscando modulación LF...`,
            `[-] No se detectó ninguna portadora en 125 kHz.`,
            `[!] La tarjeta actual opera en HF (13.56 MHz). Prueba ejecutando: hf search`
          ]);
        }
        setIsProcessing(false);
        return;
      }

      if (cmd === 'hf search' || cmd === 'hf 14a info') {
        if (selectedCard.frequency.includes('13.56 MHz')) {
          appendLogs([
            `[#] Buscando estándar ISO/IEC 14443-A...`,
            `[+] UID:  ${selectedCard.uid}`,
            `[+] ATQA: ${selectedCard.atqa || '00 04'}`,
            `[+] SAK:  ${selectedCard.sak || '08'} [${selectedCard.technology}]`,
            `[+] PRNG detectado: ${selectedCard.vulnerabilityType.includes('débil') ? 'VULNERABLE (Predictable Weak Nonces)' : 'Seguro / Desconocido'}`,
            `[+] Fingerprint: ${selectedCard.technology}`
          ]);
        } else {
          appendLogs([
            `[#] Buscando estándar ISO/IEC 14443-A...`,
            `[-] No se detectó modulación de 13.56 MHz.`,
            `[!] Esta tarjeta opera en LF (125 kHz). Prueba ejecutando: lf search`
          ]);
        }
        setIsProcessing(false);
        return;
      }

      if (cmd.startsWith('hf mf autopwn') || cmd.startsWith('autopwn')) {
        if (selectedCard.id === 'card-mifare-vuln') {
          // crack all keys
          setRevealedKeys({
            '0-A': true,
            '0-B': true,
            '1-A': true,
            '1-B': true,
            '2-A': true,
            '2-B': true
          });
          appendLogs([
            `[#] Iniciando ataque autopwn automatizado contra MIFARE Classic 1K...`,
            `[1] Fase 1: Ataque de diccionario contra 16 sectores...`,
            `[+]   Sector 00: Key A encontrada [A0A1A2A3A4A5] | Key B encontrada [FFFFFFFFFFFF]`,
            `[+]   Sector 02: Key A encontrada [D3F7D3F7D3F7] | Key B encontrada [FFFFFFFFFFFF]`,
            `[2] Fase 2: Ataque Nested usando Key A del sector 0 para derivar Sector 01...`,
            `[+]   Midiendo distancia de nonces (nt1 -> nt2)...`,
            `[+]   Espacio de claves colapsado a 4096 candidatos...`,
            `[+]   Sector 01: Key A encontrada [1B4F99C2083A] | Key B encontrada [90E4113AD188]`,
            `[+] ¡ÉXITO! Las 32 claves (16 sectores A/B) fueron recuperadas en 4.2 segundos.`,
            `[+] Volcado guardado automáticamente en: dump_mifare_${selectedCard.uid.replace(/\s+/g, '')}.bin`,
            `[+] Revisa el visor de memoria para inspeccionar los bloques descifrados.`
          ]);
        } else if (selectedCard.id === 'card-desfire-secure') {
          appendLogs([
            `[#] Iniciando ataque autopwn...`,
            `[-] ERROR: La tarjeta es MIFARE DESFire EV3 (ISO 14443-4).`,
            `[-] Este chip utiliza criptografía simétrica AES-128 nativa.`,
            `[-] Crypto-1 no está presente. El ataque de nonces es INAPLICABLE.`
          ]);
        } else {
          appendLogs([
            `[-] Comando incompatible: la tarjeta no es MIFARE Classic HF.`
          ]);
        }
        setIsProcessing(false);
        return;
      }

      if (cmd.startsWith('lf hid clone') || cmd.startsWith('lf em 410x clone')) {
        setClonedSuccess(`Tarjeta virtual T5577 grabada con éxito con los parámetros de: ${selectedCard.name}`);
        appendLogs([
          `[#] Programando bloques de configuración en chip Atmel T5577...`,
          `[+] Escribiendo Bloque 0: Configuración de modulación y bit rate...`,
          `[+] Escribiendo Bloque 1 y 2: Identificador Wiegand / EM4100...`,
          `[+] Verificando checksum y respuesta en antena...`,
          `[+] [OK] ¡Clonación completada con éxito! La tarjeta T5577 responderá de forma indistinguible.`
        ]);
        setIsProcessing(false);
        return;
      }

      // Default fallback
      appendLogs([
        `[-] Comando no reconocido: "${cmd}"`,
        `[i] Comandos disponibles:`,
        `    hw tune                 (Verifica estado de antenas)`,
        `    lf search               (Escanea tarjetas de 125 kHz)`,
        `    hf search               (Escanea tarjetas de 13.56 MHz / NFC)`,
        `    hf mf autopwn           (Ataque completo a MIFARE Classic)`,
        `    lf hid clone            (Clona tarjeta HID a T5577)`,
        `    clear                   (Limpia la consola)`
      ]);
      setIsProcessing(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Explanatory context */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-900/40 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold mb-2">
              <Zap className="w-3.5 h-3.5" /> Laboratorio Práctico Virtual Integrado
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white">
              Simulador de Pentesting de Radiofrecuencia (CLI)
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Experimenta los comandos reales de <strong>Proxmark3 Iceman</strong> y la estructura de memoria sin necesidad de tener el hardware físico conectado en este momento. Ideal para enseñar en clase antes del laboratorio presencial.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleRunCommand('hw tune')}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors border border-slate-700"
            >
              hw tune
            </button>
            <button
              onClick={() => handleRunCommand(selectedCard.frequency.includes('125') ? 'lf search' : 'hf search')}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono transition-colors shadow-sm"
            >
              {selectedCard.frequency.includes('125') ? 'lf search' : 'hf search'}
            </button>
            {selectedCard.id === 'card-mifare-vuln' && (
              <button
                onClick={() => handleRunCommand('hf mf autopwn')}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono transition-colors shadow-sm animate-pulse"
              >
                hf mf autopwn ⚡
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sub-tab Switcher: Step-by-Step Checklist vs Free CLI Terminal vs Attack Flow Simulator */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-2 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveSubTab('checklist')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeSubTab === 'checklist'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <ListChecks className="w-4 h-4" />
            <span>Práctica Guiada Paso a Paso</span>
          </button>

          <button
            onClick={() => setActiveSubTab('terminal')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeSubTab === 'terminal'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Consola Virtual Libre (CLI)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('ataques')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeSubTab === 'ataques'
                ? 'bg-rose-500 text-slate-950 font-bold shadow-lg shadow-rose-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Simulador de Flujo de Ataques</span>
          </button>

          <button
            onClick={() => setActiveSubTab('clonado')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeSubTab === 'clonado'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Radio className="w-4 h-4 text-amber-400" />
            <span>Laboratorio de Clonado HID Prox & Antenas</span>
          </button>
        </div>

        <div className="text-xs text-slate-400 font-mono hidden sm:block pr-2">
          {activeSubTab === 'checklist' && '✅ Tareas paso a paso con barra de progreso'}
          {activeSubTab === 'terminal' && '⚡ Simulación de comandos Proxmark3 Iceman'}
          {activeSubTab === 'ataques' && '🎯 Diagramas de flujo de desafío-respuesta (Nested, Replay, etc.)'}
          {activeSubTab === 'clonado' && '🏷️ Lectura FSK, programación T5577 y emulación en lector'}
        </div>
      </div>

      {activeSubTab === 'checklist' ? (
        <StepByStepLab
          onRunCommand={(cmd) => {
            setActiveSubTab('terminal');
            handleRunCommand(cmd);
          }}
          onViewCertificate={onNavigateToCertificate}
        />
      ) : activeSubTab === 'ataques' ? (
        <AttackLabSimulator />
      ) : activeSubTab === 'clonado' ? (
        <AntennaCloningLab />
      ) : (
        <>
          {/* Target Credential Selector */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {SIMULATED_CARDS.map(card => {
          const isSelected = card.id === selectedCard.id;
          const isLF = card.frequency.includes('125');

          return (
            <div
              key={card.id}
              onClick={() => {
                setSelectedCard(card);
                setClonedSuccess(null);
                appendLogs([
                  `[>] Tarjeta cambiada en el lector a: [${card.name}] (${card.frequency})`
                ]);
              }}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'bg-slate-800/90 border-cyan-500 ring-2 ring-cyan-500/20 shadow-lg'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                  isLF ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                }`}>
                  {card.frequency}
                </span>
                <Radio className={`w-4 h-4 ${isSelected ? 'text-cyan-400 animate-pulse' : 'text-slate-600'}`} />
              </div>
              <h3 className="text-white font-semibold text-sm line-clamp-1">{card.name}</h3>
              <p className="text-slate-400 text-xs mt-1 line-clamp-2">{card.description}</p>

              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>UID: {card.uid}</span>
                {isSelected && <span className="text-cyan-400 font-bold">ACTIVA</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Clone success notification */}
      {clonedSuccess && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{clonedSuccess}</span>
          </div>
          <button
            onClick={() => setClonedSuccess(null)}
            className="text-slate-400 hover:text-white text-xs"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Two column layout: Terminal Console + Memory / Vulnerability details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Terminal Window */}
        <div className="lg:col-span-7 flex flex-col bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
          {/* Terminal Title bar */}
          <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-200 font-mono text-xs font-semibold">Proxmark3 CLI — iceman@redteam-lab:~$</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-slate-400 text-[11px] font-mono">USB CONECTADO</span>
            </div>
          </div>

          {/* Console Output Area */}
          <div className="p-4 bg-slate-950/95 font-mono text-xs text-slate-300 min-h-[340px] max-h-[380px] overflow-y-auto space-y-1.5 selection:bg-cyan-500/30">
            {consoleLogs.map((log, idx) => (
              <div
                key={idx}
                className={
                  log.startsWith('pm3 -->') ? 'text-cyan-400 font-bold' :
                  log.includes('[+]') ? 'text-emerald-300' :
                  log.includes('[-]') ? 'text-rose-400' :
                  log.includes('[#]') ? 'text-purple-300' :
                  log.includes('[!]') ? 'text-amber-300' :
                  'text-slate-300'
                }
              >
                {log}
              </div>
            ))}
            {isProcessing && (
              <div className="flex items-center gap-2 text-amber-400 animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Interrogando antena y ejecutando algoritmos de radio...</span>
              </div>
            )}
          </div>

          {/* Command Input Bar */}
          <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
            <span className="text-cyan-400 font-mono text-xs font-bold pl-1">pm3 --&gt;</span>
            <input
              type="text"
              value={inputCmd}
              onChange={(e) => setInputCmd(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleRunCommand(inputCmd);
                }
              }}
              placeholder="Escribe un comando (ej: lf search, hf search, hf mf autopwn, hw tune)..."
              className="flex-1 bg-transparent text-slate-200 font-mono text-xs focus:outline-none placeholder-slate-600"
            />
            <button
              onClick={() => handleRunCommand(inputCmd)}
              disabled={isProcessing || !inputCmd.trim()}
              className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white rounded text-xs font-mono transition-colors"
            >
              Ejecutar
            </button>
          </div>

          {/* Quick Command Suggestions */}
          <div className="px-4 py-2 bg-slate-900/60 border-t border-slate-800/60 flex flex-wrap gap-2 items-center text-[11px] text-slate-400 font-mono">
            <span>Comandos rápidos:</span>
            <button onClick={() => handleRunCommand('hw tune')} className="text-slate-300 hover:text-cyan-300 underline">hw tune</button>
            <button onClick={() => handleRunCommand('lf search')} className="text-slate-300 hover:text-cyan-300 underline">lf search</button>
            <button onClick={() => handleRunCommand('hf search')} className="text-slate-300 hover:text-cyan-300 underline">hf search</button>
            <button onClick={() => handleRunCommand('hf mf autopwn')} className="text-slate-300 hover:text-cyan-300 underline">hf mf autopwn</button>
            <button onClick={() => handleRunCommand('clear')} className="text-slate-500 hover:text-slate-300">clear</button>
          </div>
        </div>

        {/* Right Panel: Live Memory or LF details */}
        <div className="lg:col-span-5 space-y-4">
          {/* Card Technical Sheet */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-white font-semibold text-sm flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" /> Ficha Técnica de la Credencial
              </h4>
              <span className="text-[11px] text-slate-400 font-mono">{selectedCard.standard}</span>
            </div>

            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Tecnología de Silicio:</span>
                <span className="text-slate-200 font-mono font-medium">{selectedCard.technology}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">UID / Serial:</span>
                <span className="text-emerald-400 font-mono font-bold">{selectedCard.uid}</span>
              </div>
              {selectedCard.atqa && (
                <div className="flex justify-between">
                  <span className="text-slate-400">ATQA / SAK:</span>
                  <span className="text-cyan-400 font-mono">{selectedCard.atqa} / {selectedCard.sak}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-slate-400 block mb-1">Diagnóstico de Vulnerabilidad:</span>
                <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-900/40 text-rose-300 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{selectedCard.vulnerabilityType}</span>
                </div>
              </div>
            </div>
          </div>

          {/* If HF MIFARE: Show Hex Memory Viewer */}
          {selectedCard.sectors && selectedCard.sectors.length > 0 && (
            <div>
              <HexMemoryViewer
                sectors={selectedCard.sectors}
                revealedKeys={revealedKeys}
              />
            </div>
          )}

          {/* If LF (125 kHz): Show Wiegand / Bit stream representation */}
          {selectedCard.lfData && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 font-mono text-xs">
              <h4 className="text-amber-400 font-semibold mb-2 flex items-center gap-2">
                <Radio className="w-4 h-4" /> Trama de Modulación Wiegand / LF
              </h4>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                <div>
                  <span className="text-slate-500 text-[10px] block">DESGLOSE DEL PROTOCOLO:</span>
                  <p className="text-slate-300 text-xs">{selectedCard.lfData.wiegandFormat}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">FACILITY CODE (Código de Edificio):</span>
                  <span className="text-cyan-400 font-bold text-sm">{selectedCard.lfData.facilityCode}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">CARD NUMBER (ID Usuario):</span>
                  <span className="text-emerald-400 font-bold text-sm">{selectedCard.lfData.cardNumber}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )}
</div>
);
};
