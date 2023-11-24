import firebaseService, { DB_PATHS } from '@/app/api/firebase.service';
import { GameConverter } from '@/utils/converters/GameConverter';
import { useAuth, useDoc } from '..';
import { MyCell, useMyField } from './useMyField';
import { OpponentCell, useOpponentField } from './useOpponentField';
import { useProfile } from '../useProfile';
import { FieldValue, arrayUnion, increment, where } from 'firebase/firestore';
import { useCallback } from 'react';
import { CellCalculator } from '@/utils/field/CellCalculator';

interface UseGameById {
	myField: MyCell[];
	opponentField: OpponentCell[];
	isUserTurn: boolean;
	onClick(index: number): void;
}

export function useGameById(gameID: string): UseGameById {
	const {
		user: { id: userID },
	} = useProfile();

	/**
	 * Подписываемся на изменения в игре
	 */
	const { value: rawGameData, loading, error } = useDoc(DB_PATHS.GAMES, gameID);

	const gameData = GameConverter.convertFromApi(rawGameData);

	const { usersIds, currentTurn } = gameData;

	const opponentID = usersIds && (usersIds[0] === userID ? usersIds[1] : usersIds[0]);

	// получаем информацию по полю противника...
	const {
		field: opponentField,
		fieldID: opponentFieldID,
		updateFieldByClick,
	} = useOpponentField(gameID, opponentID!);

	// получаем информацию о своем поле...
	const { field: myField } = useMyField(gameID);

	const isUserTurn = currentTurn === userID;

	const onClick = useCallback(
		async (index: number) => {
			/**
			 * Добавляем ход в историю ходов в игре...
			 */
			await firebaseService.updateDoc(
				DB_PATHS.GAMES,
				{
					turns: arrayUnion({
						index,
						owner_id: userID,
					}),
				},
				gameID,
			);
			/**
			 * Запрашиваем расстановку соперника, и узнаем, попали ли мы в корабль...
			 */
			const rawPlacement = await firebaseService.getFirstDoc(
				DB_PATHS.PLACEMENTS,
				where('game_id', '==', gameID),
				where('owner_id', '==', opponentID),
			);

			if (!rawPlacement) return;

			// мы знаем, что точно есть корабли...
			const shipIndexes = rawPlacement.ships!.map((data) => data.indexes).flat();

			const shipIndexesSet = new Set(shipIndexes);

			if (shipIndexesSet.has(index)) {
				// если попали в корабль
				await firebaseService.updateDoc(
					DB_PATHS.FIELDS,
					{
						touched_cells_with_ship: arrayUnion(index),
					},
					opponentFieldID!,
				);
				/**
				 * Получаем все индексы корабля, который мы подбили...
				 */
				const shipCellsIndexes = rawPlacement.ships?.find((data) =>
					data.indexes.includes(index),
				)!.indexes!;

				/**
				 * Получаем все индексы, с попаданиями по кораблям
				 * и делаем из них set
				 */
				const rawOpponentField = await firebaseService.getDoc(
					DB_PATHS.FIELDS,
					opponentFieldID!,
				);

				if (!rawOpponentField) return;

				const allTouchedCellsWithShipSet = new Set(rawOpponentField.touched_cells_with_ship);

				const isShipDefeated = shipCellsIndexes?.every((index) =>
					allTouchedCellsWithShipSet.has(index),
				);

				if (!isShipDefeated) return;

				// если уничтожили корабль...
				const indexesToTouch = CellCalculator.getAllNeighbors(shipCellsIndexes);
				// обновлеям прорисовку карты оппонента, (закрашиваем все соседние клетки)...
				updateFieldByClick(indexesToTouch);

				// уменьшаем количество оставшихся кораблей противника...
				await firebaseService.updateDoc(
					DB_PATHS.FIELDS,
					{
						ships_remaining: increment(-1),
					},
					opponentFieldID!,
				);
			} else {
				// если не попали...
				await firebaseService.updateDoc(
					DB_PATHS.FIELDS,
					{
						touched_cells_without_ship: arrayUnion(index),
					},
					opponentFieldID!,
				);
				// передаем ход противнику...
				await firebaseService.updateDoc(
					DB_PATHS.GAMES,
					{
						current_turn: opponentID!,
					},
					gameID,
				);
			}
		},
		[gameID, opponentFieldID, opponentID, updateFieldByClick, userID],
	);

	return {
		myField,
		opponentField,
		isUserTurn,
		onClick,
	};
}
