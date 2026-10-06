export interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: 'teoria' | 'laboratorio' | 'reto';
  difficulty: 'Principiante' | 'Intermedio' | 'Avanzado';
  summary: string;
  objectives: string[];
  keyConcepts: string[];
  toolsUsed: string[];
  practicalExercise: {
    title: string;
    description: string;
    commands?: { cmd: string; desc: string }[];
    expectedResult: string;
    safetyWarning?: string;
  };
}

export interface Module {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  durationHours: number;
  practicePercentage: number;
  color: string;
  tagFrequency: string;
  description: string;
  lessons: Lesson[];
}

export const COURSE_MODULES: Module[] = [
  {
    id: 'mod-1',
    number: 1,
    title: 'Fundamentos de Radiofrecuencia y Protocolos',
    subtitle: 'La física de las ondas, acoplamiento inductivo y espectro electromagnético',
    durationHours: 6,
    practicePercentage: 60,
    color: 'emerald',
    tagFrequency: 'LF / HF / UHF',
    description: 'Comprende cómo viaja la información por el aire sin energía en la tarjeta. Domina las diferencias entre RFID pasivo, activo y el estándar NFC.',
    lessons: [
      {
        id: 'les-1-1',
        title: 'Espectro electromagnético en control de accesos',
        duration: '1h 30m',
        type: 'teoria',
        difficulty: 'Principiante',
        summary: 'Diferenciación estricta entre LF (125-134 kHz), HF (13.56 MHz) y UHF (860-960 MHz). Cómo identificar una tarjeta a simple vista con linterna o inspección física de la antena.',
        objectives: [
          'Identificar las tres frecuencias principales de RFID y sus aplicaciones típicas.',
          'Reconocer el bobinado interno (número de vueltas de la antena) para predecir la frecuencia.',
          'Entender el principio de acoplamiento inductivo (campo cercano) vs radiación electromagnética (campo lejano).'
        ],
        keyConcepts: ['Campo cercano (Near-Field)', 'Resonancia LC', 'Acoplamiento inductivo', 'Modulación ASK/FSK/PSK'],
        toolsUsed: ['Linterna LED de alta potencia', 'RFID Detector Coils (LED stickers)', 'Multímetro'],
        practicalExercise: {
          title: 'Lab 1.1: Triage e inspección física de credenciales',
          description: 'A contraluz con una linterna o teléfono, inspecciona 4 tarjetas anónimas (gimnasio, hotel, transporte, tarjeta universitaria) para determinar si la antena tiene pocas vueltas gruesas (HF 13.56MHz) o muchas vueltas finas (LF 125kHz).',
          expectedResult: 'Clasificación inequívoca de tarjetas en LF vs HF antes de usar cualquier lector digital.'
        }
      },
      {
        id: 'les-1-2',
        title: 'Estándares y Protocolos: ISO 14443 vs ISO 15693 vs ISO 18000',
        duration: '2h 00m',
        type: 'laboratorio',
        difficulty: 'Principiante',
        summary: 'Arquitectura de tramas, handshake de radio, colisiones y cascadas de anticollision (UID de 4 bytes vs 7 bytes vs 10 bytes).',
        objectives: [
          'Comprender la diferencia entre ISO 14443 Tipo A y Tipo B.',
          'Analizar el proceso de anticolisión y obtención del UID/CSN (Card Serial Number).',
          'Entender por qué el UID por sí solo NO es una medida de seguridad criptográfica.'
        ],
        keyConcepts: ['ATQA (Answer To Request)', 'SAK (Select Acknowledge)', 'UID Cascade Levels', 'Baud rate (106 kbps)'],
        toolsUsed: ['Lector USB ACR122U', 'Smartphone Android con NFC TagInfo', 'Proxmark3 CLI'],
        practicalExercise: {
          title: 'Lab 1.2: Decodificación de trama ATQA y SAK',
          description: 'Coloca una tarjeta MIFARE o DNIe en el lector y extrae los bytes brutos de ATQA y SAK para determinar el chip exacto sin leer la memoria.',
          commands: [
            { cmd: 'hf search', desc: 'Detecta y muestra ATQA, SAK y UID de tarjetas HF' },
            { cmd: 'nfc-list', desc: 'Comando de LibNFC para listar dispositivos ISO14443A en Linux' }
          ],
          expectedResult: 'Identificación de ATQA: 00 04, SAK: 08 (indicador clásico de MIFARE Classic 1k 4-byte UID).'
        }
      },
      {
        id: 'les-1-3',
        title: 'NFC en detalle: Modos de operación y NDEF',
        duration: '2h 30m',
        type: 'laboratorio',
        difficulty: 'Principiante',
        summary: 'Cómo los smartphones interactúan con NFC: Modo Lector/Grabador, Modo Peer-to-Peer y Modo Emulación de Tarjeta (HCE). Estructura del formato NDEF.',
        objectives: [
          'Crear y analizar registros NDEF (URLs, vCards, Textos, MIME types).',
          'Identificar vectores de ataque por inyección NDEF (URI schemes maliciosos, WiFi autopairing forzado).',
          'Conocer las limitaciones de Host Card Emulation (HCE) en Android frente a chips seguros.'
        ],
        keyConcepts: ['NDEF Record Header', 'TLV (Tag Length Value)', 'HCE (Host-based Card Emulation)', 'Secure Element (SE)'],
        toolsUsed: ['NFC Tools App', 'NFC TagWriter', 'Etiquetas NTAG213/NTAG215'],
        practicalExercise: {
          title: 'Lab 1.3: Inyección NDEF y Payload Triggering',
          description: 'Programar una etiqueta NTAG con un payload NDEF URI que interactúe con el navegador del dispositivo para demostrar los riesgos de lectura involuntaria.',
          commands: [
            { cmd: 'nfc-poll', desc: 'Monitoreo de eventos NFC en tiempo real' }
          ],
          expectedResult: 'Ejecución automática de solicitud de conexión al acercar el teléfono.'
        }
      }
    ]
  },
  {
    id: 'mod-2',
    number: 2,
    title: 'Hardware de Pentesting y Laboratorio Personal',
    subtitle: 'El arsenal del analista: desde un móvil de 100€ hasta el Proxmark3 RDV4',
    durationHours: 6,
    practicePercentage: 80,
    color: 'blue',
    tagFrequency: 'Hardware & Tools',
    description: 'Aprende a montar tu laboratorio sin arruinarte. Conoce a fondo el firmware Iceman en Proxmark3, Flipper Zero, Chameleon Ultra y las famosas "Magic Cards".',
    lessons: [
      {
        id: 'les-2-1',
        title: 'El ecosistema de herramientas: Comparativa y Setup',
        duration: '2h 00m',
        type: 'laboratorio',
        difficulty: 'Principiante',
        summary: 'Instalación de entorno de trabajo en Kali Linux / macOS / Windows con WSL2. Configuración de clientes USB y permisos udev.',
        objectives: [
          'Montar un entorno de pentesting de RFID reproducible en contenedor o máquina virtual.',
          'Configurar reglas udev para Proxmark3 y lectores ACR122U.',
          'Comprender la diferencia de casos de uso entre Flipper Zero (reconocimiento sigiloso) y Proxmark3 (auditoría profunda/sniffing de señal).'
        ],
        keyConcepts: ['Firmware Iceman', 'Reglas udev', 'Baud rate serie', 'Antenas de alta vs baja inductancia'],
        toolsUsed: ['Kali Linux', 'Proxmark3 Easy / RDV4', 'Flipper Zero', 'Chameleon Ultra'],
        practicalExercise: {
          title: 'Lab 2.1: Calibración y auto-test de antenas Proxmark3',
          description: 'Ejecutar los diagnósticos de hardware para verificar el voltaje pico de la antena LF y HF antes de operar en campo.',
          commands: [
            { cmd: 'hw status', desc: 'Muestra estado del microcontrolador, reloj y firmware' },
            { cmd: 'hw tune', desc: 'Prueba de sintonización de voltajes en LF (debe superar ~20V) y HF (debe superar ~15V)' }
          ],
          expectedResult: 'Antenas sintonizadas correctamente sin desajuste por metales circundantes.'
        }
      },
      {
        id: 'les-2-2',
        title: 'Taxonomía de Tarjetas Mágicas (Magic Cards Gen1a a Gen4)',
        duration: '2h 00m',
        type: 'laboratorio',
        difficulty: 'Intermedio',
        summary: 'Por qué las tarjetas normales tienen el UID bloqueado por el fabricante y cómo las "Magic Cards" chinas permiten saltarse esta restricción.',
        objectives: [
          'Diferenciar Gen1a (Backdoor commands APDU 0x40/0x43), Gen2 (CUID direct write), Gen3 y Gen4 (Ultimate Magic Card).',
          'Detectar lectores modernos anti-clonación que envían comandos de puerta trasera para invalidar clones Gen1a.',
          'Aprender cuándo usar una tarjeta T5577 para emular cualquier estándar de 125 kHz.'
        ],
        keyConcepts: ['UID Block 0 Writable', 'Comandos Backdoor chinos', 'Lectores con filtro anti-clon Gen1', 'Chip Atmel T5577'],
        toolsUsed: ['Magic Cards Gen1a y Gen2', 'Chameleon Ultra', 'Proxmark3'],
        practicalExercise: {
          title: 'Lab 2.2: Detección del tipo de Magic Card',
          description: 'Identificar si una tarjeta blanca comprada en el mercado es Gen1a, Gen2 CUID o una tarjeta estándar de solo lectura.',
          commands: [
            { cmd: 'hf mf cdetect', desc: 'Comprueba si la tarjeta responde a puertas traseras chinas Gen1a' },
            { cmd: 'hf mf info', desc: 'Inspecciona detalles de fabricación y PRNG de la tarjeta' }
          ],
          expectedResult: 'Detección exacta del tipo de chip mágico presente en la tarjeta de prueba.'
        }
      },
      {
        id: 'les-2-3',
        title: 'Sniffing de señales RF y análisis de modulación',
        duration: '2h 00m',
        type: 'laboratorio',
        difficulty: 'Intermedio',
        summary: 'Colocar una antena espía entre el lector de pared y la tarjeta para interceptar la comunicación sin alterar el tráfico.',
        objectives: [
          'Entender cómo funciona la escucha pasiva (snoop/sniff) de campo electromagnético.',
          'Capturar un intercambio de tramas ISO14443A completo.',
          'Extraer trazas para posterior análisis forense en Wireshark.'
        ],
        keyConcepts: ['Sniffing inductivo', 'Demodulación de envolvente', 'Miller modificado vs Manchester', 'Trazas PCAP de NFC'],
        toolsUsed: ['Proxmark3 RDV4 con antena Flat', 'Wireshark', 'HydraNFC'],
        practicalExercise: {
          title: 'Lab 2.3: Sniffing en vivo de autenticación',
          description: 'Colocar el Proxmark3 sobre un lector de pared y pasar una tarjeta legítima para capturar los nonces criptográficos.',
          commands: [
            { cmd: 'hf mf sniff', desc: 'Inicia el modo snoop para MIFARE Classic' },
            { cmd: 'hf mf list', desc: 'Muestra la conversación interceptada y calcula nonces' }
          ],
          expectedResult: 'Captura de tramas Auth con lector (Reader Nonce Nr y Card Nonce Nc).'
        }
      }
    ]
  },
  {
    id: 'mod-3',
    number: 3,
    title: 'Baja Frecuencia (LF 125 kHz): Auditoría y Clonación',
    subtitle: 'El estándar de los porteros automáticos, parkings y oficinas heredadas',
    durationHours: 7,
    practicePercentage: 85,
    color: 'amber',
    tagFrequency: 'LF 125 kHz',
    description: 'La gran mayoría de sistemas de 125 kHz carecen de cualquier tipo de cifrado. Aprende a auditar EM4100, HID Prox II, Indala, Keri y AWID.',
    lessons: [
      {
        id: 'les-3-1',
        title: 'EM4100 / EM4200: El protocolo de ID abierta',
        duration: '2h 00m',
        type: 'laboratorio',
        difficulty: 'Principiante',
        summary: 'Estructura de 64 bits con paridades horizontal y vertical. Por qué cualquier dispositivo puede leer y clonar un llavero azul de garaje.',
        objectives: [
          'Comprender la modulación Manchester a 125 kHz.',
          'Decodificar manualmente los 64 bits de un tag EM4100.',
          'Clonar un llavero EM4100 en un chip regrabable T5577.'
        ],
        keyConcepts: ['Modulación Manchester', 'Bits de sincronismo (9 unos)', 'Paridad par', 'Chip T5577 en modo emulación'],
        toolsUsed: ['Proxmark3', 'Flipper Zero', 'Llaveros regrabables T5577'],
        practicalExercise: {
          title: 'Lab 3.1: Clonación de llavero de garaje EM4100',
          description: 'Leer un identificador de 5 bytes y grabarlo en un llavero T5577 virgen para verificar apertura.',
          commands: [
            { cmd: 'lf search', desc: 'Escaneo automático de protocolos LF' },
            { cmd: 'lf em 410xdump', desc: 'Extrae el identificador crudo' },
            { cmd: 'lf em 410x clone --id 0102030405', desc: 'Escribe el ID en la tarjeta T5577' }
          ],
          expectedResult: 'El T5577 responde de forma idéntica al llavero original ante cualquier lector.'
        }
      },
      {
        id: 'les-3-2',
        title: 'HID Prox II (26-bit Wiegand H10301) y variaciones corporativas',
        duration: '2h 30m',
        type: 'laboratorio',
        difficulty: 'Intermedio',
        summary: 'El estándar de oro en edificios corporativos de los últimos 25 años. Facility Codes, Card Numbers y formato Wiegand.',
        objectives: [
          'Entender la estructura del formato estándar Wiegand de 26 bits (1 bit paridad + 8 bits Facility Code + 16 bits Card ID + 1 bit paridad).',
          'Aprender a emular una tarjeta HID al vuelo sin tarjeta física usando el Proxmark3.',
          'Realizar ataques de fuerza bruta de Facility Code en controles de acceso vulnerables.'
        ],
        keyConcepts: ['Protocolo Wiegand', 'Facility Code (FC)', 'Card Number (CN)', 'Emulación activa en bobina'],
        toolsUsed: ['Proxmark3', 'Flipper Zero', 'Controladora Wiegand de pruebas'],
        practicalExercise: {
          title: 'Lab 3.2: Replay Attack y emulación Wiegand 26',
          description: 'Capturar una credencial corporativa HID Prox y emularla directamente desde la memoria interna del equipo.',
          commands: [
            { cmd: 'lf hid read', desc: 'Lee tarjetas HID 125 kHz y decodifica el formato Wiegand' },
            { cmd: 'lf hid sim --fc 104 --cn 24510', desc: 'Emula en tiempo real la tarjeta con FC=104 y CN=24510' }
          ],
          expectedResult: 'El torno o lector de pruebas activa el relé de apertura por emulación RF.'
        }
      },
      {
        id: 'les-3-3',
        title: 'Indala, Keri, AWID y el chip T5577 a fondo',
        duration: '2h 30m',
        type: 'laboratorio',
        difficulty: 'Avanzado',
        summary: 'Protocolos LF propietarios con modulación PSK/FSK y cómo configurar los bloques de control y contraseñas del chip T5577.',
        objectives: [
          'Aprender a configurar los bloques de configuración (Block 0) del T5577 para distintas modulaciones.',
          'Desbloquear chips T5577 protegidos con contraseñas por defecto o mediante fuerza bruta.',
          'Analizar por qué los lectores Indala aplican ofuscación invertida y cómo resolverla.'
        ],
        keyConcepts: ['Modulación FSK / PSK', 'Config register T5577', 'Contraseñas de bloque T5577', 'AOR (Acquisition of Response)'],
        toolsUsed: ['Proxmark3 con diccionario de contraseñas T5577'],
        practicalExercise: {
          title: 'Lab 3.3: Recuperación de T5577 bloqueado y clonado Indala',
          description: 'Detectar un chip T5577 con protección de escritura y recuperar el control usando diccionarios de contraseñas de fabricantes.',
          commands: [
            { cmd: 'lf t55xx detect', desc: 'Verifica si la tarjeta es un T5577 reprogramable' },
            { cmd: 'lf t55xx brute -d passwords.dic', desc: 'Fuerza bruta contra contraseñas de protección de bloque' }
          ],
          expectedResult: 'Tarjeta T5577 desbloqueada y lista para reescritura.'
        }
      }
    ]
  },
  {
    id: 'mod-4',
    number: 4,
    title: 'Alta Frecuencia (HF 13.56 MHz): El Mundo MIFARE',
    subtitle: 'Criptoanálisis de Crypto-1, ataques matemáticos y auditoría de memoria',
    durationHours: 8,
    practicePercentage: 85,
    color: 'rose',
    tagFrequency: 'HF 13.56 MHz / MIFARE',
    description: 'El núcleo de este curso. Aprende la criptografía propietaria de NXP (Crypto-1), por qué se rompió y cómo auditar tarjetas de transporte, hoteles y campus.',
    lessons: [
      {
        id: 'les-4-1',
        title: 'Estructura interna de memoria de MIFARE Classic 1K / 4K',
        duration: '2h 00m',
        type: 'teoria',
        difficulty: 'Principiante',
        summary: 'Sectores, bloques de datos, bloques de valor (Value Blocks) y Sector Trailer (Claves A y B + Access Bits).',
        objectives: [
          'Entender el mapa de memoria: 16 sectores con 4 bloques de 16 bytes cada uno.',
          'Interpretar los Access Bits (condiciones de lectura/escritura) y calcularlos sin bloquear la tarjeta.',
          'Comprender cómo funcionan los bloques de saldo monetario (Value Blocks con redundancia invertida).'
        ],
        keyConcepts: ['Sector Trailer', 'Clave Key A y Key B', 'Access Bits (C1, C2, C3)', 'Value Block Architecture'],
        toolsUsed: ['Mifare Classic Tool (MCT en Android)', 'Proxmark3', 'Calculadora de Access Bits'],
        practicalExercise: {
          title: 'Lab 4.1: Decodificación visual de un volcado hexadecimal',
          description: 'Tomar un dump .bin/.mct de una tarjeta y aislar manualmente el sector trailer, verificando permisos de lectura y escritura.',
          commands: [
            { cmd: 'hf mf dump', desc: 'Descarga completa de la memoria si las claves son conocidas' }
          ],
          expectedResult: 'Mapeo completo de qué bloques son modificables y cuáles están protegidos.'
        }
      },
      {
        id: 'les-4-2',
        title: 'Ataques de claves por defecto y diccionario',
        duration: '1h 30m',
        type: 'laboratorio',
        difficulty: 'Principiante',
        summary: 'Millones de tarjetas en producción siguen usando claves de fábrica como FFFFFFFFFFFF o A0A1A2A3A4A5.',
        objectives: [
          'Auditar un lote de tarjetas contra las 5.000 claves más comunes en instalaciones reales.',
          'Identificar si una instalación ha cambiado solo la Key A y dejado la Key B por defecto.',
          'Utilizar Mifare Classic Tool en smartphone para auditorías rápidas.'
        ],
        keyConcepts: ['Diccionarios de claves comunes', 'Key A vs Key B privileges', 'Transport keys'],
        toolsUsed: ['MCT (Android)', 'Proxmark3 con default_keys.dic'],
        practicalExercise: {
          title: 'Lab 4.2: Auditoría express con diccionario',
          description: 'Ejecutar una prueba de diccionario completa contra una tarjeta de prueba con sectores semiprotegidos.',
          commands: [
            { cmd: 'hf mf chk --dump', desc: 'Prueba todas las claves del diccionario contra todos los sectores y descarga lo accesible' }
          ],
          expectedResult: 'Recuperación de al menos un 50-80% de los sectores en sistemas mal configurados.'
        }
      },
      {
        id: 'les-4-3',
        title: 'Ataque Darkside (Courtois 2009) y PRNG débil',
        duration: '2h 00m',
        type: 'laboratorio',
        difficulty: 'Intermedio',
        summary: 'Cómo extraer la primera clave de una tarjeta donde NO conocemos ninguna clave, aprovechando la respuesta NACK con información de paridad.',
        objectives: [
          'Comprender la debilidad del generador de números pseudoaleatorios (PRNG) de NXP.',
          'Ejecutar el ataque Darkside para extraer el primer vector de autenticación.',
          'Aprender por qué las tarjetas modernas con "Hardened PRNG" resisten el Darkside.'
        ],
        keyConcepts: ['Parity bits side-channel', 'NACK leakage', 'Linear Feedback Shift Register (LFSR)', 'Crypto-1 state recovery'],
        toolsUsed: ['mfcuk (MiFare Classic Universal toolKit)', 'Proxmark3 CLI'],
        practicalExercise: {
          title: 'Lab 4.3: Obtención de la primera clave con Darkside',
          description: 'Colocar una tarjeta MIFARE Classic sin ninguna clave por defecto y recuperar una clave válida en menos de 5 minutos.',
          commands: [
            { cmd: 'hf mf darkside', desc: 'Ejecuta el exploit Darkside en Proxmark3' },
            { cmd: 'mfcuk -C -R 0:A -v 2', desc: 'Herramienta de consola para recuperar Key A del sector 0' }
          ],
          expectedResult: 'Descubrimiento de Key A = A0 B1 C2 D3 E4 F5.'
        }
      },
      {
        id: 'les-4-4',
        title: 'Ataque Nested y Hardnested: Crackeando el resto de sectores',
        duration: '2h 30m',
        type: 'laboratorio',
        difficulty: 'Avanzado',
        summary: 'Una vez tenemos 1 sola clave, el protocolo permite autenticarse en el sector 1 y preguntar por el sector 2 midiendo el desfase del generador de nonces.',
        objectives: [
          'Entender el ataque Nested clásico para tarjetas con PRNG predecible.',
          'Ejecutar el ataque Hardnested (Carlo Meijer 2015) para tarjetas con PRNG parcheado.',
          'Acelerar el crackeo mediante tablas precomputadas o GPU.'
        ],
        keyConcepts: ['Nested attack', 'Hardnested attack', 'State collapse', 'Crapto1 library'],
        toolsUsed: ['mfoc (Mifare Flawed Offline Cracker)', 'Proxmark3 autopwn', 'Chameleon Ultra'],
        practicalExercise: {
          title: 'Lab 4.4: Autopwn completo: Dump del 100% de la tarjeta',
          description: 'Automatizar la cadena completa: Darkside -> Nested -> Descarga de los 64 bloques -> Guardado de imagen binaria.',
          commands: [
            { cmd: 'hf mf autopwn', desc: 'Flujo automático en Proxmark3 que combina diccionario, darkside y nested' },
            { cmd: 'hf mf eload --file dump.bin', desc: 'Carga el volcado completo en la memoria del emulador' }
          ],
          expectedResult: 'Obtención de todas las claves Key A y Key B y generación del archivo .bin íntegro.'
        }
      }
    ]
  },
  {
    id: 'mod-5',
    number: 5,
    title: 'Ataques Avanzados, Hoteles, Transporte y Relay Attacks',
    subtitle: 'Vulnerabilidades en el mundo real: Saflok, manipulación de saldos y NFCGate',
    durationHours: 8,
    practicePercentage: 90,
    color: 'purple',
    tagFrequency: 'Real-World Exploits',
    description: 'Estudia casos reales de alta repercusión: desde el hackeo de cerraduras de hotel (Unsaflok) hasta ataques de relevo a distancia mediante internet.',
    lessons: [
      {
        id: 'les-5-1',
        title: 'Manipulación de saldos: Diffing y Replay de bloques de datos',
        duration: '2h 00m',
        type: 'laboratorio',
        difficulty: 'Intermedio',
        summary: 'Cómo operan los sistemas offline de lavanderías, máquinas de vending o parkings que guardan el saldo dentro de la propia tarjeta.',
        objectives: [
          'Metodología de auditoría de estado: Dump inicial -> Consumir servicio -> Dump final -> Hex Diffing.',
          'Identificar checksums propios, XORs y contadores de recarga.',
          'Entender el peligro de clonar saldos y los controles de reconciliación en backoffice.'
        ],
        keyConcepts: ['Hex diffing', 'Little Endian vs Big Endian', 'Two-complement Value Block', 'Replay de transacciones offline'],
        toolsUsed: ['Vbindiff / ImHex', 'MCT Android', 'Proxmark3'],
        practicalExercise: {
          title: 'Lab 5.1: Auditoría de saldo en tarjeta de vending de laboratorio',
          description: 'Comparar dos volcados de una tarjeta de laboratorio para localizar exactamente los bytes que representan 5.00€ y revertirlos.',
          commands: [
            { cmd: 'vbindiff saldo_5eur.bin saldo_3eur.bin', desc: 'Herramienta de terminal para ver cambios byte a byte' },
            { cmd: 'hf mf wrbl --blk 8 --data 00000005...', desc: 'Reescritura de bloque modificado en tarjeta de prácticas' }
          ],
          expectedResult: 'Identificación de la estructura de bloque de valor y reversión del saldo en entorno controlado.'
        }
      },
      {
        id: 'les-5-2',
        title: 'Estudio de caso: Unsaflok y cerraduras de hotel (MIFARE Classic + KDF)',
        duration: '3h 00m',
        type: 'laboratorio',
        difficulty: 'Avanzado',
        summary: 'Análisis detallado de la vulnerabilidad descubierta en millones de cerraduras Saflok: cómo una función KDF débil permite generar llaves maestras a partir de dos tarjetas cualesquiera.',
        objectives: [
          'Analizar la arquitectura de las cerraduras de hotel electromecánicas offline.',
          'Entender cómo se combinan la clave de hotel (Property Code) y la fecha de expiración.',
          'Aprender las medidas de mitigación que la industria hotelera está desplegando.'
        ],
        keyConcepts: ['KDF (Key Derivation Function)', 'Master Key Generation', 'Off-line audit logs en cerraduras', 'Vulnerabilidad Unsaflok'],
        toolsUsed: ['Proxmark3', 'Flipper Zero con subGHz y NFC', 'Tarjetas Gen2 CUID'],
        practicalExercise: {
          title: 'Lab 5.2: Simulación de derivación de claves con KDF débil',
          description: 'A partir de un script didáctico de KDF basado en UID, calcular la clave de un sector de una cerradura de laboratorio.',
          commands: [
            { cmd: 'python3 kdf_simulator.py --uid 3a4b5c6d', desc: 'Genera las claves esperadas para los sectores protegidos' },
            { cmd: 'hf mf chk --dump -k keys_derived.dic', desc: 'Prueba las claves derivadas en la cerradura de pruebas' }
          ],
          expectedResult: 'Apertura de la cerradura de pruebas mediante credencial sintética generada.'
        }
      },
      {
        id: 'les-5-3',
        title: 'Relay Attacks a larga distancia con NFCGate',
        duration: '3h 00m',
        type: 'reto',
        difficulty: 'Avanzado',
        summary: 'El ataque más peligroso contra sistemas sin tiempo de respuesta restringido: una persona acerca el teléfono a la víctima en el metro mientras su cómplice abre la puerta a 10 km de distancia vía 4G/WiFi.',
        objectives: [
          'Entender el principio del ataque de intermediario (Man-in-the-Middle) en RF.',
          'Montar un servidor NFCGate en la nube (relay server en Node.js/Python).',
          'Medir la latencia de respuesta y comprender las defensas basadas en Distance Bounding.'
        ],
        keyConcepts: ['Relay Attack', 'Distance Bounding Protocols', 'Time of Flight (ToF)', 'NFCGate architecture'],
        toolsUsed: ['2 Smartphones Android con Root / Xposed', 'Servidor NFCGate', 'Lector de control de accesos'],
        practicalExercise: {
          title: 'Lab 5.3: Simulación de Relay Attack en red local',
          description: 'Configurar dos terminales (uno en modo lector capturando una tarjeta legítima y otro en modo emulador frente al lector) retransmitiendo APDUs por sockets TCP.',
          expectedResult: 'El lector valida el acceso a pesar de que la tarjeta física está en otra habitación.'
        }
      }
    ]
  },
  {
    id: 'mod-6',
    number: 6,
    title: 'Defensa, Hardening, Criptografía Moderna y Auditoría',
    subtitle: 'MIFARE DESFire EV3, HID SEOS, detección de anomalías y marco legal',
    durationHours: 6,
    practicePercentage: 70,
    color: 'teal',
    tagFrequency: 'Defensa & Cripto',
    description: 'No hay pentesting útil sin remediación. Aprende a diseñar sistemas seguros con AES-128, mutual authentication, y cómo redactar un informe de auditoría física profesional.',
    lessons: [
      {
        id: 'les-6-1',
        title: 'Tecnologías modernas resistentes: MIFARE DESFire EV2/EV3 y HID SEOS',
        duration: '2h 00m',
        type: 'teoria',
        difficulty: 'Intermedio',
        summary: 'Criptografía simétrica real: 3DES y AES-128 con protocolo CMAC. Por qué clonar estas tarjetas es actualmente inviable mediante radio.',
        objectives: [
          'Comprender el apretón de manos (handshake) con autenticación mutua AES.',
          'Aprender la diferencia entre leer un CSN (inseguro) y leer una aplicación protegida con AID dentro de DESFire.',
          'Descubrir qué son los Secure Elements y las llaves SAM (Secure Access Module) en los lectores de pared.'
        ],
        keyConcepts: ['AES-128 CBC/CMAC', 'Application Identifier (AID)', 'SAM (Secure Access Module)', 'Proximity Check'],
        toolsUsed: ['Proxmark3', 'DESFire sample cards', 'Lector OSDP'],
        practicalExercise: {
          title: 'Lab 6.1: Inspección de aplicaciones en tarjeta DESFire EV3',
          description: 'Listar las aplicaciones públicas AID en una tarjeta moderna y verificar el rechazo de lectura sin clave AES legítima.',
          commands: [
            { cmd: 'hf 14a raw -p -c 90 6a 00 00 00', desc: 'Envía comando GetApplicationIDs de ISO 7816-4' }
          ],
          expectedResult: 'La tarjeta devuelve los identificadores de aplicación pero deniega acceso a los archivos de datos.'
        }
      },
      {
        id: 'les-6-2',
        title: 'Detección activa de clones y telemetría de anomalías',
        duration: '2h 00m',
        type: 'laboratorio',
        difficulty: 'Avanzado',
        summary: 'Cómo los administradores de seguridad pueden detectar si alguien está usando un Flipper Zero o una tarjeta mágica en sus instalaciones.',
        objectives: [
          'Detectar respuestas de sincronismo anómalas (timing attacks y jitter de microcontroladores emuladores).',
          'Monitorear intentos de autenticación con claves por defecto en lectores OSDP v2 con canal cifrado (Secure Channel).',
          'Implementar la verificación de contadores de transacciones en base de datos.'
        ],
        keyConcepts: ['Protocolo OSDP vs Wiegand sin cifrar', 'Detección de tarjetas mágicas por respuesta backdoor', 'Jitter de emulación'],
        toolsUsed: ['Analizador de protocolo OSDP', 'Lector HID Signo / iCLASS SE'],
        practicalExercise: {
          title: 'Lab 6.2: Implementación de detección de Magic Cards en firmware',
          description: 'Programar un microcontrolador ESP32 con RC522 para que antes de pedir el UID, envíe el comando chino 0x40/0x43 y alerte si la tarjeta responde como clon.',
          expectedResult: 'El sistema enciende un LED rojo y bloquea el acceso si detecta una Magic Card Gen1a.'
        }
      },
      {
        id: 'les-6-3',
        title: 'Marco legal, Rules of Engagement (RoE) y Redacción de Informes',
        duration: '2h 00m',
        type: 'laboratorio',
        difficulty: 'Intermedio',
        summary: 'Límites éticos y legales en España y la Unión Europea (Código Penal, RGPD con datos biométricos o de presencia). Cómo presentar hallazgos a un cliente.',
        objectives: [
          'Elaborar un documento de autorización de pruebas (Rules of Engagement / Get Out of Jail Card) para intrusión física.',
          'Redactar matrices de riesgo CVSS para vulnerabilidades de control de accesos físicos.',
          'Proponer planes de migración escalonada (lectores duales multitecnología) para clientes con presupuestos limitados.'
        ],
        keyConcepts: ['Rules of Engagement (RoE)', 'CVSS en seguridad física', 'Plan de migración multitecnología', 'RGPD y logs de control'],
        toolsUsed: ['Plantilla de Informe de Auditoría', 'Calculadora CVSS 3.1'],
        practicalExercise: {
          title: 'Lab 6.3: Redacción del informe final de auditoría',
          description: 'A partir de los hallazgos de los laboratorios anteriores, completar una plantilla de informe técnico y ejecutivo recomendando el cambio de MIFARE Classic a DESFire EV3.',
          expectedResult: 'Documento ejecutivo listo para entrega a dirección técnica.'
        }
      }
    ]
  }
];

export interface HardwareKit {
  tier: 'Básico / Estudiante' | 'Intermedio / Pentester' | 'Avanzado / Red Team Pro';
  budgetEur: string;
  targetAudience: string;
  items: {
    name: string;
    approxPrice: string;
    purpose: string;
    isEssential: boolean;
  }[];
  pros: string[];
  cons: string[];
}

export const HARDWARE_KITS: HardwareKit[] = [
  {
    tier: 'Básico / Estudiante',
    budgetEur: '35€ - 50€',
    targetAudience: 'Estudiantes de FP, universidad o autodidactas con presupuesto muy ajustado',
    items: [
      {
        name: 'Smartphone Android con NFC integrado',
        approxPrice: '0€ (si ya tienes uno)',
        purpose: 'Lectura, volcado y clonación básica con Mifare Classic Tool (MCT), NFC Tools y TagInfo',
        isEssential: true
      },
      {
        name: 'Pack de 10 tarjetas MIFARE Classic 1K Magic Gen2 (CUID)',
        approxPrice: '12€',
        purpose: 'Prácticas de clonación de UID modificable compatible con teléfonos Android',
        isEssential: true
      },
      {
        name: 'Lector USB ACR122U (o módulo PN532 + conversor USB-UART)',
        approxPrice: '20€ - 28€',
        purpose: 'Interactuar con libnfc, mfoc y mfcuk en Linux/Kali para crackear Crypto-1',
        isEssential: true
      },
      {
        name: 'Pack de 5 llaveros regrabables T5577 (125 kHz)',
        approxPrice: '8€',
        purpose: 'Para cuando se amplíe a baja frecuencia con herramientas adicionales',
        isEssential: false
      }
    ],
    pros: [
      'Inversión mínima para empezar hoy mismo',
      'Permite cubrir el 70% de los ataques a MIFARE Classic',
      'Todo el software utilizado es open source gratuito'
    ],
    cons: [
      'No permite auditar 125 kHz sin hardware adicional',
      'No tiene capacidad de sniffing pasivo en el aire ni emulación avanzada'
    ]
  },
  {
    tier: 'Intermedio / Pentester',
    budgetEur: '110€ - 160€',
    targetAudience: 'Profesionales de ciberseguridad junior, auditores de sistemas y entusiastas',
    items: [
      {
        name: 'Proxmark3 Easy 512Kb (Iceman Firmware)',
        approxPrice: '65€ - 85€',
        purpose: 'La navaja suiza estándar. Audita tanto 125 kHz (LF) como 13.56 MHz (HF), sniffing y emulación',
        isEssential: true
      },
      {
        name: 'Chameleon Ultra (o Chameleon Tiny)',
        approxPrice: '45€ - 65€',
        purpose: 'Dispositivo ultra compacto para emular hasta 8 tarjetas simultáneas y crackear nonces en campo',
        isEssential: true
      },
      {
        name: 'Pack variado de Magic Cards (Gen1a, Gen2 CUID, Gen4) + T5577',
        approxPrice: '18€',
        purpose: 'Cubrir todos los tipos de puertas traseras y protecciones anti-clon',
        isEssential: true
      },
      {
        name: 'Bobinas de prueba con LED (RFID Detector Field Coils)',
        approxPrice: '6€',
        purpose: 'Ver al instante si un lector de pared emite en 125 kHz o 13.56 MHz sin tocarlo',
        isEssential: true
      }
    ],
    pros: [
      'Relación calidad/precio imbatible para cubrir el 95% del curso',
      'Soporte completo para firmware Iceman, la referencia de la industria',
      'Capacidad para auditar tanto parkings antiguos como oficinas corporativas'
    ],
    cons: [
      'Requiere conectar el Proxmark3 por USB a un portátil o teléfono con Termux',
      'Curva de aprendizaje inicial en la línea de comandos de PM3'
    ]
  },
  {
    tier: 'Avanzado / Red Team Pro',
    budgetEur: '290€ - 380€',
    targetAudience: 'Equipos de Red Team físico, laboratorios universitarios y consultoras de seguridad',
    items: [
      {
        name: 'Proxmark3 RDV4.01 con antenas modular extendida',
        approxPrice: '220€ - 260€',
        purpose: 'Máxima sensibilidad RF, mejor calidad de componentes y posibilidad de módulo Bluetooth autónomo',
        isEssential: true
      },
      {
        name: 'Flipper Zero con módulos de desarrollo',
        approxPrice: '169€',
        purpose: 'Reconocimiento táctico rápido, captura en bolsillo y reproducción instantánea sin cables',
        isEssential: true
      },
      {
        name: 'Chameleon Ultra con firmware BLE y app móvil',
        approxPrice: '65€',
        purpose: 'Emulación indetectable y crackeo automatizado en movimiento',
        isEssential: true
      },
      {
        name: 'Laboratorio de cerraduras electromecánicas y lector OSDP para pruebas',
        approxPrice: '50€',
        purpose: 'Montaje de banco de pruebas realista con relés y cerradura motorizada de hotel',
        isEssential: false
      }
    ],
    pros: [
      'El mismo instrumental que utilizan las consultoras de Red Team de élite',
      'Alta velocidad de ejecución en auditorías físicas presenciales',
      'Capacidad completa de investigación de protocolos cerrados y señales RF'
    ],
    cons: [
      'Inversión económica más alta para un principiante',
      'Requiere cuidado especial para evitar daños físicos en bobinas de alta precisión'
    ]
  }
];

export interface AttackMatrixRow {
  technology: string;
  frequency: string;
  standard: string;
  crypto: string;
  defaultKeyRisk: string;
  cloneRisk: string;
  relayRisk: string;
  realWorldUsage: string;
  recommendation: string;
}

export const ATTACK_MATRIX: AttackMatrixRow[] = [
  {
    technology: 'EM4100 / EM4200',
    frequency: '125 kHz (LF)',
    standard: 'Propietario / EM Microelectronic',
    crypto: 'Ninguno (Texto plano en aire)',
    defaultKeyRisk: 'N/A (Sin claves)',
    cloneRisk: 'Crítico (Clonado instantáneo a T5577)',
    relayRisk: 'Alto (Cualquier bobina amplificada)',
    realWorldUsage: 'Interfonos, garajes residenciales, gimnasios antiguos',
    recommendation: 'Reemplazo inmediato por tecnología HF cifrada.'
  },
  {
    technology: 'HID Prox II (26-bit Wiegand)',
    frequency: '125 kHz (LF)',
    standard: 'H10301 / Wiegand',
    crypto: 'Ninguno (Facility Code + ID plano)',
    defaultKeyRisk: 'N/A (Sin claves)',
    cloneRisk: 'Crítico (Clonado en 1 segundo con Proxmark3 o Flipper)',
    relayRisk: 'Alto',
    realWorldUsage: 'Edificios de oficinas multinacionales (muy extendido)',
    recommendation: 'Migrar a HID SEOS o lectores duales con OSDP v2 cifrado.'
  },
  {
    technology: 'Indala / Keri / AWID',
    frequency: '125 kHz (LF)',
    standard: 'Propietario PSK/FSK',
    crypto: 'Ofuscación por hardware (Inversión de bits)',
    defaultKeyRisk: 'N/A',
    cloneRisk: 'Alto (Desofuscable con firmware Iceman)',
    relayRisk: 'Alto',
    realWorldUsage: 'Sistemas corporativos estadounidenses y europeos',
    recommendation: 'Sustituir por credenciales de 13.56 MHz con autenticación mutua.'
  },
  {
    technology: 'MIFARE Classic 1K / 4K',
    frequency: '13.56 MHz (HF)',
    standard: 'ISO 14443-3A',
    crypto: 'Crypto-1 (48 bits propietario, roto)',
    defaultKeyRisk: 'Crítico (Frecuente uso de claves de fábrica)',
    cloneRisk: 'Crítico (Darkside, Nested, Hardnested crackeable en minutos)',
    relayRisk: 'Muy Alto (Vulnerable a NFCGate sin comprobación de tiempo)',
    realWorldUsage: 'Hoteles (Saflok, etc.), tarjetas universitarias, abonos transporte',
    recommendation: 'Actualizar a MIFARE DESFire EV2/EV3 con claves AES-128.'
  },
  {
    technology: 'MIFARE Ultralight (C / EV1)',
    frequency: '13.56 MHz (HF)',
    standard: 'ISO 14443-3A',
    crypto: 'Ultralight básica: Ninguno. Ultralight C: 3DES',
    defaultKeyRisk: 'Alto (Ultralight normal no tiene contraseñas)',
    cloneRisk: 'Alto (Reescritura de páginas con Magic Gen4)',
    relayRisk: 'Alto',
    realWorldUsage: 'Billetes de transporte de un solo uso, eventos, pulseras festivales',
    recommendation: 'Usar contadores criptográficos y firmas ECDSA en backend.'
  },
  {
    technology: 'NTAG 213 / 215 / 216',
    frequency: '13.56 MHz (HF/NFC)',
    standard: 'NFC Forum Type 2',
    crypto: 'Contraseña simple de 32-bit (sin cifrado de canal)',
    defaultKeyRisk: 'Medio (Clave PWD típicamente 00000000 o conocida)',
    cloneRisk: 'Medio-Alto (Clonable en Magic Tags NTAG)',
    relayRisk: 'Alto',
    realWorldUsage: 'Marketing NFC, tarjetas de visita digitales, figuras Amiibo',
    recommendation: 'No utilizar como credencial de seguridad perimetral.'
  },
  {
    technology: 'MIFARE DESFire EV1',
    frequency: '13.56 MHz (HF)',
    standard: 'ISO 14443-4A',
    crypto: '3DES / AES-128 (Vulnerabilidad conocida por DPA en hardware antiguo)',
    defaultKeyRisk: 'Bajo (Claves maestras gestionadas)',
    cloneRisk: 'Bajo (No clonable por radio directa, requiere ataque de canal lateral en chip)',
    relayRisk: 'Medio',
    realWorldUsage: 'Sistemas de metro, accesos de alta seguridad gubernamentales',
    recommendation: 'Planificar actualización a DESFire EV2/EV3 para mitigar DPA.'
  },
  {
    technology: 'MIFARE DESFire EV2 / EV3',
    frequency: '13.56 MHz (HF)',
    standard: 'ISO 14443-4A',
    crypto: 'AES-128 con protocolo CMAC + Proximity Check',
    defaultKeyRisk: 'Muy Bajo',
    cloneRisk: 'Inviable con herramientas comerciales actuales',
    relayRisk: 'Bajo (Si se habilita el Proximity Check ToF)',
    realWorldUsage: 'Estándar moderno en banca, transporte masivo y defensa',
    recommendation: 'Estándar recomendado para nuevas implantaciones.'
  },
  {
    technology: 'HID iCLASS (Legacy)',
    frequency: '13.56 MHz (HF)',
    standard: 'ISO 15693 / 14443B',
    crypto: 'iCLASS Standard (Clave maestra global filtrada "Heart of Gold")',
    defaultKeyRisk: 'Crítico (Clave universal extraída de lectores)',
    cloneRisk: 'Crítico (Calculable con herramienta loclass)',
    relayRisk: 'Medio',
    realWorldUsage: 'Grandes corporaciones y bancos con instalaciones de 2005-2015',
    recommendation: 'Desactivar modo Legacy y activar HID iCLASS SE / SEOS.'
  },
  {
    technology: 'HID SEOS',
    frequency: '13.56 MHz / BLE',
    standard: 'ISO 14443A + JavaCard',
    crypto: 'AES-128 con canal seguro propietario de HID',
    defaultKeyRisk: 'Nulo (Gestión centralizada Origo)',
    cloneRisk: 'Inviable por radio',
    relayRisk: 'Bajo-Medio',
    realWorldUsage: 'Accesos móviles modernos y corporaciones Fortune 500',
    recommendation: 'Excelente opción si se opera dentro del ecosistema HID.'
  }
];
