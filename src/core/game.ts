import type {BoardConfig} from './elements/board';

interface GameEngineConfig extends BoardConfig {
    a: string;
}

export class GameEngine {
    constructor(config: GameEngineConfig) {
        this.fieldSize = config.fieldSize;

        // this.playerBoard = new Board(this.fieldSize);
        // this.enemyBoard = new Board(this.fieldSize);
        // this.bot = new Bot(this.fieldSize);
        // this.renderer = new Renderer(this.fieldSize);
    }

    private readonly fieldSize: number;
    // private playerBoard: Board;
    // private enemyBoard: Board;
    // private bot: Bot;
    // private renderer: Renderer;

    renderField(): void {
        // Вызов this.renderer.render(...)
    }

    handleTurn(command: string): void {
        // 1. Парсинг координат (с проверкой, что они в пределах 0..this.fieldSize - 1)
        // 2. Выстрел игрока по enemyBoard
        // 3. Если игрок промахнулся — запуск цикла ходов bot по playerBoard
    }
}
