import { FIELD_SIZE } from '@/hooks';
import { EDIT_MODE, SHIP_TYPE, Ships } from '@/typings';

export const shipTypeToLengthMap: Record<SHIP_TYPE, number> = {
	[SHIP_TYPE.LARGE]: 4,
	[SHIP_TYPE.BIG]: 3,
	[SHIP_TYPE.MEDIUM]: 2,
	[SHIP_TYPE.SMALL]: 1,
};

const NEARBY_CENTRAL_INDEXES: Record<EDIT_MODE, number[]> = {
	[EDIT_MODE.HORIZONTAL]: [-10, 10],
	[EDIT_MODE.VERTICAL]: [-1, 1],
};

const NEARBY_OUTSIDE_INDEXES: Record<EDIT_MODE, { start: number[]; end: number[] }> = {
	[EDIT_MODE.HORIZONTAL]: {
		start: [-10, 10, -1, -11, 9],
		end: [-10, 10, 1, -9, 11],
	},
	[EDIT_MODE.VERTICAL]: {
		start: [-10, -1, 1, -11, -9],
		end: [10, -1, 1, 11, 9],
	},
};

export class CellCalculator {
	/**
	 * Получаем все индексы, которые необходимо закрасить
	 * @param pivot - индекс, относительно которого мы хотим найти соседние клетки
	 * @param mode - вертикаль/горизонталь
	 * @param status - позиция клетки в корабле (крайняя - центральная)
	 * @returns - массив валидных клеток
	 */
	// getNeighbors(pivot: number, mode: EDIT_MODE, status: 'central' | 'outside'): number[];
	protected static getNeighbors(
		pivot: number,
		mode: EDIT_MODE,
		status: 'central' | 'outside',
		optional?: 'start' | 'end',
	): number[] {
		const indexes: number[] =
			status === 'outside'
				? NEARBY_OUTSIDE_INDEXES[mode][optional!]
				: NEARBY_CENTRAL_INDEXES[mode];

		return indexes
			.map((index) => pivot + index)
			.filter((index) => {
				// если индекс вышел за границу поля
				if (index < 0 || index > FIELD_SIZE - 1) {
					return false;
				}

				// проверка крайних индексов
				if ((pivot % 10 === 0 && index % 10 === 9) || (pivot % 10 === 9 && index % 10 === 0)) {
					return false;
				}

				return true;
			});
	}

	/**
	 * Получаем все соседние индексы, которые мы должны закрасить при потоплении корабля
	 * @param cellsIndexes - индексы корабля
	 * @param mode - вертикаль/горизонталь
	 * @param ship - тип корабля
	 * @returns массив индексов вокруг корабля для закрашивания
	 */
	public static getAllNeighbors(
		cellsIndexes: number[],
		mode: EDIT_MODE,
		ship: SHIP_TYPE,
	): number[] {
		// если корабль однопалубный
		if (ship === SHIP_TYPE.SMALL) {
			// мы имеем только один индекс для однопалубного корабля..
			const pivot = cellsIndexes[0];
			const left = this.getNeighbors(pivot, mode, 'outside', 'start');
			const right = this.getNeighbors(pivot, mode, 'outside', 'end');

			return Array.from(new Set([...left, ...right]));
		}

		// как минимум, двухпалубный корабль
		const left = this.getNeighbors(cellsIndexes.shift()!, mode, 'outside', 'start');
		const right = this.getNeighbors(cellsIndexes.pop()!, mode, 'outside', 'end');

		const result = [...left, ...right];

		for (const cellIndex of cellsIndexes) {
			result.push(...this.getNeighbors(cellIndex, mode, 'central'));
		}

		return result;
	}
}
