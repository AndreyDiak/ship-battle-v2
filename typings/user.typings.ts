import { FirebaseInstance } from '.';
import { ToCamelCase } from './utils';

/**
 * User Interface
 */
interface FirebaseUserInstance {
	display_name: string;
	email: string;
	games_played: number;
	wins: number;
}

type UserInstance = ToCamelCase<FirebaseUserInstance>;

export type N_User = FirebaseUserInstance;
export type F_User = FirebaseUserInstance & FirebaseInstance;
export type User = UserInstance & FirebaseInstance;
