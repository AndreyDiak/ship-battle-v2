import { F_User, User } from '../../typings';

export class UserConverter {
	public static convertFromApi(gameData: F_User): User {
		const { display_name, games_played, wins, email, id } = gameData;

		return {
			email,
			id,
			wins,
			displayName: display_name,
			gamesPlayed: games_played,
		};
	}
}
