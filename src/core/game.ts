import {Enemy} from '../enemy';
import {ConsoleRenderer} from '../renderer/console-renderer';
import {Coordinates, ShotResult} from '../types';
import {Board, type BoardConfig} from './elements/board';

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

        this.playerBoard = new Board(this.fieldSize);
        this.enemyBoard = new Board(this.fieldSize);
        this.enemy = new Enemy();
        this.consoleRenderer = new ConsoleRenderer(this.fieldSize);
    }

    renderField(): void {
        this.consoleRenderer.render(this.playerBoard, this.enemyBoard, this.statusMessage);
    }

    playerTurn(command: string): void {
        if (this.isGameOver) {
            return;
        }
        // 1. Парсинг координат (с проверкой, что они в пределах 0..this.fieldSize - 1)
        const turnCoords = this.consoleRenderer.parseCoordinates(command);

        if (!turnCoords) {
            console.log('Неверный формат! Введите букву и число в пределах поля.');
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

    private enemyTurn(): void {
        let enemyTurn = true;

        const turnLogs: string[] = ['Вы промахнулись.'];

        while (enemyTurn && !this.isGameOver) {
            const nextTargetCoords = this.enemy.getNextShot(this.enemyBoard);
            const shotResult = this.processShot(this.playerBoard, nextTargetCoords);

            this.enemy.registerShotResult(this.enemyBoard, nextTargetCoords, shotResult);

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
}
