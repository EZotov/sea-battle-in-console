import {Board} from '../core/elements/board';
import {Coordinates} from '../types';

export const isValidTarget = (targetBoard: Board, coords: Coordinates): boolean => {
    if (!targetBoard.isInside(coords)) {
        return false;
    }

    const cell = targetBoard.getCell(coords);

    return cell !== 'hit' && cell !== 'miss';
};
