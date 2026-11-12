import {stdin as input, stdout as output} from 'node:process';
import readline from 'node:readline/promises';

import {GameEngine} from './core/game';

async function main(): Promise<void> {
    const rl = readline.createInterface({input, output});

    console.clear();
    console.log('=== МОРСКОЙ БОЙ ===');

    try {
        const sizeField = await rl.question('Введите размер поля (от 6 до 19): ');
        const sizeFieldInt = Number(sizeField.trim());

        if (!Number.isInteger(sizeFieldInt) || sizeFieldInt <= 5 || sizeFieldInt >= 20) {
            console.log('Некорректный размер поля.');
            return;
        }

        const engine = new GameEngine({fieldSize: sizeFieldInt, a: '', fleetConfig: []});
        let isRunning = true;

        while (isRunning) {
            engine.renderField();

            const command = await rl.question('Введите координаты (или "exit" для выхода): ');

            if (command.trim().toLowerCase() === 'exit') {
                isRunning = false;
                continue;
            }

            engine.handleTurn(command);
        }
    } catch {
        console.log('\nВыход из игры...');
    } finally {
        console.log('Игра завершена.');
        rl.close();
    }
}

main();
