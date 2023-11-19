'use client';
import type { EditCell } from '@/typings';
import { classNames } from '@/utils';
import React from 'react';

interface Props {
	cell: EditCell;
	onClick: (index: number) => void;
	onMouseOver: (index: number) => void;
}

export const Cell = React.memo(({ cell, onClick, onMouseOver }: Props) => {
	const withNotFreeClassName = !cell.isFree && !cell.isShip ? 'bg-gray-100' : 'cursor-pointer';
	const withShipClassName = cell.isShip && 'bg-red-100';
	const withBacklightClassName = cell.isBacklighted && 'bg-red-200';
	return (
		<div
			className={classNames(
				'cell',
				withNotFreeClassName,
				withShipClassName,
				withBacklightClassName,
			)}
			onClick={() => onClick(cell.index!)}
			onMouseOver={() => onMouseOver(cell.index!)}
		>
			{cell.isShip ? 'O' : !cell.isFree ? 'x' : ''}
		</div>
	);
});

Cell.displayName = 'Cell';
