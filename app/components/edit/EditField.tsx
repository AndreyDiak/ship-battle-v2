'use client';
import { useEdit } from '@/hooks';
import { useSessionStart } from '@/hooks/session';
import React from 'react';
import { Cell } from './Cell';
import { EditSidebar } from './EditSidebar';

export const Field = React.memo(({ editId }: { editId: string }) => {
	/**
	 * Хук следит за состоянием расставноки кораблей
	 */
	useSessionStart();

	const {
		field,
		remainingShips,
		selectedShip,
		mode,
		setMode,
		setSelected,
		resetBacklight,
		onClick,
		onMouseOver,
	} = useEdit(editId);

	return (
		<div className="flex justify-center items-center space-x-12">
			<div
				className="flex flex-wrap max-w-[710px] justify-center rounded-sm"
				onMouseLeave={resetBacklight}
			>
				{field.map((cell) => {
					return (
						<Cell key={cell.index} cell={cell} onClick={onClick} onMouseOver={onMouseOver} />
					);
				})}
			</div>
			<EditSidebar
				remainingShips={remainingShips}
				selectedShip={selectedShip}
				mode={mode}
				setMode={setMode}
				setSelected={setSelected}
			/>
		</div>
	);
});

Field.displayName = 'Field';
