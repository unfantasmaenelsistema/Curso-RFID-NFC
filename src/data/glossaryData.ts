export interface GlossaryTerm {
  id: string;
  term: string;
  acronym?: string;
  category: 'Protocolos & Tramas' | 'Criptografía & Seguridad' | 'Familias de Tarjetas' | 'Hardware & Herramientas';
  shortDefinition: string;
  detailedExplanation: string;
  cybersecurityImpact: string;
  realWorldExample?: {
    label: string;
    value: string;
    explanation: string;
  };
  relatedTerms: string[];
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    id: 'uid',
    term: 'UID',
    acronym: 'Unique Identifier (Identificador Único)',
    category: 'Protocolos & Tramas',
    shortDefinition: 'Número de serie grabado por el fabricante en cada chip RFID/NFC para identificarlo durante la fase de anticolisión.',
    detailedExplanation: 'El UID se transmite en las primeras fases del saludo de radiofrecuencia (ISO 14443-A). Puede tener longitudes de 4 bytes (UID Simple o "Single Size"), 7 bytes ("Double Size", habitual en NTAG y Mifare Ultralight) o 10 bytes ("Triple Size"). En los chips estándar comerciales, el fabricante bloquea su escritura permanentemente en el Bloque 0.',
    cybersecurityImpact: 'CRÍTICO: El UID NO es una contraseña ni una credencial segura. Muchos sistemas vulnerables solo leen el UID y abren la puerta. Como las "Magic Cards" permiten cambiar el UID a voluntad, cualquier atacante puede clonar el acceso en segundos.',
    realWorldExample: {
      label: 'UID de 4 bytes típico (Hexadecimal)',
      value: 'A3 B4 2C 19',
      explanation: 'Transmitido en cascada de anticolisión. Si el lector solo valida estos 4 bytes, el sistema es vulnerable a clonación directa.'
    },
    relatedTerms: ['SAK', 'ATQA', 'Magic Card Gen2', 'Anticolisión']
  },
  {
    id: 'atqa-atr',
    term: 'ATR / ATQA',
    acronym: 'Answer To Reset / Answer To Request type A',
    category: 'Protocolos & Tramas',
    shortDefinition: 'La primera respuesta que devuelve una tarjeta inteligente cuando el lector le suministra energía y le pide que se identifique.',
    detailedExplanation: 'En tarjetas de contacto y modo ISO 7816 se llama ATR (Answer to Reset), transmitiendo capacidades y parámetros de comunicación. En RFID sin contacto (ISO 14443-3A), se conoce como ATQA (un código de 2 bytes devuelto tras el comando REQA o WUPA) que indica la longitud del UID y el método de anticolisión.',
    cybersecurityImpact: 'Permite al pentester realizar "fingerprinting" pasivo: identificar inmediatamente la marca, modelo de microcontrolador o si la tarjeta está respondiendo con parámetros anómalos propios de un emulador (Flipper Zero o Proxmark3).',
    realWorldExample: {
      label: 'Respuesta ATQA de MIFARE Classic 1K',
      value: '00 04 (o 00 02)',
      explanation: 'Indica al lector que el chip usa UID de 4 bytes y modulación estándar de 106 kbps.'
    },
    relatedTerms: ['SAK', 'UID', 'ISO 14443', 'Anticolisión']
  },
  {
    id: 'sak',
    term: 'SAK',
    acronym: 'Select Acknowledge',
    category: 'Protocolos & Tramas',
    shortDefinition: 'Byte de confirmación que la tarjeta envía al lector una vez completado el proceso de selección y anticolisión del UID.',
    detailedExplanation: 'El byte SAK define las capacidades del chip seleccionado: si cumple únicamente la capa física de ISO 14443-3 (como MIFARE Classic con su protocolo propietario) o si soporta ISO 14443-4 (capa de transporte T=CL con comandos APDU de alto nivel, como DESFire, pasaportes biométricos o tarjetas bancarias EMV).',
    cybersecurityImpact: 'Fundamental para saber qué herramientas usar: un SAK 0x08 indica MIFARE Classic 1K (vulnerable a Crypto-1), un SAK 0x18 indica MIFARE Classic 4K, y un SAK 0x20 o 0x28 indica soporte ISO 14443-4 (DESFire / SmartMX / JavaCard).',
    realWorldExample: {
      label: 'Byte SAK en comando hf search',
      value: 'SAK: 08 [MIFARE Classic 1K]',
      explanation: 'Al ver 0x08, el auditor sabe de inmediato que el chip responde al protocolo Crypto-1.'
    },
    relatedTerms: ['ATQA', 'UID', 'Mifare Classic', 'DESFire']
  },
  {
    id: 'mifare-classic',
    term: 'MIFARE Classic',
    acronym: 'NXP S50 (1K) / S70 (4K)',
    category: 'Familias de Tarjetas',
    shortDefinition: 'La familia de tarjetas sin contacto de 13.56 MHz más desplegada en la historia para hoteles, campus y transportes.',
    detailedExplanation: 'Lanzada por Philips/NXP en 1994. Divide su memoria en sectores (16 en la versión 1K) con 4 bloques de 16 bytes cada uno. Cada sector está custodiado por un "Sector Trailer" que almacena dos claves de 48 bits (Key A y Key B) y los bits de condiciones de acceso (Access Bits). Emplea un algoritmo de cifrado en el aire llamado Crypto-1.',
    cybersecurityImpact: 'OBSOLETO Y ROTO: El algoritmo Crypto-1 fue revertido en 2008. Es vulnerable a ataques Darkside, Nested y Hardnested, permitiendo extraer todas las claves en segundos o minutos mediante herramientas como Proxmark3, mfoc o mfcuk.',
    realWorldExample: {
      label: 'Estructura Sector Trailer',
      value: 'A0A1A2A3A4A5 [Key A] + FF078069 [Access Bits] + FFFFFFFFFFFF [Key B]',
      explanation: 'Si una de las claves es por defecto o se crackea con Nested, todo el sector queda expuesto.'
    },
    relatedTerms: ['Crypto-1', 'DESFire', 'Darkside Attack', 'Nested Attack', 'Sector Trailer']
  },
  {
    id: 'desfire',
    term: 'MIFARE DESFire',
    acronym: 'DES / 3DES / AES Flexible Innovative Reliable Smart Card',
    category: 'Familias de Tarjetas',
    shortDefinition: 'Familia de tarjetas inteligentes sin contacto de alta seguridad basada en un microcontrolador seguro con sistema de archivos.',
    detailedExplanation: 'A diferencia de MIFARE Classic (que usa lógica cableada simple), DESFire ejecuta un verdadero sistema operativo de tarjeta con autenticación mutua criptográfica simétrica. Las versiones EV2 y EV3 utilizan cifrado AES-128 con código de autenticación de mensajes CMAC, verificación de proximidad (Proximity Check) y canales cifrados inviolables por radio.',
    cybersecurityImpact: 'ESTÁNDAR DE ORO ACTUAL: No existen vulnerabilidades de radio comercialmente explotables para clonar DESFire EV2/EV3. La única vía de vulnerabilidad es si los administradores cometen el grave error de autenticar accesos basándose únicamente en el UID en lugar de leer una aplicación AID protegida con clave AES.',
    realWorldExample: {
      label: 'Comando APDU DESFire',
      value: '90 6A 00 00 00 (GetApplicationIDs)',
      explanation: 'Consulta las aplicaciones configuradas en la tarjeta usando el formato estándar ISO 7816-4.'
    },
    relatedTerms: ['Mifare Classic', 'AES-128', 'AID', 'OSDP', 'SAM']
  },
  {
    id: 'proxmark3',
    term: 'Proxmark3',
    acronym: 'PM3 (Diseñado originalmente por Jonathan Westhues)',
    category: 'Hardware & Herramientas',
    shortDefinition: 'El dispositivo de referencia de la industria de ciberseguridad y Red Team para auditoría, sniffing, emulación y clonado de RFID/NFC.',
    detailedExplanation: 'Dispositivo de hardware libre con FPGA Xilinx, microcontrolador ARM SAM7 y dos antenas independientes (125 kHz para baja frecuencia y 13.56 MHz para alta frecuencia). Funciona mediante una consola interactiva CLI y el firmware más extendido es el fork comunitario mantenido por "Iceman".',
    cybersecurityImpact: 'Es el estándar *de facto* para peritajes y auditorías de seguridad física: permite desde sintonizar bobinas y capturar trazas raw de radio hasta crackear claves Crypto-1 de forma automatizada (`hf mf autopwn`) o clonar tarjetas HID corporativas (`lf hid clone`).',
    realWorldExample: {
      label: 'Comando insigne en consola',
      value: 'hf mf autopwn',
      explanation: 'Automatiza diccionario, ataque Darkside y ataque Nested para volcar completamente una tarjeta MIFARE Classic.'
    },
    relatedTerms: ['Iceman Firmware', 'Chameleon Ultra', 'Flipper Zero', 'T5577', 'Sniffing']
  },
  {
    id: 'crypto-1',
    term: 'Crypto-1',
    acronym: 'Algoritmo de flujo propietario de NXP (48 bits)',
    category: 'Criptografía & Seguridad',
    shortDefinition: 'El algoritmo criptográfico cerrado utilizado históricamente en tarjetas MIFARE Classic para autenticar y cifrar los datos por radio.',
    detailedExplanation: 'Consta de un registro de desplazamiento con retroalimentación lineal (LFSR) de 48 bits y una función de filtro no lineal de 20 bits. En 2008, investigadores de Radboud University y Karsten Nohl hicieron ingeniería inversa del chip con microscopio y publicaron sus debilidades matemáticas críticas.',
    cybersecurityImpact: 'Su generador de números pseudoaleatorios (PRNG) es extremadamente predecible y la función de paridad filtra información criptográfica en cada error de autenticación. Permite a cualquier atacante recuperar la clave secreta sin conocerla previamente.',
    realWorldExample: {
      label: 'Tamaño de clave',
      value: '48 bits (6 bytes, ej: FFFFFFFFFFFF)',
      explanation: 'Completamente insuficiente contra ataques algebraicos y tablas precomputadas actuales.'
    },
    relatedTerms: ['Mifare Classic', 'Darkside Attack', 'Nested Attack', 'PRNG']
  },
  {
    id: 'wiegand',
    term: 'Wiegand (Protocolo & Formato)',
    acronym: 'Efecto físico descubierto por John R. Wiegand',
    category: 'Protocolos & Tramas',
    shortDefinition: 'El estándar de cableado físico de 3 hilos y formato de datos más extendido para conectar lectores RFID de pared con la centralita.',
    detailedExplanation: 'Físicamente utiliza dos líneas de datos: DATA0 (pulsos de cero voltios representan bits 0) y DATA1 (pulsos representan bits 1). En formato lógico, el más popular es el Wiegand 26-bit (H10301): 1 bit de paridad inicial + 8 bits de Facility Code (edificio) + 16 bits de Card Number (empleado) + 1 bit de paridad final.',
    cybersecurityImpact: 'TOTALMENTE INSEGURO: Los cables Wiegand detrás del lector de pared transmiten el código en texto plano sin cifrado ni autenticación. Un pentester con un microdispositivo espía (como ESPKey) conectado a los cables DATA0/DATA1 puede registrar todas las credenciales y abrir la puerta enviando pulsos.',
    realWorldExample: {
      label: 'Trama Wiegand 26 bits',
      value: '[P_par] [Facility: 104] [Card: 24510] [P_impar]',
      explanation: 'Sin cifrado en el aire ni en el cable. Fácilmente reproducible o falsificable.'
    },
    relatedTerms: ['OSDP', 'HID Prox', 'Facility Code', 'T5577']
  },
  {
    id: 't5577',
    term: 'Atmel / Microchip T5577',
    acronym: 'ATA5577 (Chip LF regrabable)',
    category: 'Familias de Tarjetas',
    shortDefinition: 'El chip transpondedor regrabable de 125 kHz más versátil del mercado, capaz de emular casi cualquier estándar de baja frecuencia.',
    detailedExplanation: 'Dispone de 330 bits de memoria EEPROM divididos en bloques de 32 bits. Su Bloque 0 es un registro de configuración donde se programan la modulación (Manchester, Biphase, PSK, FSK), el divisor de frecuencia de reloj y los bits de parada, transformándose en una réplica exacta de una EM4100, HID Prox II, Indala, AWID o Nexwatch.',
    cybersecurityImpact: 'LA TARJETA COMODÍN DE RED TEAM: Es el medio físico donde los pentesters graban las credenciales capturadas para abrir tornos o barreras de garaje. Puede protegerse con contraseña de 32 bits para evitar que otros sobreescriban el clon.',
    realWorldExample: {
      label: 'Comando de clonación a T5577',
      value: 'lf hid clone --fc 100 --cn 1234',
      explanation: 'Configura el Bloque 0 del T5577 en modulación FSK y graba la credencial HID especificada.'
    },
    relatedTerms: ['HID Prox', 'EM4100', 'Wiegand', 'Proxmark3']
  },
  {
    id: 'magic-cards',
    term: 'Magic Cards (Gen1a / Gen2 CUID)',
    acronym: 'Tarjetas chinas con Bloque 0 de UID modificable',
    category: 'Hardware & Herramientas',
    shortDefinition: 'Tarjetas de práctica especiales fabricadas en Asia que rompen la especificación estándar permitiendo reescribir su UID tantas veces como se desee.',
    detailedExplanation: 'Existen varias generaciones: **Gen1a**: Se reescriben usando comandos "backdoor" propietarios chinos (`0x40`/`0x43`) mediante Proxmark3; los lectores modernos las detectan enviando estos comandos. **Gen2 (CUID)**: Se reescriben como bloques normales de memoria sin comandos backdoor, lo que permite grabarlas directamente desde un teléfono móvil con la app Mifare Classic Tool (MCT). **Gen4**: Chips de máxima compatibilidad con selección de protocolo.',
    cybersecurityImpact: 'Permiten la clonación física 1:1 de tarjetas de acceso. Sin tarjetas mágicas, el atacante tendría que emular el UID con un microcontrolador en lugar de llevar una tarjeta de plástico indistinguible.',
    realWorldExample: {
      label: 'Detección de Magic Card Gen1a',
      value: 'pm3 --> hf mf cdetect -> [!] Magic backdoor answers!',
      explanation: 'Si el lector de pared envía este comando de chequeo, detecta que es un clon y no abre la puerta.'
    },
    relatedTerms: ['UID', 'Mifare Classic', 'Proxmark3', 'T5577']
  },
  {
    id: 'osdp',
    term: 'OSDP',
    acronym: 'Open Supervised Device Protocol (SIA v2.2)',
    category: 'Criptografía & Seguridad',
    shortDefinition: 'El protocolo moderno y seguro basado en RS-485 para comunicar los lectores de tarjetas con la controladora central.',
    detailedExplanation: 'Sustituto oficial del anticuado Wiegand. Admite bidireccionalidad, supervisión constante del cableado (alerta de sabotaje si se corta el lector) y el modo **Secure Channel** que cifra todas las tramas con AES-128 simétrico.',
    cybersecurityImpact: 'MEDIDA DE DEFENSA OBLIGATORIA: Impide por completo los ataques de escucha pasiva en cableado (tapping) o inyección de pulsos mediante dispositivos como ESPKey o Raspberry Pi Pico.',
    realWorldExample: {
      label: 'Modo OSDP Secure Channel',
      value: 'OSDP_SC_KEY: [128-bit AES Key]',
      explanation: 'Incluso si un intruso accede a los hilos de cobre del lector, solo interceptará tráfico cifrado indistinguible de ruido aleatorio.'
    },
    relatedTerms: ['Wiegand', 'DESFire', 'AES-128', 'Secure Element']
  },
  {
    id: 'ndef',
    term: 'NDEF',
    acronym: 'NFC Data Exchange Format',
    category: 'Protocolos & Tramas',
    shortDefinition: 'El formato ligero estandarizado por el NFC Forum para encapsular y transportar datos útiles entre dispositivos NFC.',
    detailedExplanation: 'Estructurado en registros (NDEF Records) con cabeceras que definen el tipo de carga útil (TNF - Type Name Format): enlaces web (URI), contactos (vCard), credenciales de red WiFi, o textos planos.',
    cybersecurityImpact: 'VECTOR DE INGENIERÍA SOCIAL Y ATAQUES A MÓVILES: Un atacante puede pegar una pegatina NTAG maliciosa en un poste público o mesa de cafetería con un payload NDEF que fuerce al teléfono de la víctima a conectarse a un WiFi Rogue o abrir una URL con malware.',
    realWorldExample: {
      label: 'Registro NDEF de tipo URI',
      value: 'TNF=0x01, Type="U", Payload="https://portal-cautivo-falso.com"',
      explanation: 'Disparado automáticamente por el subsistema NFC del sistema operativo móvil.'
    },
    relatedTerms: ['UID', 'ISO 14443', 'NFC Forum']
  }
];
