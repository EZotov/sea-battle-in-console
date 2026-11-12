export type CellState = 'empty' | 'ship' | 'hit' | 'miss';

export type ShotResult = 'invalid' | 'repeat' | 'miss' | 'hit' | 'sunk';

export type ShipType = 'boat' | 'destroyer' | 'cruiser' | 'battleship' | 'carrier';

export interface Coordinates {
    row: number;
    col: number;
}
