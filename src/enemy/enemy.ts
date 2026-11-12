import {Coordinates, ShotResult} from '../types';
import {toKey} from './utils';

export class Enemy {
    private readonly fieldSize: number;
    private readonly shotHistory = new Set<string>();
    private targetQueue: Coordinates[] = [];
    private currentHits: Coordinates[] = [];

    constructor(fieldSize: number) {
        this.fieldSize = fieldSize;
    }

    // Возвращает координаты следующего выстрела
    getNextShot(): Coordinates {
        while (this.targetQueue.length > 0) {
            const next = this.targetQueue.shift()!;
            if (this.isValidTarget(next)) {
                return next;
            }
        }

        const smartPool: Coordinates[] = [];
        const fallbackPool: Coordinates[] = [];

        for (let row = 0; row < this.fieldSize; row++) {
            for (let col = 0; col < this.fieldSize; col++) {
                const coords = {row, col};
                if (this.isValidTarget(coords)) {
                    fallbackPool.push(coords);
                    if ((row + col) % 2 === 0) {
                        smartPool.push(coords);
                    }
                }
            }
        }

        const pool = smartPool.length > 0 ? smartPool : fallbackPool;
        const randomIndex = Math.floor(Math.random() * pool.length);
        return pool[randomIndex];
    }

    // Принимает результат выстрела от GameEngine и обновляет стратегию
    registerShotResult(coords: Coordinates, result: ShotResult): void {
        this.shotHistory.add(toKey(coords));

        if (result === 'hit') {
            this.currentHits.push(coords);
            this.updateTargetQueue();
        } else if (result === 'sunk') {
            this.currentHits.push(coords);
            this.markBufferAroundSunkShip();
            this.currentHits = [];
            this.targetQueue = [];
        }
    }

    updateTargetQueue(): void {
        if (this.currentHits.length === 1) {
            const {row, col} = this.currentHits[0];
            const neighbors: Coordinates[] = [
                {row: row - 1, col},
                {row: row + 1, col},
                {row, col: col - 1},
                {row, col: col + 1},
            ];
            this.targetQueue = neighbors.filter((c) => this.isValidTarget(c));
            return;
        }

        const isHorizontal = this.currentHits[0].row === this.currentHits[1].row;

        if (isHorizontal) {
            const row = this.currentHits[0].row;
            const cols = this.currentHits.map((c) => c.col);
            this.targetQueue = [
                {row, col: Math.min(...cols) - 1},
                {row, col: Math.max(...cols) + 1},
            ].filter((c) => this.isValidTarget(c));
        } else {
            const col = this.currentHits[0].col;
            const rows = this.currentHits.map((c) => c.row);
            this.targetQueue = [
                {row: Math.min(...rows) - 1, col},
                {row: Math.max(...rows) + 1, col},
            ].filter((c) => this.isValidTarget(c));
        }
    }

    markBufferAroundSunkShip(): void {
        for (const hit of this.currentHits) {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const neighbor = {row: hit.row + dr, col: hit.col + dc};

                    if (this.isInside(neighbor)) {
                        this.shotHistory.add(toKey(neighbor));
                    }
                }
            }
        }
    }

    // Сброс памяти бота (пригодится для рестарта партии)
    reset(): void {
        this.shotHistory.clear();
        this.targetQueue = [];
        this.currentHits = [];
    }

    private isValidTarget(coords: Coordinates): boolean {
        return this.isInside(coords) && !this.shotHistory.has(toKey(coords));
    }

    private isInside({row, col}: Coordinates): boolean {
        return row >= 0 && row < this.fieldSize && col >= 0 && col < this.fieldSize;
    }
}
