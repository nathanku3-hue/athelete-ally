
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Exercise
 * 
 */
export type Exercise = $Result.DefaultSelection<Prisma.$ExercisePayload>
/**
 * Model ExerciseVariation
 * 
 */
export type ExerciseVariation = $Result.DefaultSelection<Prisma.$ExerciseVariationPayload>
/**
 * Model ExerciseRating
 * 
 */
export type ExerciseRating = $Result.DefaultSelection<Prisma.$ExerciseRatingPayload>
/**
 * Model ExerciseCategory
 * 
 */
export type ExerciseCategory = $Result.DefaultSelection<Prisma.$ExerciseCategoryPayload>

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Exercises
 * const exercises = await prisma.exercise.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Exercises
   * const exercises = await prisma.exercise.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.exercise`: Exposes CRUD operations for the **Exercise** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Exercises
    * const exercises = await prisma.exercise.findMany()
    * ```
    */
  get exercise(): Prisma.ExerciseDelegate<ExtArgs>;

  /**
   * `prisma.exerciseVariation`: Exposes CRUD operations for the **ExerciseVariation** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ExerciseVariations
    * const exerciseVariations = await prisma.exerciseVariation.findMany()
    * ```
    */
  get exerciseVariation(): Prisma.ExerciseVariationDelegate<ExtArgs>;

  /**
   * `prisma.exerciseRating`: Exposes CRUD operations for the **ExerciseRating** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ExerciseRatings
    * const exerciseRatings = await prisma.exerciseRating.findMany()
    * ```
    */
  get exerciseRating(): Prisma.ExerciseRatingDelegate<ExtArgs>;

  /**
   * `prisma.exerciseCategory`: Exposes CRUD operations for the **ExerciseCategory** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ExerciseCategories
    * const exerciseCategories = await prisma.exerciseCategory.findMany()
    * ```
    */
  get exerciseCategory(): Prisma.ExerciseCategoryDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.22.0
   * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Exercise: 'Exercise',
    ExerciseVariation: 'ExerciseVariation',
    ExerciseRating: 'ExerciseRating',
    ExerciseCategory: 'ExerciseCategory'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs, clientOptions: PrismaClientOptions }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps: "exercise" | "exerciseVariation" | "exerciseRating" | "exerciseCategory"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Exercise: {
        payload: Prisma.$ExercisePayload<ExtArgs>
        fields: Prisma.ExerciseFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ExerciseFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExercisePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ExerciseFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExercisePayload>
          }
          findFirst: {
            args: Prisma.ExerciseFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExercisePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ExerciseFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExercisePayload>
          }
          findMany: {
            args: Prisma.ExerciseFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExercisePayload>[]
          }
          create: {
            args: Prisma.ExerciseCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExercisePayload>
          }
          createMany: {
            args: Prisma.ExerciseCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ExerciseCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExercisePayload>[]
          }
          delete: {
            args: Prisma.ExerciseDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExercisePayload>
          }
          update: {
            args: Prisma.ExerciseUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExercisePayload>
          }
          deleteMany: {
            args: Prisma.ExerciseDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ExerciseUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ExerciseUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExercisePayload>
          }
          aggregate: {
            args: Prisma.ExerciseAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateExercise>
          }
          groupBy: {
            args: Prisma.ExerciseGroupByArgs<ExtArgs>
            result: $Utils.Optional<ExerciseGroupByOutputType>[]
          }
          count: {
            args: Prisma.ExerciseCountArgs<ExtArgs>
            result: $Utils.Optional<ExerciseCountAggregateOutputType> | number
          }
        }
      }
      ExerciseVariation: {
        payload: Prisma.$ExerciseVariationPayload<ExtArgs>
        fields: Prisma.ExerciseVariationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ExerciseVariationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExerciseVariationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ExerciseVariationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExerciseVariationPayload>
          }
          findFirst: {
            args: Prisma.ExerciseVariationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExerciseVariationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ExerciseVariationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExerciseVariationPayload>
          }
          findMany: {
            args: Prisma.ExerciseVariationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExerciseVariationPayload>[]
          }
          create: {
            args: Prisma.ExerciseVariationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExerciseVariationPayload>
          }
          createMany: {
            args: Prisma.ExerciseVariationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ExerciseVariationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExerciseVariationPayload>[]
          }
          delete: {
            args: Prisma.ExerciseVariationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExerciseVariationPayload>
          }
          update: {
            args: Prisma.ExerciseVariationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExerciseVariationPayload>
          }
          deleteMany: {
            args: Prisma.ExerciseVariationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ExerciseVariationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ExerciseVariationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExerciseVariationPayload>
          }
          aggregate: {
            args: Prisma.ExerciseVariationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateExerciseVariation>
          }
          groupBy: {
            args: Prisma.ExerciseVariationGroupByArgs<ExtArgs>
            result: $Utils.Optional<ExerciseVariationGroupByOutputType>[]
          }
          count: {
            args: Prisma.ExerciseVariationCountArgs<ExtArgs>
            result: $Utils.Optional<ExerciseVariationCountAggregateOutputType> | number
          }
        }
      }
      ExerciseRating: {
        payload: Prisma.$ExerciseRatingPayload<ExtArgs>
        fields: Prisma.ExerciseRatingFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ExerciseRatingFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExerciseRatingPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ExerciseRatingFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExerciseRatingPayload>
          }
          findFirst: {
            args: Prisma.ExerciseRatingFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExerciseRatingPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ExerciseRatingFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExerciseRatingPayload>
          }
          findMany: {
            args: Prisma.ExerciseRatingFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExerciseRatingPayload>[]
          }
          create: {
            args: Prisma.ExerciseRatingCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExerciseRatingPayload>
          }
          createMany: {
            args: Prisma.ExerciseRatingCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ExerciseRatingCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExerciseRatingPayload>[]
          }
          delete: {
            args: Prisma.ExerciseRatingDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExerciseRatingPayload>
          }
          update: {
            args: Prisma.ExerciseRatingUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExerciseRatingPayload>
          }
          deleteMany: {
            args: Prisma.ExerciseRatingDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ExerciseRatingUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ExerciseRatingUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExerciseRatingPayload>
          }
          aggregate: {
            args: Prisma.ExerciseRatingAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateExerciseRating>
          }
          groupBy: {
            args: Prisma.ExerciseRatingGroupByArgs<ExtArgs>
            result: $Utils.Optional<ExerciseRatingGroupByOutputType>[]
          }
          count: {
            args: Prisma.ExerciseRatingCountArgs<ExtArgs>
            result: $Utils.Optional<ExerciseRatingCountAggregateOutputType> | number
          }
        }
      }
      ExerciseCategory: {
        payload: Prisma.$ExerciseCategoryPayload<ExtArgs>
        fields: Prisma.ExerciseCategoryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ExerciseCategoryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExerciseCategoryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ExerciseCategoryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExerciseCategoryPayload>
          }
          findFirst: {
            args: Prisma.ExerciseCategoryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExerciseCategoryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ExerciseCategoryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExerciseCategoryPayload>
          }
          findMany: {
            args: Prisma.ExerciseCategoryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExerciseCategoryPayload>[]
          }
          create: {
            args: Prisma.ExerciseCategoryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExerciseCategoryPayload>
          }
          createMany: {
            args: Prisma.ExerciseCategoryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ExerciseCategoryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExerciseCategoryPayload>[]
          }
          delete: {
            args: Prisma.ExerciseCategoryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExerciseCategoryPayload>
          }
          update: {
            args: Prisma.ExerciseCategoryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExerciseCategoryPayload>
          }
          deleteMany: {
            args: Prisma.ExerciseCategoryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ExerciseCategoryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ExerciseCategoryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExerciseCategoryPayload>
          }
          aggregate: {
            args: Prisma.ExerciseCategoryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateExerciseCategory>
          }
          groupBy: {
            args: Prisma.ExerciseCategoryGroupByArgs<ExtArgs>
            result: $Utils.Optional<ExerciseCategoryGroupByOutputType>[]
          }
          count: {
            args: Prisma.ExerciseCategoryCountArgs<ExtArgs>
            result: $Utils.Optional<ExerciseCategoryCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
  }


  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type ExerciseCountOutputType
   */

  export type ExerciseCountOutputType = {
    exerciseVariations: number
    userRatings: number
  }

  export type ExerciseCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    exerciseVariations?: boolean | ExerciseCountOutputTypeCountExerciseVariationsArgs
    userRatings?: boolean | ExerciseCountOutputTypeCountUserRatingsArgs
  }

  // Custom InputTypes
  /**
   * ExerciseCountOutputType without action
   */
  export type ExerciseCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExerciseCountOutputType
     */
    select?: ExerciseCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ExerciseCountOutputType without action
   */
  export type ExerciseCountOutputTypeCountExerciseVariationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ExerciseVariationWhereInput
  }

  /**
   * ExerciseCountOutputType without action
   */
  export type ExerciseCountOutputTypeCountUserRatingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ExerciseRatingWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Exercise
   */

  export type AggregateExercise = {
    _count: ExerciseCountAggregateOutputType | null
    _avg: ExerciseAvgAggregateOutputType | null
    _sum: ExerciseSumAggregateOutputType | null
    _min: ExerciseMinAggregateOutputType | null
    _max: ExerciseMaxAggregateOutputType | null
  }

  export type ExerciseAvgAggregateOutputType = {
    difficulty: number | null
    popularity: number | null
  }

  export type ExerciseSumAggregateOutputType = {
    difficulty: number | null
    popularity: number | null
  }

  export type ExerciseMinAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    updatedAt: Date | null
    name: string | null
    description: string | null
    category: string | null
    subcategory: string | null
    setup: string | null
    difficulty: number | null
    progression: string | null
    instructions: string | null
    tips: string | null
    videoUrl: string | null
    imageUrl: string | null
    safetyNotes: string | null
    contraindications: string | null
    isActive: boolean | null
    popularity: number | null
  }

  export type ExerciseMaxAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    updatedAt: Date | null
    name: string | null
    description: string | null
    category: string | null
    subcategory: string | null
    setup: string | null
    difficulty: number | null
    progression: string | null
    instructions: string | null
    tips: string | null
    videoUrl: string | null
    imageUrl: string | null
    safetyNotes: string | null
    contraindications: string | null
    isActive: boolean | null
    popularity: number | null
  }

  export type ExerciseCountAggregateOutputType = {
    id: number
    createdAt: number
    updatedAt: number
    name: number
    description: number
    category: number
    subcategory: number
    equipment: number
    setup: number
    difficulty: number
    progression: number
    primaryMuscles: number
    secondaryMuscles: number
    instructions: number
    tips: number
    videoUrl: number
    imageUrl: number
    safetyNotes: number
    modifications: number
    contraindications: number
    tags: number
    isActive: number
    popularity: number
    _all: number
  }


  export type ExerciseAvgAggregateInputType = {
    difficulty?: true
    popularity?: true
  }

  export type ExerciseSumAggregateInputType = {
    difficulty?: true
    popularity?: true
  }

  export type ExerciseMinAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    name?: true
    description?: true
    category?: true
    subcategory?: true
    setup?: true
    difficulty?: true
    progression?: true
    instructions?: true
    tips?: true
    videoUrl?: true
    imageUrl?: true
    safetyNotes?: true
    contraindications?: true
    isActive?: true
    popularity?: true
  }

  export type ExerciseMaxAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    name?: true
    description?: true
    category?: true
    subcategory?: true
    setup?: true
    difficulty?: true
    progression?: true
    instructions?: true
    tips?: true
    videoUrl?: true
    imageUrl?: true
    safetyNotes?: true
    contraindications?: true
    isActive?: true
    popularity?: true
  }

  export type ExerciseCountAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    name?: true
    description?: true
    category?: true
    subcategory?: true
    equipment?: true
    setup?: true
    difficulty?: true
    progression?: true
    primaryMuscles?: true
    secondaryMuscles?: true
    instructions?: true
    tips?: true
    videoUrl?: true
    imageUrl?: true
    safetyNotes?: true
    modifications?: true
    contraindications?: true
    tags?: true
    isActive?: true
    popularity?: true
    _all?: true
  }

  export type ExerciseAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Exercise to aggregate.
     */
    where?: ExerciseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Exercises to fetch.
     */
    orderBy?: ExerciseOrderByWithRelationInput | ExerciseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ExerciseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Exercises from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Exercises.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Exercises
    **/
    _count?: true | ExerciseCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ExerciseAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ExerciseSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ExerciseMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ExerciseMaxAggregateInputType
  }

  export type GetExerciseAggregateType<T extends ExerciseAggregateArgs> = {
        [P in keyof T & keyof AggregateExercise]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateExercise[P]>
      : GetScalarType<T[P], AggregateExercise[P]>
  }




  export type ExerciseGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ExerciseWhereInput
    orderBy?: ExerciseOrderByWithAggregationInput | ExerciseOrderByWithAggregationInput[]
    by: ExerciseScalarFieldEnum[] | ExerciseScalarFieldEnum
    having?: ExerciseScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ExerciseCountAggregateInputType | true
    _avg?: ExerciseAvgAggregateInputType
    _sum?: ExerciseSumAggregateInputType
    _min?: ExerciseMinAggregateInputType
    _max?: ExerciseMaxAggregateInputType
  }

  export type ExerciseGroupByOutputType = {
    id: string
    createdAt: Date
    updatedAt: Date
    name: string
    description: string
    category: string
    subcategory: string | null
    equipment: string[]
    setup: string | null
    difficulty: number
    progression: string | null
    primaryMuscles: string[]
    secondaryMuscles: string[]
    instructions: string
    tips: string | null
    videoUrl: string | null
    imageUrl: string | null
    safetyNotes: string | null
    modifications: JsonValue | null
    contraindications: string | null
    tags: string[]
    isActive: boolean
    popularity: number
    _count: ExerciseCountAggregateOutputType | null
    _avg: ExerciseAvgAggregateOutputType | null
    _sum: ExerciseSumAggregateOutputType | null
    _min: ExerciseMinAggregateOutputType | null
    _max: ExerciseMaxAggregateOutputType | null
  }

  type GetExerciseGroupByPayload<T extends ExerciseGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ExerciseGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ExerciseGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ExerciseGroupByOutputType[P]>
            : GetScalarType<T[P], ExerciseGroupByOutputType[P]>
        }
      >
    >


  export type ExerciseSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    name?: boolean
    description?: boolean
    category?: boolean
    subcategory?: boolean
    equipment?: boolean
    setup?: boolean
    difficulty?: boolean
    progression?: boolean
    primaryMuscles?: boolean
    secondaryMuscles?: boolean
    instructions?: boolean
    tips?: boolean
    videoUrl?: boolean
    imageUrl?: boolean
    safetyNotes?: boolean
    modifications?: boolean
    contraindications?: boolean
    tags?: boolean
    isActive?: boolean
    popularity?: boolean
    exerciseVariations?: boolean | Exercise$exerciseVariationsArgs<ExtArgs>
    userRatings?: boolean | Exercise$userRatingsArgs<ExtArgs>
    _count?: boolean | ExerciseCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["exercise"]>

  export type ExerciseSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    name?: boolean
    description?: boolean
    category?: boolean
    subcategory?: boolean
    equipment?: boolean
    setup?: boolean
    difficulty?: boolean
    progression?: boolean
    primaryMuscles?: boolean
    secondaryMuscles?: boolean
    instructions?: boolean
    tips?: boolean
    videoUrl?: boolean
    imageUrl?: boolean
    safetyNotes?: boolean
    modifications?: boolean
    contraindications?: boolean
    tags?: boolean
    isActive?: boolean
    popularity?: boolean
  }, ExtArgs["result"]["exercise"]>

  export type ExerciseSelectScalar = {
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    name?: boolean
    description?: boolean
    category?: boolean
    subcategory?: boolean
    equipment?: boolean
    setup?: boolean
    difficulty?: boolean
    progression?: boolean
    primaryMuscles?: boolean
    secondaryMuscles?: boolean
    instructions?: boolean
    tips?: boolean
    videoUrl?: boolean
    imageUrl?: boolean
    safetyNotes?: boolean
    modifications?: boolean
    contraindications?: boolean
    tags?: boolean
    isActive?: boolean
    popularity?: boolean
  }

  export type ExerciseInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    exerciseVariations?: boolean | Exercise$exerciseVariationsArgs<ExtArgs>
    userRatings?: boolean | Exercise$userRatingsArgs<ExtArgs>
    _count?: boolean | ExerciseCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ExerciseIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $ExercisePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Exercise"
    objects: {
      exerciseVariations: Prisma.$ExerciseVariationPayload<ExtArgs>[]
      userRatings: Prisma.$ExerciseRatingPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      createdAt: Date
      updatedAt: Date
      name: string
      description: string
      category: string
      subcategory: string | null
      equipment: string[]
      setup: string | null
      difficulty: number
      progression: string | null
      primaryMuscles: string[]
      secondaryMuscles: string[]
      instructions: string
      tips: string | null
      videoUrl: string | null
      imageUrl: string | null
      safetyNotes: string | null
      modifications: Prisma.JsonValue | null
      contraindications: string | null
      tags: string[]
      isActive: boolean
      popularity: number
    }, ExtArgs["result"]["exercise"]>
    composites: {}
  }

  type ExerciseGetPayload<S extends boolean | null | undefined | ExerciseDefaultArgs> = $Result.GetResult<Prisma.$ExercisePayload, S>

  type ExerciseCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ExerciseFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ExerciseCountAggregateInputType | true
    }

  export interface ExerciseDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Exercise'], meta: { name: 'Exercise' } }
    /**
     * Find zero or one Exercise that matches the filter.
     * @param {ExerciseFindUniqueArgs} args - Arguments to find a Exercise
     * @example
     * // Get one Exercise
     * const exercise = await prisma.exercise.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ExerciseFindUniqueArgs>(args: SelectSubset<T, ExerciseFindUniqueArgs<ExtArgs>>): Prisma__ExerciseClient<$Result.GetResult<Prisma.$ExercisePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Exercise that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ExerciseFindUniqueOrThrowArgs} args - Arguments to find a Exercise
     * @example
     * // Get one Exercise
     * const exercise = await prisma.exercise.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ExerciseFindUniqueOrThrowArgs>(args: SelectSubset<T, ExerciseFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ExerciseClient<$Result.GetResult<Prisma.$ExercisePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Exercise that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExerciseFindFirstArgs} args - Arguments to find a Exercise
     * @example
     * // Get one Exercise
     * const exercise = await prisma.exercise.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ExerciseFindFirstArgs>(args?: SelectSubset<T, ExerciseFindFirstArgs<ExtArgs>>): Prisma__ExerciseClient<$Result.GetResult<Prisma.$ExercisePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Exercise that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExerciseFindFirstOrThrowArgs} args - Arguments to find a Exercise
     * @example
     * // Get one Exercise
     * const exercise = await prisma.exercise.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ExerciseFindFirstOrThrowArgs>(args?: SelectSubset<T, ExerciseFindFirstOrThrowArgs<ExtArgs>>): Prisma__ExerciseClient<$Result.GetResult<Prisma.$ExercisePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Exercises that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExerciseFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Exercises
     * const exercises = await prisma.exercise.findMany()
     * 
     * // Get first 10 Exercises
     * const exercises = await prisma.exercise.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const exerciseWithIdOnly = await prisma.exercise.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ExerciseFindManyArgs>(args?: SelectSubset<T, ExerciseFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ExercisePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Exercise.
     * @param {ExerciseCreateArgs} args - Arguments to create a Exercise.
     * @example
     * // Create one Exercise
     * const Exercise = await prisma.exercise.create({
     *   data: {
     *     // ... data to create a Exercise
     *   }
     * })
     * 
     */
    create<T extends ExerciseCreateArgs>(args: SelectSubset<T, ExerciseCreateArgs<ExtArgs>>): Prisma__ExerciseClient<$Result.GetResult<Prisma.$ExercisePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Exercises.
     * @param {ExerciseCreateManyArgs} args - Arguments to create many Exercises.
     * @example
     * // Create many Exercises
     * const exercise = await prisma.exercise.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ExerciseCreateManyArgs>(args?: SelectSubset<T, ExerciseCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Exercises and returns the data saved in the database.
     * @param {ExerciseCreateManyAndReturnArgs} args - Arguments to create many Exercises.
     * @example
     * // Create many Exercises
     * const exercise = await prisma.exercise.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Exercises and only return the `id`
     * const exerciseWithIdOnly = await prisma.exercise.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ExerciseCreateManyAndReturnArgs>(args?: SelectSubset<T, ExerciseCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ExercisePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Exercise.
     * @param {ExerciseDeleteArgs} args - Arguments to delete one Exercise.
     * @example
     * // Delete one Exercise
     * const Exercise = await prisma.exercise.delete({
     *   where: {
     *     // ... filter to delete one Exercise
     *   }
     * })
     * 
     */
    delete<T extends ExerciseDeleteArgs>(args: SelectSubset<T, ExerciseDeleteArgs<ExtArgs>>): Prisma__ExerciseClient<$Result.GetResult<Prisma.$ExercisePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Exercise.
     * @param {ExerciseUpdateArgs} args - Arguments to update one Exercise.
     * @example
     * // Update one Exercise
     * const exercise = await prisma.exercise.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ExerciseUpdateArgs>(args: SelectSubset<T, ExerciseUpdateArgs<ExtArgs>>): Prisma__ExerciseClient<$Result.GetResult<Prisma.$ExercisePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Exercises.
     * @param {ExerciseDeleteManyArgs} args - Arguments to filter Exercises to delete.
     * @example
     * // Delete a few Exercises
     * const { count } = await prisma.exercise.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ExerciseDeleteManyArgs>(args?: SelectSubset<T, ExerciseDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Exercises.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExerciseUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Exercises
     * const exercise = await prisma.exercise.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ExerciseUpdateManyArgs>(args: SelectSubset<T, ExerciseUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Exercise.
     * @param {ExerciseUpsertArgs} args - Arguments to update or create a Exercise.
     * @example
     * // Update or create a Exercise
     * const exercise = await prisma.exercise.upsert({
     *   create: {
     *     // ... data to create a Exercise
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Exercise we want to update
     *   }
     * })
     */
    upsert<T extends ExerciseUpsertArgs>(args: SelectSubset<T, ExerciseUpsertArgs<ExtArgs>>): Prisma__ExerciseClient<$Result.GetResult<Prisma.$ExercisePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Exercises.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExerciseCountArgs} args - Arguments to filter Exercises to count.
     * @example
     * // Count the number of Exercises
     * const count = await prisma.exercise.count({
     *   where: {
     *     // ... the filter for the Exercises we want to count
     *   }
     * })
    **/
    count<T extends ExerciseCountArgs>(
      args?: Subset<T, ExerciseCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ExerciseCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Exercise.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExerciseAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ExerciseAggregateArgs>(args: Subset<T, ExerciseAggregateArgs>): Prisma.PrismaPromise<GetExerciseAggregateType<T>>

    /**
     * Group by Exercise.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExerciseGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ExerciseGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ExerciseGroupByArgs['orderBy'] }
        : { orderBy?: ExerciseGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ExerciseGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetExerciseGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Exercise model
   */
  readonly fields: ExerciseFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Exercise.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ExerciseClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    exerciseVariations<T extends Exercise$exerciseVariationsArgs<ExtArgs> = {}>(args?: Subset<T, Exercise$exerciseVariationsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ExerciseVariationPayload<ExtArgs>, T, "findMany"> | Null>
    userRatings<T extends Exercise$userRatingsArgs<ExtArgs> = {}>(args?: Subset<T, Exercise$userRatingsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ExerciseRatingPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Exercise model
   */ 
  interface ExerciseFieldRefs {
    readonly id: FieldRef<"Exercise", 'String'>
    readonly createdAt: FieldRef<"Exercise", 'DateTime'>
    readonly updatedAt: FieldRef<"Exercise", 'DateTime'>
    readonly name: FieldRef<"Exercise", 'String'>
    readonly description: FieldRef<"Exercise", 'String'>
    readonly category: FieldRef<"Exercise", 'String'>
    readonly subcategory: FieldRef<"Exercise", 'String'>
    readonly equipment: FieldRef<"Exercise", 'String[]'>
    readonly setup: FieldRef<"Exercise", 'String'>
    readonly difficulty: FieldRef<"Exercise", 'Int'>
    readonly progression: FieldRef<"Exercise", 'String'>
    readonly primaryMuscles: FieldRef<"Exercise", 'String[]'>
    readonly secondaryMuscles: FieldRef<"Exercise", 'String[]'>
    readonly instructions: FieldRef<"Exercise", 'String'>
    readonly tips: FieldRef<"Exercise", 'String'>
    readonly videoUrl: FieldRef<"Exercise", 'String'>
    readonly imageUrl: FieldRef<"Exercise", 'String'>
    readonly safetyNotes: FieldRef<"Exercise", 'String'>
    readonly modifications: FieldRef<"Exercise", 'Json'>
    readonly contraindications: FieldRef<"Exercise", 'String'>
    readonly tags: FieldRef<"Exercise", 'String[]'>
    readonly isActive: FieldRef<"Exercise", 'Boolean'>
    readonly popularity: FieldRef<"Exercise", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * Exercise findUnique
   */
  export type ExerciseFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Exercise
     */
    select?: ExerciseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExerciseInclude<ExtArgs> | null
    /**
     * Filter, which Exercise to fetch.
     */
    where: ExerciseWhereUniqueInput
  }

  /**
   * Exercise findUniqueOrThrow
   */
  export type ExerciseFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Exercise
     */
    select?: ExerciseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExerciseInclude<ExtArgs> | null
    /**
     * Filter, which Exercise to fetch.
     */
    where: ExerciseWhereUniqueInput
  }

  /**
   * Exercise findFirst
   */
  export type ExerciseFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Exercise
     */
    select?: ExerciseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExerciseInclude<ExtArgs> | null
    /**
     * Filter, which Exercise to fetch.
     */
    where?: ExerciseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Exercises to fetch.
     */
    orderBy?: ExerciseOrderByWithRelationInput | ExerciseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Exercises.
     */
    cursor?: ExerciseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Exercises from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Exercises.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Exercises.
     */
    distinct?: ExerciseScalarFieldEnum | ExerciseScalarFieldEnum[]
  }

  /**
   * Exercise findFirstOrThrow
   */
  export type ExerciseFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Exercise
     */
    select?: ExerciseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExerciseInclude<ExtArgs> | null
    /**
     * Filter, which Exercise to fetch.
     */
    where?: ExerciseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Exercises to fetch.
     */
    orderBy?: ExerciseOrderByWithRelationInput | ExerciseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Exercises.
     */
    cursor?: ExerciseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Exercises from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Exercises.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Exercises.
     */
    distinct?: ExerciseScalarFieldEnum | ExerciseScalarFieldEnum[]
  }

  /**
   * Exercise findMany
   */
  export type ExerciseFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Exercise
     */
    select?: ExerciseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExerciseInclude<ExtArgs> | null
    /**
     * Filter, which Exercises to fetch.
     */
    where?: ExerciseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Exercises to fetch.
     */
    orderBy?: ExerciseOrderByWithRelationInput | ExerciseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Exercises.
     */
    cursor?: ExerciseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Exercises from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Exercises.
     */
    skip?: number
    distinct?: ExerciseScalarFieldEnum | ExerciseScalarFieldEnum[]
  }

  /**
   * Exercise create
   */
  export type ExerciseCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Exercise
     */
    select?: ExerciseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExerciseInclude<ExtArgs> | null
    /**
     * The data needed to create a Exercise.
     */
    data: XOR<ExerciseCreateInput, ExerciseUncheckedCreateInput>
  }

  /**
   * Exercise createMany
   */
  export type ExerciseCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Exercises.
     */
    data: ExerciseCreateManyInput | ExerciseCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Exercise createManyAndReturn
   */
  export type ExerciseCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Exercise
     */
    select?: ExerciseSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Exercises.
     */
    data: ExerciseCreateManyInput | ExerciseCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Exercise update
   */
  export type ExerciseUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Exercise
     */
    select?: ExerciseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExerciseInclude<ExtArgs> | null
    /**
     * The data needed to update a Exercise.
     */
    data: XOR<ExerciseUpdateInput, ExerciseUncheckedUpdateInput>
    /**
     * Choose, which Exercise to update.
     */
    where: ExerciseWhereUniqueInput
  }

  /**
   * Exercise updateMany
   */
  export type ExerciseUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Exercises.
     */
    data: XOR<ExerciseUpdateManyMutationInput, ExerciseUncheckedUpdateManyInput>
    /**
     * Filter which Exercises to update
     */
    where?: ExerciseWhereInput
  }

  /**
   * Exercise upsert
   */
  export type ExerciseUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Exercise
     */
    select?: ExerciseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExerciseInclude<ExtArgs> | null
    /**
     * The filter to search for the Exercise to update in case it exists.
     */
    where: ExerciseWhereUniqueInput
    /**
     * In case the Exercise found by the `where` argument doesn't exist, create a new Exercise with this data.
     */
    create: XOR<ExerciseCreateInput, ExerciseUncheckedCreateInput>
    /**
     * In case the Exercise was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ExerciseUpdateInput, ExerciseUncheckedUpdateInput>
  }

  /**
   * Exercise delete
   */
  export type ExerciseDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Exercise
     */
    select?: ExerciseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExerciseInclude<ExtArgs> | null
    /**
     * Filter which Exercise to delete.
     */
    where: ExerciseWhereUniqueInput
  }

  /**
   * Exercise deleteMany
   */
  export type ExerciseDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Exercises to delete
     */
    where?: ExerciseWhereInput
  }

  /**
   * Exercise.exerciseVariations
   */
  export type Exercise$exerciseVariationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExerciseVariation
     */
    select?: ExerciseVariationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExerciseVariationInclude<ExtArgs> | null
    where?: ExerciseVariationWhereInput
    orderBy?: ExerciseVariationOrderByWithRelationInput | ExerciseVariationOrderByWithRelationInput[]
    cursor?: ExerciseVariationWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ExerciseVariationScalarFieldEnum | ExerciseVariationScalarFieldEnum[]
  }

  /**
   * Exercise.userRatings
   */
  export type Exercise$userRatingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExerciseRating
     */
    select?: ExerciseRatingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExerciseRatingInclude<ExtArgs> | null
    where?: ExerciseRatingWhereInput
    orderBy?: ExerciseRatingOrderByWithRelationInput | ExerciseRatingOrderByWithRelationInput[]
    cursor?: ExerciseRatingWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ExerciseRatingScalarFieldEnum | ExerciseRatingScalarFieldEnum[]
  }

  /**
   * Exercise without action
   */
  export type ExerciseDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Exercise
     */
    select?: ExerciseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExerciseInclude<ExtArgs> | null
  }


  /**
   * Model ExerciseVariation
   */

  export type AggregateExerciseVariation = {
    _count: ExerciseVariationCountAggregateOutputType | null
    _avg: ExerciseVariationAvgAggregateOutputType | null
    _sum: ExerciseVariationSumAggregateOutputType | null
    _min: ExerciseVariationMinAggregateOutputType | null
    _max: ExerciseVariationMaxAggregateOutputType | null
  }

  export type ExerciseVariationAvgAggregateOutputType = {
    difficulty: number | null
  }

  export type ExerciseVariationSumAggregateOutputType = {
    difficulty: number | null
  }

  export type ExerciseVariationMinAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    updatedAt: Date | null
    exerciseId: string | null
    name: string | null
    description: string | null
    difficulty: number | null
    instructions: string | null
    tips: string | null
    videoUrl: string | null
    imageUrl: string | null
  }

  export type ExerciseVariationMaxAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    updatedAt: Date | null
    exerciseId: string | null
    name: string | null
    description: string | null
    difficulty: number | null
    instructions: string | null
    tips: string | null
    videoUrl: string | null
    imageUrl: string | null
  }

  export type ExerciseVariationCountAggregateOutputType = {
    id: number
    createdAt: number
    updatedAt: number
    exerciseId: number
    name: number
    description: number
    difficulty: number
    instructions: number
    tips: number
    videoUrl: number
    imageUrl: number
    _all: number
  }


  export type ExerciseVariationAvgAggregateInputType = {
    difficulty?: true
  }

  export type ExerciseVariationSumAggregateInputType = {
    difficulty?: true
  }

  export type ExerciseVariationMinAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    exerciseId?: true
    name?: true
    description?: true
    difficulty?: true
    instructions?: true
    tips?: true
    videoUrl?: true
    imageUrl?: true
  }

  export type ExerciseVariationMaxAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    exerciseId?: true
    name?: true
    description?: true
    difficulty?: true
    instructions?: true
    tips?: true
    videoUrl?: true
    imageUrl?: true
  }

  export type ExerciseVariationCountAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    exerciseId?: true
    name?: true
    description?: true
    difficulty?: true
    instructions?: true
    tips?: true
    videoUrl?: true
    imageUrl?: true
    _all?: true
  }

  export type ExerciseVariationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ExerciseVariation to aggregate.
     */
    where?: ExerciseVariationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ExerciseVariations to fetch.
     */
    orderBy?: ExerciseVariationOrderByWithRelationInput | ExerciseVariationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ExerciseVariationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ExerciseVariations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ExerciseVariations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ExerciseVariations
    **/
    _count?: true | ExerciseVariationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ExerciseVariationAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ExerciseVariationSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ExerciseVariationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ExerciseVariationMaxAggregateInputType
  }

  export type GetExerciseVariationAggregateType<T extends ExerciseVariationAggregateArgs> = {
        [P in keyof T & keyof AggregateExerciseVariation]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateExerciseVariation[P]>
      : GetScalarType<T[P], AggregateExerciseVariation[P]>
  }




  export type ExerciseVariationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ExerciseVariationWhereInput
    orderBy?: ExerciseVariationOrderByWithAggregationInput | ExerciseVariationOrderByWithAggregationInput[]
    by: ExerciseVariationScalarFieldEnum[] | ExerciseVariationScalarFieldEnum
    having?: ExerciseVariationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ExerciseVariationCountAggregateInputType | true
    _avg?: ExerciseVariationAvgAggregateInputType
    _sum?: ExerciseVariationSumAggregateInputType
    _min?: ExerciseVariationMinAggregateInputType
    _max?: ExerciseVariationMaxAggregateInputType
  }

  export type ExerciseVariationGroupByOutputType = {
    id: string
    createdAt: Date
    updatedAt: Date
    exerciseId: string
    name: string
    description: string
    difficulty: number
    instructions: string
    tips: string | null
    videoUrl: string | null
    imageUrl: string | null
    _count: ExerciseVariationCountAggregateOutputType | null
    _avg: ExerciseVariationAvgAggregateOutputType | null
    _sum: ExerciseVariationSumAggregateOutputType | null
    _min: ExerciseVariationMinAggregateOutputType | null
    _max: ExerciseVariationMaxAggregateOutputType | null
  }

  type GetExerciseVariationGroupByPayload<T extends ExerciseVariationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ExerciseVariationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ExerciseVariationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ExerciseVariationGroupByOutputType[P]>
            : GetScalarType<T[P], ExerciseVariationGroupByOutputType[P]>
        }
      >
    >


  export type ExerciseVariationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    exerciseId?: boolean
    name?: boolean
    description?: boolean
    difficulty?: boolean
    instructions?: boolean
    tips?: boolean
    videoUrl?: boolean
    imageUrl?: boolean
    exercise?: boolean | ExerciseDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["exerciseVariation"]>

  export type ExerciseVariationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    exerciseId?: boolean
    name?: boolean
    description?: boolean
    difficulty?: boolean
    instructions?: boolean
    tips?: boolean
    videoUrl?: boolean
    imageUrl?: boolean
    exercise?: boolean | ExerciseDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["exerciseVariation"]>

  export type ExerciseVariationSelectScalar = {
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    exerciseId?: boolean
    name?: boolean
    description?: boolean
    difficulty?: boolean
    instructions?: boolean
    tips?: boolean
    videoUrl?: boolean
    imageUrl?: boolean
  }

  export type ExerciseVariationInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    exercise?: boolean | ExerciseDefaultArgs<ExtArgs>
  }
  export type ExerciseVariationIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    exercise?: boolean | ExerciseDefaultArgs<ExtArgs>
  }

  export type $ExerciseVariationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ExerciseVariation"
    objects: {
      exercise: Prisma.$ExercisePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      createdAt: Date
      updatedAt: Date
      exerciseId: string
      name: string
      description: string
      difficulty: number
      instructions: string
      tips: string | null
      videoUrl: string | null
      imageUrl: string | null
    }, ExtArgs["result"]["exerciseVariation"]>
    composites: {}
  }

  type ExerciseVariationGetPayload<S extends boolean | null | undefined | ExerciseVariationDefaultArgs> = $Result.GetResult<Prisma.$ExerciseVariationPayload, S>

  type ExerciseVariationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ExerciseVariationFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ExerciseVariationCountAggregateInputType | true
    }

  export interface ExerciseVariationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ExerciseVariation'], meta: { name: 'ExerciseVariation' } }
    /**
     * Find zero or one ExerciseVariation that matches the filter.
     * @param {ExerciseVariationFindUniqueArgs} args - Arguments to find a ExerciseVariation
     * @example
     * // Get one ExerciseVariation
     * const exerciseVariation = await prisma.exerciseVariation.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ExerciseVariationFindUniqueArgs>(args: SelectSubset<T, ExerciseVariationFindUniqueArgs<ExtArgs>>): Prisma__ExerciseVariationClient<$Result.GetResult<Prisma.$ExerciseVariationPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ExerciseVariation that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ExerciseVariationFindUniqueOrThrowArgs} args - Arguments to find a ExerciseVariation
     * @example
     * // Get one ExerciseVariation
     * const exerciseVariation = await prisma.exerciseVariation.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ExerciseVariationFindUniqueOrThrowArgs>(args: SelectSubset<T, ExerciseVariationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ExerciseVariationClient<$Result.GetResult<Prisma.$ExerciseVariationPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ExerciseVariation that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExerciseVariationFindFirstArgs} args - Arguments to find a ExerciseVariation
     * @example
     * // Get one ExerciseVariation
     * const exerciseVariation = await prisma.exerciseVariation.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ExerciseVariationFindFirstArgs>(args?: SelectSubset<T, ExerciseVariationFindFirstArgs<ExtArgs>>): Prisma__ExerciseVariationClient<$Result.GetResult<Prisma.$ExerciseVariationPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ExerciseVariation that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExerciseVariationFindFirstOrThrowArgs} args - Arguments to find a ExerciseVariation
     * @example
     * // Get one ExerciseVariation
     * const exerciseVariation = await prisma.exerciseVariation.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ExerciseVariationFindFirstOrThrowArgs>(args?: SelectSubset<T, ExerciseVariationFindFirstOrThrowArgs<ExtArgs>>): Prisma__ExerciseVariationClient<$Result.GetResult<Prisma.$ExerciseVariationPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ExerciseVariations that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExerciseVariationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ExerciseVariations
     * const exerciseVariations = await prisma.exerciseVariation.findMany()
     * 
     * // Get first 10 ExerciseVariations
     * const exerciseVariations = await prisma.exerciseVariation.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const exerciseVariationWithIdOnly = await prisma.exerciseVariation.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ExerciseVariationFindManyArgs>(args?: SelectSubset<T, ExerciseVariationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ExerciseVariationPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ExerciseVariation.
     * @param {ExerciseVariationCreateArgs} args - Arguments to create a ExerciseVariation.
     * @example
     * // Create one ExerciseVariation
     * const ExerciseVariation = await prisma.exerciseVariation.create({
     *   data: {
     *     // ... data to create a ExerciseVariation
     *   }
     * })
     * 
     */
    create<T extends ExerciseVariationCreateArgs>(args: SelectSubset<T, ExerciseVariationCreateArgs<ExtArgs>>): Prisma__ExerciseVariationClient<$Result.GetResult<Prisma.$ExerciseVariationPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ExerciseVariations.
     * @param {ExerciseVariationCreateManyArgs} args - Arguments to create many ExerciseVariations.
     * @example
     * // Create many ExerciseVariations
     * const exerciseVariation = await prisma.exerciseVariation.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ExerciseVariationCreateManyArgs>(args?: SelectSubset<T, ExerciseVariationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ExerciseVariations and returns the data saved in the database.
     * @param {ExerciseVariationCreateManyAndReturnArgs} args - Arguments to create many ExerciseVariations.
     * @example
     * // Create many ExerciseVariations
     * const exerciseVariation = await prisma.exerciseVariation.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ExerciseVariations and only return the `id`
     * const exerciseVariationWithIdOnly = await prisma.exerciseVariation.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ExerciseVariationCreateManyAndReturnArgs>(args?: SelectSubset<T, ExerciseVariationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ExerciseVariationPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ExerciseVariation.
     * @param {ExerciseVariationDeleteArgs} args - Arguments to delete one ExerciseVariation.
     * @example
     * // Delete one ExerciseVariation
     * const ExerciseVariation = await prisma.exerciseVariation.delete({
     *   where: {
     *     // ... filter to delete one ExerciseVariation
     *   }
     * })
     * 
     */
    delete<T extends ExerciseVariationDeleteArgs>(args: SelectSubset<T, ExerciseVariationDeleteArgs<ExtArgs>>): Prisma__ExerciseVariationClient<$Result.GetResult<Prisma.$ExerciseVariationPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ExerciseVariation.
     * @param {ExerciseVariationUpdateArgs} args - Arguments to update one ExerciseVariation.
     * @example
     * // Update one ExerciseVariation
     * const exerciseVariation = await prisma.exerciseVariation.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ExerciseVariationUpdateArgs>(args: SelectSubset<T, ExerciseVariationUpdateArgs<ExtArgs>>): Prisma__ExerciseVariationClient<$Result.GetResult<Prisma.$ExerciseVariationPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ExerciseVariations.
     * @param {ExerciseVariationDeleteManyArgs} args - Arguments to filter ExerciseVariations to delete.
     * @example
     * // Delete a few ExerciseVariations
     * const { count } = await prisma.exerciseVariation.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ExerciseVariationDeleteManyArgs>(args?: SelectSubset<T, ExerciseVariationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ExerciseVariations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExerciseVariationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ExerciseVariations
     * const exerciseVariation = await prisma.exerciseVariation.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ExerciseVariationUpdateManyArgs>(args: SelectSubset<T, ExerciseVariationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ExerciseVariation.
     * @param {ExerciseVariationUpsertArgs} args - Arguments to update or create a ExerciseVariation.
     * @example
     * // Update or create a ExerciseVariation
     * const exerciseVariation = await prisma.exerciseVariation.upsert({
     *   create: {
     *     // ... data to create a ExerciseVariation
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ExerciseVariation we want to update
     *   }
     * })
     */
    upsert<T extends ExerciseVariationUpsertArgs>(args: SelectSubset<T, ExerciseVariationUpsertArgs<ExtArgs>>): Prisma__ExerciseVariationClient<$Result.GetResult<Prisma.$ExerciseVariationPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ExerciseVariations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExerciseVariationCountArgs} args - Arguments to filter ExerciseVariations to count.
     * @example
     * // Count the number of ExerciseVariations
     * const count = await prisma.exerciseVariation.count({
     *   where: {
     *     // ... the filter for the ExerciseVariations we want to count
     *   }
     * })
    **/
    count<T extends ExerciseVariationCountArgs>(
      args?: Subset<T, ExerciseVariationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ExerciseVariationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ExerciseVariation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExerciseVariationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ExerciseVariationAggregateArgs>(args: Subset<T, ExerciseVariationAggregateArgs>): Prisma.PrismaPromise<GetExerciseVariationAggregateType<T>>

    /**
     * Group by ExerciseVariation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExerciseVariationGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ExerciseVariationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ExerciseVariationGroupByArgs['orderBy'] }
        : { orderBy?: ExerciseVariationGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ExerciseVariationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetExerciseVariationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ExerciseVariation model
   */
  readonly fields: ExerciseVariationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ExerciseVariation.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ExerciseVariationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    exercise<T extends ExerciseDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ExerciseDefaultArgs<ExtArgs>>): Prisma__ExerciseClient<$Result.GetResult<Prisma.$ExercisePayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ExerciseVariation model
   */ 
  interface ExerciseVariationFieldRefs {
    readonly id: FieldRef<"ExerciseVariation", 'String'>
    readonly createdAt: FieldRef<"ExerciseVariation", 'DateTime'>
    readonly updatedAt: FieldRef<"ExerciseVariation", 'DateTime'>
    readonly exerciseId: FieldRef<"ExerciseVariation", 'String'>
    readonly name: FieldRef<"ExerciseVariation", 'String'>
    readonly description: FieldRef<"ExerciseVariation", 'String'>
    readonly difficulty: FieldRef<"ExerciseVariation", 'Int'>
    readonly instructions: FieldRef<"ExerciseVariation", 'String'>
    readonly tips: FieldRef<"ExerciseVariation", 'String'>
    readonly videoUrl: FieldRef<"ExerciseVariation", 'String'>
    readonly imageUrl: FieldRef<"ExerciseVariation", 'String'>
  }
    

  // Custom InputTypes
  /**
   * ExerciseVariation findUnique
   */
  export type ExerciseVariationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExerciseVariation
     */
    select?: ExerciseVariationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExerciseVariationInclude<ExtArgs> | null
    /**
     * Filter, which ExerciseVariation to fetch.
     */
    where: ExerciseVariationWhereUniqueInput
  }

  /**
   * ExerciseVariation findUniqueOrThrow
   */
  export type ExerciseVariationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExerciseVariation
     */
    select?: ExerciseVariationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExerciseVariationInclude<ExtArgs> | null
    /**
     * Filter, which ExerciseVariation to fetch.
     */
    where: ExerciseVariationWhereUniqueInput
  }

  /**
   * ExerciseVariation findFirst
   */
  export type ExerciseVariationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExerciseVariation
     */
    select?: ExerciseVariationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExerciseVariationInclude<ExtArgs> | null
    /**
     * Filter, which ExerciseVariation to fetch.
     */
    where?: ExerciseVariationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ExerciseVariations to fetch.
     */
    orderBy?: ExerciseVariationOrderByWithRelationInput | ExerciseVariationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ExerciseVariations.
     */
    cursor?: ExerciseVariationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ExerciseVariations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ExerciseVariations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ExerciseVariations.
     */
    distinct?: ExerciseVariationScalarFieldEnum | ExerciseVariationScalarFieldEnum[]
  }

  /**
   * ExerciseVariation findFirstOrThrow
   */
  export type ExerciseVariationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExerciseVariation
     */
    select?: ExerciseVariationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExerciseVariationInclude<ExtArgs> | null
    /**
     * Filter, which ExerciseVariation to fetch.
     */
    where?: ExerciseVariationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ExerciseVariations to fetch.
     */
    orderBy?: ExerciseVariationOrderByWithRelationInput | ExerciseVariationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ExerciseVariations.
     */
    cursor?: ExerciseVariationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ExerciseVariations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ExerciseVariations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ExerciseVariations.
     */
    distinct?: ExerciseVariationScalarFieldEnum | ExerciseVariationScalarFieldEnum[]
  }

  /**
   * ExerciseVariation findMany
   */
  export type ExerciseVariationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExerciseVariation
     */
    select?: ExerciseVariationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExerciseVariationInclude<ExtArgs> | null
    /**
     * Filter, which ExerciseVariations to fetch.
     */
    where?: ExerciseVariationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ExerciseVariations to fetch.
     */
    orderBy?: ExerciseVariationOrderByWithRelationInput | ExerciseVariationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ExerciseVariations.
     */
    cursor?: ExerciseVariationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ExerciseVariations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ExerciseVariations.
     */
    skip?: number
    distinct?: ExerciseVariationScalarFieldEnum | ExerciseVariationScalarFieldEnum[]
  }

  /**
   * ExerciseVariation create
   */
  export type ExerciseVariationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExerciseVariation
     */
    select?: ExerciseVariationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExerciseVariationInclude<ExtArgs> | null
    /**
     * The data needed to create a ExerciseVariation.
     */
    data: XOR<ExerciseVariationCreateInput, ExerciseVariationUncheckedCreateInput>
  }

  /**
   * ExerciseVariation createMany
   */
  export type ExerciseVariationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ExerciseVariations.
     */
    data: ExerciseVariationCreateManyInput | ExerciseVariationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ExerciseVariation createManyAndReturn
   */
  export type ExerciseVariationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExerciseVariation
     */
    select?: ExerciseVariationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ExerciseVariations.
     */
    data: ExerciseVariationCreateManyInput | ExerciseVariationCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExerciseVariationIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ExerciseVariation update
   */
  export type ExerciseVariationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExerciseVariation
     */
    select?: ExerciseVariationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExerciseVariationInclude<ExtArgs> | null
    /**
     * The data needed to update a ExerciseVariation.
     */
    data: XOR<ExerciseVariationUpdateInput, ExerciseVariationUncheckedUpdateInput>
    /**
     * Choose, which ExerciseVariation to update.
     */
    where: ExerciseVariationWhereUniqueInput
  }

  /**
   * ExerciseVariation updateMany
   */
  export type ExerciseVariationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ExerciseVariations.
     */
    data: XOR<ExerciseVariationUpdateManyMutationInput, ExerciseVariationUncheckedUpdateManyInput>
    /**
     * Filter which ExerciseVariations to update
     */
    where?: ExerciseVariationWhereInput
  }

  /**
   * ExerciseVariation upsert
   */
  export type ExerciseVariationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExerciseVariation
     */
    select?: ExerciseVariationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExerciseVariationInclude<ExtArgs> | null
    /**
     * The filter to search for the ExerciseVariation to update in case it exists.
     */
    where: ExerciseVariationWhereUniqueInput
    /**
     * In case the ExerciseVariation found by the `where` argument doesn't exist, create a new ExerciseVariation with this data.
     */
    create: XOR<ExerciseVariationCreateInput, ExerciseVariationUncheckedCreateInput>
    /**
     * In case the ExerciseVariation was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ExerciseVariationUpdateInput, ExerciseVariationUncheckedUpdateInput>
  }

  /**
   * ExerciseVariation delete
   */
  export type ExerciseVariationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExerciseVariation
     */
    select?: ExerciseVariationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExerciseVariationInclude<ExtArgs> | null
    /**
     * Filter which ExerciseVariation to delete.
     */
    where: ExerciseVariationWhereUniqueInput
  }

  /**
   * ExerciseVariation deleteMany
   */
  export type ExerciseVariationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ExerciseVariations to delete
     */
    where?: ExerciseVariationWhereInput
  }

  /**
   * ExerciseVariation without action
   */
  export type ExerciseVariationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExerciseVariation
     */
    select?: ExerciseVariationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExerciseVariationInclude<ExtArgs> | null
  }


  /**
   * Model ExerciseRating
   */

  export type AggregateExerciseRating = {
    _count: ExerciseRatingCountAggregateOutputType | null
    _avg: ExerciseRatingAvgAggregateOutputType | null
    _sum: ExerciseRatingSumAggregateOutputType | null
    _min: ExerciseRatingMinAggregateOutputType | null
    _max: ExerciseRatingMaxAggregateOutputType | null
  }

  export type ExerciseRatingAvgAggregateOutputType = {
    rating: number | null
    difficulty: number | null
  }

  export type ExerciseRatingSumAggregateOutputType = {
    rating: number | null
    difficulty: number | null
  }

  export type ExerciseRatingMinAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    updatedAt: Date | null
    exerciseId: string | null
    userId: string | null
    rating: number | null
    difficulty: number | null
    comment: string | null
  }

  export type ExerciseRatingMaxAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    updatedAt: Date | null
    exerciseId: string | null
    userId: string | null
    rating: number | null
    difficulty: number | null
    comment: string | null
  }

  export type ExerciseRatingCountAggregateOutputType = {
    id: number
    createdAt: number
    updatedAt: number
    exerciseId: number
    userId: number
    rating: number
    difficulty: number
    comment: number
    _all: number
  }


  export type ExerciseRatingAvgAggregateInputType = {
    rating?: true
    difficulty?: true
  }

  export type ExerciseRatingSumAggregateInputType = {
    rating?: true
    difficulty?: true
  }

  export type ExerciseRatingMinAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    exerciseId?: true
    userId?: true
    rating?: true
    difficulty?: true
    comment?: true
  }

  export type ExerciseRatingMaxAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    exerciseId?: true
    userId?: true
    rating?: true
    difficulty?: true
    comment?: true
  }

  export type ExerciseRatingCountAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    exerciseId?: true
    userId?: true
    rating?: true
    difficulty?: true
    comment?: true
    _all?: true
  }

  export type ExerciseRatingAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ExerciseRating to aggregate.
     */
    where?: ExerciseRatingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ExerciseRatings to fetch.
     */
    orderBy?: ExerciseRatingOrderByWithRelationInput | ExerciseRatingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ExerciseRatingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ExerciseRatings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ExerciseRatings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ExerciseRatings
    **/
    _count?: true | ExerciseRatingCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ExerciseRatingAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ExerciseRatingSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ExerciseRatingMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ExerciseRatingMaxAggregateInputType
  }

  export type GetExerciseRatingAggregateType<T extends ExerciseRatingAggregateArgs> = {
        [P in keyof T & keyof AggregateExerciseRating]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateExerciseRating[P]>
      : GetScalarType<T[P], AggregateExerciseRating[P]>
  }




  export type ExerciseRatingGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ExerciseRatingWhereInput
    orderBy?: ExerciseRatingOrderByWithAggregationInput | ExerciseRatingOrderByWithAggregationInput[]
    by: ExerciseRatingScalarFieldEnum[] | ExerciseRatingScalarFieldEnum
    having?: ExerciseRatingScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ExerciseRatingCountAggregateInputType | true
    _avg?: ExerciseRatingAvgAggregateInputType
    _sum?: ExerciseRatingSumAggregateInputType
    _min?: ExerciseRatingMinAggregateInputType
    _max?: ExerciseRatingMaxAggregateInputType
  }

  export type ExerciseRatingGroupByOutputType = {
    id: string
    createdAt: Date
    updatedAt: Date
    exerciseId: string
    userId: string
    rating: number
    difficulty: number
    comment: string | null
    _count: ExerciseRatingCountAggregateOutputType | null
    _avg: ExerciseRatingAvgAggregateOutputType | null
    _sum: ExerciseRatingSumAggregateOutputType | null
    _min: ExerciseRatingMinAggregateOutputType | null
    _max: ExerciseRatingMaxAggregateOutputType | null
  }

  type GetExerciseRatingGroupByPayload<T extends ExerciseRatingGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ExerciseRatingGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ExerciseRatingGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ExerciseRatingGroupByOutputType[P]>
            : GetScalarType<T[P], ExerciseRatingGroupByOutputType[P]>
        }
      >
    >


  export type ExerciseRatingSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    exerciseId?: boolean
    userId?: boolean
    rating?: boolean
    difficulty?: boolean
    comment?: boolean
    exercise?: boolean | ExerciseDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["exerciseRating"]>

  export type ExerciseRatingSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    exerciseId?: boolean
    userId?: boolean
    rating?: boolean
    difficulty?: boolean
    comment?: boolean
    exercise?: boolean | ExerciseDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["exerciseRating"]>

  export type ExerciseRatingSelectScalar = {
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    exerciseId?: boolean
    userId?: boolean
    rating?: boolean
    difficulty?: boolean
    comment?: boolean
  }

  export type ExerciseRatingInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    exercise?: boolean | ExerciseDefaultArgs<ExtArgs>
  }
  export type ExerciseRatingIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    exercise?: boolean | ExerciseDefaultArgs<ExtArgs>
  }

  export type $ExerciseRatingPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ExerciseRating"
    objects: {
      exercise: Prisma.$ExercisePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      createdAt: Date
      updatedAt: Date
      exerciseId: string
      userId: string
      rating: number
      difficulty: number
      comment: string | null
    }, ExtArgs["result"]["exerciseRating"]>
    composites: {}
  }

  type ExerciseRatingGetPayload<S extends boolean | null | undefined | ExerciseRatingDefaultArgs> = $Result.GetResult<Prisma.$ExerciseRatingPayload, S>

  type ExerciseRatingCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ExerciseRatingFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ExerciseRatingCountAggregateInputType | true
    }

  export interface ExerciseRatingDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ExerciseRating'], meta: { name: 'ExerciseRating' } }
    /**
     * Find zero or one ExerciseRating that matches the filter.
     * @param {ExerciseRatingFindUniqueArgs} args - Arguments to find a ExerciseRating
     * @example
     * // Get one ExerciseRating
     * const exerciseRating = await prisma.exerciseRating.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ExerciseRatingFindUniqueArgs>(args: SelectSubset<T, ExerciseRatingFindUniqueArgs<ExtArgs>>): Prisma__ExerciseRatingClient<$Result.GetResult<Prisma.$ExerciseRatingPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ExerciseRating that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ExerciseRatingFindUniqueOrThrowArgs} args - Arguments to find a ExerciseRating
     * @example
     * // Get one ExerciseRating
     * const exerciseRating = await prisma.exerciseRating.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ExerciseRatingFindUniqueOrThrowArgs>(args: SelectSubset<T, ExerciseRatingFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ExerciseRatingClient<$Result.GetResult<Prisma.$ExerciseRatingPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ExerciseRating that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExerciseRatingFindFirstArgs} args - Arguments to find a ExerciseRating
     * @example
     * // Get one ExerciseRating
     * const exerciseRating = await prisma.exerciseRating.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ExerciseRatingFindFirstArgs>(args?: SelectSubset<T, ExerciseRatingFindFirstArgs<ExtArgs>>): Prisma__ExerciseRatingClient<$Result.GetResult<Prisma.$ExerciseRatingPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ExerciseRating that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExerciseRatingFindFirstOrThrowArgs} args - Arguments to find a ExerciseRating
     * @example
     * // Get one ExerciseRating
     * const exerciseRating = await prisma.exerciseRating.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ExerciseRatingFindFirstOrThrowArgs>(args?: SelectSubset<T, ExerciseRatingFindFirstOrThrowArgs<ExtArgs>>): Prisma__ExerciseRatingClient<$Result.GetResult<Prisma.$ExerciseRatingPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ExerciseRatings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExerciseRatingFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ExerciseRatings
     * const exerciseRatings = await prisma.exerciseRating.findMany()
     * 
     * // Get first 10 ExerciseRatings
     * const exerciseRatings = await prisma.exerciseRating.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const exerciseRatingWithIdOnly = await prisma.exerciseRating.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ExerciseRatingFindManyArgs>(args?: SelectSubset<T, ExerciseRatingFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ExerciseRatingPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ExerciseRating.
     * @param {ExerciseRatingCreateArgs} args - Arguments to create a ExerciseRating.
     * @example
     * // Create one ExerciseRating
     * const ExerciseRating = await prisma.exerciseRating.create({
     *   data: {
     *     // ... data to create a ExerciseRating
     *   }
     * })
     * 
     */
    create<T extends ExerciseRatingCreateArgs>(args: SelectSubset<T, ExerciseRatingCreateArgs<ExtArgs>>): Prisma__ExerciseRatingClient<$Result.GetResult<Prisma.$ExerciseRatingPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ExerciseRatings.
     * @param {ExerciseRatingCreateManyArgs} args - Arguments to create many ExerciseRatings.
     * @example
     * // Create many ExerciseRatings
     * const exerciseRating = await prisma.exerciseRating.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ExerciseRatingCreateManyArgs>(args?: SelectSubset<T, ExerciseRatingCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ExerciseRatings and returns the data saved in the database.
     * @param {ExerciseRatingCreateManyAndReturnArgs} args - Arguments to create many ExerciseRatings.
     * @example
     * // Create many ExerciseRatings
     * const exerciseRating = await prisma.exerciseRating.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ExerciseRatings and only return the `id`
     * const exerciseRatingWithIdOnly = await prisma.exerciseRating.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ExerciseRatingCreateManyAndReturnArgs>(args?: SelectSubset<T, ExerciseRatingCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ExerciseRatingPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ExerciseRating.
     * @param {ExerciseRatingDeleteArgs} args - Arguments to delete one ExerciseRating.
     * @example
     * // Delete one ExerciseRating
     * const ExerciseRating = await prisma.exerciseRating.delete({
     *   where: {
     *     // ... filter to delete one ExerciseRating
     *   }
     * })
     * 
     */
    delete<T extends ExerciseRatingDeleteArgs>(args: SelectSubset<T, ExerciseRatingDeleteArgs<ExtArgs>>): Prisma__ExerciseRatingClient<$Result.GetResult<Prisma.$ExerciseRatingPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ExerciseRating.
     * @param {ExerciseRatingUpdateArgs} args - Arguments to update one ExerciseRating.
     * @example
     * // Update one ExerciseRating
     * const exerciseRating = await prisma.exerciseRating.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ExerciseRatingUpdateArgs>(args: SelectSubset<T, ExerciseRatingUpdateArgs<ExtArgs>>): Prisma__ExerciseRatingClient<$Result.GetResult<Prisma.$ExerciseRatingPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ExerciseRatings.
     * @param {ExerciseRatingDeleteManyArgs} args - Arguments to filter ExerciseRatings to delete.
     * @example
     * // Delete a few ExerciseRatings
     * const { count } = await prisma.exerciseRating.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ExerciseRatingDeleteManyArgs>(args?: SelectSubset<T, ExerciseRatingDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ExerciseRatings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExerciseRatingUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ExerciseRatings
     * const exerciseRating = await prisma.exerciseRating.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ExerciseRatingUpdateManyArgs>(args: SelectSubset<T, ExerciseRatingUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ExerciseRating.
     * @param {ExerciseRatingUpsertArgs} args - Arguments to update or create a ExerciseRating.
     * @example
     * // Update or create a ExerciseRating
     * const exerciseRating = await prisma.exerciseRating.upsert({
     *   create: {
     *     // ... data to create a ExerciseRating
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ExerciseRating we want to update
     *   }
     * })
     */
    upsert<T extends ExerciseRatingUpsertArgs>(args: SelectSubset<T, ExerciseRatingUpsertArgs<ExtArgs>>): Prisma__ExerciseRatingClient<$Result.GetResult<Prisma.$ExerciseRatingPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ExerciseRatings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExerciseRatingCountArgs} args - Arguments to filter ExerciseRatings to count.
     * @example
     * // Count the number of ExerciseRatings
     * const count = await prisma.exerciseRating.count({
     *   where: {
     *     // ... the filter for the ExerciseRatings we want to count
     *   }
     * })
    **/
    count<T extends ExerciseRatingCountArgs>(
      args?: Subset<T, ExerciseRatingCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ExerciseRatingCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ExerciseRating.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExerciseRatingAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ExerciseRatingAggregateArgs>(args: Subset<T, ExerciseRatingAggregateArgs>): Prisma.PrismaPromise<GetExerciseRatingAggregateType<T>>

    /**
     * Group by ExerciseRating.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExerciseRatingGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ExerciseRatingGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ExerciseRatingGroupByArgs['orderBy'] }
        : { orderBy?: ExerciseRatingGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ExerciseRatingGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetExerciseRatingGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ExerciseRating model
   */
  readonly fields: ExerciseRatingFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ExerciseRating.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ExerciseRatingClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    exercise<T extends ExerciseDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ExerciseDefaultArgs<ExtArgs>>): Prisma__ExerciseClient<$Result.GetResult<Prisma.$ExercisePayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ExerciseRating model
   */ 
  interface ExerciseRatingFieldRefs {
    readonly id: FieldRef<"ExerciseRating", 'String'>
    readonly createdAt: FieldRef<"ExerciseRating", 'DateTime'>
    readonly updatedAt: FieldRef<"ExerciseRating", 'DateTime'>
    readonly exerciseId: FieldRef<"ExerciseRating", 'String'>
    readonly userId: FieldRef<"ExerciseRating", 'String'>
    readonly rating: FieldRef<"ExerciseRating", 'Int'>
    readonly difficulty: FieldRef<"ExerciseRating", 'Int'>
    readonly comment: FieldRef<"ExerciseRating", 'String'>
  }
    

  // Custom InputTypes
  /**
   * ExerciseRating findUnique
   */
  export type ExerciseRatingFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExerciseRating
     */
    select?: ExerciseRatingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExerciseRatingInclude<ExtArgs> | null
    /**
     * Filter, which ExerciseRating to fetch.
     */
    where: ExerciseRatingWhereUniqueInput
  }

  /**
   * ExerciseRating findUniqueOrThrow
   */
  export type ExerciseRatingFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExerciseRating
     */
    select?: ExerciseRatingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExerciseRatingInclude<ExtArgs> | null
    /**
     * Filter, which ExerciseRating to fetch.
     */
    where: ExerciseRatingWhereUniqueInput
  }

  /**
   * ExerciseRating findFirst
   */
  export type ExerciseRatingFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExerciseRating
     */
    select?: ExerciseRatingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExerciseRatingInclude<ExtArgs> | null
    /**
     * Filter, which ExerciseRating to fetch.
     */
    where?: ExerciseRatingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ExerciseRatings to fetch.
     */
    orderBy?: ExerciseRatingOrderByWithRelationInput | ExerciseRatingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ExerciseRatings.
     */
    cursor?: ExerciseRatingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ExerciseRatings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ExerciseRatings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ExerciseRatings.
     */
    distinct?: ExerciseRatingScalarFieldEnum | ExerciseRatingScalarFieldEnum[]
  }

  /**
   * ExerciseRating findFirstOrThrow
   */
  export type ExerciseRatingFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExerciseRating
     */
    select?: ExerciseRatingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExerciseRatingInclude<ExtArgs> | null
    /**
     * Filter, which ExerciseRating to fetch.
     */
    where?: ExerciseRatingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ExerciseRatings to fetch.
     */
    orderBy?: ExerciseRatingOrderByWithRelationInput | ExerciseRatingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ExerciseRatings.
     */
    cursor?: ExerciseRatingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ExerciseRatings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ExerciseRatings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ExerciseRatings.
     */
    distinct?: ExerciseRatingScalarFieldEnum | ExerciseRatingScalarFieldEnum[]
  }

  /**
   * ExerciseRating findMany
   */
  export type ExerciseRatingFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExerciseRating
     */
    select?: ExerciseRatingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExerciseRatingInclude<ExtArgs> | null
    /**
     * Filter, which ExerciseRatings to fetch.
     */
    where?: ExerciseRatingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ExerciseRatings to fetch.
     */
    orderBy?: ExerciseRatingOrderByWithRelationInput | ExerciseRatingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ExerciseRatings.
     */
    cursor?: ExerciseRatingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ExerciseRatings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ExerciseRatings.
     */
    skip?: number
    distinct?: ExerciseRatingScalarFieldEnum | ExerciseRatingScalarFieldEnum[]
  }

  /**
   * ExerciseRating create
   */
  export type ExerciseRatingCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExerciseRating
     */
    select?: ExerciseRatingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExerciseRatingInclude<ExtArgs> | null
    /**
     * The data needed to create a ExerciseRating.
     */
    data: XOR<ExerciseRatingCreateInput, ExerciseRatingUncheckedCreateInput>
  }

  /**
   * ExerciseRating createMany
   */
  export type ExerciseRatingCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ExerciseRatings.
     */
    data: ExerciseRatingCreateManyInput | ExerciseRatingCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ExerciseRating createManyAndReturn
   */
  export type ExerciseRatingCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExerciseRating
     */
    select?: ExerciseRatingSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ExerciseRatings.
     */
    data: ExerciseRatingCreateManyInput | ExerciseRatingCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExerciseRatingIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ExerciseRating update
   */
  export type ExerciseRatingUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExerciseRating
     */
    select?: ExerciseRatingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExerciseRatingInclude<ExtArgs> | null
    /**
     * The data needed to update a ExerciseRating.
     */
    data: XOR<ExerciseRatingUpdateInput, ExerciseRatingUncheckedUpdateInput>
    /**
     * Choose, which ExerciseRating to update.
     */
    where: ExerciseRatingWhereUniqueInput
  }

  /**
   * ExerciseRating updateMany
   */
  export type ExerciseRatingUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ExerciseRatings.
     */
    data: XOR<ExerciseRatingUpdateManyMutationInput, ExerciseRatingUncheckedUpdateManyInput>
    /**
     * Filter which ExerciseRatings to update
     */
    where?: ExerciseRatingWhereInput
  }

  /**
   * ExerciseRating upsert
   */
  export type ExerciseRatingUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExerciseRating
     */
    select?: ExerciseRatingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExerciseRatingInclude<ExtArgs> | null
    /**
     * The filter to search for the ExerciseRating to update in case it exists.
     */
    where: ExerciseRatingWhereUniqueInput
    /**
     * In case the ExerciseRating found by the `where` argument doesn't exist, create a new ExerciseRating with this data.
     */
    create: XOR<ExerciseRatingCreateInput, ExerciseRatingUncheckedCreateInput>
    /**
     * In case the ExerciseRating was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ExerciseRatingUpdateInput, ExerciseRatingUncheckedUpdateInput>
  }

  /**
   * ExerciseRating delete
   */
  export type ExerciseRatingDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExerciseRating
     */
    select?: ExerciseRatingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExerciseRatingInclude<ExtArgs> | null
    /**
     * Filter which ExerciseRating to delete.
     */
    where: ExerciseRatingWhereUniqueInput
  }

  /**
   * ExerciseRating deleteMany
   */
  export type ExerciseRatingDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ExerciseRatings to delete
     */
    where?: ExerciseRatingWhereInput
  }

  /**
   * ExerciseRating without action
   */
  export type ExerciseRatingDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExerciseRating
     */
    select?: ExerciseRatingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ExerciseRatingInclude<ExtArgs> | null
  }


  /**
   * Model ExerciseCategory
   */

  export type AggregateExerciseCategory = {
    _count: ExerciseCategoryCountAggregateOutputType | null
    _avg: ExerciseCategoryAvgAggregateOutputType | null
    _sum: ExerciseCategorySumAggregateOutputType | null
    _min: ExerciseCategoryMinAggregateOutputType | null
    _max: ExerciseCategoryMaxAggregateOutputType | null
  }

  export type ExerciseCategoryAvgAggregateOutputType = {
    order: number | null
  }

  export type ExerciseCategorySumAggregateOutputType = {
    order: number | null
  }

  export type ExerciseCategoryMinAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    updatedAt: Date | null
    name: string | null
    description: string | null
    icon: string | null
    color: string | null
    order: number | null
  }

  export type ExerciseCategoryMaxAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    updatedAt: Date | null
    name: string | null
    description: string | null
    icon: string | null
    color: string | null
    order: number | null
  }

  export type ExerciseCategoryCountAggregateOutputType = {
    id: number
    createdAt: number
    updatedAt: number
    name: number
    description: number
    icon: number
    color: number
    order: number
    _all: number
  }


  export type ExerciseCategoryAvgAggregateInputType = {
    order?: true
  }

  export type ExerciseCategorySumAggregateInputType = {
    order?: true
  }

  export type ExerciseCategoryMinAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    name?: true
    description?: true
    icon?: true
    color?: true
    order?: true
  }

  export type ExerciseCategoryMaxAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    name?: true
    description?: true
    icon?: true
    color?: true
    order?: true
  }

  export type ExerciseCategoryCountAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    name?: true
    description?: true
    icon?: true
    color?: true
    order?: true
    _all?: true
  }

  export type ExerciseCategoryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ExerciseCategory to aggregate.
     */
    where?: ExerciseCategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ExerciseCategories to fetch.
     */
    orderBy?: ExerciseCategoryOrderByWithRelationInput | ExerciseCategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ExerciseCategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ExerciseCategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ExerciseCategories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ExerciseCategories
    **/
    _count?: true | ExerciseCategoryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ExerciseCategoryAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ExerciseCategorySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ExerciseCategoryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ExerciseCategoryMaxAggregateInputType
  }

  export type GetExerciseCategoryAggregateType<T extends ExerciseCategoryAggregateArgs> = {
        [P in keyof T & keyof AggregateExerciseCategory]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateExerciseCategory[P]>
      : GetScalarType<T[P], AggregateExerciseCategory[P]>
  }




  export type ExerciseCategoryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ExerciseCategoryWhereInput
    orderBy?: ExerciseCategoryOrderByWithAggregationInput | ExerciseCategoryOrderByWithAggregationInput[]
    by: ExerciseCategoryScalarFieldEnum[] | ExerciseCategoryScalarFieldEnum
    having?: ExerciseCategoryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ExerciseCategoryCountAggregateInputType | true
    _avg?: ExerciseCategoryAvgAggregateInputType
    _sum?: ExerciseCategorySumAggregateInputType
    _min?: ExerciseCategoryMinAggregateInputType
    _max?: ExerciseCategoryMaxAggregateInputType
  }

  export type ExerciseCategoryGroupByOutputType = {
    id: string
    createdAt: Date
    updatedAt: Date
    name: string
    description: string
    icon: string | null
    color: string | null
    order: number
    _count: ExerciseCategoryCountAggregateOutputType | null
    _avg: ExerciseCategoryAvgAggregateOutputType | null
    _sum: ExerciseCategorySumAggregateOutputType | null
    _min: ExerciseCategoryMinAggregateOutputType | null
    _max: ExerciseCategoryMaxAggregateOutputType | null
  }

  type GetExerciseCategoryGroupByPayload<T extends ExerciseCategoryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ExerciseCategoryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ExerciseCategoryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ExerciseCategoryGroupByOutputType[P]>
            : GetScalarType<T[P], ExerciseCategoryGroupByOutputType[P]>
        }
      >
    >


  export type ExerciseCategorySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    name?: boolean
    description?: boolean
    icon?: boolean
    color?: boolean
    order?: boolean
  }, ExtArgs["result"]["exerciseCategory"]>

  export type ExerciseCategorySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    name?: boolean
    description?: boolean
    icon?: boolean
    color?: boolean
    order?: boolean
  }, ExtArgs["result"]["exerciseCategory"]>

  export type ExerciseCategorySelectScalar = {
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    name?: boolean
    description?: boolean
    icon?: boolean
    color?: boolean
    order?: boolean
  }


  export type $ExerciseCategoryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ExerciseCategory"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      createdAt: Date
      updatedAt: Date
      name: string
      description: string
      icon: string | null
      color: string | null
      order: number
    }, ExtArgs["result"]["exerciseCategory"]>
    composites: {}
  }

  type ExerciseCategoryGetPayload<S extends boolean | null | undefined | ExerciseCategoryDefaultArgs> = $Result.GetResult<Prisma.$ExerciseCategoryPayload, S>

  type ExerciseCategoryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ExerciseCategoryFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ExerciseCategoryCountAggregateInputType | true
    }

  export interface ExerciseCategoryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ExerciseCategory'], meta: { name: 'ExerciseCategory' } }
    /**
     * Find zero or one ExerciseCategory that matches the filter.
     * @param {ExerciseCategoryFindUniqueArgs} args - Arguments to find a ExerciseCategory
     * @example
     * // Get one ExerciseCategory
     * const exerciseCategory = await prisma.exerciseCategory.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ExerciseCategoryFindUniqueArgs>(args: SelectSubset<T, ExerciseCategoryFindUniqueArgs<ExtArgs>>): Prisma__ExerciseCategoryClient<$Result.GetResult<Prisma.$ExerciseCategoryPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ExerciseCategory that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ExerciseCategoryFindUniqueOrThrowArgs} args - Arguments to find a ExerciseCategory
     * @example
     * // Get one ExerciseCategory
     * const exerciseCategory = await prisma.exerciseCategory.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ExerciseCategoryFindUniqueOrThrowArgs>(args: SelectSubset<T, ExerciseCategoryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ExerciseCategoryClient<$Result.GetResult<Prisma.$ExerciseCategoryPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ExerciseCategory that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExerciseCategoryFindFirstArgs} args - Arguments to find a ExerciseCategory
     * @example
     * // Get one ExerciseCategory
     * const exerciseCategory = await prisma.exerciseCategory.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ExerciseCategoryFindFirstArgs>(args?: SelectSubset<T, ExerciseCategoryFindFirstArgs<ExtArgs>>): Prisma__ExerciseCategoryClient<$Result.GetResult<Prisma.$ExerciseCategoryPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ExerciseCategory that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExerciseCategoryFindFirstOrThrowArgs} args - Arguments to find a ExerciseCategory
     * @example
     * // Get one ExerciseCategory
     * const exerciseCategory = await prisma.exerciseCategory.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ExerciseCategoryFindFirstOrThrowArgs>(args?: SelectSubset<T, ExerciseCategoryFindFirstOrThrowArgs<ExtArgs>>): Prisma__ExerciseCategoryClient<$Result.GetResult<Prisma.$ExerciseCategoryPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ExerciseCategories that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExerciseCategoryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ExerciseCategories
     * const exerciseCategories = await prisma.exerciseCategory.findMany()
     * 
     * // Get first 10 ExerciseCategories
     * const exerciseCategories = await prisma.exerciseCategory.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const exerciseCategoryWithIdOnly = await prisma.exerciseCategory.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ExerciseCategoryFindManyArgs>(args?: SelectSubset<T, ExerciseCategoryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ExerciseCategoryPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ExerciseCategory.
     * @param {ExerciseCategoryCreateArgs} args - Arguments to create a ExerciseCategory.
     * @example
     * // Create one ExerciseCategory
     * const ExerciseCategory = await prisma.exerciseCategory.create({
     *   data: {
     *     // ... data to create a ExerciseCategory
     *   }
     * })
     * 
     */
    create<T extends ExerciseCategoryCreateArgs>(args: SelectSubset<T, ExerciseCategoryCreateArgs<ExtArgs>>): Prisma__ExerciseCategoryClient<$Result.GetResult<Prisma.$ExerciseCategoryPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ExerciseCategories.
     * @param {ExerciseCategoryCreateManyArgs} args - Arguments to create many ExerciseCategories.
     * @example
     * // Create many ExerciseCategories
     * const exerciseCategory = await prisma.exerciseCategory.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ExerciseCategoryCreateManyArgs>(args?: SelectSubset<T, ExerciseCategoryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ExerciseCategories and returns the data saved in the database.
     * @param {ExerciseCategoryCreateManyAndReturnArgs} args - Arguments to create many ExerciseCategories.
     * @example
     * // Create many ExerciseCategories
     * const exerciseCategory = await prisma.exerciseCategory.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ExerciseCategories and only return the `id`
     * const exerciseCategoryWithIdOnly = await prisma.exerciseCategory.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ExerciseCategoryCreateManyAndReturnArgs>(args?: SelectSubset<T, ExerciseCategoryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ExerciseCategoryPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ExerciseCategory.
     * @param {ExerciseCategoryDeleteArgs} args - Arguments to delete one ExerciseCategory.
     * @example
     * // Delete one ExerciseCategory
     * const ExerciseCategory = await prisma.exerciseCategory.delete({
     *   where: {
     *     // ... filter to delete one ExerciseCategory
     *   }
     * })
     * 
     */
    delete<T extends ExerciseCategoryDeleteArgs>(args: SelectSubset<T, ExerciseCategoryDeleteArgs<ExtArgs>>): Prisma__ExerciseCategoryClient<$Result.GetResult<Prisma.$ExerciseCategoryPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ExerciseCategory.
     * @param {ExerciseCategoryUpdateArgs} args - Arguments to update one ExerciseCategory.
     * @example
     * // Update one ExerciseCategory
     * const exerciseCategory = await prisma.exerciseCategory.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ExerciseCategoryUpdateArgs>(args: SelectSubset<T, ExerciseCategoryUpdateArgs<ExtArgs>>): Prisma__ExerciseCategoryClient<$Result.GetResult<Prisma.$ExerciseCategoryPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ExerciseCategories.
     * @param {ExerciseCategoryDeleteManyArgs} args - Arguments to filter ExerciseCategories to delete.
     * @example
     * // Delete a few ExerciseCategories
     * const { count } = await prisma.exerciseCategory.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ExerciseCategoryDeleteManyArgs>(args?: SelectSubset<T, ExerciseCategoryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ExerciseCategories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExerciseCategoryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ExerciseCategories
     * const exerciseCategory = await prisma.exerciseCategory.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ExerciseCategoryUpdateManyArgs>(args: SelectSubset<T, ExerciseCategoryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ExerciseCategory.
     * @param {ExerciseCategoryUpsertArgs} args - Arguments to update or create a ExerciseCategory.
     * @example
     * // Update or create a ExerciseCategory
     * const exerciseCategory = await prisma.exerciseCategory.upsert({
     *   create: {
     *     // ... data to create a ExerciseCategory
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ExerciseCategory we want to update
     *   }
     * })
     */
    upsert<T extends ExerciseCategoryUpsertArgs>(args: SelectSubset<T, ExerciseCategoryUpsertArgs<ExtArgs>>): Prisma__ExerciseCategoryClient<$Result.GetResult<Prisma.$ExerciseCategoryPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ExerciseCategories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExerciseCategoryCountArgs} args - Arguments to filter ExerciseCategories to count.
     * @example
     * // Count the number of ExerciseCategories
     * const count = await prisma.exerciseCategory.count({
     *   where: {
     *     // ... the filter for the ExerciseCategories we want to count
     *   }
     * })
    **/
    count<T extends ExerciseCategoryCountArgs>(
      args?: Subset<T, ExerciseCategoryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ExerciseCategoryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ExerciseCategory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExerciseCategoryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ExerciseCategoryAggregateArgs>(args: Subset<T, ExerciseCategoryAggregateArgs>): Prisma.PrismaPromise<GetExerciseCategoryAggregateType<T>>

    /**
     * Group by ExerciseCategory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExerciseCategoryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ExerciseCategoryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ExerciseCategoryGroupByArgs['orderBy'] }
        : { orderBy?: ExerciseCategoryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ExerciseCategoryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetExerciseCategoryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ExerciseCategory model
   */
  readonly fields: ExerciseCategoryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ExerciseCategory.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ExerciseCategoryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ExerciseCategory model
   */ 
  interface ExerciseCategoryFieldRefs {
    readonly id: FieldRef<"ExerciseCategory", 'String'>
    readonly createdAt: FieldRef<"ExerciseCategory", 'DateTime'>
    readonly updatedAt: FieldRef<"ExerciseCategory", 'DateTime'>
    readonly name: FieldRef<"ExerciseCategory", 'String'>
    readonly description: FieldRef<"ExerciseCategory", 'String'>
    readonly icon: FieldRef<"ExerciseCategory", 'String'>
    readonly color: FieldRef<"ExerciseCategory", 'String'>
    readonly order: FieldRef<"ExerciseCategory", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * ExerciseCategory findUnique
   */
  export type ExerciseCategoryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExerciseCategory
     */
    select?: ExerciseCategorySelect<ExtArgs> | null
    /**
     * Filter, which ExerciseCategory to fetch.
     */
    where: ExerciseCategoryWhereUniqueInput
  }

  /**
   * ExerciseCategory findUniqueOrThrow
   */
  export type ExerciseCategoryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExerciseCategory
     */
    select?: ExerciseCategorySelect<ExtArgs> | null
    /**
     * Filter, which ExerciseCategory to fetch.
     */
    where: ExerciseCategoryWhereUniqueInput
  }

  /**
   * ExerciseCategory findFirst
   */
  export type ExerciseCategoryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExerciseCategory
     */
    select?: ExerciseCategorySelect<ExtArgs> | null
    /**
     * Filter, which ExerciseCategory to fetch.
     */
    where?: ExerciseCategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ExerciseCategories to fetch.
     */
    orderBy?: ExerciseCategoryOrderByWithRelationInput | ExerciseCategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ExerciseCategories.
     */
    cursor?: ExerciseCategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ExerciseCategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ExerciseCategories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ExerciseCategories.
     */
    distinct?: ExerciseCategoryScalarFieldEnum | ExerciseCategoryScalarFieldEnum[]
  }

  /**
   * ExerciseCategory findFirstOrThrow
   */
  export type ExerciseCategoryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExerciseCategory
     */
    select?: ExerciseCategorySelect<ExtArgs> | null
    /**
     * Filter, which ExerciseCategory to fetch.
     */
    where?: ExerciseCategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ExerciseCategories to fetch.
     */
    orderBy?: ExerciseCategoryOrderByWithRelationInput | ExerciseCategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ExerciseCategories.
     */
    cursor?: ExerciseCategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ExerciseCategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ExerciseCategories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ExerciseCategories.
     */
    distinct?: ExerciseCategoryScalarFieldEnum | ExerciseCategoryScalarFieldEnum[]
  }

  /**
   * ExerciseCategory findMany
   */
  export type ExerciseCategoryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExerciseCategory
     */
    select?: ExerciseCategorySelect<ExtArgs> | null
    /**
     * Filter, which ExerciseCategories to fetch.
     */
    where?: ExerciseCategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ExerciseCategories to fetch.
     */
    orderBy?: ExerciseCategoryOrderByWithRelationInput | ExerciseCategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ExerciseCategories.
     */
    cursor?: ExerciseCategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ExerciseCategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ExerciseCategories.
     */
    skip?: number
    distinct?: ExerciseCategoryScalarFieldEnum | ExerciseCategoryScalarFieldEnum[]
  }

  /**
   * ExerciseCategory create
   */
  export type ExerciseCategoryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExerciseCategory
     */
    select?: ExerciseCategorySelect<ExtArgs> | null
    /**
     * The data needed to create a ExerciseCategory.
     */
    data: XOR<ExerciseCategoryCreateInput, ExerciseCategoryUncheckedCreateInput>
  }

  /**
   * ExerciseCategory createMany
   */
  export type ExerciseCategoryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ExerciseCategories.
     */
    data: ExerciseCategoryCreateManyInput | ExerciseCategoryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ExerciseCategory createManyAndReturn
   */
  export type ExerciseCategoryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExerciseCategory
     */
    select?: ExerciseCategorySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ExerciseCategories.
     */
    data: ExerciseCategoryCreateManyInput | ExerciseCategoryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ExerciseCategory update
   */
  export type ExerciseCategoryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExerciseCategory
     */
    select?: ExerciseCategorySelect<ExtArgs> | null
    /**
     * The data needed to update a ExerciseCategory.
     */
    data: XOR<ExerciseCategoryUpdateInput, ExerciseCategoryUncheckedUpdateInput>
    /**
     * Choose, which ExerciseCategory to update.
     */
    where: ExerciseCategoryWhereUniqueInput
  }

  /**
   * ExerciseCategory updateMany
   */
  export type ExerciseCategoryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ExerciseCategories.
     */
    data: XOR<ExerciseCategoryUpdateManyMutationInput, ExerciseCategoryUncheckedUpdateManyInput>
    /**
     * Filter which ExerciseCategories to update
     */
    where?: ExerciseCategoryWhereInput
  }

  /**
   * ExerciseCategory upsert
   */
  export type ExerciseCategoryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExerciseCategory
     */
    select?: ExerciseCategorySelect<ExtArgs> | null
    /**
     * The filter to search for the ExerciseCategory to update in case it exists.
     */
    where: ExerciseCategoryWhereUniqueInput
    /**
     * In case the ExerciseCategory found by the `where` argument doesn't exist, create a new ExerciseCategory with this data.
     */
    create: XOR<ExerciseCategoryCreateInput, ExerciseCategoryUncheckedCreateInput>
    /**
     * In case the ExerciseCategory was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ExerciseCategoryUpdateInput, ExerciseCategoryUncheckedUpdateInput>
  }

  /**
   * ExerciseCategory delete
   */
  export type ExerciseCategoryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExerciseCategory
     */
    select?: ExerciseCategorySelect<ExtArgs> | null
    /**
     * Filter which ExerciseCategory to delete.
     */
    where: ExerciseCategoryWhereUniqueInput
  }

  /**
   * ExerciseCategory deleteMany
   */
  export type ExerciseCategoryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ExerciseCategories to delete
     */
    where?: ExerciseCategoryWhereInput
  }

  /**
   * ExerciseCategory without action
   */
  export type ExerciseCategoryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExerciseCategory
     */
    select?: ExerciseCategorySelect<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const ExerciseScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    name: 'name',
    description: 'description',
    category: 'category',
    subcategory: 'subcategory',
    equipment: 'equipment',
    setup: 'setup',
    difficulty: 'difficulty',
    progression: 'progression',
    primaryMuscles: 'primaryMuscles',
    secondaryMuscles: 'secondaryMuscles',
    instructions: 'instructions',
    tips: 'tips',
    videoUrl: 'videoUrl',
    imageUrl: 'imageUrl',
    safetyNotes: 'safetyNotes',
    modifications: 'modifications',
    contraindications: 'contraindications',
    tags: 'tags',
    isActive: 'isActive',
    popularity: 'popularity'
  };

  export type ExerciseScalarFieldEnum = (typeof ExerciseScalarFieldEnum)[keyof typeof ExerciseScalarFieldEnum]


  export const ExerciseVariationScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    exerciseId: 'exerciseId',
    name: 'name',
    description: 'description',
    difficulty: 'difficulty',
    instructions: 'instructions',
    tips: 'tips',
    videoUrl: 'videoUrl',
    imageUrl: 'imageUrl'
  };

  export type ExerciseVariationScalarFieldEnum = (typeof ExerciseVariationScalarFieldEnum)[keyof typeof ExerciseVariationScalarFieldEnum]


  export const ExerciseRatingScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    exerciseId: 'exerciseId',
    userId: 'userId',
    rating: 'rating',
    difficulty: 'difficulty',
    comment: 'comment'
  };

  export type ExerciseRatingScalarFieldEnum = (typeof ExerciseRatingScalarFieldEnum)[keyof typeof ExerciseRatingScalarFieldEnum]


  export const ExerciseCategoryScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    name: 'name',
    description: 'description',
    icon: 'icon',
    color: 'color',
    order: 'order'
  };

  export type ExerciseCategoryScalarFieldEnum = (typeof ExerciseCategoryScalarFieldEnum)[keyof typeof ExerciseCategoryScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type ExerciseWhereInput = {
    AND?: ExerciseWhereInput | ExerciseWhereInput[]
    OR?: ExerciseWhereInput[]
    NOT?: ExerciseWhereInput | ExerciseWhereInput[]
    id?: StringFilter<"Exercise"> | string
    createdAt?: DateTimeFilter<"Exercise"> | Date | string
    updatedAt?: DateTimeFilter<"Exercise"> | Date | string
    name?: StringFilter<"Exercise"> | string
    description?: StringFilter<"Exercise"> | string
    category?: StringFilter<"Exercise"> | string
    subcategory?: StringNullableFilter<"Exercise"> | string | null
    equipment?: StringNullableListFilter<"Exercise">
    setup?: StringNullableFilter<"Exercise"> | string | null
    difficulty?: IntFilter<"Exercise"> | number
    progression?: StringNullableFilter<"Exercise"> | string | null
    primaryMuscles?: StringNullableListFilter<"Exercise">
    secondaryMuscles?: StringNullableListFilter<"Exercise">
    instructions?: StringFilter<"Exercise"> | string
    tips?: StringNullableFilter<"Exercise"> | string | null
    videoUrl?: StringNullableFilter<"Exercise"> | string | null
    imageUrl?: StringNullableFilter<"Exercise"> | string | null
    safetyNotes?: StringNullableFilter<"Exercise"> | string | null
    modifications?: JsonNullableFilter<"Exercise">
    contraindications?: StringNullableFilter<"Exercise"> | string | null
    tags?: StringNullableListFilter<"Exercise">
    isActive?: BoolFilter<"Exercise"> | boolean
    popularity?: IntFilter<"Exercise"> | number
    exerciseVariations?: ExerciseVariationListRelationFilter
    userRatings?: ExerciseRatingListRelationFilter
  }

  export type ExerciseOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    name?: SortOrder
    description?: SortOrder
    category?: SortOrder
    subcategory?: SortOrderInput | SortOrder
    equipment?: SortOrder
    setup?: SortOrderInput | SortOrder
    difficulty?: SortOrder
    progression?: SortOrderInput | SortOrder
    primaryMuscles?: SortOrder
    secondaryMuscles?: SortOrder
    instructions?: SortOrder
    tips?: SortOrderInput | SortOrder
    videoUrl?: SortOrderInput | SortOrder
    imageUrl?: SortOrderInput | SortOrder
    safetyNotes?: SortOrderInput | SortOrder
    modifications?: SortOrderInput | SortOrder
    contraindications?: SortOrderInput | SortOrder
    tags?: SortOrder
    isActive?: SortOrder
    popularity?: SortOrder
    exerciseVariations?: ExerciseVariationOrderByRelationAggregateInput
    userRatings?: ExerciseRatingOrderByRelationAggregateInput
  }

  export type ExerciseWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ExerciseWhereInput | ExerciseWhereInput[]
    OR?: ExerciseWhereInput[]
    NOT?: ExerciseWhereInput | ExerciseWhereInput[]
    createdAt?: DateTimeFilter<"Exercise"> | Date | string
    updatedAt?: DateTimeFilter<"Exercise"> | Date | string
    name?: StringFilter<"Exercise"> | string
    description?: StringFilter<"Exercise"> | string
    category?: StringFilter<"Exercise"> | string
    subcategory?: StringNullableFilter<"Exercise"> | string | null
    equipment?: StringNullableListFilter<"Exercise">
    setup?: StringNullableFilter<"Exercise"> | string | null
    difficulty?: IntFilter<"Exercise"> | number
    progression?: StringNullableFilter<"Exercise"> | string | null
    primaryMuscles?: StringNullableListFilter<"Exercise">
    secondaryMuscles?: StringNullableListFilter<"Exercise">
    instructions?: StringFilter<"Exercise"> | string
    tips?: StringNullableFilter<"Exercise"> | string | null
    videoUrl?: StringNullableFilter<"Exercise"> | string | null
    imageUrl?: StringNullableFilter<"Exercise"> | string | null
    safetyNotes?: StringNullableFilter<"Exercise"> | string | null
    modifications?: JsonNullableFilter<"Exercise">
    contraindications?: StringNullableFilter<"Exercise"> | string | null
    tags?: StringNullableListFilter<"Exercise">
    isActive?: BoolFilter<"Exercise"> | boolean
    popularity?: IntFilter<"Exercise"> | number
    exerciseVariations?: ExerciseVariationListRelationFilter
    userRatings?: ExerciseRatingListRelationFilter
  }, "id">

  export type ExerciseOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    name?: SortOrder
    description?: SortOrder
    category?: SortOrder
    subcategory?: SortOrderInput | SortOrder
    equipment?: SortOrder
    setup?: SortOrderInput | SortOrder
    difficulty?: SortOrder
    progression?: SortOrderInput | SortOrder
    primaryMuscles?: SortOrder
    secondaryMuscles?: SortOrder
    instructions?: SortOrder
    tips?: SortOrderInput | SortOrder
    videoUrl?: SortOrderInput | SortOrder
    imageUrl?: SortOrderInput | SortOrder
    safetyNotes?: SortOrderInput | SortOrder
    modifications?: SortOrderInput | SortOrder
    contraindications?: SortOrderInput | SortOrder
    tags?: SortOrder
    isActive?: SortOrder
    popularity?: SortOrder
    _count?: ExerciseCountOrderByAggregateInput
    _avg?: ExerciseAvgOrderByAggregateInput
    _max?: ExerciseMaxOrderByAggregateInput
    _min?: ExerciseMinOrderByAggregateInput
    _sum?: ExerciseSumOrderByAggregateInput
  }

  export type ExerciseScalarWhereWithAggregatesInput = {
    AND?: ExerciseScalarWhereWithAggregatesInput | ExerciseScalarWhereWithAggregatesInput[]
    OR?: ExerciseScalarWhereWithAggregatesInput[]
    NOT?: ExerciseScalarWhereWithAggregatesInput | ExerciseScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Exercise"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Exercise"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Exercise"> | Date | string
    name?: StringWithAggregatesFilter<"Exercise"> | string
    description?: StringWithAggregatesFilter<"Exercise"> | string
    category?: StringWithAggregatesFilter<"Exercise"> | string
    subcategory?: StringNullableWithAggregatesFilter<"Exercise"> | string | null
    equipment?: StringNullableListFilter<"Exercise">
    setup?: StringNullableWithAggregatesFilter<"Exercise"> | string | null
    difficulty?: IntWithAggregatesFilter<"Exercise"> | number
    progression?: StringNullableWithAggregatesFilter<"Exercise"> | string | null
    primaryMuscles?: StringNullableListFilter<"Exercise">
    secondaryMuscles?: StringNullableListFilter<"Exercise">
    instructions?: StringWithAggregatesFilter<"Exercise"> | string
    tips?: StringNullableWithAggregatesFilter<"Exercise"> | string | null
    videoUrl?: StringNullableWithAggregatesFilter<"Exercise"> | string | null
    imageUrl?: StringNullableWithAggregatesFilter<"Exercise"> | string | null
    safetyNotes?: StringNullableWithAggregatesFilter<"Exercise"> | string | null
    modifications?: JsonNullableWithAggregatesFilter<"Exercise">
    contraindications?: StringNullableWithAggregatesFilter<"Exercise"> | string | null
    tags?: StringNullableListFilter<"Exercise">
    isActive?: BoolWithAggregatesFilter<"Exercise"> | boolean
    popularity?: IntWithAggregatesFilter<"Exercise"> | number
  }

  export type ExerciseVariationWhereInput = {
    AND?: ExerciseVariationWhereInput | ExerciseVariationWhereInput[]
    OR?: ExerciseVariationWhereInput[]
    NOT?: ExerciseVariationWhereInput | ExerciseVariationWhereInput[]
    id?: StringFilter<"ExerciseVariation"> | string
    createdAt?: DateTimeFilter<"ExerciseVariation"> | Date | string
    updatedAt?: DateTimeFilter<"ExerciseVariation"> | Date | string
    exerciseId?: StringFilter<"ExerciseVariation"> | string
    name?: StringFilter<"ExerciseVariation"> | string
    description?: StringFilter<"ExerciseVariation"> | string
    difficulty?: IntFilter<"ExerciseVariation"> | number
    instructions?: StringFilter<"ExerciseVariation"> | string
    tips?: StringNullableFilter<"ExerciseVariation"> | string | null
    videoUrl?: StringNullableFilter<"ExerciseVariation"> | string | null
    imageUrl?: StringNullableFilter<"ExerciseVariation"> | string | null
    exercise?: XOR<ExerciseRelationFilter, ExerciseWhereInput>
  }

  export type ExerciseVariationOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    exerciseId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    difficulty?: SortOrder
    instructions?: SortOrder
    tips?: SortOrderInput | SortOrder
    videoUrl?: SortOrderInput | SortOrder
    imageUrl?: SortOrderInput | SortOrder
    exercise?: ExerciseOrderByWithRelationInput
  }

  export type ExerciseVariationWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ExerciseVariationWhereInput | ExerciseVariationWhereInput[]
    OR?: ExerciseVariationWhereInput[]
    NOT?: ExerciseVariationWhereInput | ExerciseVariationWhereInput[]
    createdAt?: DateTimeFilter<"ExerciseVariation"> | Date | string
    updatedAt?: DateTimeFilter<"ExerciseVariation"> | Date | string
    exerciseId?: StringFilter<"ExerciseVariation"> | string
    name?: StringFilter<"ExerciseVariation"> | string
    description?: StringFilter<"ExerciseVariation"> | string
    difficulty?: IntFilter<"ExerciseVariation"> | number
    instructions?: StringFilter<"ExerciseVariation"> | string
    tips?: StringNullableFilter<"ExerciseVariation"> | string | null
    videoUrl?: StringNullableFilter<"ExerciseVariation"> | string | null
    imageUrl?: StringNullableFilter<"ExerciseVariation"> | string | null
    exercise?: XOR<ExerciseRelationFilter, ExerciseWhereInput>
  }, "id">

  export type ExerciseVariationOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    exerciseId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    difficulty?: SortOrder
    instructions?: SortOrder
    tips?: SortOrderInput | SortOrder
    videoUrl?: SortOrderInput | SortOrder
    imageUrl?: SortOrderInput | SortOrder
    _count?: ExerciseVariationCountOrderByAggregateInput
    _avg?: ExerciseVariationAvgOrderByAggregateInput
    _max?: ExerciseVariationMaxOrderByAggregateInput
    _min?: ExerciseVariationMinOrderByAggregateInput
    _sum?: ExerciseVariationSumOrderByAggregateInput
  }

  export type ExerciseVariationScalarWhereWithAggregatesInput = {
    AND?: ExerciseVariationScalarWhereWithAggregatesInput | ExerciseVariationScalarWhereWithAggregatesInput[]
    OR?: ExerciseVariationScalarWhereWithAggregatesInput[]
    NOT?: ExerciseVariationScalarWhereWithAggregatesInput | ExerciseVariationScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ExerciseVariation"> | string
    createdAt?: DateTimeWithAggregatesFilter<"ExerciseVariation"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"ExerciseVariation"> | Date | string
    exerciseId?: StringWithAggregatesFilter<"ExerciseVariation"> | string
    name?: StringWithAggregatesFilter<"ExerciseVariation"> | string
    description?: StringWithAggregatesFilter<"ExerciseVariation"> | string
    difficulty?: IntWithAggregatesFilter<"ExerciseVariation"> | number
    instructions?: StringWithAggregatesFilter<"ExerciseVariation"> | string
    tips?: StringNullableWithAggregatesFilter<"ExerciseVariation"> | string | null
    videoUrl?: StringNullableWithAggregatesFilter<"ExerciseVariation"> | string | null
    imageUrl?: StringNullableWithAggregatesFilter<"ExerciseVariation"> | string | null
  }

  export type ExerciseRatingWhereInput = {
    AND?: ExerciseRatingWhereInput | ExerciseRatingWhereInput[]
    OR?: ExerciseRatingWhereInput[]
    NOT?: ExerciseRatingWhereInput | ExerciseRatingWhereInput[]
    id?: StringFilter<"ExerciseRating"> | string
    createdAt?: DateTimeFilter<"ExerciseRating"> | Date | string
    updatedAt?: DateTimeFilter<"ExerciseRating"> | Date | string
    exerciseId?: StringFilter<"ExerciseRating"> | string
    userId?: StringFilter<"ExerciseRating"> | string
    rating?: IntFilter<"ExerciseRating"> | number
    difficulty?: IntFilter<"ExerciseRating"> | number
    comment?: StringNullableFilter<"ExerciseRating"> | string | null
    exercise?: XOR<ExerciseRelationFilter, ExerciseWhereInput>
  }

  export type ExerciseRatingOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    exerciseId?: SortOrder
    userId?: SortOrder
    rating?: SortOrder
    difficulty?: SortOrder
    comment?: SortOrderInput | SortOrder
    exercise?: ExerciseOrderByWithRelationInput
  }

  export type ExerciseRatingWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    exerciseId_userId?: ExerciseRatingExerciseIdUserIdCompoundUniqueInput
    AND?: ExerciseRatingWhereInput | ExerciseRatingWhereInput[]
    OR?: ExerciseRatingWhereInput[]
    NOT?: ExerciseRatingWhereInput | ExerciseRatingWhereInput[]
    createdAt?: DateTimeFilter<"ExerciseRating"> | Date | string
    updatedAt?: DateTimeFilter<"ExerciseRating"> | Date | string
    exerciseId?: StringFilter<"ExerciseRating"> | string
    userId?: StringFilter<"ExerciseRating"> | string
    rating?: IntFilter<"ExerciseRating"> | number
    difficulty?: IntFilter<"ExerciseRating"> | number
    comment?: StringNullableFilter<"ExerciseRating"> | string | null
    exercise?: XOR<ExerciseRelationFilter, ExerciseWhereInput>
  }, "id" | "exerciseId_userId">

  export type ExerciseRatingOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    exerciseId?: SortOrder
    userId?: SortOrder
    rating?: SortOrder
    difficulty?: SortOrder
    comment?: SortOrderInput | SortOrder
    _count?: ExerciseRatingCountOrderByAggregateInput
    _avg?: ExerciseRatingAvgOrderByAggregateInput
    _max?: ExerciseRatingMaxOrderByAggregateInput
    _min?: ExerciseRatingMinOrderByAggregateInput
    _sum?: ExerciseRatingSumOrderByAggregateInput
  }

  export type ExerciseRatingScalarWhereWithAggregatesInput = {
    AND?: ExerciseRatingScalarWhereWithAggregatesInput | ExerciseRatingScalarWhereWithAggregatesInput[]
    OR?: ExerciseRatingScalarWhereWithAggregatesInput[]
    NOT?: ExerciseRatingScalarWhereWithAggregatesInput | ExerciseRatingScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ExerciseRating"> | string
    createdAt?: DateTimeWithAggregatesFilter<"ExerciseRating"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"ExerciseRating"> | Date | string
    exerciseId?: StringWithAggregatesFilter<"ExerciseRating"> | string
    userId?: StringWithAggregatesFilter<"ExerciseRating"> | string
    rating?: IntWithAggregatesFilter<"ExerciseRating"> | number
    difficulty?: IntWithAggregatesFilter<"ExerciseRating"> | number
    comment?: StringNullableWithAggregatesFilter<"ExerciseRating"> | string | null
  }

  export type ExerciseCategoryWhereInput = {
    AND?: ExerciseCategoryWhereInput | ExerciseCategoryWhereInput[]
    OR?: ExerciseCategoryWhereInput[]
    NOT?: ExerciseCategoryWhereInput | ExerciseCategoryWhereInput[]
    id?: StringFilter<"ExerciseCategory"> | string
    createdAt?: DateTimeFilter<"ExerciseCategory"> | Date | string
    updatedAt?: DateTimeFilter<"ExerciseCategory"> | Date | string
    name?: StringFilter<"ExerciseCategory"> | string
    description?: StringFilter<"ExerciseCategory"> | string
    icon?: StringNullableFilter<"ExerciseCategory"> | string | null
    color?: StringNullableFilter<"ExerciseCategory"> | string | null
    order?: IntFilter<"ExerciseCategory"> | number
  }

  export type ExerciseCategoryOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    name?: SortOrder
    description?: SortOrder
    icon?: SortOrderInput | SortOrder
    color?: SortOrderInput | SortOrder
    order?: SortOrder
  }

  export type ExerciseCategoryWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    name?: string
    AND?: ExerciseCategoryWhereInput | ExerciseCategoryWhereInput[]
    OR?: ExerciseCategoryWhereInput[]
    NOT?: ExerciseCategoryWhereInput | ExerciseCategoryWhereInput[]
    createdAt?: DateTimeFilter<"ExerciseCategory"> | Date | string
    updatedAt?: DateTimeFilter<"ExerciseCategory"> | Date | string
    description?: StringFilter<"ExerciseCategory"> | string
    icon?: StringNullableFilter<"ExerciseCategory"> | string | null
    color?: StringNullableFilter<"ExerciseCategory"> | string | null
    order?: IntFilter<"ExerciseCategory"> | number
  }, "id" | "name">

  export type ExerciseCategoryOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    name?: SortOrder
    description?: SortOrder
    icon?: SortOrderInput | SortOrder
    color?: SortOrderInput | SortOrder
    order?: SortOrder
    _count?: ExerciseCategoryCountOrderByAggregateInput
    _avg?: ExerciseCategoryAvgOrderByAggregateInput
    _max?: ExerciseCategoryMaxOrderByAggregateInput
    _min?: ExerciseCategoryMinOrderByAggregateInput
    _sum?: ExerciseCategorySumOrderByAggregateInput
  }

  export type ExerciseCategoryScalarWhereWithAggregatesInput = {
    AND?: ExerciseCategoryScalarWhereWithAggregatesInput | ExerciseCategoryScalarWhereWithAggregatesInput[]
    OR?: ExerciseCategoryScalarWhereWithAggregatesInput[]
    NOT?: ExerciseCategoryScalarWhereWithAggregatesInput | ExerciseCategoryScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ExerciseCategory"> | string
    createdAt?: DateTimeWithAggregatesFilter<"ExerciseCategory"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"ExerciseCategory"> | Date | string
    name?: StringWithAggregatesFilter<"ExerciseCategory"> | string
    description?: StringWithAggregatesFilter<"ExerciseCategory"> | string
    icon?: StringNullableWithAggregatesFilter<"ExerciseCategory"> | string | null
    color?: StringNullableWithAggregatesFilter<"ExerciseCategory"> | string | null
    order?: IntWithAggregatesFilter<"ExerciseCategory"> | number
  }

  export type ExerciseCreateInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    name: string
    description: string
    category: string
    subcategory?: string | null
    equipment?: ExerciseCreateequipmentInput | string[]
    setup?: string | null
    difficulty: number
    progression?: string | null
    primaryMuscles?: ExerciseCreateprimaryMusclesInput | string[]
    secondaryMuscles?: ExerciseCreatesecondaryMusclesInput | string[]
    instructions: string
    tips?: string | null
    videoUrl?: string | null
    imageUrl?: string | null
    safetyNotes?: string | null
    modifications?: NullableJsonNullValueInput | InputJsonValue
    contraindications?: string | null
    tags?: ExerciseCreatetagsInput | string[]
    isActive?: boolean
    popularity?: number
    exerciseVariations?: ExerciseVariationCreateNestedManyWithoutExerciseInput
    userRatings?: ExerciseRatingCreateNestedManyWithoutExerciseInput
  }

  export type ExerciseUncheckedCreateInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    name: string
    description: string
    category: string
    subcategory?: string | null
    equipment?: ExerciseCreateequipmentInput | string[]
    setup?: string | null
    difficulty: number
    progression?: string | null
    primaryMuscles?: ExerciseCreateprimaryMusclesInput | string[]
    secondaryMuscles?: ExerciseCreatesecondaryMusclesInput | string[]
    instructions: string
    tips?: string | null
    videoUrl?: string | null
    imageUrl?: string | null
    safetyNotes?: string | null
    modifications?: NullableJsonNullValueInput | InputJsonValue
    contraindications?: string | null
    tags?: ExerciseCreatetagsInput | string[]
    isActive?: boolean
    popularity?: number
    exerciseVariations?: ExerciseVariationUncheckedCreateNestedManyWithoutExerciseInput
    userRatings?: ExerciseRatingUncheckedCreateNestedManyWithoutExerciseInput
  }

  export type ExerciseUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    subcategory?: NullableStringFieldUpdateOperationsInput | string | null
    equipment?: ExerciseUpdateequipmentInput | string[]
    setup?: NullableStringFieldUpdateOperationsInput | string | null
    difficulty?: IntFieldUpdateOperationsInput | number
    progression?: NullableStringFieldUpdateOperationsInput | string | null
    primaryMuscles?: ExerciseUpdateprimaryMusclesInput | string[]
    secondaryMuscles?: ExerciseUpdatesecondaryMusclesInput | string[]
    instructions?: StringFieldUpdateOperationsInput | string
    tips?: NullableStringFieldUpdateOperationsInput | string | null
    videoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    safetyNotes?: NullableStringFieldUpdateOperationsInput | string | null
    modifications?: NullableJsonNullValueInput | InputJsonValue
    contraindications?: NullableStringFieldUpdateOperationsInput | string | null
    tags?: ExerciseUpdatetagsInput | string[]
    isActive?: BoolFieldUpdateOperationsInput | boolean
    popularity?: IntFieldUpdateOperationsInput | number
    exerciseVariations?: ExerciseVariationUpdateManyWithoutExerciseNestedInput
    userRatings?: ExerciseRatingUpdateManyWithoutExerciseNestedInput
  }

  export type ExerciseUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    subcategory?: NullableStringFieldUpdateOperationsInput | string | null
    equipment?: ExerciseUpdateequipmentInput | string[]
    setup?: NullableStringFieldUpdateOperationsInput | string | null
    difficulty?: IntFieldUpdateOperationsInput | number
    progression?: NullableStringFieldUpdateOperationsInput | string | null
    primaryMuscles?: ExerciseUpdateprimaryMusclesInput | string[]
    secondaryMuscles?: ExerciseUpdatesecondaryMusclesInput | string[]
    instructions?: StringFieldUpdateOperationsInput | string
    tips?: NullableStringFieldUpdateOperationsInput | string | null
    videoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    safetyNotes?: NullableStringFieldUpdateOperationsInput | string | null
    modifications?: NullableJsonNullValueInput | InputJsonValue
    contraindications?: NullableStringFieldUpdateOperationsInput | string | null
    tags?: ExerciseUpdatetagsInput | string[]
    isActive?: BoolFieldUpdateOperationsInput | boolean
    popularity?: IntFieldUpdateOperationsInput | number
    exerciseVariations?: ExerciseVariationUncheckedUpdateManyWithoutExerciseNestedInput
    userRatings?: ExerciseRatingUncheckedUpdateManyWithoutExerciseNestedInput
  }

  export type ExerciseCreateManyInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    name: string
    description: string
    category: string
    subcategory?: string | null
    equipment?: ExerciseCreateequipmentInput | string[]
    setup?: string | null
    difficulty: number
    progression?: string | null
    primaryMuscles?: ExerciseCreateprimaryMusclesInput | string[]
    secondaryMuscles?: ExerciseCreatesecondaryMusclesInput | string[]
    instructions: string
    tips?: string | null
    videoUrl?: string | null
    imageUrl?: string | null
    safetyNotes?: string | null
    modifications?: NullableJsonNullValueInput | InputJsonValue
    contraindications?: string | null
    tags?: ExerciseCreatetagsInput | string[]
    isActive?: boolean
    popularity?: number
  }

  export type ExerciseUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    subcategory?: NullableStringFieldUpdateOperationsInput | string | null
    equipment?: ExerciseUpdateequipmentInput | string[]
    setup?: NullableStringFieldUpdateOperationsInput | string | null
    difficulty?: IntFieldUpdateOperationsInput | number
    progression?: NullableStringFieldUpdateOperationsInput | string | null
    primaryMuscles?: ExerciseUpdateprimaryMusclesInput | string[]
    secondaryMuscles?: ExerciseUpdatesecondaryMusclesInput | string[]
    instructions?: StringFieldUpdateOperationsInput | string
    tips?: NullableStringFieldUpdateOperationsInput | string | null
    videoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    safetyNotes?: NullableStringFieldUpdateOperationsInput | string | null
    modifications?: NullableJsonNullValueInput | InputJsonValue
    contraindications?: NullableStringFieldUpdateOperationsInput | string | null
    tags?: ExerciseUpdatetagsInput | string[]
    isActive?: BoolFieldUpdateOperationsInput | boolean
    popularity?: IntFieldUpdateOperationsInput | number
  }

  export type ExerciseUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    subcategory?: NullableStringFieldUpdateOperationsInput | string | null
    equipment?: ExerciseUpdateequipmentInput | string[]
    setup?: NullableStringFieldUpdateOperationsInput | string | null
    difficulty?: IntFieldUpdateOperationsInput | number
    progression?: NullableStringFieldUpdateOperationsInput | string | null
    primaryMuscles?: ExerciseUpdateprimaryMusclesInput | string[]
    secondaryMuscles?: ExerciseUpdatesecondaryMusclesInput | string[]
    instructions?: StringFieldUpdateOperationsInput | string
    tips?: NullableStringFieldUpdateOperationsInput | string | null
    videoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    safetyNotes?: NullableStringFieldUpdateOperationsInput | string | null
    modifications?: NullableJsonNullValueInput | InputJsonValue
    contraindications?: NullableStringFieldUpdateOperationsInput | string | null
    tags?: ExerciseUpdatetagsInput | string[]
    isActive?: BoolFieldUpdateOperationsInput | boolean
    popularity?: IntFieldUpdateOperationsInput | number
  }

  export type ExerciseVariationCreateInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    name: string
    description: string
    difficulty: number
    instructions: string
    tips?: string | null
    videoUrl?: string | null
    imageUrl?: string | null
    exercise: ExerciseCreateNestedOneWithoutExerciseVariationsInput
  }

  export type ExerciseVariationUncheckedCreateInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    exerciseId: string
    name: string
    description: string
    difficulty: number
    instructions: string
    tips?: string | null
    videoUrl?: string | null
    imageUrl?: string | null
  }

  export type ExerciseVariationUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    difficulty?: IntFieldUpdateOperationsInput | number
    instructions?: StringFieldUpdateOperationsInput | string
    tips?: NullableStringFieldUpdateOperationsInput | string | null
    videoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    exercise?: ExerciseUpdateOneRequiredWithoutExerciseVariationsNestedInput
  }

  export type ExerciseVariationUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    exerciseId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    difficulty?: IntFieldUpdateOperationsInput | number
    instructions?: StringFieldUpdateOperationsInput | string
    tips?: NullableStringFieldUpdateOperationsInput | string | null
    videoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ExerciseVariationCreateManyInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    exerciseId: string
    name: string
    description: string
    difficulty: number
    instructions: string
    tips?: string | null
    videoUrl?: string | null
    imageUrl?: string | null
  }

  export type ExerciseVariationUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    difficulty?: IntFieldUpdateOperationsInput | number
    instructions?: StringFieldUpdateOperationsInput | string
    tips?: NullableStringFieldUpdateOperationsInput | string | null
    videoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ExerciseVariationUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    exerciseId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    difficulty?: IntFieldUpdateOperationsInput | number
    instructions?: StringFieldUpdateOperationsInput | string
    tips?: NullableStringFieldUpdateOperationsInput | string | null
    videoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ExerciseRatingCreateInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
    rating: number
    difficulty: number
    comment?: string | null
    exercise: ExerciseCreateNestedOneWithoutUserRatingsInput
  }

  export type ExerciseRatingUncheckedCreateInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    exerciseId: string
    userId: string
    rating: number
    difficulty: number
    comment?: string | null
  }

  export type ExerciseRatingUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    rating?: IntFieldUpdateOperationsInput | number
    difficulty?: IntFieldUpdateOperationsInput | number
    comment?: NullableStringFieldUpdateOperationsInput | string | null
    exercise?: ExerciseUpdateOneRequiredWithoutUserRatingsNestedInput
  }

  export type ExerciseRatingUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    exerciseId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    rating?: IntFieldUpdateOperationsInput | number
    difficulty?: IntFieldUpdateOperationsInput | number
    comment?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ExerciseRatingCreateManyInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    exerciseId: string
    userId: string
    rating: number
    difficulty: number
    comment?: string | null
  }

  export type ExerciseRatingUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    rating?: IntFieldUpdateOperationsInput | number
    difficulty?: IntFieldUpdateOperationsInput | number
    comment?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ExerciseRatingUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    exerciseId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    rating?: IntFieldUpdateOperationsInput | number
    difficulty?: IntFieldUpdateOperationsInput | number
    comment?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ExerciseCategoryCreateInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    name: string
    description: string
    icon?: string | null
    color?: string | null
    order?: number
  }

  export type ExerciseCategoryUncheckedCreateInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    name: string
    description: string
    icon?: string | null
    color?: string | null
    order?: number
  }

  export type ExerciseCategoryUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    icon?: NullableStringFieldUpdateOperationsInput | string | null
    color?: NullableStringFieldUpdateOperationsInput | string | null
    order?: IntFieldUpdateOperationsInput | number
  }

  export type ExerciseCategoryUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    icon?: NullableStringFieldUpdateOperationsInput | string | null
    color?: NullableStringFieldUpdateOperationsInput | string | null
    order?: IntFieldUpdateOperationsInput | number
  }

  export type ExerciseCategoryCreateManyInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    name: string
    description: string
    icon?: string | null
    color?: string | null
    order?: number
  }

  export type ExerciseCategoryUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    icon?: NullableStringFieldUpdateOperationsInput | string | null
    color?: NullableStringFieldUpdateOperationsInput | string | null
    order?: IntFieldUpdateOperationsInput | number
  }

  export type ExerciseCategoryUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    icon?: NullableStringFieldUpdateOperationsInput | string | null
    color?: NullableStringFieldUpdateOperationsInput | string | null
    order?: IntFieldUpdateOperationsInput | number
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }
  export type JsonNullableFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type ExerciseVariationListRelationFilter = {
    every?: ExerciseVariationWhereInput
    some?: ExerciseVariationWhereInput
    none?: ExerciseVariationWhereInput
  }

  export type ExerciseRatingListRelationFilter = {
    every?: ExerciseRatingWhereInput
    some?: ExerciseRatingWhereInput
    none?: ExerciseRatingWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type ExerciseVariationOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ExerciseRatingOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ExerciseCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    name?: SortOrder
    description?: SortOrder
    category?: SortOrder
    subcategory?: SortOrder
    equipment?: SortOrder
    setup?: SortOrder
    difficulty?: SortOrder
    progression?: SortOrder
    primaryMuscles?: SortOrder
    secondaryMuscles?: SortOrder
    instructions?: SortOrder
    tips?: SortOrder
    videoUrl?: SortOrder
    imageUrl?: SortOrder
    safetyNotes?: SortOrder
    modifications?: SortOrder
    contraindications?: SortOrder
    tags?: SortOrder
    isActive?: SortOrder
    popularity?: SortOrder
  }

  export type ExerciseAvgOrderByAggregateInput = {
    difficulty?: SortOrder
    popularity?: SortOrder
  }

  export type ExerciseMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    name?: SortOrder
    description?: SortOrder
    category?: SortOrder
    subcategory?: SortOrder
    setup?: SortOrder
    difficulty?: SortOrder
    progression?: SortOrder
    instructions?: SortOrder
    tips?: SortOrder
    videoUrl?: SortOrder
    imageUrl?: SortOrder
    safetyNotes?: SortOrder
    contraindications?: SortOrder
    isActive?: SortOrder
    popularity?: SortOrder
  }

  export type ExerciseMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    name?: SortOrder
    description?: SortOrder
    category?: SortOrder
    subcategory?: SortOrder
    setup?: SortOrder
    difficulty?: SortOrder
    progression?: SortOrder
    instructions?: SortOrder
    tips?: SortOrder
    videoUrl?: SortOrder
    imageUrl?: SortOrder
    safetyNotes?: SortOrder
    contraindications?: SortOrder
    isActive?: SortOrder
    popularity?: SortOrder
  }

  export type ExerciseSumOrderByAggregateInput = {
    difficulty?: SortOrder
    popularity?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type ExerciseRelationFilter = {
    is?: ExerciseWhereInput
    isNot?: ExerciseWhereInput
  }

  export type ExerciseVariationCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    exerciseId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    difficulty?: SortOrder
    instructions?: SortOrder
    tips?: SortOrder
    videoUrl?: SortOrder
    imageUrl?: SortOrder
  }

  export type ExerciseVariationAvgOrderByAggregateInput = {
    difficulty?: SortOrder
  }

  export type ExerciseVariationMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    exerciseId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    difficulty?: SortOrder
    instructions?: SortOrder
    tips?: SortOrder
    videoUrl?: SortOrder
    imageUrl?: SortOrder
  }

  export type ExerciseVariationMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    exerciseId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    difficulty?: SortOrder
    instructions?: SortOrder
    tips?: SortOrder
    videoUrl?: SortOrder
    imageUrl?: SortOrder
  }

  export type ExerciseVariationSumOrderByAggregateInput = {
    difficulty?: SortOrder
  }

  export type ExerciseRatingExerciseIdUserIdCompoundUniqueInput = {
    exerciseId: string
    userId: string
  }

  export type ExerciseRatingCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    exerciseId?: SortOrder
    userId?: SortOrder
    rating?: SortOrder
    difficulty?: SortOrder
    comment?: SortOrder
  }

  export type ExerciseRatingAvgOrderByAggregateInput = {
    rating?: SortOrder
    difficulty?: SortOrder
  }

  export type ExerciseRatingMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    exerciseId?: SortOrder
    userId?: SortOrder
    rating?: SortOrder
    difficulty?: SortOrder
    comment?: SortOrder
  }

  export type ExerciseRatingMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    exerciseId?: SortOrder
    userId?: SortOrder
    rating?: SortOrder
    difficulty?: SortOrder
    comment?: SortOrder
  }

  export type ExerciseRatingSumOrderByAggregateInput = {
    rating?: SortOrder
    difficulty?: SortOrder
  }

  export type ExerciseCategoryCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    name?: SortOrder
    description?: SortOrder
    icon?: SortOrder
    color?: SortOrder
    order?: SortOrder
  }

  export type ExerciseCategoryAvgOrderByAggregateInput = {
    order?: SortOrder
  }

  export type ExerciseCategoryMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    name?: SortOrder
    description?: SortOrder
    icon?: SortOrder
    color?: SortOrder
    order?: SortOrder
  }

  export type ExerciseCategoryMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    name?: SortOrder
    description?: SortOrder
    icon?: SortOrder
    color?: SortOrder
    order?: SortOrder
  }

  export type ExerciseCategorySumOrderByAggregateInput = {
    order?: SortOrder
  }

  export type ExerciseCreateequipmentInput = {
    set: string[]
  }

  export type ExerciseCreateprimaryMusclesInput = {
    set: string[]
  }

  export type ExerciseCreatesecondaryMusclesInput = {
    set: string[]
  }

  export type ExerciseCreatetagsInput = {
    set: string[]
  }

  export type ExerciseVariationCreateNestedManyWithoutExerciseInput = {
    create?: XOR<ExerciseVariationCreateWithoutExerciseInput, ExerciseVariationUncheckedCreateWithoutExerciseInput> | ExerciseVariationCreateWithoutExerciseInput[] | ExerciseVariationUncheckedCreateWithoutExerciseInput[]
    connectOrCreate?: ExerciseVariationCreateOrConnectWithoutExerciseInput | ExerciseVariationCreateOrConnectWithoutExerciseInput[]
    createMany?: ExerciseVariationCreateManyExerciseInputEnvelope
    connect?: ExerciseVariationWhereUniqueInput | ExerciseVariationWhereUniqueInput[]
  }

  export type ExerciseRatingCreateNestedManyWithoutExerciseInput = {
    create?: XOR<ExerciseRatingCreateWithoutExerciseInput, ExerciseRatingUncheckedCreateWithoutExerciseInput> | ExerciseRatingCreateWithoutExerciseInput[] | ExerciseRatingUncheckedCreateWithoutExerciseInput[]
    connectOrCreate?: ExerciseRatingCreateOrConnectWithoutExerciseInput | ExerciseRatingCreateOrConnectWithoutExerciseInput[]
    createMany?: ExerciseRatingCreateManyExerciseInputEnvelope
    connect?: ExerciseRatingWhereUniqueInput | ExerciseRatingWhereUniqueInput[]
  }

  export type ExerciseVariationUncheckedCreateNestedManyWithoutExerciseInput = {
    create?: XOR<ExerciseVariationCreateWithoutExerciseInput, ExerciseVariationUncheckedCreateWithoutExerciseInput> | ExerciseVariationCreateWithoutExerciseInput[] | ExerciseVariationUncheckedCreateWithoutExerciseInput[]
    connectOrCreate?: ExerciseVariationCreateOrConnectWithoutExerciseInput | ExerciseVariationCreateOrConnectWithoutExerciseInput[]
    createMany?: ExerciseVariationCreateManyExerciseInputEnvelope
    connect?: ExerciseVariationWhereUniqueInput | ExerciseVariationWhereUniqueInput[]
  }

  export type ExerciseRatingUncheckedCreateNestedManyWithoutExerciseInput = {
    create?: XOR<ExerciseRatingCreateWithoutExerciseInput, ExerciseRatingUncheckedCreateWithoutExerciseInput> | ExerciseRatingCreateWithoutExerciseInput[] | ExerciseRatingUncheckedCreateWithoutExerciseInput[]
    connectOrCreate?: ExerciseRatingCreateOrConnectWithoutExerciseInput | ExerciseRatingCreateOrConnectWithoutExerciseInput[]
    createMany?: ExerciseRatingCreateManyExerciseInputEnvelope
    connect?: ExerciseRatingWhereUniqueInput | ExerciseRatingWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type ExerciseUpdateequipmentInput = {
    set?: string[]
    push?: string | string[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type ExerciseUpdateprimaryMusclesInput = {
    set?: string[]
    push?: string | string[]
  }

  export type ExerciseUpdatesecondaryMusclesInput = {
    set?: string[]
    push?: string | string[]
  }

  export type ExerciseUpdatetagsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type ExerciseVariationUpdateManyWithoutExerciseNestedInput = {
    create?: XOR<ExerciseVariationCreateWithoutExerciseInput, ExerciseVariationUncheckedCreateWithoutExerciseInput> | ExerciseVariationCreateWithoutExerciseInput[] | ExerciseVariationUncheckedCreateWithoutExerciseInput[]
    connectOrCreate?: ExerciseVariationCreateOrConnectWithoutExerciseInput | ExerciseVariationCreateOrConnectWithoutExerciseInput[]
    upsert?: ExerciseVariationUpsertWithWhereUniqueWithoutExerciseInput | ExerciseVariationUpsertWithWhereUniqueWithoutExerciseInput[]
    createMany?: ExerciseVariationCreateManyExerciseInputEnvelope
    set?: ExerciseVariationWhereUniqueInput | ExerciseVariationWhereUniqueInput[]
    disconnect?: ExerciseVariationWhereUniqueInput | ExerciseVariationWhereUniqueInput[]
    delete?: ExerciseVariationWhereUniqueInput | ExerciseVariationWhereUniqueInput[]
    connect?: ExerciseVariationWhereUniqueInput | ExerciseVariationWhereUniqueInput[]
    update?: ExerciseVariationUpdateWithWhereUniqueWithoutExerciseInput | ExerciseVariationUpdateWithWhereUniqueWithoutExerciseInput[]
    updateMany?: ExerciseVariationUpdateManyWithWhereWithoutExerciseInput | ExerciseVariationUpdateManyWithWhereWithoutExerciseInput[]
    deleteMany?: ExerciseVariationScalarWhereInput | ExerciseVariationScalarWhereInput[]
  }

  export type ExerciseRatingUpdateManyWithoutExerciseNestedInput = {
    create?: XOR<ExerciseRatingCreateWithoutExerciseInput, ExerciseRatingUncheckedCreateWithoutExerciseInput> | ExerciseRatingCreateWithoutExerciseInput[] | ExerciseRatingUncheckedCreateWithoutExerciseInput[]
    connectOrCreate?: ExerciseRatingCreateOrConnectWithoutExerciseInput | ExerciseRatingCreateOrConnectWithoutExerciseInput[]
    upsert?: ExerciseRatingUpsertWithWhereUniqueWithoutExerciseInput | ExerciseRatingUpsertWithWhereUniqueWithoutExerciseInput[]
    createMany?: ExerciseRatingCreateManyExerciseInputEnvelope
    set?: ExerciseRatingWhereUniqueInput | ExerciseRatingWhereUniqueInput[]
    disconnect?: ExerciseRatingWhereUniqueInput | ExerciseRatingWhereUniqueInput[]
    delete?: ExerciseRatingWhereUniqueInput | ExerciseRatingWhereUniqueInput[]
    connect?: ExerciseRatingWhereUniqueInput | ExerciseRatingWhereUniqueInput[]
    update?: ExerciseRatingUpdateWithWhereUniqueWithoutExerciseInput | ExerciseRatingUpdateWithWhereUniqueWithoutExerciseInput[]
    updateMany?: ExerciseRatingUpdateManyWithWhereWithoutExerciseInput | ExerciseRatingUpdateManyWithWhereWithoutExerciseInput[]
    deleteMany?: ExerciseRatingScalarWhereInput | ExerciseRatingScalarWhereInput[]
  }

  export type ExerciseVariationUncheckedUpdateManyWithoutExerciseNestedInput = {
    create?: XOR<ExerciseVariationCreateWithoutExerciseInput, ExerciseVariationUncheckedCreateWithoutExerciseInput> | ExerciseVariationCreateWithoutExerciseInput[] | ExerciseVariationUncheckedCreateWithoutExerciseInput[]
    connectOrCreate?: ExerciseVariationCreateOrConnectWithoutExerciseInput | ExerciseVariationCreateOrConnectWithoutExerciseInput[]
    upsert?: ExerciseVariationUpsertWithWhereUniqueWithoutExerciseInput | ExerciseVariationUpsertWithWhereUniqueWithoutExerciseInput[]
    createMany?: ExerciseVariationCreateManyExerciseInputEnvelope
    set?: ExerciseVariationWhereUniqueInput | ExerciseVariationWhereUniqueInput[]
    disconnect?: ExerciseVariationWhereUniqueInput | ExerciseVariationWhereUniqueInput[]
    delete?: ExerciseVariationWhereUniqueInput | ExerciseVariationWhereUniqueInput[]
    connect?: ExerciseVariationWhereUniqueInput | ExerciseVariationWhereUniqueInput[]
    update?: ExerciseVariationUpdateWithWhereUniqueWithoutExerciseInput | ExerciseVariationUpdateWithWhereUniqueWithoutExerciseInput[]
    updateMany?: ExerciseVariationUpdateManyWithWhereWithoutExerciseInput | ExerciseVariationUpdateManyWithWhereWithoutExerciseInput[]
    deleteMany?: ExerciseVariationScalarWhereInput | ExerciseVariationScalarWhereInput[]
  }

  export type ExerciseRatingUncheckedUpdateManyWithoutExerciseNestedInput = {
    create?: XOR<ExerciseRatingCreateWithoutExerciseInput, ExerciseRatingUncheckedCreateWithoutExerciseInput> | ExerciseRatingCreateWithoutExerciseInput[] | ExerciseRatingUncheckedCreateWithoutExerciseInput[]
    connectOrCreate?: ExerciseRatingCreateOrConnectWithoutExerciseInput | ExerciseRatingCreateOrConnectWithoutExerciseInput[]
    upsert?: ExerciseRatingUpsertWithWhereUniqueWithoutExerciseInput | ExerciseRatingUpsertWithWhereUniqueWithoutExerciseInput[]
    createMany?: ExerciseRatingCreateManyExerciseInputEnvelope
    set?: ExerciseRatingWhereUniqueInput | ExerciseRatingWhereUniqueInput[]
    disconnect?: ExerciseRatingWhereUniqueInput | ExerciseRatingWhereUniqueInput[]
    delete?: ExerciseRatingWhereUniqueInput | ExerciseRatingWhereUniqueInput[]
    connect?: ExerciseRatingWhereUniqueInput | ExerciseRatingWhereUniqueInput[]
    update?: ExerciseRatingUpdateWithWhereUniqueWithoutExerciseInput | ExerciseRatingUpdateWithWhereUniqueWithoutExerciseInput[]
    updateMany?: ExerciseRatingUpdateManyWithWhereWithoutExerciseInput | ExerciseRatingUpdateManyWithWhereWithoutExerciseInput[]
    deleteMany?: ExerciseRatingScalarWhereInput | ExerciseRatingScalarWhereInput[]
  }

  export type ExerciseCreateNestedOneWithoutExerciseVariationsInput = {
    create?: XOR<ExerciseCreateWithoutExerciseVariationsInput, ExerciseUncheckedCreateWithoutExerciseVariationsInput>
    connectOrCreate?: ExerciseCreateOrConnectWithoutExerciseVariationsInput
    connect?: ExerciseWhereUniqueInput
  }

  export type ExerciseUpdateOneRequiredWithoutExerciseVariationsNestedInput = {
    create?: XOR<ExerciseCreateWithoutExerciseVariationsInput, ExerciseUncheckedCreateWithoutExerciseVariationsInput>
    connectOrCreate?: ExerciseCreateOrConnectWithoutExerciseVariationsInput
    upsert?: ExerciseUpsertWithoutExerciseVariationsInput
    connect?: ExerciseWhereUniqueInput
    update?: XOR<XOR<ExerciseUpdateToOneWithWhereWithoutExerciseVariationsInput, ExerciseUpdateWithoutExerciseVariationsInput>, ExerciseUncheckedUpdateWithoutExerciseVariationsInput>
  }

  export type ExerciseCreateNestedOneWithoutUserRatingsInput = {
    create?: XOR<ExerciseCreateWithoutUserRatingsInput, ExerciseUncheckedCreateWithoutUserRatingsInput>
    connectOrCreate?: ExerciseCreateOrConnectWithoutUserRatingsInput
    connect?: ExerciseWhereUniqueInput
  }

  export type ExerciseUpdateOneRequiredWithoutUserRatingsNestedInput = {
    create?: XOR<ExerciseCreateWithoutUserRatingsInput, ExerciseUncheckedCreateWithoutUserRatingsInput>
    connectOrCreate?: ExerciseCreateOrConnectWithoutUserRatingsInput
    upsert?: ExerciseUpsertWithoutUserRatingsInput
    connect?: ExerciseWhereUniqueInput
    update?: XOR<XOR<ExerciseUpdateToOneWithWhereWithoutUserRatingsInput, ExerciseUpdateWithoutUserRatingsInput>, ExerciseUncheckedUpdateWithoutUserRatingsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type ExerciseVariationCreateWithoutExerciseInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    name: string
    description: string
    difficulty: number
    instructions: string
    tips?: string | null
    videoUrl?: string | null
    imageUrl?: string | null
  }

  export type ExerciseVariationUncheckedCreateWithoutExerciseInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    name: string
    description: string
    difficulty: number
    instructions: string
    tips?: string | null
    videoUrl?: string | null
    imageUrl?: string | null
  }

  export type ExerciseVariationCreateOrConnectWithoutExerciseInput = {
    where: ExerciseVariationWhereUniqueInput
    create: XOR<ExerciseVariationCreateWithoutExerciseInput, ExerciseVariationUncheckedCreateWithoutExerciseInput>
  }

  export type ExerciseVariationCreateManyExerciseInputEnvelope = {
    data: ExerciseVariationCreateManyExerciseInput | ExerciseVariationCreateManyExerciseInput[]
    skipDuplicates?: boolean
  }

  export type ExerciseRatingCreateWithoutExerciseInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
    rating: number
    difficulty: number
    comment?: string | null
  }

  export type ExerciseRatingUncheckedCreateWithoutExerciseInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
    rating: number
    difficulty: number
    comment?: string | null
  }

  export type ExerciseRatingCreateOrConnectWithoutExerciseInput = {
    where: ExerciseRatingWhereUniqueInput
    create: XOR<ExerciseRatingCreateWithoutExerciseInput, ExerciseRatingUncheckedCreateWithoutExerciseInput>
  }

  export type ExerciseRatingCreateManyExerciseInputEnvelope = {
    data: ExerciseRatingCreateManyExerciseInput | ExerciseRatingCreateManyExerciseInput[]
    skipDuplicates?: boolean
  }

  export type ExerciseVariationUpsertWithWhereUniqueWithoutExerciseInput = {
    where: ExerciseVariationWhereUniqueInput
    update: XOR<ExerciseVariationUpdateWithoutExerciseInput, ExerciseVariationUncheckedUpdateWithoutExerciseInput>
    create: XOR<ExerciseVariationCreateWithoutExerciseInput, ExerciseVariationUncheckedCreateWithoutExerciseInput>
  }

  export type ExerciseVariationUpdateWithWhereUniqueWithoutExerciseInput = {
    where: ExerciseVariationWhereUniqueInput
    data: XOR<ExerciseVariationUpdateWithoutExerciseInput, ExerciseVariationUncheckedUpdateWithoutExerciseInput>
  }

  export type ExerciseVariationUpdateManyWithWhereWithoutExerciseInput = {
    where: ExerciseVariationScalarWhereInput
    data: XOR<ExerciseVariationUpdateManyMutationInput, ExerciseVariationUncheckedUpdateManyWithoutExerciseInput>
  }

  export type ExerciseVariationScalarWhereInput = {
    AND?: ExerciseVariationScalarWhereInput | ExerciseVariationScalarWhereInput[]
    OR?: ExerciseVariationScalarWhereInput[]
    NOT?: ExerciseVariationScalarWhereInput | ExerciseVariationScalarWhereInput[]
    id?: StringFilter<"ExerciseVariation"> | string
    createdAt?: DateTimeFilter<"ExerciseVariation"> | Date | string
    updatedAt?: DateTimeFilter<"ExerciseVariation"> | Date | string
    exerciseId?: StringFilter<"ExerciseVariation"> | string
    name?: StringFilter<"ExerciseVariation"> | string
    description?: StringFilter<"ExerciseVariation"> | string
    difficulty?: IntFilter<"ExerciseVariation"> | number
    instructions?: StringFilter<"ExerciseVariation"> | string
    tips?: StringNullableFilter<"ExerciseVariation"> | string | null
    videoUrl?: StringNullableFilter<"ExerciseVariation"> | string | null
    imageUrl?: StringNullableFilter<"ExerciseVariation"> | string | null
  }

  export type ExerciseRatingUpsertWithWhereUniqueWithoutExerciseInput = {
    where: ExerciseRatingWhereUniqueInput
    update: XOR<ExerciseRatingUpdateWithoutExerciseInput, ExerciseRatingUncheckedUpdateWithoutExerciseInput>
    create: XOR<ExerciseRatingCreateWithoutExerciseInput, ExerciseRatingUncheckedCreateWithoutExerciseInput>
  }

  export type ExerciseRatingUpdateWithWhereUniqueWithoutExerciseInput = {
    where: ExerciseRatingWhereUniqueInput
    data: XOR<ExerciseRatingUpdateWithoutExerciseInput, ExerciseRatingUncheckedUpdateWithoutExerciseInput>
  }

  export type ExerciseRatingUpdateManyWithWhereWithoutExerciseInput = {
    where: ExerciseRatingScalarWhereInput
    data: XOR<ExerciseRatingUpdateManyMutationInput, ExerciseRatingUncheckedUpdateManyWithoutExerciseInput>
  }

  export type ExerciseRatingScalarWhereInput = {
    AND?: ExerciseRatingScalarWhereInput | ExerciseRatingScalarWhereInput[]
    OR?: ExerciseRatingScalarWhereInput[]
    NOT?: ExerciseRatingScalarWhereInput | ExerciseRatingScalarWhereInput[]
    id?: StringFilter<"ExerciseRating"> | string
    createdAt?: DateTimeFilter<"ExerciseRating"> | Date | string
    updatedAt?: DateTimeFilter<"ExerciseRating"> | Date | string
    exerciseId?: StringFilter<"ExerciseRating"> | string
    userId?: StringFilter<"ExerciseRating"> | string
    rating?: IntFilter<"ExerciseRating"> | number
    difficulty?: IntFilter<"ExerciseRating"> | number
    comment?: StringNullableFilter<"ExerciseRating"> | string | null
  }

  export type ExerciseCreateWithoutExerciseVariationsInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    name: string
    description: string
    category: string
    subcategory?: string | null
    equipment?: ExerciseCreateequipmentInput | string[]
    setup?: string | null
    difficulty: number
    progression?: string | null
    primaryMuscles?: ExerciseCreateprimaryMusclesInput | string[]
    secondaryMuscles?: ExerciseCreatesecondaryMusclesInput | string[]
    instructions: string
    tips?: string | null
    videoUrl?: string | null
    imageUrl?: string | null
    safetyNotes?: string | null
    modifications?: NullableJsonNullValueInput | InputJsonValue
    contraindications?: string | null
    tags?: ExerciseCreatetagsInput | string[]
    isActive?: boolean
    popularity?: number
    userRatings?: ExerciseRatingCreateNestedManyWithoutExerciseInput
  }

  export type ExerciseUncheckedCreateWithoutExerciseVariationsInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    name: string
    description: string
    category: string
    subcategory?: string | null
    equipment?: ExerciseCreateequipmentInput | string[]
    setup?: string | null
    difficulty: number
    progression?: string | null
    primaryMuscles?: ExerciseCreateprimaryMusclesInput | string[]
    secondaryMuscles?: ExerciseCreatesecondaryMusclesInput | string[]
    instructions: string
    tips?: string | null
    videoUrl?: string | null
    imageUrl?: string | null
    safetyNotes?: string | null
    modifications?: NullableJsonNullValueInput | InputJsonValue
    contraindications?: string | null
    tags?: ExerciseCreatetagsInput | string[]
    isActive?: boolean
    popularity?: number
    userRatings?: ExerciseRatingUncheckedCreateNestedManyWithoutExerciseInput
  }

  export type ExerciseCreateOrConnectWithoutExerciseVariationsInput = {
    where: ExerciseWhereUniqueInput
    create: XOR<ExerciseCreateWithoutExerciseVariationsInput, ExerciseUncheckedCreateWithoutExerciseVariationsInput>
  }

  export type ExerciseUpsertWithoutExerciseVariationsInput = {
    update: XOR<ExerciseUpdateWithoutExerciseVariationsInput, ExerciseUncheckedUpdateWithoutExerciseVariationsInput>
    create: XOR<ExerciseCreateWithoutExerciseVariationsInput, ExerciseUncheckedCreateWithoutExerciseVariationsInput>
    where?: ExerciseWhereInput
  }

  export type ExerciseUpdateToOneWithWhereWithoutExerciseVariationsInput = {
    where?: ExerciseWhereInput
    data: XOR<ExerciseUpdateWithoutExerciseVariationsInput, ExerciseUncheckedUpdateWithoutExerciseVariationsInput>
  }

  export type ExerciseUpdateWithoutExerciseVariationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    subcategory?: NullableStringFieldUpdateOperationsInput | string | null
    equipment?: ExerciseUpdateequipmentInput | string[]
    setup?: NullableStringFieldUpdateOperationsInput | string | null
    difficulty?: IntFieldUpdateOperationsInput | number
    progression?: NullableStringFieldUpdateOperationsInput | string | null
    primaryMuscles?: ExerciseUpdateprimaryMusclesInput | string[]
    secondaryMuscles?: ExerciseUpdatesecondaryMusclesInput | string[]
    instructions?: StringFieldUpdateOperationsInput | string
    tips?: NullableStringFieldUpdateOperationsInput | string | null
    videoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    safetyNotes?: NullableStringFieldUpdateOperationsInput | string | null
    modifications?: NullableJsonNullValueInput | InputJsonValue
    contraindications?: NullableStringFieldUpdateOperationsInput | string | null
    tags?: ExerciseUpdatetagsInput | string[]
    isActive?: BoolFieldUpdateOperationsInput | boolean
    popularity?: IntFieldUpdateOperationsInput | number
    userRatings?: ExerciseRatingUpdateManyWithoutExerciseNestedInput
  }

  export type ExerciseUncheckedUpdateWithoutExerciseVariationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    subcategory?: NullableStringFieldUpdateOperationsInput | string | null
    equipment?: ExerciseUpdateequipmentInput | string[]
    setup?: NullableStringFieldUpdateOperationsInput | string | null
    difficulty?: IntFieldUpdateOperationsInput | number
    progression?: NullableStringFieldUpdateOperationsInput | string | null
    primaryMuscles?: ExerciseUpdateprimaryMusclesInput | string[]
    secondaryMuscles?: ExerciseUpdatesecondaryMusclesInput | string[]
    instructions?: StringFieldUpdateOperationsInput | string
    tips?: NullableStringFieldUpdateOperationsInput | string | null
    videoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    safetyNotes?: NullableStringFieldUpdateOperationsInput | string | null
    modifications?: NullableJsonNullValueInput | InputJsonValue
    contraindications?: NullableStringFieldUpdateOperationsInput | string | null
    tags?: ExerciseUpdatetagsInput | string[]
    isActive?: BoolFieldUpdateOperationsInput | boolean
    popularity?: IntFieldUpdateOperationsInput | number
    userRatings?: ExerciseRatingUncheckedUpdateManyWithoutExerciseNestedInput
  }

  export type ExerciseCreateWithoutUserRatingsInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    name: string
    description: string
    category: string
    subcategory?: string | null
    equipment?: ExerciseCreateequipmentInput | string[]
    setup?: string | null
    difficulty: number
    progression?: string | null
    primaryMuscles?: ExerciseCreateprimaryMusclesInput | string[]
    secondaryMuscles?: ExerciseCreatesecondaryMusclesInput | string[]
    instructions: string
    tips?: string | null
    videoUrl?: string | null
    imageUrl?: string | null
    safetyNotes?: string | null
    modifications?: NullableJsonNullValueInput | InputJsonValue
    contraindications?: string | null
    tags?: ExerciseCreatetagsInput | string[]
    isActive?: boolean
    popularity?: number
    exerciseVariations?: ExerciseVariationCreateNestedManyWithoutExerciseInput
  }

  export type ExerciseUncheckedCreateWithoutUserRatingsInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    name: string
    description: string
    category: string
    subcategory?: string | null
    equipment?: ExerciseCreateequipmentInput | string[]
    setup?: string | null
    difficulty: number
    progression?: string | null
    primaryMuscles?: ExerciseCreateprimaryMusclesInput | string[]
    secondaryMuscles?: ExerciseCreatesecondaryMusclesInput | string[]
    instructions: string
    tips?: string | null
    videoUrl?: string | null
    imageUrl?: string | null
    safetyNotes?: string | null
    modifications?: NullableJsonNullValueInput | InputJsonValue
    contraindications?: string | null
    tags?: ExerciseCreatetagsInput | string[]
    isActive?: boolean
    popularity?: number
    exerciseVariations?: ExerciseVariationUncheckedCreateNestedManyWithoutExerciseInput
  }

  export type ExerciseCreateOrConnectWithoutUserRatingsInput = {
    where: ExerciseWhereUniqueInput
    create: XOR<ExerciseCreateWithoutUserRatingsInput, ExerciseUncheckedCreateWithoutUserRatingsInput>
  }

  export type ExerciseUpsertWithoutUserRatingsInput = {
    update: XOR<ExerciseUpdateWithoutUserRatingsInput, ExerciseUncheckedUpdateWithoutUserRatingsInput>
    create: XOR<ExerciseCreateWithoutUserRatingsInput, ExerciseUncheckedCreateWithoutUserRatingsInput>
    where?: ExerciseWhereInput
  }

  export type ExerciseUpdateToOneWithWhereWithoutUserRatingsInput = {
    where?: ExerciseWhereInput
    data: XOR<ExerciseUpdateWithoutUserRatingsInput, ExerciseUncheckedUpdateWithoutUserRatingsInput>
  }

  export type ExerciseUpdateWithoutUserRatingsInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    subcategory?: NullableStringFieldUpdateOperationsInput | string | null
    equipment?: ExerciseUpdateequipmentInput | string[]
    setup?: NullableStringFieldUpdateOperationsInput | string | null
    difficulty?: IntFieldUpdateOperationsInput | number
    progression?: NullableStringFieldUpdateOperationsInput | string | null
    primaryMuscles?: ExerciseUpdateprimaryMusclesInput | string[]
    secondaryMuscles?: ExerciseUpdatesecondaryMusclesInput | string[]
    instructions?: StringFieldUpdateOperationsInput | string
    tips?: NullableStringFieldUpdateOperationsInput | string | null
    videoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    safetyNotes?: NullableStringFieldUpdateOperationsInput | string | null
    modifications?: NullableJsonNullValueInput | InputJsonValue
    contraindications?: NullableStringFieldUpdateOperationsInput | string | null
    tags?: ExerciseUpdatetagsInput | string[]
    isActive?: BoolFieldUpdateOperationsInput | boolean
    popularity?: IntFieldUpdateOperationsInput | number
    exerciseVariations?: ExerciseVariationUpdateManyWithoutExerciseNestedInput
  }

  export type ExerciseUncheckedUpdateWithoutUserRatingsInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    subcategory?: NullableStringFieldUpdateOperationsInput | string | null
    equipment?: ExerciseUpdateequipmentInput | string[]
    setup?: NullableStringFieldUpdateOperationsInput | string | null
    difficulty?: IntFieldUpdateOperationsInput | number
    progression?: NullableStringFieldUpdateOperationsInput | string | null
    primaryMuscles?: ExerciseUpdateprimaryMusclesInput | string[]
    secondaryMuscles?: ExerciseUpdatesecondaryMusclesInput | string[]
    instructions?: StringFieldUpdateOperationsInput | string
    tips?: NullableStringFieldUpdateOperationsInput | string | null
    videoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    safetyNotes?: NullableStringFieldUpdateOperationsInput | string | null
    modifications?: NullableJsonNullValueInput | InputJsonValue
    contraindications?: NullableStringFieldUpdateOperationsInput | string | null
    tags?: ExerciseUpdatetagsInput | string[]
    isActive?: BoolFieldUpdateOperationsInput | boolean
    popularity?: IntFieldUpdateOperationsInput | number
    exerciseVariations?: ExerciseVariationUncheckedUpdateManyWithoutExerciseNestedInput
  }

  export type ExerciseVariationCreateManyExerciseInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    name: string
    description: string
    difficulty: number
    instructions: string
    tips?: string | null
    videoUrl?: string | null
    imageUrl?: string | null
  }

  export type ExerciseRatingCreateManyExerciseInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
    rating: number
    difficulty: number
    comment?: string | null
  }

  export type ExerciseVariationUpdateWithoutExerciseInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    difficulty?: IntFieldUpdateOperationsInput | number
    instructions?: StringFieldUpdateOperationsInput | string
    tips?: NullableStringFieldUpdateOperationsInput | string | null
    videoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ExerciseVariationUncheckedUpdateWithoutExerciseInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    difficulty?: IntFieldUpdateOperationsInput | number
    instructions?: StringFieldUpdateOperationsInput | string
    tips?: NullableStringFieldUpdateOperationsInput | string | null
    videoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ExerciseVariationUncheckedUpdateManyWithoutExerciseInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    difficulty?: IntFieldUpdateOperationsInput | number
    instructions?: StringFieldUpdateOperationsInput | string
    tips?: NullableStringFieldUpdateOperationsInput | string | null
    videoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ExerciseRatingUpdateWithoutExerciseInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    rating?: IntFieldUpdateOperationsInput | number
    difficulty?: IntFieldUpdateOperationsInput | number
    comment?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ExerciseRatingUncheckedUpdateWithoutExerciseInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    rating?: IntFieldUpdateOperationsInput | number
    difficulty?: IntFieldUpdateOperationsInput | number
    comment?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ExerciseRatingUncheckedUpdateManyWithoutExerciseInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    rating?: IntFieldUpdateOperationsInput | number
    difficulty?: IntFieldUpdateOperationsInput | number
    comment?: NullableStringFieldUpdateOperationsInput | string | null
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use ExerciseCountOutputTypeDefaultArgs instead
     */
    export type ExerciseCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ExerciseCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ExerciseDefaultArgs instead
     */
    export type ExerciseArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ExerciseDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ExerciseVariationDefaultArgs instead
     */
    export type ExerciseVariationArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ExerciseVariationDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ExerciseRatingDefaultArgs instead
     */
    export type ExerciseRatingArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ExerciseRatingDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ExerciseCategoryDefaultArgs instead
     */
    export type ExerciseCategoryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ExerciseCategoryDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}