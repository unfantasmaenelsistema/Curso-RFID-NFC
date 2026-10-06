import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, ShieldCheck, AlertTriangle, Scale, Copy, Check, 
  Sparkles, Info, HelpCircle, ArrowRight, Gauge, Radio, 
  Lock, Unlock, Key, Layers, Terminal, BookOpen, FileText, CheckCircle2
} from 'lucide-react';

export interface CVSSParameters {
  attackVector: 'P' | 'A' | 'N'; // Physical, Adjacent, Network
  attackComplexity: 'L' | 'H'; // Low, High
  privilegesRequired: 'N' | 'L' | 'H'; // None, Low, High
  userInteraction: 'N' | 'R'; // None, Required
  scope: 'U' | 'C'; // Unchanged, Changed
  confidentiality: 'N' | 'L' | 'H'; // None, Low, High
  integrity: 'N' | 'L' | 'H'; // None, Low, High
  availability: 'N' | 'L' | 'H'; // None, Low, High
  // RFID specific context
  rfidProtocol: 'lf-hid' | 'lf-em' | 'hf-mifare' | 'hf-desfire' | 'uhf-epc' | 'other';
  encryptionState: 'none' | 'broken' | 'weak' | 'strong';
  proximityRequired: 'touch' | 'near' | 'medium' | 'long';
  toolReadilyAvailable: boolean;
}

export interface PresetAttackVulnerability {
  id: string;
  name: string;
  subtitle: string;
  rfidBand: 'LF 125 kHz' | 'HF 13.56 MHz' | 'UHF 868 MHz' | 'NFC / Relay';
  params: CVSSParameters;
  courseModuleTarget: string;
  studyPriority: 'Prioridad 1 (Imprescindible)' | 'Prioridad 2 (Muy Recomendado)' | 'Prioridad 3 (Avanzado)' | 'Inviable / Referencia Segura';
  priorityBadgeColor: string;
  auditImpactSummary: string;
  mitigationAdvice: string;
}

export const PRESET_ATTACKS: PresetAttackVulnerability[] = [
  {
    id: 'hid-prox-replay',
    name: 'Clonado & Replay en HID Prox II / EM4100',
    subtitle: 'Ausencia total de cifrado y retransmisión de trama Wiegand en texto plano',
    rfidBand: 'LF 125 kHz',
    params: {
      attackVector: 'A', // Adjacent (sniffer de radio a 10-30cm en el metro o cola)
      attackComplexity: 'L', // Low (sin criptografía)
      privilegesRequired: 'N', // None
      userInteraction: 'N', // None (la tarjeta responde automáticamente)
      scope: 'C', // Changed (abre puertas físicas y permite acceso a instalaciones)
      confidentiality: 'H', // High (revela el ID del empleado y Facility Code)
      integrity: 'H', // High (emula credenciales maestras de acceso)
      availability: 'N', // None
      rfidProtocol: 'lf-hid',
      encryptionState: 'none',
      proximityRequired: 'near',
      toolReadilyAvailable: true
    },
    courseModuleTarget: 'Módulo 2: Baja Frecuencia (LF 125 kHz) - HID & EM4100',
    studyPriority: 'Prioridad 1 (Imprescindible)',
    priorityBadgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    auditImpactSummary: 'Cualquier atacante con un dispositivo de 20€ (o Flipper Zero) puede capturar la credencial de un empleado al pasar junto a él y abrir los tornos de la oficina sin forzar cerraduras.',
    mitigationAdvice: 'Sustituir de inmediato los lectores y tarjetas HID Prox por MIFARE DESFire EV3 con protocolo OSDP v2 cifrado entre lector y controladora.'
  },
  {
    id: 'mifare-nested',
    name: 'Ataque Nested en MIFARE Classic',
    subtitle: 'Criptoanálisis de estados LFSR y generador PRNG determinista de Crypto-1',
    rfidBand: 'HF 13.56 MHz',
    params: {
      attackVector: 'P', // Physical (colocar la tarjeta sobre la Proxmark3 unos segundos)
      attackComplexity: 'L', // Low (automatizado con herramientas como mfoc o autopwn)
      privilegesRequired: 'L', // Low (requiere conocer 1 clave por defecto como FFFFFFFFFFFF)
      userInteraction: 'N', // None
      scope: 'C', // Changed (compromete todos los sectores de la tarjeta y el sistema de accesos)
      confidentiality: 'H', // High (descarga todas las claves A y B de los 16 sectores)
      integrity: 'H', // High (permite reescribir datos, saldos y privilegios de acceso)
      availability: 'N', // None
      rfidProtocol: 'hf-mifare',
      encryptionState: 'broken',
      proximityRequired: 'touch',
      toolReadilyAvailable: true
    },
    courseModuleTarget: 'Módulo 3: Alta Frecuencia (HF 13.56 MHz) - Criptoanálisis MIFARE',
    studyPriority: 'Prioridad 1 (Imprescindible)',
    priorityBadgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    auditImpactSummary: 'Permite descifrar todas las claves de acceso de una tarjeta en menos de 5 segundos con un lector Proxmark3 o teléfono Android con MCT si el Sector 0 utiliza una clave de fábrica.',
    mitigationAdvice: 'Migrar a tarjetas con criptografía abierta estándar AES-128 (MIFARE Plus o DESFire EV3) y cambiar siempre las claves de transporte por defecto.'
  },
  {
    id: 'mifare-darkside',
    name: 'Ataque Darkside (Sin claves por defecto)',
    subtitle: 'Fuga de paridad en respuestas NACK del chip cuando todas las claves son secretas',
    rfidBand: 'HF 13.56 MHz',
    params: {
      attackVector: 'P', // Physical
      attackComplexity: 'H', // High (requiere cálculo de paridad matemática y cientos de consultas)
      privilegesRequired: 'N', // None (no necesita ninguna clave previa)
      userInteraction: 'N', // None
      scope: 'C', // Changed
      confidentiality: 'H', // High
      integrity: 'H', // High
      availability: 'N', // None
      rfidProtocol: 'hf-mifare',
      encryptionState: 'broken',
      proximityRequired: 'touch',
      toolReadilyAvailable: true
    },
    courseModuleTarget: 'Módulo 3: Alta Frecuencia (HF 13.56 MHz) - Criptoanálisis MIFARE',
    studyPriority: 'Prioridad 2 (Muy Recomendado)',
    priorityBadgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    auditImpactSummary: 'Incluso cuando el instalador ha cambiado todas las claves por defecto por contraseñas aleatorias, el chip filtra bits de keystream en sus respuestas de error NACK.',
    mitigationAdvice: 'Crypto-1 es un algoritmo irreparable. La única solución es el reemplazo físico del hardware por chips con criptografía moderna.'
  },
  {
    id: 'nfcgate-relay',
    name: 'Ataque de Relevo (Relay Attack) con NFCGate',
    subtitle: 'Puenteo de desafíos criptográficos APDU a través de Internet móvil 4G/5G',
    rfidBand: 'NFC / Relay',
    params: {
      attackVector: 'N', // Network (via TCP tunnel a través de la red celular)
      attackComplexity: 'H', // High (requiere sincronización precisa entre dos cómplices y servidor TCP)
      privilegesRequired: 'N', // None
      userInteraction: 'R', // Required (la víctima debe estar en rango del cómplice A)
      scope: 'C', // Changed (abre el perímetro de la empresa a 20 km de distancia)
      confidentiality: 'N', // None (no se descifra la clave AES)
      integrity: 'H', // High (apertura no autorizada de accesos de alta seguridad)
      availability: 'N', // None
      rfidProtocol: 'hf-desfire',
      encryptionState: 'strong',
      proximityRequired: 'near',
      toolReadilyAvailable: true
    },
    courseModuleTarget: 'Módulo 4: Auditoría Avanzada de Hoteles, Gimnasios y Ataques Relay',
    studyPriority: 'Prioridad 2 (Muy Recomendado)',
    priorityBadgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    auditImpactSummary: 'Demuestra al cliente que incluso la tarjeta más blindada con AES-128 (MIFARE DESFire EV3) puede ser vulnerada si el sistema no valida la proximidad física real mediante medición de tiempo de vuelo.',
    mitigationAdvice: 'Habilitar la función nativa "Proximity Check" en MIFARE DESFire EV3 y configurar lectores con límite estricto de Frame Waiting Time (FWT).'
  },
  {
    id: 'uhf-retail-sniffing',
    name: 'Lectura Masiva no Autorizada de Etiquetas UHF',
    subtitle: 'Interrogación pasiva de memoria EPC y TID a varios metros de distancia',
    rfidBand: 'UHF 868 MHz',
    params: {
      attackVector: 'A', // Adjacent (a 5-10 metros en el exterior)
      attackComplexity: 'L', // Low
      privilegesRequired: 'N', // None
      userInteraction: 'N', // None
      scope: 'U', // Unchanged (no altera otros sistemas)
      confidentiality: 'L', // Low (revela identificadores de productos y ropa del peatón)
      integrity: 'N', // None
      availability: 'N', // None
      rfidProtocol: 'uhf-epc',
      encryptionState: 'none',
      proximityRequired: 'long',
      toolReadilyAvailable: false
    },
    courseModuleTarget: 'Módulo 5: Red Team Físico y Metodología de Auditoría',
    studyPriority: 'Prioridad 3 (Avanzado)',
    priorityBadgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    auditImpactSummary: 'Fuga de privacidad personal y espionaje de inventario comercial. Un atacante con una antena direccional puede escanear productos y activos dentro de un vehículo o almacén.',
    mitigationAdvice: 'Utilizar chips EPC Gen2v2 con comando KILL o modo UNTRACEABLE para desactivar la lectura a larga distancia al salir de la tienda.'
  },
  {
    id: 'desfire-secure',
    name: 'MIFARE DESFire EV3 con AES-128 & Proximity Check',
    subtitle: 'Arquitectura defensiva recomendada con autenticación mutua de 3 pasos',
    rfidBand: 'HF 13.56 MHz',
    params: {
      attackVector: 'P',
      attackComplexity: 'H',
      privilegesRequired: 'H',
      userInteraction: 'R',
      scope: 'U',
      confidentiality: 'N',
      integrity: 'N',
      availability: 'N',
      rfidProtocol: 'hf-desfire',
      encryptionState: 'strong',
      proximityRequired: 'touch',
      toolReadilyAvailable: false
    },
    courseModuleTarget: 'Módulo 6: Defensa Criptográfica, Hardening y Tecnologías Modernas',
    studyPriority: 'Inviable / Referencia Segura',
    priorityBadgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    auditImpactSummary: 'No se conocen ataques públicos matemáticos ni prácticos. Representa el estándar de oro actual para controles de acceso seguros.',
    mitigationAdvice: 'Mantener firmware de lectores actualizado y auditar que las claves AES estén diversificadas por cada tarjeta mediante KDF seguro.'
  }
];

export const RiskScoringCalculator: React.FC = () => {
  const [params, setParams] = useState<CVSSParameters>(PRESET_ATTACKS[0].params);
  const [copiedVector, setCopiedVector] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);
  const [activePresetId, setActivePresetId] = useState<string>(PRESET_ATTACKS[0].id);

  // Precise CVSS v3.1 calculation
  const cvssCalculation = useMemo(() => {
    // Metric numerical weights according to FIRST CVSS v3.1 Specification
    const avWeights: Record<string, number> = { N: 0.85, A: 0.62, P: 0.20 };
    const acWeights: Record<string, number> = { L: 0.77, H: 0.44 };
    const prWeightsUnchanged: Record<string, number> = { N: 0.85, L: 0.62, H: 0.27 };
    const prWeightsChanged: Record<string, number> = { N: 0.85, L: 0.68, H: 0.50 };
    const uiWeights: Record<string, number> = { N: 0.85, R: 0.62 };
    const impactWeights: Record<string, number> = { N: 0.0, L: 0.22, H: 0.56 };

    const av = avWeights[params.attackVector] ?? 0.20;
    const ac = acWeights[params.attackComplexity] ?? 0.77;
    const pr = params.scope === 'U' 
      ? (prWeightsUnchanged[params.privilegesRequired] ?? 0.85)
      : (prWeightsChanged[params.privilegesRequired] ?? 0.85);
    const ui = uiWeights[params.userInteraction] ?? 0.85;

    const conf = impactWeights[params.confidentiality] ?? 0;
    const integ = impactWeights[params.integrity] ?? 0;
    const avail = impactWeights[params.availability] ?? 0;

    // Impact Sub-Score (ISS)
    const iss = 1 - (1 - conf) * (1 - integ) * (1 - avail);

    let impact = 0;
    if (params.scope === 'U') {
      impact = 6.42 * iss;
    } else {
      impact = 7.52 * (iss - 0.029) - 3.25 * Math.pow(iss - 0.02, 15);
    }

    const exploitability = 8.22 * av * ac * pr * ui;

    let baseScore = 0;
    if (impact <= 0) {
      baseScore = 0;
    } else {
      if (params.scope === 'U') {
        baseScore = Math.min(impact + exploitability, 10.0);
      } else {
        baseScore = Math.min(1.08 * (impact + exploitability), 10.0);
      }
      // Standard CVSS ceiling function to 1 decimal place
      baseScore = Math.ceil(baseScore * 10) / 10;
    }

    // Determine severity rating
    let severity: 'Informativo' | 'Bajo' | 'Medio' | 'Alto' | 'Crítico' = 'Informativo';
    let severityColor = 'text-slate-400 bg-slate-800 border-slate-700';

    if (baseScore === 0.0) {
      severity = 'Informativo';
      severityColor = 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30';
    } else if (baseScore < 4.0) {
      severity = 'Bajo';
      severityColor = 'text-cyan-400 bg-cyan-950/40 border-cyan-500/30';
    } else if (baseScore < 7.0) {
      severity = 'Medio';
      severityColor = 'text-amber-400 bg-amber-950/40 border-amber-500/30';
    } else if (baseScore < 9.0) {
      severity = 'Alto';
      severityColor = 'text-orange-400 bg-orange-950/40 border-orange-500/30';
    } else {
      severity = 'Crítico';
      severityColor = 'text-rose-400 bg-rose-950/40 border-rose-500/30';
    }

    // CVSS v3.1 Vector String
    const vectorString = `CVSS:3.1/AV:${params.attackVector}/AC:${params.attackComplexity}/PR:${params.privilegesRequired}/UI:${params.userInteraction}/S:${params.scope}/C:${params.confidentiality}/I:${params.integrity}/A:${params.availability}`;

    // RFID domain-specific study priority logic
    let studyRecommendation = '';
    let targetModule = '';

    if (params.encryptionState === 'none' && params.scope === 'C') {
      studyRecommendation = '¡Estudia este ataque en primer lugar! La falta de cifrado en tarjetas LF (HID/EM4100) y su impacto de alcance cambiado (abrir puertas físicas) lo convierten en la prueba más solicitada en auditorías de seguridad física.';
      targetModule = 'Módulo 2: Baja Frecuencia (LF 125 kHz) - HID & EM4100';
    } else if (params.encryptionState === 'broken') {
      studyRecommendation = 'Prioridad Alta: El ataque a MIFARE Classic enseña los fundamentos reales del criptoanálisis (fuga de estados y PRNG débil) sin requerir matemáticas abstractas inalcanzables.';
      targetModule = 'Módulo 3: Alta Frecuencia (HF 13.56 MHz) - Criptoanálisis MIFARE';
    } else if (params.attackVector === 'N' || params.proximityRequired === 'near') {
      studyRecommendation = 'Prioridad Avanzada: El ataque Relay enseña a los alumnos por qué la criptografía AES más robusta puede ser esquivada si el sistema no implementa verificación de proximidad física (ToF).';
      targetModule = 'Módulo 4: Auditoría Avanzada de Hoteles y Ataques Relay';
    } else if (baseScore === 0) {
      studyRecommendation = 'Este chip representa el estado del arte defensivo. Estúdialo como caso de estudio de remediación y hardening para los clientes auditados.';
      targetModule = 'Módulo 6: Defensa Criptográfica, Hardening y Tecnologías Modernas';
    } else {
      studyRecommendation = 'Ataque de prioridad media. Útil para auditorías especializadas de logística, retail o seguimiento de activos.';
      targetModule = 'Módulo 5: Red Team Físico y Metodología de Auditoría';
    }

    return {
      baseScore,
      severity,
      severityColor,
      vectorString,
      impact: Math.round(impact * 10) / 10,
      exploitability: Math.round(exploitability * 10) / 10,
      studyRecommendation,
      targetModule
    };
  }, [params]);

  const handleApplyPreset = (preset: PresetAttackVulnerability) => {
    setActivePresetId(preset.id);
    setParams(preset.params);
  };

  const handleCopyVector = () => {
    navigator.clipboard.writeText(cvssCalculation.vectorString);
    setCopiedVector(true);
    setTimeout(() => setCopiedVector(false), 2000);
  };

  const handleCopyReportFinding = () => {
    const finding = `[HALLAZGO DE AUDITORÍA FÍSICA]
Vulnerabilidad: ${PRESET_ATTACKS.find(p => p.id === activePresetId)?.name || 'Vulnerabilidad RFID/NFC'}
Puntuación CVSS v3.1: ${cvssCalculation.baseScore.toFixed(1)} (${cvssCalculation.severity})
Vector CVSS: ${cvssCalculation.vectorString}
Protocolo RF: ${params.rfidProtocol.toUpperCase()} | Cifrado: ${params.encryptionState.toUpperCase()}

DESCRIPCIÓN DEL IMPACTO:
${PRESET_ATTACKS.find(p => p.id === activePresetId)?.auditImpactSummary || 'La credencial evaluada presenta debilidades en la autenticación que comprometen el control de acceso.'}

RECOMENDACIÓN DE REMEDIACIÓN:
${PRESET_ATTACKS.find(p => p.id === activePresetId)?.mitigationAdvice || 'Migrar a credenciales con autenticación mutua AES-128 (MIFARE DESFire EV3) y protocolo OSDP v2.'}
`;
    navigator.clipboard.writeText(finding);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-orange-950/40 to-slate-900 border border-orange-500/30 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="max-w-4xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold">
            <Scale className="w-3.5 h-3.5 animate-pulse" /> Metodología de Evaluación de Riesgo Físico
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Calculadora de Riesgo CVSS para Vulnerabilidades RFID & NFC
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Aprende a clasificar y priorizar ataques con la métrica estándar internacional <strong>CVSS v3.1 (Common Vulnerability Scoring System)</strong> adaptada a la seguridad física. Evalúa cómo el alcance cambiado (puertas que se abren), la ausencia de cifrado y la distancia de lectura definen la gravedad real del hallazgo en un informe de pentesting profesional.
          </p>
        </div>

        {/* Quick Attack Preset Selector */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <div className="text-xs font-mono text-slate-400 mb-3 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" /> Carga rápida de escenarios emblemáticos del curso:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {PRESET_ATTACKS.map((p) => {
              const isSelected = activePresetId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleApplyPreset(p)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-slate-800 border-orange-500 ring-1 ring-orange-500/40 shadow-lg'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-white line-clamp-1">{p.name}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${p.priorityBadgeColor}`}>
                      {p.rfidBand}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{p.subtitle}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Metrics Builder + Live Score Output */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Metrics Configuration Form */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Gauge className="w-4 h-4 text-cyan-400" /> Métricas Base CVSS v3.1 & Contexto RFID
            </h3>
            <span className="text-xs font-mono text-slate-500">
              Ajusta los parámetros para recalcular
            </span>
          </div>

          {/* Section 1: Exploitability Metrics */}
          <div className="space-y-4">
            <span className="text-xs font-bold text-cyan-400 uppercase font-mono block tracking-wider">
              1. Métricas de Explotabilidad (Facilidad del Ataque)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Attack Vector (AV) */}
              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Vector de Ataque (AV)</span>
                  <span className="font-mono text-cyan-400 text-[11px]">AV:{params.attackVector}</span>
                </div>
                <p className="text-[11px] text-slate-400">¿Dónde debe estar el atacante para ejecutar el vector?</p>
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  {[
                    { id: 'P', label: 'Físico (P)', desc: 'Contacto 0-5 cm' },
                    { id: 'A', label: 'Adyacente (A)', desc: 'Radio sniffer 1-10m' },
                    { id: 'N', label: 'Red (N)', desc: 'Túnel 4G / Relay' }
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      onClick={() => setParams(prev => ({ ...prev, attackVector: btn.id as any }))}
                      className={`p-2 rounded-xl text-xs font-semibold text-center transition-all ${
                        params.attackVector === btn.id
                          ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                      title={btn.desc}
                    >
                      <div>{btn.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Attack Complexity (AC) */}
              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Complejidad del Ataque (AC)</span>
                  <span className="font-mono text-cyan-400 text-[11px]">AC:{params.attackComplexity}</span>
                </div>
                <p className="text-[11px] text-slate-400">¿Requiere cálculos matemáticos complejos o timing?</p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {[
                    { id: 'L', label: 'Baja (L)', desc: 'Replay o clonado directo sin cifrado' },
                    { id: 'H', label: 'Alta (H)', desc: 'Darkside / timing correlation' }
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      onClick={() => setParams(prev => ({ ...prev, attackComplexity: btn.id as any }))}
                      className={`p-2 rounded-xl text-xs font-semibold text-center transition-all ${
                        params.attackComplexity === btn.id
                          ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                      title={btn.desc}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Privileges Required (PR) */}
              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Privilegios Previos (PR)</span>
                  <span className="font-mono text-cyan-400 text-[11px]">PR:{params.privilegesRequired}</span>
                </div>
                <p className="text-[11px] text-slate-400">¿Requiere conocer alguna clave o tarjeta previa?</p>
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  {[
                    { id: 'N', label: 'Ninguno (N)', desc: 'Sin claves previas' },
                    { id: 'L', label: 'Bajo (L)', desc: '1 clave por defecto' },
                    { id: 'H', label: 'Alto (H)', desc: 'Claves maestras' }
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      onClick={() => setParams(prev => ({ ...prev, privilegesRequired: btn.id as any }))}
                      className={`p-2 rounded-xl text-xs font-semibold text-center transition-all ${
                        params.privilegesRequired === btn.id
                          ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                      title={btn.desc}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* User Interaction (UI) */}
              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Interacción del Usuario (UI)</span>
                  <span className="font-mono text-cyan-400 text-[11px]">UI:{params.userInteraction}</span>
                </div>
                <p className="text-[11px] text-slate-400">¿El empleado debe acercar su tarjeta o abrir la puerta?</p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {[
                    { id: 'N', label: 'Ninguna (N)', desc: 'Respuesta pasiva autónoma' },
                    { id: 'R', label: 'Requerida (R)', desc: 'La víctima debe usar la tarjeta' }
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      onClick={() => setParams(prev => ({ ...prev, userInteraction: btn.id as any }))}
                      className={`p-2 rounded-xl text-xs font-semibold text-center transition-all ${
                        params.userInteraction === btn.id
                          ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                      title={btn.desc}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Scope & Impact Metrics */}
          <div className="space-y-4 pt-2">
            <span className="text-xs font-bold text-rose-400 uppercase font-mono block tracking-wider">
              2. Alcance & Métricas de Impacto (Daño al Edificio o Sistema)
            </span>

            {/* Scope (S) */}
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-2">
                  <span>Alcance Modificado (Scope - S)</span>
                  <span className="text-[10px] text-amber-400 font-mono font-normal">
                    (¡Crítico en seguridad física!)
                  </span>
                </span>
                <span className="font-mono text-rose-400 text-[11px]">S:{params.scope}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                En RFID, si clonar el plástico permite abrir una puerta física y acceder a los servidores de la empresa, el alcance cambia de la credencial al edificio (Scope Changed).
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {[
                  { id: 'U', label: 'Sin Cambios (U - Unchanged)', desc: 'Solo afecta a la tarjeta de plástico' },
                  { id: 'C', label: 'Modificado (C - Changed)', desc: 'Abre el perímetro físico del edificio' }
                ].map((btn) => (
                  <button
                    key={btn.id}
                    onClick={() => setParams(prev => ({ ...prev, scope: btn.id as any }))}
                    className={`p-2.5 rounded-xl text-xs font-semibold text-center transition-all ${
                      params.scope === btn.id
                        ? 'bg-rose-600 text-white font-bold shadow-md'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            {/* CIA Triad */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Confidentiality (C) */}
              <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl space-y-2">
                <span className="text-xs font-bold text-white block">Confidencialidad (C)</span>
                <div className="grid grid-cols-3 gap-1">
                  {['N', 'L', 'H'].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setParams(prev => ({ ...prev, confidentiality: lvl as any }))}
                      className={`p-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                        params.confidentiality === lvl
                          ? 'bg-rose-500 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-slate-500 block">
                  {params.confidentiality === 'N' ? 'Sin fuga' : params.confidentiality === 'L' ? 'Fuga de UID' : 'Fuga de claves Crypto-1'}
                </span>
              </div>

              {/* Integrity (I) */}
              <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl space-y-2">
                <span className="text-xs font-bold text-white block">Integridad (I)</span>
                <div className="grid grid-cols-3 gap-1">
                  {['N', 'L', 'H'].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setParams(prev => ({ ...prev, integrity: lvl as any }))}
                      className={`p-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                        params.integrity === lvl
                          ? 'bg-rose-500 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-slate-500 block">
                  {params.integrity === 'N' ? 'Sin alteración' : params.integrity === 'L' ? 'Edición de saldo' : 'Clonado de acceso maestro'}
                </span>
              </div>

              {/* Availability (A) */}
              <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl space-y-2">
                <span className="text-xs font-bold text-white block">Disponibilidad (A)</span>
                <div className="grid grid-cols-3 gap-1">
                  {['N', 'L', 'H'].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setParams(prev => ({ ...prev, availability: lvl as any }))}
                      className={`p-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                        params.availability === lvl
                          ? 'bg-rose-500 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-slate-500 block">
                  {params.availability === 'N' ? 'Sin DoS' : params.availability === 'L' ? 'Bloqueo 1 tarjeta' : 'Jammer RF en tornos'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Domain RFID specifics */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold text-amber-400 uppercase font-mono block tracking-wider">
              3. Parámetros Específicos del Chip RFID Evaluado
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                <span className="text-slate-400 text-[11px] block">Estado del Cifrado en el Aire:</span>
                <select
                  value={params.encryptionState}
                  onChange={(e) => setParams(prev => ({ ...prev, encryptionState: e.target.value as any }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-xs font-mono focus:border-cyan-500"
                >
                  <option value="none">Sin Cifrado (Texto plano Wiegand / EM4100)</option>
                  <option value="broken">Cifrado Propietario Roto (Crypto-1)</option>
                  <option value="weak">Cifrado Débil / Algoritmo Obsoleto (DES simple)</option>
                  <option value="strong">Cifrado Seguro Estándar (AES-128 / DESFire EV3)</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                <span className="text-slate-400 text-[11px] block">Distancia de Lectura / Proximidad:</span>
                <select
                  value={params.proximityRequired}
                  onChange={(e) => setParams(prev => ({ ...prev, proximityRequired: e.target.value as any }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-xs font-mono focus:border-cyan-500"
                >
                  <option value="touch">Contacto Físico Directo (0 - 2 cm)</option>
                  <option value="near">Campo Cercano Estándar (2 - 10 cm)</option>
                  <option value="medium">Sniffer de Rango Medio (10 - 50 cm)</option>
                  <option value="long">Largo Alcance (1 - 10 metros UHF / Relay 4G)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1/3): Calculated CVSS Score, Priority & Report Generator */}
        <div className="space-y-6">
          {/* Main Score Dial Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-slate-400 block">
              Puntuación Base CVSS v3.1
            </span>

            {/* Score Ring Display */}
            <div className="relative inline-flex items-center justify-center">
              <div className={`w-36 h-36 rounded-full border-4 flex flex-col items-center justify-center shadow-xl transition-all ${cvssCalculation.severityColor}`}>
                <span className="text-4xl font-extrabold font-mono tracking-tight text-white">
                  {cvssCalculation.baseScore.toFixed(1)}
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider font-mono mt-1">
                  {cvssCalculation.severity}
                </span>
              </div>
            </div>

            {/* Sub-scores breakdown */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs font-mono">
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">IMPACTO:</span>
                <span className="text-white font-bold">{cvssCalculation.impact}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">EXPLOTABILIDAD:</span>
                <span className="text-white font-bold">{cvssCalculation.exploitability}</span>
              </div>
            </div>

            {/* Vector String with Copy */}
            <div className="space-y-1.5 text-left pt-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Vector Oficial CVSS:</span>
                <button
                  onClick={handleCopyVector}
                  className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
                >
                  {copiedVector ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedVector ? '¡Copiado!' : 'Copiar'}</span>
                </button>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-cyan-300 font-mono text-[11px] break-all select-all">
                {cvssCalculation.vectorString}
              </div>
            </div>
          </div>

          {/* Student Study Prioritization Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-orange-400 uppercase font-mono">
              <BookOpen className="w-4 h-4" /> Priorización de Estudio para el Alumno
            </div>

            <div className="p-3.5 rounded-xl bg-orange-950/20 border border-orange-500/30 text-orange-200 text-xs space-y-1 leading-relaxed">
              <span className="font-bold text-orange-400 block">¿Por qué estudiar esta amenaza?</span>
              <p className="text-[11px]">{cvssCalculation.studyRecommendation}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
              <span className="text-slate-400 text-[11px] font-mono block">Módulo del Curso Recomendado:</span>
              <div className="font-semibold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{cvssCalculation.targetModule}</span>
              </div>
            </div>

            {/* Pentesting Report Finding Copy Button */}
            <button
              onClick={handleCopyReportFinding}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
            >
              {copiedReport ? <Check className="w-4 h-4 text-emerald-200" /> : <FileText className="w-4 h-4" />}
              <span>{copiedReport ? '¡Ficha de Informe Copiada!' : 'Copiar Hallazgo para Informe de Pentesting'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
