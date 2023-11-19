import { FirebaseInstance } from '.';
import { ToCamelCase } from './utils';

export interface Ship {
	// сколько еще кораблей данного типа мы можем разместить
	left: number;
}

export enum EDIT_MODE {
	VERTICAL = 'vertical',
	HORIZONTAL = 'horizontal',
}

export enum SHIP_TYPE {
	LARGE = 'large',
	BIG = 'big',
	MEDIUM = 'medium',
	SMALL = 'small',
}

export type Ships = Record<SHIP_TYPE, Ship>;

export interface EditCell {
	// есть ли в клетке корабль...
	isShip: boolean;
	// можно ли поместить корабль в клетку...
	isFree: boolean;
	// нужно ли подсвечивать клетку (при наведении курсором) . . .
	isBacklighted: boolean;
	// индекс клетки . . .
	index: null | number;
}

/**
 * Edit Interface
 * Будем хранить позиции кораблей как массив, с массивами индексов
 */
interface FirebaseEditInstance {
	owner_id: string;
	game_id: string;
	ships?: {
		type: SHIP_TYPE;
		indexes: number[];
	}[];
}

type EditInstance = ToCamelCase<FirebaseEditInstance>;

export type N_Edit = FirebaseEditInstance;
export type F_Edit = FirebaseEditInstance & FirebaseInstance;
export type Edit = EditInstance & FirebaseInstance;
