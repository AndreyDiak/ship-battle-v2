import { Edit, F_Edit } from '../../typings';

export class EditConverter {
	public static convertFromApi(editData: F_Edit): Edit {
		const { id, owner_id, game_id, ships } = editData;

		return {
			id,
			ownerId: owner_id,
			gameId: game_id,
			ships: ships ?? null,
		};
	}
}
