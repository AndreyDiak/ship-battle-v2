import { Timestamp } from 'firebase/firestore';
import { SHIP_TYPE } from '.';

/**
 * перевод ключа из snake_case в camelCase
 */
type CamelCase<S extends string, O extends boolean = false> = S extends `${infer W1}_${infer W2}`
	? `${O extends true ? Capitalize<W1> : W1}${CamelCase<W2, true>}`
	: O extends true
	? Capitalize<S>
	: Lowercase<S>;

type ToStrict<T> = Exclude<T, undefined>;

/**
 * Если свойтство могло быть undefined то дописываем возможность поставить ему null
 */
type UndToNull<T extends unknown> = undefined extends T ? ToStrict<T> | null : T;

type UndToNull2<T extends unknown, CT extends unknown = T> = undefined extends CT
	? ToStrict<T> | null
	: T;

type Primitive = number | string | boolean;

type IsSimpleArray<T> = ToStrict<T> extends Primitive[] ? true : false;

type IsArray<T> = ToStrict<T> extends unknown[] ? true : false;

type IsObj<T> = ToStrict<T> extends object ? true : false;

type IsDate<T> = Date extends T ? true : false;

type Not<C> = C extends true ? false : true;

export type Tuple<T1, T2 = T1> = [T1, T2];

type Mappings = {
	string: string;
	'string[]': string[];
	number: number;
	'number[]': number[];
	Date: Date;
	boolean: boolean;
	'boolean[]': boolean[];
	Timestamp: Timestamp;
};

/**
 * возвращает true если есть хоть одно true
 */
type LogicalOr<C extends boolean[]> = C[number] extends false ? false : true;

/**
 * возвращает true если все условие true, иначе false
 */
type LogicalAnd<C extends boolean[]> = C[number] extends true ? true : false;

type TypesFromMap<
	F extends any,
	M extends string[],
	I extends number[] = [],
> = M[I['length']] extends `${infer FROM extends keyof Mappings}->${infer TO extends keyof Mappings}`
	? F extends Mappings[FROM]
		? Mappings[TO]
		: TypesFromMap<F, M, [0, ...I]>
	: M['length'] extends I['length']
	? UndToNull2<F>
	: never;

type GetOptionsToSwitch<M extends string[]> =
	M[number] extends `${infer FROM extends keyof Mappings}->${infer TO}` ? Mappings[FROM] : never;

/**
 * Тип для объектов без вложенности
 */
export type ToCamelCase<T extends object> = {
	[K in keyof Required<T> as CamelCase<string & K>]: UndToNull<T[K]>;
};

/**
 * Тип для объектов с вложенностью
 */
export type ToCamelCase2<T extends object> = {
	[K in keyof Required<T> as CamelCase<string & K>]: UndToNull2<
		LogicalAnd<[IsObj<T[K]>, Not<IsArray<T[K]>>, Not<IsDate<T[K]>>]> extends true
			? // Объект, но не массив и не дата
			  ToCamelCase2<object & T[K]>
			: // если массив, но не примитивов,
			LogicalAnd<[IsArray<T[K]>, Not<IsSimpleArray<T[K]>>]> extends true
			? // берем тип элемента и проходимся по нему
			  ToCamelCase2<object & (unknown[] & T[K])[number]>[]
			: // примитив или массив примитивов
			  T[K],
		T[K]
	>;
};

/**
 * Объекты с вложенностью и возможностью менять типы
 */
export type ToCamelCase3<Type extends object, Options extends string[] = []> = {
	[K in keyof Required<Type> as CamelCase<string & K>]: UndToNull2<
		LogicalAnd<[IsObj<Type[K]>, Not<IsArray<Type[K]>>, Not<IsDate<Type[K]>>]> extends true
			? // Объект, но не массив и не дата
			  ToCamelCase3<object & Type[K], Options>
			: LogicalAnd<[IsArray<Type[K]>, Not<IsSimpleArray<Type[K]>>]> extends true
			? // если массив, но не примитивов,
			  ToCamelCase3<object & (unknown[] & Type[K])[number], Options>[]
			: // получаем пересечение нашего типа, и типов которые хотим поменять
			ToStrict<Type[K]> & GetOptionsToSwitch<Options> extends never
			? // если тип не подходит под те, которые надо менять
			  Type[K]
			: // если есть тип, который надо поменять
			  TypesFromMap<Type[K], Options>,
		Type[K]
	>;
};
