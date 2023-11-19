import { ToCamelCase3, Tuple } from './utils';

export interface FirebaseInstance {
	id: string;
}

/**
 * N_ - new entity instance (creating in app and need push to DB without id)
 * F_ - existing entity instance (getting from DB with id)
 * [NAME] - entity instance converted from [F_] to app instance
 */

/**
 * Game Interface
 */
export interface FirebaseGameInstance {
	owner_id: string;
	// is session created (when both players click on play)
	is_session_started: boolean;
	// is session approved (whe both players approved their participation)
	is_session_approved: boolean;
	// is both players creates own placements...
	is_game_started: boolean;
	// the date when owner create session
	session_created_date: Date;
	// the date when the second player click on "play" button
	session_started_date?: Date;
	// the date when both players approved their participation
	session_approved_date?: Date;
	// the date when game is started
	game_started_date?: Date;
	// participants ids
	users_ids?: Tuple<string>;
	// the users_ids, who's approve the game
	approvers_ids?: Tuple<string>;
	// the ids of edit fields for users
	placements_ids?: Tuple<string>;
	// userID who's currently have turn
	current_turn?: string;
	// turns list
	turns?: FirebaseTurnInstance[];
	// fields id where we have all ships
	fields_ids?: Tuple<string>;
}

interface FirebaseTurnInstance {
	owner_id: string | boolean;
	index: number;
}

type GameInstance = ToCamelCase3<FirebaseGameInstance, ['Date->Timestamp']>;

export type N_Game = FirebaseGameInstance;
export type F_Game = FirebaseGameInstance & FirebaseInstance;
export type Game = GameInstance & FirebaseInstance;
