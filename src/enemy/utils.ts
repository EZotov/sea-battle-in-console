import {Coordinates} from '../types';

export const toKey = ({row, col}: Coordinates): string => `${row},${col}`;
