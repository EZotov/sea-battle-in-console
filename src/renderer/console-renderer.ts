import {Board} from '../core/elements/board';
import {CellState, Coordinates} from '../types';

const ALPHABET = 'АБВГДЕЖЗИКЛМНОПРСТУ'; // 19 букв для полей от 6x6 до 19x19

const COLORS = {
    reset: '\x1b[0m',
    blue: '\x1b[34m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    gray: '\x1b[90m',
    yellow: '\x1b[33m',
} as const;

export class ConsoleRenderer {
    private readonly fieldSize: number;
    private readonly letters: string[];

    constructor(fieldSize: number) {
        this.fieldSize = fieldSize;
        this.letters = ALPHABET.slice(0, fieldSize).split('');
    }

    parseCoordinates(input: string): Coordinates | null {
        const cleaned = input.trim().toUpperCase();
        // Ищем 1 букву и 1–2 цифры (например: А1, Б10, Т19)
        const match = cleaned.match(/^([А-Я])\s*(\d{1,2})$/);

        if (!match) {
            return null;
        }

        const letter = match[1];
        const rowNumber = Number(match[2]);

        const col = this.letters.indexOf(letter);
        const row = rowNumber - 1;

        if (col === -1 || row < 0 || row >= this.fieldSize) {
            return null;
        }

        return {row, col};
    }

    render(playerBoard: Board, enemyBoard: Board, statusMessage?: string) {
        console.clear();
        console.log(`${COLORS.yellow}=== МОРСКОЙ БОЙ (${this.fieldSize}×${this.fieldSize}) ===${COLORS.reset}\n`);

        const headerLetters = this.letters.join(' ');
        const gap = '        '; // Отступ между двумя полями

        // Выравниваем заголовки полей под текущую ширину сетки
        const playerTitle = `ВАШЕ ПОЛЕ (${playerBoard.aliveShipsCount})`.padEnd(headerLetters.length + 3, ' ');
        const enemyTitle = `ПОЛЕ ПРОТИВНИКА (${enemyBoard.aliveShipsCount})`;

        console.log(`${playerTitle}${gap}${enemyTitle}`);
        console.log(`   ${headerLetters}${gap}   ${headerLetters}`);

        for (let row = 0; row < this.fieldSize; row++) {
            const rowLabel = String(row + 1).padStart(2, ' ');

            const playerRowCells = this.formatRow(playerBoard, row, false);
            const enemyRowCells = this.formatRow(enemyBoard, row, true);

            console.log(`${rowLabel} ${playerRowCells}${gap}${rowLabel} ${enemyRowCells}`);
        }

        console.log('\nЛегенда: ■ — корабль, ✕ — попадание, • — промах');
        console.log(`\n${COLORS.yellow}Статус:${COLORS.reset} ${statusMessage}\n`);
    }

    private formatRow(board: Board, row: number, hideShips: boolean): string {
        const cells: string[] = [];

        for (let col = 0; col < this.fieldSize; col++) {
            const state = board.getCell({row, col});
            cells.push(this.formatCell(state, hideShips));
        }

        return cells.join(' ');
    }

    private formatCell(state: CellState, hideShips: boolean): string {
        switch (state) {
            case 'empty':
                return `${COLORS.blue}·${COLORS.reset}`;
            case 'ship':
                return hideShips ? `${COLORS.blue}·${COLORS.reset}` : `${COLORS.green}■${COLORS.reset}`;
            case 'hit':
                return `${COLORS.red}✕${COLORS.reset}`;
            case 'miss':
                return `${COLORS.gray}•${COLORS.reset}`;
        }
    }
}
