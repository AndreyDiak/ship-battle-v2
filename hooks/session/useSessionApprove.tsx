import firebaseService, { DB_PATHS } from '@/app/api/firebase.service';
import { ModalContext } from '@/context/modalContext';
import { N_Edit } from '@/typings';
import { GameConverter } from '@/utils/converters/GameConverter';
import { arrayUnion, deleteField, where } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useCallback, useContext, useEffect, useMemo } from 'react';
import { useAuth, useFirstDoc } from '..';
import { ApproveModal } from '../../app/components/modals/ApproveModal';
import { MODAL_TITLE } from '../modals/useModalLayout';

export function useSessionApprove() {
	const {
		userData: { user },
	} = useAuth();

	const { userID } = user!;

	const { openModal, store, closeModal } = useContext(ModalContext)!;

	const router = useRouter();

	const { value: gamesToApprove } = useFirstDoc(
		DB_PATHS.GAMES,
		where('users_ids', 'array-contains', userID),
		where('is_session_started', '==', true),
		where('is_session_approved', '==', false),
	);

	const isGameToApproveFound = useMemo(() => gamesToApprove !== null, [gamesToApprove]);

	const isApproveModalAlreadyOpen = store !== null && store.title === MODAL_TITLE.APPROVE;

	const gameToApproveData = useMemo(
		() => (isGameToApproveFound ? GameConverter.convertFromApi(gamesToApprove!) : null),
		[gamesToApprove, isGameToApproveFound],
	);

	const cancelGame = useCallback(async (gameId: string) => {
		await firebaseService.updateDoc(
			DB_PATHS.GAMES,
			{
				users_ids: deleteField(),
				session_started_date: deleteField(),
				is_session_started: false,
				approvers_ids: deleteField(),
			},
			gameId,
		);
	}, []);

	const approveGame = useCallback(
		async (gameId: string) => {
			await firebaseService.updateDoc(
				DB_PATHS.GAMES,
				{
					approvers_ids: arrayUnion(userID),
				},
				gameId,
			);
		},
		[userID],
	);

	const startEdit = useCallback(async () => {
		if (!gameToApproveData) return;
		const gameId = gameToApproveData.id;

		// обновляем значения полей нашего объекта игры
		await firebaseService.updateDoc(
			DB_PATHS.GAMES,
			{
				is_session_approved: true,
				session_approved_date: new Date(),
			},
			gameId,
		);

		// создаем новые данные для доски edit
		const userEdit: N_Edit = {
			game_id: gameId,
			owner_id: userID,
		};
		// сохраняем в БД
		await firebaseService.createDoc(DB_PATHS.PLACEMENTS, userEdit);

		// получаем данные об только что созданной игре
		// TODO @raymix разобраться почему createDoc не возвращает docRef
		firebaseService
			.getDocs(
				DB_PATHS.PLACEMENTS,
				where('owner_id', '==', userID),
				where('game_id', '==', gameId),
			)
			.then((res) => {
				if (!res || res?.length === 0) return;

				const editRawData = res[0];

				// закрываем модалку и перебрасываем пользователя на страницу расстановки кораблей
				router.push(`/edit/${editRawData.id}`);
				closeModal();
			});
	}, [closeModal, gameToApproveData, router, userID]);

	/*
	 * если мы нашли игру, которую надо подтвердить, и модалка еще не открыта...
	 */
	useEffect(() => {
		if (!isGameToApproveFound || isApproveModalAlreadyOpen) {
			return;
		}

		openModal({
			title: MODAL_TITLE.APPROVE,
			children: (
				<ApproveModal
					gameData={gameToApproveData!}
					approveGame={approveGame}
					cancelGame={cancelGame}
				/>
			),
		});
	}, [
		approveGame,
		cancelGame,
		gameToApproveData,
		isApproveModalAlreadyOpen,
		isGameToApproveFound,
		openModal,
		store,
	]);

	/*
	 * Если оба игрока подтвердили игру, то кидаем их на страницу расставления кораблей.
	 */
	useEffect(() => {
		if (
			isGameToApproveFound &&
			gameToApproveData?.usersIds?.length === gameToApproveData?.approversIds?.length
		) {
			startEdit();
		}
	}, [
		gameToApproveData?.approversIds?.length,
		gameToApproveData?.usersIds?.length,
		isGameToApproveFound,
		startEdit,
	]);

	/*
	 * если игра не найдена, но модалка открыта
	 * это необходимо, чтобы закрыть ее у 2-го игрока, когда первый отменяет поиск
	 */
	useEffect(() => {
		if (!isGameToApproveFound && isApproveModalAlreadyOpen) {
			closeModal();
		}
	}, [closeModal, isApproveModalAlreadyOpen, isGameToApproveFound]);
}
