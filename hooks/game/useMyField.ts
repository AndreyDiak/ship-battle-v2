import { useState, useEffect, useCallback } from 'react';
import { FIELD_SIZE, useAuth, useFirstDoc } from '..';
import { DB_PATHS } from '@/app/api/firebase.service';
import { where } from 'firebase/firestore';
import { FieldConverter } from '@/utils/converters/FieldConverter';
import { EditConverter } from '@/utils/converters/EditConverter';
import { EDIT_MODE, SHIP_TYPE } from '@/typings';
import { CellCalculator } from '@/utils/field/CellCalculator';

export interface MyCell {
	// находится ли корабль в этой клетке
	isShip: boolean;
	// коснулся ли противник этой клетки
	isTouched: boolean;
	// индекс клетки
	index: number;

	/**
	 * Дальше идут типы только для клетки
	 * где есть корабль
	 */

	// тип корабля
	type?: SHIP_TYPE;
	// индексы всех клеток, где находится данные корабль
	shipCellsIndexes?: number[];
	// убит ли наш корабль...
	// мы должны как-то прыгать от этого и закрашивать соседние клетки
	isDead?: boolean;
}

const EMPTY_FIELD: MyCell[] = Array(FIELD_SIZE)
	.fill(null)
	.map((_, index) => ({
		index,
		isShip: false,
		isTouched: false,
	}));

export function useMyField(gameID: string) {
	const {
		userData: { user },
	} = useAuth();

	const { userID } = user!;

	const { value: rawDBField } = useFirstDoc(
		DB_PATHS.FIELDS,
		where('game_id', '==', gameID),
		where('owner_id', '==', userID),
	);

	const { value: rawDBPlacement } = useFirstDoc(
		DB_PATHS.PLACEMENTS,
		where('game_id', '==', gameID),
		where('owner_id', '==', userID),
	);

	const [field, setField] = useState(EMPTY_FIELD);

	const updateField = useCallback(() => {
		if (!rawDBField || !rawDBPlacement) return;
		const DBfield = FieldConverter.convertFromApi(rawDBField);

		const DBplacement = EditConverter.convertFromApi(rawDBPlacement);

		let updatedField = [...field];

		// размещаем корабли игрока...
		DBplacement.ships?.forEach((ship) => {
			ship.indexes.forEach((index) => {
				updatedField[index].isShip = true;
				updatedField[index].isDead = false;
				updatedField[index].type = ship.type;
				updatedField[index].shipCellsIndexes = ship.indexes;
			});
		});

		// проставляем клетки без попадания по кораблям
		DBfield.touchedCellsWithoutShip?.forEach((cellIndex) => {
			updatedField[cellIndex].isTouched = true;
		});

		// проставляем клетки с попаданиям по кораблям
		DBfield.touchedCellsWithShip?.forEach((cellIndex) => {
			updatedField[cellIndex].isTouched = true;

			const shipIndexes = updatedField[cellIndex].shipCellsIndexes!;

			const isDead = shipIndexes.every((index) => updatedField[index].isTouched);

			if (isDead) {
				shipIndexes.forEach((index) => {
					updatedField[index].isDead = true;
				});

				const mode =
					shipIndexes.length === 1
						? EDIT_MODE.VERTICAL
						: shipIndexes[1] - shipIndexes[0] === 1
						? EDIT_MODE.HORIZONTAL
						: EDIT_MODE.VERTICAL;

				// получаем все клетки, который надо закрасить вокруг
				const cellsToFill = CellCalculator.getAllNeighbors(
					shipIndexes,
					mode,
					updatedField[cellIndex].type!,
				);

				cellsToFill.forEach((index) => {
					updatedField[index].isTouched = true;
				});
			}
		});

		setField(updatedField);
	}, [field, rawDBField, rawDBPlacement]);

	/**
	 * Вызываем обновление поля, только если у нас что-то поменялось в коллекции
	 * Возможно, стоит добавить кеширование, чтобы полность не перезаписывать все поле
	 */
	useEffect(() => {
		updateField();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [rawDBField]);

	return {
		field,
	};
}
