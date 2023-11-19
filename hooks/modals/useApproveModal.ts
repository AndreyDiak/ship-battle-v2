import firebaseService, { DB_PATHS } from '@/app/api/firebase.service';
import { User } from '@/typings';
import { UserConverter } from '@/utils/converters/UserConverter';
import { Timestamp } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { useProfile } from '../useProfile';

const TIME_IN_SECONDS = 1_000;

const TIME_TO_APPROVE = TIME_IN_SECONDS * 15;

interface UseApproveModalProps {
	gameId: string;
	usersIds: string[];
	sessionStartedDate: Timestamp;
	cancelGame(gameId: string): void;
}

interface UseApproveModal {
	remainingTime: number;
	opponentData: User | null;
}

export function useApproveModal({
	sessionStartedDate,
	usersIds,
	gameId,
	cancelGame,
}: UseApproveModalProps): UseApproveModal {
	const {
		user: { id },
	} = useProfile();

	const [currentTime, setCurrentTime] = useState(new Date());
	const [opponentData, setOpponentData] = useState<User | null>(null);

	// время которое прошло с начала
	const passedTime = useMemo(
		() =>
			Number(
				(
					(currentTime.getTime() - new Date(sessionStartedDate!.toDate()).getTime()) /
					TIME_IN_SECONDS
				).toFixed(0),
			),
		[currentTime, sessionStartedDate],
	);

	// оставшееся время для принятия игры
	const remainingTime = useMemo(
		() => TIME_TO_APPROVE / TIME_IN_SECONDS - passedTime,
		[passedTime],
	);

	useEffect(() => {
		const getOpponentProfileData = async () => {
			const opponentId = usersIds?.find((userID) => userID !== id)!;

			const opponentProfile = await firebaseService
				.getDoc(DB_PATHS.USERS, opponentId)
				.then((profile) => UserConverter.convertFromApi(profile!));

			setOpponentData(opponentProfile);
		};
		getOpponentProfileData();
	}, [id, usersIds]);

	useEffect(() => {
		if (remainingTime !== null && remainingTime <= 0) {
			cancelGame(gameId);
		}
	}, [cancelGame, gameId, remainingTime]);

	// запускаем таймер...
	useEffect(() => {
		let intervalId = setInterval(() => {
			setCurrentTime(new Date());
		}, TIME_IN_SECONDS * 1);

		return () => {
			clearInterval(intervalId);
		};
	}, []);

	return {
		remainingTime,
		opponentData,
	};
}
