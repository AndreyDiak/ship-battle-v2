import { Field } from '@/app/components/edit/EditField';

interface Params {
	params: {
		editId: string;
	};
}

export default function Edit({ params: { editId } }: Params) {
	return (
		<div className="w-full h-screen flex justify-center items-center">
			<Field editId={editId} />
		</div>
	);
}
