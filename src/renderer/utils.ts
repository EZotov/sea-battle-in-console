import {COLORS} from '../consts';
import {Board} from '../core/elements/board';
import {CellState} from '../types';

export const formatCell = (state: CellState, hideShips: boolean): string => {
    switch (state) {
        case 'empty':
            return `${COLORS.blue}·${COLORS.reset}`;
        case 'ship':
            return hideShips ? `${COLORS.blue}·${COLORS.reset}` : `${COLORS.green}■${COLORS.reset}`;
        case 'hit':
            return `${COLORS.red}✕${COLORS.reset}`;
        case 'miss':
            return `${COLORS.gray}•${COLORS.reset}`;
    }
};

export const formatRow = (fieldSize: number, board: Board, row: number, hideShips: boolean): string => {
    const cells: string[] = [];

    for (let col = 0; col < fieldSize; col++) {
        const state = board.getCell({row, col});
        cells.push(formatCell(state, hideShips));
    }

    return cells.join(' ');
};
