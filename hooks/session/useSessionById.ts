import { toast } from 'react-toastify';
import firebaseService, { DB_PATHS } from '@/app/api/firebase.service';
import { useCallback } from 'react';
import { useMySession } from '.';

export function useSessionById(sessionID: string) {
	const { mySession } = useMySession();

	const deleteSession = useCallback(async () => {
		await firebaseService.deleteDoc(DB_PATHS.GAMES, sessionID);
	}, [sessionID]);

	const joinSession = useCallback(
		async (userID: string) => {
			// если пользователь имеют свой сеанс
			if (mySession !== null) {
				toast.warning('You can join game while hosting own active session!');
				return;
			}

			const prevGameData = await firebaseService.getDoc(DB_PATHS.GAMES, sessionID);

			if (!prevGameData) return;

			await firebaseService.updateDoc(
				DB_PATHS.GAMES,
				{
					is_session_started: true,
					session_started_date: new Date(),
					users_ids: [prevGameData.owner_id, userID],
				},
				sessionID,
			);
		},
		[sessionID, mySession],
	);

	return {
		deleteSession,
		joinSession,
	};
}
