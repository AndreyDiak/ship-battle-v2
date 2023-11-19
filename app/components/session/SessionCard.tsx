import { Game, User } from '@/typings';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import firebaseService, { DB_PATHS } from '../../api/firebase.service';
import { UserConverter } from '@/utils/converters/UserConverter';
import { useSessionById } from '@/hooks/session/useSessionById';
import { useAuth } from '@/hooks';

interface Props {
	game: Game;
	isOwner?: boolean;
}

export const SessionCard = React.memo(({ game, isOwner }: Props) => {
	const { joinSession, deleteSession } = useSessionById(game.id);

	const {
		userData: { user },
	} = useAuth();

	const [owner, setOwner] = useState<User>();

	const ownerWinPercentage = useMemo(() => (owner?.wins! / owner?.gamesPlayed!) * 100, [owner]);

	const loadData = useCallback(async () => {
		const rawUser = await firebaseService.getDoc(DB_PATHS.USERS, game.ownerId);
		if (!rawUser) return;

		setOwner(UserConverter.convertFromApi(rawUser));
	}, [game.ownerId]);

	useEffect(() => {
		loadData();
	}, [loadData]);

	if (!owner) {
		return <div>Loading game data...</div>;
	}

	return (
		<div className="bg-white rounded-md px-4 py-2 min-w-max">
			<div>
				<div>{owner.displayName}</div>
				{owner.gamesPlayed! > 0 && <div>{ownerWinPercentage}%</div>}
			</div>
			{!isOwner ? (
				<div
					onClick={() => joinSession(user?.userID!)}
					className="text-indigo-400 cursor-pointer hover:text-indigo-500"
				>
					Join game
				</div>
			) : (
				<div
					onClick={deleteSession}
					className="text-red-400 cursor-pointer text-right hover:text-red-500"
				>
					Delete game
				</div>
			)}
		</div>
	);
});

SessionCard.displayName = 'GameCard';
