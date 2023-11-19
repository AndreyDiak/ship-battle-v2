import { Timestamp } from 'firebase/firestore';
import { F_Game, Game } from '../../typings/firebase.typings';

export class GameConverter {
	public static convertFromApi(gameData: F_Game): Game {
		const {
			is_session_approved,
			is_session_started,
			is_game_started,

			session_created_date,
			session_started_date,
			session_approved_date,
			game_started_date,
			fields_ids,
			users_ids,
			placements_ids,
			approvers_ids,
			owner_id,
			current_turn,
			turns,
			id,
		} = gameData;

		return {
			id,
			// session status information
			isSessionApproved: is_session_approved,
			isSessionStarted: is_session_started,
			isGameStarted: is_game_started,
			// session statuses dates
			sessionCreatedDate: session_created_date as unknown as Timestamp,
			sessionStartedDate: (session_started_date as unknown as Timestamp) ?? null,
			sessionApprovedDate: (session_approved_date as unknown as Timestamp) ?? null,
			gameStartedDate: (game_started_date as unknown as Timestamp) ?? null,

			currentTurn: current_turn ?? null,

			ownerId: owner_id,
			usersIds: users_ids ?? null,
			approversIds: approvers_ids ?? null,
			// turns history
			turns:
				turns?.map((turn) => ({
					index: turn.index,
					ownerId: turn.owner_id,
				})) ?? null,

			fieldsIds: fields_ids ?? null,
			placementsIds: placements_ids ?? null,
		};
	}
}
