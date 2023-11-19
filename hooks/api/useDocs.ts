import firebaseService, { DB_PATHS, PathToGetType } from '@/app/api/firebase.service';
import { QueryConstraint } from 'firebase/firestore';
import { useMemo, useEffect } from 'react';
import { useCollection } from 'react-firebase-hooks/firestore';
/**
 *
 * @param collectionName name of the collection from DB_PATHS
 * @param queryConstraints filters wich we want to upply to query
 * @returns
 */
export function useDocs<F extends DB_PATHS, T extends PathToGetType[F]>(
	collectionName: F,
	...queryConstraints: QueryConstraint[]
) {
	const [snapshot, loading, error] = useCollection(
		firebaseService.getQuery({
			collectionName,
			queryConstraints,
		}),
	);

	const value = useMemo(
		() =>
			snapshot?.docs.map(
				(doc) =>
					({
						...doc.data(),
						id: doc.id,
					} as T),
			) ?? [],
		[snapshot],
	);

	useEffect(() => {
		console.log('value');
	}, [value]);

	return {
		value,
		loading,
		error,
	};
}
