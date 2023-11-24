'use client';
import { useApproveModal } from '@/hooks/modals/useApproveModal';
import { useProfile } from '@/hooks/useProfile';
import { Game } from '@/typings';
import React, { useState } from 'react';
import { ProfilePreview } from '../profile/ProfilePreview';

interface Props {
	gameData: Game;
	approveGame(gameId: string): Promise<void>;
	cancelGame(gameId: string): Promise<void>;
}

export const ApproveModal = React.memo(({ gameData, approveGame, cancelGame }: Props) => {
	const { user } = useProfile();

	const { id: gameId, usersIds, sessionStartedDate } = gameData;

	const { remainingTime, opponentData } = useApproveModal({
		cancelGame,
		gameId,
		sessionStartedDate: sessionStartedDate!,
		usersIds: usersIds!,
	});

	const [isApproved, setIsApproved] = useState(false);

	const handleApprove = () => {
		approveGame(gameId);
		setIsApproved(true);
	};

	if (!opponentData) {
		return <div>Loading...</div>;
	}

	return (
		<div>
			<div className="text-center text-2xl mt-2">{remainingTime}</div>
			<div className="flex justify-center items-center py-4 border-b-[1px] border-gray-200 mb-4">
				<ProfilePreview user={user} isMine />
				<div className="font-semibold">VS</div>
				<ProfilePreview user={opponentData} />
			</div>
			<div className="flex justify-center space-x-4">
				{!isApproved ? (
					<>
						<button
							onClick={handleApprove}
							className="bg-indigo-400 text-white py-2 px-6 rounded-md cursor-pointer hover:bg-indigo-500"
						>
							Approve
						</button>
						<button
							onClick={() => cancelGame(gameId)}
							className="bg-red-400 text-white py-2 px-6 rounded-md cursor-pointer hover:bg-red-500"
						>
							Cancel
						</button>
					</>
				) : (
					<div>Waiting for opponent...</div>
				)}
			</div>
		</div>
	);
});

ApproveModal.displayName = 'ApproveModal';
