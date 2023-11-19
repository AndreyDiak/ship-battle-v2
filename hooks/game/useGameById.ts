import { DB_PATHS } from '@/app/api/firebase.service';
import { GameConverter } from '@/utils/converters/GameConverter';
import { useAuth, useDoc } from '..';
import { MyCell, useMyField } from './useMyField';
import { OpponentCell, useOpponentField } from './useOpponentField';

interface UseGameById {
	myField: MyCell[];
	opponentField: OpponentCell[];
	isUserTurn: boolean;
}

export function useGameById(gameID: string): UseGameById {
	const {
		userData: { user },
	} = useAuth();

	const { userID } = user!;

	/**
	 * Подписываемся на изменения в игре
	 */
	const { value: rawGameData, loading, error } = useDoc(DB_PATHS.GAMES, gameID);

	const gameData = GameConverter.convertFromApi(rawGameData);

	const { usersIds, currentTurn } = gameData;

	const opponentID = usersIds && (usersIds[0] === userID ? usersIds[1] : usersIds[0]);

	// получаем информацию по полю противника...
	const { field: opponentField } = useOpponentField(gameID, opponentID!);

	// получаем информацию о своем поле...
	const { field: myField } = useMyField(gameID);

	const isUserTurn = currentTurn === userID;

	return {
		myField,
		opponentField,
		isUserTurn,
	};
}
