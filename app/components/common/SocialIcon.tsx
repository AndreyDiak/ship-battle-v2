import React, { ReactNode } from 'react';
import { IconType } from 'react-icons';

interface Props {
	Icon: IconType;
	onClick(): void;
	color: string;
}

export const SocialIcon = React.memo(({ Icon, color, onClick }: Props) => {
	return (
		<div
			className="flex-1 flex justify-center rounded-md py-3 cursor-pointer"
			onClick={onClick}
			style={{
				backgroundColor: color,
			}}
		>
			<Icon size={20} color="white" />
		</div>
	);
});

SocialIcon.displayName = 'SocialIcon';
