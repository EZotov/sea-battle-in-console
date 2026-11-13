import {Board} from '../core/elements/board';
import {Coordinates, ShotResult} from '../types';
import {isValidTarget} from './utils';

export class Enemy {
    private targetQueue: Coordinates[] = [];
    private currentHits: Coordinates[] = [];

    // Возвращает координаты следующего выстрела
    getNextShot(playerBoard: Board): Coordinates {
        while (this.targetQueue.length > 0) {
            const next = this.targetQueue.shift();

            if (next && isValidTarget(playerBoard, next)) {
                return next;
            }
        }

        const smartPool: Coordinates[] = [];
        const fallbackPool: Coordinates[] = [];

        const size = playerBoard.fieldSize;

        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const coords = {row, col};

                if (isValidTarget(playerBoard, coords)) {
                    fallbackPool.push(coords);

                    if ((row + col) % 2 === 0) {
                        smartPool.push(coords);
                    }
                }
            }
        }

        const pool = smartPool.length > 0 ? smartPool : fallbackPool;
        const randomIndex = Math.floor(Math.random() * pool.length);
        const target = pool[randomIndex];

        if (!target) {
            throw new Error('На доске не осталось доступных клеток для выстрела');
        }

        return target;
    }

    // Принимает результат выстрела от GameEngine и обновляет стратегию
    registerShotResult(targetBoard: Board, coords: Coordinates, result: ShotResult): void {
        if (result === 'hit') {
            this.currentHits.push(coords);
            this.updateTargetQueue(targetBoard);
        } else if (result === 'sunk') {
            this.currentHits = [];
            this.targetQueue = [];
        }
    }

    // Сброс памяти бота (пригодится для рестарта партии)
    reset(): void {
        this.targetQueue = [];
        this.currentHits = [];
    }

    private updateTargetQueue(targetBoard: Board): void {
        // Первое попадание
        const firstHit = this.currentHits[0];

        if (!firstHit) {
            return;
        }

        if (this.currentHits.length === 1) {
            const {row, col} = firstHit;

            const neighbors: Coordinates[] = [
                {row: row - 1, col},
                {row: row + 1, col},
                {row, col: col - 1},
                {row, col: col + 1},
            ];

            this.targetQueue = neighbors.filter((coordsItem) => isValidTarget(targetBoard, coordsItem));
            return;
        }

        // Второе попадание. Понимаем ориентацию корабля
        const secondHit = this.currentHits[1];

        if (!secondHit) {
            return;
        }

        let targetCandidates;

        const isHorizontal = firstHit.row === secondHit.row;

        if (isHorizontal) {
            const row = firstHit.row;
            const cols = this.currentHits.map((coords) => coords.col);

            targetCandidates = [
                {row, col: Math.min(...cols) - 1},
                {row, col: Math.max(...cols) + 1},
            ];
        } else {
            const col = firstHit.col;
            const rows = this.currentHits.map((coords) => coords.row);

            targetCandidates = [
                {row: Math.min(...rows) - 1, col},
                {row: Math.max(...rows) + 1, col},
            ];
        }

        this.targetQueue = targetCandidates.filter((coordsItem) => isValidTarget(targetBoard, coordsItem));
    }
}
