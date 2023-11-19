export interface AuthFormData {
	email: string;
	password: string;
	fullName: string;
	repeatPassword: string;
}

export interface AuthUser {
	email: string;
	userID: string;
}

export type UserSignUpData = AuthFormData;
export type UserSignInData = Pick<AuthFormData, 'email' | 'password'>;
