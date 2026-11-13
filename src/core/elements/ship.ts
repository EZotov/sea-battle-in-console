import {SHIP_NAMES} from '../../consts/index.ts';
import type {Coordinates} from '../../types';

export class Ship {
    public readonly name: string;
    private readonly size: number;
    readonly coords: Coordinates[];
    private hits: number = 0;

    constructor(coords: Coordinates[]) {
        this.coords = coords;
        this.size = coords.length;
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
    occupies(targetCoords: Coordinates): boolean {
        return this.coords.some((coords) => coords.row === targetCoords.row && coords.col === targetCoords.col);
    }
}
