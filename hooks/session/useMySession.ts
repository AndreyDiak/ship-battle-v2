import { DB_PATHS } from '@/app/api/firebase.service';
import { useDocs, useAuth } from '..';
import { where } from 'firebase/firestore';
import { GameConverter } from '@/utils/converters/GameConverter';
import { Game } from '@/typings';

interface UseMyGame {
	mySession: Game | null;
}

export function useMySession(): UseMyGame {
	const {
		userData: { user },
	} = useAuth();
	// активная сессия игры пользователя, если он ее создал
	const { value: rawGame } = useDocs(DB_PATHS.GAMES, where('owner_id', '==', user?.userID));

	const mySession = rawGame.length > 0 ? GameConverter.convertFromApi(rawGame[0]) : null;

	return {
		mySession,
	};
}
