import firebaseService, { DB_PATHS, PathToGetType } from '@/app/api/firebase.service';
import { useMemo } from 'react';
import { useDocument } from 'react-firebase-hooks/firestore';
/**
 *
 * @param collectionName name of the collection from DB_PATHS
 * @param docId document id
 * @returns
 */
export function useDoc<F extends DB_PATHS, T extends PathToGetType[F]>(
	collectionName: F,
	docId: string,
) {
	const [snapshot, loading, error] = useDocument(firebaseService.getDocRef(collectionName, docId));

	return useMemo(() => {
		const value = {
			...snapshot?.data(),
			id: snapshot?.id,
		} as T;

		return {
			value,
			loading,
			error,
		};
	}, [error, loading, snapshot]);
}
