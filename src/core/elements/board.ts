import type {CellState, Coordinates} from '../../types';
import {Ship} from './ship';

export interface BoardConfig {
    fieldSize: number;
}

export class Board {
    private readonly size: number;
    private grid: CellState[][];
    private ships: Ship[] = [];

    constructor({fieldSize}: BoardConfig) {
        this.size = fieldSize;
        this.grid = this.createEmptyGrid();
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

    setCell({row, col}: Coordinates, state: CellState) {
        this.grid[row][col] = state;
    }

    addShip(ship: Ship): boolean {
        if (!this.canPlaceShip(ship)) {
            return false;
        }

        this.ships.push(ship);

        for (const coords of ship.coords) {
            this.setCell(coords, 'ship');
        }

        return true;
    }

    findShipAt(coords: Coordinates): Ship | null {
        return this.ships.find((ship) => ship.occupies(coords)) ?? null;
    }

    markBufferAroundShip(ship: Ship): void {
        for (const {row, col} of ship.coords) {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const neighbor = {row: row + dr, col: col + dc};

                    if (this.isInside(neighbor) && this.getCell(neighbor) === 'empty') {
                        this.setCell(neighbor, 'miss');
                    }
                }
            }
        }
    }

    private createEmptyGrid(): CellState[][] {
        return Array.from({length: this.size}, () => Array<CellState>(this.size).fill('empty'));
    }

    private canPlaceShip(ship: Ship): boolean {
        for (const coords of ship.coords) {
            if (!this.isInside(coords)) {
                return false;
            }

            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const neighbor = {row: coords.row + dr, col: coords.col + dc};

                    if (this.isInside(neighbor) && this.getCell(neighbor) !== 'empty') {
                        return false;
                    }
                }
            }
        }

        return true;
    }
}
