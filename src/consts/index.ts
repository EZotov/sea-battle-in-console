export const SHIP_NAMES: Record<number, string> = {
    1: 'Катер',
    2: 'Эсминец',
    3: 'Крейсер',
    4: 'Линкор',
};

export const FLEET_CONFIG = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1] as const;

export const ALPHABET = 'АБВГДЕЖЗИКЛМНОПРСТУ'; // 19 букв для полей от 6x6 до 19x19

export const COLORS = {
    reset: '\x1b[0m',
    blue: '\x1b[34m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    gray: '\x1b[90m',
    yellow: '\x1b[33m',
} as const;
