import type {CellState, Coordinates} from '../../types';
import {Ship} from './ship';

export interface BoardConfig {
    fieldSize: number;
    fleetConfig: number[];
}

export class Board {
    private readonly size: number;
    private grid: CellState[][];
    private ships: Ship[] = [];

    constructor(size: number) {
        this.size = size;
        this.grid = this.createEmptyGrid();
    }

    private createEmptyGrid(): CellState[][] {
        return Array.from({length: this.size}, () => Array<CellState>(this.size).fill('empty'));
    }

    get fieldSize(): number {
        return this.size;
    }

    get aliveShipsCount(): number {
        return this.ships.filter((ship) => !ship.isSunk).length;
    }

    get hasAliveShips(): boolean {
        return this.ships.some((ship) => !ship.isSunk);
    }

    reset(): void {
        this.grid = this.createEmptyGrid();
        this.ships = [];
    }

    isInside({row, col}: Coordinates): boolean {
        return row >= 0 && row < this.size && col >= 0 && col < this.size;
    }

    getCell({row, col}: Coordinates): CellState {
        return this.grid[row][col];
    }

    setCell({row, col}: Coordinates, state: CellState): void {
        this.grid[row][col] = state;
    }

    addShip(ship: Ship): void {
        this.ships.push(ship);

        for (const coords of ship.cells) {
            this.setCell(coords, 'ship');
        }
    }

    findShipAt(coords: Coordinates): Ship | null {
        return this.ships.find((ship) => ship.occupies(coords)) ?? null;
    }
}
