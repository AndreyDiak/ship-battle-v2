'use client';
import { useSessionStart, useSessionApprove } from '@/hooks/session';
import { SessionList } from './components/session';
import { ProfileCard } from './components/profile';

export default function Home() {
	/**
	 * Подтверждение игры и переброс на страницу редактирования
	 */
	useSessionApprove();
	/**
	 * Переброс на страницу игры, если пользователь уже играет,
	 * либо после расстановки всех кораблей
	 */
	useSessionStart();

	return (
		<main className="flex w-full h-screen flex-col items-center justify-center bg-gray-100">
			<div className="flex">
				<ProfileCard />
				<div className="bg-indigo-400 rounded-sm py-12 px-16">
					<SessionList />
				</div>
			</div>
		</main>
	);
}
