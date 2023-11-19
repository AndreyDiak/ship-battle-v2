import { User } from '@/typings';
import React from 'react';

interface Props {
	user: User;
	isMine?: boolean;
}

export const ProfilePreview = React.memo(({ user, isMine }: Props) => {
	const firstLetter = user.displayName[0].toUpperCase();

	const backgroundColor = isMine ? '#7c97d7' : '#cd6c6c';

	return (
		<div className="flex flex-col items-center flex-1">
			<div className="mb-1 text-gray-500 text-sm font-mono">{isMine ? 'You' : 'Opponent'}</div>
			<div
				style={{ backgroundColor }}
				className="w-14 h-14 flex justify-center items-center text-2xl text-white font-mono rounded-full mb-2"
			>
				{firstLetter}
			</div>
			<div>{user.displayName}</div>
		</div>
	);
});

ProfilePreview.displayName = 'ProfilePreview';
