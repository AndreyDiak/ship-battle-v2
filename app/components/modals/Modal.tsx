import { ModalContext } from '@/context/modalContext';
import React from 'react';
import { useContext } from 'react';

export const Modal = React.memo(() => {
	const { closeModal, store } = useContext(ModalContext)!;
	return (
		<div className="absolute w-screen h-screen flex items-center justify-center bg-[rgba(0,0,0,0.7)] z-10">
			<div className="bg-white p-2 md:p-4 rounded-md relative w-11/12 md:w-max md:min-w-[500px]">
				<div
					className="absolute right-4 top-2 font-bold text-2xl cursor-pointer text-gray-800"
					onClick={closeModal}
				>
					✕
				</div>
				<div className="border-b border-gray-200 pb-2 text-lg font-semibold font-sans text-gray-800 max-w-[90%] break-all">
					{store?.title}
				</div>
				{store?.children}
			</div>
		</div>
	);
});

Modal.displayName = 'Modal';
