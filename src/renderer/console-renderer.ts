import {ALPHABET, COLORS} from '../consts';
import {Board} from '../core/elements/board';
import {Coordinates} from '../types';
import {formatRow} from './utils';

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

            const playerRowCells = formatRow(this.fieldSize, playerBoard, row, false);
            const enemyRowCells = formatRow(this.fieldSize, enemyBoard, row, true);

            console.log(`${rowLabel} ${playerRowCells}${gap}${rowLabel} ${enemyRowCells}`);
        }

        console.log('\nЛегенда: ■ — корабль, ✕ — попадание, • — промах');
        console.log(`\n${COLORS.yellow}Статус:${COLORS.reset} ${statusMessage}\n`);
    }
}
