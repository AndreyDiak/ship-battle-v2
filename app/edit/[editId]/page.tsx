'use client';
import { EditField } from '@/app/components';

interface Params {
	params: {
		editId: string;
	};
}

export default function Edit({ params: { editId } }: Params) {
	return (
		<div className="w-full h-screen flex justify-center items-center">
			<EditField editId={editId} />
		</div>
	);
}
