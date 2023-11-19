'use client';
import { useGameById } from '@/hooks/game/useGameById';

interface Params {
	params: {
		gameId: string;
	};
}

export default function Game({ params: { gameId } }: Params) {
	const { myField, opponentField, isUserTurn } = useGameById(gameId);

	return (
		<div className="w-full h-screen flex justify-center items-center">
			<div className="flex space-x-10">
				<div className="flex max-w-[710px] flex-wrap">
					{myField.map((cell) => (
						<div key={cell.index} className="cell">
							{cell.isTouched ? 'X' : cell.isShip ? 'O' : ''}
						</div>
					))}
				</div>

				<div className="flex max-w-[710px] flex-wrap">
					{opponentField.map((cell) => (
						<div key={cell.index} className="cell">
							{cell.isTouched ? 'X' : cell.isShip ? 'O' : ''}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
