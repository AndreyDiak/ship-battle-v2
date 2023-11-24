import firebaseService, { DB_PATHS } from '@/app/api/firebase.service';
import { EditFinishModal } from '@/app/components/modals/EditFinishModal';
import { ModalContext } from '@/context/modalContext';
import { EDIT_MODE, EditCell, SHIP_TYPE, Ships } from '@/typings';
import { EMPTY_CELL, SHIPS } from '@/utils';
import { EditConverter } from '@/utils/converters/EditConverter';
import { CellCalculator, shipTypeToLengthMap } from '@/utils/field/CellCalculator';
import { arrayUnion } from 'firebase/firestore';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { MODAL_TITLE } from './modals/useModalLayout';

export const FIELD_SIZE = 100;

const cellsMultiplierMap: Record<EDIT_MODE, number> = {
	[EDIT_MODE.HORIZONTAL]: 1,
	[EDIT_MODE.VERTICAL]: 10,
};

const EMPTY_FIELD = Array(FIELD_SIZE)
	.fill(null)
	.map((_, index) => ({
		...EMPTY_CELL,
		index,
	}));

export interface UseEdit {
	// поле с клетками
	field: EditCell[];
	// размещение по вертикали или горизонтали
	mode: EDIT_MODE;
	// выбранный тип корабля для размещения
	selectedShip: SHIP_TYPE;
	// информация сколько кораблей осталось разместить
	remainingShips: Ships;
	// разместили ли мы все корабли
	isAllShipsPlaced: boolean;
	setSelected(selected: SHIP_TYPE): void;
	setMode(mode: EDIT_MODE): void;
	resetBacklight(): void;
	onClick(index: number): void;
	onMouseOver(index: number): void;
}

export function useEdit(editId: string): UseEdit {
	const { openModal } = useContext(ModalContext)!;

	const [field, setField] = useState<EditCell[]>(EMPTY_FIELD);
	const [remainingShips, setRemainingShips] = useState<Ships>(SHIPS);
	const [ship, setShip] = useState<SHIP_TYPE>(SHIP_TYPE.LARGE);
	const [mode, setMode] = useState<EDIT_MODE>(EDIT_MODE.HORIZONTAL);

	// const getNearbyCells = useCallback(
	// 	(cellsIndexes: number[], activeMode = mode, activeShip = ship) => {
	// 		// cellsIndexes = [0, 1, 2, 3];
	// 		// return => [4, 10, 11, 12, 13];

	// 		const shipLength = shipTypeToLengthMap[activeShip];

	// 		if (shipLength === 1) {
	// 			const pivot = cellsIndexes[0]; // мы имеем только один индекс для однопалубного корабля..
	// 			const left = cellsIndexesSummator(pivot, activeMode, 'outside', 'start');
	// 			const right = cellsIndexesSummator(pivot, activeMode, 'outside', 'end');

	// 			return Array.from(new Set([...left, ...right]));
	// 		} else {
	// 			const left = cellsIndexesSummator(
	// 				cellsIndexes.shift()!,
	// 				activeMode,
	// 				'outside',
	// 				'start',
	// 			);
	// 			const right = cellsIndexesSummator(cellsIndexes.pop()!, activeMode, 'outside', 'end');

	// 			const result = [...left, ...right];

	// 			for (const cellIndex of cellsIndexes) {
	// 				result.push(...cellsIndexesSummator(cellIndex, activeMode, 'central'));
	// 			}

	// 			return result;
	// 		}
	// 	},
	// 	[mode, ship],
	// );

	const fillNeardyCells = useCallback((cells: number[]) => {
		const nearbyCellsSet = new Set(cells);

		setField((prevField) =>
			prevField.map((prevCell, prevIndex) => {
				if (nearbyCellsSet.has(prevIndex)) {
					return {
						...prevCell,
						isFree: false,
					};
				}
				return prevCell;
			}),
		);
	}, []);

	const ableToPlaceShipCheck = useCallback(
		(index: number, activeShip = ship, activeMode = mode): Set<number> | false => {
			// все корабли данного вида уже расставлены
			if (remainingShips[activeShip].left === 0) {
				return false;
			}

			const multiplier = cellsMultiplierMap[activeMode]; // 10 or 1

			const shipLength = shipTypeToLengthMap[activeShip];

			const startCellShipIndex = index;
			// shipLength - 1 cuz we already have 1 cell
			const endCellShipIndex = index + (shipLength - 1) * multiplier;

			// проверка, можно ли поставить корабль в эти клетки
			if (
				endCellShipIndex > FIELD_SIZE - 1 || // вышли за границу
				!field[startCellShipIndex].isFree ||
				!field[endCellShipIndex].isFree ||
				// клетка занята кораблем или находится рядом с ним
				(Math.floor(startCellShipIndex / 10) !== Math.floor(endCellShipIndex / 10) &&
					activeMode === EDIT_MODE.HORIZONTAL)
			) {
				return false;
			}
			const shipCellsIndexes = new Set<number>();

			for (let i = 0; i < shipLength; i++) {
				shipCellsIndexes.add(index + i * multiplier);
			}

			return shipCellsIndexes;
		},
		[field, mode, remainingShips, ship],
	);

	/**
	 * @param index - cell index with start of ship
	 * @param activeShip - active ship type ("big", "small", etc)
	 * @param activeMode - horizontal or vertical
	 * @param needPushToFirebase - need to save ship in DB
	 */
	const onClickHandler = useCallback(
		async (index: number, activeShip = ship, activeMode = mode, needPushToFirebase = true) => {
			const cells = ableToPlaceShipCheck(index, activeShip, activeMode);

			if (!cells) {
				return;
			}

			// заполняем ячейки вокруг корабля
			fillNeardyCells(CellCalculator.getAllNeighbors(Array.from(cells)));

			const updatedShipLeftValue = remainingShips[activeShip].left - 1;

			// если у нас кончились корабли данного вида, для удобства выбираем первый свободный...
			if (updatedShipLeftValue === 0) {
				for (const key in remainingShips) {
					if (key !== activeShip && remainingShips[key as SHIP_TYPE].left !== 0) {
						setShip(key as SHIP_TYPE);
						break;
					}
				}
			}

			// нельзя вынести в отдельную переменную так-как реакт не обновит
			setField((prevField) =>
				prevField.map((prevCell, prevIndex) => {
					if (cells.has(prevIndex)) {
						return {
							...prevCell,
							isFree: false,
							isShip: true,
						};
					}
					return prevCell;
				}),
			);

			setRemainingShips((prevShips) => ({
				...prevShips,
				[activeShip]: {
					left: updatedShipLeftValue,
				},
			}));

			if (!needPushToFirebase) return;
			// сохраняем индексы нашего корабля в бд...
			await firebaseService.updateDoc(
				DB_PATHS.PLACEMENTS,
				{
					ships: arrayUnion({
						type: activeShip,
						indexes: Array.from(cells),
					}),
				},
				editId,
			);
		},
		[ableToPlaceShipCheck, ship, editId, fillNeardyCells, mode, remainingShips],
	);

	const resetBacklight = useCallback(() => {
		setField((prevField) =>
			prevField.map((prevCell) => {
				if (prevCell.isBacklighted) {
					return {
						...prevCell,
						isBacklighted: false,
					};
				}

				return prevCell;
			}),
		);
	}, []);

	const onMouseOverHandler = useCallback(
		(index: number) => {
			const cells = ableToPlaceShipCheck(index);

			if (!cells) {
				resetBacklight();
				return;
			}

			const updatedField = field.slice().map((prevCell, prevIndex) => {
				if (cells.has(prevIndex)) {
					return {
						...prevCell,
						isBacklighted: true,
					};
				}

				return {
					...prevCell,
					isBacklighted: false,
				};
			});

			setField(updatedField);
		},
		[ableToPlaceShipCheck, field, resetBacklight],
	);

	const onLoadData = useCallback(async () => {
		const rawEditData = await firebaseService.getDoc(DB_PATHS.PLACEMENTS, editId);

		if (!rawEditData) return;

		const editData = EditConverter.convertFromApi(rawEditData);

		const { ships } = editData;

		if (!ships || ships.length === 0) return;

		ships.forEach((ship) => {
			const cells = ship.indexes.sort();

			const { type } = ship;

			const mode =
				cells.length === 1
					? EDIT_MODE.VERTICAL
					: cells[1] - cells[0] === 1
					? EDIT_MODE.HORIZONTAL
					: EDIT_MODE.VERTICAL;
			// Делаем синтетические нажатия за пользователя с теми кораблями, которые уже были расставленны ранее
			onClickHandler(cells[0], type, mode, false);
		});
		// TODO @raymix
		// возможно из-за того что useEffect 2 раза вызывается
		// из-за ререндра теряется синхронизация в подсчете оставшихся кораблей
		// поэтому пока делаем принудительное присваивание...

		// считаем сколько и каких кораблей мы поставили

		const placedShipCounter = ships.reduce((acc, item) => {
			acc[item.type] = (acc[item.type] || 0) + 1;
			return acc;
		}, {} as Partial<Record<SHIP_TYPE, number>>);

		// пробегаемся и обновляем сколько осталось поставить кораблей каждого типа
		const updatedRemainingShips = Object.keys(SHIPS).reduce((acc, shipType) => {
			acc[shipType as SHIP_TYPE] = {
				left:
					SHIPS[shipType as SHIP_TYPE].left - (placedShipCounter[shipType as SHIP_TYPE] ?? 0),
			};

			return acc;
		}, {} as Ships);

		setRemainingShips(updatedRemainingShips);
	}, [editId, onClickHandler]);

	const onReadyHandler = useCallback(async () => {
		const editRawData = await firebaseService.getDoc(DB_PATHS.PLACEMENTS, editId);
		if (!editRawData) return;

		await firebaseService.updateDoc(
			DB_PATHS.GAMES,
			{
				placements_ids: arrayUnion(editId),
			},
			editRawData.game_id,
		);

		openModal({
			title: MODAL_TITLE.EDIT,
			children: <EditFinishModal />,
		});
	}, [editId, openModal]);

	const isAllShipsPlaced = useMemo(() => {
		return Object.values(remainingShips).reduce((acc, { left }) => acc + left, 0) === 0;
	}, [remainingShips]);

	/**
	 * Отработка хендлера когда все корабли расставлены
	 */
	useEffect(() => {
		if (isAllShipsPlaced) {
			onReadyHandler();
		}
	}, [isAllShipsPlaced, onReadyHandler]);

	/**
	 * Когда мы грузим страничку в первый раз то проверяем, расставлял ли
	 * пользователь уже корабли, и если да, то ставим их на поле
	 */
	useEffect(() => {
		onLoadData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return {
		field,
		mode,
		selectedShip: ship,
		remainingShips,
		isAllShipsPlaced,
		setMode,
		setSelected: setShip,
		resetBacklight,
		onClick: onClickHandler,
		onMouseOver: onMouseOverHandler,
	};
}
