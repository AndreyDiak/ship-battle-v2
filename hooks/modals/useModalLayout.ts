import { ReactNode, useCallback, useMemo, useState } from 'react';

interface ModalStore {
	title: string;
	children: ReactNode;
}

export interface UseModalLayout {
	closeModal(): void;
	openModal(data: ModalStore): void;
	store: ModalStore | null;
}

export const MODAL_TITLE = {
	APPROVE: 'Approve game',
	EDIT: 'Nice placement!',
};

export function useModalLayout(): UseModalLayout {
	const [store, setStore] = useState<ModalStore | null>(null);

	const openModal = useCallback((modalData: ModalStore) => {
		setStore(modalData);
	}, []);

	const closeModal = useCallback(() => {
		setStore(null);
	}, []);

	return useMemo(() => {
		return {
			openModal,
			closeModal,
			store,
		};
	}, [closeModal, openModal, store]);
}
