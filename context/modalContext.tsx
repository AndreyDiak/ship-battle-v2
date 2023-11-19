'use client';
import { Modal } from '@/app/components/modals';
import { UseModalLayout, useModalLayout } from '@/hooks/modals/useModalLayout';
import React, { PropsWithChildren, useCallback } from 'react';

export const ModalContext = React.createContext<null | UseModalLayout>(null);

export const ModalProvider = ({ children }: PropsWithChildren) => {
	const { openModal, closeModal, store } = useModalLayout();

	const renderModal = useCallback(() => {
		if (store === null) {
			return null;
		}

		return <Modal />;
	}, [store]);

	return (
		<ModalContext.Provider
			value={{
				store,
				openModal,
				closeModal,
			}}
		>
			{renderModal()}
			{children}
		</ModalContext.Provider>
	);
};
