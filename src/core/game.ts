import {setTimeout} from 'node:timers/promises';

import {FLEET_CONFIG} from '../consts';
import {Enemy} from '../enemy';
import {ConsoleRenderer} from '../renderer/console-renderer';
import {Coordinates, ShotResult} from '../types';
import {Board, type BoardConfig} from './elements/board';
import {Ship} from './elements/ship';

export class GameEngine {
    private readonly fieldSize: number;
    private playerBoard: Board;
    private enemyBoard: Board;
    private enemy: Enemy;
    private consoleRenderer: ConsoleRenderer;
    private statusMessage = 'Ваш ход! Введите координаты (например, А1).';
    isGameOver: boolean = false;

    constructor(config: BoardConfig) {
        this.fieldSize = config.fieldSize;

        this.playerBoard = new Board({
            fieldSize: this.fieldSize,
        });
        this.enemyBoard = new Board({
            fieldSize: this.fieldSize,
        });
        this.enemy = new Enemy();
        this.consoleRenderer = new ConsoleRenderer(this.fieldSize);

        this.randomShipPlacement(this.playerBoard);
        this.randomShipPlacement(this.enemyBoard);
    }

    renderField() {
        this.consoleRenderer.render(this.playerBoard, this.enemyBoard, this.statusMessage);
    }

    playerTurn(command: string) {
        if (this.isGameOver) {
            return;
        }

        const turnCoords = this.consoleRenderer.parseCoordinates(command);

        if (!turnCoords) {
            this.statusMessage = 'Неверный формат! Введите букву и число в пределах поля.';
            return;
        }

        const playerShotResult = this.processShot(this.enemyBoard, turnCoords);

        if (playerShotResult === 'repeat') {
            this.statusMessage = 'Вы уже стреляли в эту клетку! Выберите другую.';
            return;
        }

        if (!this.enemyBoard.hasAliveShips) {
            this.statusMessage = 'ПОБЕДА! Вы потопили весь флот противника!';
            this.isGameOver = true;
            return;
        }

        if (playerShotResult === 'hit' || playerShotResult === 'sunk') {
            this.statusMessage =
                playerShotResult === 'sunk'
                    ? 'Корабль противника потоплен! Стреляйте еще раз.'
                    : 'Попадание! Стреляйте еще раз.';
            return;
        }

        this.enemyTurn();
    }

    private async enemyTurn() {
        let enemyTurn = true;

        const turnLogs: string[] = ['Вы промахнулись.'];

        while (enemyTurn && !this.isGameOver) {
            const nextTargetCoords = this.enemy.getNextShot(this.playerBoard);
            this.statusMessage = 'Противник думает...';
            this.renderField();

            await setTimeout(1000);

            const shotResult = this.processShot(this.playerBoard, nextTargetCoords);

            this.enemy.registerShotResult(this.playerBoard, nextTargetCoords, shotResult);

            if (shotResult === 'miss') {
                turnLogs.push('Противник промахнулся. Ваш ход!');
                enemyTurn = false;
            } else if (shotResult === 'hit') {
                turnLogs.push('Противник попал в ваш корабль!');
            } else if (shotResult === 'sunk') {
                turnLogs.push('Противник потопил ваш корабль!');
            }

            if (!this.playerBoard.hasAliveShips) {
                this.statusMessage = 'ПОРАЖЕНИЕ! Противник уничтожил весь ваш флот.';
                this.isGameOver = true;
                enemyTurn = false;
            }
        }

        if (!this.isGameOver) {
            this.statusMessage = turnLogs.join(' ');
        }
    }

    private processShot(targetBoard: Board, coords: Coordinates): ShotResult {
        if (!targetBoard.isInside(coords)) {
            return 'invalid';
        }

        const targetCell = targetBoard.getCell(coords);

        if (targetCell === 'hit' || targetCell === 'miss') {
            return 'repeat';
        }

        if (targetCell === 'empty') {
            targetBoard.setCell(coords, 'miss');
            return 'miss';
        }

        const ship = targetBoard.findShipAt(coords);

        if (!ship) {
            targetBoard.setCell(coords, 'miss');
            return 'miss';
        }

        targetBoard.setCell(coords, 'hit');
        ship.hit();

        if (ship.isSunk) {
            targetBoard.markBufferAroundShip(ship);
            return 'sunk';
        }

        return 'hit';
    }

    private randomShipPlacement(targetBoard: Board, maxAttempts = 250) {
        let isPlacedAll = false;

        while (!isPlacedAll) {
            targetBoard.reset();
            isPlacedAll = true;

            for (const shipSize of FLEET_CONFIG) {
                let isShipPlaced = false;

                for (let attempt = 0; attempt < maxAttempts; attempt++) {
                    const isHorizontal = Math.random() < 0.5;
                    const startRow = Math.floor(Math.random() * this.fieldSize);
                    const startCol = Math.floor(Math.random() * this.fieldSize);

                    const cells: Coordinates[] = [];

                    for (let i = 0; i < shipSize; i++) {
                        const row = isHorizontal ? startRow : startRow + i;
                        const col = isHorizontal ? startCol + i : startCol;
                        cells.push({row, col});
                    }

                    const addedState = targetBoard.addShip(new Ship(cells));

                    if (addedState) {
                        isShipPlaced = true;
                        break;
                    }
                }

                if (!isShipPlaced) {
                    isPlacedAll = false;
                    break;
                }
            }
        }
    }
}
