import { FirebaseInstance } from '.';
import { ToCamelCase2 } from './utils';

/**
 * Field interface
 */
interface FirebaseFieldInstance {
	// field owner id
	owner_id: string;
	//
	game_id: string;
	// how many ships still alive
	ships_remaining: number;
	// arrays with cells indexes, touched by enemy
	touched_cells_without_ship?: number[];
	touched_cells_with_ship?: number[];
}

type BoardInstance = ToCamelCase2<FirebaseFieldInstance>;

export type N_Field = FirebaseFieldInstance;
export type F_Field = FirebaseFieldInstance & FirebaseInstance;
export type Field = BoardInstance & FirebaseInstance;
