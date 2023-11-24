'use client';
import { useMySession, useSession } from '@/hooks/session';
import React from 'react';
import { SessionCard } from './SessionCard';

export const SessionList = React.memo(() => {
	const { availableGames, createGame } = useSession();

	const { mySession } = useMySession();

	const renderList = () => {
		if (availableGames.length === 0) {
			return (
				<div className="text-center text-white font-semibold">Not avaliable games found...</div>
			);
		}
		return (
			<div className="flex flex-col space-y-2 min-h-[300px]">
				{availableGames.map((game) => (
					<SessionCard key={game.id} game={game} />
				))}
			</div>
		);
	};

	return (
		<div className="min-w-[300px] min-h-[200px] border-b border-gray-100 mb-4">
			{renderList()}

			{mySession ? (
				<SessionCard game={mySession} isOwner={true} />
			) : (
				<button
					onClick={createGame}
					className="bg-white rounded-md py-2 px-3 w-full hover:bg-indigo-50"
				>
					Create a game
				</button>
			)}
		</div>
	);
});

SessionList.displayName = 'SessionList';
