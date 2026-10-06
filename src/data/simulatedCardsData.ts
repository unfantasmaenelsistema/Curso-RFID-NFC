export interface SimulatedCard {
  id: string;
  name: string;
  frequency: '125 kHz (LF)' | '13.56 MHz (HF)';
  standard: string;
  uid: string;
  atqa?: string;
  sak?: string;
  technology: string;
  vulnerabilityType: string;
  description: string;
  sectors?: {
    sector: number;
    keyA: string;
    accessBits: string;
    keyB: string;
    blocks: string[];
    isDefaultKey: boolean;
  }[];
  lfData?: {
    rawHex: string;
    facilityCode: number;
    cardNumber: number;
    wiegandFormat: string;
  };
}

export const SIMULATED_CARDS: SimulatedCard[] = [
  {
    id: 'card-mifare-vuln',
    name: 'Tarjeta Hotel / Residencia (MIFARE Classic 1K)',
    frequency: '13.56 MHz (HF)',
    standard: 'ISO/IEC 14443-3 Type A',
    uid: 'A3 B4 2C 19',
    atqa: '00 04',
    sak: '08',
    technology: 'NXP MIFARE Classic 1K (S50)',
    vulnerabilityType: 'Crypto-1 PRNG débil + Claves por defecto en sector 0',
    description: 'Tarjeta típica de cerradura de habitación o gimnasio con claves de fábrica en algunos sectores y clave de hotel derivada en sector 1 y 2.',
    sectors: [
      {
        sector: 0,
        keyA: 'A0 A1 A2 A3 A4 A5',
        accessBits: 'FF 07 80 69',
        keyB: 'FF FF FF FF FF FF',
        isDefaultKey: true,
        blocks: [
          'A3 B4 2C 19 82 08 04 00 62 63 64 65 66 67 68 69', // Block 0 (Manufacturer UID)
          '00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00',
          '00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00',
          'A0 A1 A2 A3 A4 A5 FF 07 80 69 FF FF FF FF FF FF'
        ]
      },
      {
        sector: 1,
        keyA: '1B 4F 99 C2 08 3A',
        accessBits: '7F 07 88 00',
        keyB: '90 E4 11 3A D1 88',
        isDefaultKey: false,
        blocks: [
          '48 4F 54 45 4C 5F 52 4F 4F 4D 5F 33 30 32 00 00', // "HOTEL_ROOM_302"
          '32 30 32 36 2D 31 30 2D 30 36 54 31 32 3A 30 30', // Expiration timestamp
          '01 00 00 00 FE FF FF FF 01 00 00 00 05 FA 05 FA', // Counter / Value Block
          '1B 4F 99 C2 08 3A 7F 07 88 00 90 E4 11 3A D1 88'
        ]
      },
      {
        sector: 2,
        keyA: 'D3 F7 D3 F7 D3 F7',
        accessBits: 'FF 07 80 69',
        keyB: 'FF FF FF FF FF FF',
        isDefaultKey: true,
        blocks: [
          '00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00',
          '50 41 52 4B 49 4E 47 5F 41 43 43 45 53 53 5F 31', // "PARKING_ACCESS_1"
          '00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00',
          'D3 F7 D3 F7 D3 F7 FF 07 80 69 FF FF FF FF FF FF'
        ]
      }
    ]
  },
  {
    id: 'card-hid-prox',
    name: 'Credencial Corporativa Oficina (HID Prox II 125 kHz)',
    frequency: '125 kHz (LF)',
    standard: 'Wiegand H10301 (26-bit standard)',
    uid: '01 04 22 55 AA',
    technology: 'HID Prox II (125 kHz)',
    vulnerabilityType: 'Transmisión sin cifrado ni autenticación mutua',
    description: 'Tarjeta de oficina corporativa común. Solo transmite un código de instalación (Facility Code) y un ID de usuario mediante modulación FSK.',
    lfData: {
      rawHex: '0000000000000001042255AA',
      facilityCode: 112,
      cardNumber: 14592,
      wiegandFormat: 'Wiegand 26-bit: Even Parity [1] + FC [112] (8-bit) + CN [14592] (16-bit) + Odd Parity [0]'
    }
  },
  {
    id: 'card-em4100',
    name: 'Llavero de Garaje / Interfono (EM4100 125 kHz)',
    frequency: '125 kHz (LF)',
    standard: 'EM-Marin 64-bit Read Only',
    uid: '1E 00 48 9B 13',
    technology: 'EM4100 / EM4200 (125 kHz)',
    vulnerabilityType: 'Transmisión estática en texto claro, 100% clonable a T5577',
    description: 'El típico llavero azul o negro en forma de gota. Transmite cíclicamente 64 bits modulados en Manchester.',
    lfData: {
      rawHex: 'FF80F00489B13C',
      facilityCode: 30,
      cardNumber: 39699,
      wiegandFormat: 'EM4100 5-byte Customer ID: 1E, Serial: 00489B13'
    }
  },
  {
    id: 'card-desfire-secure',
    name: 'Tarjeta Transporte / Alta Seguridad (DESFire EV3)',
    frequency: '13.56 MHz (HF)',
    standard: 'ISO/IEC 14443-4 Type A (ISO 7816 APDU)',
    uid: '04 88 F1 2A 9C 77 80',
    atqa: '03 44',
    sak: '20',
    technology: 'NXP MIFARE DESFire EV3 4K',
    vulnerabilityType: 'Resistente a ataques de radio (Cifrado AES-128 con CMAC)',
    description: 'Tarjeta moderna configurada correctamente. No responde a lectura de memoria sin handshake mutuo AES con la clave del sistema.',
    sectors: []
  }
];
