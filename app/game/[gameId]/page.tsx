'use client';
import { useGameById } from '@/hooks/game/useGameById';
import { classNames } from '@/utils';
import { useCallback } from 'react';

interface Params {
	params: {
		gameId: string;
	};
}

export default function Game({ params: { gameId } }: Params) {
	const { myField, opponentField, isUserTurn, onClick } = useGameById(gameId);

	const onClickHandler = useCallback(
		async (index: number) => {
			if (!isUserTurn || opponentField[index].isTouched) return;
			onClick(index);
		},
		[isUserTurn, onClick, opponentField],
	);

	return (
		<div className="w-full h-screen flex justify-center items-center">
			<div>
				<div className="text-center mb-4">
					<h2 className="text-4xl">{isUserTurn ? 'Ваш ход...' : 'Ход противника'}</h2>
				</div>
				<div className="flex space-x-10">
					<div className="field">
						{myField.map((cell) => (
							<div
								key={cell.index}
								className={classNames(
									'cell',
									cell.isDead && 'bg-red-400',
									cell.isTouched && cell.isShip && 'bg-red-200',
								)}
							>
								{cell.isTouched ? 'X' : cell.isShip ? 'O' : ''}
							</div>
						))}
					</div>

					<div className="field">
						{opponentField.map((cell) => (
							<div
								key={cell.index}
								className={classNames('cell', cell.isShip && 'bg-red-400')}
								onClick={() => onClickHandler(cell.index)}
							>
								{cell.isTouched ? 'X' : cell.isShip ? 'O' : ''}
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
