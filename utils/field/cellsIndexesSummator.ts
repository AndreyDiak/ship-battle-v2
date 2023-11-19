// import { FIELD_SIZE } from '@/hooks';
// import { EDIT_MODE } from '@/typings';

// export function cellsIndexesSummator<S extends 'central' | 'outside'>(
// 	pivot: number,
// 	mode: EDIT_MODE,
// 	status: S,
// 	optional?: S extends 'outside' ? 'end' | 'start' : never,
// ): number[] {
// 	const indexes: number[] =
// 		status === 'outside' ? NEARBY_OUTSIDE_INDEXES[mode][optional!] : NEARBY_CENTRAL_INDEXES[mode];

// 	return indexes
// 		.map((index) => pivot + index)
// 		.filter((index) => {
// 			// если индекс вышел за границу поля
// 			if (index < 0 || index > FIELD_SIZE - 1) {
// 				return false;
// 			}

// 			// проверка крайних индексов
// 			if ((pivot % 10 === 0 && index % 10 === 9) || (pivot % 10 === 9 && index % 10 === 0)) {
// 				return false;
// 			}

// 			return true;
// 		});
// }
