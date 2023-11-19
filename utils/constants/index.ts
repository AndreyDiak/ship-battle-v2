import { EditCell, SHIP_TYPE, Ships } from '@/typings';

export const FIELD = {
	NUMBERS: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
	LETTERS: ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'З', 'И', 'К'],
};

export const EMPTY_CELL: EditCell = {
	isShip: false,
	isFree: true,
	isBacklighted: false,
	index: null,
};

export const SHIPS: Ships = {
	[SHIP_TYPE.LARGE]: { left: 1 },
	[SHIP_TYPE.BIG]: { left: 2 },
	[SHIP_TYPE.MEDIUM]: { left: 3 },
	[SHIP_TYPE.SMALL]: { left: 4 },
};
