'use client';
import { useAuth } from '@/hooks';
import { usePathname, useRouter } from 'next/navigation';
import { PropsWithChildren } from 'react';

export const AuthLayout = ({ children }: PropsWithChildren<unknown>) => {
	const {} = useRouter();

	const {
		userData: { user, loading, error },
	} = useAuth();

	const router = useRouter();

	const pathname = usePathname();

	if (loading) {
		return <div>Loading...</div>;
	}

	if (error) {
		return <div>Error</div>;
	}

	if (!user && pathname !== '/auth') {
		router.push('/auth');
		router.refresh();
		return;
	}

	return children;
};
