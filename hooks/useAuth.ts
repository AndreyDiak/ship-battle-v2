import firebaseService, { DB_PATHS } from '@/app/api/firebase.service';
import { auth, facebookProvider, googleProvider, twitterProvider } from '@/firebase';
import type { AuthUser, N_User, UserSignInData, UserSignUpData } from '@/typings';
import {
	AuthProvider,
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signInWithPopup,
	signOut as signOutFromApp,
} from 'firebase/auth';
import { useCallback, useMemo } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { toast } from 'react-toastify';

type ProviderType = 'google' | 'facebook' | 'twitter';

interface UserData {
	user: AuthUser | null;
	loading: boolean;
	error: Error | undefined;
}

interface UseAuth {
	userData: UserData;
	signUp(userData: UserSignUpData, onSuccessHandler?: () => void): Promise<void>;
	signIn(userData: UserSignInData, onSuccessHandler?: () => void): Promise<void>;
	signInWithProvider(providerType: ProviderType): Promise<void>;
	signOut(): Promise<void>;
}

const providerMap: Record<ProviderType, AuthProvider> = {
	google: googleProvider,
	facebook: facebookProvider,
	twitter: twitterProvider,
};

export function useAuth(): UseAuth {
	const [user, loading, error] = useAuthState(auth);

	const signUp = useCallback(async (userData: UserSignUpData, onSuccessHandler?: () => void) => {
		if (userData.password !== userData.repeatPassword) {
			toast.warning('Passwords do not match');
			return;
		}

		const { email, password, fullName } = userData;

		createUserWithEmailAndPassword(auth, email, password)
			.then(async (userCredential) => {
				const { user } = userCredential;
				const userID = user.uid;

				const userData: N_User = {
					display_name: fullName,
					email,
					games_played: 0,
					wins: 0,
				};

				// создаем юзера в коллекции...
				firebaseService
					.createDoc(DB_PATHS.USERS, userData, userID)
					.then(() => {
						toast.success(`Вы успешно зарегестрированы`);
						onSuccessHandler?.();
					})
					.catch((err) => console.log(err.message));
			})
			.catch((err) => toast.error(err.code));
	}, []);

	const signIn = useCallback(async (userData: UserSignInData, onSuccessHandler?: () => void) => {
		const { email, password } = userData;

		signInWithEmailAndPassword(auth, email, password)
			.then(async (userCredential) => {
				const { user } = userCredential;
				// user.displayName = null;
				const { uid } = user;

				const firebaseUser = await firebaseService.getDoc(DB_PATHS.USERS, uid);

				const { display_name } = firebaseUser!;

				toast.success(`${display_name}! Добро пожаловать)`);
				onSuccessHandler?.();
			})
			.catch((err) => toast.error(err.code));
	}, []);

	const signOut = useCallback(async () => {
		await signOutFromApp(auth);
	}, []);

	const signInWithProvider = useCallback(async (providerType: ProviderType) => {
		await signInWithPopup(auth, providerMap[providerType]);
	}, []);

	return useMemo(() => {
		const userData: UserData = {
			loading,
			error,
			user: user
				? {
						email: user?.email!,
						userID: user?.uid!,
				  }
				: null,
		};

		return {
			userData,
			signIn,
			signInWithProvider,
			signUp,
			signOut,
		};
	}, [error, loading, signIn, signInWithProvider, signOut, signUp, user]);
}
