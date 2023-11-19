import { useCallback, useContext, useEffect, useMemo } from 'react';
import { useAuth, useFirstDoc } from '..';
import { arrayUnion, where } from 'firebase/firestore';
import firebaseService, { DB_PATHS } from '@/app/api/firebase.service';
import { GameConverter } from '@/utils/converters/GameConverter';
import { N_Field } from '@/typings/field.typings';
import { useRouter } from 'next/navigation';
import { ModalContext } from '@/context/modalContext';
import { MODAL_TITLE } from '../modals/useModalLayout';

export function useSessionStart() {
	const {
		userData: { user },
	} = useAuth();

	const { userID } = user!;

	const router = useRouter();

	const { closeModal, store } = useContext(ModalContext)!;

	const { value: gamesToStart } = useFirstDoc(
		DB_PATHS.GAMES,
		where('users_ids', 'array-contains', userID),
		where('is_session_approved', '==', true),
	);

	const isGameToStartFound = useMemo(() => gamesToStart !== null, [gamesToStart]);

	const gameToStartData = useMemo(
		() => (isGameToStartFound ? GameConverter.convertFromApi(gamesToStart!) : null),
		[gamesToStart, isGameToStartFound],
	);

	const startGame = useCallback(async () => {
		const { id: gameId, usersIds, ownerId } = gameToStartData!;

		/*
		 * TODO @raymix требуется улучшение
		 * Возможно можно добится данного эффекта без лишнего запроса...
		 */

		const existingField = await firebaseService.getFirstDoc(
			DB_PATHS.FIELDS,
			where('owner_id', '==', userID),
			where('game_id', '==', gameId),
		);

		// если мы уже создали поле для данного игрока и для данной игры...
		if (existingField) {
			router.push(`/game/${gameId}`);
			return;
		}

		// 1. создаем field
		const newField: N_Field = {
			owner_id: userID,
			game_id: gameToStartData?.id!,
			ships_remaining: 10,
		};

		// сохраняем в БД
		await firebaseService.createDoc(DB_PATHS.FIELDS, newField);

		const field = await firebaseService.getFirstDoc(
			DB_PATHS.FIELDS,
			where('owner_id', '==', userID),
			where('game_id', '==', gameId),
		);

		if (!field || !usersIds) return;

		// добавляем поле
		await firebaseService.updateDoc(
			DB_PATHS.GAMES,
			{
				fields_ids: arrayUnion(field.id),
			},
			gameId,
		);

		// делаем это для того, чтобы вызвать только один раз
		if (userID === ownerId) {
			const currentTurn = Math.random() > 0.5 ? usersIds[0] : usersIds[1];
			await firebaseService.updateDoc(
				DB_PATHS.GAMES,
				{
					current_turn: currentTurn,
				},
				gameId,
			);
		}

		if (store?.title === MODAL_TITLE.EDIT && store.children) {
			closeModal();
		}

		// кидаем игрока на страницу игры...
		router.push(`/game/${gameId}`);
	}, [closeModal, gameToStartData, router, store?.children, store?.title, userID]);

	/*
	 * Если оба игрока расставили корабли, то начинаем игру
	 */
	useEffect(() => {
		if (
			isGameToStartFound &&
			gameToStartData?.placementsIds?.length === gameToStartData?.approversIds?.length
		) {
			startGame();
			return;
		}
	}, [
		gameToStartData?.approversIds?.length,
		gameToStartData?.placementsIds?.length,
		isGameToStartFound,
		startGame,
	]);
}
