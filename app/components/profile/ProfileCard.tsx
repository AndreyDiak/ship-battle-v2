import { useAuth } from '@/hooks';
import { useProfile } from '@/hooks/useProfile';
import React from 'react';

export const ProfileCard = React.memo(() => {
	const { user } = useProfile();
	const { signOut } = useAuth();
	const winPercentage = (user.wins / user.gamesPlayed) * 100;

	return (
		<div className="bg-white py-12 px-16">
			<div className="mb-4">
				<h2 className="text-xl">{user.displayName}</h2>
				<div className="text-gray-500">{user.email}</div>
			</div>
			<div className="mb-12">
				{user.gamesPlayed > 0 ? (
					<>
						<div>Games played: {user.gamesPlayed}</div>
						<div>Win Percentage: {winPercentage}%</div>
					</>
				) : (
					<h3>Play at least one game</h3>
				)}
			</div>
			<div>
				<button
					onClick={signOut}
					className="bg-indigo-400 text-white py-1 px-2 rounded-lg w-full hover:bg-indigo-500"
				>
					Sign Out
				</button>
			</div>
		</div>
	);
});

ProfileCard.displayName = 'ProfileCard';
