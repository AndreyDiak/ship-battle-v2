import { UseEdit, shipTypeToLengthMap } from '@/hooks';
import { EDIT_MODE, SHIP_TYPE } from '@/typings';
import { classNames } from '@/utils';
import React from 'react';

const modeMap: Record<EDIT_MODE, string> = {
	[EDIT_MODE.HORIZONTAL]: 'По горизонтали',
	[EDIT_MODE.VERTICAL]: 'По вертикали',
};

const shipMap: Record<SHIP_TYPE, string> = {
	[SHIP_TYPE.LARGE]: 'Эсминец',
	[SHIP_TYPE.BIG]: 'Крейсер',
	[SHIP_TYPE.MEDIUM]: 'Корабль',
	[SHIP_TYPE.SMALL]: 'Катер',
};

const availableModes = [EDIT_MODE.HORIZONTAL, EDIT_MODE.VERTICAL];

const availableShips = [SHIP_TYPE.LARGE, SHIP_TYPE.BIG, SHIP_TYPE.MEDIUM, SHIP_TYPE.SMALL];

type Props = Pick<UseEdit, 'setMode' | 'setSelected' | 'selectedShip' | 'remainingShips' | 'mode'>;

export const EditSidebar = React.memo(
	({ mode, selectedShip, remainingShips, setMode, setSelected }: Props) => {
		return (
			<div className="flex flex-col space-y-4">
				{/* Список кораблей для расстановки с счетчиком*/}
				<div>
					<h2 className="mb-2">Доступные корабли</h2>
					<div className="flex flex-col space-y-2">
						{availableShips.map((previewShip) => {
							const disabled = remainingShips[previewShip].left === 0;
							return (
								<div
									key={previewShip}
									className="flex items-center space-x-4 justify-between"
								>
									<div className="flex items-center flex-1 justify-between space-x-2">
										<button
											onClick={() => setSelected(previewShip)}
											disabled={disabled}
											className={classNames(
												'px-2 py-1 rounded-md',
												selectedShip === previewShip
													? 'bg-red-300 font-semibold'
													: 'bg-gray-300',
												disabled && 'bg-gray-100',
											)}
										>
											{shipMap[previewShip]}
										</button>
										<div className="flex space-x-1 border-gray-300 border-[1px] px-1 rounded-md">
											{Array(shipTypeToLengthMap[previewShip])
												.fill(null)
												.map((_, index) => (
													<div key={index}>O</div>
												))}
										</div>
									</div>
									<div>(осталось {remainingShips[previewShip].left} шт.)</div>
								</div>
							);
						})}
					</div>
				</div>
				{/* Смена режима расстановки */}
				<div>
					<h2 className="mb-2">Режим расстановки</h2>
					<div className="flex flex-col space-y-2">
						{availableModes.map((previewMode) => (
							<button
								key={previewMode}
								onClick={() => setMode(previewMode)}
								className={classNames(
									'px-3 py-1 rounded-md text-lg',
									previewMode === mode ? 'bg-red-300 font-semibold' : 'bg-gray-300',
								)}
							>
								{modeMap[previewMode]}
							</button>
						))}
					</div>
				</div>
			</div>
		);
	},
);

EditSidebar.displayName = 'EditSidebar';
