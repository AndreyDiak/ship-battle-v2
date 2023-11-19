import { db } from '@/firebase';
import type { F_Edit, F_Game, F_User, N_Edit, N_Game, N_User } from '@/typings';
import { F_Field, N_Field } from '@/typings/field.typings';
import {
	CollectionReference,
	DocumentData,
	DocumentReference,
	DocumentSnapshot,
	FieldValue,
	QueryConstraint,
	WhereFilterOp,
	collection,
	doc,
	deleteDoc as firebaseDeleteDoc,
	updateDoc as firebaseUpdateDoc,
	getDoc,
	getDocs,
	query,
	setDoc,
	where,
} from 'firebase/firestore';
import { toast } from 'react-toastify';

export enum DB_PATHS {
	FIELDS = 'fields',
	PLACEMENTS = 'placements',
	GAMES = 'games',
	USERS = 'users',
}

export type PathToGetType = {
	[DB_PATHS.USERS]: F_User;
	[DB_PATHS.GAMES]: F_Game;
	[DB_PATHS.FIELDS]: F_Field;
	[DB_PATHS.PLACEMENTS]: F_Edit;
};

export type PathToNewType = {
	[DB_PATHS.USERS]: N_User;
	[DB_PATHS.GAMES]: N_Game;
	[DB_PATHS.FIELDS]: N_Field;
	[DB_PATHS.PLACEMENTS]: N_Edit;
};

// такой синтаксис нужен чтобы можно было удалять поля с помощью функции deleteField() без ручного приведения типов
export type PathToUpdateType = {
	[DB_PATHS.USERS]: {
		[K in keyof N_User]: N_User[K] | FieldValue;
	};
	[DB_PATHS.GAMES]: {
		[K in keyof N_Game]: N_Game[K] | FieldValue;
	};
	[DB_PATHS.FIELDS]: {
		[K in keyof N_Field]: N_Field[K] | FieldValue;
	};
	[DB_PATHS.PLACEMENTS]: {
		[K in keyof N_Edit]: N_Edit[K] | FieldValue;
	};
};

interface GetDocSnapProps {
	collectionName: DB_PATHS;
	docId?: string;
}

interface GetDocsSnapProps {
	collectionName: DB_PATHS;
	queryConstraints: QueryConstraint[];
}

class FirebaseService {
	private getCollectionRef(name: string): CollectionReference<DocumentData> {
		return collection(db, name);
	}

	getDocRef(collectionName: DB_PATHS, docId?: string): DocumentReference<DocumentData> {
		if (docId) {
			return doc(this.getCollectionRef(collectionName), docId);
		}
		return doc(this.getCollectionRef(collectionName));
	}

	getQuery(options: GetDocsSnapProps) {
		const { collectionName, queryConstraints } = options;
		return query(this.getCollectionRef(collectionName), ...queryConstraints);
	}

	private getDocSnap(options: GetDocSnapProps): Promise<DocumentSnapshot> {
		const { collectionName, docId } = options;
		return getDoc(this.getDocRef(collectionName, docId));
	}

	private getDocsSnap(options: GetDocsSnapProps) {
		const { collectionName, queryConstraints } = options;
		return getDocs(this.getQuery({ collectionName, queryConstraints }));
	}

	/**
	 *
	 * @param collectionName name of the collection from DB_PATHS
	 * @param data document data
	 * @param docId document id (optional) without id it will be auto-generated.
	 * @returns
	 */
	async createDoc<F extends DB_PATHS, T extends PathToNewType[F]>(
		collectionName: F,
		data: T,
		docId?: string,
	) {
		return setDoc(this.getDocRef(collectionName, docId), data);
	}
	/**
	 *
	 * @param collectionName name of the collection from DB_PATHS
	 * @param data updated fields of document
	 * @param docId document id wich we want to update
	 * @returns
	 */
	async updateDoc<F extends DB_PATHS, T extends PathToUpdateType[F]>(
		collectionName: F,
		data: Partial<T>,
		docId: string,
	) {
		return firebaseUpdateDoc(this.getDocRef(collectionName, docId), data as DocumentData);
	}
	/**
	 *
	 * @param collectionName name of the collection from DB_PATHS
	 * @param docId document id wich we want to update
	 * @returns
	 */
	async deleteDoc(collectionName: DB_PATHS, docId: string) {
		return firebaseDeleteDoc(this.getDocRef(collectionName, docId));
	}

	/**
	 *
	 * @param collectionName name of the collection from DB_PATHS
	 * @param docId document id wich we want to get
	 * @returns Promise<DocumentData | null>
	 */
	async getDoc<F extends DB_PATHS, T extends PathToGetType[F]>(
		collectionName: F,
		docId: string,
	): Promise<T | null> {
		try {
			const docSnap = await this.getDocSnap({ collectionName, docId });

			if (!docSnap.exists()) {
				return null;
			}

			return {
				...docSnap.data(),
				id: docSnap.id,
			} as T;
		} catch (err) {
			toast.error((err as Error).message);
			return null;
		}
	}
	/**
	 *
	 * @param collectionName  name of the collection from DB_PATHS
	 * @param queryConstraints filters wich we want to upply to query
	 * @returns Promise<DocumentData[]>
	 */

	async getDocs<F extends DB_PATHS, T extends PathToGetType[F]>(
		collectionName: F,
		...queryConstraints: QueryConstraint[]
	): Promise<T[] | null> {
		try {
			const docsSnap = await this.getDocsSnap({ collectionName, queryConstraints });

			if (docsSnap.empty) {
				return [];
			}

			return docsSnap.docs.map(
				(doc) =>
					({
						...doc.data(),
						id: doc.id,
					} as T),
			);
		} catch (err) {
			toast.error((err as Error).message);
			return null;
		}
	}

	async getFirstDoc<F extends DB_PATHS, T extends PathToGetType[F]>(
		collectionName: F,
		...queryConstraints: QueryConstraint[]
	): Promise<T | null> {
		try {
			const docs = await this.getDocs(collectionName, ...queryConstraints);

			if (!docs || docs.length === 0) {
				return null;
			}

			const doc = docs[0] as T;

			return doc;
		} catch (err) {
			toast.error((err as Error).message);
			return null;
		}
	}
}

export const where2 = <T extends FieldValue | string>(
	fieldName: T,
	opStr: WhereFilterOp,
	value: unknown,
) => where(fieldName, opStr, value);

// eslint-disable-next-line import/no-anonymous-default-export
export default new FirebaseService();
