import { AuthFormData } from '@/typings';
import { useRouter } from 'next/navigation';
import { Dispatch, SetStateAction, useState } from 'react';
import { useAuth } from '.';

export type AuthType = 'signin' | 'signup';

interface UseAuthForm {
	mode: AuthType;
	formData: AuthFormData;
	onClickHandler(): Promise<void>;
	setFormData: Dispatch<SetStateAction<AuthFormData>>;
	setMode: Dispatch<SetStateAction<AuthType>>;
}

const DEFAULT_FORM_DATA: AuthFormData = {
	email: '',
	password: '',
	repeatPassword: '',
	fullName: '',
};

export function useAuthForm(): UseAuthForm {
	const router = useRouter();

	const { signIn, signUp } = useAuth();

	const [mode, setMode] = useState<AuthType>('signin');

	const [formData, setFormData] = useState<AuthFormData>(DEFAULT_FORM_DATA);

	const onSignInHandler = async () => {
		await signIn({ email: formData.email, password: formData.password }, () => {
			router.push('/');
		});
	};

	const onSignUpHandler = async () => {
		await signUp(formData, () => {
			setMode(mode === 'signin' ? 'signup' : 'signin');
		});
	};

	const onClickHandler = async () => {
		mode === 'signin' ? await onSignInHandler() : await onSignUpHandler();
	};

	return {
		mode,
		formData,
		onClickHandler,
		setFormData,
		setMode,
	};
}
