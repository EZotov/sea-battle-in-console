import {SHIP_NAMES} from '../../consts';
import type {Coordinates} from '../../types';

export class Ship {
    public readonly name: string;
    private readonly size: number;
    readonly cells: Coordinates[];
    private hits: number = 0;

    constructor(cells: Coordinates[]) {
        this.cells = cells;
        this.size = cells.length;
        this.name = SHIP_NAMES[this.size] ?? `${this.size}-палубный корабль`;
    }

    // потоплен ли корабль?
    get isSunk(): boolean {
        return this.hits >= this.size;
    }

    // Попадание
    hit(): void {
        if (this.hits < this.size) {
            this.hits++;
        }
    }

    // занимает ли корабль эту клетку?
    occupies(coords: Coordinates): boolean {
        return this.cells.some((cell) => cell.row === coords.row && cell.col === coords.col);
    }
}
