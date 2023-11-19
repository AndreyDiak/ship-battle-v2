import firebaseService, { DB_PATHS } from '@/app/api/firebase.service';
import type { Game, N_Game } from '@/typings';
import { GameConverter } from '@/utils/converters/GameConverter';
import { where } from 'firebase/firestore';
import { useCallback, useMemo } from 'react';
import { useAuth, useDocs } from '..';

interface UseSessions {
	availableGames: Game[];
	loading: boolean;
	error: Error | undefined;
	createGame(): Promise<void>;
}

export function useSession(): UseSessions {
	const {
		userData: { user },
	} = useAuth();

	const { userID } = user!;

	// список всех доступных игр
	const {
		value: rawGames,
		loading,
		error,
	} = useDocs(DB_PATHS.GAMES, where('is_session_started', '==', false));

	// активная сессия игры пользователя, если он ее создал

	const createGame = useCallback(async () => {
		const game: N_Game = {
			is_session_approved: false,
			is_session_started: false,
			is_game_started: false,
			owner_id: userID!,
			session_created_date: new Date(),
		};

		await firebaseService.createDoc(DB_PATHS.GAMES, game);
	}, [userID]);

	return useMemo(() => {
		const availableGames =
			rawGames
				.map((game) => GameConverter.convertFromApi(game))
				.filter((game) => game.ownerId !== userID) ?? [];

		return {
			availableGames,
			loading,
			error,
			createGame,
		};
	}, [rawGames, loading, error, createGame, userID]);
}
