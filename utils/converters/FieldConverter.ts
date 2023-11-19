import { F_Field, Field } from '@/typings/field.typings';

export class FieldConverter {
	public static convertFromApi(fieldData: F_Field): Field {
		const {
			id,
			owner_id,
			game_id,
			ships_remaining,
			touched_cells_with_ship,
			touched_cells_without_ship,
		} = fieldData;

		return {
			id,
			ownerId: owner_id,
			gameId: game_id,
			shipsRemaining: ships_remaining,
			touchedCellsWithoutShip: touched_cells_without_ship ?? null,
			touchedCellsWithShip: touched_cells_with_ship ?? null,
		};
	}
}
