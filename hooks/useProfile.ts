import { DB_PATHS } from '@/app/api/firebase.service';
import { UserConverter } from '@/utils/converters/UserConverter';
import { useMemo } from 'react';
import { useAuth } from '.';
import { useDoc } from './api/useDoc';

export function useProfile() {
	const {
		userData: { user: authUser },
	} = useAuth();

	const { value: rawUser } = useDoc(DB_PATHS.USERS, authUser?.userID!);

	return useMemo(() => {
		const user = UserConverter.convertFromApi(rawUser);

		return {
			user,
		};
	}, [rawUser]);
}
