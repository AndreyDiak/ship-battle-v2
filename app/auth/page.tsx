'use client';

import { AuthType, useAuthForm } from '@/hooks';
import { useAuth } from '@/hooks';
import { UserSignInData, UserSignUpData } from '@/typings';
import { FaFacebookF, FaGoogle, FaTwitter } from 'react-icons/fa';
import { SocialIcon } from '../components/common/SocialIcon';

const authSuggestion: Record<AuthType, string> = {
	signin: `Don't have an account?`,
	signup: 'Already have an account?',
};

const authPreview: Record<AuthType, string> = {
	signin: 'SIGN UP',
	signup: 'SIGN IN',
};

const authHeader: Record<AuthType, string> = {
	signin: 'Enter Your Credentials',
	signup: 'Create New Account',
};

const placeholderMap: Record<keyof UserSignUpData, string> = {
	email: 'email',
	password: 'password',
	fullName: 'full name',
	repeatPassword: 'repeat',
};

const signUpFields: (keyof UserSignUpData)[] = ['fullName', 'email', 'password', 'repeatPassword'];
const signInFields: (keyof UserSignInData)[] = ['email', 'password'];

export default function Auth() {
	const { signInWithProvider } = useAuth();
	const { mode, formData, setMode, setFormData, onClickHandler } = useAuthForm();

	const renderInputs = () => {
		return mode === 'signup'
			? signUpFields.map((field) => (
					<input
						key={field}
						type={field === 'password' || field === 'repeatPassword' ? 'password' : 'text'}
						name={field}
						placeholder={placeholderMap[field].toUpperCase()}
						value={formData[field]}
						onChange={(e) =>
							setFormData((prev) => ({
								...prev,
								[field]: e.target.value,
							}))
						}
						className="authInput"
					/>
			  ))
			: signInFields.map((field) => (
					<input
						key={field}
						type={field === 'password' ? 'password' : 'text'}
						name={field}
						placeholder={placeholderMap[field].toUpperCase()}
						value={formData[field]}
						onChange={(e) =>
							setFormData((prev) => ({
								...prev,
								[field]: e.target.value,
							}))
						}
						className="authInput"
					/>
			  ));
	};

	return (
		<div className="w-full h-screen flex justify-center items-center bg-gray-100">
			<div className="flex">
				<div className="bg-white py-24 px-16 flex flex-col space-y-12">
					<h2 className="text-xl font-normal text-gray-600">{authHeader[mode]}</h2>
					<div>
						<div className="flex flex-col space-y-4 mb-4">{renderInputs()}</div>
						<div>
							<button
								className="bg-indigo-400 text-white w-full py-3 px-4 rounded-md hover:bg-indigo-500"
								onClick={onClickHandler}
							>
								{mode === 'signin' ? 'SIGN IN' : 'CREATE ACCOUNT'}
							</button>
						</div>
					</div>
					<div>
						<h4 className="text-sm text-gray-500 font-medium mb-4">
							Or with your social network
						</h4>
						<div className="flex space-x-4 w-full">
							<SocialIcon
								Icon={FaFacebookF}
								color="#4f6bbc"
								onClick={() => signInWithProvider('facebook')}
							/>
							<SocialIcon
								Icon={FaGoogle}
								color="#dd493d"
								onClick={() => signInWithProvider('google')}
							/>
							<SocialIcon
								Icon={FaTwitter}
								color="#20b9ff "
								onClick={() => signInWithProvider('twitter')}
							/>
						</div>
					</div>
				</div>
				<div className="bg-indigo-400 py-24 px-16 flex">
					<div className="text-white flex flex-col items-center justify-center">
						<h2 className="text-xl mb-6">{authSuggestion[mode]}</h2>
						<button
							className="authInput w-full hover:bg-indigo-500 hover:border-indigo-500"
							onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
						>
							{authPreview[mode]}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
