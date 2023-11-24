import { useState, useEffect, useCallback } from 'react';
import { FIELD_SIZE, useFirstDoc } from '..';
import { DB_PATHS } from '@/app/api/firebase.service';
import { where } from 'firebase/firestore';
import { FieldConverter } from '@/utils/converters/FieldConverter';

export interface OpponentCell {
	// находится ли корабль в этой клетке
	isShip: boolean;
	// коснулись ли мы этой клетки
	isTouched: boolean;
	// индекс клетки
	index: number;
}

const EMPTY_FIELD: OpponentCell[] = Array(FIELD_SIZE)
	.fill(null)
	.map((_, index) => ({
		index,
		isShip: false,
		isTouched: false,
	}));

export function useOpponentField(gameID: string, opponentID: string) {
	const { value: rawDBField } = useFirstDoc(
		DB_PATHS.FIELDS,
		where('game_id', '==', gameID),
		where('owner_id', '==', opponentID),
	);

	const [field, setField] = useState(EMPTY_FIELD);

	const updateField = useCallback(() => {
		if (!rawDBField) return;
		const DBfield = FieldConverter.convertFromApi(rawDBField);

		let updatedField = [...field];

		DBfield.touchedCellsWithoutShip?.forEach((cellIndex) => {
			updatedField[cellIndex].isTouched = true;
		});

		/**
		 * TODO @raymix подумать как закрашивать клетки вокруг, если мы уничтожили корабль...
		 */
		DBfield.touchedCellsWithShip?.forEach((cellIndex) => {
			updatedField[cellIndex].isTouched = true;
			updatedField[cellIndex].isShip = true;
		});

		setField(updatedField);
	}, [field, rawDBField]);

	const updateFieldByClick = useCallback(
		(cellsIndexes: number[]) => {
			let updatedField = [...field];
			cellsIndexes.forEach((cellIndex) => {
				updatedField[cellIndex].isTouched = true;
			});
			setField(updatedField);
		},
		[field],
	);

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
		fieldID: rawDBField?.id,
		updateFieldByClick,
	};
}
