import { DB_PATHS, PathToGetType } from '@/app/api/firebase.service';
import { QueryConstraint } from 'firebase/firestore';
import { useMemo } from 'react';
import { useDocs } from '.';
/**
 *
 * @param collectionName name of the collection from DB_PATHS
 * @param queryConstraints filters wich we want to upply to query
 * @returns
 */
export function useFirstDoc<F extends DB_PATHS, T extends PathToGetType[F]>(
	collectionName: F,
	...queryConstraints: QueryConstraint[]
) {
	const { value: valuesList, loading, error } = useDocs(collectionName, ...queryConstraints);

	return useMemo(() => {
		const value = valuesList.length > 0 ? (valuesList[0] as T) : null;

		return {
			value,
			loading,
			error,
		};
	}, [error, loading, valuesList]);
}
