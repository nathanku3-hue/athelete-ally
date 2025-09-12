
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
 * Model WorkoutSession
 * 
 */
export type WorkoutSession = $Result.DefaultSelection<Prisma.$WorkoutSessionPayload>
/**
 * Model UserSummary
 * 
 */
export type UserSummary = $Result.DefaultSelection<Prisma.$UserSummaryPayload>
/**
 * Model WorkoutExercise
 * 
 */
export type WorkoutExercise = $Result.DefaultSelection<Prisma.$WorkoutExercisePayload>
/**
 * Model WorkoutRecord
 * 
 */
export type WorkoutRecord = $Result.DefaultSelection<Prisma.$WorkoutRecordPayload>
/**
 * Model PersonalRecord
 * 
 */
export type PersonalRecord = $Result.DefaultSelection<Prisma.$PersonalRecordPayload>
/**
 * Model WorkoutTemplate
 * 
 */
export type WorkoutTemplate = $Result.DefaultSelection<Prisma.$WorkoutTemplatePayload>
/**
 * Model WorkoutGoal
 * 
 */
export type WorkoutGoal = $Result.DefaultSelection<Prisma.$WorkoutGoalPayload>

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more WorkoutSessions
 * const workoutSessions = await prisma.workoutSession.findMany()
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
   * // Fetch zero or more WorkoutSessions
   * const workoutSessions = await prisma.workoutSession.findMany()
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
   * `prisma.workoutSession`: Exposes CRUD operations for the **WorkoutSession** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more WorkoutSessions
    * const workoutSessions = await prisma.workoutSession.findMany()
    * ```
    */
  get workoutSession(): Prisma.WorkoutSessionDelegate<ExtArgs>;

  /**
   * `prisma.userSummary`: Exposes CRUD operations for the **UserSummary** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserSummaries
    * const userSummaries = await prisma.userSummary.findMany()
    * ```
    */
  get userSummary(): Prisma.UserSummaryDelegate<ExtArgs>;

  /**
   * `prisma.workoutExercise`: Exposes CRUD operations for the **WorkoutExercise** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more WorkoutExercises
    * const workoutExercises = await prisma.workoutExercise.findMany()
    * ```
    */
  get workoutExercise(): Prisma.WorkoutExerciseDelegate<ExtArgs>;

  /**
   * `prisma.workoutRecord`: Exposes CRUD operations for the **WorkoutRecord** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more WorkoutRecords
    * const workoutRecords = await prisma.workoutRecord.findMany()
    * ```
    */
  get workoutRecord(): Prisma.WorkoutRecordDelegate<ExtArgs>;

  /**
   * `prisma.personalRecord`: Exposes CRUD operations for the **PersonalRecord** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PersonalRecords
    * const personalRecords = await prisma.personalRecord.findMany()
    * ```
    */
  get personalRecord(): Prisma.PersonalRecordDelegate<ExtArgs>;

  /**
   * `prisma.workoutTemplate`: Exposes CRUD operations for the **WorkoutTemplate** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more WorkoutTemplates
    * const workoutTemplates = await prisma.workoutTemplate.findMany()
    * ```
    */
  get workoutTemplate(): Prisma.WorkoutTemplateDelegate<ExtArgs>;

  /**
   * `prisma.workoutGoal`: Exposes CRUD operations for the **WorkoutGoal** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more WorkoutGoals
    * const workoutGoals = await prisma.workoutGoal.findMany()
    * ```
    */
  get workoutGoal(): Prisma.WorkoutGoalDelegate<ExtArgs>;
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
    WorkoutSession: 'WorkoutSession',
    UserSummary: 'UserSummary',
    WorkoutExercise: 'WorkoutExercise',
    WorkoutRecord: 'WorkoutRecord',
    PersonalRecord: 'PersonalRecord',
    WorkoutTemplate: 'WorkoutTemplate',
    WorkoutGoal: 'WorkoutGoal'
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
      modelProps: "workoutSession" | "userSummary" | "workoutExercise" | "workoutRecord" | "personalRecord" | "workoutTemplate" | "workoutGoal"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      WorkoutSession: {
        payload: Prisma.$WorkoutSessionPayload<ExtArgs>
        fields: Prisma.WorkoutSessionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.WorkoutSessionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutSessionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.WorkoutSessionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutSessionPayload>
          }
          findFirst: {
            args: Prisma.WorkoutSessionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutSessionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.WorkoutSessionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutSessionPayload>
          }
          findMany: {
            args: Prisma.WorkoutSessionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutSessionPayload>[]
          }
          create: {
            args: Prisma.WorkoutSessionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutSessionPayload>
          }
          createMany: {
            args: Prisma.WorkoutSessionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.WorkoutSessionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutSessionPayload>[]
          }
          delete: {
            args: Prisma.WorkoutSessionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutSessionPayload>
          }
          update: {
            args: Prisma.WorkoutSessionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutSessionPayload>
          }
          deleteMany: {
            args: Prisma.WorkoutSessionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.WorkoutSessionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.WorkoutSessionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutSessionPayload>
          }
          aggregate: {
            args: Prisma.WorkoutSessionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateWorkoutSession>
          }
          groupBy: {
            args: Prisma.WorkoutSessionGroupByArgs<ExtArgs>
            result: $Utils.Optional<WorkoutSessionGroupByOutputType>[]
          }
          count: {
            args: Prisma.WorkoutSessionCountArgs<ExtArgs>
            result: $Utils.Optional<WorkoutSessionCountAggregateOutputType> | number
          }
        }
      }
      UserSummary: {
        payload: Prisma.$UserSummaryPayload<ExtArgs>
        fields: Prisma.UserSummaryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserSummaryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSummaryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserSummaryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSummaryPayload>
          }
          findFirst: {
            args: Prisma.UserSummaryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSummaryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserSummaryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSummaryPayload>
          }
          findMany: {
            args: Prisma.UserSummaryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSummaryPayload>[]
          }
          create: {
            args: Prisma.UserSummaryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSummaryPayload>
          }
          createMany: {
            args: Prisma.UserSummaryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserSummaryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSummaryPayload>[]
          }
          delete: {
            args: Prisma.UserSummaryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSummaryPayload>
          }
          update: {
            args: Prisma.UserSummaryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSummaryPayload>
          }
          deleteMany: {
            args: Prisma.UserSummaryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserSummaryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.UserSummaryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserSummaryPayload>
          }
          aggregate: {
            args: Prisma.UserSummaryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserSummary>
          }
          groupBy: {
            args: Prisma.UserSummaryGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserSummaryGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserSummaryCountArgs<ExtArgs>
            result: $Utils.Optional<UserSummaryCountAggregateOutputType> | number
          }
        }
      }
      WorkoutExercise: {
        payload: Prisma.$WorkoutExercisePayload<ExtArgs>
        fields: Prisma.WorkoutExerciseFieldRefs
        operations: {
          findUnique: {
            args: Prisma.WorkoutExerciseFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutExercisePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.WorkoutExerciseFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutExercisePayload>
          }
          findFirst: {
            args: Prisma.WorkoutExerciseFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutExercisePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.WorkoutExerciseFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutExercisePayload>
          }
          findMany: {
            args: Prisma.WorkoutExerciseFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutExercisePayload>[]
          }
          create: {
            args: Prisma.WorkoutExerciseCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutExercisePayload>
          }
          createMany: {
            args: Prisma.WorkoutExerciseCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.WorkoutExerciseCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutExercisePayload>[]
          }
          delete: {
            args: Prisma.WorkoutExerciseDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutExercisePayload>
          }
          update: {
            args: Prisma.WorkoutExerciseUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutExercisePayload>
          }
          deleteMany: {
            args: Prisma.WorkoutExerciseDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.WorkoutExerciseUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.WorkoutExerciseUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutExercisePayload>
          }
          aggregate: {
            args: Prisma.WorkoutExerciseAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateWorkoutExercise>
          }
          groupBy: {
            args: Prisma.WorkoutExerciseGroupByArgs<ExtArgs>
            result: $Utils.Optional<WorkoutExerciseGroupByOutputType>[]
          }
          count: {
            args: Prisma.WorkoutExerciseCountArgs<ExtArgs>
            result: $Utils.Optional<WorkoutExerciseCountAggregateOutputType> | number
          }
        }
      }
      WorkoutRecord: {
        payload: Prisma.$WorkoutRecordPayload<ExtArgs>
        fields: Prisma.WorkoutRecordFieldRefs
        operations: {
          findUnique: {
            args: Prisma.WorkoutRecordFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutRecordPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.WorkoutRecordFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutRecordPayload>
          }
          findFirst: {
            args: Prisma.WorkoutRecordFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutRecordPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.WorkoutRecordFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutRecordPayload>
          }
          findMany: {
            args: Prisma.WorkoutRecordFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutRecordPayload>[]
          }
          create: {
            args: Prisma.WorkoutRecordCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutRecordPayload>
          }
          createMany: {
            args: Prisma.WorkoutRecordCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.WorkoutRecordCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutRecordPayload>[]
          }
          delete: {
            args: Prisma.WorkoutRecordDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutRecordPayload>
          }
          update: {
            args: Prisma.WorkoutRecordUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutRecordPayload>
          }
          deleteMany: {
            args: Prisma.WorkoutRecordDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.WorkoutRecordUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.WorkoutRecordUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutRecordPayload>
          }
          aggregate: {
            args: Prisma.WorkoutRecordAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateWorkoutRecord>
          }
          groupBy: {
            args: Prisma.WorkoutRecordGroupByArgs<ExtArgs>
            result: $Utils.Optional<WorkoutRecordGroupByOutputType>[]
          }
          count: {
            args: Prisma.WorkoutRecordCountArgs<ExtArgs>
            result: $Utils.Optional<WorkoutRecordCountAggregateOutputType> | number
          }
        }
      }
      PersonalRecord: {
        payload: Prisma.$PersonalRecordPayload<ExtArgs>
        fields: Prisma.PersonalRecordFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PersonalRecordFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PersonalRecordPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PersonalRecordFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PersonalRecordPayload>
          }
          findFirst: {
            args: Prisma.PersonalRecordFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PersonalRecordPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PersonalRecordFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PersonalRecordPayload>
          }
          findMany: {
            args: Prisma.PersonalRecordFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PersonalRecordPayload>[]
          }
          create: {
            args: Prisma.PersonalRecordCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PersonalRecordPayload>
          }
          createMany: {
            args: Prisma.PersonalRecordCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PersonalRecordCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PersonalRecordPayload>[]
          }
          delete: {
            args: Prisma.PersonalRecordDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PersonalRecordPayload>
          }
          update: {
            args: Prisma.PersonalRecordUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PersonalRecordPayload>
          }
          deleteMany: {
            args: Prisma.PersonalRecordDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PersonalRecordUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PersonalRecordUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PersonalRecordPayload>
          }
          aggregate: {
            args: Prisma.PersonalRecordAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePersonalRecord>
          }
          groupBy: {
            args: Prisma.PersonalRecordGroupByArgs<ExtArgs>
            result: $Utils.Optional<PersonalRecordGroupByOutputType>[]
          }
          count: {
            args: Prisma.PersonalRecordCountArgs<ExtArgs>
            result: $Utils.Optional<PersonalRecordCountAggregateOutputType> | number
          }
        }
      }
      WorkoutTemplate: {
        payload: Prisma.$WorkoutTemplatePayload<ExtArgs>
        fields: Prisma.WorkoutTemplateFieldRefs
        operations: {
          findUnique: {
            args: Prisma.WorkoutTemplateFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutTemplatePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.WorkoutTemplateFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutTemplatePayload>
          }
          findFirst: {
            args: Prisma.WorkoutTemplateFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutTemplatePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.WorkoutTemplateFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutTemplatePayload>
          }
          findMany: {
            args: Prisma.WorkoutTemplateFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutTemplatePayload>[]
          }
          create: {
            args: Prisma.WorkoutTemplateCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutTemplatePayload>
          }
          createMany: {
            args: Prisma.WorkoutTemplateCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.WorkoutTemplateCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutTemplatePayload>[]
          }
          delete: {
            args: Prisma.WorkoutTemplateDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutTemplatePayload>
          }
          update: {
            args: Prisma.WorkoutTemplateUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutTemplatePayload>
          }
          deleteMany: {
            args: Prisma.WorkoutTemplateDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.WorkoutTemplateUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.WorkoutTemplateUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutTemplatePayload>
          }
          aggregate: {
            args: Prisma.WorkoutTemplateAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateWorkoutTemplate>
          }
          groupBy: {
            args: Prisma.WorkoutTemplateGroupByArgs<ExtArgs>
            result: $Utils.Optional<WorkoutTemplateGroupByOutputType>[]
          }
          count: {
            args: Prisma.WorkoutTemplateCountArgs<ExtArgs>
            result: $Utils.Optional<WorkoutTemplateCountAggregateOutputType> | number
          }
        }
      }
      WorkoutGoal: {
        payload: Prisma.$WorkoutGoalPayload<ExtArgs>
        fields: Prisma.WorkoutGoalFieldRefs
        operations: {
          findUnique: {
            args: Prisma.WorkoutGoalFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutGoalPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.WorkoutGoalFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutGoalPayload>
          }
          findFirst: {
            args: Prisma.WorkoutGoalFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutGoalPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.WorkoutGoalFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutGoalPayload>
          }
          findMany: {
            args: Prisma.WorkoutGoalFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutGoalPayload>[]
          }
          create: {
            args: Prisma.WorkoutGoalCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutGoalPayload>
          }
          createMany: {
            args: Prisma.WorkoutGoalCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.WorkoutGoalCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutGoalPayload>[]
          }
          delete: {
            args: Prisma.WorkoutGoalDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutGoalPayload>
          }
          update: {
            args: Prisma.WorkoutGoalUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutGoalPayload>
          }
          deleteMany: {
            args: Prisma.WorkoutGoalDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.WorkoutGoalUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.WorkoutGoalUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkoutGoalPayload>
          }
          aggregate: {
            args: Prisma.WorkoutGoalAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateWorkoutGoal>
          }
          groupBy: {
            args: Prisma.WorkoutGoalGroupByArgs<ExtArgs>
            result: $Utils.Optional<WorkoutGoalGroupByOutputType>[]
          }
          count: {
            args: Prisma.WorkoutGoalCountArgs<ExtArgs>
            result: $Utils.Optional<WorkoutGoalCountAggregateOutputType> | number
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
   * Count Type WorkoutSessionCountOutputType
   */

  export type WorkoutSessionCountOutputType = {
    records: number
    exercises: number
  }

  export type WorkoutSessionCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    records?: boolean | WorkoutSessionCountOutputTypeCountRecordsArgs
    exercises?: boolean | WorkoutSessionCountOutputTypeCountExercisesArgs
  }

  // Custom InputTypes
  /**
   * WorkoutSessionCountOutputType without action
   */
  export type WorkoutSessionCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutSessionCountOutputType
     */
    select?: WorkoutSessionCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * WorkoutSessionCountOutputType without action
   */
  export type WorkoutSessionCountOutputTypeCountRecordsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WorkoutRecordWhereInput
  }

  /**
   * WorkoutSessionCountOutputType without action
   */
  export type WorkoutSessionCountOutputTypeCountExercisesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WorkoutExerciseWhereInput
  }


  /**
   * Count Type WorkoutExerciseCountOutputType
   */

  export type WorkoutExerciseCountOutputType = {
    records: number
  }

  export type WorkoutExerciseCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    records?: boolean | WorkoutExerciseCountOutputTypeCountRecordsArgs
  }

  // Custom InputTypes
  /**
   * WorkoutExerciseCountOutputType without action
   */
  export type WorkoutExerciseCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutExerciseCountOutputType
     */
    select?: WorkoutExerciseCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * WorkoutExerciseCountOutputType without action
   */
  export type WorkoutExerciseCountOutputTypeCountRecordsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WorkoutRecordWhereInput
  }


  /**
   * Models
   */

  /**
   * Model WorkoutSession
   */

  export type AggregateWorkoutSession = {
    _count: WorkoutSessionCountAggregateOutputType | null
    _avg: WorkoutSessionAvgAggregateOutputType | null
    _sum: WorkoutSessionSumAggregateOutputType | null
    _min: WorkoutSessionMinAggregateOutputType | null
    _max: WorkoutSessionMaxAggregateOutputType | null
  }

  export type WorkoutSessionAvgAggregateOutputType = {
    totalDuration: number | null
    overallRating: number | null
    difficulty: number | null
    energy: number | null
    motivation: number | null
    temperature: number | null
  }

  export type WorkoutSessionSumAggregateOutputType = {
    totalDuration: number | null
    overallRating: number | null
    difficulty: number | null
    energy: number | null
    motivation: number | null
    temperature: number | null
  }

  export type WorkoutSessionMinAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    updatedAt: Date | null
    userId: string | null
    planId: string | null
    sessionName: string | null
    startedAt: Date | null
    completedAt: Date | null
    pausedAt: Date | null
    totalDuration: number | null
    status: string | null
    isActive: boolean | null
    notes: string | null
    overallRating: number | null
    difficulty: number | null
    energy: number | null
    motivation: number | null
    location: string | null
    weather: string | null
    temperature: number | null
  }

  export type WorkoutSessionMaxAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    updatedAt: Date | null
    userId: string | null
    planId: string | null
    sessionName: string | null
    startedAt: Date | null
    completedAt: Date | null
    pausedAt: Date | null
    totalDuration: number | null
    status: string | null
    isActive: boolean | null
    notes: string | null
    overallRating: number | null
    difficulty: number | null
    energy: number | null
    motivation: number | null
    location: string | null
    weather: string | null
    temperature: number | null
  }

  export type WorkoutSessionCountAggregateOutputType = {
    id: number
    createdAt: number
    updatedAt: number
    userId: number
    planId: number
    sessionName: number
    startedAt: number
    completedAt: number
    pausedAt: number
    totalDuration: number
    status: number
    isActive: number
    notes: number
    overallRating: number
    difficulty: number
    energy: number
    motivation: number
    location: number
    weather: number
    temperature: number
    _all: number
  }


  export type WorkoutSessionAvgAggregateInputType = {
    totalDuration?: true
    overallRating?: true
    difficulty?: true
    energy?: true
    motivation?: true
    temperature?: true
  }

  export type WorkoutSessionSumAggregateInputType = {
    totalDuration?: true
    overallRating?: true
    difficulty?: true
    energy?: true
    motivation?: true
    temperature?: true
  }

  export type WorkoutSessionMinAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
    planId?: true
    sessionName?: true
    startedAt?: true
    completedAt?: true
    pausedAt?: true
    totalDuration?: true
    status?: true
    isActive?: true
    notes?: true
    overallRating?: true
    difficulty?: true
    energy?: true
    motivation?: true
    location?: true
    weather?: true
    temperature?: true
  }

  export type WorkoutSessionMaxAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
    planId?: true
    sessionName?: true
    startedAt?: true
    completedAt?: true
    pausedAt?: true
    totalDuration?: true
    status?: true
    isActive?: true
    notes?: true
    overallRating?: true
    difficulty?: true
    energy?: true
    motivation?: true
    location?: true
    weather?: true
    temperature?: true
  }

  export type WorkoutSessionCountAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
    planId?: true
    sessionName?: true
    startedAt?: true
    completedAt?: true
    pausedAt?: true
    totalDuration?: true
    status?: true
    isActive?: true
    notes?: true
    overallRating?: true
    difficulty?: true
    energy?: true
    motivation?: true
    location?: true
    weather?: true
    temperature?: true
    _all?: true
  }

  export type WorkoutSessionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WorkoutSession to aggregate.
     */
    where?: WorkoutSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WorkoutSessions to fetch.
     */
    orderBy?: WorkoutSessionOrderByWithRelationInput | WorkoutSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: WorkoutSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WorkoutSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WorkoutSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned WorkoutSessions
    **/
    _count?: true | WorkoutSessionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: WorkoutSessionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: WorkoutSessionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: WorkoutSessionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: WorkoutSessionMaxAggregateInputType
  }

  export type GetWorkoutSessionAggregateType<T extends WorkoutSessionAggregateArgs> = {
        [P in keyof T & keyof AggregateWorkoutSession]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateWorkoutSession[P]>
      : GetScalarType<T[P], AggregateWorkoutSession[P]>
  }




  export type WorkoutSessionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WorkoutSessionWhereInput
    orderBy?: WorkoutSessionOrderByWithAggregationInput | WorkoutSessionOrderByWithAggregationInput[]
    by: WorkoutSessionScalarFieldEnum[] | WorkoutSessionScalarFieldEnum
    having?: WorkoutSessionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: WorkoutSessionCountAggregateInputType | true
    _avg?: WorkoutSessionAvgAggregateInputType
    _sum?: WorkoutSessionSumAggregateInputType
    _min?: WorkoutSessionMinAggregateInputType
    _max?: WorkoutSessionMaxAggregateInputType
  }

  export type WorkoutSessionGroupByOutputType = {
    id: string
    createdAt: Date
    updatedAt: Date
    userId: string
    planId: string | null
    sessionName: string | null
    startedAt: Date | null
    completedAt: Date | null
    pausedAt: Date | null
    totalDuration: number | null
    status: string
    isActive: boolean
    notes: string | null
    overallRating: number | null
    difficulty: number | null
    energy: number | null
    motivation: number | null
    location: string | null
    weather: string | null
    temperature: number | null
    _count: WorkoutSessionCountAggregateOutputType | null
    _avg: WorkoutSessionAvgAggregateOutputType | null
    _sum: WorkoutSessionSumAggregateOutputType | null
    _min: WorkoutSessionMinAggregateOutputType | null
    _max: WorkoutSessionMaxAggregateOutputType | null
  }

  type GetWorkoutSessionGroupByPayload<T extends WorkoutSessionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<WorkoutSessionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof WorkoutSessionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], WorkoutSessionGroupByOutputType[P]>
            : GetScalarType<T[P], WorkoutSessionGroupByOutputType[P]>
        }
      >
    >


  export type WorkoutSessionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    planId?: boolean
    sessionName?: boolean
    startedAt?: boolean
    completedAt?: boolean
    pausedAt?: boolean
    totalDuration?: boolean
    status?: boolean
    isActive?: boolean
    notes?: boolean
    overallRating?: boolean
    difficulty?: boolean
    energy?: boolean
    motivation?: boolean
    location?: boolean
    weather?: boolean
    temperature?: boolean
    records?: boolean | WorkoutSession$recordsArgs<ExtArgs>
    exercises?: boolean | WorkoutSession$exercisesArgs<ExtArgs>
    _count?: boolean | WorkoutSessionCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["workoutSession"]>

  export type WorkoutSessionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    planId?: boolean
    sessionName?: boolean
    startedAt?: boolean
    completedAt?: boolean
    pausedAt?: boolean
    totalDuration?: boolean
    status?: boolean
    isActive?: boolean
    notes?: boolean
    overallRating?: boolean
    difficulty?: boolean
    energy?: boolean
    motivation?: boolean
    location?: boolean
    weather?: boolean
    temperature?: boolean
  }, ExtArgs["result"]["workoutSession"]>

  export type WorkoutSessionSelectScalar = {
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    planId?: boolean
    sessionName?: boolean
    startedAt?: boolean
    completedAt?: boolean
    pausedAt?: boolean
    totalDuration?: boolean
    status?: boolean
    isActive?: boolean
    notes?: boolean
    overallRating?: boolean
    difficulty?: boolean
    energy?: boolean
    motivation?: boolean
    location?: boolean
    weather?: boolean
    temperature?: boolean
  }

  export type WorkoutSessionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    records?: boolean | WorkoutSession$recordsArgs<ExtArgs>
    exercises?: boolean | WorkoutSession$exercisesArgs<ExtArgs>
    _count?: boolean | WorkoutSessionCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type WorkoutSessionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $WorkoutSessionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "WorkoutSession"
    objects: {
      records: Prisma.$WorkoutRecordPayload<ExtArgs>[]
      exercises: Prisma.$WorkoutExercisePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      createdAt: Date
      updatedAt: Date
      userId: string
      planId: string | null
      sessionName: string | null
      startedAt: Date | null
      completedAt: Date | null
      pausedAt: Date | null
      totalDuration: number | null
      status: string
      isActive: boolean
      notes: string | null
      overallRating: number | null
      difficulty: number | null
      energy: number | null
      motivation: number | null
      location: string | null
      weather: string | null
      temperature: number | null
    }, ExtArgs["result"]["workoutSession"]>
    composites: {}
  }

  type WorkoutSessionGetPayload<S extends boolean | null | undefined | WorkoutSessionDefaultArgs> = $Result.GetResult<Prisma.$WorkoutSessionPayload, S>

  type WorkoutSessionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<WorkoutSessionFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: WorkoutSessionCountAggregateInputType | true
    }

  export interface WorkoutSessionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['WorkoutSession'], meta: { name: 'WorkoutSession' } }
    /**
     * Find zero or one WorkoutSession that matches the filter.
     * @param {WorkoutSessionFindUniqueArgs} args - Arguments to find a WorkoutSession
     * @example
     * // Get one WorkoutSession
     * const workoutSession = await prisma.workoutSession.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends WorkoutSessionFindUniqueArgs>(args: SelectSubset<T, WorkoutSessionFindUniqueArgs<ExtArgs>>): Prisma__WorkoutSessionClient<$Result.GetResult<Prisma.$WorkoutSessionPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one WorkoutSession that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {WorkoutSessionFindUniqueOrThrowArgs} args - Arguments to find a WorkoutSession
     * @example
     * // Get one WorkoutSession
     * const workoutSession = await prisma.workoutSession.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends WorkoutSessionFindUniqueOrThrowArgs>(args: SelectSubset<T, WorkoutSessionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__WorkoutSessionClient<$Result.GetResult<Prisma.$WorkoutSessionPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first WorkoutSession that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkoutSessionFindFirstArgs} args - Arguments to find a WorkoutSession
     * @example
     * // Get one WorkoutSession
     * const workoutSession = await prisma.workoutSession.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends WorkoutSessionFindFirstArgs>(args?: SelectSubset<T, WorkoutSessionFindFirstArgs<ExtArgs>>): Prisma__WorkoutSessionClient<$Result.GetResult<Prisma.$WorkoutSessionPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first WorkoutSession that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkoutSessionFindFirstOrThrowArgs} args - Arguments to find a WorkoutSession
     * @example
     * // Get one WorkoutSession
     * const workoutSession = await prisma.workoutSession.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends WorkoutSessionFindFirstOrThrowArgs>(args?: SelectSubset<T, WorkoutSessionFindFirstOrThrowArgs<ExtArgs>>): Prisma__WorkoutSessionClient<$Result.GetResult<Prisma.$WorkoutSessionPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more WorkoutSessions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkoutSessionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all WorkoutSessions
     * const workoutSessions = await prisma.workoutSession.findMany()
     * 
     * // Get first 10 WorkoutSessions
     * const workoutSessions = await prisma.workoutSession.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const workoutSessionWithIdOnly = await prisma.workoutSession.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends WorkoutSessionFindManyArgs>(args?: SelectSubset<T, WorkoutSessionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WorkoutSessionPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a WorkoutSession.
     * @param {WorkoutSessionCreateArgs} args - Arguments to create a WorkoutSession.
     * @example
     * // Create one WorkoutSession
     * const WorkoutSession = await prisma.workoutSession.create({
     *   data: {
     *     // ... data to create a WorkoutSession
     *   }
     * })
     * 
     */
    create<T extends WorkoutSessionCreateArgs>(args: SelectSubset<T, WorkoutSessionCreateArgs<ExtArgs>>): Prisma__WorkoutSessionClient<$Result.GetResult<Prisma.$WorkoutSessionPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many WorkoutSessions.
     * @param {WorkoutSessionCreateManyArgs} args - Arguments to create many WorkoutSessions.
     * @example
     * // Create many WorkoutSessions
     * const workoutSession = await prisma.workoutSession.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends WorkoutSessionCreateManyArgs>(args?: SelectSubset<T, WorkoutSessionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many WorkoutSessions and returns the data saved in the database.
     * @param {WorkoutSessionCreateManyAndReturnArgs} args - Arguments to create many WorkoutSessions.
     * @example
     * // Create many WorkoutSessions
     * const workoutSession = await prisma.workoutSession.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many WorkoutSessions and only return the `id`
     * const workoutSessionWithIdOnly = await prisma.workoutSession.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends WorkoutSessionCreateManyAndReturnArgs>(args?: SelectSubset<T, WorkoutSessionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WorkoutSessionPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a WorkoutSession.
     * @param {WorkoutSessionDeleteArgs} args - Arguments to delete one WorkoutSession.
     * @example
     * // Delete one WorkoutSession
     * const WorkoutSession = await prisma.workoutSession.delete({
     *   where: {
     *     // ... filter to delete one WorkoutSession
     *   }
     * })
     * 
     */
    delete<T extends WorkoutSessionDeleteArgs>(args: SelectSubset<T, WorkoutSessionDeleteArgs<ExtArgs>>): Prisma__WorkoutSessionClient<$Result.GetResult<Prisma.$WorkoutSessionPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one WorkoutSession.
     * @param {WorkoutSessionUpdateArgs} args - Arguments to update one WorkoutSession.
     * @example
     * // Update one WorkoutSession
     * const workoutSession = await prisma.workoutSession.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends WorkoutSessionUpdateArgs>(args: SelectSubset<T, WorkoutSessionUpdateArgs<ExtArgs>>): Prisma__WorkoutSessionClient<$Result.GetResult<Prisma.$WorkoutSessionPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more WorkoutSessions.
     * @param {WorkoutSessionDeleteManyArgs} args - Arguments to filter WorkoutSessions to delete.
     * @example
     * // Delete a few WorkoutSessions
     * const { count } = await prisma.workoutSession.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends WorkoutSessionDeleteManyArgs>(args?: SelectSubset<T, WorkoutSessionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WorkoutSessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkoutSessionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many WorkoutSessions
     * const workoutSession = await prisma.workoutSession.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends WorkoutSessionUpdateManyArgs>(args: SelectSubset<T, WorkoutSessionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one WorkoutSession.
     * @param {WorkoutSessionUpsertArgs} args - Arguments to update or create a WorkoutSession.
     * @example
     * // Update or create a WorkoutSession
     * const workoutSession = await prisma.workoutSession.upsert({
     *   create: {
     *     // ... data to create a WorkoutSession
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the WorkoutSession we want to update
     *   }
     * })
     */
    upsert<T extends WorkoutSessionUpsertArgs>(args: SelectSubset<T, WorkoutSessionUpsertArgs<ExtArgs>>): Prisma__WorkoutSessionClient<$Result.GetResult<Prisma.$WorkoutSessionPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of WorkoutSessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkoutSessionCountArgs} args - Arguments to filter WorkoutSessions to count.
     * @example
     * // Count the number of WorkoutSessions
     * const count = await prisma.workoutSession.count({
     *   where: {
     *     // ... the filter for the WorkoutSessions we want to count
     *   }
     * })
    **/
    count<T extends WorkoutSessionCountArgs>(
      args?: Subset<T, WorkoutSessionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], WorkoutSessionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a WorkoutSession.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkoutSessionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends WorkoutSessionAggregateArgs>(args: Subset<T, WorkoutSessionAggregateArgs>): Prisma.PrismaPromise<GetWorkoutSessionAggregateType<T>>

    /**
     * Group by WorkoutSession.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkoutSessionGroupByArgs} args - Group by arguments.
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
      T extends WorkoutSessionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: WorkoutSessionGroupByArgs['orderBy'] }
        : { orderBy?: WorkoutSessionGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, WorkoutSessionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetWorkoutSessionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the WorkoutSession model
   */
  readonly fields: WorkoutSessionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for WorkoutSession.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__WorkoutSessionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    records<T extends WorkoutSession$recordsArgs<ExtArgs> = {}>(args?: Subset<T, WorkoutSession$recordsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WorkoutRecordPayload<ExtArgs>, T, "findMany"> | Null>
    exercises<T extends WorkoutSession$exercisesArgs<ExtArgs> = {}>(args?: Subset<T, WorkoutSession$exercisesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WorkoutExercisePayload<ExtArgs>, T, "findMany"> | Null>
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
   * Fields of the WorkoutSession model
   */ 
  interface WorkoutSessionFieldRefs {
    readonly id: FieldRef<"WorkoutSession", 'String'>
    readonly createdAt: FieldRef<"WorkoutSession", 'DateTime'>
    readonly updatedAt: FieldRef<"WorkoutSession", 'DateTime'>
    readonly userId: FieldRef<"WorkoutSession", 'String'>
    readonly planId: FieldRef<"WorkoutSession", 'String'>
    readonly sessionName: FieldRef<"WorkoutSession", 'String'>
    readonly startedAt: FieldRef<"WorkoutSession", 'DateTime'>
    readonly completedAt: FieldRef<"WorkoutSession", 'DateTime'>
    readonly pausedAt: FieldRef<"WorkoutSession", 'DateTime'>
    readonly totalDuration: FieldRef<"WorkoutSession", 'Int'>
    readonly status: FieldRef<"WorkoutSession", 'String'>
    readonly isActive: FieldRef<"WorkoutSession", 'Boolean'>
    readonly notes: FieldRef<"WorkoutSession", 'String'>
    readonly overallRating: FieldRef<"WorkoutSession", 'Int'>
    readonly difficulty: FieldRef<"WorkoutSession", 'Int'>
    readonly energy: FieldRef<"WorkoutSession", 'Int'>
    readonly motivation: FieldRef<"WorkoutSession", 'Int'>
    readonly location: FieldRef<"WorkoutSession", 'String'>
    readonly weather: FieldRef<"WorkoutSession", 'String'>
    readonly temperature: FieldRef<"WorkoutSession", 'Float'>
  }
    

  // Custom InputTypes
  /**
   * WorkoutSession findUnique
   */
  export type WorkoutSessionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutSession
     */
    select?: WorkoutSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutSessionInclude<ExtArgs> | null
    /**
     * Filter, which WorkoutSession to fetch.
     */
    where: WorkoutSessionWhereUniqueInput
  }

  /**
   * WorkoutSession findUniqueOrThrow
   */
  export type WorkoutSessionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutSession
     */
    select?: WorkoutSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutSessionInclude<ExtArgs> | null
    /**
     * Filter, which WorkoutSession to fetch.
     */
    where: WorkoutSessionWhereUniqueInput
  }

  /**
   * WorkoutSession findFirst
   */
  export type WorkoutSessionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutSession
     */
    select?: WorkoutSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutSessionInclude<ExtArgs> | null
    /**
     * Filter, which WorkoutSession to fetch.
     */
    where?: WorkoutSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WorkoutSessions to fetch.
     */
    orderBy?: WorkoutSessionOrderByWithRelationInput | WorkoutSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WorkoutSessions.
     */
    cursor?: WorkoutSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WorkoutSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WorkoutSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WorkoutSessions.
     */
    distinct?: WorkoutSessionScalarFieldEnum | WorkoutSessionScalarFieldEnum[]
  }

  /**
   * WorkoutSession findFirstOrThrow
   */
  export type WorkoutSessionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutSession
     */
    select?: WorkoutSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutSessionInclude<ExtArgs> | null
    /**
     * Filter, which WorkoutSession to fetch.
     */
    where?: WorkoutSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WorkoutSessions to fetch.
     */
    orderBy?: WorkoutSessionOrderByWithRelationInput | WorkoutSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WorkoutSessions.
     */
    cursor?: WorkoutSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WorkoutSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WorkoutSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WorkoutSessions.
     */
    distinct?: WorkoutSessionScalarFieldEnum | WorkoutSessionScalarFieldEnum[]
  }

  /**
   * WorkoutSession findMany
   */
  export type WorkoutSessionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutSession
     */
    select?: WorkoutSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutSessionInclude<ExtArgs> | null
    /**
     * Filter, which WorkoutSessions to fetch.
     */
    where?: WorkoutSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WorkoutSessions to fetch.
     */
    orderBy?: WorkoutSessionOrderByWithRelationInput | WorkoutSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing WorkoutSessions.
     */
    cursor?: WorkoutSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WorkoutSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WorkoutSessions.
     */
    skip?: number
    distinct?: WorkoutSessionScalarFieldEnum | WorkoutSessionScalarFieldEnum[]
  }

  /**
   * WorkoutSession create
   */
  export type WorkoutSessionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutSession
     */
    select?: WorkoutSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutSessionInclude<ExtArgs> | null
    /**
     * The data needed to create a WorkoutSession.
     */
    data: XOR<WorkoutSessionCreateInput, WorkoutSessionUncheckedCreateInput>
  }

  /**
   * WorkoutSession createMany
   */
  export type WorkoutSessionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many WorkoutSessions.
     */
    data: WorkoutSessionCreateManyInput | WorkoutSessionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * WorkoutSession createManyAndReturn
   */
  export type WorkoutSessionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutSession
     */
    select?: WorkoutSessionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many WorkoutSessions.
     */
    data: WorkoutSessionCreateManyInput | WorkoutSessionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * WorkoutSession update
   */
  export type WorkoutSessionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutSession
     */
    select?: WorkoutSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutSessionInclude<ExtArgs> | null
    /**
     * The data needed to update a WorkoutSession.
     */
    data: XOR<WorkoutSessionUpdateInput, WorkoutSessionUncheckedUpdateInput>
    /**
     * Choose, which WorkoutSession to update.
     */
    where: WorkoutSessionWhereUniqueInput
  }

  /**
   * WorkoutSession updateMany
   */
  export type WorkoutSessionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update WorkoutSessions.
     */
    data: XOR<WorkoutSessionUpdateManyMutationInput, WorkoutSessionUncheckedUpdateManyInput>
    /**
     * Filter which WorkoutSessions to update
     */
    where?: WorkoutSessionWhereInput
  }

  /**
   * WorkoutSession upsert
   */
  export type WorkoutSessionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutSession
     */
    select?: WorkoutSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutSessionInclude<ExtArgs> | null
    /**
     * The filter to search for the WorkoutSession to update in case it exists.
     */
    where: WorkoutSessionWhereUniqueInput
    /**
     * In case the WorkoutSession found by the `where` argument doesn't exist, create a new WorkoutSession with this data.
     */
    create: XOR<WorkoutSessionCreateInput, WorkoutSessionUncheckedCreateInput>
    /**
     * In case the WorkoutSession was found with the provided `where` argument, update it with this data.
     */
    update: XOR<WorkoutSessionUpdateInput, WorkoutSessionUncheckedUpdateInput>
  }

  /**
   * WorkoutSession delete
   */
  export type WorkoutSessionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutSession
     */
    select?: WorkoutSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutSessionInclude<ExtArgs> | null
    /**
     * Filter which WorkoutSession to delete.
     */
    where: WorkoutSessionWhereUniqueInput
  }

  /**
   * WorkoutSession deleteMany
   */
  export type WorkoutSessionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WorkoutSessions to delete
     */
    where?: WorkoutSessionWhereInput
  }

  /**
   * WorkoutSession.records
   */
  export type WorkoutSession$recordsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutRecord
     */
    select?: WorkoutRecordSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutRecordInclude<ExtArgs> | null
    where?: WorkoutRecordWhereInput
    orderBy?: WorkoutRecordOrderByWithRelationInput | WorkoutRecordOrderByWithRelationInput[]
    cursor?: WorkoutRecordWhereUniqueInput
    take?: number
    skip?: number
    distinct?: WorkoutRecordScalarFieldEnum | WorkoutRecordScalarFieldEnum[]
  }

  /**
   * WorkoutSession.exercises
   */
  export type WorkoutSession$exercisesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutExercise
     */
    select?: WorkoutExerciseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutExerciseInclude<ExtArgs> | null
    where?: WorkoutExerciseWhereInput
    orderBy?: WorkoutExerciseOrderByWithRelationInput | WorkoutExerciseOrderByWithRelationInput[]
    cursor?: WorkoutExerciseWhereUniqueInput
    take?: number
    skip?: number
    distinct?: WorkoutExerciseScalarFieldEnum | WorkoutExerciseScalarFieldEnum[]
  }

  /**
   * WorkoutSession without action
   */
  export type WorkoutSessionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutSession
     */
    select?: WorkoutSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutSessionInclude<ExtArgs> | null
  }


  /**
   * Model UserSummary
   */

  export type AggregateUserSummary = {
    _count: UserSummaryCountAggregateOutputType | null
    _avg: UserSummaryAvgAggregateOutputType | null
    _sum: UserSummarySumAggregateOutputType | null
    _min: UserSummaryMinAggregateOutputType | null
    _max: UserSummaryMaxAggregateOutputType | null
  }

  export type UserSummaryAvgAggregateOutputType = {
    totalWorkouts: number | null
    completedWorkouts: number | null
    totalVolume: number | null
    averageSessionDuration: number | null
    averageFatigueLevel: number | null
    fatigueAssessmentCount: number | null
    personalRecordsSet: number | null
    weeklyGoalCompletion: number | null
    consistencyScore: number | null
    dataVersion: number | null
  }

  export type UserSummarySumAggregateOutputType = {
    totalWorkouts: number | null
    completedWorkouts: number | null
    totalVolume: number | null
    averageSessionDuration: number | null
    averageFatigueLevel: number | null
    fatigueAssessmentCount: number | null
    personalRecordsSet: number | null
    weeklyGoalCompletion: number | null
    consistencyScore: number | null
    dataVersion: number | null
  }

  export type UserSummaryMinAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    updatedAt: Date | null
    userId: string | null
    weekStart: Date | null
    weekEnd: Date | null
    totalWorkouts: number | null
    completedWorkouts: number | null
    totalVolume: number | null
    averageSessionDuration: number | null
    averageFatigueLevel: number | null
    fatigueAssessmentCount: number | null
    personalRecordsSet: number | null
    weeklyGoalCompletion: number | null
    consistencyScore: number | null
    lastUpdated: Date | null
    dataVersion: number | null
  }

  export type UserSummaryMaxAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    updatedAt: Date | null
    userId: string | null
    weekStart: Date | null
    weekEnd: Date | null
    totalWorkouts: number | null
    completedWorkouts: number | null
    totalVolume: number | null
    averageSessionDuration: number | null
    averageFatigueLevel: number | null
    fatigueAssessmentCount: number | null
    personalRecordsSet: number | null
    weeklyGoalCompletion: number | null
    consistencyScore: number | null
    lastUpdated: Date | null
    dataVersion: number | null
  }

  export type UserSummaryCountAggregateOutputType = {
    id: number
    createdAt: number
    updatedAt: number
    userId: number
    weekStart: number
    weekEnd: number
    totalWorkouts: number
    completedWorkouts: number
    totalVolume: number
    averageSessionDuration: number
    averageFatigueLevel: number
    fatigueAssessmentCount: number
    personalRecordsSet: number
    newPersonalRecords: number
    weeklyGoalCompletion: number
    consistencyScore: number
    lastUpdated: number
    dataVersion: number
    _all: number
  }


  export type UserSummaryAvgAggregateInputType = {
    totalWorkouts?: true
    completedWorkouts?: true
    totalVolume?: true
    averageSessionDuration?: true
    averageFatigueLevel?: true
    fatigueAssessmentCount?: true
    personalRecordsSet?: true
    weeklyGoalCompletion?: true
    consistencyScore?: true
    dataVersion?: true
  }

  export type UserSummarySumAggregateInputType = {
    totalWorkouts?: true
    completedWorkouts?: true
    totalVolume?: true
    averageSessionDuration?: true
    averageFatigueLevel?: true
    fatigueAssessmentCount?: true
    personalRecordsSet?: true
    weeklyGoalCompletion?: true
    consistencyScore?: true
    dataVersion?: true
  }

  export type UserSummaryMinAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
    weekStart?: true
    weekEnd?: true
    totalWorkouts?: true
    completedWorkouts?: true
    totalVolume?: true
    averageSessionDuration?: true
    averageFatigueLevel?: true
    fatigueAssessmentCount?: true
    personalRecordsSet?: true
    weeklyGoalCompletion?: true
    consistencyScore?: true
    lastUpdated?: true
    dataVersion?: true
  }

  export type UserSummaryMaxAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
    weekStart?: true
    weekEnd?: true
    totalWorkouts?: true
    completedWorkouts?: true
    totalVolume?: true
    averageSessionDuration?: true
    averageFatigueLevel?: true
    fatigueAssessmentCount?: true
    personalRecordsSet?: true
    weeklyGoalCompletion?: true
    consistencyScore?: true
    lastUpdated?: true
    dataVersion?: true
  }

  export type UserSummaryCountAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
    weekStart?: true
    weekEnd?: true
    totalWorkouts?: true
    completedWorkouts?: true
    totalVolume?: true
    averageSessionDuration?: true
    averageFatigueLevel?: true
    fatigueAssessmentCount?: true
    personalRecordsSet?: true
    newPersonalRecords?: true
    weeklyGoalCompletion?: true
    consistencyScore?: true
    lastUpdated?: true
    dataVersion?: true
    _all?: true
  }

  export type UserSummaryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserSummary to aggregate.
     */
    where?: UserSummaryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserSummaries to fetch.
     */
    orderBy?: UserSummaryOrderByWithRelationInput | UserSummaryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserSummaryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserSummaries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserSummaries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserSummaries
    **/
    _count?: true | UserSummaryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserSummaryAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserSummarySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserSummaryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserSummaryMaxAggregateInputType
  }

  export type GetUserSummaryAggregateType<T extends UserSummaryAggregateArgs> = {
        [P in keyof T & keyof AggregateUserSummary]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserSummary[P]>
      : GetScalarType<T[P], AggregateUserSummary[P]>
  }




  export type UserSummaryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserSummaryWhereInput
    orderBy?: UserSummaryOrderByWithAggregationInput | UserSummaryOrderByWithAggregationInput[]
    by: UserSummaryScalarFieldEnum[] | UserSummaryScalarFieldEnum
    having?: UserSummaryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserSummaryCountAggregateInputType | true
    _avg?: UserSummaryAvgAggregateInputType
    _sum?: UserSummarySumAggregateInputType
    _min?: UserSummaryMinAggregateInputType
    _max?: UserSummaryMaxAggregateInputType
  }

  export type UserSummaryGroupByOutputType = {
    id: string
    createdAt: Date
    updatedAt: Date
    userId: string
    weekStart: Date
    weekEnd: Date
    totalWorkouts: number
    completedWorkouts: number
    totalVolume: number
    averageSessionDuration: number
    averageFatigueLevel: number
    fatigueAssessmentCount: number
    personalRecordsSet: number
    newPersonalRecords: string[]
    weeklyGoalCompletion: number
    consistencyScore: number
    lastUpdated: Date
    dataVersion: number
    _count: UserSummaryCountAggregateOutputType | null
    _avg: UserSummaryAvgAggregateOutputType | null
    _sum: UserSummarySumAggregateOutputType | null
    _min: UserSummaryMinAggregateOutputType | null
    _max: UserSummaryMaxAggregateOutputType | null
  }

  type GetUserSummaryGroupByPayload<T extends UserSummaryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserSummaryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserSummaryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserSummaryGroupByOutputType[P]>
            : GetScalarType<T[P], UserSummaryGroupByOutputType[P]>
        }
      >
    >


  export type UserSummarySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    weekStart?: boolean
    weekEnd?: boolean
    totalWorkouts?: boolean
    completedWorkouts?: boolean
    totalVolume?: boolean
    averageSessionDuration?: boolean
    averageFatigueLevel?: boolean
    fatigueAssessmentCount?: boolean
    personalRecordsSet?: boolean
    newPersonalRecords?: boolean
    weeklyGoalCompletion?: boolean
    consistencyScore?: boolean
    lastUpdated?: boolean
    dataVersion?: boolean
  }, ExtArgs["result"]["userSummary"]>

  export type UserSummarySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    weekStart?: boolean
    weekEnd?: boolean
    totalWorkouts?: boolean
    completedWorkouts?: boolean
    totalVolume?: boolean
    averageSessionDuration?: boolean
    averageFatigueLevel?: boolean
    fatigueAssessmentCount?: boolean
    personalRecordsSet?: boolean
    newPersonalRecords?: boolean
    weeklyGoalCompletion?: boolean
    consistencyScore?: boolean
    lastUpdated?: boolean
    dataVersion?: boolean
  }, ExtArgs["result"]["userSummary"]>

  export type UserSummarySelectScalar = {
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    weekStart?: boolean
    weekEnd?: boolean
    totalWorkouts?: boolean
    completedWorkouts?: boolean
    totalVolume?: boolean
    averageSessionDuration?: boolean
    averageFatigueLevel?: boolean
    fatigueAssessmentCount?: boolean
    personalRecordsSet?: boolean
    newPersonalRecords?: boolean
    weeklyGoalCompletion?: boolean
    consistencyScore?: boolean
    lastUpdated?: boolean
    dataVersion?: boolean
  }


  export type $UserSummaryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserSummary"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      createdAt: Date
      updatedAt: Date
      userId: string
      weekStart: Date
      weekEnd: Date
      totalWorkouts: number
      completedWorkouts: number
      totalVolume: number
      averageSessionDuration: number
      averageFatigueLevel: number
      fatigueAssessmentCount: number
      personalRecordsSet: number
      newPersonalRecords: string[]
      weeklyGoalCompletion: number
      consistencyScore: number
      lastUpdated: Date
      dataVersion: number
    }, ExtArgs["result"]["userSummary"]>
    composites: {}
  }

  type UserSummaryGetPayload<S extends boolean | null | undefined | UserSummaryDefaultArgs> = $Result.GetResult<Prisma.$UserSummaryPayload, S>

  type UserSummaryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<UserSummaryFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: UserSummaryCountAggregateInputType | true
    }

  export interface UserSummaryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserSummary'], meta: { name: 'UserSummary' } }
    /**
     * Find zero or one UserSummary that matches the filter.
     * @param {UserSummaryFindUniqueArgs} args - Arguments to find a UserSummary
     * @example
     * // Get one UserSummary
     * const userSummary = await prisma.userSummary.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserSummaryFindUniqueArgs>(args: SelectSubset<T, UserSummaryFindUniqueArgs<ExtArgs>>): Prisma__UserSummaryClient<$Result.GetResult<Prisma.$UserSummaryPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one UserSummary that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {UserSummaryFindUniqueOrThrowArgs} args - Arguments to find a UserSummary
     * @example
     * // Get one UserSummary
     * const userSummary = await prisma.userSummary.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserSummaryFindUniqueOrThrowArgs>(args: SelectSubset<T, UserSummaryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserSummaryClient<$Result.GetResult<Prisma.$UserSummaryPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first UserSummary that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserSummaryFindFirstArgs} args - Arguments to find a UserSummary
     * @example
     * // Get one UserSummary
     * const userSummary = await prisma.userSummary.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserSummaryFindFirstArgs>(args?: SelectSubset<T, UserSummaryFindFirstArgs<ExtArgs>>): Prisma__UserSummaryClient<$Result.GetResult<Prisma.$UserSummaryPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first UserSummary that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserSummaryFindFirstOrThrowArgs} args - Arguments to find a UserSummary
     * @example
     * // Get one UserSummary
     * const userSummary = await prisma.userSummary.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserSummaryFindFirstOrThrowArgs>(args?: SelectSubset<T, UserSummaryFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserSummaryClient<$Result.GetResult<Prisma.$UserSummaryPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more UserSummaries that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserSummaryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserSummaries
     * const userSummaries = await prisma.userSummary.findMany()
     * 
     * // Get first 10 UserSummaries
     * const userSummaries = await prisma.userSummary.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userSummaryWithIdOnly = await prisma.userSummary.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserSummaryFindManyArgs>(args?: SelectSubset<T, UserSummaryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserSummaryPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a UserSummary.
     * @param {UserSummaryCreateArgs} args - Arguments to create a UserSummary.
     * @example
     * // Create one UserSummary
     * const UserSummary = await prisma.userSummary.create({
     *   data: {
     *     // ... data to create a UserSummary
     *   }
     * })
     * 
     */
    create<T extends UserSummaryCreateArgs>(args: SelectSubset<T, UserSummaryCreateArgs<ExtArgs>>): Prisma__UserSummaryClient<$Result.GetResult<Prisma.$UserSummaryPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many UserSummaries.
     * @param {UserSummaryCreateManyArgs} args - Arguments to create many UserSummaries.
     * @example
     * // Create many UserSummaries
     * const userSummary = await prisma.userSummary.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserSummaryCreateManyArgs>(args?: SelectSubset<T, UserSummaryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many UserSummaries and returns the data saved in the database.
     * @param {UserSummaryCreateManyAndReturnArgs} args - Arguments to create many UserSummaries.
     * @example
     * // Create many UserSummaries
     * const userSummary = await prisma.userSummary.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many UserSummaries and only return the `id`
     * const userSummaryWithIdOnly = await prisma.userSummary.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserSummaryCreateManyAndReturnArgs>(args?: SelectSubset<T, UserSummaryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserSummaryPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a UserSummary.
     * @param {UserSummaryDeleteArgs} args - Arguments to delete one UserSummary.
     * @example
     * // Delete one UserSummary
     * const UserSummary = await prisma.userSummary.delete({
     *   where: {
     *     // ... filter to delete one UserSummary
     *   }
     * })
     * 
     */
    delete<T extends UserSummaryDeleteArgs>(args: SelectSubset<T, UserSummaryDeleteArgs<ExtArgs>>): Prisma__UserSummaryClient<$Result.GetResult<Prisma.$UserSummaryPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one UserSummary.
     * @param {UserSummaryUpdateArgs} args - Arguments to update one UserSummary.
     * @example
     * // Update one UserSummary
     * const userSummary = await prisma.userSummary.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserSummaryUpdateArgs>(args: SelectSubset<T, UserSummaryUpdateArgs<ExtArgs>>): Prisma__UserSummaryClient<$Result.GetResult<Prisma.$UserSummaryPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more UserSummaries.
     * @param {UserSummaryDeleteManyArgs} args - Arguments to filter UserSummaries to delete.
     * @example
     * // Delete a few UserSummaries
     * const { count } = await prisma.userSummary.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserSummaryDeleteManyArgs>(args?: SelectSubset<T, UserSummaryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserSummaries.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserSummaryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserSummaries
     * const userSummary = await prisma.userSummary.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserSummaryUpdateManyArgs>(args: SelectSubset<T, UserSummaryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one UserSummary.
     * @param {UserSummaryUpsertArgs} args - Arguments to update or create a UserSummary.
     * @example
     * // Update or create a UserSummary
     * const userSummary = await prisma.userSummary.upsert({
     *   create: {
     *     // ... data to create a UserSummary
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserSummary we want to update
     *   }
     * })
     */
    upsert<T extends UserSummaryUpsertArgs>(args: SelectSubset<T, UserSummaryUpsertArgs<ExtArgs>>): Prisma__UserSummaryClient<$Result.GetResult<Prisma.$UserSummaryPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of UserSummaries.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserSummaryCountArgs} args - Arguments to filter UserSummaries to count.
     * @example
     * // Count the number of UserSummaries
     * const count = await prisma.userSummary.count({
     *   where: {
     *     // ... the filter for the UserSummaries we want to count
     *   }
     * })
    **/
    count<T extends UserSummaryCountArgs>(
      args?: Subset<T, UserSummaryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserSummaryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserSummary.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserSummaryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends UserSummaryAggregateArgs>(args: Subset<T, UserSummaryAggregateArgs>): Prisma.PrismaPromise<GetUserSummaryAggregateType<T>>

    /**
     * Group by UserSummary.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserSummaryGroupByArgs} args - Group by arguments.
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
      T extends UserSummaryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserSummaryGroupByArgs['orderBy'] }
        : { orderBy?: UserSummaryGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, UserSummaryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserSummaryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserSummary model
   */
  readonly fields: UserSummaryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserSummary.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserSummaryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the UserSummary model
   */ 
  interface UserSummaryFieldRefs {
    readonly id: FieldRef<"UserSummary", 'String'>
    readonly createdAt: FieldRef<"UserSummary", 'DateTime'>
    readonly updatedAt: FieldRef<"UserSummary", 'DateTime'>
    readonly userId: FieldRef<"UserSummary", 'String'>
    readonly weekStart: FieldRef<"UserSummary", 'DateTime'>
    readonly weekEnd: FieldRef<"UserSummary", 'DateTime'>
    readonly totalWorkouts: FieldRef<"UserSummary", 'Int'>
    readonly completedWorkouts: FieldRef<"UserSummary", 'Int'>
    readonly totalVolume: FieldRef<"UserSummary", 'Float'>
    readonly averageSessionDuration: FieldRef<"UserSummary", 'Int'>
    readonly averageFatigueLevel: FieldRef<"UserSummary", 'Float'>
    readonly fatigueAssessmentCount: FieldRef<"UserSummary", 'Int'>
    readonly personalRecordsSet: FieldRef<"UserSummary", 'Int'>
    readonly newPersonalRecords: FieldRef<"UserSummary", 'String[]'>
    readonly weeklyGoalCompletion: FieldRef<"UserSummary", 'Int'>
    readonly consistencyScore: FieldRef<"UserSummary", 'Int'>
    readonly lastUpdated: FieldRef<"UserSummary", 'DateTime'>
    readonly dataVersion: FieldRef<"UserSummary", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * UserSummary findUnique
   */
  export type UserSummaryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSummary
     */
    select?: UserSummarySelect<ExtArgs> | null
    /**
     * Filter, which UserSummary to fetch.
     */
    where: UserSummaryWhereUniqueInput
  }

  /**
   * UserSummary findUniqueOrThrow
   */
  export type UserSummaryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSummary
     */
    select?: UserSummarySelect<ExtArgs> | null
    /**
     * Filter, which UserSummary to fetch.
     */
    where: UserSummaryWhereUniqueInput
  }

  /**
   * UserSummary findFirst
   */
  export type UserSummaryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSummary
     */
    select?: UserSummarySelect<ExtArgs> | null
    /**
     * Filter, which UserSummary to fetch.
     */
    where?: UserSummaryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserSummaries to fetch.
     */
    orderBy?: UserSummaryOrderByWithRelationInput | UserSummaryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserSummaries.
     */
    cursor?: UserSummaryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserSummaries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserSummaries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserSummaries.
     */
    distinct?: UserSummaryScalarFieldEnum | UserSummaryScalarFieldEnum[]
  }

  /**
   * UserSummary findFirstOrThrow
   */
  export type UserSummaryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSummary
     */
    select?: UserSummarySelect<ExtArgs> | null
    /**
     * Filter, which UserSummary to fetch.
     */
    where?: UserSummaryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserSummaries to fetch.
     */
    orderBy?: UserSummaryOrderByWithRelationInput | UserSummaryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserSummaries.
     */
    cursor?: UserSummaryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserSummaries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserSummaries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserSummaries.
     */
    distinct?: UserSummaryScalarFieldEnum | UserSummaryScalarFieldEnum[]
  }

  /**
   * UserSummary findMany
   */
  export type UserSummaryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSummary
     */
    select?: UserSummarySelect<ExtArgs> | null
    /**
     * Filter, which UserSummaries to fetch.
     */
    where?: UserSummaryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserSummaries to fetch.
     */
    orderBy?: UserSummaryOrderByWithRelationInput | UserSummaryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserSummaries.
     */
    cursor?: UserSummaryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserSummaries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserSummaries.
     */
    skip?: number
    distinct?: UserSummaryScalarFieldEnum | UserSummaryScalarFieldEnum[]
  }

  /**
   * UserSummary create
   */
  export type UserSummaryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSummary
     */
    select?: UserSummarySelect<ExtArgs> | null
    /**
     * The data needed to create a UserSummary.
     */
    data: XOR<UserSummaryCreateInput, UserSummaryUncheckedCreateInput>
  }

  /**
   * UserSummary createMany
   */
  export type UserSummaryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserSummaries.
     */
    data: UserSummaryCreateManyInput | UserSummaryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserSummary createManyAndReturn
   */
  export type UserSummaryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSummary
     */
    select?: UserSummarySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many UserSummaries.
     */
    data: UserSummaryCreateManyInput | UserSummaryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserSummary update
   */
  export type UserSummaryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSummary
     */
    select?: UserSummarySelect<ExtArgs> | null
    /**
     * The data needed to update a UserSummary.
     */
    data: XOR<UserSummaryUpdateInput, UserSummaryUncheckedUpdateInput>
    /**
     * Choose, which UserSummary to update.
     */
    where: UserSummaryWhereUniqueInput
  }

  /**
   * UserSummary updateMany
   */
  export type UserSummaryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserSummaries.
     */
    data: XOR<UserSummaryUpdateManyMutationInput, UserSummaryUncheckedUpdateManyInput>
    /**
     * Filter which UserSummaries to update
     */
    where?: UserSummaryWhereInput
  }

  /**
   * UserSummary upsert
   */
  export type UserSummaryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSummary
     */
    select?: UserSummarySelect<ExtArgs> | null
    /**
     * The filter to search for the UserSummary to update in case it exists.
     */
    where: UserSummaryWhereUniqueInput
    /**
     * In case the UserSummary found by the `where` argument doesn't exist, create a new UserSummary with this data.
     */
    create: XOR<UserSummaryCreateInput, UserSummaryUncheckedCreateInput>
    /**
     * In case the UserSummary was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserSummaryUpdateInput, UserSummaryUncheckedUpdateInput>
  }

  /**
   * UserSummary delete
   */
  export type UserSummaryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSummary
     */
    select?: UserSummarySelect<ExtArgs> | null
    /**
     * Filter which UserSummary to delete.
     */
    where: UserSummaryWhereUniqueInput
  }

  /**
   * UserSummary deleteMany
   */
  export type UserSummaryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserSummaries to delete
     */
    where?: UserSummaryWhereInput
  }

  /**
   * UserSummary without action
   */
  export type UserSummaryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserSummary
     */
    select?: UserSummarySelect<ExtArgs> | null
  }


  /**
   * Model WorkoutExercise
   */

  export type AggregateWorkoutExercise = {
    _count: WorkoutExerciseCountAggregateOutputType | null
    _avg: WorkoutExerciseAvgAggregateOutputType | null
    _sum: WorkoutExerciseSumAggregateOutputType | null
    _min: WorkoutExerciseMinAggregateOutputType | null
    _max: WorkoutExerciseMaxAggregateOutputType | null
  }

  export type WorkoutExerciseAvgAggregateOutputType = {
    order: number | null
    targetSets: number | null
    targetReps: number | null
    targetWeight: number | null
    targetDuration: number | null
    targetRest: number | null
    actualSets: number | null
    actualReps: number | null
    actualWeight: number | null
    actualDuration: number | null
    actualRest: number | null
    totalVolume: number | null
    averageRPE: number | null
    maxRPE: number | null
    minRPE: number | null
  }

  export type WorkoutExerciseSumAggregateOutputType = {
    order: number | null
    targetSets: number | null
    targetReps: number | null
    targetWeight: number | null
    targetDuration: number | null
    targetRest: number | null
    actualSets: number | null
    actualReps: number | null
    actualWeight: number | null
    actualDuration: number | null
    actualRest: number | null
    totalVolume: number | null
    averageRPE: number | null
    maxRPE: number | null
    minRPE: number | null
  }

  export type WorkoutExerciseMinAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    updatedAt: Date | null
    sessionId: string | null
    exerciseId: string | null
    exerciseName: string | null
    category: string | null
    order: number | null
    targetSets: number | null
    targetReps: number | null
    targetWeight: number | null
    targetDuration: number | null
    targetRest: number | null
    actualSets: number | null
    actualReps: number | null
    actualWeight: number | null
    actualDuration: number | null
    actualRest: number | null
    totalVolume: number | null
    averageRPE: number | null
    maxRPE: number | null
    minRPE: number | null
    isCompleted: boolean | null
    completedAt: Date | null
    notes: string | null
  }

  export type WorkoutExerciseMaxAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    updatedAt: Date | null
    sessionId: string | null
    exerciseId: string | null
    exerciseName: string | null
    category: string | null
    order: number | null
    targetSets: number | null
    targetReps: number | null
    targetWeight: number | null
    targetDuration: number | null
    targetRest: number | null
    actualSets: number | null
    actualReps: number | null
    actualWeight: number | null
    actualDuration: number | null
    actualRest: number | null
    totalVolume: number | null
    averageRPE: number | null
    maxRPE: number | null
    minRPE: number | null
    isCompleted: boolean | null
    completedAt: Date | null
    notes: string | null
  }

  export type WorkoutExerciseCountAggregateOutputType = {
    id: number
    createdAt: number
    updatedAt: number
    sessionId: number
    exerciseId: number
    exerciseName: number
    category: number
    order: number
    targetSets: number
    targetReps: number
    targetWeight: number
    targetDuration: number
    targetRest: number
    actualSets: number
    actualReps: number
    actualWeight: number
    actualDuration: number
    actualRest: number
    totalVolume: number
    averageRPE: number
    maxRPE: number
    minRPE: number
    isCompleted: number
    completedAt: number
    notes: number
    _all: number
  }


  export type WorkoutExerciseAvgAggregateInputType = {
    order?: true
    targetSets?: true
    targetReps?: true
    targetWeight?: true
    targetDuration?: true
    targetRest?: true
    actualSets?: true
    actualReps?: true
    actualWeight?: true
    actualDuration?: true
    actualRest?: true
    totalVolume?: true
    averageRPE?: true
    maxRPE?: true
    minRPE?: true
  }

  export type WorkoutExerciseSumAggregateInputType = {
    order?: true
    targetSets?: true
    targetReps?: true
    targetWeight?: true
    targetDuration?: true
    targetRest?: true
    actualSets?: true
    actualReps?: true
    actualWeight?: true
    actualDuration?: true
    actualRest?: true
    totalVolume?: true
    averageRPE?: true
    maxRPE?: true
    minRPE?: true
  }

  export type WorkoutExerciseMinAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    sessionId?: true
    exerciseId?: true
    exerciseName?: true
    category?: true
    order?: true
    targetSets?: true
    targetReps?: true
    targetWeight?: true
    targetDuration?: true
    targetRest?: true
    actualSets?: true
    actualReps?: true
    actualWeight?: true
    actualDuration?: true
    actualRest?: true
    totalVolume?: true
    averageRPE?: true
    maxRPE?: true
    minRPE?: true
    isCompleted?: true
    completedAt?: true
    notes?: true
  }

  export type WorkoutExerciseMaxAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    sessionId?: true
    exerciseId?: true
    exerciseName?: true
    category?: true
    order?: true
    targetSets?: true
    targetReps?: true
    targetWeight?: true
    targetDuration?: true
    targetRest?: true
    actualSets?: true
    actualReps?: true
    actualWeight?: true
    actualDuration?: true
    actualRest?: true
    totalVolume?: true
    averageRPE?: true
    maxRPE?: true
    minRPE?: true
    isCompleted?: true
    completedAt?: true
    notes?: true
  }

  export type WorkoutExerciseCountAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    sessionId?: true
    exerciseId?: true
    exerciseName?: true
    category?: true
    order?: true
    targetSets?: true
    targetReps?: true
    targetWeight?: true
    targetDuration?: true
    targetRest?: true
    actualSets?: true
    actualReps?: true
    actualWeight?: true
    actualDuration?: true
    actualRest?: true
    totalVolume?: true
    averageRPE?: true
    maxRPE?: true
    minRPE?: true
    isCompleted?: true
    completedAt?: true
    notes?: true
    _all?: true
  }

  export type WorkoutExerciseAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WorkoutExercise to aggregate.
     */
    where?: WorkoutExerciseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WorkoutExercises to fetch.
     */
    orderBy?: WorkoutExerciseOrderByWithRelationInput | WorkoutExerciseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: WorkoutExerciseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WorkoutExercises from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WorkoutExercises.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned WorkoutExercises
    **/
    _count?: true | WorkoutExerciseCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: WorkoutExerciseAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: WorkoutExerciseSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: WorkoutExerciseMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: WorkoutExerciseMaxAggregateInputType
  }

  export type GetWorkoutExerciseAggregateType<T extends WorkoutExerciseAggregateArgs> = {
        [P in keyof T & keyof AggregateWorkoutExercise]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateWorkoutExercise[P]>
      : GetScalarType<T[P], AggregateWorkoutExercise[P]>
  }




  export type WorkoutExerciseGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WorkoutExerciseWhereInput
    orderBy?: WorkoutExerciseOrderByWithAggregationInput | WorkoutExerciseOrderByWithAggregationInput[]
    by: WorkoutExerciseScalarFieldEnum[] | WorkoutExerciseScalarFieldEnum
    having?: WorkoutExerciseScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: WorkoutExerciseCountAggregateInputType | true
    _avg?: WorkoutExerciseAvgAggregateInputType
    _sum?: WorkoutExerciseSumAggregateInputType
    _min?: WorkoutExerciseMinAggregateInputType
    _max?: WorkoutExerciseMaxAggregateInputType
  }

  export type WorkoutExerciseGroupByOutputType = {
    id: string
    createdAt: Date
    updatedAt: Date
    sessionId: string
    exerciseId: string | null
    exerciseName: string
    category: string
    order: number
    targetSets: number
    targetReps: number
    targetWeight: number | null
    targetDuration: number | null
    targetRest: number | null
    actualSets: number
    actualReps: number
    actualWeight: number | null
    actualDuration: number | null
    actualRest: number | null
    totalVolume: number | null
    averageRPE: number | null
    maxRPE: number | null
    minRPE: number | null
    isCompleted: boolean
    completedAt: Date | null
    notes: string | null
    _count: WorkoutExerciseCountAggregateOutputType | null
    _avg: WorkoutExerciseAvgAggregateOutputType | null
    _sum: WorkoutExerciseSumAggregateOutputType | null
    _min: WorkoutExerciseMinAggregateOutputType | null
    _max: WorkoutExerciseMaxAggregateOutputType | null
  }

  type GetWorkoutExerciseGroupByPayload<T extends WorkoutExerciseGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<WorkoutExerciseGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof WorkoutExerciseGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], WorkoutExerciseGroupByOutputType[P]>
            : GetScalarType<T[P], WorkoutExerciseGroupByOutputType[P]>
        }
      >
    >


  export type WorkoutExerciseSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    sessionId?: boolean
    exerciseId?: boolean
    exerciseName?: boolean
    category?: boolean
    order?: boolean
    targetSets?: boolean
    targetReps?: boolean
    targetWeight?: boolean
    targetDuration?: boolean
    targetRest?: boolean
    actualSets?: boolean
    actualReps?: boolean
    actualWeight?: boolean
    actualDuration?: boolean
    actualRest?: boolean
    totalVolume?: boolean
    averageRPE?: boolean
    maxRPE?: boolean
    minRPE?: boolean
    isCompleted?: boolean
    completedAt?: boolean
    notes?: boolean
    session?: boolean | WorkoutSessionDefaultArgs<ExtArgs>
    records?: boolean | WorkoutExercise$recordsArgs<ExtArgs>
    _count?: boolean | WorkoutExerciseCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["workoutExercise"]>

  export type WorkoutExerciseSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    sessionId?: boolean
    exerciseId?: boolean
    exerciseName?: boolean
    category?: boolean
    order?: boolean
    targetSets?: boolean
    targetReps?: boolean
    targetWeight?: boolean
    targetDuration?: boolean
    targetRest?: boolean
    actualSets?: boolean
    actualReps?: boolean
    actualWeight?: boolean
    actualDuration?: boolean
    actualRest?: boolean
    totalVolume?: boolean
    averageRPE?: boolean
    maxRPE?: boolean
    minRPE?: boolean
    isCompleted?: boolean
    completedAt?: boolean
    notes?: boolean
    session?: boolean | WorkoutSessionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["workoutExercise"]>

  export type WorkoutExerciseSelectScalar = {
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    sessionId?: boolean
    exerciseId?: boolean
    exerciseName?: boolean
    category?: boolean
    order?: boolean
    targetSets?: boolean
    targetReps?: boolean
    targetWeight?: boolean
    targetDuration?: boolean
    targetRest?: boolean
    actualSets?: boolean
    actualReps?: boolean
    actualWeight?: boolean
    actualDuration?: boolean
    actualRest?: boolean
    totalVolume?: boolean
    averageRPE?: boolean
    maxRPE?: boolean
    minRPE?: boolean
    isCompleted?: boolean
    completedAt?: boolean
    notes?: boolean
  }

  export type WorkoutExerciseInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    session?: boolean | WorkoutSessionDefaultArgs<ExtArgs>
    records?: boolean | WorkoutExercise$recordsArgs<ExtArgs>
    _count?: boolean | WorkoutExerciseCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type WorkoutExerciseIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    session?: boolean | WorkoutSessionDefaultArgs<ExtArgs>
  }

  export type $WorkoutExercisePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "WorkoutExercise"
    objects: {
      session: Prisma.$WorkoutSessionPayload<ExtArgs>
      records: Prisma.$WorkoutRecordPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      createdAt: Date
      updatedAt: Date
      sessionId: string
      exerciseId: string | null
      exerciseName: string
      category: string
      order: number
      targetSets: number
      targetReps: number
      targetWeight: number | null
      targetDuration: number | null
      targetRest: number | null
      actualSets: number
      actualReps: number
      actualWeight: number | null
      actualDuration: number | null
      actualRest: number | null
      totalVolume: number | null
      averageRPE: number | null
      maxRPE: number | null
      minRPE: number | null
      isCompleted: boolean
      completedAt: Date | null
      notes: string | null
    }, ExtArgs["result"]["workoutExercise"]>
    composites: {}
  }

  type WorkoutExerciseGetPayload<S extends boolean | null | undefined | WorkoutExerciseDefaultArgs> = $Result.GetResult<Prisma.$WorkoutExercisePayload, S>

  type WorkoutExerciseCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<WorkoutExerciseFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: WorkoutExerciseCountAggregateInputType | true
    }

  export interface WorkoutExerciseDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['WorkoutExercise'], meta: { name: 'WorkoutExercise' } }
    /**
     * Find zero or one WorkoutExercise that matches the filter.
     * @param {WorkoutExerciseFindUniqueArgs} args - Arguments to find a WorkoutExercise
     * @example
     * // Get one WorkoutExercise
     * const workoutExercise = await prisma.workoutExercise.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends WorkoutExerciseFindUniqueArgs>(args: SelectSubset<T, WorkoutExerciseFindUniqueArgs<ExtArgs>>): Prisma__WorkoutExerciseClient<$Result.GetResult<Prisma.$WorkoutExercisePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one WorkoutExercise that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {WorkoutExerciseFindUniqueOrThrowArgs} args - Arguments to find a WorkoutExercise
     * @example
     * // Get one WorkoutExercise
     * const workoutExercise = await prisma.workoutExercise.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends WorkoutExerciseFindUniqueOrThrowArgs>(args: SelectSubset<T, WorkoutExerciseFindUniqueOrThrowArgs<ExtArgs>>): Prisma__WorkoutExerciseClient<$Result.GetResult<Prisma.$WorkoutExercisePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first WorkoutExercise that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkoutExerciseFindFirstArgs} args - Arguments to find a WorkoutExercise
     * @example
     * // Get one WorkoutExercise
     * const workoutExercise = await prisma.workoutExercise.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends WorkoutExerciseFindFirstArgs>(args?: SelectSubset<T, WorkoutExerciseFindFirstArgs<ExtArgs>>): Prisma__WorkoutExerciseClient<$Result.GetResult<Prisma.$WorkoutExercisePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first WorkoutExercise that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkoutExerciseFindFirstOrThrowArgs} args - Arguments to find a WorkoutExercise
     * @example
     * // Get one WorkoutExercise
     * const workoutExercise = await prisma.workoutExercise.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends WorkoutExerciseFindFirstOrThrowArgs>(args?: SelectSubset<T, WorkoutExerciseFindFirstOrThrowArgs<ExtArgs>>): Prisma__WorkoutExerciseClient<$Result.GetResult<Prisma.$WorkoutExercisePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more WorkoutExercises that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkoutExerciseFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all WorkoutExercises
     * const workoutExercises = await prisma.workoutExercise.findMany()
     * 
     * // Get first 10 WorkoutExercises
     * const workoutExercises = await prisma.workoutExercise.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const workoutExerciseWithIdOnly = await prisma.workoutExercise.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends WorkoutExerciseFindManyArgs>(args?: SelectSubset<T, WorkoutExerciseFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WorkoutExercisePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a WorkoutExercise.
     * @param {WorkoutExerciseCreateArgs} args - Arguments to create a WorkoutExercise.
     * @example
     * // Create one WorkoutExercise
     * const WorkoutExercise = await prisma.workoutExercise.create({
     *   data: {
     *     // ... data to create a WorkoutExercise
     *   }
     * })
     * 
     */
    create<T extends WorkoutExerciseCreateArgs>(args: SelectSubset<T, WorkoutExerciseCreateArgs<ExtArgs>>): Prisma__WorkoutExerciseClient<$Result.GetResult<Prisma.$WorkoutExercisePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many WorkoutExercises.
     * @param {WorkoutExerciseCreateManyArgs} args - Arguments to create many WorkoutExercises.
     * @example
     * // Create many WorkoutExercises
     * const workoutExercise = await prisma.workoutExercise.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends WorkoutExerciseCreateManyArgs>(args?: SelectSubset<T, WorkoutExerciseCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many WorkoutExercises and returns the data saved in the database.
     * @param {WorkoutExerciseCreateManyAndReturnArgs} args - Arguments to create many WorkoutExercises.
     * @example
     * // Create many WorkoutExercises
     * const workoutExercise = await prisma.workoutExercise.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many WorkoutExercises and only return the `id`
     * const workoutExerciseWithIdOnly = await prisma.workoutExercise.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends WorkoutExerciseCreateManyAndReturnArgs>(args?: SelectSubset<T, WorkoutExerciseCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WorkoutExercisePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a WorkoutExercise.
     * @param {WorkoutExerciseDeleteArgs} args - Arguments to delete one WorkoutExercise.
     * @example
     * // Delete one WorkoutExercise
     * const WorkoutExercise = await prisma.workoutExercise.delete({
     *   where: {
     *     // ... filter to delete one WorkoutExercise
     *   }
     * })
     * 
     */
    delete<T extends WorkoutExerciseDeleteArgs>(args: SelectSubset<T, WorkoutExerciseDeleteArgs<ExtArgs>>): Prisma__WorkoutExerciseClient<$Result.GetResult<Prisma.$WorkoutExercisePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one WorkoutExercise.
     * @param {WorkoutExerciseUpdateArgs} args - Arguments to update one WorkoutExercise.
     * @example
     * // Update one WorkoutExercise
     * const workoutExercise = await prisma.workoutExercise.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends WorkoutExerciseUpdateArgs>(args: SelectSubset<T, WorkoutExerciseUpdateArgs<ExtArgs>>): Prisma__WorkoutExerciseClient<$Result.GetResult<Prisma.$WorkoutExercisePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more WorkoutExercises.
     * @param {WorkoutExerciseDeleteManyArgs} args - Arguments to filter WorkoutExercises to delete.
     * @example
     * // Delete a few WorkoutExercises
     * const { count } = await prisma.workoutExercise.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends WorkoutExerciseDeleteManyArgs>(args?: SelectSubset<T, WorkoutExerciseDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WorkoutExercises.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkoutExerciseUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many WorkoutExercises
     * const workoutExercise = await prisma.workoutExercise.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends WorkoutExerciseUpdateManyArgs>(args: SelectSubset<T, WorkoutExerciseUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one WorkoutExercise.
     * @param {WorkoutExerciseUpsertArgs} args - Arguments to update or create a WorkoutExercise.
     * @example
     * // Update or create a WorkoutExercise
     * const workoutExercise = await prisma.workoutExercise.upsert({
     *   create: {
     *     // ... data to create a WorkoutExercise
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the WorkoutExercise we want to update
     *   }
     * })
     */
    upsert<T extends WorkoutExerciseUpsertArgs>(args: SelectSubset<T, WorkoutExerciseUpsertArgs<ExtArgs>>): Prisma__WorkoutExerciseClient<$Result.GetResult<Prisma.$WorkoutExercisePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of WorkoutExercises.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkoutExerciseCountArgs} args - Arguments to filter WorkoutExercises to count.
     * @example
     * // Count the number of WorkoutExercises
     * const count = await prisma.workoutExercise.count({
     *   where: {
     *     // ... the filter for the WorkoutExercises we want to count
     *   }
     * })
    **/
    count<T extends WorkoutExerciseCountArgs>(
      args?: Subset<T, WorkoutExerciseCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], WorkoutExerciseCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a WorkoutExercise.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkoutExerciseAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends WorkoutExerciseAggregateArgs>(args: Subset<T, WorkoutExerciseAggregateArgs>): Prisma.PrismaPromise<GetWorkoutExerciseAggregateType<T>>

    /**
     * Group by WorkoutExercise.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkoutExerciseGroupByArgs} args - Group by arguments.
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
      T extends WorkoutExerciseGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: WorkoutExerciseGroupByArgs['orderBy'] }
        : { orderBy?: WorkoutExerciseGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, WorkoutExerciseGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetWorkoutExerciseGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the WorkoutExercise model
   */
  readonly fields: WorkoutExerciseFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for WorkoutExercise.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__WorkoutExerciseClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    session<T extends WorkoutSessionDefaultArgs<ExtArgs> = {}>(args?: Subset<T, WorkoutSessionDefaultArgs<ExtArgs>>): Prisma__WorkoutSessionClient<$Result.GetResult<Prisma.$WorkoutSessionPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    records<T extends WorkoutExercise$recordsArgs<ExtArgs> = {}>(args?: Subset<T, WorkoutExercise$recordsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WorkoutRecordPayload<ExtArgs>, T, "findMany"> | Null>
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
   * Fields of the WorkoutExercise model
   */ 
  interface WorkoutExerciseFieldRefs {
    readonly id: FieldRef<"WorkoutExercise", 'String'>
    readonly createdAt: FieldRef<"WorkoutExercise", 'DateTime'>
    readonly updatedAt: FieldRef<"WorkoutExercise", 'DateTime'>
    readonly sessionId: FieldRef<"WorkoutExercise", 'String'>
    readonly exerciseId: FieldRef<"WorkoutExercise", 'String'>
    readonly exerciseName: FieldRef<"WorkoutExercise", 'String'>
    readonly category: FieldRef<"WorkoutExercise", 'String'>
    readonly order: FieldRef<"WorkoutExercise", 'Int'>
    readonly targetSets: FieldRef<"WorkoutExercise", 'Int'>
    readonly targetReps: FieldRef<"WorkoutExercise", 'Int'>
    readonly targetWeight: FieldRef<"WorkoutExercise", 'Float'>
    readonly targetDuration: FieldRef<"WorkoutExercise", 'Int'>
    readonly targetRest: FieldRef<"WorkoutExercise", 'Int'>
    readonly actualSets: FieldRef<"WorkoutExercise", 'Int'>
    readonly actualReps: FieldRef<"WorkoutExercise", 'Int'>
    readonly actualWeight: FieldRef<"WorkoutExercise", 'Float'>
    readonly actualDuration: FieldRef<"WorkoutExercise", 'Int'>
    readonly actualRest: FieldRef<"WorkoutExercise", 'Int'>
    readonly totalVolume: FieldRef<"WorkoutExercise", 'Float'>
    readonly averageRPE: FieldRef<"WorkoutExercise", 'Float'>
    readonly maxRPE: FieldRef<"WorkoutExercise", 'Int'>
    readonly minRPE: FieldRef<"WorkoutExercise", 'Int'>
    readonly isCompleted: FieldRef<"WorkoutExercise", 'Boolean'>
    readonly completedAt: FieldRef<"WorkoutExercise", 'DateTime'>
    readonly notes: FieldRef<"WorkoutExercise", 'String'>
  }
    

  // Custom InputTypes
  /**
   * WorkoutExercise findUnique
   */
  export type WorkoutExerciseFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutExercise
     */
    select?: WorkoutExerciseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutExerciseInclude<ExtArgs> | null
    /**
     * Filter, which WorkoutExercise to fetch.
     */
    where: WorkoutExerciseWhereUniqueInput
  }

  /**
   * WorkoutExercise findUniqueOrThrow
   */
  export type WorkoutExerciseFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutExercise
     */
    select?: WorkoutExerciseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutExerciseInclude<ExtArgs> | null
    /**
     * Filter, which WorkoutExercise to fetch.
     */
    where: WorkoutExerciseWhereUniqueInput
  }

  /**
   * WorkoutExercise findFirst
   */
  export type WorkoutExerciseFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutExercise
     */
    select?: WorkoutExerciseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutExerciseInclude<ExtArgs> | null
    /**
     * Filter, which WorkoutExercise to fetch.
     */
    where?: WorkoutExerciseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WorkoutExercises to fetch.
     */
    orderBy?: WorkoutExerciseOrderByWithRelationInput | WorkoutExerciseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WorkoutExercises.
     */
    cursor?: WorkoutExerciseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WorkoutExercises from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WorkoutExercises.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WorkoutExercises.
     */
    distinct?: WorkoutExerciseScalarFieldEnum | WorkoutExerciseScalarFieldEnum[]
  }

  /**
   * WorkoutExercise findFirstOrThrow
   */
  export type WorkoutExerciseFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutExercise
     */
    select?: WorkoutExerciseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutExerciseInclude<ExtArgs> | null
    /**
     * Filter, which WorkoutExercise to fetch.
     */
    where?: WorkoutExerciseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WorkoutExercises to fetch.
     */
    orderBy?: WorkoutExerciseOrderByWithRelationInput | WorkoutExerciseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WorkoutExercises.
     */
    cursor?: WorkoutExerciseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WorkoutExercises from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WorkoutExercises.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WorkoutExercises.
     */
    distinct?: WorkoutExerciseScalarFieldEnum | WorkoutExerciseScalarFieldEnum[]
  }

  /**
   * WorkoutExercise findMany
   */
  export type WorkoutExerciseFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutExercise
     */
    select?: WorkoutExerciseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutExerciseInclude<ExtArgs> | null
    /**
     * Filter, which WorkoutExercises to fetch.
     */
    where?: WorkoutExerciseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WorkoutExercises to fetch.
     */
    orderBy?: WorkoutExerciseOrderByWithRelationInput | WorkoutExerciseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing WorkoutExercises.
     */
    cursor?: WorkoutExerciseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WorkoutExercises from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WorkoutExercises.
     */
    skip?: number
    distinct?: WorkoutExerciseScalarFieldEnum | WorkoutExerciseScalarFieldEnum[]
  }

  /**
   * WorkoutExercise create
   */
  export type WorkoutExerciseCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutExercise
     */
    select?: WorkoutExerciseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutExerciseInclude<ExtArgs> | null
    /**
     * The data needed to create a WorkoutExercise.
     */
    data: XOR<WorkoutExerciseCreateInput, WorkoutExerciseUncheckedCreateInput>
  }

  /**
   * WorkoutExercise createMany
   */
  export type WorkoutExerciseCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many WorkoutExercises.
     */
    data: WorkoutExerciseCreateManyInput | WorkoutExerciseCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * WorkoutExercise createManyAndReturn
   */
  export type WorkoutExerciseCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutExercise
     */
    select?: WorkoutExerciseSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many WorkoutExercises.
     */
    data: WorkoutExerciseCreateManyInput | WorkoutExerciseCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutExerciseIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * WorkoutExercise update
   */
  export type WorkoutExerciseUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutExercise
     */
    select?: WorkoutExerciseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutExerciseInclude<ExtArgs> | null
    /**
     * The data needed to update a WorkoutExercise.
     */
    data: XOR<WorkoutExerciseUpdateInput, WorkoutExerciseUncheckedUpdateInput>
    /**
     * Choose, which WorkoutExercise to update.
     */
    where: WorkoutExerciseWhereUniqueInput
  }

  /**
   * WorkoutExercise updateMany
   */
  export type WorkoutExerciseUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update WorkoutExercises.
     */
    data: XOR<WorkoutExerciseUpdateManyMutationInput, WorkoutExerciseUncheckedUpdateManyInput>
    /**
     * Filter which WorkoutExercises to update
     */
    where?: WorkoutExerciseWhereInput
  }

  /**
   * WorkoutExercise upsert
   */
  export type WorkoutExerciseUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutExercise
     */
    select?: WorkoutExerciseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutExerciseInclude<ExtArgs> | null
    /**
     * The filter to search for the WorkoutExercise to update in case it exists.
     */
    where: WorkoutExerciseWhereUniqueInput
    /**
     * In case the WorkoutExercise found by the `where` argument doesn't exist, create a new WorkoutExercise with this data.
     */
    create: XOR<WorkoutExerciseCreateInput, WorkoutExerciseUncheckedCreateInput>
    /**
     * In case the WorkoutExercise was found with the provided `where` argument, update it with this data.
     */
    update: XOR<WorkoutExerciseUpdateInput, WorkoutExerciseUncheckedUpdateInput>
  }

  /**
   * WorkoutExercise delete
   */
  export type WorkoutExerciseDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutExercise
     */
    select?: WorkoutExerciseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutExerciseInclude<ExtArgs> | null
    /**
     * Filter which WorkoutExercise to delete.
     */
    where: WorkoutExerciseWhereUniqueInput
  }

  /**
   * WorkoutExercise deleteMany
   */
  export type WorkoutExerciseDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WorkoutExercises to delete
     */
    where?: WorkoutExerciseWhereInput
  }

  /**
   * WorkoutExercise.records
   */
  export type WorkoutExercise$recordsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutRecord
     */
    select?: WorkoutRecordSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutRecordInclude<ExtArgs> | null
    where?: WorkoutRecordWhereInput
    orderBy?: WorkoutRecordOrderByWithRelationInput | WorkoutRecordOrderByWithRelationInput[]
    cursor?: WorkoutRecordWhereUniqueInput
    take?: number
    skip?: number
    distinct?: WorkoutRecordScalarFieldEnum | WorkoutRecordScalarFieldEnum[]
  }

  /**
   * WorkoutExercise without action
   */
  export type WorkoutExerciseDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutExercise
     */
    select?: WorkoutExerciseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutExerciseInclude<ExtArgs> | null
  }


  /**
   * Model WorkoutRecord
   */

  export type AggregateWorkoutRecord = {
    _count: WorkoutRecordCountAggregateOutputType | null
    _avg: WorkoutRecordAvgAggregateOutputType | null
    _sum: WorkoutRecordSumAggregateOutputType | null
    _min: WorkoutRecordMinAggregateOutputType | null
    _max: WorkoutRecordMaxAggregateOutputType | null
  }

  export type WorkoutRecordAvgAggregateOutputType = {
    setNumber: number | null
    targetReps: number | null
    actualReps: number | null
    targetWeight: number | null
    actualWeight: number | null
    targetDuration: number | null
    actualDuration: number | null
    restTime: number | null
    rpe: number | null
    form: number | null
    difficulty: number | null
  }

  export type WorkoutRecordSumAggregateOutputType = {
    setNumber: number | null
    targetReps: number | null
    actualReps: number | null
    targetWeight: number | null
    actualWeight: number | null
    targetDuration: number | null
    actualDuration: number | null
    restTime: number | null
    rpe: number | null
    form: number | null
    difficulty: number | null
  }

  export type WorkoutRecordMinAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    updatedAt: Date | null
    sessionId: string | null
    exerciseId: string | null
    setNumber: number | null
    targetReps: number | null
    actualReps: number | null
    targetWeight: number | null
    actualWeight: number | null
    targetDuration: number | null
    actualDuration: number | null
    restTime: number | null
    rpe: number | null
    form: number | null
    difficulty: number | null
    startedAt: Date | null
    completedAt: Date | null
    isCompleted: boolean | null
    notes: string | null
  }

  export type WorkoutRecordMaxAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    updatedAt: Date | null
    sessionId: string | null
    exerciseId: string | null
    setNumber: number | null
    targetReps: number | null
    actualReps: number | null
    targetWeight: number | null
    actualWeight: number | null
    targetDuration: number | null
    actualDuration: number | null
    restTime: number | null
    rpe: number | null
    form: number | null
    difficulty: number | null
    startedAt: Date | null
    completedAt: Date | null
    isCompleted: boolean | null
    notes: string | null
  }

  export type WorkoutRecordCountAggregateOutputType = {
    id: number
    createdAt: number
    updatedAt: number
    sessionId: number
    exerciseId: number
    setNumber: number
    targetReps: number
    actualReps: number
    targetWeight: number
    actualWeight: number
    targetDuration: number
    actualDuration: number
    restTime: number
    rpe: number
    form: number
    difficulty: number
    startedAt: number
    completedAt: number
    isCompleted: number
    notes: number
    _all: number
  }


  export type WorkoutRecordAvgAggregateInputType = {
    setNumber?: true
    targetReps?: true
    actualReps?: true
    targetWeight?: true
    actualWeight?: true
    targetDuration?: true
    actualDuration?: true
    restTime?: true
    rpe?: true
    form?: true
    difficulty?: true
  }

  export type WorkoutRecordSumAggregateInputType = {
    setNumber?: true
    targetReps?: true
    actualReps?: true
    targetWeight?: true
    actualWeight?: true
    targetDuration?: true
    actualDuration?: true
    restTime?: true
    rpe?: true
    form?: true
    difficulty?: true
  }

  export type WorkoutRecordMinAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    sessionId?: true
    exerciseId?: true
    setNumber?: true
    targetReps?: true
    actualReps?: true
    targetWeight?: true
    actualWeight?: true
    targetDuration?: true
    actualDuration?: true
    restTime?: true
    rpe?: true
    form?: true
    difficulty?: true
    startedAt?: true
    completedAt?: true
    isCompleted?: true
    notes?: true
  }

  export type WorkoutRecordMaxAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    sessionId?: true
    exerciseId?: true
    setNumber?: true
    targetReps?: true
    actualReps?: true
    targetWeight?: true
    actualWeight?: true
    targetDuration?: true
    actualDuration?: true
    restTime?: true
    rpe?: true
    form?: true
    difficulty?: true
    startedAt?: true
    completedAt?: true
    isCompleted?: true
    notes?: true
  }

  export type WorkoutRecordCountAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    sessionId?: true
    exerciseId?: true
    setNumber?: true
    targetReps?: true
    actualReps?: true
    targetWeight?: true
    actualWeight?: true
    targetDuration?: true
    actualDuration?: true
    restTime?: true
    rpe?: true
    form?: true
    difficulty?: true
    startedAt?: true
    completedAt?: true
    isCompleted?: true
    notes?: true
    _all?: true
  }

  export type WorkoutRecordAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WorkoutRecord to aggregate.
     */
    where?: WorkoutRecordWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WorkoutRecords to fetch.
     */
    orderBy?: WorkoutRecordOrderByWithRelationInput | WorkoutRecordOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: WorkoutRecordWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WorkoutRecords from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WorkoutRecords.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned WorkoutRecords
    **/
    _count?: true | WorkoutRecordCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: WorkoutRecordAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: WorkoutRecordSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: WorkoutRecordMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: WorkoutRecordMaxAggregateInputType
  }

  export type GetWorkoutRecordAggregateType<T extends WorkoutRecordAggregateArgs> = {
        [P in keyof T & keyof AggregateWorkoutRecord]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateWorkoutRecord[P]>
      : GetScalarType<T[P], AggregateWorkoutRecord[P]>
  }




  export type WorkoutRecordGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WorkoutRecordWhereInput
    orderBy?: WorkoutRecordOrderByWithAggregationInput | WorkoutRecordOrderByWithAggregationInput[]
    by: WorkoutRecordScalarFieldEnum[] | WorkoutRecordScalarFieldEnum
    having?: WorkoutRecordScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: WorkoutRecordCountAggregateInputType | true
    _avg?: WorkoutRecordAvgAggregateInputType
    _sum?: WorkoutRecordSumAggregateInputType
    _min?: WorkoutRecordMinAggregateInputType
    _max?: WorkoutRecordMaxAggregateInputType
  }

  export type WorkoutRecordGroupByOutputType = {
    id: string
    createdAt: Date
    updatedAt: Date
    sessionId: string
    exerciseId: string
    setNumber: number
    targetReps: number
    actualReps: number
    targetWeight: number | null
    actualWeight: number | null
    targetDuration: number | null
    actualDuration: number | null
    restTime: number | null
    rpe: number | null
    form: number | null
    difficulty: number | null
    startedAt: Date | null
    completedAt: Date | null
    isCompleted: boolean
    notes: string | null
    _count: WorkoutRecordCountAggregateOutputType | null
    _avg: WorkoutRecordAvgAggregateOutputType | null
    _sum: WorkoutRecordSumAggregateOutputType | null
    _min: WorkoutRecordMinAggregateOutputType | null
    _max: WorkoutRecordMaxAggregateOutputType | null
  }

  type GetWorkoutRecordGroupByPayload<T extends WorkoutRecordGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<WorkoutRecordGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof WorkoutRecordGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], WorkoutRecordGroupByOutputType[P]>
            : GetScalarType<T[P], WorkoutRecordGroupByOutputType[P]>
        }
      >
    >


  export type WorkoutRecordSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    sessionId?: boolean
    exerciseId?: boolean
    setNumber?: boolean
    targetReps?: boolean
    actualReps?: boolean
    targetWeight?: boolean
    actualWeight?: boolean
    targetDuration?: boolean
    actualDuration?: boolean
    restTime?: boolean
    rpe?: boolean
    form?: boolean
    difficulty?: boolean
    startedAt?: boolean
    completedAt?: boolean
    isCompleted?: boolean
    notes?: boolean
    session?: boolean | WorkoutSessionDefaultArgs<ExtArgs>
    exercise?: boolean | WorkoutExerciseDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["workoutRecord"]>

  export type WorkoutRecordSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    sessionId?: boolean
    exerciseId?: boolean
    setNumber?: boolean
    targetReps?: boolean
    actualReps?: boolean
    targetWeight?: boolean
    actualWeight?: boolean
    targetDuration?: boolean
    actualDuration?: boolean
    restTime?: boolean
    rpe?: boolean
    form?: boolean
    difficulty?: boolean
    startedAt?: boolean
    completedAt?: boolean
    isCompleted?: boolean
    notes?: boolean
    session?: boolean | WorkoutSessionDefaultArgs<ExtArgs>
    exercise?: boolean | WorkoutExerciseDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["workoutRecord"]>

  export type WorkoutRecordSelectScalar = {
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    sessionId?: boolean
    exerciseId?: boolean
    setNumber?: boolean
    targetReps?: boolean
    actualReps?: boolean
    targetWeight?: boolean
    actualWeight?: boolean
    targetDuration?: boolean
    actualDuration?: boolean
    restTime?: boolean
    rpe?: boolean
    form?: boolean
    difficulty?: boolean
    startedAt?: boolean
    completedAt?: boolean
    isCompleted?: boolean
    notes?: boolean
  }

  export type WorkoutRecordInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    session?: boolean | WorkoutSessionDefaultArgs<ExtArgs>
    exercise?: boolean | WorkoutExerciseDefaultArgs<ExtArgs>
  }
  export type WorkoutRecordIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    session?: boolean | WorkoutSessionDefaultArgs<ExtArgs>
    exercise?: boolean | WorkoutExerciseDefaultArgs<ExtArgs>
  }

  export type $WorkoutRecordPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "WorkoutRecord"
    objects: {
      session: Prisma.$WorkoutSessionPayload<ExtArgs>
      exercise: Prisma.$WorkoutExercisePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      createdAt: Date
      updatedAt: Date
      sessionId: string
      exerciseId: string
      setNumber: number
      targetReps: number
      actualReps: number
      targetWeight: number | null
      actualWeight: number | null
      targetDuration: number | null
      actualDuration: number | null
      restTime: number | null
      rpe: number | null
      form: number | null
      difficulty: number | null
      startedAt: Date | null
      completedAt: Date | null
      isCompleted: boolean
      notes: string | null
    }, ExtArgs["result"]["workoutRecord"]>
    composites: {}
  }

  type WorkoutRecordGetPayload<S extends boolean | null | undefined | WorkoutRecordDefaultArgs> = $Result.GetResult<Prisma.$WorkoutRecordPayload, S>

  type WorkoutRecordCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<WorkoutRecordFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: WorkoutRecordCountAggregateInputType | true
    }

  export interface WorkoutRecordDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['WorkoutRecord'], meta: { name: 'WorkoutRecord' } }
    /**
     * Find zero or one WorkoutRecord that matches the filter.
     * @param {WorkoutRecordFindUniqueArgs} args - Arguments to find a WorkoutRecord
     * @example
     * // Get one WorkoutRecord
     * const workoutRecord = await prisma.workoutRecord.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends WorkoutRecordFindUniqueArgs>(args: SelectSubset<T, WorkoutRecordFindUniqueArgs<ExtArgs>>): Prisma__WorkoutRecordClient<$Result.GetResult<Prisma.$WorkoutRecordPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one WorkoutRecord that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {WorkoutRecordFindUniqueOrThrowArgs} args - Arguments to find a WorkoutRecord
     * @example
     * // Get one WorkoutRecord
     * const workoutRecord = await prisma.workoutRecord.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends WorkoutRecordFindUniqueOrThrowArgs>(args: SelectSubset<T, WorkoutRecordFindUniqueOrThrowArgs<ExtArgs>>): Prisma__WorkoutRecordClient<$Result.GetResult<Prisma.$WorkoutRecordPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first WorkoutRecord that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkoutRecordFindFirstArgs} args - Arguments to find a WorkoutRecord
     * @example
     * // Get one WorkoutRecord
     * const workoutRecord = await prisma.workoutRecord.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends WorkoutRecordFindFirstArgs>(args?: SelectSubset<T, WorkoutRecordFindFirstArgs<ExtArgs>>): Prisma__WorkoutRecordClient<$Result.GetResult<Prisma.$WorkoutRecordPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first WorkoutRecord that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkoutRecordFindFirstOrThrowArgs} args - Arguments to find a WorkoutRecord
     * @example
     * // Get one WorkoutRecord
     * const workoutRecord = await prisma.workoutRecord.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends WorkoutRecordFindFirstOrThrowArgs>(args?: SelectSubset<T, WorkoutRecordFindFirstOrThrowArgs<ExtArgs>>): Prisma__WorkoutRecordClient<$Result.GetResult<Prisma.$WorkoutRecordPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more WorkoutRecords that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkoutRecordFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all WorkoutRecords
     * const workoutRecords = await prisma.workoutRecord.findMany()
     * 
     * // Get first 10 WorkoutRecords
     * const workoutRecords = await prisma.workoutRecord.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const workoutRecordWithIdOnly = await prisma.workoutRecord.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends WorkoutRecordFindManyArgs>(args?: SelectSubset<T, WorkoutRecordFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WorkoutRecordPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a WorkoutRecord.
     * @param {WorkoutRecordCreateArgs} args - Arguments to create a WorkoutRecord.
     * @example
     * // Create one WorkoutRecord
     * const WorkoutRecord = await prisma.workoutRecord.create({
     *   data: {
     *     // ... data to create a WorkoutRecord
     *   }
     * })
     * 
     */
    create<T extends WorkoutRecordCreateArgs>(args: SelectSubset<T, WorkoutRecordCreateArgs<ExtArgs>>): Prisma__WorkoutRecordClient<$Result.GetResult<Prisma.$WorkoutRecordPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many WorkoutRecords.
     * @param {WorkoutRecordCreateManyArgs} args - Arguments to create many WorkoutRecords.
     * @example
     * // Create many WorkoutRecords
     * const workoutRecord = await prisma.workoutRecord.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends WorkoutRecordCreateManyArgs>(args?: SelectSubset<T, WorkoutRecordCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many WorkoutRecords and returns the data saved in the database.
     * @param {WorkoutRecordCreateManyAndReturnArgs} args - Arguments to create many WorkoutRecords.
     * @example
     * // Create many WorkoutRecords
     * const workoutRecord = await prisma.workoutRecord.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many WorkoutRecords and only return the `id`
     * const workoutRecordWithIdOnly = await prisma.workoutRecord.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends WorkoutRecordCreateManyAndReturnArgs>(args?: SelectSubset<T, WorkoutRecordCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WorkoutRecordPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a WorkoutRecord.
     * @param {WorkoutRecordDeleteArgs} args - Arguments to delete one WorkoutRecord.
     * @example
     * // Delete one WorkoutRecord
     * const WorkoutRecord = await prisma.workoutRecord.delete({
     *   where: {
     *     // ... filter to delete one WorkoutRecord
     *   }
     * })
     * 
     */
    delete<T extends WorkoutRecordDeleteArgs>(args: SelectSubset<T, WorkoutRecordDeleteArgs<ExtArgs>>): Prisma__WorkoutRecordClient<$Result.GetResult<Prisma.$WorkoutRecordPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one WorkoutRecord.
     * @param {WorkoutRecordUpdateArgs} args - Arguments to update one WorkoutRecord.
     * @example
     * // Update one WorkoutRecord
     * const workoutRecord = await prisma.workoutRecord.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends WorkoutRecordUpdateArgs>(args: SelectSubset<T, WorkoutRecordUpdateArgs<ExtArgs>>): Prisma__WorkoutRecordClient<$Result.GetResult<Prisma.$WorkoutRecordPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more WorkoutRecords.
     * @param {WorkoutRecordDeleteManyArgs} args - Arguments to filter WorkoutRecords to delete.
     * @example
     * // Delete a few WorkoutRecords
     * const { count } = await prisma.workoutRecord.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends WorkoutRecordDeleteManyArgs>(args?: SelectSubset<T, WorkoutRecordDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WorkoutRecords.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkoutRecordUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many WorkoutRecords
     * const workoutRecord = await prisma.workoutRecord.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends WorkoutRecordUpdateManyArgs>(args: SelectSubset<T, WorkoutRecordUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one WorkoutRecord.
     * @param {WorkoutRecordUpsertArgs} args - Arguments to update or create a WorkoutRecord.
     * @example
     * // Update or create a WorkoutRecord
     * const workoutRecord = await prisma.workoutRecord.upsert({
     *   create: {
     *     // ... data to create a WorkoutRecord
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the WorkoutRecord we want to update
     *   }
     * })
     */
    upsert<T extends WorkoutRecordUpsertArgs>(args: SelectSubset<T, WorkoutRecordUpsertArgs<ExtArgs>>): Prisma__WorkoutRecordClient<$Result.GetResult<Prisma.$WorkoutRecordPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of WorkoutRecords.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkoutRecordCountArgs} args - Arguments to filter WorkoutRecords to count.
     * @example
     * // Count the number of WorkoutRecords
     * const count = await prisma.workoutRecord.count({
     *   where: {
     *     // ... the filter for the WorkoutRecords we want to count
     *   }
     * })
    **/
    count<T extends WorkoutRecordCountArgs>(
      args?: Subset<T, WorkoutRecordCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], WorkoutRecordCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a WorkoutRecord.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkoutRecordAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends WorkoutRecordAggregateArgs>(args: Subset<T, WorkoutRecordAggregateArgs>): Prisma.PrismaPromise<GetWorkoutRecordAggregateType<T>>

    /**
     * Group by WorkoutRecord.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkoutRecordGroupByArgs} args - Group by arguments.
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
      T extends WorkoutRecordGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: WorkoutRecordGroupByArgs['orderBy'] }
        : { orderBy?: WorkoutRecordGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, WorkoutRecordGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetWorkoutRecordGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the WorkoutRecord model
   */
  readonly fields: WorkoutRecordFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for WorkoutRecord.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__WorkoutRecordClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    session<T extends WorkoutSessionDefaultArgs<ExtArgs> = {}>(args?: Subset<T, WorkoutSessionDefaultArgs<ExtArgs>>): Prisma__WorkoutSessionClient<$Result.GetResult<Prisma.$WorkoutSessionPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    exercise<T extends WorkoutExerciseDefaultArgs<ExtArgs> = {}>(args?: Subset<T, WorkoutExerciseDefaultArgs<ExtArgs>>): Prisma__WorkoutExerciseClient<$Result.GetResult<Prisma.$WorkoutExercisePayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
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
   * Fields of the WorkoutRecord model
   */ 
  interface WorkoutRecordFieldRefs {
    readonly id: FieldRef<"WorkoutRecord", 'String'>
    readonly createdAt: FieldRef<"WorkoutRecord", 'DateTime'>
    readonly updatedAt: FieldRef<"WorkoutRecord", 'DateTime'>
    readonly sessionId: FieldRef<"WorkoutRecord", 'String'>
    readonly exerciseId: FieldRef<"WorkoutRecord", 'String'>
    readonly setNumber: FieldRef<"WorkoutRecord", 'Int'>
    readonly targetReps: FieldRef<"WorkoutRecord", 'Int'>
    readonly actualReps: FieldRef<"WorkoutRecord", 'Int'>
    readonly targetWeight: FieldRef<"WorkoutRecord", 'Float'>
    readonly actualWeight: FieldRef<"WorkoutRecord", 'Float'>
    readonly targetDuration: FieldRef<"WorkoutRecord", 'Int'>
    readonly actualDuration: FieldRef<"WorkoutRecord", 'Int'>
    readonly restTime: FieldRef<"WorkoutRecord", 'Int'>
    readonly rpe: FieldRef<"WorkoutRecord", 'Int'>
    readonly form: FieldRef<"WorkoutRecord", 'Int'>
    readonly difficulty: FieldRef<"WorkoutRecord", 'Int'>
    readonly startedAt: FieldRef<"WorkoutRecord", 'DateTime'>
    readonly completedAt: FieldRef<"WorkoutRecord", 'DateTime'>
    readonly isCompleted: FieldRef<"WorkoutRecord", 'Boolean'>
    readonly notes: FieldRef<"WorkoutRecord", 'String'>
  }
    

  // Custom InputTypes
  /**
   * WorkoutRecord findUnique
   */
  export type WorkoutRecordFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutRecord
     */
    select?: WorkoutRecordSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutRecordInclude<ExtArgs> | null
    /**
     * Filter, which WorkoutRecord to fetch.
     */
    where: WorkoutRecordWhereUniqueInput
  }

  /**
   * WorkoutRecord findUniqueOrThrow
   */
  export type WorkoutRecordFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutRecord
     */
    select?: WorkoutRecordSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutRecordInclude<ExtArgs> | null
    /**
     * Filter, which WorkoutRecord to fetch.
     */
    where: WorkoutRecordWhereUniqueInput
  }

  /**
   * WorkoutRecord findFirst
   */
  export type WorkoutRecordFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutRecord
     */
    select?: WorkoutRecordSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutRecordInclude<ExtArgs> | null
    /**
     * Filter, which WorkoutRecord to fetch.
     */
    where?: WorkoutRecordWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WorkoutRecords to fetch.
     */
    orderBy?: WorkoutRecordOrderByWithRelationInput | WorkoutRecordOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WorkoutRecords.
     */
    cursor?: WorkoutRecordWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WorkoutRecords from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WorkoutRecords.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WorkoutRecords.
     */
    distinct?: WorkoutRecordScalarFieldEnum | WorkoutRecordScalarFieldEnum[]
  }

  /**
   * WorkoutRecord findFirstOrThrow
   */
  export type WorkoutRecordFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutRecord
     */
    select?: WorkoutRecordSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutRecordInclude<ExtArgs> | null
    /**
     * Filter, which WorkoutRecord to fetch.
     */
    where?: WorkoutRecordWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WorkoutRecords to fetch.
     */
    orderBy?: WorkoutRecordOrderByWithRelationInput | WorkoutRecordOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WorkoutRecords.
     */
    cursor?: WorkoutRecordWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WorkoutRecords from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WorkoutRecords.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WorkoutRecords.
     */
    distinct?: WorkoutRecordScalarFieldEnum | WorkoutRecordScalarFieldEnum[]
  }

  /**
   * WorkoutRecord findMany
   */
  export type WorkoutRecordFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutRecord
     */
    select?: WorkoutRecordSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutRecordInclude<ExtArgs> | null
    /**
     * Filter, which WorkoutRecords to fetch.
     */
    where?: WorkoutRecordWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WorkoutRecords to fetch.
     */
    orderBy?: WorkoutRecordOrderByWithRelationInput | WorkoutRecordOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing WorkoutRecords.
     */
    cursor?: WorkoutRecordWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WorkoutRecords from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WorkoutRecords.
     */
    skip?: number
    distinct?: WorkoutRecordScalarFieldEnum | WorkoutRecordScalarFieldEnum[]
  }

  /**
   * WorkoutRecord create
   */
  export type WorkoutRecordCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutRecord
     */
    select?: WorkoutRecordSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutRecordInclude<ExtArgs> | null
    /**
     * The data needed to create a WorkoutRecord.
     */
    data: XOR<WorkoutRecordCreateInput, WorkoutRecordUncheckedCreateInput>
  }

  /**
   * WorkoutRecord createMany
   */
  export type WorkoutRecordCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many WorkoutRecords.
     */
    data: WorkoutRecordCreateManyInput | WorkoutRecordCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * WorkoutRecord createManyAndReturn
   */
  export type WorkoutRecordCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutRecord
     */
    select?: WorkoutRecordSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many WorkoutRecords.
     */
    data: WorkoutRecordCreateManyInput | WorkoutRecordCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutRecordIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * WorkoutRecord update
   */
  export type WorkoutRecordUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutRecord
     */
    select?: WorkoutRecordSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutRecordInclude<ExtArgs> | null
    /**
     * The data needed to update a WorkoutRecord.
     */
    data: XOR<WorkoutRecordUpdateInput, WorkoutRecordUncheckedUpdateInput>
    /**
     * Choose, which WorkoutRecord to update.
     */
    where: WorkoutRecordWhereUniqueInput
  }

  /**
   * WorkoutRecord updateMany
   */
  export type WorkoutRecordUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update WorkoutRecords.
     */
    data: XOR<WorkoutRecordUpdateManyMutationInput, WorkoutRecordUncheckedUpdateManyInput>
    /**
     * Filter which WorkoutRecords to update
     */
    where?: WorkoutRecordWhereInput
  }

  /**
   * WorkoutRecord upsert
   */
  export type WorkoutRecordUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutRecord
     */
    select?: WorkoutRecordSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutRecordInclude<ExtArgs> | null
    /**
     * The filter to search for the WorkoutRecord to update in case it exists.
     */
    where: WorkoutRecordWhereUniqueInput
    /**
     * In case the WorkoutRecord found by the `where` argument doesn't exist, create a new WorkoutRecord with this data.
     */
    create: XOR<WorkoutRecordCreateInput, WorkoutRecordUncheckedCreateInput>
    /**
     * In case the WorkoutRecord was found with the provided `where` argument, update it with this data.
     */
    update: XOR<WorkoutRecordUpdateInput, WorkoutRecordUncheckedUpdateInput>
  }

  /**
   * WorkoutRecord delete
   */
  export type WorkoutRecordDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutRecord
     */
    select?: WorkoutRecordSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutRecordInclude<ExtArgs> | null
    /**
     * Filter which WorkoutRecord to delete.
     */
    where: WorkoutRecordWhereUniqueInput
  }

  /**
   * WorkoutRecord deleteMany
   */
  export type WorkoutRecordDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WorkoutRecords to delete
     */
    where?: WorkoutRecordWhereInput
  }

  /**
   * WorkoutRecord without action
   */
  export type WorkoutRecordDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutRecord
     */
    select?: WorkoutRecordSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkoutRecordInclude<ExtArgs> | null
  }


  /**
   * Model PersonalRecord
   */

  export type AggregatePersonalRecord = {
    _count: PersonalRecordCountAggregateOutputType | null
    _avg: PersonalRecordAvgAggregateOutputType | null
    _sum: PersonalRecordSumAggregateOutputType | null
    _min: PersonalRecordMinAggregateOutputType | null
    _max: PersonalRecordMaxAggregateOutputType | null
  }

  export type PersonalRecordAvgAggregateOutputType = {
    value: number | null
    setNumber: number | null
  }

  export type PersonalRecordSumAggregateOutputType = {
    value: number | null
    setNumber: number | null
  }

  export type PersonalRecordMinAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    updatedAt: Date | null
    userId: string | null
    exerciseId: string | null
    exerciseName: string | null
    recordType: string | null
    value: number | null
    unit: string | null
    sessionId: string | null
    setNumber: number | null
    notes: string | null
    isVerified: boolean | null
    verifiedAt: Date | null
  }

  export type PersonalRecordMaxAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    updatedAt: Date | null
    userId: string | null
    exerciseId: string | null
    exerciseName: string | null
    recordType: string | null
    value: number | null
    unit: string | null
    sessionId: string | null
    setNumber: number | null
    notes: string | null
    isVerified: boolean | null
    verifiedAt: Date | null
  }

  export type PersonalRecordCountAggregateOutputType = {
    id: number
    createdAt: number
    updatedAt: number
    userId: number
    exerciseId: number
    exerciseName: number
    recordType: number
    value: number
    unit: number
    sessionId: number
    setNumber: number
    notes: number
    isVerified: number
    verifiedAt: number
    _all: number
  }


  export type PersonalRecordAvgAggregateInputType = {
    value?: true
    setNumber?: true
  }

  export type PersonalRecordSumAggregateInputType = {
    value?: true
    setNumber?: true
  }

  export type PersonalRecordMinAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
    exerciseId?: true
    exerciseName?: true
    recordType?: true
    value?: true
    unit?: true
    sessionId?: true
    setNumber?: true
    notes?: true
    isVerified?: true
    verifiedAt?: true
  }

  export type PersonalRecordMaxAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
    exerciseId?: true
    exerciseName?: true
    recordType?: true
    value?: true
    unit?: true
    sessionId?: true
    setNumber?: true
    notes?: true
    isVerified?: true
    verifiedAt?: true
  }

  export type PersonalRecordCountAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
    exerciseId?: true
    exerciseName?: true
    recordType?: true
    value?: true
    unit?: true
    sessionId?: true
    setNumber?: true
    notes?: true
    isVerified?: true
    verifiedAt?: true
    _all?: true
  }

  export type PersonalRecordAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PersonalRecord to aggregate.
     */
    where?: PersonalRecordWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PersonalRecords to fetch.
     */
    orderBy?: PersonalRecordOrderByWithRelationInput | PersonalRecordOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PersonalRecordWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PersonalRecords from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PersonalRecords.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PersonalRecords
    **/
    _count?: true | PersonalRecordCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PersonalRecordAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PersonalRecordSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PersonalRecordMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PersonalRecordMaxAggregateInputType
  }

  export type GetPersonalRecordAggregateType<T extends PersonalRecordAggregateArgs> = {
        [P in keyof T & keyof AggregatePersonalRecord]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePersonalRecord[P]>
      : GetScalarType<T[P], AggregatePersonalRecord[P]>
  }




  export type PersonalRecordGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PersonalRecordWhereInput
    orderBy?: PersonalRecordOrderByWithAggregationInput | PersonalRecordOrderByWithAggregationInput[]
    by: PersonalRecordScalarFieldEnum[] | PersonalRecordScalarFieldEnum
    having?: PersonalRecordScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PersonalRecordCountAggregateInputType | true
    _avg?: PersonalRecordAvgAggregateInputType
    _sum?: PersonalRecordSumAggregateInputType
    _min?: PersonalRecordMinAggregateInputType
    _max?: PersonalRecordMaxAggregateInputType
  }

  export type PersonalRecordGroupByOutputType = {
    id: string
    createdAt: Date
    updatedAt: Date
    userId: string
    exerciseId: string | null
    exerciseName: string
    recordType: string
    value: number
    unit: string
    sessionId: string | null
    setNumber: number | null
    notes: string | null
    isVerified: boolean
    verifiedAt: Date | null
    _count: PersonalRecordCountAggregateOutputType | null
    _avg: PersonalRecordAvgAggregateOutputType | null
    _sum: PersonalRecordSumAggregateOutputType | null
    _min: PersonalRecordMinAggregateOutputType | null
    _max: PersonalRecordMaxAggregateOutputType | null
  }

  type GetPersonalRecordGroupByPayload<T extends PersonalRecordGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PersonalRecordGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PersonalRecordGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PersonalRecordGroupByOutputType[P]>
            : GetScalarType<T[P], PersonalRecordGroupByOutputType[P]>
        }
      >
    >


  export type PersonalRecordSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    exerciseId?: boolean
    exerciseName?: boolean
    recordType?: boolean
    value?: boolean
    unit?: boolean
    sessionId?: boolean
    setNumber?: boolean
    notes?: boolean
    isVerified?: boolean
    verifiedAt?: boolean
  }, ExtArgs["result"]["personalRecord"]>

  export type PersonalRecordSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    exerciseId?: boolean
    exerciseName?: boolean
    recordType?: boolean
    value?: boolean
    unit?: boolean
    sessionId?: boolean
    setNumber?: boolean
    notes?: boolean
    isVerified?: boolean
    verifiedAt?: boolean
  }, ExtArgs["result"]["personalRecord"]>

  export type PersonalRecordSelectScalar = {
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    exerciseId?: boolean
    exerciseName?: boolean
    recordType?: boolean
    value?: boolean
    unit?: boolean
    sessionId?: boolean
    setNumber?: boolean
    notes?: boolean
    isVerified?: boolean
    verifiedAt?: boolean
  }


  export type $PersonalRecordPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PersonalRecord"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      createdAt: Date
      updatedAt: Date
      userId: string
      exerciseId: string | null
      exerciseName: string
      recordType: string
      value: number
      unit: string
      sessionId: string | null
      setNumber: number | null
      notes: string | null
      isVerified: boolean
      verifiedAt: Date | null
    }, ExtArgs["result"]["personalRecord"]>
    composites: {}
  }

  type PersonalRecordGetPayload<S extends boolean | null | undefined | PersonalRecordDefaultArgs> = $Result.GetResult<Prisma.$PersonalRecordPayload, S>

  type PersonalRecordCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<PersonalRecordFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: PersonalRecordCountAggregateInputType | true
    }

  export interface PersonalRecordDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PersonalRecord'], meta: { name: 'PersonalRecord' } }
    /**
     * Find zero or one PersonalRecord that matches the filter.
     * @param {PersonalRecordFindUniqueArgs} args - Arguments to find a PersonalRecord
     * @example
     * // Get one PersonalRecord
     * const personalRecord = await prisma.personalRecord.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PersonalRecordFindUniqueArgs>(args: SelectSubset<T, PersonalRecordFindUniqueArgs<ExtArgs>>): Prisma__PersonalRecordClient<$Result.GetResult<Prisma.$PersonalRecordPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one PersonalRecord that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {PersonalRecordFindUniqueOrThrowArgs} args - Arguments to find a PersonalRecord
     * @example
     * // Get one PersonalRecord
     * const personalRecord = await prisma.personalRecord.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PersonalRecordFindUniqueOrThrowArgs>(args: SelectSubset<T, PersonalRecordFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PersonalRecordClient<$Result.GetResult<Prisma.$PersonalRecordPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first PersonalRecord that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PersonalRecordFindFirstArgs} args - Arguments to find a PersonalRecord
     * @example
     * // Get one PersonalRecord
     * const personalRecord = await prisma.personalRecord.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PersonalRecordFindFirstArgs>(args?: SelectSubset<T, PersonalRecordFindFirstArgs<ExtArgs>>): Prisma__PersonalRecordClient<$Result.GetResult<Prisma.$PersonalRecordPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first PersonalRecord that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PersonalRecordFindFirstOrThrowArgs} args - Arguments to find a PersonalRecord
     * @example
     * // Get one PersonalRecord
     * const personalRecord = await prisma.personalRecord.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PersonalRecordFindFirstOrThrowArgs>(args?: SelectSubset<T, PersonalRecordFindFirstOrThrowArgs<ExtArgs>>): Prisma__PersonalRecordClient<$Result.GetResult<Prisma.$PersonalRecordPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more PersonalRecords that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PersonalRecordFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PersonalRecords
     * const personalRecords = await prisma.personalRecord.findMany()
     * 
     * // Get first 10 PersonalRecords
     * const personalRecords = await prisma.personalRecord.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const personalRecordWithIdOnly = await prisma.personalRecord.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PersonalRecordFindManyArgs>(args?: SelectSubset<T, PersonalRecordFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PersonalRecordPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a PersonalRecord.
     * @param {PersonalRecordCreateArgs} args - Arguments to create a PersonalRecord.
     * @example
     * // Create one PersonalRecord
     * const PersonalRecord = await prisma.personalRecord.create({
     *   data: {
     *     // ... data to create a PersonalRecord
     *   }
     * })
     * 
     */
    create<T extends PersonalRecordCreateArgs>(args: SelectSubset<T, PersonalRecordCreateArgs<ExtArgs>>): Prisma__PersonalRecordClient<$Result.GetResult<Prisma.$PersonalRecordPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many PersonalRecords.
     * @param {PersonalRecordCreateManyArgs} args - Arguments to create many PersonalRecords.
     * @example
     * // Create many PersonalRecords
     * const personalRecord = await prisma.personalRecord.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PersonalRecordCreateManyArgs>(args?: SelectSubset<T, PersonalRecordCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PersonalRecords and returns the data saved in the database.
     * @param {PersonalRecordCreateManyAndReturnArgs} args - Arguments to create many PersonalRecords.
     * @example
     * // Create many PersonalRecords
     * const personalRecord = await prisma.personalRecord.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PersonalRecords and only return the `id`
     * const personalRecordWithIdOnly = await prisma.personalRecord.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PersonalRecordCreateManyAndReturnArgs>(args?: SelectSubset<T, PersonalRecordCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PersonalRecordPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a PersonalRecord.
     * @param {PersonalRecordDeleteArgs} args - Arguments to delete one PersonalRecord.
     * @example
     * // Delete one PersonalRecord
     * const PersonalRecord = await prisma.personalRecord.delete({
     *   where: {
     *     // ... filter to delete one PersonalRecord
     *   }
     * })
     * 
     */
    delete<T extends PersonalRecordDeleteArgs>(args: SelectSubset<T, PersonalRecordDeleteArgs<ExtArgs>>): Prisma__PersonalRecordClient<$Result.GetResult<Prisma.$PersonalRecordPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one PersonalRecord.
     * @param {PersonalRecordUpdateArgs} args - Arguments to update one PersonalRecord.
     * @example
     * // Update one PersonalRecord
     * const personalRecord = await prisma.personalRecord.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PersonalRecordUpdateArgs>(args: SelectSubset<T, PersonalRecordUpdateArgs<ExtArgs>>): Prisma__PersonalRecordClient<$Result.GetResult<Prisma.$PersonalRecordPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more PersonalRecords.
     * @param {PersonalRecordDeleteManyArgs} args - Arguments to filter PersonalRecords to delete.
     * @example
     * // Delete a few PersonalRecords
     * const { count } = await prisma.personalRecord.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PersonalRecordDeleteManyArgs>(args?: SelectSubset<T, PersonalRecordDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PersonalRecords.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PersonalRecordUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PersonalRecords
     * const personalRecord = await prisma.personalRecord.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PersonalRecordUpdateManyArgs>(args: SelectSubset<T, PersonalRecordUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one PersonalRecord.
     * @param {PersonalRecordUpsertArgs} args - Arguments to update or create a PersonalRecord.
     * @example
     * // Update or create a PersonalRecord
     * const personalRecord = await prisma.personalRecord.upsert({
     *   create: {
     *     // ... data to create a PersonalRecord
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PersonalRecord we want to update
     *   }
     * })
     */
    upsert<T extends PersonalRecordUpsertArgs>(args: SelectSubset<T, PersonalRecordUpsertArgs<ExtArgs>>): Prisma__PersonalRecordClient<$Result.GetResult<Prisma.$PersonalRecordPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of PersonalRecords.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PersonalRecordCountArgs} args - Arguments to filter PersonalRecords to count.
     * @example
     * // Count the number of PersonalRecords
     * const count = await prisma.personalRecord.count({
     *   where: {
     *     // ... the filter for the PersonalRecords we want to count
     *   }
     * })
    **/
    count<T extends PersonalRecordCountArgs>(
      args?: Subset<T, PersonalRecordCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PersonalRecordCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PersonalRecord.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PersonalRecordAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends PersonalRecordAggregateArgs>(args: Subset<T, PersonalRecordAggregateArgs>): Prisma.PrismaPromise<GetPersonalRecordAggregateType<T>>

    /**
     * Group by PersonalRecord.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PersonalRecordGroupByArgs} args - Group by arguments.
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
      T extends PersonalRecordGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PersonalRecordGroupByArgs['orderBy'] }
        : { orderBy?: PersonalRecordGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, PersonalRecordGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPersonalRecordGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PersonalRecord model
   */
  readonly fields: PersonalRecordFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PersonalRecord.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PersonalRecordClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the PersonalRecord model
   */ 
  interface PersonalRecordFieldRefs {
    readonly id: FieldRef<"PersonalRecord", 'String'>
    readonly createdAt: FieldRef<"PersonalRecord", 'DateTime'>
    readonly updatedAt: FieldRef<"PersonalRecord", 'DateTime'>
    readonly userId: FieldRef<"PersonalRecord", 'String'>
    readonly exerciseId: FieldRef<"PersonalRecord", 'String'>
    readonly exerciseName: FieldRef<"PersonalRecord", 'String'>
    readonly recordType: FieldRef<"PersonalRecord", 'String'>
    readonly value: FieldRef<"PersonalRecord", 'Float'>
    readonly unit: FieldRef<"PersonalRecord", 'String'>
    readonly sessionId: FieldRef<"PersonalRecord", 'String'>
    readonly setNumber: FieldRef<"PersonalRecord", 'Int'>
    readonly notes: FieldRef<"PersonalRecord", 'String'>
    readonly isVerified: FieldRef<"PersonalRecord", 'Boolean'>
    readonly verifiedAt: FieldRef<"PersonalRecord", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PersonalRecord findUnique
   */
  export type PersonalRecordFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PersonalRecord
     */
    select?: PersonalRecordSelect<ExtArgs> | null
    /**
     * Filter, which PersonalRecord to fetch.
     */
    where: PersonalRecordWhereUniqueInput
  }

  /**
   * PersonalRecord findUniqueOrThrow
   */
  export type PersonalRecordFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PersonalRecord
     */
    select?: PersonalRecordSelect<ExtArgs> | null
    /**
     * Filter, which PersonalRecord to fetch.
     */
    where: PersonalRecordWhereUniqueInput
  }

  /**
   * PersonalRecord findFirst
   */
  export type PersonalRecordFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PersonalRecord
     */
    select?: PersonalRecordSelect<ExtArgs> | null
    /**
     * Filter, which PersonalRecord to fetch.
     */
    where?: PersonalRecordWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PersonalRecords to fetch.
     */
    orderBy?: PersonalRecordOrderByWithRelationInput | PersonalRecordOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PersonalRecords.
     */
    cursor?: PersonalRecordWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PersonalRecords from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PersonalRecords.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PersonalRecords.
     */
    distinct?: PersonalRecordScalarFieldEnum | PersonalRecordScalarFieldEnum[]
  }

  /**
   * PersonalRecord findFirstOrThrow
   */
  export type PersonalRecordFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PersonalRecord
     */
    select?: PersonalRecordSelect<ExtArgs> | null
    /**
     * Filter, which PersonalRecord to fetch.
     */
    where?: PersonalRecordWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PersonalRecords to fetch.
     */
    orderBy?: PersonalRecordOrderByWithRelationInput | PersonalRecordOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PersonalRecords.
     */
    cursor?: PersonalRecordWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PersonalRecords from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PersonalRecords.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PersonalRecords.
     */
    distinct?: PersonalRecordScalarFieldEnum | PersonalRecordScalarFieldEnum[]
  }

  /**
   * PersonalRecord findMany
   */
  export type PersonalRecordFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PersonalRecord
     */
    select?: PersonalRecordSelect<ExtArgs> | null
    /**
     * Filter, which PersonalRecords to fetch.
     */
    where?: PersonalRecordWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PersonalRecords to fetch.
     */
    orderBy?: PersonalRecordOrderByWithRelationInput | PersonalRecordOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PersonalRecords.
     */
    cursor?: PersonalRecordWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PersonalRecords from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PersonalRecords.
     */
    skip?: number
    distinct?: PersonalRecordScalarFieldEnum | PersonalRecordScalarFieldEnum[]
  }

  /**
   * PersonalRecord create
   */
  export type PersonalRecordCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PersonalRecord
     */
    select?: PersonalRecordSelect<ExtArgs> | null
    /**
     * The data needed to create a PersonalRecord.
     */
    data: XOR<PersonalRecordCreateInput, PersonalRecordUncheckedCreateInput>
  }

  /**
   * PersonalRecord createMany
   */
  export type PersonalRecordCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PersonalRecords.
     */
    data: PersonalRecordCreateManyInput | PersonalRecordCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PersonalRecord createManyAndReturn
   */
  export type PersonalRecordCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PersonalRecord
     */
    select?: PersonalRecordSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many PersonalRecords.
     */
    data: PersonalRecordCreateManyInput | PersonalRecordCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PersonalRecord update
   */
  export type PersonalRecordUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PersonalRecord
     */
    select?: PersonalRecordSelect<ExtArgs> | null
    /**
     * The data needed to update a PersonalRecord.
     */
    data: XOR<PersonalRecordUpdateInput, PersonalRecordUncheckedUpdateInput>
    /**
     * Choose, which PersonalRecord to update.
     */
    where: PersonalRecordWhereUniqueInput
  }

  /**
   * PersonalRecord updateMany
   */
  export type PersonalRecordUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PersonalRecords.
     */
    data: XOR<PersonalRecordUpdateManyMutationInput, PersonalRecordUncheckedUpdateManyInput>
    /**
     * Filter which PersonalRecords to update
     */
    where?: PersonalRecordWhereInput
  }

  /**
   * PersonalRecord upsert
   */
  export type PersonalRecordUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PersonalRecord
     */
    select?: PersonalRecordSelect<ExtArgs> | null
    /**
     * The filter to search for the PersonalRecord to update in case it exists.
     */
    where: PersonalRecordWhereUniqueInput
    /**
     * In case the PersonalRecord found by the `where` argument doesn't exist, create a new PersonalRecord with this data.
     */
    create: XOR<PersonalRecordCreateInput, PersonalRecordUncheckedCreateInput>
    /**
     * In case the PersonalRecord was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PersonalRecordUpdateInput, PersonalRecordUncheckedUpdateInput>
  }

  /**
   * PersonalRecord delete
   */
  export type PersonalRecordDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PersonalRecord
     */
    select?: PersonalRecordSelect<ExtArgs> | null
    /**
     * Filter which PersonalRecord to delete.
     */
    where: PersonalRecordWhereUniqueInput
  }

  /**
   * PersonalRecord deleteMany
   */
  export type PersonalRecordDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PersonalRecords to delete
     */
    where?: PersonalRecordWhereInput
  }

  /**
   * PersonalRecord without action
   */
  export type PersonalRecordDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PersonalRecord
     */
    select?: PersonalRecordSelect<ExtArgs> | null
  }


  /**
   * Model WorkoutTemplate
   */

  export type AggregateWorkoutTemplate = {
    _count: WorkoutTemplateCountAggregateOutputType | null
    _avg: WorkoutTemplateAvgAggregateOutputType | null
    _sum: WorkoutTemplateSumAggregateOutputType | null
    _min: WorkoutTemplateMinAggregateOutputType | null
    _max: WorkoutTemplateMaxAggregateOutputType | null
  }

  export type WorkoutTemplateAvgAggregateOutputType = {
    difficulty: number | null
    useCount: number | null
  }

  export type WorkoutTemplateSumAggregateOutputType = {
    difficulty: number | null
    useCount: number | null
  }

  export type WorkoutTemplateMinAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    updatedAt: Date | null
    userId: string | null
    name: string | null
    description: string | null
    isPublic: boolean | null
    difficulty: number | null
    useCount: number | null
    lastUsed: Date | null
  }

  export type WorkoutTemplateMaxAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    updatedAt: Date | null
    userId: string | null
    name: string | null
    description: string | null
    isPublic: boolean | null
    difficulty: number | null
    useCount: number | null
    lastUsed: Date | null
  }

  export type WorkoutTemplateCountAggregateOutputType = {
    id: number
    createdAt: number
    updatedAt: number
    userId: number
    name: number
    description: number
    exercises: number
    isPublic: number
    tags: number
    difficulty: number
    useCount: number
    lastUsed: number
    _all: number
  }


  export type WorkoutTemplateAvgAggregateInputType = {
    difficulty?: true
    useCount?: true
  }

  export type WorkoutTemplateSumAggregateInputType = {
    difficulty?: true
    useCount?: true
  }

  export type WorkoutTemplateMinAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
    name?: true
    description?: true
    isPublic?: true
    difficulty?: true
    useCount?: true
    lastUsed?: true
  }

  export type WorkoutTemplateMaxAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
    name?: true
    description?: true
    isPublic?: true
    difficulty?: true
    useCount?: true
    lastUsed?: true
  }

  export type WorkoutTemplateCountAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
    name?: true
    description?: true
    exercises?: true
    isPublic?: true
    tags?: true
    difficulty?: true
    useCount?: true
    lastUsed?: true
    _all?: true
  }

  export type WorkoutTemplateAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WorkoutTemplate to aggregate.
     */
    where?: WorkoutTemplateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WorkoutTemplates to fetch.
     */
    orderBy?: WorkoutTemplateOrderByWithRelationInput | WorkoutTemplateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: WorkoutTemplateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WorkoutTemplates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WorkoutTemplates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned WorkoutTemplates
    **/
    _count?: true | WorkoutTemplateCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: WorkoutTemplateAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: WorkoutTemplateSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: WorkoutTemplateMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: WorkoutTemplateMaxAggregateInputType
  }

  export type GetWorkoutTemplateAggregateType<T extends WorkoutTemplateAggregateArgs> = {
        [P in keyof T & keyof AggregateWorkoutTemplate]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateWorkoutTemplate[P]>
      : GetScalarType<T[P], AggregateWorkoutTemplate[P]>
  }




  export type WorkoutTemplateGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WorkoutTemplateWhereInput
    orderBy?: WorkoutTemplateOrderByWithAggregationInput | WorkoutTemplateOrderByWithAggregationInput[]
    by: WorkoutTemplateScalarFieldEnum[] | WorkoutTemplateScalarFieldEnum
    having?: WorkoutTemplateScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: WorkoutTemplateCountAggregateInputType | true
    _avg?: WorkoutTemplateAvgAggregateInputType
    _sum?: WorkoutTemplateSumAggregateInputType
    _min?: WorkoutTemplateMinAggregateInputType
    _max?: WorkoutTemplateMaxAggregateInputType
  }

  export type WorkoutTemplateGroupByOutputType = {
    id: string
    createdAt: Date
    updatedAt: Date
    userId: string
    name: string
    description: string | null
    exercises: JsonValue
    isPublic: boolean
    tags: string[]
    difficulty: number | null
    useCount: number
    lastUsed: Date | null
    _count: WorkoutTemplateCountAggregateOutputType | null
    _avg: WorkoutTemplateAvgAggregateOutputType | null
    _sum: WorkoutTemplateSumAggregateOutputType | null
    _min: WorkoutTemplateMinAggregateOutputType | null
    _max: WorkoutTemplateMaxAggregateOutputType | null
  }

  type GetWorkoutTemplateGroupByPayload<T extends WorkoutTemplateGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<WorkoutTemplateGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof WorkoutTemplateGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], WorkoutTemplateGroupByOutputType[P]>
            : GetScalarType<T[P], WorkoutTemplateGroupByOutputType[P]>
        }
      >
    >


  export type WorkoutTemplateSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    name?: boolean
    description?: boolean
    exercises?: boolean
    isPublic?: boolean
    tags?: boolean
    difficulty?: boolean
    useCount?: boolean
    lastUsed?: boolean
  }, ExtArgs["result"]["workoutTemplate"]>

  export type WorkoutTemplateSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    name?: boolean
    description?: boolean
    exercises?: boolean
    isPublic?: boolean
    tags?: boolean
    difficulty?: boolean
    useCount?: boolean
    lastUsed?: boolean
  }, ExtArgs["result"]["workoutTemplate"]>

  export type WorkoutTemplateSelectScalar = {
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    name?: boolean
    description?: boolean
    exercises?: boolean
    isPublic?: boolean
    tags?: boolean
    difficulty?: boolean
    useCount?: boolean
    lastUsed?: boolean
  }


  export type $WorkoutTemplatePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "WorkoutTemplate"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      createdAt: Date
      updatedAt: Date
      userId: string
      name: string
      description: string | null
      exercises: Prisma.JsonValue
      isPublic: boolean
      tags: string[]
      difficulty: number | null
      useCount: number
      lastUsed: Date | null
    }, ExtArgs["result"]["workoutTemplate"]>
    composites: {}
  }

  type WorkoutTemplateGetPayload<S extends boolean | null | undefined | WorkoutTemplateDefaultArgs> = $Result.GetResult<Prisma.$WorkoutTemplatePayload, S>

  type WorkoutTemplateCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<WorkoutTemplateFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: WorkoutTemplateCountAggregateInputType | true
    }

  export interface WorkoutTemplateDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['WorkoutTemplate'], meta: { name: 'WorkoutTemplate' } }
    /**
     * Find zero or one WorkoutTemplate that matches the filter.
     * @param {WorkoutTemplateFindUniqueArgs} args - Arguments to find a WorkoutTemplate
     * @example
     * // Get one WorkoutTemplate
     * const workoutTemplate = await prisma.workoutTemplate.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends WorkoutTemplateFindUniqueArgs>(args: SelectSubset<T, WorkoutTemplateFindUniqueArgs<ExtArgs>>): Prisma__WorkoutTemplateClient<$Result.GetResult<Prisma.$WorkoutTemplatePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one WorkoutTemplate that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {WorkoutTemplateFindUniqueOrThrowArgs} args - Arguments to find a WorkoutTemplate
     * @example
     * // Get one WorkoutTemplate
     * const workoutTemplate = await prisma.workoutTemplate.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends WorkoutTemplateFindUniqueOrThrowArgs>(args: SelectSubset<T, WorkoutTemplateFindUniqueOrThrowArgs<ExtArgs>>): Prisma__WorkoutTemplateClient<$Result.GetResult<Prisma.$WorkoutTemplatePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first WorkoutTemplate that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkoutTemplateFindFirstArgs} args - Arguments to find a WorkoutTemplate
     * @example
     * // Get one WorkoutTemplate
     * const workoutTemplate = await prisma.workoutTemplate.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends WorkoutTemplateFindFirstArgs>(args?: SelectSubset<T, WorkoutTemplateFindFirstArgs<ExtArgs>>): Prisma__WorkoutTemplateClient<$Result.GetResult<Prisma.$WorkoutTemplatePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first WorkoutTemplate that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkoutTemplateFindFirstOrThrowArgs} args - Arguments to find a WorkoutTemplate
     * @example
     * // Get one WorkoutTemplate
     * const workoutTemplate = await prisma.workoutTemplate.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends WorkoutTemplateFindFirstOrThrowArgs>(args?: SelectSubset<T, WorkoutTemplateFindFirstOrThrowArgs<ExtArgs>>): Prisma__WorkoutTemplateClient<$Result.GetResult<Prisma.$WorkoutTemplatePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more WorkoutTemplates that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkoutTemplateFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all WorkoutTemplates
     * const workoutTemplates = await prisma.workoutTemplate.findMany()
     * 
     * // Get first 10 WorkoutTemplates
     * const workoutTemplates = await prisma.workoutTemplate.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const workoutTemplateWithIdOnly = await prisma.workoutTemplate.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends WorkoutTemplateFindManyArgs>(args?: SelectSubset<T, WorkoutTemplateFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WorkoutTemplatePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a WorkoutTemplate.
     * @param {WorkoutTemplateCreateArgs} args - Arguments to create a WorkoutTemplate.
     * @example
     * // Create one WorkoutTemplate
     * const WorkoutTemplate = await prisma.workoutTemplate.create({
     *   data: {
     *     // ... data to create a WorkoutTemplate
     *   }
     * })
     * 
     */
    create<T extends WorkoutTemplateCreateArgs>(args: SelectSubset<T, WorkoutTemplateCreateArgs<ExtArgs>>): Prisma__WorkoutTemplateClient<$Result.GetResult<Prisma.$WorkoutTemplatePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many WorkoutTemplates.
     * @param {WorkoutTemplateCreateManyArgs} args - Arguments to create many WorkoutTemplates.
     * @example
     * // Create many WorkoutTemplates
     * const workoutTemplate = await prisma.workoutTemplate.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends WorkoutTemplateCreateManyArgs>(args?: SelectSubset<T, WorkoutTemplateCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many WorkoutTemplates and returns the data saved in the database.
     * @param {WorkoutTemplateCreateManyAndReturnArgs} args - Arguments to create many WorkoutTemplates.
     * @example
     * // Create many WorkoutTemplates
     * const workoutTemplate = await prisma.workoutTemplate.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many WorkoutTemplates and only return the `id`
     * const workoutTemplateWithIdOnly = await prisma.workoutTemplate.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends WorkoutTemplateCreateManyAndReturnArgs>(args?: SelectSubset<T, WorkoutTemplateCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WorkoutTemplatePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a WorkoutTemplate.
     * @param {WorkoutTemplateDeleteArgs} args - Arguments to delete one WorkoutTemplate.
     * @example
     * // Delete one WorkoutTemplate
     * const WorkoutTemplate = await prisma.workoutTemplate.delete({
     *   where: {
     *     // ... filter to delete one WorkoutTemplate
     *   }
     * })
     * 
     */
    delete<T extends WorkoutTemplateDeleteArgs>(args: SelectSubset<T, WorkoutTemplateDeleteArgs<ExtArgs>>): Prisma__WorkoutTemplateClient<$Result.GetResult<Prisma.$WorkoutTemplatePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one WorkoutTemplate.
     * @param {WorkoutTemplateUpdateArgs} args - Arguments to update one WorkoutTemplate.
     * @example
     * // Update one WorkoutTemplate
     * const workoutTemplate = await prisma.workoutTemplate.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends WorkoutTemplateUpdateArgs>(args: SelectSubset<T, WorkoutTemplateUpdateArgs<ExtArgs>>): Prisma__WorkoutTemplateClient<$Result.GetResult<Prisma.$WorkoutTemplatePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more WorkoutTemplates.
     * @param {WorkoutTemplateDeleteManyArgs} args - Arguments to filter WorkoutTemplates to delete.
     * @example
     * // Delete a few WorkoutTemplates
     * const { count } = await prisma.workoutTemplate.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends WorkoutTemplateDeleteManyArgs>(args?: SelectSubset<T, WorkoutTemplateDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WorkoutTemplates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkoutTemplateUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many WorkoutTemplates
     * const workoutTemplate = await prisma.workoutTemplate.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends WorkoutTemplateUpdateManyArgs>(args: SelectSubset<T, WorkoutTemplateUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one WorkoutTemplate.
     * @param {WorkoutTemplateUpsertArgs} args - Arguments to update or create a WorkoutTemplate.
     * @example
     * // Update or create a WorkoutTemplate
     * const workoutTemplate = await prisma.workoutTemplate.upsert({
     *   create: {
     *     // ... data to create a WorkoutTemplate
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the WorkoutTemplate we want to update
     *   }
     * })
     */
    upsert<T extends WorkoutTemplateUpsertArgs>(args: SelectSubset<T, WorkoutTemplateUpsertArgs<ExtArgs>>): Prisma__WorkoutTemplateClient<$Result.GetResult<Prisma.$WorkoutTemplatePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of WorkoutTemplates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkoutTemplateCountArgs} args - Arguments to filter WorkoutTemplates to count.
     * @example
     * // Count the number of WorkoutTemplates
     * const count = await prisma.workoutTemplate.count({
     *   where: {
     *     // ... the filter for the WorkoutTemplates we want to count
     *   }
     * })
    **/
    count<T extends WorkoutTemplateCountArgs>(
      args?: Subset<T, WorkoutTemplateCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], WorkoutTemplateCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a WorkoutTemplate.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkoutTemplateAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends WorkoutTemplateAggregateArgs>(args: Subset<T, WorkoutTemplateAggregateArgs>): Prisma.PrismaPromise<GetWorkoutTemplateAggregateType<T>>

    /**
     * Group by WorkoutTemplate.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkoutTemplateGroupByArgs} args - Group by arguments.
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
      T extends WorkoutTemplateGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: WorkoutTemplateGroupByArgs['orderBy'] }
        : { orderBy?: WorkoutTemplateGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, WorkoutTemplateGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetWorkoutTemplateGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the WorkoutTemplate model
   */
  readonly fields: WorkoutTemplateFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for WorkoutTemplate.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__WorkoutTemplateClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the WorkoutTemplate model
   */ 
  interface WorkoutTemplateFieldRefs {
    readonly id: FieldRef<"WorkoutTemplate", 'String'>
    readonly createdAt: FieldRef<"WorkoutTemplate", 'DateTime'>
    readonly updatedAt: FieldRef<"WorkoutTemplate", 'DateTime'>
    readonly userId: FieldRef<"WorkoutTemplate", 'String'>
    readonly name: FieldRef<"WorkoutTemplate", 'String'>
    readonly description: FieldRef<"WorkoutTemplate", 'String'>
    readonly exercises: FieldRef<"WorkoutTemplate", 'Json'>
    readonly isPublic: FieldRef<"WorkoutTemplate", 'Boolean'>
    readonly tags: FieldRef<"WorkoutTemplate", 'String[]'>
    readonly difficulty: FieldRef<"WorkoutTemplate", 'Int'>
    readonly useCount: FieldRef<"WorkoutTemplate", 'Int'>
    readonly lastUsed: FieldRef<"WorkoutTemplate", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * WorkoutTemplate findUnique
   */
  export type WorkoutTemplateFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutTemplate
     */
    select?: WorkoutTemplateSelect<ExtArgs> | null
    /**
     * Filter, which WorkoutTemplate to fetch.
     */
    where: WorkoutTemplateWhereUniqueInput
  }

  /**
   * WorkoutTemplate findUniqueOrThrow
   */
  export type WorkoutTemplateFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutTemplate
     */
    select?: WorkoutTemplateSelect<ExtArgs> | null
    /**
     * Filter, which WorkoutTemplate to fetch.
     */
    where: WorkoutTemplateWhereUniqueInput
  }

  /**
   * WorkoutTemplate findFirst
   */
  export type WorkoutTemplateFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutTemplate
     */
    select?: WorkoutTemplateSelect<ExtArgs> | null
    /**
     * Filter, which WorkoutTemplate to fetch.
     */
    where?: WorkoutTemplateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WorkoutTemplates to fetch.
     */
    orderBy?: WorkoutTemplateOrderByWithRelationInput | WorkoutTemplateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WorkoutTemplates.
     */
    cursor?: WorkoutTemplateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WorkoutTemplates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WorkoutTemplates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WorkoutTemplates.
     */
    distinct?: WorkoutTemplateScalarFieldEnum | WorkoutTemplateScalarFieldEnum[]
  }

  /**
   * WorkoutTemplate findFirstOrThrow
   */
  export type WorkoutTemplateFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutTemplate
     */
    select?: WorkoutTemplateSelect<ExtArgs> | null
    /**
     * Filter, which WorkoutTemplate to fetch.
     */
    where?: WorkoutTemplateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WorkoutTemplates to fetch.
     */
    orderBy?: WorkoutTemplateOrderByWithRelationInput | WorkoutTemplateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WorkoutTemplates.
     */
    cursor?: WorkoutTemplateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WorkoutTemplates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WorkoutTemplates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WorkoutTemplates.
     */
    distinct?: WorkoutTemplateScalarFieldEnum | WorkoutTemplateScalarFieldEnum[]
  }

  /**
   * WorkoutTemplate findMany
   */
  export type WorkoutTemplateFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutTemplate
     */
    select?: WorkoutTemplateSelect<ExtArgs> | null
    /**
     * Filter, which WorkoutTemplates to fetch.
     */
    where?: WorkoutTemplateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WorkoutTemplates to fetch.
     */
    orderBy?: WorkoutTemplateOrderByWithRelationInput | WorkoutTemplateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing WorkoutTemplates.
     */
    cursor?: WorkoutTemplateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WorkoutTemplates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WorkoutTemplates.
     */
    skip?: number
    distinct?: WorkoutTemplateScalarFieldEnum | WorkoutTemplateScalarFieldEnum[]
  }

  /**
   * WorkoutTemplate create
   */
  export type WorkoutTemplateCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutTemplate
     */
    select?: WorkoutTemplateSelect<ExtArgs> | null
    /**
     * The data needed to create a WorkoutTemplate.
     */
    data: XOR<WorkoutTemplateCreateInput, WorkoutTemplateUncheckedCreateInput>
  }

  /**
   * WorkoutTemplate createMany
   */
  export type WorkoutTemplateCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many WorkoutTemplates.
     */
    data: WorkoutTemplateCreateManyInput | WorkoutTemplateCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * WorkoutTemplate createManyAndReturn
   */
  export type WorkoutTemplateCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutTemplate
     */
    select?: WorkoutTemplateSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many WorkoutTemplates.
     */
    data: WorkoutTemplateCreateManyInput | WorkoutTemplateCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * WorkoutTemplate update
   */
  export type WorkoutTemplateUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutTemplate
     */
    select?: WorkoutTemplateSelect<ExtArgs> | null
    /**
     * The data needed to update a WorkoutTemplate.
     */
    data: XOR<WorkoutTemplateUpdateInput, WorkoutTemplateUncheckedUpdateInput>
    /**
     * Choose, which WorkoutTemplate to update.
     */
    where: WorkoutTemplateWhereUniqueInput
  }

  /**
   * WorkoutTemplate updateMany
   */
  export type WorkoutTemplateUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update WorkoutTemplates.
     */
    data: XOR<WorkoutTemplateUpdateManyMutationInput, WorkoutTemplateUncheckedUpdateManyInput>
    /**
     * Filter which WorkoutTemplates to update
     */
    where?: WorkoutTemplateWhereInput
  }

  /**
   * WorkoutTemplate upsert
   */
  export type WorkoutTemplateUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutTemplate
     */
    select?: WorkoutTemplateSelect<ExtArgs> | null
    /**
     * The filter to search for the WorkoutTemplate to update in case it exists.
     */
    where: WorkoutTemplateWhereUniqueInput
    /**
     * In case the WorkoutTemplate found by the `where` argument doesn't exist, create a new WorkoutTemplate with this data.
     */
    create: XOR<WorkoutTemplateCreateInput, WorkoutTemplateUncheckedCreateInput>
    /**
     * In case the WorkoutTemplate was found with the provided `where` argument, update it with this data.
     */
    update: XOR<WorkoutTemplateUpdateInput, WorkoutTemplateUncheckedUpdateInput>
  }

  /**
   * WorkoutTemplate delete
   */
  export type WorkoutTemplateDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutTemplate
     */
    select?: WorkoutTemplateSelect<ExtArgs> | null
    /**
     * Filter which WorkoutTemplate to delete.
     */
    where: WorkoutTemplateWhereUniqueInput
  }

  /**
   * WorkoutTemplate deleteMany
   */
  export type WorkoutTemplateDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WorkoutTemplates to delete
     */
    where?: WorkoutTemplateWhereInput
  }

  /**
   * WorkoutTemplate without action
   */
  export type WorkoutTemplateDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutTemplate
     */
    select?: WorkoutTemplateSelect<ExtArgs> | null
  }


  /**
   * Model WorkoutGoal
   */

  export type AggregateWorkoutGoal = {
    _count: WorkoutGoalCountAggregateOutputType | null
    _avg: WorkoutGoalAvgAggregateOutputType | null
    _sum: WorkoutGoalSumAggregateOutputType | null
    _min: WorkoutGoalMinAggregateOutputType | null
    _max: WorkoutGoalMaxAggregateOutputType | null
  }

  export type WorkoutGoalAvgAggregateOutputType = {
    targetValue: number | null
    currentValue: number | null
    progress: number | null
  }

  export type WorkoutGoalSumAggregateOutputType = {
    targetValue: number | null
    currentValue: number | null
    progress: number | null
  }

  export type WorkoutGoalMinAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    updatedAt: Date | null
    userId: string | null
    exerciseId: string | null
    exerciseName: string | null
    goalType: string | null
    targetValue: number | null
    currentValue: number | null
    unit: string | null
    startDate: Date | null
    targetDate: Date | null
    isAchieved: boolean | null
    achievedAt: Date | null
    progress: number | null
  }

  export type WorkoutGoalMaxAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    updatedAt: Date | null
    userId: string | null
    exerciseId: string | null
    exerciseName: string | null
    goalType: string | null
    targetValue: number | null
    currentValue: number | null
    unit: string | null
    startDate: Date | null
    targetDate: Date | null
    isAchieved: boolean | null
    achievedAt: Date | null
    progress: number | null
  }

  export type WorkoutGoalCountAggregateOutputType = {
    id: number
    createdAt: number
    updatedAt: number
    userId: number
    exerciseId: number
    exerciseName: number
    goalType: number
    targetValue: number
    currentValue: number
    unit: number
    startDate: number
    targetDate: number
    isAchieved: number
    achievedAt: number
    progress: number
    milestones: number
    _all: number
  }


  export type WorkoutGoalAvgAggregateInputType = {
    targetValue?: true
    currentValue?: true
    progress?: true
  }

  export type WorkoutGoalSumAggregateInputType = {
    targetValue?: true
    currentValue?: true
    progress?: true
  }

  export type WorkoutGoalMinAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
    exerciseId?: true
    exerciseName?: true
    goalType?: true
    targetValue?: true
    currentValue?: true
    unit?: true
    startDate?: true
    targetDate?: true
    isAchieved?: true
    achievedAt?: true
    progress?: true
  }

  export type WorkoutGoalMaxAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
    exerciseId?: true
    exerciseName?: true
    goalType?: true
    targetValue?: true
    currentValue?: true
    unit?: true
    startDate?: true
    targetDate?: true
    isAchieved?: true
    achievedAt?: true
    progress?: true
  }

  export type WorkoutGoalCountAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
    exerciseId?: true
    exerciseName?: true
    goalType?: true
    targetValue?: true
    currentValue?: true
    unit?: true
    startDate?: true
    targetDate?: true
    isAchieved?: true
    achievedAt?: true
    progress?: true
    milestones?: true
    _all?: true
  }

  export type WorkoutGoalAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WorkoutGoal to aggregate.
     */
    where?: WorkoutGoalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WorkoutGoals to fetch.
     */
    orderBy?: WorkoutGoalOrderByWithRelationInput | WorkoutGoalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: WorkoutGoalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WorkoutGoals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WorkoutGoals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned WorkoutGoals
    **/
    _count?: true | WorkoutGoalCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: WorkoutGoalAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: WorkoutGoalSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: WorkoutGoalMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: WorkoutGoalMaxAggregateInputType
  }

  export type GetWorkoutGoalAggregateType<T extends WorkoutGoalAggregateArgs> = {
        [P in keyof T & keyof AggregateWorkoutGoal]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateWorkoutGoal[P]>
      : GetScalarType<T[P], AggregateWorkoutGoal[P]>
  }




  export type WorkoutGoalGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WorkoutGoalWhereInput
    orderBy?: WorkoutGoalOrderByWithAggregationInput | WorkoutGoalOrderByWithAggregationInput[]
    by: WorkoutGoalScalarFieldEnum[] | WorkoutGoalScalarFieldEnum
    having?: WorkoutGoalScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: WorkoutGoalCountAggregateInputType | true
    _avg?: WorkoutGoalAvgAggregateInputType
    _sum?: WorkoutGoalSumAggregateInputType
    _min?: WorkoutGoalMinAggregateInputType
    _max?: WorkoutGoalMaxAggregateInputType
  }

  export type WorkoutGoalGroupByOutputType = {
    id: string
    createdAt: Date
    updatedAt: Date
    userId: string
    exerciseId: string | null
    exerciseName: string
    goalType: string
    targetValue: number
    currentValue: number
    unit: string
    startDate: Date
    targetDate: Date
    isAchieved: boolean
    achievedAt: Date | null
    progress: number
    milestones: JsonValue | null
    _count: WorkoutGoalCountAggregateOutputType | null
    _avg: WorkoutGoalAvgAggregateOutputType | null
    _sum: WorkoutGoalSumAggregateOutputType | null
    _min: WorkoutGoalMinAggregateOutputType | null
    _max: WorkoutGoalMaxAggregateOutputType | null
  }

  type GetWorkoutGoalGroupByPayload<T extends WorkoutGoalGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<WorkoutGoalGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof WorkoutGoalGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], WorkoutGoalGroupByOutputType[P]>
            : GetScalarType<T[P], WorkoutGoalGroupByOutputType[P]>
        }
      >
    >


  export type WorkoutGoalSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    exerciseId?: boolean
    exerciseName?: boolean
    goalType?: boolean
    targetValue?: boolean
    currentValue?: boolean
    unit?: boolean
    startDate?: boolean
    targetDate?: boolean
    isAchieved?: boolean
    achievedAt?: boolean
    progress?: boolean
    milestones?: boolean
  }, ExtArgs["result"]["workoutGoal"]>

  export type WorkoutGoalSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    exerciseId?: boolean
    exerciseName?: boolean
    goalType?: boolean
    targetValue?: boolean
    currentValue?: boolean
    unit?: boolean
    startDate?: boolean
    targetDate?: boolean
    isAchieved?: boolean
    achievedAt?: boolean
    progress?: boolean
    milestones?: boolean
  }, ExtArgs["result"]["workoutGoal"]>

  export type WorkoutGoalSelectScalar = {
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    exerciseId?: boolean
    exerciseName?: boolean
    goalType?: boolean
    targetValue?: boolean
    currentValue?: boolean
    unit?: boolean
    startDate?: boolean
    targetDate?: boolean
    isAchieved?: boolean
    achievedAt?: boolean
    progress?: boolean
    milestones?: boolean
  }


  export type $WorkoutGoalPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "WorkoutGoal"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      createdAt: Date
      updatedAt: Date
      userId: string
      exerciseId: string | null
      exerciseName: string
      goalType: string
      targetValue: number
      currentValue: number
      unit: string
      startDate: Date
      targetDate: Date
      isAchieved: boolean
      achievedAt: Date | null
      progress: number
      milestones: Prisma.JsonValue | null
    }, ExtArgs["result"]["workoutGoal"]>
    composites: {}
  }

  type WorkoutGoalGetPayload<S extends boolean | null | undefined | WorkoutGoalDefaultArgs> = $Result.GetResult<Prisma.$WorkoutGoalPayload, S>

  type WorkoutGoalCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<WorkoutGoalFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: WorkoutGoalCountAggregateInputType | true
    }

  export interface WorkoutGoalDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['WorkoutGoal'], meta: { name: 'WorkoutGoal' } }
    /**
     * Find zero or one WorkoutGoal that matches the filter.
     * @param {WorkoutGoalFindUniqueArgs} args - Arguments to find a WorkoutGoal
     * @example
     * // Get one WorkoutGoal
     * const workoutGoal = await prisma.workoutGoal.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends WorkoutGoalFindUniqueArgs>(args: SelectSubset<T, WorkoutGoalFindUniqueArgs<ExtArgs>>): Prisma__WorkoutGoalClient<$Result.GetResult<Prisma.$WorkoutGoalPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one WorkoutGoal that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {WorkoutGoalFindUniqueOrThrowArgs} args - Arguments to find a WorkoutGoal
     * @example
     * // Get one WorkoutGoal
     * const workoutGoal = await prisma.workoutGoal.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends WorkoutGoalFindUniqueOrThrowArgs>(args: SelectSubset<T, WorkoutGoalFindUniqueOrThrowArgs<ExtArgs>>): Prisma__WorkoutGoalClient<$Result.GetResult<Prisma.$WorkoutGoalPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first WorkoutGoal that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkoutGoalFindFirstArgs} args - Arguments to find a WorkoutGoal
     * @example
     * // Get one WorkoutGoal
     * const workoutGoal = await prisma.workoutGoal.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends WorkoutGoalFindFirstArgs>(args?: SelectSubset<T, WorkoutGoalFindFirstArgs<ExtArgs>>): Prisma__WorkoutGoalClient<$Result.GetResult<Prisma.$WorkoutGoalPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first WorkoutGoal that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkoutGoalFindFirstOrThrowArgs} args - Arguments to find a WorkoutGoal
     * @example
     * // Get one WorkoutGoal
     * const workoutGoal = await prisma.workoutGoal.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends WorkoutGoalFindFirstOrThrowArgs>(args?: SelectSubset<T, WorkoutGoalFindFirstOrThrowArgs<ExtArgs>>): Prisma__WorkoutGoalClient<$Result.GetResult<Prisma.$WorkoutGoalPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more WorkoutGoals that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkoutGoalFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all WorkoutGoals
     * const workoutGoals = await prisma.workoutGoal.findMany()
     * 
     * // Get first 10 WorkoutGoals
     * const workoutGoals = await prisma.workoutGoal.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const workoutGoalWithIdOnly = await prisma.workoutGoal.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends WorkoutGoalFindManyArgs>(args?: SelectSubset<T, WorkoutGoalFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WorkoutGoalPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a WorkoutGoal.
     * @param {WorkoutGoalCreateArgs} args - Arguments to create a WorkoutGoal.
     * @example
     * // Create one WorkoutGoal
     * const WorkoutGoal = await prisma.workoutGoal.create({
     *   data: {
     *     // ... data to create a WorkoutGoal
     *   }
     * })
     * 
     */
    create<T extends WorkoutGoalCreateArgs>(args: SelectSubset<T, WorkoutGoalCreateArgs<ExtArgs>>): Prisma__WorkoutGoalClient<$Result.GetResult<Prisma.$WorkoutGoalPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many WorkoutGoals.
     * @param {WorkoutGoalCreateManyArgs} args - Arguments to create many WorkoutGoals.
     * @example
     * // Create many WorkoutGoals
     * const workoutGoal = await prisma.workoutGoal.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends WorkoutGoalCreateManyArgs>(args?: SelectSubset<T, WorkoutGoalCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many WorkoutGoals and returns the data saved in the database.
     * @param {WorkoutGoalCreateManyAndReturnArgs} args - Arguments to create many WorkoutGoals.
     * @example
     * // Create many WorkoutGoals
     * const workoutGoal = await prisma.workoutGoal.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many WorkoutGoals and only return the `id`
     * const workoutGoalWithIdOnly = await prisma.workoutGoal.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends WorkoutGoalCreateManyAndReturnArgs>(args?: SelectSubset<T, WorkoutGoalCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WorkoutGoalPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a WorkoutGoal.
     * @param {WorkoutGoalDeleteArgs} args - Arguments to delete one WorkoutGoal.
     * @example
     * // Delete one WorkoutGoal
     * const WorkoutGoal = await prisma.workoutGoal.delete({
     *   where: {
     *     // ... filter to delete one WorkoutGoal
     *   }
     * })
     * 
     */
    delete<T extends WorkoutGoalDeleteArgs>(args: SelectSubset<T, WorkoutGoalDeleteArgs<ExtArgs>>): Prisma__WorkoutGoalClient<$Result.GetResult<Prisma.$WorkoutGoalPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one WorkoutGoal.
     * @param {WorkoutGoalUpdateArgs} args - Arguments to update one WorkoutGoal.
     * @example
     * // Update one WorkoutGoal
     * const workoutGoal = await prisma.workoutGoal.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends WorkoutGoalUpdateArgs>(args: SelectSubset<T, WorkoutGoalUpdateArgs<ExtArgs>>): Prisma__WorkoutGoalClient<$Result.GetResult<Prisma.$WorkoutGoalPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more WorkoutGoals.
     * @param {WorkoutGoalDeleteManyArgs} args - Arguments to filter WorkoutGoals to delete.
     * @example
     * // Delete a few WorkoutGoals
     * const { count } = await prisma.workoutGoal.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends WorkoutGoalDeleteManyArgs>(args?: SelectSubset<T, WorkoutGoalDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WorkoutGoals.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkoutGoalUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many WorkoutGoals
     * const workoutGoal = await prisma.workoutGoal.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends WorkoutGoalUpdateManyArgs>(args: SelectSubset<T, WorkoutGoalUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one WorkoutGoal.
     * @param {WorkoutGoalUpsertArgs} args - Arguments to update or create a WorkoutGoal.
     * @example
     * // Update or create a WorkoutGoal
     * const workoutGoal = await prisma.workoutGoal.upsert({
     *   create: {
     *     // ... data to create a WorkoutGoal
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the WorkoutGoal we want to update
     *   }
     * })
     */
    upsert<T extends WorkoutGoalUpsertArgs>(args: SelectSubset<T, WorkoutGoalUpsertArgs<ExtArgs>>): Prisma__WorkoutGoalClient<$Result.GetResult<Prisma.$WorkoutGoalPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of WorkoutGoals.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkoutGoalCountArgs} args - Arguments to filter WorkoutGoals to count.
     * @example
     * // Count the number of WorkoutGoals
     * const count = await prisma.workoutGoal.count({
     *   where: {
     *     // ... the filter for the WorkoutGoals we want to count
     *   }
     * })
    **/
    count<T extends WorkoutGoalCountArgs>(
      args?: Subset<T, WorkoutGoalCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], WorkoutGoalCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a WorkoutGoal.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkoutGoalAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends WorkoutGoalAggregateArgs>(args: Subset<T, WorkoutGoalAggregateArgs>): Prisma.PrismaPromise<GetWorkoutGoalAggregateType<T>>

    /**
     * Group by WorkoutGoal.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkoutGoalGroupByArgs} args - Group by arguments.
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
      T extends WorkoutGoalGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: WorkoutGoalGroupByArgs['orderBy'] }
        : { orderBy?: WorkoutGoalGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, WorkoutGoalGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetWorkoutGoalGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the WorkoutGoal model
   */
  readonly fields: WorkoutGoalFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for WorkoutGoal.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__WorkoutGoalClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the WorkoutGoal model
   */ 
  interface WorkoutGoalFieldRefs {
    readonly id: FieldRef<"WorkoutGoal", 'String'>
    readonly createdAt: FieldRef<"WorkoutGoal", 'DateTime'>
    readonly updatedAt: FieldRef<"WorkoutGoal", 'DateTime'>
    readonly userId: FieldRef<"WorkoutGoal", 'String'>
    readonly exerciseId: FieldRef<"WorkoutGoal", 'String'>
    readonly exerciseName: FieldRef<"WorkoutGoal", 'String'>
    readonly goalType: FieldRef<"WorkoutGoal", 'String'>
    readonly targetValue: FieldRef<"WorkoutGoal", 'Float'>
    readonly currentValue: FieldRef<"WorkoutGoal", 'Float'>
    readonly unit: FieldRef<"WorkoutGoal", 'String'>
    readonly startDate: FieldRef<"WorkoutGoal", 'DateTime'>
    readonly targetDate: FieldRef<"WorkoutGoal", 'DateTime'>
    readonly isAchieved: FieldRef<"WorkoutGoal", 'Boolean'>
    readonly achievedAt: FieldRef<"WorkoutGoal", 'DateTime'>
    readonly progress: FieldRef<"WorkoutGoal", 'Float'>
    readonly milestones: FieldRef<"WorkoutGoal", 'Json'>
  }
    

  // Custom InputTypes
  /**
   * WorkoutGoal findUnique
   */
  export type WorkoutGoalFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutGoal
     */
    select?: WorkoutGoalSelect<ExtArgs> | null
    /**
     * Filter, which WorkoutGoal to fetch.
     */
    where: WorkoutGoalWhereUniqueInput
  }

  /**
   * WorkoutGoal findUniqueOrThrow
   */
  export type WorkoutGoalFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutGoal
     */
    select?: WorkoutGoalSelect<ExtArgs> | null
    /**
     * Filter, which WorkoutGoal to fetch.
     */
    where: WorkoutGoalWhereUniqueInput
  }

  /**
   * WorkoutGoal findFirst
   */
  export type WorkoutGoalFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutGoal
     */
    select?: WorkoutGoalSelect<ExtArgs> | null
    /**
     * Filter, which WorkoutGoal to fetch.
     */
    where?: WorkoutGoalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WorkoutGoals to fetch.
     */
    orderBy?: WorkoutGoalOrderByWithRelationInput | WorkoutGoalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WorkoutGoals.
     */
    cursor?: WorkoutGoalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WorkoutGoals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WorkoutGoals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WorkoutGoals.
     */
    distinct?: WorkoutGoalScalarFieldEnum | WorkoutGoalScalarFieldEnum[]
  }

  /**
   * WorkoutGoal findFirstOrThrow
   */
  export type WorkoutGoalFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutGoal
     */
    select?: WorkoutGoalSelect<ExtArgs> | null
    /**
     * Filter, which WorkoutGoal to fetch.
     */
    where?: WorkoutGoalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WorkoutGoals to fetch.
     */
    orderBy?: WorkoutGoalOrderByWithRelationInput | WorkoutGoalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WorkoutGoals.
     */
    cursor?: WorkoutGoalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WorkoutGoals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WorkoutGoals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WorkoutGoals.
     */
    distinct?: WorkoutGoalScalarFieldEnum | WorkoutGoalScalarFieldEnum[]
  }

  /**
   * WorkoutGoal findMany
   */
  export type WorkoutGoalFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutGoal
     */
    select?: WorkoutGoalSelect<ExtArgs> | null
    /**
     * Filter, which WorkoutGoals to fetch.
     */
    where?: WorkoutGoalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WorkoutGoals to fetch.
     */
    orderBy?: WorkoutGoalOrderByWithRelationInput | WorkoutGoalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing WorkoutGoals.
     */
    cursor?: WorkoutGoalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WorkoutGoals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WorkoutGoals.
     */
    skip?: number
    distinct?: WorkoutGoalScalarFieldEnum | WorkoutGoalScalarFieldEnum[]
  }

  /**
   * WorkoutGoal create
   */
  export type WorkoutGoalCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutGoal
     */
    select?: WorkoutGoalSelect<ExtArgs> | null
    /**
     * The data needed to create a WorkoutGoal.
     */
    data: XOR<WorkoutGoalCreateInput, WorkoutGoalUncheckedCreateInput>
  }

  /**
   * WorkoutGoal createMany
   */
  export type WorkoutGoalCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many WorkoutGoals.
     */
    data: WorkoutGoalCreateManyInput | WorkoutGoalCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * WorkoutGoal createManyAndReturn
   */
  export type WorkoutGoalCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutGoal
     */
    select?: WorkoutGoalSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many WorkoutGoals.
     */
    data: WorkoutGoalCreateManyInput | WorkoutGoalCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * WorkoutGoal update
   */
  export type WorkoutGoalUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutGoal
     */
    select?: WorkoutGoalSelect<ExtArgs> | null
    /**
     * The data needed to update a WorkoutGoal.
     */
    data: XOR<WorkoutGoalUpdateInput, WorkoutGoalUncheckedUpdateInput>
    /**
     * Choose, which WorkoutGoal to update.
     */
    where: WorkoutGoalWhereUniqueInput
  }

  /**
   * WorkoutGoal updateMany
   */
  export type WorkoutGoalUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update WorkoutGoals.
     */
    data: XOR<WorkoutGoalUpdateManyMutationInput, WorkoutGoalUncheckedUpdateManyInput>
    /**
     * Filter which WorkoutGoals to update
     */
    where?: WorkoutGoalWhereInput
  }

  /**
   * WorkoutGoal upsert
   */
  export type WorkoutGoalUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutGoal
     */
    select?: WorkoutGoalSelect<ExtArgs> | null
    /**
     * The filter to search for the WorkoutGoal to update in case it exists.
     */
    where: WorkoutGoalWhereUniqueInput
    /**
     * In case the WorkoutGoal found by the `where` argument doesn't exist, create a new WorkoutGoal with this data.
     */
    create: XOR<WorkoutGoalCreateInput, WorkoutGoalUncheckedCreateInput>
    /**
     * In case the WorkoutGoal was found with the provided `where` argument, update it with this data.
     */
    update: XOR<WorkoutGoalUpdateInput, WorkoutGoalUncheckedUpdateInput>
  }

  /**
   * WorkoutGoal delete
   */
  export type WorkoutGoalDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutGoal
     */
    select?: WorkoutGoalSelect<ExtArgs> | null
    /**
     * Filter which WorkoutGoal to delete.
     */
    where: WorkoutGoalWhereUniqueInput
  }

  /**
   * WorkoutGoal deleteMany
   */
  export type WorkoutGoalDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WorkoutGoals to delete
     */
    where?: WorkoutGoalWhereInput
  }

  /**
   * WorkoutGoal without action
   */
  export type WorkoutGoalDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkoutGoal
     */
    select?: WorkoutGoalSelect<ExtArgs> | null
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


  export const WorkoutSessionScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    userId: 'userId',
    planId: 'planId',
    sessionName: 'sessionName',
    startedAt: 'startedAt',
    completedAt: 'completedAt',
    pausedAt: 'pausedAt',
    totalDuration: 'totalDuration',
    status: 'status',
    isActive: 'isActive',
    notes: 'notes',
    overallRating: 'overallRating',
    difficulty: 'difficulty',
    energy: 'energy',
    motivation: 'motivation',
    location: 'location',
    weather: 'weather',
    temperature: 'temperature'
  };

  export type WorkoutSessionScalarFieldEnum = (typeof WorkoutSessionScalarFieldEnum)[keyof typeof WorkoutSessionScalarFieldEnum]


  export const UserSummaryScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    userId: 'userId',
    weekStart: 'weekStart',
    weekEnd: 'weekEnd',
    totalWorkouts: 'totalWorkouts',
    completedWorkouts: 'completedWorkouts',
    totalVolume: 'totalVolume',
    averageSessionDuration: 'averageSessionDuration',
    averageFatigueLevel: 'averageFatigueLevel',
    fatigueAssessmentCount: 'fatigueAssessmentCount',
    personalRecordsSet: 'personalRecordsSet',
    newPersonalRecords: 'newPersonalRecords',
    weeklyGoalCompletion: 'weeklyGoalCompletion',
    consistencyScore: 'consistencyScore',
    lastUpdated: 'lastUpdated',
    dataVersion: 'dataVersion'
  };

  export type UserSummaryScalarFieldEnum = (typeof UserSummaryScalarFieldEnum)[keyof typeof UserSummaryScalarFieldEnum]


  export const WorkoutExerciseScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    sessionId: 'sessionId',
    exerciseId: 'exerciseId',
    exerciseName: 'exerciseName',
    category: 'category',
    order: 'order',
    targetSets: 'targetSets',
    targetReps: 'targetReps',
    targetWeight: 'targetWeight',
    targetDuration: 'targetDuration',
    targetRest: 'targetRest',
    actualSets: 'actualSets',
    actualReps: 'actualReps',
    actualWeight: 'actualWeight',
    actualDuration: 'actualDuration',
    actualRest: 'actualRest',
    totalVolume: 'totalVolume',
    averageRPE: 'averageRPE',
    maxRPE: 'maxRPE',
    minRPE: 'minRPE',
    isCompleted: 'isCompleted',
    completedAt: 'completedAt',
    notes: 'notes'
  };

  export type WorkoutExerciseScalarFieldEnum = (typeof WorkoutExerciseScalarFieldEnum)[keyof typeof WorkoutExerciseScalarFieldEnum]


  export const WorkoutRecordScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    sessionId: 'sessionId',
    exerciseId: 'exerciseId',
    setNumber: 'setNumber',
    targetReps: 'targetReps',
    actualReps: 'actualReps',
    targetWeight: 'targetWeight',
    actualWeight: 'actualWeight',
    targetDuration: 'targetDuration',
    actualDuration: 'actualDuration',
    restTime: 'restTime',
    rpe: 'rpe',
    form: 'form',
    difficulty: 'difficulty',
    startedAt: 'startedAt',
    completedAt: 'completedAt',
    isCompleted: 'isCompleted',
    notes: 'notes'
  };

  export type WorkoutRecordScalarFieldEnum = (typeof WorkoutRecordScalarFieldEnum)[keyof typeof WorkoutRecordScalarFieldEnum]


  export const PersonalRecordScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    userId: 'userId',
    exerciseId: 'exerciseId',
    exerciseName: 'exerciseName',
    recordType: 'recordType',
    value: 'value',
    unit: 'unit',
    sessionId: 'sessionId',
    setNumber: 'setNumber',
    notes: 'notes',
    isVerified: 'isVerified',
    verifiedAt: 'verifiedAt'
  };

  export type PersonalRecordScalarFieldEnum = (typeof PersonalRecordScalarFieldEnum)[keyof typeof PersonalRecordScalarFieldEnum]


  export const WorkoutTemplateScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    userId: 'userId',
    name: 'name',
    description: 'description',
    exercises: 'exercises',
    isPublic: 'isPublic',
    tags: 'tags',
    difficulty: 'difficulty',
    useCount: 'useCount',
    lastUsed: 'lastUsed'
  };

  export type WorkoutTemplateScalarFieldEnum = (typeof WorkoutTemplateScalarFieldEnum)[keyof typeof WorkoutTemplateScalarFieldEnum]


  export const WorkoutGoalScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    userId: 'userId',
    exerciseId: 'exerciseId',
    exerciseName: 'exerciseName',
    goalType: 'goalType',
    targetValue: 'targetValue',
    currentValue: 'currentValue',
    unit: 'unit',
    startDate: 'startDate',
    targetDate: 'targetDate',
    isAchieved: 'isAchieved',
    achievedAt: 'achievedAt',
    progress: 'progress',
    milestones: 'milestones'
  };

  export type WorkoutGoalScalarFieldEnum = (typeof WorkoutGoalScalarFieldEnum)[keyof typeof WorkoutGoalScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


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


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


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
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    
  /**
   * Deep Input Types
   */


  export type WorkoutSessionWhereInput = {
    AND?: WorkoutSessionWhereInput | WorkoutSessionWhereInput[]
    OR?: WorkoutSessionWhereInput[]
    NOT?: WorkoutSessionWhereInput | WorkoutSessionWhereInput[]
    id?: StringFilter<"WorkoutSession"> | string
    createdAt?: DateTimeFilter<"WorkoutSession"> | Date | string
    updatedAt?: DateTimeFilter<"WorkoutSession"> | Date | string
    userId?: StringFilter<"WorkoutSession"> | string
    planId?: StringNullableFilter<"WorkoutSession"> | string | null
    sessionName?: StringNullableFilter<"WorkoutSession"> | string | null
    startedAt?: DateTimeNullableFilter<"WorkoutSession"> | Date | string | null
    completedAt?: DateTimeNullableFilter<"WorkoutSession"> | Date | string | null
    pausedAt?: DateTimeNullableFilter<"WorkoutSession"> | Date | string | null
    totalDuration?: IntNullableFilter<"WorkoutSession"> | number | null
    status?: StringFilter<"WorkoutSession"> | string
    isActive?: BoolFilter<"WorkoutSession"> | boolean
    notes?: StringNullableFilter<"WorkoutSession"> | string | null
    overallRating?: IntNullableFilter<"WorkoutSession"> | number | null
    difficulty?: IntNullableFilter<"WorkoutSession"> | number | null
    energy?: IntNullableFilter<"WorkoutSession"> | number | null
    motivation?: IntNullableFilter<"WorkoutSession"> | number | null
    location?: StringNullableFilter<"WorkoutSession"> | string | null
    weather?: StringNullableFilter<"WorkoutSession"> | string | null
    temperature?: FloatNullableFilter<"WorkoutSession"> | number | null
    records?: WorkoutRecordListRelationFilter
    exercises?: WorkoutExerciseListRelationFilter
  }

  export type WorkoutSessionOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    planId?: SortOrderInput | SortOrder
    sessionName?: SortOrderInput | SortOrder
    startedAt?: SortOrderInput | SortOrder
    completedAt?: SortOrderInput | SortOrder
    pausedAt?: SortOrderInput | SortOrder
    totalDuration?: SortOrderInput | SortOrder
    status?: SortOrder
    isActive?: SortOrder
    notes?: SortOrderInput | SortOrder
    overallRating?: SortOrderInput | SortOrder
    difficulty?: SortOrderInput | SortOrder
    energy?: SortOrderInput | SortOrder
    motivation?: SortOrderInput | SortOrder
    location?: SortOrderInput | SortOrder
    weather?: SortOrderInput | SortOrder
    temperature?: SortOrderInput | SortOrder
    records?: WorkoutRecordOrderByRelationAggregateInput
    exercises?: WorkoutExerciseOrderByRelationAggregateInput
  }

  export type WorkoutSessionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: WorkoutSessionWhereInput | WorkoutSessionWhereInput[]
    OR?: WorkoutSessionWhereInput[]
    NOT?: WorkoutSessionWhereInput | WorkoutSessionWhereInput[]
    createdAt?: DateTimeFilter<"WorkoutSession"> | Date | string
    updatedAt?: DateTimeFilter<"WorkoutSession"> | Date | string
    userId?: StringFilter<"WorkoutSession"> | string
    planId?: StringNullableFilter<"WorkoutSession"> | string | null
    sessionName?: StringNullableFilter<"WorkoutSession"> | string | null
    startedAt?: DateTimeNullableFilter<"WorkoutSession"> | Date | string | null
    completedAt?: DateTimeNullableFilter<"WorkoutSession"> | Date | string | null
    pausedAt?: DateTimeNullableFilter<"WorkoutSession"> | Date | string | null
    totalDuration?: IntNullableFilter<"WorkoutSession"> | number | null
    status?: StringFilter<"WorkoutSession"> | string
    isActive?: BoolFilter<"WorkoutSession"> | boolean
    notes?: StringNullableFilter<"WorkoutSession"> | string | null
    overallRating?: IntNullableFilter<"WorkoutSession"> | number | null
    difficulty?: IntNullableFilter<"WorkoutSession"> | number | null
    energy?: IntNullableFilter<"WorkoutSession"> | number | null
    motivation?: IntNullableFilter<"WorkoutSession"> | number | null
    location?: StringNullableFilter<"WorkoutSession"> | string | null
    weather?: StringNullableFilter<"WorkoutSession"> | string | null
    temperature?: FloatNullableFilter<"WorkoutSession"> | number | null
    records?: WorkoutRecordListRelationFilter
    exercises?: WorkoutExerciseListRelationFilter
  }, "id">

  export type WorkoutSessionOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    planId?: SortOrderInput | SortOrder
    sessionName?: SortOrderInput | SortOrder
    startedAt?: SortOrderInput | SortOrder
    completedAt?: SortOrderInput | SortOrder
    pausedAt?: SortOrderInput | SortOrder
    totalDuration?: SortOrderInput | SortOrder
    status?: SortOrder
    isActive?: SortOrder
    notes?: SortOrderInput | SortOrder
    overallRating?: SortOrderInput | SortOrder
    difficulty?: SortOrderInput | SortOrder
    energy?: SortOrderInput | SortOrder
    motivation?: SortOrderInput | SortOrder
    location?: SortOrderInput | SortOrder
    weather?: SortOrderInput | SortOrder
    temperature?: SortOrderInput | SortOrder
    _count?: WorkoutSessionCountOrderByAggregateInput
    _avg?: WorkoutSessionAvgOrderByAggregateInput
    _max?: WorkoutSessionMaxOrderByAggregateInput
    _min?: WorkoutSessionMinOrderByAggregateInput
    _sum?: WorkoutSessionSumOrderByAggregateInput
  }

  export type WorkoutSessionScalarWhereWithAggregatesInput = {
    AND?: WorkoutSessionScalarWhereWithAggregatesInput | WorkoutSessionScalarWhereWithAggregatesInput[]
    OR?: WorkoutSessionScalarWhereWithAggregatesInput[]
    NOT?: WorkoutSessionScalarWhereWithAggregatesInput | WorkoutSessionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"WorkoutSession"> | string
    createdAt?: DateTimeWithAggregatesFilter<"WorkoutSession"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"WorkoutSession"> | Date | string
    userId?: StringWithAggregatesFilter<"WorkoutSession"> | string
    planId?: StringNullableWithAggregatesFilter<"WorkoutSession"> | string | null
    sessionName?: StringNullableWithAggregatesFilter<"WorkoutSession"> | string | null
    startedAt?: DateTimeNullableWithAggregatesFilter<"WorkoutSession"> | Date | string | null
    completedAt?: DateTimeNullableWithAggregatesFilter<"WorkoutSession"> | Date | string | null
    pausedAt?: DateTimeNullableWithAggregatesFilter<"WorkoutSession"> | Date | string | null
    totalDuration?: IntNullableWithAggregatesFilter<"WorkoutSession"> | number | null
    status?: StringWithAggregatesFilter<"WorkoutSession"> | string
    isActive?: BoolWithAggregatesFilter<"WorkoutSession"> | boolean
    notes?: StringNullableWithAggregatesFilter<"WorkoutSession"> | string | null
    overallRating?: IntNullableWithAggregatesFilter<"WorkoutSession"> | number | null
    difficulty?: IntNullableWithAggregatesFilter<"WorkoutSession"> | number | null
    energy?: IntNullableWithAggregatesFilter<"WorkoutSession"> | number | null
    motivation?: IntNullableWithAggregatesFilter<"WorkoutSession"> | number | null
    location?: StringNullableWithAggregatesFilter<"WorkoutSession"> | string | null
    weather?: StringNullableWithAggregatesFilter<"WorkoutSession"> | string | null
    temperature?: FloatNullableWithAggregatesFilter<"WorkoutSession"> | number | null
  }

  export type UserSummaryWhereInput = {
    AND?: UserSummaryWhereInput | UserSummaryWhereInput[]
    OR?: UserSummaryWhereInput[]
    NOT?: UserSummaryWhereInput | UserSummaryWhereInput[]
    id?: StringFilter<"UserSummary"> | string
    createdAt?: DateTimeFilter<"UserSummary"> | Date | string
    updatedAt?: DateTimeFilter<"UserSummary"> | Date | string
    userId?: StringFilter<"UserSummary"> | string
    weekStart?: DateTimeFilter<"UserSummary"> | Date | string
    weekEnd?: DateTimeFilter<"UserSummary"> | Date | string
    totalWorkouts?: IntFilter<"UserSummary"> | number
    completedWorkouts?: IntFilter<"UserSummary"> | number
    totalVolume?: FloatFilter<"UserSummary"> | number
    averageSessionDuration?: IntFilter<"UserSummary"> | number
    averageFatigueLevel?: FloatFilter<"UserSummary"> | number
    fatigueAssessmentCount?: IntFilter<"UserSummary"> | number
    personalRecordsSet?: IntFilter<"UserSummary"> | number
    newPersonalRecords?: StringNullableListFilter<"UserSummary">
    weeklyGoalCompletion?: IntFilter<"UserSummary"> | number
    consistencyScore?: IntFilter<"UserSummary"> | number
    lastUpdated?: DateTimeFilter<"UserSummary"> | Date | string
    dataVersion?: IntFilter<"UserSummary"> | number
  }

  export type UserSummaryOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    weekStart?: SortOrder
    weekEnd?: SortOrder
    totalWorkouts?: SortOrder
    completedWorkouts?: SortOrder
    totalVolume?: SortOrder
    averageSessionDuration?: SortOrder
    averageFatigueLevel?: SortOrder
    fatigueAssessmentCount?: SortOrder
    personalRecordsSet?: SortOrder
    newPersonalRecords?: SortOrder
    weeklyGoalCompletion?: SortOrder
    consistencyScore?: SortOrder
    lastUpdated?: SortOrder
    dataVersion?: SortOrder
  }

  export type UserSummaryWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    userId_weekStart?: UserSummaryUserIdWeekStartCompoundUniqueInput
    AND?: UserSummaryWhereInput | UserSummaryWhereInput[]
    OR?: UserSummaryWhereInput[]
    NOT?: UserSummaryWhereInput | UserSummaryWhereInput[]
    createdAt?: DateTimeFilter<"UserSummary"> | Date | string
    updatedAt?: DateTimeFilter<"UserSummary"> | Date | string
    userId?: StringFilter<"UserSummary"> | string
    weekStart?: DateTimeFilter<"UserSummary"> | Date | string
    weekEnd?: DateTimeFilter<"UserSummary"> | Date | string
    totalWorkouts?: IntFilter<"UserSummary"> | number
    completedWorkouts?: IntFilter<"UserSummary"> | number
    totalVolume?: FloatFilter<"UserSummary"> | number
    averageSessionDuration?: IntFilter<"UserSummary"> | number
    averageFatigueLevel?: FloatFilter<"UserSummary"> | number
    fatigueAssessmentCount?: IntFilter<"UserSummary"> | number
    personalRecordsSet?: IntFilter<"UserSummary"> | number
    newPersonalRecords?: StringNullableListFilter<"UserSummary">
    weeklyGoalCompletion?: IntFilter<"UserSummary"> | number
    consistencyScore?: IntFilter<"UserSummary"> | number
    lastUpdated?: DateTimeFilter<"UserSummary"> | Date | string
    dataVersion?: IntFilter<"UserSummary"> | number
  }, "id" | "userId_weekStart">

  export type UserSummaryOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    weekStart?: SortOrder
    weekEnd?: SortOrder
    totalWorkouts?: SortOrder
    completedWorkouts?: SortOrder
    totalVolume?: SortOrder
    averageSessionDuration?: SortOrder
    averageFatigueLevel?: SortOrder
    fatigueAssessmentCount?: SortOrder
    personalRecordsSet?: SortOrder
    newPersonalRecords?: SortOrder
    weeklyGoalCompletion?: SortOrder
    consistencyScore?: SortOrder
    lastUpdated?: SortOrder
    dataVersion?: SortOrder
    _count?: UserSummaryCountOrderByAggregateInput
    _avg?: UserSummaryAvgOrderByAggregateInput
    _max?: UserSummaryMaxOrderByAggregateInput
    _min?: UserSummaryMinOrderByAggregateInput
    _sum?: UserSummarySumOrderByAggregateInput
  }

  export type UserSummaryScalarWhereWithAggregatesInput = {
    AND?: UserSummaryScalarWhereWithAggregatesInput | UserSummaryScalarWhereWithAggregatesInput[]
    OR?: UserSummaryScalarWhereWithAggregatesInput[]
    NOT?: UserSummaryScalarWhereWithAggregatesInput | UserSummaryScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"UserSummary"> | string
    createdAt?: DateTimeWithAggregatesFilter<"UserSummary"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"UserSummary"> | Date | string
    userId?: StringWithAggregatesFilter<"UserSummary"> | string
    weekStart?: DateTimeWithAggregatesFilter<"UserSummary"> | Date | string
    weekEnd?: DateTimeWithAggregatesFilter<"UserSummary"> | Date | string
    totalWorkouts?: IntWithAggregatesFilter<"UserSummary"> | number
    completedWorkouts?: IntWithAggregatesFilter<"UserSummary"> | number
    totalVolume?: FloatWithAggregatesFilter<"UserSummary"> | number
    averageSessionDuration?: IntWithAggregatesFilter<"UserSummary"> | number
    averageFatigueLevel?: FloatWithAggregatesFilter<"UserSummary"> | number
    fatigueAssessmentCount?: IntWithAggregatesFilter<"UserSummary"> | number
    personalRecordsSet?: IntWithAggregatesFilter<"UserSummary"> | number
    newPersonalRecords?: StringNullableListFilter<"UserSummary">
    weeklyGoalCompletion?: IntWithAggregatesFilter<"UserSummary"> | number
    consistencyScore?: IntWithAggregatesFilter<"UserSummary"> | number
    lastUpdated?: DateTimeWithAggregatesFilter<"UserSummary"> | Date | string
    dataVersion?: IntWithAggregatesFilter<"UserSummary"> | number
  }

  export type WorkoutExerciseWhereInput = {
    AND?: WorkoutExerciseWhereInput | WorkoutExerciseWhereInput[]
    OR?: WorkoutExerciseWhereInput[]
    NOT?: WorkoutExerciseWhereInput | WorkoutExerciseWhereInput[]
    id?: StringFilter<"WorkoutExercise"> | string
    createdAt?: DateTimeFilter<"WorkoutExercise"> | Date | string
    updatedAt?: DateTimeFilter<"WorkoutExercise"> | Date | string
    sessionId?: StringFilter<"WorkoutExercise"> | string
    exerciseId?: StringNullableFilter<"WorkoutExercise"> | string | null
    exerciseName?: StringFilter<"WorkoutExercise"> | string
    category?: StringFilter<"WorkoutExercise"> | string
    order?: IntFilter<"WorkoutExercise"> | number
    targetSets?: IntFilter<"WorkoutExercise"> | number
    targetReps?: IntFilter<"WorkoutExercise"> | number
    targetWeight?: FloatNullableFilter<"WorkoutExercise"> | number | null
    targetDuration?: IntNullableFilter<"WorkoutExercise"> | number | null
    targetRest?: IntNullableFilter<"WorkoutExercise"> | number | null
    actualSets?: IntFilter<"WorkoutExercise"> | number
    actualReps?: IntFilter<"WorkoutExercise"> | number
    actualWeight?: FloatNullableFilter<"WorkoutExercise"> | number | null
    actualDuration?: IntNullableFilter<"WorkoutExercise"> | number | null
    actualRest?: IntNullableFilter<"WorkoutExercise"> | number | null
    totalVolume?: FloatNullableFilter<"WorkoutExercise"> | number | null
    averageRPE?: FloatNullableFilter<"WorkoutExercise"> | number | null
    maxRPE?: IntNullableFilter<"WorkoutExercise"> | number | null
    minRPE?: IntNullableFilter<"WorkoutExercise"> | number | null
    isCompleted?: BoolFilter<"WorkoutExercise"> | boolean
    completedAt?: DateTimeNullableFilter<"WorkoutExercise"> | Date | string | null
    notes?: StringNullableFilter<"WorkoutExercise"> | string | null
    session?: XOR<WorkoutSessionRelationFilter, WorkoutSessionWhereInput>
    records?: WorkoutRecordListRelationFilter
  }

  export type WorkoutExerciseOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    sessionId?: SortOrder
    exerciseId?: SortOrderInput | SortOrder
    exerciseName?: SortOrder
    category?: SortOrder
    order?: SortOrder
    targetSets?: SortOrder
    targetReps?: SortOrder
    targetWeight?: SortOrderInput | SortOrder
    targetDuration?: SortOrderInput | SortOrder
    targetRest?: SortOrderInput | SortOrder
    actualSets?: SortOrder
    actualReps?: SortOrder
    actualWeight?: SortOrderInput | SortOrder
    actualDuration?: SortOrderInput | SortOrder
    actualRest?: SortOrderInput | SortOrder
    totalVolume?: SortOrderInput | SortOrder
    averageRPE?: SortOrderInput | SortOrder
    maxRPE?: SortOrderInput | SortOrder
    minRPE?: SortOrderInput | SortOrder
    isCompleted?: SortOrder
    completedAt?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    session?: WorkoutSessionOrderByWithRelationInput
    records?: WorkoutRecordOrderByRelationAggregateInput
  }

  export type WorkoutExerciseWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: WorkoutExerciseWhereInput | WorkoutExerciseWhereInput[]
    OR?: WorkoutExerciseWhereInput[]
    NOT?: WorkoutExerciseWhereInput | WorkoutExerciseWhereInput[]
    createdAt?: DateTimeFilter<"WorkoutExercise"> | Date | string
    updatedAt?: DateTimeFilter<"WorkoutExercise"> | Date | string
    sessionId?: StringFilter<"WorkoutExercise"> | string
    exerciseId?: StringNullableFilter<"WorkoutExercise"> | string | null
    exerciseName?: StringFilter<"WorkoutExercise"> | string
    category?: StringFilter<"WorkoutExercise"> | string
    order?: IntFilter<"WorkoutExercise"> | number
    targetSets?: IntFilter<"WorkoutExercise"> | number
    targetReps?: IntFilter<"WorkoutExercise"> | number
    targetWeight?: FloatNullableFilter<"WorkoutExercise"> | number | null
    targetDuration?: IntNullableFilter<"WorkoutExercise"> | number | null
    targetRest?: IntNullableFilter<"WorkoutExercise"> | number | null
    actualSets?: IntFilter<"WorkoutExercise"> | number
    actualReps?: IntFilter<"WorkoutExercise"> | number
    actualWeight?: FloatNullableFilter<"WorkoutExercise"> | number | null
    actualDuration?: IntNullableFilter<"WorkoutExercise"> | number | null
    actualRest?: IntNullableFilter<"WorkoutExercise"> | number | null
    totalVolume?: FloatNullableFilter<"WorkoutExercise"> | number | null
    averageRPE?: FloatNullableFilter<"WorkoutExercise"> | number | null
    maxRPE?: IntNullableFilter<"WorkoutExercise"> | number | null
    minRPE?: IntNullableFilter<"WorkoutExercise"> | number | null
    isCompleted?: BoolFilter<"WorkoutExercise"> | boolean
    completedAt?: DateTimeNullableFilter<"WorkoutExercise"> | Date | string | null
    notes?: StringNullableFilter<"WorkoutExercise"> | string | null
    session?: XOR<WorkoutSessionRelationFilter, WorkoutSessionWhereInput>
    records?: WorkoutRecordListRelationFilter
  }, "id">

  export type WorkoutExerciseOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    sessionId?: SortOrder
    exerciseId?: SortOrderInput | SortOrder
    exerciseName?: SortOrder
    category?: SortOrder
    order?: SortOrder
    targetSets?: SortOrder
    targetReps?: SortOrder
    targetWeight?: SortOrderInput | SortOrder
    targetDuration?: SortOrderInput | SortOrder
    targetRest?: SortOrderInput | SortOrder
    actualSets?: SortOrder
    actualReps?: SortOrder
    actualWeight?: SortOrderInput | SortOrder
    actualDuration?: SortOrderInput | SortOrder
    actualRest?: SortOrderInput | SortOrder
    totalVolume?: SortOrderInput | SortOrder
    averageRPE?: SortOrderInput | SortOrder
    maxRPE?: SortOrderInput | SortOrder
    minRPE?: SortOrderInput | SortOrder
    isCompleted?: SortOrder
    completedAt?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    _count?: WorkoutExerciseCountOrderByAggregateInput
    _avg?: WorkoutExerciseAvgOrderByAggregateInput
    _max?: WorkoutExerciseMaxOrderByAggregateInput
    _min?: WorkoutExerciseMinOrderByAggregateInput
    _sum?: WorkoutExerciseSumOrderByAggregateInput
  }

  export type WorkoutExerciseScalarWhereWithAggregatesInput = {
    AND?: WorkoutExerciseScalarWhereWithAggregatesInput | WorkoutExerciseScalarWhereWithAggregatesInput[]
    OR?: WorkoutExerciseScalarWhereWithAggregatesInput[]
    NOT?: WorkoutExerciseScalarWhereWithAggregatesInput | WorkoutExerciseScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"WorkoutExercise"> | string
    createdAt?: DateTimeWithAggregatesFilter<"WorkoutExercise"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"WorkoutExercise"> | Date | string
    sessionId?: StringWithAggregatesFilter<"WorkoutExercise"> | string
    exerciseId?: StringNullableWithAggregatesFilter<"WorkoutExercise"> | string | null
    exerciseName?: StringWithAggregatesFilter<"WorkoutExercise"> | string
    category?: StringWithAggregatesFilter<"WorkoutExercise"> | string
    order?: IntWithAggregatesFilter<"WorkoutExercise"> | number
    targetSets?: IntWithAggregatesFilter<"WorkoutExercise"> | number
    targetReps?: IntWithAggregatesFilter<"WorkoutExercise"> | number
    targetWeight?: FloatNullableWithAggregatesFilter<"WorkoutExercise"> | number | null
    targetDuration?: IntNullableWithAggregatesFilter<"WorkoutExercise"> | number | null
    targetRest?: IntNullableWithAggregatesFilter<"WorkoutExercise"> | number | null
    actualSets?: IntWithAggregatesFilter<"WorkoutExercise"> | number
    actualReps?: IntWithAggregatesFilter<"WorkoutExercise"> | number
    actualWeight?: FloatNullableWithAggregatesFilter<"WorkoutExercise"> | number | null
    actualDuration?: IntNullableWithAggregatesFilter<"WorkoutExercise"> | number | null
    actualRest?: IntNullableWithAggregatesFilter<"WorkoutExercise"> | number | null
    totalVolume?: FloatNullableWithAggregatesFilter<"WorkoutExercise"> | number | null
    averageRPE?: FloatNullableWithAggregatesFilter<"WorkoutExercise"> | number | null
    maxRPE?: IntNullableWithAggregatesFilter<"WorkoutExercise"> | number | null
    minRPE?: IntNullableWithAggregatesFilter<"WorkoutExercise"> | number | null
    isCompleted?: BoolWithAggregatesFilter<"WorkoutExercise"> | boolean
    completedAt?: DateTimeNullableWithAggregatesFilter<"WorkoutExercise"> | Date | string | null
    notes?: StringNullableWithAggregatesFilter<"WorkoutExercise"> | string | null
  }

  export type WorkoutRecordWhereInput = {
    AND?: WorkoutRecordWhereInput | WorkoutRecordWhereInput[]
    OR?: WorkoutRecordWhereInput[]
    NOT?: WorkoutRecordWhereInput | WorkoutRecordWhereInput[]
    id?: StringFilter<"WorkoutRecord"> | string
    createdAt?: DateTimeFilter<"WorkoutRecord"> | Date | string
    updatedAt?: DateTimeFilter<"WorkoutRecord"> | Date | string
    sessionId?: StringFilter<"WorkoutRecord"> | string
    exerciseId?: StringFilter<"WorkoutRecord"> | string
    setNumber?: IntFilter<"WorkoutRecord"> | number
    targetReps?: IntFilter<"WorkoutRecord"> | number
    actualReps?: IntFilter<"WorkoutRecord"> | number
    targetWeight?: FloatNullableFilter<"WorkoutRecord"> | number | null
    actualWeight?: FloatNullableFilter<"WorkoutRecord"> | number | null
    targetDuration?: IntNullableFilter<"WorkoutRecord"> | number | null
    actualDuration?: IntNullableFilter<"WorkoutRecord"> | number | null
    restTime?: IntNullableFilter<"WorkoutRecord"> | number | null
    rpe?: IntNullableFilter<"WorkoutRecord"> | number | null
    form?: IntNullableFilter<"WorkoutRecord"> | number | null
    difficulty?: IntNullableFilter<"WorkoutRecord"> | number | null
    startedAt?: DateTimeNullableFilter<"WorkoutRecord"> | Date | string | null
    completedAt?: DateTimeNullableFilter<"WorkoutRecord"> | Date | string | null
    isCompleted?: BoolFilter<"WorkoutRecord"> | boolean
    notes?: StringNullableFilter<"WorkoutRecord"> | string | null
    session?: XOR<WorkoutSessionRelationFilter, WorkoutSessionWhereInput>
    exercise?: XOR<WorkoutExerciseRelationFilter, WorkoutExerciseWhereInput>
  }

  export type WorkoutRecordOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    sessionId?: SortOrder
    exerciseId?: SortOrder
    setNumber?: SortOrder
    targetReps?: SortOrder
    actualReps?: SortOrder
    targetWeight?: SortOrderInput | SortOrder
    actualWeight?: SortOrderInput | SortOrder
    targetDuration?: SortOrderInput | SortOrder
    actualDuration?: SortOrderInput | SortOrder
    restTime?: SortOrderInput | SortOrder
    rpe?: SortOrderInput | SortOrder
    form?: SortOrderInput | SortOrder
    difficulty?: SortOrderInput | SortOrder
    startedAt?: SortOrderInput | SortOrder
    completedAt?: SortOrderInput | SortOrder
    isCompleted?: SortOrder
    notes?: SortOrderInput | SortOrder
    session?: WorkoutSessionOrderByWithRelationInput
    exercise?: WorkoutExerciseOrderByWithRelationInput
  }

  export type WorkoutRecordWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: WorkoutRecordWhereInput | WorkoutRecordWhereInput[]
    OR?: WorkoutRecordWhereInput[]
    NOT?: WorkoutRecordWhereInput | WorkoutRecordWhereInput[]
    createdAt?: DateTimeFilter<"WorkoutRecord"> | Date | string
    updatedAt?: DateTimeFilter<"WorkoutRecord"> | Date | string
    sessionId?: StringFilter<"WorkoutRecord"> | string
    exerciseId?: StringFilter<"WorkoutRecord"> | string
    setNumber?: IntFilter<"WorkoutRecord"> | number
    targetReps?: IntFilter<"WorkoutRecord"> | number
    actualReps?: IntFilter<"WorkoutRecord"> | number
    targetWeight?: FloatNullableFilter<"WorkoutRecord"> | number | null
    actualWeight?: FloatNullableFilter<"WorkoutRecord"> | number | null
    targetDuration?: IntNullableFilter<"WorkoutRecord"> | number | null
    actualDuration?: IntNullableFilter<"WorkoutRecord"> | number | null
    restTime?: IntNullableFilter<"WorkoutRecord"> | number | null
    rpe?: IntNullableFilter<"WorkoutRecord"> | number | null
    form?: IntNullableFilter<"WorkoutRecord"> | number | null
    difficulty?: IntNullableFilter<"WorkoutRecord"> | number | null
    startedAt?: DateTimeNullableFilter<"WorkoutRecord"> | Date | string | null
    completedAt?: DateTimeNullableFilter<"WorkoutRecord"> | Date | string | null
    isCompleted?: BoolFilter<"WorkoutRecord"> | boolean
    notes?: StringNullableFilter<"WorkoutRecord"> | string | null
    session?: XOR<WorkoutSessionRelationFilter, WorkoutSessionWhereInput>
    exercise?: XOR<WorkoutExerciseRelationFilter, WorkoutExerciseWhereInput>
  }, "id">

  export type WorkoutRecordOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    sessionId?: SortOrder
    exerciseId?: SortOrder
    setNumber?: SortOrder
    targetReps?: SortOrder
    actualReps?: SortOrder
    targetWeight?: SortOrderInput | SortOrder
    actualWeight?: SortOrderInput | SortOrder
    targetDuration?: SortOrderInput | SortOrder
    actualDuration?: SortOrderInput | SortOrder
    restTime?: SortOrderInput | SortOrder
    rpe?: SortOrderInput | SortOrder
    form?: SortOrderInput | SortOrder
    difficulty?: SortOrderInput | SortOrder
    startedAt?: SortOrderInput | SortOrder
    completedAt?: SortOrderInput | SortOrder
    isCompleted?: SortOrder
    notes?: SortOrderInput | SortOrder
    _count?: WorkoutRecordCountOrderByAggregateInput
    _avg?: WorkoutRecordAvgOrderByAggregateInput
    _max?: WorkoutRecordMaxOrderByAggregateInput
    _min?: WorkoutRecordMinOrderByAggregateInput
    _sum?: WorkoutRecordSumOrderByAggregateInput
  }

  export type WorkoutRecordScalarWhereWithAggregatesInput = {
    AND?: WorkoutRecordScalarWhereWithAggregatesInput | WorkoutRecordScalarWhereWithAggregatesInput[]
    OR?: WorkoutRecordScalarWhereWithAggregatesInput[]
    NOT?: WorkoutRecordScalarWhereWithAggregatesInput | WorkoutRecordScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"WorkoutRecord"> | string
    createdAt?: DateTimeWithAggregatesFilter<"WorkoutRecord"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"WorkoutRecord"> | Date | string
    sessionId?: StringWithAggregatesFilter<"WorkoutRecord"> | string
    exerciseId?: StringWithAggregatesFilter<"WorkoutRecord"> | string
    setNumber?: IntWithAggregatesFilter<"WorkoutRecord"> | number
    targetReps?: IntWithAggregatesFilter<"WorkoutRecord"> | number
    actualReps?: IntWithAggregatesFilter<"WorkoutRecord"> | number
    targetWeight?: FloatNullableWithAggregatesFilter<"WorkoutRecord"> | number | null
    actualWeight?: FloatNullableWithAggregatesFilter<"WorkoutRecord"> | number | null
    targetDuration?: IntNullableWithAggregatesFilter<"WorkoutRecord"> | number | null
    actualDuration?: IntNullableWithAggregatesFilter<"WorkoutRecord"> | number | null
    restTime?: IntNullableWithAggregatesFilter<"WorkoutRecord"> | number | null
    rpe?: IntNullableWithAggregatesFilter<"WorkoutRecord"> | number | null
    form?: IntNullableWithAggregatesFilter<"WorkoutRecord"> | number | null
    difficulty?: IntNullableWithAggregatesFilter<"WorkoutRecord"> | number | null
    startedAt?: DateTimeNullableWithAggregatesFilter<"WorkoutRecord"> | Date | string | null
    completedAt?: DateTimeNullableWithAggregatesFilter<"WorkoutRecord"> | Date | string | null
    isCompleted?: BoolWithAggregatesFilter<"WorkoutRecord"> | boolean
    notes?: StringNullableWithAggregatesFilter<"WorkoutRecord"> | string | null
  }

  export type PersonalRecordWhereInput = {
    AND?: PersonalRecordWhereInput | PersonalRecordWhereInput[]
    OR?: PersonalRecordWhereInput[]
    NOT?: PersonalRecordWhereInput | PersonalRecordWhereInput[]
    id?: StringFilter<"PersonalRecord"> | string
    createdAt?: DateTimeFilter<"PersonalRecord"> | Date | string
    updatedAt?: DateTimeFilter<"PersonalRecord"> | Date | string
    userId?: StringFilter<"PersonalRecord"> | string
    exerciseId?: StringNullableFilter<"PersonalRecord"> | string | null
    exerciseName?: StringFilter<"PersonalRecord"> | string
    recordType?: StringFilter<"PersonalRecord"> | string
    value?: FloatFilter<"PersonalRecord"> | number
    unit?: StringFilter<"PersonalRecord"> | string
    sessionId?: StringNullableFilter<"PersonalRecord"> | string | null
    setNumber?: IntNullableFilter<"PersonalRecord"> | number | null
    notes?: StringNullableFilter<"PersonalRecord"> | string | null
    isVerified?: BoolFilter<"PersonalRecord"> | boolean
    verifiedAt?: DateTimeNullableFilter<"PersonalRecord"> | Date | string | null
  }

  export type PersonalRecordOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    exerciseId?: SortOrderInput | SortOrder
    exerciseName?: SortOrder
    recordType?: SortOrder
    value?: SortOrder
    unit?: SortOrder
    sessionId?: SortOrderInput | SortOrder
    setNumber?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    isVerified?: SortOrder
    verifiedAt?: SortOrderInput | SortOrder
  }

  export type PersonalRecordWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    userId_exerciseId_recordType?: PersonalRecordUserIdExerciseIdRecordTypeCompoundUniqueInput
    AND?: PersonalRecordWhereInput | PersonalRecordWhereInput[]
    OR?: PersonalRecordWhereInput[]
    NOT?: PersonalRecordWhereInput | PersonalRecordWhereInput[]
    createdAt?: DateTimeFilter<"PersonalRecord"> | Date | string
    updatedAt?: DateTimeFilter<"PersonalRecord"> | Date | string
    userId?: StringFilter<"PersonalRecord"> | string
    exerciseId?: StringNullableFilter<"PersonalRecord"> | string | null
    exerciseName?: StringFilter<"PersonalRecord"> | string
    recordType?: StringFilter<"PersonalRecord"> | string
    value?: FloatFilter<"PersonalRecord"> | number
    unit?: StringFilter<"PersonalRecord"> | string
    sessionId?: StringNullableFilter<"PersonalRecord"> | string | null
    setNumber?: IntNullableFilter<"PersonalRecord"> | number | null
    notes?: StringNullableFilter<"PersonalRecord"> | string | null
    isVerified?: BoolFilter<"PersonalRecord"> | boolean
    verifiedAt?: DateTimeNullableFilter<"PersonalRecord"> | Date | string | null
  }, "id" | "userId_exerciseId_recordType">

  export type PersonalRecordOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    exerciseId?: SortOrderInput | SortOrder
    exerciseName?: SortOrder
    recordType?: SortOrder
    value?: SortOrder
    unit?: SortOrder
    sessionId?: SortOrderInput | SortOrder
    setNumber?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    isVerified?: SortOrder
    verifiedAt?: SortOrderInput | SortOrder
    _count?: PersonalRecordCountOrderByAggregateInput
    _avg?: PersonalRecordAvgOrderByAggregateInput
    _max?: PersonalRecordMaxOrderByAggregateInput
    _min?: PersonalRecordMinOrderByAggregateInput
    _sum?: PersonalRecordSumOrderByAggregateInput
  }

  export type PersonalRecordScalarWhereWithAggregatesInput = {
    AND?: PersonalRecordScalarWhereWithAggregatesInput | PersonalRecordScalarWhereWithAggregatesInput[]
    OR?: PersonalRecordScalarWhereWithAggregatesInput[]
    NOT?: PersonalRecordScalarWhereWithAggregatesInput | PersonalRecordScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PersonalRecord"> | string
    createdAt?: DateTimeWithAggregatesFilter<"PersonalRecord"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"PersonalRecord"> | Date | string
    userId?: StringWithAggregatesFilter<"PersonalRecord"> | string
    exerciseId?: StringNullableWithAggregatesFilter<"PersonalRecord"> | string | null
    exerciseName?: StringWithAggregatesFilter<"PersonalRecord"> | string
    recordType?: StringWithAggregatesFilter<"PersonalRecord"> | string
    value?: FloatWithAggregatesFilter<"PersonalRecord"> | number
    unit?: StringWithAggregatesFilter<"PersonalRecord"> | string
    sessionId?: StringNullableWithAggregatesFilter<"PersonalRecord"> | string | null
    setNumber?: IntNullableWithAggregatesFilter<"PersonalRecord"> | number | null
    notes?: StringNullableWithAggregatesFilter<"PersonalRecord"> | string | null
    isVerified?: BoolWithAggregatesFilter<"PersonalRecord"> | boolean
    verifiedAt?: DateTimeNullableWithAggregatesFilter<"PersonalRecord"> | Date | string | null
  }

  export type WorkoutTemplateWhereInput = {
    AND?: WorkoutTemplateWhereInput | WorkoutTemplateWhereInput[]
    OR?: WorkoutTemplateWhereInput[]
    NOT?: WorkoutTemplateWhereInput | WorkoutTemplateWhereInput[]
    id?: StringFilter<"WorkoutTemplate"> | string
    createdAt?: DateTimeFilter<"WorkoutTemplate"> | Date | string
    updatedAt?: DateTimeFilter<"WorkoutTemplate"> | Date | string
    userId?: StringFilter<"WorkoutTemplate"> | string
    name?: StringFilter<"WorkoutTemplate"> | string
    description?: StringNullableFilter<"WorkoutTemplate"> | string | null
    exercises?: JsonFilter<"WorkoutTemplate">
    isPublic?: BoolFilter<"WorkoutTemplate"> | boolean
    tags?: StringNullableListFilter<"WorkoutTemplate">
    difficulty?: IntNullableFilter<"WorkoutTemplate"> | number | null
    useCount?: IntFilter<"WorkoutTemplate"> | number
    lastUsed?: DateTimeNullableFilter<"WorkoutTemplate"> | Date | string | null
  }

  export type WorkoutTemplateOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    exercises?: SortOrder
    isPublic?: SortOrder
    tags?: SortOrder
    difficulty?: SortOrderInput | SortOrder
    useCount?: SortOrder
    lastUsed?: SortOrderInput | SortOrder
  }

  export type WorkoutTemplateWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: WorkoutTemplateWhereInput | WorkoutTemplateWhereInput[]
    OR?: WorkoutTemplateWhereInput[]
    NOT?: WorkoutTemplateWhereInput | WorkoutTemplateWhereInput[]
    createdAt?: DateTimeFilter<"WorkoutTemplate"> | Date | string
    updatedAt?: DateTimeFilter<"WorkoutTemplate"> | Date | string
    userId?: StringFilter<"WorkoutTemplate"> | string
    name?: StringFilter<"WorkoutTemplate"> | string
    description?: StringNullableFilter<"WorkoutTemplate"> | string | null
    exercises?: JsonFilter<"WorkoutTemplate">
    isPublic?: BoolFilter<"WorkoutTemplate"> | boolean
    tags?: StringNullableListFilter<"WorkoutTemplate">
    difficulty?: IntNullableFilter<"WorkoutTemplate"> | number | null
    useCount?: IntFilter<"WorkoutTemplate"> | number
    lastUsed?: DateTimeNullableFilter<"WorkoutTemplate"> | Date | string | null
  }, "id">

  export type WorkoutTemplateOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    exercises?: SortOrder
    isPublic?: SortOrder
    tags?: SortOrder
    difficulty?: SortOrderInput | SortOrder
    useCount?: SortOrder
    lastUsed?: SortOrderInput | SortOrder
    _count?: WorkoutTemplateCountOrderByAggregateInput
    _avg?: WorkoutTemplateAvgOrderByAggregateInput
    _max?: WorkoutTemplateMaxOrderByAggregateInput
    _min?: WorkoutTemplateMinOrderByAggregateInput
    _sum?: WorkoutTemplateSumOrderByAggregateInput
  }

  export type WorkoutTemplateScalarWhereWithAggregatesInput = {
    AND?: WorkoutTemplateScalarWhereWithAggregatesInput | WorkoutTemplateScalarWhereWithAggregatesInput[]
    OR?: WorkoutTemplateScalarWhereWithAggregatesInput[]
    NOT?: WorkoutTemplateScalarWhereWithAggregatesInput | WorkoutTemplateScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"WorkoutTemplate"> | string
    createdAt?: DateTimeWithAggregatesFilter<"WorkoutTemplate"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"WorkoutTemplate"> | Date | string
    userId?: StringWithAggregatesFilter<"WorkoutTemplate"> | string
    name?: StringWithAggregatesFilter<"WorkoutTemplate"> | string
    description?: StringNullableWithAggregatesFilter<"WorkoutTemplate"> | string | null
    exercises?: JsonWithAggregatesFilter<"WorkoutTemplate">
    isPublic?: BoolWithAggregatesFilter<"WorkoutTemplate"> | boolean
    tags?: StringNullableListFilter<"WorkoutTemplate">
    difficulty?: IntNullableWithAggregatesFilter<"WorkoutTemplate"> | number | null
    useCount?: IntWithAggregatesFilter<"WorkoutTemplate"> | number
    lastUsed?: DateTimeNullableWithAggregatesFilter<"WorkoutTemplate"> | Date | string | null
  }

  export type WorkoutGoalWhereInput = {
    AND?: WorkoutGoalWhereInput | WorkoutGoalWhereInput[]
    OR?: WorkoutGoalWhereInput[]
    NOT?: WorkoutGoalWhereInput | WorkoutGoalWhereInput[]
    id?: StringFilter<"WorkoutGoal"> | string
    createdAt?: DateTimeFilter<"WorkoutGoal"> | Date | string
    updatedAt?: DateTimeFilter<"WorkoutGoal"> | Date | string
    userId?: StringFilter<"WorkoutGoal"> | string
    exerciseId?: StringNullableFilter<"WorkoutGoal"> | string | null
    exerciseName?: StringFilter<"WorkoutGoal"> | string
    goalType?: StringFilter<"WorkoutGoal"> | string
    targetValue?: FloatFilter<"WorkoutGoal"> | number
    currentValue?: FloatFilter<"WorkoutGoal"> | number
    unit?: StringFilter<"WorkoutGoal"> | string
    startDate?: DateTimeFilter<"WorkoutGoal"> | Date | string
    targetDate?: DateTimeFilter<"WorkoutGoal"> | Date | string
    isAchieved?: BoolFilter<"WorkoutGoal"> | boolean
    achievedAt?: DateTimeNullableFilter<"WorkoutGoal"> | Date | string | null
    progress?: FloatFilter<"WorkoutGoal"> | number
    milestones?: JsonNullableFilter<"WorkoutGoal">
  }

  export type WorkoutGoalOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    exerciseId?: SortOrderInput | SortOrder
    exerciseName?: SortOrder
    goalType?: SortOrder
    targetValue?: SortOrder
    currentValue?: SortOrder
    unit?: SortOrder
    startDate?: SortOrder
    targetDate?: SortOrder
    isAchieved?: SortOrder
    achievedAt?: SortOrderInput | SortOrder
    progress?: SortOrder
    milestones?: SortOrderInput | SortOrder
  }

  export type WorkoutGoalWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: WorkoutGoalWhereInput | WorkoutGoalWhereInput[]
    OR?: WorkoutGoalWhereInput[]
    NOT?: WorkoutGoalWhereInput | WorkoutGoalWhereInput[]
    createdAt?: DateTimeFilter<"WorkoutGoal"> | Date | string
    updatedAt?: DateTimeFilter<"WorkoutGoal"> | Date | string
    userId?: StringFilter<"WorkoutGoal"> | string
    exerciseId?: StringNullableFilter<"WorkoutGoal"> | string | null
    exerciseName?: StringFilter<"WorkoutGoal"> | string
    goalType?: StringFilter<"WorkoutGoal"> | string
    targetValue?: FloatFilter<"WorkoutGoal"> | number
    currentValue?: FloatFilter<"WorkoutGoal"> | number
    unit?: StringFilter<"WorkoutGoal"> | string
    startDate?: DateTimeFilter<"WorkoutGoal"> | Date | string
    targetDate?: DateTimeFilter<"WorkoutGoal"> | Date | string
    isAchieved?: BoolFilter<"WorkoutGoal"> | boolean
    achievedAt?: DateTimeNullableFilter<"WorkoutGoal"> | Date | string | null
    progress?: FloatFilter<"WorkoutGoal"> | number
    milestones?: JsonNullableFilter<"WorkoutGoal">
  }, "id">

  export type WorkoutGoalOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    exerciseId?: SortOrderInput | SortOrder
    exerciseName?: SortOrder
    goalType?: SortOrder
    targetValue?: SortOrder
    currentValue?: SortOrder
    unit?: SortOrder
    startDate?: SortOrder
    targetDate?: SortOrder
    isAchieved?: SortOrder
    achievedAt?: SortOrderInput | SortOrder
    progress?: SortOrder
    milestones?: SortOrderInput | SortOrder
    _count?: WorkoutGoalCountOrderByAggregateInput
    _avg?: WorkoutGoalAvgOrderByAggregateInput
    _max?: WorkoutGoalMaxOrderByAggregateInput
    _min?: WorkoutGoalMinOrderByAggregateInput
    _sum?: WorkoutGoalSumOrderByAggregateInput
  }

  export type WorkoutGoalScalarWhereWithAggregatesInput = {
    AND?: WorkoutGoalScalarWhereWithAggregatesInput | WorkoutGoalScalarWhereWithAggregatesInput[]
    OR?: WorkoutGoalScalarWhereWithAggregatesInput[]
    NOT?: WorkoutGoalScalarWhereWithAggregatesInput | WorkoutGoalScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"WorkoutGoal"> | string
    createdAt?: DateTimeWithAggregatesFilter<"WorkoutGoal"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"WorkoutGoal"> | Date | string
    userId?: StringWithAggregatesFilter<"WorkoutGoal"> | string
    exerciseId?: StringNullableWithAggregatesFilter<"WorkoutGoal"> | string | null
    exerciseName?: StringWithAggregatesFilter<"WorkoutGoal"> | string
    goalType?: StringWithAggregatesFilter<"WorkoutGoal"> | string
    targetValue?: FloatWithAggregatesFilter<"WorkoutGoal"> | number
    currentValue?: FloatWithAggregatesFilter<"WorkoutGoal"> | number
    unit?: StringWithAggregatesFilter<"WorkoutGoal"> | string
    startDate?: DateTimeWithAggregatesFilter<"WorkoutGoal"> | Date | string
    targetDate?: DateTimeWithAggregatesFilter<"WorkoutGoal"> | Date | string
    isAchieved?: BoolWithAggregatesFilter<"WorkoutGoal"> | boolean
    achievedAt?: DateTimeNullableWithAggregatesFilter<"WorkoutGoal"> | Date | string | null
    progress?: FloatWithAggregatesFilter<"WorkoutGoal"> | number
    milestones?: JsonNullableWithAggregatesFilter<"WorkoutGoal">
  }

  export type WorkoutSessionCreateInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
    planId?: string | null
    sessionName?: string | null
    startedAt?: Date | string | null
    completedAt?: Date | string | null
    pausedAt?: Date | string | null
    totalDuration?: number | null
    status?: string
    isActive?: boolean
    notes?: string | null
    overallRating?: number | null
    difficulty?: number | null
    energy?: number | null
    motivation?: number | null
    location?: string | null
    weather?: string | null
    temperature?: number | null
    records?: WorkoutRecordCreateNestedManyWithoutSessionInput
    exercises?: WorkoutExerciseCreateNestedManyWithoutSessionInput
  }

  export type WorkoutSessionUncheckedCreateInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
    planId?: string | null
    sessionName?: string | null
    startedAt?: Date | string | null
    completedAt?: Date | string | null
    pausedAt?: Date | string | null
    totalDuration?: number | null
    status?: string
    isActive?: boolean
    notes?: string | null
    overallRating?: number | null
    difficulty?: number | null
    energy?: number | null
    motivation?: number | null
    location?: string | null
    weather?: string | null
    temperature?: number | null
    records?: WorkoutRecordUncheckedCreateNestedManyWithoutSessionInput
    exercises?: WorkoutExerciseUncheckedCreateNestedManyWithoutSessionInput
  }

  export type WorkoutSessionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    planId?: NullableStringFieldUpdateOperationsInput | string | null
    sessionName?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    pausedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalDuration?: NullableIntFieldUpdateOperationsInput | number | null
    status?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    overallRating?: NullableIntFieldUpdateOperationsInput | number | null
    difficulty?: NullableIntFieldUpdateOperationsInput | number | null
    energy?: NullableIntFieldUpdateOperationsInput | number | null
    motivation?: NullableIntFieldUpdateOperationsInput | number | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    weather?: NullableStringFieldUpdateOperationsInput | string | null
    temperature?: NullableFloatFieldUpdateOperationsInput | number | null
    records?: WorkoutRecordUpdateManyWithoutSessionNestedInput
    exercises?: WorkoutExerciseUpdateManyWithoutSessionNestedInput
  }

  export type WorkoutSessionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    planId?: NullableStringFieldUpdateOperationsInput | string | null
    sessionName?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    pausedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalDuration?: NullableIntFieldUpdateOperationsInput | number | null
    status?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    overallRating?: NullableIntFieldUpdateOperationsInput | number | null
    difficulty?: NullableIntFieldUpdateOperationsInput | number | null
    energy?: NullableIntFieldUpdateOperationsInput | number | null
    motivation?: NullableIntFieldUpdateOperationsInput | number | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    weather?: NullableStringFieldUpdateOperationsInput | string | null
    temperature?: NullableFloatFieldUpdateOperationsInput | number | null
    records?: WorkoutRecordUncheckedUpdateManyWithoutSessionNestedInput
    exercises?: WorkoutExerciseUncheckedUpdateManyWithoutSessionNestedInput
  }

  export type WorkoutSessionCreateManyInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
    planId?: string | null
    sessionName?: string | null
    startedAt?: Date | string | null
    completedAt?: Date | string | null
    pausedAt?: Date | string | null
    totalDuration?: number | null
    status?: string
    isActive?: boolean
    notes?: string | null
    overallRating?: number | null
    difficulty?: number | null
    energy?: number | null
    motivation?: number | null
    location?: string | null
    weather?: string | null
    temperature?: number | null
  }

  export type WorkoutSessionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    planId?: NullableStringFieldUpdateOperationsInput | string | null
    sessionName?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    pausedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalDuration?: NullableIntFieldUpdateOperationsInput | number | null
    status?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    overallRating?: NullableIntFieldUpdateOperationsInput | number | null
    difficulty?: NullableIntFieldUpdateOperationsInput | number | null
    energy?: NullableIntFieldUpdateOperationsInput | number | null
    motivation?: NullableIntFieldUpdateOperationsInput | number | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    weather?: NullableStringFieldUpdateOperationsInput | string | null
    temperature?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type WorkoutSessionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    planId?: NullableStringFieldUpdateOperationsInput | string | null
    sessionName?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    pausedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalDuration?: NullableIntFieldUpdateOperationsInput | number | null
    status?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    overallRating?: NullableIntFieldUpdateOperationsInput | number | null
    difficulty?: NullableIntFieldUpdateOperationsInput | number | null
    energy?: NullableIntFieldUpdateOperationsInput | number | null
    motivation?: NullableIntFieldUpdateOperationsInput | number | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    weather?: NullableStringFieldUpdateOperationsInput | string | null
    temperature?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type UserSummaryCreateInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
    weekStart: Date | string
    weekEnd: Date | string
    totalWorkouts: number
    completedWorkouts: number
    totalVolume: number
    averageSessionDuration: number
    averageFatigueLevel: number
    fatigueAssessmentCount: number
    personalRecordsSet: number
    newPersonalRecords?: UserSummaryCreatenewPersonalRecordsInput | string[]
    weeklyGoalCompletion: number
    consistencyScore: number
    lastUpdated: Date | string
    dataVersion?: number
  }

  export type UserSummaryUncheckedCreateInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
    weekStart: Date | string
    weekEnd: Date | string
    totalWorkouts: number
    completedWorkouts: number
    totalVolume: number
    averageSessionDuration: number
    averageFatigueLevel: number
    fatigueAssessmentCount: number
    personalRecordsSet: number
    newPersonalRecords?: UserSummaryCreatenewPersonalRecordsInput | string[]
    weeklyGoalCompletion: number
    consistencyScore: number
    lastUpdated: Date | string
    dataVersion?: number
  }

  export type UserSummaryUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    weekStart?: DateTimeFieldUpdateOperationsInput | Date | string
    weekEnd?: DateTimeFieldUpdateOperationsInput | Date | string
    totalWorkouts?: IntFieldUpdateOperationsInput | number
    completedWorkouts?: IntFieldUpdateOperationsInput | number
    totalVolume?: FloatFieldUpdateOperationsInput | number
    averageSessionDuration?: IntFieldUpdateOperationsInput | number
    averageFatigueLevel?: FloatFieldUpdateOperationsInput | number
    fatigueAssessmentCount?: IntFieldUpdateOperationsInput | number
    personalRecordsSet?: IntFieldUpdateOperationsInput | number
    newPersonalRecords?: UserSummaryUpdatenewPersonalRecordsInput | string[]
    weeklyGoalCompletion?: IntFieldUpdateOperationsInput | number
    consistencyScore?: IntFieldUpdateOperationsInput | number
    lastUpdated?: DateTimeFieldUpdateOperationsInput | Date | string
    dataVersion?: IntFieldUpdateOperationsInput | number
  }

  export type UserSummaryUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    weekStart?: DateTimeFieldUpdateOperationsInput | Date | string
    weekEnd?: DateTimeFieldUpdateOperationsInput | Date | string
    totalWorkouts?: IntFieldUpdateOperationsInput | number
    completedWorkouts?: IntFieldUpdateOperationsInput | number
    totalVolume?: FloatFieldUpdateOperationsInput | number
    averageSessionDuration?: IntFieldUpdateOperationsInput | number
    averageFatigueLevel?: FloatFieldUpdateOperationsInput | number
    fatigueAssessmentCount?: IntFieldUpdateOperationsInput | number
    personalRecordsSet?: IntFieldUpdateOperationsInput | number
    newPersonalRecords?: UserSummaryUpdatenewPersonalRecordsInput | string[]
    weeklyGoalCompletion?: IntFieldUpdateOperationsInput | number
    consistencyScore?: IntFieldUpdateOperationsInput | number
    lastUpdated?: DateTimeFieldUpdateOperationsInput | Date | string
    dataVersion?: IntFieldUpdateOperationsInput | number
  }

  export type UserSummaryCreateManyInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
    weekStart: Date | string
    weekEnd: Date | string
    totalWorkouts: number
    completedWorkouts: number
    totalVolume: number
    averageSessionDuration: number
    averageFatigueLevel: number
    fatigueAssessmentCount: number
    personalRecordsSet: number
    newPersonalRecords?: UserSummaryCreatenewPersonalRecordsInput | string[]
    weeklyGoalCompletion: number
    consistencyScore: number
    lastUpdated: Date | string
    dataVersion?: number
  }

  export type UserSummaryUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    weekStart?: DateTimeFieldUpdateOperationsInput | Date | string
    weekEnd?: DateTimeFieldUpdateOperationsInput | Date | string
    totalWorkouts?: IntFieldUpdateOperationsInput | number
    completedWorkouts?: IntFieldUpdateOperationsInput | number
    totalVolume?: FloatFieldUpdateOperationsInput | number
    averageSessionDuration?: IntFieldUpdateOperationsInput | number
    averageFatigueLevel?: FloatFieldUpdateOperationsInput | number
    fatigueAssessmentCount?: IntFieldUpdateOperationsInput | number
    personalRecordsSet?: IntFieldUpdateOperationsInput | number
    newPersonalRecords?: UserSummaryUpdatenewPersonalRecordsInput | string[]
    weeklyGoalCompletion?: IntFieldUpdateOperationsInput | number
    consistencyScore?: IntFieldUpdateOperationsInput | number
    lastUpdated?: DateTimeFieldUpdateOperationsInput | Date | string
    dataVersion?: IntFieldUpdateOperationsInput | number
  }

  export type UserSummaryUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    weekStart?: DateTimeFieldUpdateOperationsInput | Date | string
    weekEnd?: DateTimeFieldUpdateOperationsInput | Date | string
    totalWorkouts?: IntFieldUpdateOperationsInput | number
    completedWorkouts?: IntFieldUpdateOperationsInput | number
    totalVolume?: FloatFieldUpdateOperationsInput | number
    averageSessionDuration?: IntFieldUpdateOperationsInput | number
    averageFatigueLevel?: FloatFieldUpdateOperationsInput | number
    fatigueAssessmentCount?: IntFieldUpdateOperationsInput | number
    personalRecordsSet?: IntFieldUpdateOperationsInput | number
    newPersonalRecords?: UserSummaryUpdatenewPersonalRecordsInput | string[]
    weeklyGoalCompletion?: IntFieldUpdateOperationsInput | number
    consistencyScore?: IntFieldUpdateOperationsInput | number
    lastUpdated?: DateTimeFieldUpdateOperationsInput | Date | string
    dataVersion?: IntFieldUpdateOperationsInput | number
  }

  export type WorkoutExerciseCreateInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    exerciseId?: string | null
    exerciseName: string
    category: string
    order: number
    targetSets: number
    targetReps: number
    targetWeight?: number | null
    targetDuration?: number | null
    targetRest?: number | null
    actualSets?: number
    actualReps?: number
    actualWeight?: number | null
    actualDuration?: number | null
    actualRest?: number | null
    totalVolume?: number | null
    averageRPE?: number | null
    maxRPE?: number | null
    minRPE?: number | null
    isCompleted?: boolean
    completedAt?: Date | string | null
    notes?: string | null
    session: WorkoutSessionCreateNestedOneWithoutExercisesInput
    records?: WorkoutRecordCreateNestedManyWithoutExerciseInput
  }

  export type WorkoutExerciseUncheckedCreateInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    sessionId: string
    exerciseId?: string | null
    exerciseName: string
    category: string
    order: number
    targetSets: number
    targetReps: number
    targetWeight?: number | null
    targetDuration?: number | null
    targetRest?: number | null
    actualSets?: number
    actualReps?: number
    actualWeight?: number | null
    actualDuration?: number | null
    actualRest?: number | null
    totalVolume?: number | null
    averageRPE?: number | null
    maxRPE?: number | null
    minRPE?: number | null
    isCompleted?: boolean
    completedAt?: Date | string | null
    notes?: string | null
    records?: WorkoutRecordUncheckedCreateNestedManyWithoutExerciseInput
  }

  export type WorkoutExerciseUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    exerciseId?: NullableStringFieldUpdateOperationsInput | string | null
    exerciseName?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    targetSets?: IntFieldUpdateOperationsInput | number
    targetReps?: IntFieldUpdateOperationsInput | number
    targetWeight?: NullableFloatFieldUpdateOperationsInput | number | null
    targetDuration?: NullableIntFieldUpdateOperationsInput | number | null
    targetRest?: NullableIntFieldUpdateOperationsInput | number | null
    actualSets?: IntFieldUpdateOperationsInput | number
    actualReps?: IntFieldUpdateOperationsInput | number
    actualWeight?: NullableFloatFieldUpdateOperationsInput | number | null
    actualDuration?: NullableIntFieldUpdateOperationsInput | number | null
    actualRest?: NullableIntFieldUpdateOperationsInput | number | null
    totalVolume?: NullableFloatFieldUpdateOperationsInput | number | null
    averageRPE?: NullableFloatFieldUpdateOperationsInput | number | null
    maxRPE?: NullableIntFieldUpdateOperationsInput | number | null
    minRPE?: NullableIntFieldUpdateOperationsInput | number | null
    isCompleted?: BoolFieldUpdateOperationsInput | boolean
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    session?: WorkoutSessionUpdateOneRequiredWithoutExercisesNestedInput
    records?: WorkoutRecordUpdateManyWithoutExerciseNestedInput
  }

  export type WorkoutExerciseUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sessionId?: StringFieldUpdateOperationsInput | string
    exerciseId?: NullableStringFieldUpdateOperationsInput | string | null
    exerciseName?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    targetSets?: IntFieldUpdateOperationsInput | number
    targetReps?: IntFieldUpdateOperationsInput | number
    targetWeight?: NullableFloatFieldUpdateOperationsInput | number | null
    targetDuration?: NullableIntFieldUpdateOperationsInput | number | null
    targetRest?: NullableIntFieldUpdateOperationsInput | number | null
    actualSets?: IntFieldUpdateOperationsInput | number
    actualReps?: IntFieldUpdateOperationsInput | number
    actualWeight?: NullableFloatFieldUpdateOperationsInput | number | null
    actualDuration?: NullableIntFieldUpdateOperationsInput | number | null
    actualRest?: NullableIntFieldUpdateOperationsInput | number | null
    totalVolume?: NullableFloatFieldUpdateOperationsInput | number | null
    averageRPE?: NullableFloatFieldUpdateOperationsInput | number | null
    maxRPE?: NullableIntFieldUpdateOperationsInput | number | null
    minRPE?: NullableIntFieldUpdateOperationsInput | number | null
    isCompleted?: BoolFieldUpdateOperationsInput | boolean
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    records?: WorkoutRecordUncheckedUpdateManyWithoutExerciseNestedInput
  }

  export type WorkoutExerciseCreateManyInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    sessionId: string
    exerciseId?: string | null
    exerciseName: string
    category: string
    order: number
    targetSets: number
    targetReps: number
    targetWeight?: number | null
    targetDuration?: number | null
    targetRest?: number | null
    actualSets?: number
    actualReps?: number
    actualWeight?: number | null
    actualDuration?: number | null
    actualRest?: number | null
    totalVolume?: number | null
    averageRPE?: number | null
    maxRPE?: number | null
    minRPE?: number | null
    isCompleted?: boolean
    completedAt?: Date | string | null
    notes?: string | null
  }

  export type WorkoutExerciseUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    exerciseId?: NullableStringFieldUpdateOperationsInput | string | null
    exerciseName?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    targetSets?: IntFieldUpdateOperationsInput | number
    targetReps?: IntFieldUpdateOperationsInput | number
    targetWeight?: NullableFloatFieldUpdateOperationsInput | number | null
    targetDuration?: NullableIntFieldUpdateOperationsInput | number | null
    targetRest?: NullableIntFieldUpdateOperationsInput | number | null
    actualSets?: IntFieldUpdateOperationsInput | number
    actualReps?: IntFieldUpdateOperationsInput | number
    actualWeight?: NullableFloatFieldUpdateOperationsInput | number | null
    actualDuration?: NullableIntFieldUpdateOperationsInput | number | null
    actualRest?: NullableIntFieldUpdateOperationsInput | number | null
    totalVolume?: NullableFloatFieldUpdateOperationsInput | number | null
    averageRPE?: NullableFloatFieldUpdateOperationsInput | number | null
    maxRPE?: NullableIntFieldUpdateOperationsInput | number | null
    minRPE?: NullableIntFieldUpdateOperationsInput | number | null
    isCompleted?: BoolFieldUpdateOperationsInput | boolean
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type WorkoutExerciseUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sessionId?: StringFieldUpdateOperationsInput | string
    exerciseId?: NullableStringFieldUpdateOperationsInput | string | null
    exerciseName?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    targetSets?: IntFieldUpdateOperationsInput | number
    targetReps?: IntFieldUpdateOperationsInput | number
    targetWeight?: NullableFloatFieldUpdateOperationsInput | number | null
    targetDuration?: NullableIntFieldUpdateOperationsInput | number | null
    targetRest?: NullableIntFieldUpdateOperationsInput | number | null
    actualSets?: IntFieldUpdateOperationsInput | number
    actualReps?: IntFieldUpdateOperationsInput | number
    actualWeight?: NullableFloatFieldUpdateOperationsInput | number | null
    actualDuration?: NullableIntFieldUpdateOperationsInput | number | null
    actualRest?: NullableIntFieldUpdateOperationsInput | number | null
    totalVolume?: NullableFloatFieldUpdateOperationsInput | number | null
    averageRPE?: NullableFloatFieldUpdateOperationsInput | number | null
    maxRPE?: NullableIntFieldUpdateOperationsInput | number | null
    minRPE?: NullableIntFieldUpdateOperationsInput | number | null
    isCompleted?: BoolFieldUpdateOperationsInput | boolean
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type WorkoutRecordCreateInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    setNumber: number
    targetReps: number
    actualReps: number
    targetWeight?: number | null
    actualWeight?: number | null
    targetDuration?: number | null
    actualDuration?: number | null
    restTime?: number | null
    rpe?: number | null
    form?: number | null
    difficulty?: number | null
    startedAt?: Date | string | null
    completedAt?: Date | string | null
    isCompleted?: boolean
    notes?: string | null
    session: WorkoutSessionCreateNestedOneWithoutRecordsInput
    exercise: WorkoutExerciseCreateNestedOneWithoutRecordsInput
  }

  export type WorkoutRecordUncheckedCreateInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    sessionId: string
    exerciseId: string
    setNumber: number
    targetReps: number
    actualReps: number
    targetWeight?: number | null
    actualWeight?: number | null
    targetDuration?: number | null
    actualDuration?: number | null
    restTime?: number | null
    rpe?: number | null
    form?: number | null
    difficulty?: number | null
    startedAt?: Date | string | null
    completedAt?: Date | string | null
    isCompleted?: boolean
    notes?: string | null
  }

  export type WorkoutRecordUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    setNumber?: IntFieldUpdateOperationsInput | number
    targetReps?: IntFieldUpdateOperationsInput | number
    actualReps?: IntFieldUpdateOperationsInput | number
    targetWeight?: NullableFloatFieldUpdateOperationsInput | number | null
    actualWeight?: NullableFloatFieldUpdateOperationsInput | number | null
    targetDuration?: NullableIntFieldUpdateOperationsInput | number | null
    actualDuration?: NullableIntFieldUpdateOperationsInput | number | null
    restTime?: NullableIntFieldUpdateOperationsInput | number | null
    rpe?: NullableIntFieldUpdateOperationsInput | number | null
    form?: NullableIntFieldUpdateOperationsInput | number | null
    difficulty?: NullableIntFieldUpdateOperationsInput | number | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isCompleted?: BoolFieldUpdateOperationsInput | boolean
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    session?: WorkoutSessionUpdateOneRequiredWithoutRecordsNestedInput
    exercise?: WorkoutExerciseUpdateOneRequiredWithoutRecordsNestedInput
  }

  export type WorkoutRecordUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sessionId?: StringFieldUpdateOperationsInput | string
    exerciseId?: StringFieldUpdateOperationsInput | string
    setNumber?: IntFieldUpdateOperationsInput | number
    targetReps?: IntFieldUpdateOperationsInput | number
    actualReps?: IntFieldUpdateOperationsInput | number
    targetWeight?: NullableFloatFieldUpdateOperationsInput | number | null
    actualWeight?: NullableFloatFieldUpdateOperationsInput | number | null
    targetDuration?: NullableIntFieldUpdateOperationsInput | number | null
    actualDuration?: NullableIntFieldUpdateOperationsInput | number | null
    restTime?: NullableIntFieldUpdateOperationsInput | number | null
    rpe?: NullableIntFieldUpdateOperationsInput | number | null
    form?: NullableIntFieldUpdateOperationsInput | number | null
    difficulty?: NullableIntFieldUpdateOperationsInput | number | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isCompleted?: BoolFieldUpdateOperationsInput | boolean
    notes?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type WorkoutRecordCreateManyInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    sessionId: string
    exerciseId: string
    setNumber: number
    targetReps: number
    actualReps: number
    targetWeight?: number | null
    actualWeight?: number | null
    targetDuration?: number | null
    actualDuration?: number | null
    restTime?: number | null
    rpe?: number | null
    form?: number | null
    difficulty?: number | null
    startedAt?: Date | string | null
    completedAt?: Date | string | null
    isCompleted?: boolean
    notes?: string | null
  }

  export type WorkoutRecordUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    setNumber?: IntFieldUpdateOperationsInput | number
    targetReps?: IntFieldUpdateOperationsInput | number
    actualReps?: IntFieldUpdateOperationsInput | number
    targetWeight?: NullableFloatFieldUpdateOperationsInput | number | null
    actualWeight?: NullableFloatFieldUpdateOperationsInput | number | null
    targetDuration?: NullableIntFieldUpdateOperationsInput | number | null
    actualDuration?: NullableIntFieldUpdateOperationsInput | number | null
    restTime?: NullableIntFieldUpdateOperationsInput | number | null
    rpe?: NullableIntFieldUpdateOperationsInput | number | null
    form?: NullableIntFieldUpdateOperationsInput | number | null
    difficulty?: NullableIntFieldUpdateOperationsInput | number | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isCompleted?: BoolFieldUpdateOperationsInput | boolean
    notes?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type WorkoutRecordUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sessionId?: StringFieldUpdateOperationsInput | string
    exerciseId?: StringFieldUpdateOperationsInput | string
    setNumber?: IntFieldUpdateOperationsInput | number
    targetReps?: IntFieldUpdateOperationsInput | number
    actualReps?: IntFieldUpdateOperationsInput | number
    targetWeight?: NullableFloatFieldUpdateOperationsInput | number | null
    actualWeight?: NullableFloatFieldUpdateOperationsInput | number | null
    targetDuration?: NullableIntFieldUpdateOperationsInput | number | null
    actualDuration?: NullableIntFieldUpdateOperationsInput | number | null
    restTime?: NullableIntFieldUpdateOperationsInput | number | null
    rpe?: NullableIntFieldUpdateOperationsInput | number | null
    form?: NullableIntFieldUpdateOperationsInput | number | null
    difficulty?: NullableIntFieldUpdateOperationsInput | number | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isCompleted?: BoolFieldUpdateOperationsInput | boolean
    notes?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type PersonalRecordCreateInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
    exerciseId?: string | null
    exerciseName: string
    recordType: string
    value: number
    unit: string
    sessionId?: string | null
    setNumber?: number | null
    notes?: string | null
    isVerified?: boolean
    verifiedAt?: Date | string | null
  }

  export type PersonalRecordUncheckedCreateInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
    exerciseId?: string | null
    exerciseName: string
    recordType: string
    value: number
    unit: string
    sessionId?: string | null
    setNumber?: number | null
    notes?: string | null
    isVerified?: boolean
    verifiedAt?: Date | string | null
  }

  export type PersonalRecordUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    exerciseId?: NullableStringFieldUpdateOperationsInput | string | null
    exerciseName?: StringFieldUpdateOperationsInput | string
    recordType?: StringFieldUpdateOperationsInput | string
    value?: FloatFieldUpdateOperationsInput | number
    unit?: StringFieldUpdateOperationsInput | string
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    setNumber?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    verifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type PersonalRecordUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    exerciseId?: NullableStringFieldUpdateOperationsInput | string | null
    exerciseName?: StringFieldUpdateOperationsInput | string
    recordType?: StringFieldUpdateOperationsInput | string
    value?: FloatFieldUpdateOperationsInput | number
    unit?: StringFieldUpdateOperationsInput | string
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    setNumber?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    verifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type PersonalRecordCreateManyInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
    exerciseId?: string | null
    exerciseName: string
    recordType: string
    value: number
    unit: string
    sessionId?: string | null
    setNumber?: number | null
    notes?: string | null
    isVerified?: boolean
    verifiedAt?: Date | string | null
  }

  export type PersonalRecordUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    exerciseId?: NullableStringFieldUpdateOperationsInput | string | null
    exerciseName?: StringFieldUpdateOperationsInput | string
    recordType?: StringFieldUpdateOperationsInput | string
    value?: FloatFieldUpdateOperationsInput | number
    unit?: StringFieldUpdateOperationsInput | string
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    setNumber?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    verifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type PersonalRecordUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    exerciseId?: NullableStringFieldUpdateOperationsInput | string | null
    exerciseName?: StringFieldUpdateOperationsInput | string
    recordType?: StringFieldUpdateOperationsInput | string
    value?: FloatFieldUpdateOperationsInput | number
    unit?: StringFieldUpdateOperationsInput | string
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    setNumber?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    isVerified?: BoolFieldUpdateOperationsInput | boolean
    verifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type WorkoutTemplateCreateInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
    name: string
    description?: string | null
    exercises: JsonNullValueInput | InputJsonValue
    isPublic?: boolean
    tags?: WorkoutTemplateCreatetagsInput | string[]
    difficulty?: number | null
    useCount?: number
    lastUsed?: Date | string | null
  }

  export type WorkoutTemplateUncheckedCreateInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
    name: string
    description?: string | null
    exercises: JsonNullValueInput | InputJsonValue
    isPublic?: boolean
    tags?: WorkoutTemplateCreatetagsInput | string[]
    difficulty?: number | null
    useCount?: number
    lastUsed?: Date | string | null
  }

  export type WorkoutTemplateUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    exercises?: JsonNullValueInput | InputJsonValue
    isPublic?: BoolFieldUpdateOperationsInput | boolean
    tags?: WorkoutTemplateUpdatetagsInput | string[]
    difficulty?: NullableIntFieldUpdateOperationsInput | number | null
    useCount?: IntFieldUpdateOperationsInput | number
    lastUsed?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type WorkoutTemplateUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    exercises?: JsonNullValueInput | InputJsonValue
    isPublic?: BoolFieldUpdateOperationsInput | boolean
    tags?: WorkoutTemplateUpdatetagsInput | string[]
    difficulty?: NullableIntFieldUpdateOperationsInput | number | null
    useCount?: IntFieldUpdateOperationsInput | number
    lastUsed?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type WorkoutTemplateCreateManyInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
    name: string
    description?: string | null
    exercises: JsonNullValueInput | InputJsonValue
    isPublic?: boolean
    tags?: WorkoutTemplateCreatetagsInput | string[]
    difficulty?: number | null
    useCount?: number
    lastUsed?: Date | string | null
  }

  export type WorkoutTemplateUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    exercises?: JsonNullValueInput | InputJsonValue
    isPublic?: BoolFieldUpdateOperationsInput | boolean
    tags?: WorkoutTemplateUpdatetagsInput | string[]
    difficulty?: NullableIntFieldUpdateOperationsInput | number | null
    useCount?: IntFieldUpdateOperationsInput | number
    lastUsed?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type WorkoutTemplateUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    exercises?: JsonNullValueInput | InputJsonValue
    isPublic?: BoolFieldUpdateOperationsInput | boolean
    tags?: WorkoutTemplateUpdatetagsInput | string[]
    difficulty?: NullableIntFieldUpdateOperationsInput | number | null
    useCount?: IntFieldUpdateOperationsInput | number
    lastUsed?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type WorkoutGoalCreateInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
    exerciseId?: string | null
    exerciseName: string
    goalType: string
    targetValue: number
    currentValue?: number
    unit: string
    startDate: Date | string
    targetDate: Date | string
    isAchieved?: boolean
    achievedAt?: Date | string | null
    progress?: number
    milestones?: NullableJsonNullValueInput | InputJsonValue
  }

  export type WorkoutGoalUncheckedCreateInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
    exerciseId?: string | null
    exerciseName: string
    goalType: string
    targetValue: number
    currentValue?: number
    unit: string
    startDate: Date | string
    targetDate: Date | string
    isAchieved?: boolean
    achievedAt?: Date | string | null
    progress?: number
    milestones?: NullableJsonNullValueInput | InputJsonValue
  }

  export type WorkoutGoalUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    exerciseId?: NullableStringFieldUpdateOperationsInput | string | null
    exerciseName?: StringFieldUpdateOperationsInput | string
    goalType?: StringFieldUpdateOperationsInput | string
    targetValue?: FloatFieldUpdateOperationsInput | number
    currentValue?: FloatFieldUpdateOperationsInput | number
    unit?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    targetDate?: DateTimeFieldUpdateOperationsInput | Date | string
    isAchieved?: BoolFieldUpdateOperationsInput | boolean
    achievedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    progress?: FloatFieldUpdateOperationsInput | number
    milestones?: NullableJsonNullValueInput | InputJsonValue
  }

  export type WorkoutGoalUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    exerciseId?: NullableStringFieldUpdateOperationsInput | string | null
    exerciseName?: StringFieldUpdateOperationsInput | string
    goalType?: StringFieldUpdateOperationsInput | string
    targetValue?: FloatFieldUpdateOperationsInput | number
    currentValue?: FloatFieldUpdateOperationsInput | number
    unit?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    targetDate?: DateTimeFieldUpdateOperationsInput | Date | string
    isAchieved?: BoolFieldUpdateOperationsInput | boolean
    achievedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    progress?: FloatFieldUpdateOperationsInput | number
    milestones?: NullableJsonNullValueInput | InputJsonValue
  }

  export type WorkoutGoalCreateManyInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
    exerciseId?: string | null
    exerciseName: string
    goalType: string
    targetValue: number
    currentValue?: number
    unit: string
    startDate: Date | string
    targetDate: Date | string
    isAchieved?: boolean
    achievedAt?: Date | string | null
    progress?: number
    milestones?: NullableJsonNullValueInput | InputJsonValue
  }

  export type WorkoutGoalUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    exerciseId?: NullableStringFieldUpdateOperationsInput | string | null
    exerciseName?: StringFieldUpdateOperationsInput | string
    goalType?: StringFieldUpdateOperationsInput | string
    targetValue?: FloatFieldUpdateOperationsInput | number
    currentValue?: FloatFieldUpdateOperationsInput | number
    unit?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    targetDate?: DateTimeFieldUpdateOperationsInput | Date | string
    isAchieved?: BoolFieldUpdateOperationsInput | boolean
    achievedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    progress?: FloatFieldUpdateOperationsInput | number
    milestones?: NullableJsonNullValueInput | InputJsonValue
  }

  export type WorkoutGoalUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    exerciseId?: NullableStringFieldUpdateOperationsInput | string | null
    exerciseName?: StringFieldUpdateOperationsInput | string
    goalType?: StringFieldUpdateOperationsInput | string
    targetValue?: FloatFieldUpdateOperationsInput | number
    currentValue?: FloatFieldUpdateOperationsInput | number
    unit?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    targetDate?: DateTimeFieldUpdateOperationsInput | Date | string
    isAchieved?: BoolFieldUpdateOperationsInput | boolean
    achievedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    progress?: FloatFieldUpdateOperationsInput | number
    milestones?: NullableJsonNullValueInput | InputJsonValue
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

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type WorkoutRecordListRelationFilter = {
    every?: WorkoutRecordWhereInput
    some?: WorkoutRecordWhereInput
    none?: WorkoutRecordWhereInput
  }

  export type WorkoutExerciseListRelationFilter = {
    every?: WorkoutExerciseWhereInput
    some?: WorkoutExerciseWhereInput
    none?: WorkoutExerciseWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type WorkoutRecordOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type WorkoutExerciseOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type WorkoutSessionCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    planId?: SortOrder
    sessionName?: SortOrder
    startedAt?: SortOrder
    completedAt?: SortOrder
    pausedAt?: SortOrder
    totalDuration?: SortOrder
    status?: SortOrder
    isActive?: SortOrder
    notes?: SortOrder
    overallRating?: SortOrder
    difficulty?: SortOrder
    energy?: SortOrder
    motivation?: SortOrder
    location?: SortOrder
    weather?: SortOrder
    temperature?: SortOrder
  }

  export type WorkoutSessionAvgOrderByAggregateInput = {
    totalDuration?: SortOrder
    overallRating?: SortOrder
    difficulty?: SortOrder
    energy?: SortOrder
    motivation?: SortOrder
    temperature?: SortOrder
  }

  export type WorkoutSessionMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    planId?: SortOrder
    sessionName?: SortOrder
    startedAt?: SortOrder
    completedAt?: SortOrder
    pausedAt?: SortOrder
    totalDuration?: SortOrder
    status?: SortOrder
    isActive?: SortOrder
    notes?: SortOrder
    overallRating?: SortOrder
    difficulty?: SortOrder
    energy?: SortOrder
    motivation?: SortOrder
    location?: SortOrder
    weather?: SortOrder
    temperature?: SortOrder
  }

  export type WorkoutSessionMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    planId?: SortOrder
    sessionName?: SortOrder
    startedAt?: SortOrder
    completedAt?: SortOrder
    pausedAt?: SortOrder
    totalDuration?: SortOrder
    status?: SortOrder
    isActive?: SortOrder
    notes?: SortOrder
    overallRating?: SortOrder
    difficulty?: SortOrder
    energy?: SortOrder
    motivation?: SortOrder
    location?: SortOrder
    weather?: SortOrder
    temperature?: SortOrder
  }

  export type WorkoutSessionSumOrderByAggregateInput = {
    totalDuration?: SortOrder
    overallRating?: SortOrder
    difficulty?: SortOrder
    energy?: SortOrder
    motivation?: SortOrder
    temperature?: SortOrder
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

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
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

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type UserSummaryUserIdWeekStartCompoundUniqueInput = {
    userId: string
    weekStart: Date | string
  }

  export type UserSummaryCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    weekStart?: SortOrder
    weekEnd?: SortOrder
    totalWorkouts?: SortOrder
    completedWorkouts?: SortOrder
    totalVolume?: SortOrder
    averageSessionDuration?: SortOrder
    averageFatigueLevel?: SortOrder
    fatigueAssessmentCount?: SortOrder
    personalRecordsSet?: SortOrder
    newPersonalRecords?: SortOrder
    weeklyGoalCompletion?: SortOrder
    consistencyScore?: SortOrder
    lastUpdated?: SortOrder
    dataVersion?: SortOrder
  }

  export type UserSummaryAvgOrderByAggregateInput = {
    totalWorkouts?: SortOrder
    completedWorkouts?: SortOrder
    totalVolume?: SortOrder
    averageSessionDuration?: SortOrder
    averageFatigueLevel?: SortOrder
    fatigueAssessmentCount?: SortOrder
    personalRecordsSet?: SortOrder
    weeklyGoalCompletion?: SortOrder
    consistencyScore?: SortOrder
    dataVersion?: SortOrder
  }

  export type UserSummaryMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    weekStart?: SortOrder
    weekEnd?: SortOrder
    totalWorkouts?: SortOrder
    completedWorkouts?: SortOrder
    totalVolume?: SortOrder
    averageSessionDuration?: SortOrder
    averageFatigueLevel?: SortOrder
    fatigueAssessmentCount?: SortOrder
    personalRecordsSet?: SortOrder
    weeklyGoalCompletion?: SortOrder
    consistencyScore?: SortOrder
    lastUpdated?: SortOrder
    dataVersion?: SortOrder
  }

  export type UserSummaryMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    weekStart?: SortOrder
    weekEnd?: SortOrder
    totalWorkouts?: SortOrder
    completedWorkouts?: SortOrder
    totalVolume?: SortOrder
    averageSessionDuration?: SortOrder
    averageFatigueLevel?: SortOrder
    fatigueAssessmentCount?: SortOrder
    personalRecordsSet?: SortOrder
    weeklyGoalCompletion?: SortOrder
    consistencyScore?: SortOrder
    lastUpdated?: SortOrder
    dataVersion?: SortOrder
  }

  export type UserSummarySumOrderByAggregateInput = {
    totalWorkouts?: SortOrder
    completedWorkouts?: SortOrder
    totalVolume?: SortOrder
    averageSessionDuration?: SortOrder
    averageFatigueLevel?: SortOrder
    fatigueAssessmentCount?: SortOrder
    personalRecordsSet?: SortOrder
    weeklyGoalCompletion?: SortOrder
    consistencyScore?: SortOrder
    dataVersion?: SortOrder
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

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type WorkoutSessionRelationFilter = {
    is?: WorkoutSessionWhereInput
    isNot?: WorkoutSessionWhereInput
  }

  export type WorkoutExerciseCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    sessionId?: SortOrder
    exerciseId?: SortOrder
    exerciseName?: SortOrder
    category?: SortOrder
    order?: SortOrder
    targetSets?: SortOrder
    targetReps?: SortOrder
    targetWeight?: SortOrder
    targetDuration?: SortOrder
    targetRest?: SortOrder
    actualSets?: SortOrder
    actualReps?: SortOrder
    actualWeight?: SortOrder
    actualDuration?: SortOrder
    actualRest?: SortOrder
    totalVolume?: SortOrder
    averageRPE?: SortOrder
    maxRPE?: SortOrder
    minRPE?: SortOrder
    isCompleted?: SortOrder
    completedAt?: SortOrder
    notes?: SortOrder
  }

  export type WorkoutExerciseAvgOrderByAggregateInput = {
    order?: SortOrder
    targetSets?: SortOrder
    targetReps?: SortOrder
    targetWeight?: SortOrder
    targetDuration?: SortOrder
    targetRest?: SortOrder
    actualSets?: SortOrder
    actualReps?: SortOrder
    actualWeight?: SortOrder
    actualDuration?: SortOrder
    actualRest?: SortOrder
    totalVolume?: SortOrder
    averageRPE?: SortOrder
    maxRPE?: SortOrder
    minRPE?: SortOrder
  }

  export type WorkoutExerciseMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    sessionId?: SortOrder
    exerciseId?: SortOrder
    exerciseName?: SortOrder
    category?: SortOrder
    order?: SortOrder
    targetSets?: SortOrder
    targetReps?: SortOrder
    targetWeight?: SortOrder
    targetDuration?: SortOrder
    targetRest?: SortOrder
    actualSets?: SortOrder
    actualReps?: SortOrder
    actualWeight?: SortOrder
    actualDuration?: SortOrder
    actualRest?: SortOrder
    totalVolume?: SortOrder
    averageRPE?: SortOrder
    maxRPE?: SortOrder
    minRPE?: SortOrder
    isCompleted?: SortOrder
    completedAt?: SortOrder
    notes?: SortOrder
  }

  export type WorkoutExerciseMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    sessionId?: SortOrder
    exerciseId?: SortOrder
    exerciseName?: SortOrder
    category?: SortOrder
    order?: SortOrder
    targetSets?: SortOrder
    targetReps?: SortOrder
    targetWeight?: SortOrder
    targetDuration?: SortOrder
    targetRest?: SortOrder
    actualSets?: SortOrder
    actualReps?: SortOrder
    actualWeight?: SortOrder
    actualDuration?: SortOrder
    actualRest?: SortOrder
    totalVolume?: SortOrder
    averageRPE?: SortOrder
    maxRPE?: SortOrder
    minRPE?: SortOrder
    isCompleted?: SortOrder
    completedAt?: SortOrder
    notes?: SortOrder
  }

  export type WorkoutExerciseSumOrderByAggregateInput = {
    order?: SortOrder
    targetSets?: SortOrder
    targetReps?: SortOrder
    targetWeight?: SortOrder
    targetDuration?: SortOrder
    targetRest?: SortOrder
    actualSets?: SortOrder
    actualReps?: SortOrder
    actualWeight?: SortOrder
    actualDuration?: SortOrder
    actualRest?: SortOrder
    totalVolume?: SortOrder
    averageRPE?: SortOrder
    maxRPE?: SortOrder
    minRPE?: SortOrder
  }

  export type WorkoutExerciseRelationFilter = {
    is?: WorkoutExerciseWhereInput
    isNot?: WorkoutExerciseWhereInput
  }

  export type WorkoutRecordCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    sessionId?: SortOrder
    exerciseId?: SortOrder
    setNumber?: SortOrder
    targetReps?: SortOrder
    actualReps?: SortOrder
    targetWeight?: SortOrder
    actualWeight?: SortOrder
    targetDuration?: SortOrder
    actualDuration?: SortOrder
    restTime?: SortOrder
    rpe?: SortOrder
    form?: SortOrder
    difficulty?: SortOrder
    startedAt?: SortOrder
    completedAt?: SortOrder
    isCompleted?: SortOrder
    notes?: SortOrder
  }

  export type WorkoutRecordAvgOrderByAggregateInput = {
    setNumber?: SortOrder
    targetReps?: SortOrder
    actualReps?: SortOrder
    targetWeight?: SortOrder
    actualWeight?: SortOrder
    targetDuration?: SortOrder
    actualDuration?: SortOrder
    restTime?: SortOrder
    rpe?: SortOrder
    form?: SortOrder
    difficulty?: SortOrder
  }

  export type WorkoutRecordMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    sessionId?: SortOrder
    exerciseId?: SortOrder
    setNumber?: SortOrder
    targetReps?: SortOrder
    actualReps?: SortOrder
    targetWeight?: SortOrder
    actualWeight?: SortOrder
    targetDuration?: SortOrder
    actualDuration?: SortOrder
    restTime?: SortOrder
    rpe?: SortOrder
    form?: SortOrder
    difficulty?: SortOrder
    startedAt?: SortOrder
    completedAt?: SortOrder
    isCompleted?: SortOrder
    notes?: SortOrder
  }

  export type WorkoutRecordMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    sessionId?: SortOrder
    exerciseId?: SortOrder
    setNumber?: SortOrder
    targetReps?: SortOrder
    actualReps?: SortOrder
    targetWeight?: SortOrder
    actualWeight?: SortOrder
    targetDuration?: SortOrder
    actualDuration?: SortOrder
    restTime?: SortOrder
    rpe?: SortOrder
    form?: SortOrder
    difficulty?: SortOrder
    startedAt?: SortOrder
    completedAt?: SortOrder
    isCompleted?: SortOrder
    notes?: SortOrder
  }

  export type WorkoutRecordSumOrderByAggregateInput = {
    setNumber?: SortOrder
    targetReps?: SortOrder
    actualReps?: SortOrder
    targetWeight?: SortOrder
    actualWeight?: SortOrder
    targetDuration?: SortOrder
    actualDuration?: SortOrder
    restTime?: SortOrder
    rpe?: SortOrder
    form?: SortOrder
    difficulty?: SortOrder
  }

  export type PersonalRecordUserIdExerciseIdRecordTypeCompoundUniqueInput = {
    userId: string
    exerciseId: string
    recordType: string
  }

  export type PersonalRecordCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    exerciseId?: SortOrder
    exerciseName?: SortOrder
    recordType?: SortOrder
    value?: SortOrder
    unit?: SortOrder
    sessionId?: SortOrder
    setNumber?: SortOrder
    notes?: SortOrder
    isVerified?: SortOrder
    verifiedAt?: SortOrder
  }

  export type PersonalRecordAvgOrderByAggregateInput = {
    value?: SortOrder
    setNumber?: SortOrder
  }

  export type PersonalRecordMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    exerciseId?: SortOrder
    exerciseName?: SortOrder
    recordType?: SortOrder
    value?: SortOrder
    unit?: SortOrder
    sessionId?: SortOrder
    setNumber?: SortOrder
    notes?: SortOrder
    isVerified?: SortOrder
    verifiedAt?: SortOrder
  }

  export type PersonalRecordMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    exerciseId?: SortOrder
    exerciseName?: SortOrder
    recordType?: SortOrder
    value?: SortOrder
    unit?: SortOrder
    sessionId?: SortOrder
    setNumber?: SortOrder
    notes?: SortOrder
    isVerified?: SortOrder
    verifiedAt?: SortOrder
  }

  export type PersonalRecordSumOrderByAggregateInput = {
    value?: SortOrder
    setNumber?: SortOrder
  }
  export type JsonFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
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

  export type WorkoutTemplateCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    exercises?: SortOrder
    isPublic?: SortOrder
    tags?: SortOrder
    difficulty?: SortOrder
    useCount?: SortOrder
    lastUsed?: SortOrder
  }

  export type WorkoutTemplateAvgOrderByAggregateInput = {
    difficulty?: SortOrder
    useCount?: SortOrder
  }

  export type WorkoutTemplateMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    isPublic?: SortOrder
    difficulty?: SortOrder
    useCount?: SortOrder
    lastUsed?: SortOrder
  }

  export type WorkoutTemplateMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    isPublic?: SortOrder
    difficulty?: SortOrder
    useCount?: SortOrder
    lastUsed?: SortOrder
  }

  export type WorkoutTemplateSumOrderByAggregateInput = {
    difficulty?: SortOrder
    useCount?: SortOrder
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
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
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
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

  export type WorkoutGoalCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    exerciseId?: SortOrder
    exerciseName?: SortOrder
    goalType?: SortOrder
    targetValue?: SortOrder
    currentValue?: SortOrder
    unit?: SortOrder
    startDate?: SortOrder
    targetDate?: SortOrder
    isAchieved?: SortOrder
    achievedAt?: SortOrder
    progress?: SortOrder
    milestones?: SortOrder
  }

  export type WorkoutGoalAvgOrderByAggregateInput = {
    targetValue?: SortOrder
    currentValue?: SortOrder
    progress?: SortOrder
  }

  export type WorkoutGoalMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    exerciseId?: SortOrder
    exerciseName?: SortOrder
    goalType?: SortOrder
    targetValue?: SortOrder
    currentValue?: SortOrder
    unit?: SortOrder
    startDate?: SortOrder
    targetDate?: SortOrder
    isAchieved?: SortOrder
    achievedAt?: SortOrder
    progress?: SortOrder
  }

  export type WorkoutGoalMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    exerciseId?: SortOrder
    exerciseName?: SortOrder
    goalType?: SortOrder
    targetValue?: SortOrder
    currentValue?: SortOrder
    unit?: SortOrder
    startDate?: SortOrder
    targetDate?: SortOrder
    isAchieved?: SortOrder
    achievedAt?: SortOrder
    progress?: SortOrder
  }

  export type WorkoutGoalSumOrderByAggregateInput = {
    targetValue?: SortOrder
    currentValue?: SortOrder
    progress?: SortOrder
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

  export type WorkoutRecordCreateNestedManyWithoutSessionInput = {
    create?: XOR<WorkoutRecordCreateWithoutSessionInput, WorkoutRecordUncheckedCreateWithoutSessionInput> | WorkoutRecordCreateWithoutSessionInput[] | WorkoutRecordUncheckedCreateWithoutSessionInput[]
    connectOrCreate?: WorkoutRecordCreateOrConnectWithoutSessionInput | WorkoutRecordCreateOrConnectWithoutSessionInput[]
    createMany?: WorkoutRecordCreateManySessionInputEnvelope
    connect?: WorkoutRecordWhereUniqueInput | WorkoutRecordWhereUniqueInput[]
  }

  export type WorkoutExerciseCreateNestedManyWithoutSessionInput = {
    create?: XOR<WorkoutExerciseCreateWithoutSessionInput, WorkoutExerciseUncheckedCreateWithoutSessionInput> | WorkoutExerciseCreateWithoutSessionInput[] | WorkoutExerciseUncheckedCreateWithoutSessionInput[]
    connectOrCreate?: WorkoutExerciseCreateOrConnectWithoutSessionInput | WorkoutExerciseCreateOrConnectWithoutSessionInput[]
    createMany?: WorkoutExerciseCreateManySessionInputEnvelope
    connect?: WorkoutExerciseWhereUniqueInput | WorkoutExerciseWhereUniqueInput[]
  }

  export type WorkoutRecordUncheckedCreateNestedManyWithoutSessionInput = {
    create?: XOR<WorkoutRecordCreateWithoutSessionInput, WorkoutRecordUncheckedCreateWithoutSessionInput> | WorkoutRecordCreateWithoutSessionInput[] | WorkoutRecordUncheckedCreateWithoutSessionInput[]
    connectOrCreate?: WorkoutRecordCreateOrConnectWithoutSessionInput | WorkoutRecordCreateOrConnectWithoutSessionInput[]
    createMany?: WorkoutRecordCreateManySessionInputEnvelope
    connect?: WorkoutRecordWhereUniqueInput | WorkoutRecordWhereUniqueInput[]
  }

  export type WorkoutExerciseUncheckedCreateNestedManyWithoutSessionInput = {
    create?: XOR<WorkoutExerciseCreateWithoutSessionInput, WorkoutExerciseUncheckedCreateWithoutSessionInput> | WorkoutExerciseCreateWithoutSessionInput[] | WorkoutExerciseUncheckedCreateWithoutSessionInput[]
    connectOrCreate?: WorkoutExerciseCreateOrConnectWithoutSessionInput | WorkoutExerciseCreateOrConnectWithoutSessionInput[]
    createMany?: WorkoutExerciseCreateManySessionInputEnvelope
    connect?: WorkoutExerciseWhereUniqueInput | WorkoutExerciseWhereUniqueInput[]
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

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type WorkoutRecordUpdateManyWithoutSessionNestedInput = {
    create?: XOR<WorkoutRecordCreateWithoutSessionInput, WorkoutRecordUncheckedCreateWithoutSessionInput> | WorkoutRecordCreateWithoutSessionInput[] | WorkoutRecordUncheckedCreateWithoutSessionInput[]
    connectOrCreate?: WorkoutRecordCreateOrConnectWithoutSessionInput | WorkoutRecordCreateOrConnectWithoutSessionInput[]
    upsert?: WorkoutRecordUpsertWithWhereUniqueWithoutSessionInput | WorkoutRecordUpsertWithWhereUniqueWithoutSessionInput[]
    createMany?: WorkoutRecordCreateManySessionInputEnvelope
    set?: WorkoutRecordWhereUniqueInput | WorkoutRecordWhereUniqueInput[]
    disconnect?: WorkoutRecordWhereUniqueInput | WorkoutRecordWhereUniqueInput[]
    delete?: WorkoutRecordWhereUniqueInput | WorkoutRecordWhereUniqueInput[]
    connect?: WorkoutRecordWhereUniqueInput | WorkoutRecordWhereUniqueInput[]
    update?: WorkoutRecordUpdateWithWhereUniqueWithoutSessionInput | WorkoutRecordUpdateWithWhereUniqueWithoutSessionInput[]
    updateMany?: WorkoutRecordUpdateManyWithWhereWithoutSessionInput | WorkoutRecordUpdateManyWithWhereWithoutSessionInput[]
    deleteMany?: WorkoutRecordScalarWhereInput | WorkoutRecordScalarWhereInput[]
  }

  export type WorkoutExerciseUpdateManyWithoutSessionNestedInput = {
    create?: XOR<WorkoutExerciseCreateWithoutSessionInput, WorkoutExerciseUncheckedCreateWithoutSessionInput> | WorkoutExerciseCreateWithoutSessionInput[] | WorkoutExerciseUncheckedCreateWithoutSessionInput[]
    connectOrCreate?: WorkoutExerciseCreateOrConnectWithoutSessionInput | WorkoutExerciseCreateOrConnectWithoutSessionInput[]
    upsert?: WorkoutExerciseUpsertWithWhereUniqueWithoutSessionInput | WorkoutExerciseUpsertWithWhereUniqueWithoutSessionInput[]
    createMany?: WorkoutExerciseCreateManySessionInputEnvelope
    set?: WorkoutExerciseWhereUniqueInput | WorkoutExerciseWhereUniqueInput[]
    disconnect?: WorkoutExerciseWhereUniqueInput | WorkoutExerciseWhereUniqueInput[]
    delete?: WorkoutExerciseWhereUniqueInput | WorkoutExerciseWhereUniqueInput[]
    connect?: WorkoutExerciseWhereUniqueInput | WorkoutExerciseWhereUniqueInput[]
    update?: WorkoutExerciseUpdateWithWhereUniqueWithoutSessionInput | WorkoutExerciseUpdateWithWhereUniqueWithoutSessionInput[]
    updateMany?: WorkoutExerciseUpdateManyWithWhereWithoutSessionInput | WorkoutExerciseUpdateManyWithWhereWithoutSessionInput[]
    deleteMany?: WorkoutExerciseScalarWhereInput | WorkoutExerciseScalarWhereInput[]
  }

  export type WorkoutRecordUncheckedUpdateManyWithoutSessionNestedInput = {
    create?: XOR<WorkoutRecordCreateWithoutSessionInput, WorkoutRecordUncheckedCreateWithoutSessionInput> | WorkoutRecordCreateWithoutSessionInput[] | WorkoutRecordUncheckedCreateWithoutSessionInput[]
    connectOrCreate?: WorkoutRecordCreateOrConnectWithoutSessionInput | WorkoutRecordCreateOrConnectWithoutSessionInput[]
    upsert?: WorkoutRecordUpsertWithWhereUniqueWithoutSessionInput | WorkoutRecordUpsertWithWhereUniqueWithoutSessionInput[]
    createMany?: WorkoutRecordCreateManySessionInputEnvelope
    set?: WorkoutRecordWhereUniqueInput | WorkoutRecordWhereUniqueInput[]
    disconnect?: WorkoutRecordWhereUniqueInput | WorkoutRecordWhereUniqueInput[]
    delete?: WorkoutRecordWhereUniqueInput | WorkoutRecordWhereUniqueInput[]
    connect?: WorkoutRecordWhereUniqueInput | WorkoutRecordWhereUniqueInput[]
    update?: WorkoutRecordUpdateWithWhereUniqueWithoutSessionInput | WorkoutRecordUpdateWithWhereUniqueWithoutSessionInput[]
    updateMany?: WorkoutRecordUpdateManyWithWhereWithoutSessionInput | WorkoutRecordUpdateManyWithWhereWithoutSessionInput[]
    deleteMany?: WorkoutRecordScalarWhereInput | WorkoutRecordScalarWhereInput[]
  }

  export type WorkoutExerciseUncheckedUpdateManyWithoutSessionNestedInput = {
    create?: XOR<WorkoutExerciseCreateWithoutSessionInput, WorkoutExerciseUncheckedCreateWithoutSessionInput> | WorkoutExerciseCreateWithoutSessionInput[] | WorkoutExerciseUncheckedCreateWithoutSessionInput[]
    connectOrCreate?: WorkoutExerciseCreateOrConnectWithoutSessionInput | WorkoutExerciseCreateOrConnectWithoutSessionInput[]
    upsert?: WorkoutExerciseUpsertWithWhereUniqueWithoutSessionInput | WorkoutExerciseUpsertWithWhereUniqueWithoutSessionInput[]
    createMany?: WorkoutExerciseCreateManySessionInputEnvelope
    set?: WorkoutExerciseWhereUniqueInput | WorkoutExerciseWhereUniqueInput[]
    disconnect?: WorkoutExerciseWhereUniqueInput | WorkoutExerciseWhereUniqueInput[]
    delete?: WorkoutExerciseWhereUniqueInput | WorkoutExerciseWhereUniqueInput[]
    connect?: WorkoutExerciseWhereUniqueInput | WorkoutExerciseWhereUniqueInput[]
    update?: WorkoutExerciseUpdateWithWhereUniqueWithoutSessionInput | WorkoutExerciseUpdateWithWhereUniqueWithoutSessionInput[]
    updateMany?: WorkoutExerciseUpdateManyWithWhereWithoutSessionInput | WorkoutExerciseUpdateManyWithWhereWithoutSessionInput[]
    deleteMany?: WorkoutExerciseScalarWhereInput | WorkoutExerciseScalarWhereInput[]
  }

  export type UserSummaryCreatenewPersonalRecordsInput = {
    set: string[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type UserSummaryUpdatenewPersonalRecordsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type WorkoutSessionCreateNestedOneWithoutExercisesInput = {
    create?: XOR<WorkoutSessionCreateWithoutExercisesInput, WorkoutSessionUncheckedCreateWithoutExercisesInput>
    connectOrCreate?: WorkoutSessionCreateOrConnectWithoutExercisesInput
    connect?: WorkoutSessionWhereUniqueInput
  }

  export type WorkoutRecordCreateNestedManyWithoutExerciseInput = {
    create?: XOR<WorkoutRecordCreateWithoutExerciseInput, WorkoutRecordUncheckedCreateWithoutExerciseInput> | WorkoutRecordCreateWithoutExerciseInput[] | WorkoutRecordUncheckedCreateWithoutExerciseInput[]
    connectOrCreate?: WorkoutRecordCreateOrConnectWithoutExerciseInput | WorkoutRecordCreateOrConnectWithoutExerciseInput[]
    createMany?: WorkoutRecordCreateManyExerciseInputEnvelope
    connect?: WorkoutRecordWhereUniqueInput | WorkoutRecordWhereUniqueInput[]
  }

  export type WorkoutRecordUncheckedCreateNestedManyWithoutExerciseInput = {
    create?: XOR<WorkoutRecordCreateWithoutExerciseInput, WorkoutRecordUncheckedCreateWithoutExerciseInput> | WorkoutRecordCreateWithoutExerciseInput[] | WorkoutRecordUncheckedCreateWithoutExerciseInput[]
    connectOrCreate?: WorkoutRecordCreateOrConnectWithoutExerciseInput | WorkoutRecordCreateOrConnectWithoutExerciseInput[]
    createMany?: WorkoutRecordCreateManyExerciseInputEnvelope
    connect?: WorkoutRecordWhereUniqueInput | WorkoutRecordWhereUniqueInput[]
  }

  export type WorkoutSessionUpdateOneRequiredWithoutExercisesNestedInput = {
    create?: XOR<WorkoutSessionCreateWithoutExercisesInput, WorkoutSessionUncheckedCreateWithoutExercisesInput>
    connectOrCreate?: WorkoutSessionCreateOrConnectWithoutExercisesInput
    upsert?: WorkoutSessionUpsertWithoutExercisesInput
    connect?: WorkoutSessionWhereUniqueInput
    update?: XOR<XOR<WorkoutSessionUpdateToOneWithWhereWithoutExercisesInput, WorkoutSessionUpdateWithoutExercisesInput>, WorkoutSessionUncheckedUpdateWithoutExercisesInput>
  }

  export type WorkoutRecordUpdateManyWithoutExerciseNestedInput = {
    create?: XOR<WorkoutRecordCreateWithoutExerciseInput, WorkoutRecordUncheckedCreateWithoutExerciseInput> | WorkoutRecordCreateWithoutExerciseInput[] | WorkoutRecordUncheckedCreateWithoutExerciseInput[]
    connectOrCreate?: WorkoutRecordCreateOrConnectWithoutExerciseInput | WorkoutRecordCreateOrConnectWithoutExerciseInput[]
    upsert?: WorkoutRecordUpsertWithWhereUniqueWithoutExerciseInput | WorkoutRecordUpsertWithWhereUniqueWithoutExerciseInput[]
    createMany?: WorkoutRecordCreateManyExerciseInputEnvelope
    set?: WorkoutRecordWhereUniqueInput | WorkoutRecordWhereUniqueInput[]
    disconnect?: WorkoutRecordWhereUniqueInput | WorkoutRecordWhereUniqueInput[]
    delete?: WorkoutRecordWhereUniqueInput | WorkoutRecordWhereUniqueInput[]
    connect?: WorkoutRecordWhereUniqueInput | WorkoutRecordWhereUniqueInput[]
    update?: WorkoutRecordUpdateWithWhereUniqueWithoutExerciseInput | WorkoutRecordUpdateWithWhereUniqueWithoutExerciseInput[]
    updateMany?: WorkoutRecordUpdateManyWithWhereWithoutExerciseInput | WorkoutRecordUpdateManyWithWhereWithoutExerciseInput[]
    deleteMany?: WorkoutRecordScalarWhereInput | WorkoutRecordScalarWhereInput[]
  }

  export type WorkoutRecordUncheckedUpdateManyWithoutExerciseNestedInput = {
    create?: XOR<WorkoutRecordCreateWithoutExerciseInput, WorkoutRecordUncheckedCreateWithoutExerciseInput> | WorkoutRecordCreateWithoutExerciseInput[] | WorkoutRecordUncheckedCreateWithoutExerciseInput[]
    connectOrCreate?: WorkoutRecordCreateOrConnectWithoutExerciseInput | WorkoutRecordCreateOrConnectWithoutExerciseInput[]
    upsert?: WorkoutRecordUpsertWithWhereUniqueWithoutExerciseInput | WorkoutRecordUpsertWithWhereUniqueWithoutExerciseInput[]
    createMany?: WorkoutRecordCreateManyExerciseInputEnvelope
    set?: WorkoutRecordWhereUniqueInput | WorkoutRecordWhereUniqueInput[]
    disconnect?: WorkoutRecordWhereUniqueInput | WorkoutRecordWhereUniqueInput[]
    delete?: WorkoutRecordWhereUniqueInput | WorkoutRecordWhereUniqueInput[]
    connect?: WorkoutRecordWhereUniqueInput | WorkoutRecordWhereUniqueInput[]
    update?: WorkoutRecordUpdateWithWhereUniqueWithoutExerciseInput | WorkoutRecordUpdateWithWhereUniqueWithoutExerciseInput[]
    updateMany?: WorkoutRecordUpdateManyWithWhereWithoutExerciseInput | WorkoutRecordUpdateManyWithWhereWithoutExerciseInput[]
    deleteMany?: WorkoutRecordScalarWhereInput | WorkoutRecordScalarWhereInput[]
  }

  export type WorkoutSessionCreateNestedOneWithoutRecordsInput = {
    create?: XOR<WorkoutSessionCreateWithoutRecordsInput, WorkoutSessionUncheckedCreateWithoutRecordsInput>
    connectOrCreate?: WorkoutSessionCreateOrConnectWithoutRecordsInput
    connect?: WorkoutSessionWhereUniqueInput
  }

  export type WorkoutExerciseCreateNestedOneWithoutRecordsInput = {
    create?: XOR<WorkoutExerciseCreateWithoutRecordsInput, WorkoutExerciseUncheckedCreateWithoutRecordsInput>
    connectOrCreate?: WorkoutExerciseCreateOrConnectWithoutRecordsInput
    connect?: WorkoutExerciseWhereUniqueInput
  }

  export type WorkoutSessionUpdateOneRequiredWithoutRecordsNestedInput = {
    create?: XOR<WorkoutSessionCreateWithoutRecordsInput, WorkoutSessionUncheckedCreateWithoutRecordsInput>
    connectOrCreate?: WorkoutSessionCreateOrConnectWithoutRecordsInput
    upsert?: WorkoutSessionUpsertWithoutRecordsInput
    connect?: WorkoutSessionWhereUniqueInput
    update?: XOR<XOR<WorkoutSessionUpdateToOneWithWhereWithoutRecordsInput, WorkoutSessionUpdateWithoutRecordsInput>, WorkoutSessionUncheckedUpdateWithoutRecordsInput>
  }

  export type WorkoutExerciseUpdateOneRequiredWithoutRecordsNestedInput = {
    create?: XOR<WorkoutExerciseCreateWithoutRecordsInput, WorkoutExerciseUncheckedCreateWithoutRecordsInput>
    connectOrCreate?: WorkoutExerciseCreateOrConnectWithoutRecordsInput
    upsert?: WorkoutExerciseUpsertWithoutRecordsInput
    connect?: WorkoutExerciseWhereUniqueInput
    update?: XOR<XOR<WorkoutExerciseUpdateToOneWithWhereWithoutRecordsInput, WorkoutExerciseUpdateWithoutRecordsInput>, WorkoutExerciseUncheckedUpdateWithoutRecordsInput>
  }

  export type WorkoutTemplateCreatetagsInput = {
    set: string[]
  }

  export type WorkoutTemplateUpdatetagsInput = {
    set?: string[]
    push?: string | string[]
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

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
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

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
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

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
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

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }
  export type NestedJsonFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
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

  export type WorkoutRecordCreateWithoutSessionInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    setNumber: number
    targetReps: number
    actualReps: number
    targetWeight?: number | null
    actualWeight?: number | null
    targetDuration?: number | null
    actualDuration?: number | null
    restTime?: number | null
    rpe?: number | null
    form?: number | null
    difficulty?: number | null
    startedAt?: Date | string | null
    completedAt?: Date | string | null
    isCompleted?: boolean
    notes?: string | null
    exercise: WorkoutExerciseCreateNestedOneWithoutRecordsInput
  }

  export type WorkoutRecordUncheckedCreateWithoutSessionInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    exerciseId: string
    setNumber: number
    targetReps: number
    actualReps: number
    targetWeight?: number | null
    actualWeight?: number | null
    targetDuration?: number | null
    actualDuration?: number | null
    restTime?: number | null
    rpe?: number | null
    form?: number | null
    difficulty?: number | null
    startedAt?: Date | string | null
    completedAt?: Date | string | null
    isCompleted?: boolean
    notes?: string | null
  }

  export type WorkoutRecordCreateOrConnectWithoutSessionInput = {
    where: WorkoutRecordWhereUniqueInput
    create: XOR<WorkoutRecordCreateWithoutSessionInput, WorkoutRecordUncheckedCreateWithoutSessionInput>
  }

  export type WorkoutRecordCreateManySessionInputEnvelope = {
    data: WorkoutRecordCreateManySessionInput | WorkoutRecordCreateManySessionInput[]
    skipDuplicates?: boolean
  }

  export type WorkoutExerciseCreateWithoutSessionInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    exerciseId?: string | null
    exerciseName: string
    category: string
    order: number
    targetSets: number
    targetReps: number
    targetWeight?: number | null
    targetDuration?: number | null
    targetRest?: number | null
    actualSets?: number
    actualReps?: number
    actualWeight?: number | null
    actualDuration?: number | null
    actualRest?: number | null
    totalVolume?: number | null
    averageRPE?: number | null
    maxRPE?: number | null
    minRPE?: number | null
    isCompleted?: boolean
    completedAt?: Date | string | null
    notes?: string | null
    records?: WorkoutRecordCreateNestedManyWithoutExerciseInput
  }

  export type WorkoutExerciseUncheckedCreateWithoutSessionInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    exerciseId?: string | null
    exerciseName: string
    category: string
    order: number
    targetSets: number
    targetReps: number
    targetWeight?: number | null
    targetDuration?: number | null
    targetRest?: number | null
    actualSets?: number
    actualReps?: number
    actualWeight?: number | null
    actualDuration?: number | null
    actualRest?: number | null
    totalVolume?: number | null
    averageRPE?: number | null
    maxRPE?: number | null
    minRPE?: number | null
    isCompleted?: boolean
    completedAt?: Date | string | null
    notes?: string | null
    records?: WorkoutRecordUncheckedCreateNestedManyWithoutExerciseInput
  }

  export type WorkoutExerciseCreateOrConnectWithoutSessionInput = {
    where: WorkoutExerciseWhereUniqueInput
    create: XOR<WorkoutExerciseCreateWithoutSessionInput, WorkoutExerciseUncheckedCreateWithoutSessionInput>
  }

  export type WorkoutExerciseCreateManySessionInputEnvelope = {
    data: WorkoutExerciseCreateManySessionInput | WorkoutExerciseCreateManySessionInput[]
    skipDuplicates?: boolean
  }

  export type WorkoutRecordUpsertWithWhereUniqueWithoutSessionInput = {
    where: WorkoutRecordWhereUniqueInput
    update: XOR<WorkoutRecordUpdateWithoutSessionInput, WorkoutRecordUncheckedUpdateWithoutSessionInput>
    create: XOR<WorkoutRecordCreateWithoutSessionInput, WorkoutRecordUncheckedCreateWithoutSessionInput>
  }

  export type WorkoutRecordUpdateWithWhereUniqueWithoutSessionInput = {
    where: WorkoutRecordWhereUniqueInput
    data: XOR<WorkoutRecordUpdateWithoutSessionInput, WorkoutRecordUncheckedUpdateWithoutSessionInput>
  }

  export type WorkoutRecordUpdateManyWithWhereWithoutSessionInput = {
    where: WorkoutRecordScalarWhereInput
    data: XOR<WorkoutRecordUpdateManyMutationInput, WorkoutRecordUncheckedUpdateManyWithoutSessionInput>
  }

  export type WorkoutRecordScalarWhereInput = {
    AND?: WorkoutRecordScalarWhereInput | WorkoutRecordScalarWhereInput[]
    OR?: WorkoutRecordScalarWhereInput[]
    NOT?: WorkoutRecordScalarWhereInput | WorkoutRecordScalarWhereInput[]
    id?: StringFilter<"WorkoutRecord"> | string
    createdAt?: DateTimeFilter<"WorkoutRecord"> | Date | string
    updatedAt?: DateTimeFilter<"WorkoutRecord"> | Date | string
    sessionId?: StringFilter<"WorkoutRecord"> | string
    exerciseId?: StringFilter<"WorkoutRecord"> | string
    setNumber?: IntFilter<"WorkoutRecord"> | number
    targetReps?: IntFilter<"WorkoutRecord"> | number
    actualReps?: IntFilter<"WorkoutRecord"> | number
    targetWeight?: FloatNullableFilter<"WorkoutRecord"> | number | null
    actualWeight?: FloatNullableFilter<"WorkoutRecord"> | number | null
    targetDuration?: IntNullableFilter<"WorkoutRecord"> | number | null
    actualDuration?: IntNullableFilter<"WorkoutRecord"> | number | null
    restTime?: IntNullableFilter<"WorkoutRecord"> | number | null
    rpe?: IntNullableFilter<"WorkoutRecord"> | number | null
    form?: IntNullableFilter<"WorkoutRecord"> | number | null
    difficulty?: IntNullableFilter<"WorkoutRecord"> | number | null
    startedAt?: DateTimeNullableFilter<"WorkoutRecord"> | Date | string | null
    completedAt?: DateTimeNullableFilter<"WorkoutRecord"> | Date | string | null
    isCompleted?: BoolFilter<"WorkoutRecord"> | boolean
    notes?: StringNullableFilter<"WorkoutRecord"> | string | null
  }

  export type WorkoutExerciseUpsertWithWhereUniqueWithoutSessionInput = {
    where: WorkoutExerciseWhereUniqueInput
    update: XOR<WorkoutExerciseUpdateWithoutSessionInput, WorkoutExerciseUncheckedUpdateWithoutSessionInput>
    create: XOR<WorkoutExerciseCreateWithoutSessionInput, WorkoutExerciseUncheckedCreateWithoutSessionInput>
  }

  export type WorkoutExerciseUpdateWithWhereUniqueWithoutSessionInput = {
    where: WorkoutExerciseWhereUniqueInput
    data: XOR<WorkoutExerciseUpdateWithoutSessionInput, WorkoutExerciseUncheckedUpdateWithoutSessionInput>
  }

  export type WorkoutExerciseUpdateManyWithWhereWithoutSessionInput = {
    where: WorkoutExerciseScalarWhereInput
    data: XOR<WorkoutExerciseUpdateManyMutationInput, WorkoutExerciseUncheckedUpdateManyWithoutSessionInput>
  }

  export type WorkoutExerciseScalarWhereInput = {
    AND?: WorkoutExerciseScalarWhereInput | WorkoutExerciseScalarWhereInput[]
    OR?: WorkoutExerciseScalarWhereInput[]
    NOT?: WorkoutExerciseScalarWhereInput | WorkoutExerciseScalarWhereInput[]
    id?: StringFilter<"WorkoutExercise"> | string
    createdAt?: DateTimeFilter<"WorkoutExercise"> | Date | string
    updatedAt?: DateTimeFilter<"WorkoutExercise"> | Date | string
    sessionId?: StringFilter<"WorkoutExercise"> | string
    exerciseId?: StringNullableFilter<"WorkoutExercise"> | string | null
    exerciseName?: StringFilter<"WorkoutExercise"> | string
    category?: StringFilter<"WorkoutExercise"> | string
    order?: IntFilter<"WorkoutExercise"> | number
    targetSets?: IntFilter<"WorkoutExercise"> | number
    targetReps?: IntFilter<"WorkoutExercise"> | number
    targetWeight?: FloatNullableFilter<"WorkoutExercise"> | number | null
    targetDuration?: IntNullableFilter<"WorkoutExercise"> | number | null
    targetRest?: IntNullableFilter<"WorkoutExercise"> | number | null
    actualSets?: IntFilter<"WorkoutExercise"> | number
    actualReps?: IntFilter<"WorkoutExercise"> | number
    actualWeight?: FloatNullableFilter<"WorkoutExercise"> | number | null
    actualDuration?: IntNullableFilter<"WorkoutExercise"> | number | null
    actualRest?: IntNullableFilter<"WorkoutExercise"> | number | null
    totalVolume?: FloatNullableFilter<"WorkoutExercise"> | number | null
    averageRPE?: FloatNullableFilter<"WorkoutExercise"> | number | null
    maxRPE?: IntNullableFilter<"WorkoutExercise"> | number | null
    minRPE?: IntNullableFilter<"WorkoutExercise"> | number | null
    isCompleted?: BoolFilter<"WorkoutExercise"> | boolean
    completedAt?: DateTimeNullableFilter<"WorkoutExercise"> | Date | string | null
    notes?: StringNullableFilter<"WorkoutExercise"> | string | null
  }

  export type WorkoutSessionCreateWithoutExercisesInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
    planId?: string | null
    sessionName?: string | null
    startedAt?: Date | string | null
    completedAt?: Date | string | null
    pausedAt?: Date | string | null
    totalDuration?: number | null
    status?: string
    isActive?: boolean
    notes?: string | null
    overallRating?: number | null
    difficulty?: number | null
    energy?: number | null
    motivation?: number | null
    location?: string | null
    weather?: string | null
    temperature?: number | null
    records?: WorkoutRecordCreateNestedManyWithoutSessionInput
  }

  export type WorkoutSessionUncheckedCreateWithoutExercisesInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
    planId?: string | null
    sessionName?: string | null
    startedAt?: Date | string | null
    completedAt?: Date | string | null
    pausedAt?: Date | string | null
    totalDuration?: number | null
    status?: string
    isActive?: boolean
    notes?: string | null
    overallRating?: number | null
    difficulty?: number | null
    energy?: number | null
    motivation?: number | null
    location?: string | null
    weather?: string | null
    temperature?: number | null
    records?: WorkoutRecordUncheckedCreateNestedManyWithoutSessionInput
  }

  export type WorkoutSessionCreateOrConnectWithoutExercisesInput = {
    where: WorkoutSessionWhereUniqueInput
    create: XOR<WorkoutSessionCreateWithoutExercisesInput, WorkoutSessionUncheckedCreateWithoutExercisesInput>
  }

  export type WorkoutRecordCreateWithoutExerciseInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    setNumber: number
    targetReps: number
    actualReps: number
    targetWeight?: number | null
    actualWeight?: number | null
    targetDuration?: number | null
    actualDuration?: number | null
    restTime?: number | null
    rpe?: number | null
    form?: number | null
    difficulty?: number | null
    startedAt?: Date | string | null
    completedAt?: Date | string | null
    isCompleted?: boolean
    notes?: string | null
    session: WorkoutSessionCreateNestedOneWithoutRecordsInput
  }

  export type WorkoutRecordUncheckedCreateWithoutExerciseInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    sessionId: string
    setNumber: number
    targetReps: number
    actualReps: number
    targetWeight?: number | null
    actualWeight?: number | null
    targetDuration?: number | null
    actualDuration?: number | null
    restTime?: number | null
    rpe?: number | null
    form?: number | null
    difficulty?: number | null
    startedAt?: Date | string | null
    completedAt?: Date | string | null
    isCompleted?: boolean
    notes?: string | null
  }

  export type WorkoutRecordCreateOrConnectWithoutExerciseInput = {
    where: WorkoutRecordWhereUniqueInput
    create: XOR<WorkoutRecordCreateWithoutExerciseInput, WorkoutRecordUncheckedCreateWithoutExerciseInput>
  }

  export type WorkoutRecordCreateManyExerciseInputEnvelope = {
    data: WorkoutRecordCreateManyExerciseInput | WorkoutRecordCreateManyExerciseInput[]
    skipDuplicates?: boolean
  }

  export type WorkoutSessionUpsertWithoutExercisesInput = {
    update: XOR<WorkoutSessionUpdateWithoutExercisesInput, WorkoutSessionUncheckedUpdateWithoutExercisesInput>
    create: XOR<WorkoutSessionCreateWithoutExercisesInput, WorkoutSessionUncheckedCreateWithoutExercisesInput>
    where?: WorkoutSessionWhereInput
  }

  export type WorkoutSessionUpdateToOneWithWhereWithoutExercisesInput = {
    where?: WorkoutSessionWhereInput
    data: XOR<WorkoutSessionUpdateWithoutExercisesInput, WorkoutSessionUncheckedUpdateWithoutExercisesInput>
  }

  export type WorkoutSessionUpdateWithoutExercisesInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    planId?: NullableStringFieldUpdateOperationsInput | string | null
    sessionName?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    pausedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalDuration?: NullableIntFieldUpdateOperationsInput | number | null
    status?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    overallRating?: NullableIntFieldUpdateOperationsInput | number | null
    difficulty?: NullableIntFieldUpdateOperationsInput | number | null
    energy?: NullableIntFieldUpdateOperationsInput | number | null
    motivation?: NullableIntFieldUpdateOperationsInput | number | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    weather?: NullableStringFieldUpdateOperationsInput | string | null
    temperature?: NullableFloatFieldUpdateOperationsInput | number | null
    records?: WorkoutRecordUpdateManyWithoutSessionNestedInput
  }

  export type WorkoutSessionUncheckedUpdateWithoutExercisesInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    planId?: NullableStringFieldUpdateOperationsInput | string | null
    sessionName?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    pausedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalDuration?: NullableIntFieldUpdateOperationsInput | number | null
    status?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    overallRating?: NullableIntFieldUpdateOperationsInput | number | null
    difficulty?: NullableIntFieldUpdateOperationsInput | number | null
    energy?: NullableIntFieldUpdateOperationsInput | number | null
    motivation?: NullableIntFieldUpdateOperationsInput | number | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    weather?: NullableStringFieldUpdateOperationsInput | string | null
    temperature?: NullableFloatFieldUpdateOperationsInput | number | null
    records?: WorkoutRecordUncheckedUpdateManyWithoutSessionNestedInput
  }

  export type WorkoutRecordUpsertWithWhereUniqueWithoutExerciseInput = {
    where: WorkoutRecordWhereUniqueInput
    update: XOR<WorkoutRecordUpdateWithoutExerciseInput, WorkoutRecordUncheckedUpdateWithoutExerciseInput>
    create: XOR<WorkoutRecordCreateWithoutExerciseInput, WorkoutRecordUncheckedCreateWithoutExerciseInput>
  }

  export type WorkoutRecordUpdateWithWhereUniqueWithoutExerciseInput = {
    where: WorkoutRecordWhereUniqueInput
    data: XOR<WorkoutRecordUpdateWithoutExerciseInput, WorkoutRecordUncheckedUpdateWithoutExerciseInput>
  }

  export type WorkoutRecordUpdateManyWithWhereWithoutExerciseInput = {
    where: WorkoutRecordScalarWhereInput
    data: XOR<WorkoutRecordUpdateManyMutationInput, WorkoutRecordUncheckedUpdateManyWithoutExerciseInput>
  }

  export type WorkoutSessionCreateWithoutRecordsInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
    planId?: string | null
    sessionName?: string | null
    startedAt?: Date | string | null
    completedAt?: Date | string | null
    pausedAt?: Date | string | null
    totalDuration?: number | null
    status?: string
    isActive?: boolean
    notes?: string | null
    overallRating?: number | null
    difficulty?: number | null
    energy?: number | null
    motivation?: number | null
    location?: string | null
    weather?: string | null
    temperature?: number | null
    exercises?: WorkoutExerciseCreateNestedManyWithoutSessionInput
  }

  export type WorkoutSessionUncheckedCreateWithoutRecordsInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
    planId?: string | null
    sessionName?: string | null
    startedAt?: Date | string | null
    completedAt?: Date | string | null
    pausedAt?: Date | string | null
    totalDuration?: number | null
    status?: string
    isActive?: boolean
    notes?: string | null
    overallRating?: number | null
    difficulty?: number | null
    energy?: number | null
    motivation?: number | null
    location?: string | null
    weather?: string | null
    temperature?: number | null
    exercises?: WorkoutExerciseUncheckedCreateNestedManyWithoutSessionInput
  }

  export type WorkoutSessionCreateOrConnectWithoutRecordsInput = {
    where: WorkoutSessionWhereUniqueInput
    create: XOR<WorkoutSessionCreateWithoutRecordsInput, WorkoutSessionUncheckedCreateWithoutRecordsInput>
  }

  export type WorkoutExerciseCreateWithoutRecordsInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    exerciseId?: string | null
    exerciseName: string
    category: string
    order: number
    targetSets: number
    targetReps: number
    targetWeight?: number | null
    targetDuration?: number | null
    targetRest?: number | null
    actualSets?: number
    actualReps?: number
    actualWeight?: number | null
    actualDuration?: number | null
    actualRest?: number | null
    totalVolume?: number | null
    averageRPE?: number | null
    maxRPE?: number | null
    minRPE?: number | null
    isCompleted?: boolean
    completedAt?: Date | string | null
    notes?: string | null
    session: WorkoutSessionCreateNestedOneWithoutExercisesInput
  }

  export type WorkoutExerciseUncheckedCreateWithoutRecordsInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    sessionId: string
    exerciseId?: string | null
    exerciseName: string
    category: string
    order: number
    targetSets: number
    targetReps: number
    targetWeight?: number | null
    targetDuration?: number | null
    targetRest?: number | null
    actualSets?: number
    actualReps?: number
    actualWeight?: number | null
    actualDuration?: number | null
    actualRest?: number | null
    totalVolume?: number | null
    averageRPE?: number | null
    maxRPE?: number | null
    minRPE?: number | null
    isCompleted?: boolean
    completedAt?: Date | string | null
    notes?: string | null
  }

  export type WorkoutExerciseCreateOrConnectWithoutRecordsInput = {
    where: WorkoutExerciseWhereUniqueInput
    create: XOR<WorkoutExerciseCreateWithoutRecordsInput, WorkoutExerciseUncheckedCreateWithoutRecordsInput>
  }

  export type WorkoutSessionUpsertWithoutRecordsInput = {
    update: XOR<WorkoutSessionUpdateWithoutRecordsInput, WorkoutSessionUncheckedUpdateWithoutRecordsInput>
    create: XOR<WorkoutSessionCreateWithoutRecordsInput, WorkoutSessionUncheckedCreateWithoutRecordsInput>
    where?: WorkoutSessionWhereInput
  }

  export type WorkoutSessionUpdateToOneWithWhereWithoutRecordsInput = {
    where?: WorkoutSessionWhereInput
    data: XOR<WorkoutSessionUpdateWithoutRecordsInput, WorkoutSessionUncheckedUpdateWithoutRecordsInput>
  }

  export type WorkoutSessionUpdateWithoutRecordsInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    planId?: NullableStringFieldUpdateOperationsInput | string | null
    sessionName?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    pausedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalDuration?: NullableIntFieldUpdateOperationsInput | number | null
    status?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    overallRating?: NullableIntFieldUpdateOperationsInput | number | null
    difficulty?: NullableIntFieldUpdateOperationsInput | number | null
    energy?: NullableIntFieldUpdateOperationsInput | number | null
    motivation?: NullableIntFieldUpdateOperationsInput | number | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    weather?: NullableStringFieldUpdateOperationsInput | string | null
    temperature?: NullableFloatFieldUpdateOperationsInput | number | null
    exercises?: WorkoutExerciseUpdateManyWithoutSessionNestedInput
  }

  export type WorkoutSessionUncheckedUpdateWithoutRecordsInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    planId?: NullableStringFieldUpdateOperationsInput | string | null
    sessionName?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    pausedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalDuration?: NullableIntFieldUpdateOperationsInput | number | null
    status?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    overallRating?: NullableIntFieldUpdateOperationsInput | number | null
    difficulty?: NullableIntFieldUpdateOperationsInput | number | null
    energy?: NullableIntFieldUpdateOperationsInput | number | null
    motivation?: NullableIntFieldUpdateOperationsInput | number | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    weather?: NullableStringFieldUpdateOperationsInput | string | null
    temperature?: NullableFloatFieldUpdateOperationsInput | number | null
    exercises?: WorkoutExerciseUncheckedUpdateManyWithoutSessionNestedInput
  }

  export type WorkoutExerciseUpsertWithoutRecordsInput = {
    update: XOR<WorkoutExerciseUpdateWithoutRecordsInput, WorkoutExerciseUncheckedUpdateWithoutRecordsInput>
    create: XOR<WorkoutExerciseCreateWithoutRecordsInput, WorkoutExerciseUncheckedCreateWithoutRecordsInput>
    where?: WorkoutExerciseWhereInput
  }

  export type WorkoutExerciseUpdateToOneWithWhereWithoutRecordsInput = {
    where?: WorkoutExerciseWhereInput
    data: XOR<WorkoutExerciseUpdateWithoutRecordsInput, WorkoutExerciseUncheckedUpdateWithoutRecordsInput>
  }

  export type WorkoutExerciseUpdateWithoutRecordsInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    exerciseId?: NullableStringFieldUpdateOperationsInput | string | null
    exerciseName?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    targetSets?: IntFieldUpdateOperationsInput | number
    targetReps?: IntFieldUpdateOperationsInput | number
    targetWeight?: NullableFloatFieldUpdateOperationsInput | number | null
    targetDuration?: NullableIntFieldUpdateOperationsInput | number | null
    targetRest?: NullableIntFieldUpdateOperationsInput | number | null
    actualSets?: IntFieldUpdateOperationsInput | number
    actualReps?: IntFieldUpdateOperationsInput | number
    actualWeight?: NullableFloatFieldUpdateOperationsInput | number | null
    actualDuration?: NullableIntFieldUpdateOperationsInput | number | null
    actualRest?: NullableIntFieldUpdateOperationsInput | number | null
    totalVolume?: NullableFloatFieldUpdateOperationsInput | number | null
    averageRPE?: NullableFloatFieldUpdateOperationsInput | number | null
    maxRPE?: NullableIntFieldUpdateOperationsInput | number | null
    minRPE?: NullableIntFieldUpdateOperationsInput | number | null
    isCompleted?: BoolFieldUpdateOperationsInput | boolean
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    session?: WorkoutSessionUpdateOneRequiredWithoutExercisesNestedInput
  }

  export type WorkoutExerciseUncheckedUpdateWithoutRecordsInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sessionId?: StringFieldUpdateOperationsInput | string
    exerciseId?: NullableStringFieldUpdateOperationsInput | string | null
    exerciseName?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    targetSets?: IntFieldUpdateOperationsInput | number
    targetReps?: IntFieldUpdateOperationsInput | number
    targetWeight?: NullableFloatFieldUpdateOperationsInput | number | null
    targetDuration?: NullableIntFieldUpdateOperationsInput | number | null
    targetRest?: NullableIntFieldUpdateOperationsInput | number | null
    actualSets?: IntFieldUpdateOperationsInput | number
    actualReps?: IntFieldUpdateOperationsInput | number
    actualWeight?: NullableFloatFieldUpdateOperationsInput | number | null
    actualDuration?: NullableIntFieldUpdateOperationsInput | number | null
    actualRest?: NullableIntFieldUpdateOperationsInput | number | null
    totalVolume?: NullableFloatFieldUpdateOperationsInput | number | null
    averageRPE?: NullableFloatFieldUpdateOperationsInput | number | null
    maxRPE?: NullableIntFieldUpdateOperationsInput | number | null
    minRPE?: NullableIntFieldUpdateOperationsInput | number | null
    isCompleted?: BoolFieldUpdateOperationsInput | boolean
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type WorkoutRecordCreateManySessionInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    exerciseId: string
    setNumber: number
    targetReps: number
    actualReps: number
    targetWeight?: number | null
    actualWeight?: number | null
    targetDuration?: number | null
    actualDuration?: number | null
    restTime?: number | null
    rpe?: number | null
    form?: number | null
    difficulty?: number | null
    startedAt?: Date | string | null
    completedAt?: Date | string | null
    isCompleted?: boolean
    notes?: string | null
  }

  export type WorkoutExerciseCreateManySessionInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    exerciseId?: string | null
    exerciseName: string
    category: string
    order: number
    targetSets: number
    targetReps: number
    targetWeight?: number | null
    targetDuration?: number | null
    targetRest?: number | null
    actualSets?: number
    actualReps?: number
    actualWeight?: number | null
    actualDuration?: number | null
    actualRest?: number | null
    totalVolume?: number | null
    averageRPE?: number | null
    maxRPE?: number | null
    minRPE?: number | null
    isCompleted?: boolean
    completedAt?: Date | string | null
    notes?: string | null
  }

  export type WorkoutRecordUpdateWithoutSessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    setNumber?: IntFieldUpdateOperationsInput | number
    targetReps?: IntFieldUpdateOperationsInput | number
    actualReps?: IntFieldUpdateOperationsInput | number
    targetWeight?: NullableFloatFieldUpdateOperationsInput | number | null
    actualWeight?: NullableFloatFieldUpdateOperationsInput | number | null
    targetDuration?: NullableIntFieldUpdateOperationsInput | number | null
    actualDuration?: NullableIntFieldUpdateOperationsInput | number | null
    restTime?: NullableIntFieldUpdateOperationsInput | number | null
    rpe?: NullableIntFieldUpdateOperationsInput | number | null
    form?: NullableIntFieldUpdateOperationsInput | number | null
    difficulty?: NullableIntFieldUpdateOperationsInput | number | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isCompleted?: BoolFieldUpdateOperationsInput | boolean
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    exercise?: WorkoutExerciseUpdateOneRequiredWithoutRecordsNestedInput
  }

  export type WorkoutRecordUncheckedUpdateWithoutSessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    exerciseId?: StringFieldUpdateOperationsInput | string
    setNumber?: IntFieldUpdateOperationsInput | number
    targetReps?: IntFieldUpdateOperationsInput | number
    actualReps?: IntFieldUpdateOperationsInput | number
    targetWeight?: NullableFloatFieldUpdateOperationsInput | number | null
    actualWeight?: NullableFloatFieldUpdateOperationsInput | number | null
    targetDuration?: NullableIntFieldUpdateOperationsInput | number | null
    actualDuration?: NullableIntFieldUpdateOperationsInput | number | null
    restTime?: NullableIntFieldUpdateOperationsInput | number | null
    rpe?: NullableIntFieldUpdateOperationsInput | number | null
    form?: NullableIntFieldUpdateOperationsInput | number | null
    difficulty?: NullableIntFieldUpdateOperationsInput | number | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isCompleted?: BoolFieldUpdateOperationsInput | boolean
    notes?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type WorkoutRecordUncheckedUpdateManyWithoutSessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    exerciseId?: StringFieldUpdateOperationsInput | string
    setNumber?: IntFieldUpdateOperationsInput | number
    targetReps?: IntFieldUpdateOperationsInput | number
    actualReps?: IntFieldUpdateOperationsInput | number
    targetWeight?: NullableFloatFieldUpdateOperationsInput | number | null
    actualWeight?: NullableFloatFieldUpdateOperationsInput | number | null
    targetDuration?: NullableIntFieldUpdateOperationsInput | number | null
    actualDuration?: NullableIntFieldUpdateOperationsInput | number | null
    restTime?: NullableIntFieldUpdateOperationsInput | number | null
    rpe?: NullableIntFieldUpdateOperationsInput | number | null
    form?: NullableIntFieldUpdateOperationsInput | number | null
    difficulty?: NullableIntFieldUpdateOperationsInput | number | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isCompleted?: BoolFieldUpdateOperationsInput | boolean
    notes?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type WorkoutExerciseUpdateWithoutSessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    exerciseId?: NullableStringFieldUpdateOperationsInput | string | null
    exerciseName?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    targetSets?: IntFieldUpdateOperationsInput | number
    targetReps?: IntFieldUpdateOperationsInput | number
    targetWeight?: NullableFloatFieldUpdateOperationsInput | number | null
    targetDuration?: NullableIntFieldUpdateOperationsInput | number | null
    targetRest?: NullableIntFieldUpdateOperationsInput | number | null
    actualSets?: IntFieldUpdateOperationsInput | number
    actualReps?: IntFieldUpdateOperationsInput | number
    actualWeight?: NullableFloatFieldUpdateOperationsInput | number | null
    actualDuration?: NullableIntFieldUpdateOperationsInput | number | null
    actualRest?: NullableIntFieldUpdateOperationsInput | number | null
    totalVolume?: NullableFloatFieldUpdateOperationsInput | number | null
    averageRPE?: NullableFloatFieldUpdateOperationsInput | number | null
    maxRPE?: NullableIntFieldUpdateOperationsInput | number | null
    minRPE?: NullableIntFieldUpdateOperationsInput | number | null
    isCompleted?: BoolFieldUpdateOperationsInput | boolean
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    records?: WorkoutRecordUpdateManyWithoutExerciseNestedInput
  }

  export type WorkoutExerciseUncheckedUpdateWithoutSessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    exerciseId?: NullableStringFieldUpdateOperationsInput | string | null
    exerciseName?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    targetSets?: IntFieldUpdateOperationsInput | number
    targetReps?: IntFieldUpdateOperationsInput | number
    targetWeight?: NullableFloatFieldUpdateOperationsInput | number | null
    targetDuration?: NullableIntFieldUpdateOperationsInput | number | null
    targetRest?: NullableIntFieldUpdateOperationsInput | number | null
    actualSets?: IntFieldUpdateOperationsInput | number
    actualReps?: IntFieldUpdateOperationsInput | number
    actualWeight?: NullableFloatFieldUpdateOperationsInput | number | null
    actualDuration?: NullableIntFieldUpdateOperationsInput | number | null
    actualRest?: NullableIntFieldUpdateOperationsInput | number | null
    totalVolume?: NullableFloatFieldUpdateOperationsInput | number | null
    averageRPE?: NullableFloatFieldUpdateOperationsInput | number | null
    maxRPE?: NullableIntFieldUpdateOperationsInput | number | null
    minRPE?: NullableIntFieldUpdateOperationsInput | number | null
    isCompleted?: BoolFieldUpdateOperationsInput | boolean
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    records?: WorkoutRecordUncheckedUpdateManyWithoutExerciseNestedInput
  }

  export type WorkoutExerciseUncheckedUpdateManyWithoutSessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    exerciseId?: NullableStringFieldUpdateOperationsInput | string | null
    exerciseName?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    targetSets?: IntFieldUpdateOperationsInput | number
    targetReps?: IntFieldUpdateOperationsInput | number
    targetWeight?: NullableFloatFieldUpdateOperationsInput | number | null
    targetDuration?: NullableIntFieldUpdateOperationsInput | number | null
    targetRest?: NullableIntFieldUpdateOperationsInput | number | null
    actualSets?: IntFieldUpdateOperationsInput | number
    actualReps?: IntFieldUpdateOperationsInput | number
    actualWeight?: NullableFloatFieldUpdateOperationsInput | number | null
    actualDuration?: NullableIntFieldUpdateOperationsInput | number | null
    actualRest?: NullableIntFieldUpdateOperationsInput | number | null
    totalVolume?: NullableFloatFieldUpdateOperationsInput | number | null
    averageRPE?: NullableFloatFieldUpdateOperationsInput | number | null
    maxRPE?: NullableIntFieldUpdateOperationsInput | number | null
    minRPE?: NullableIntFieldUpdateOperationsInput | number | null
    isCompleted?: BoolFieldUpdateOperationsInput | boolean
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type WorkoutRecordCreateManyExerciseInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    sessionId: string
    setNumber: number
    targetReps: number
    actualReps: number
    targetWeight?: number | null
    actualWeight?: number | null
    targetDuration?: number | null
    actualDuration?: number | null
    restTime?: number | null
    rpe?: number | null
    form?: number | null
    difficulty?: number | null
    startedAt?: Date | string | null
    completedAt?: Date | string | null
    isCompleted?: boolean
    notes?: string | null
  }

  export type WorkoutRecordUpdateWithoutExerciseInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    setNumber?: IntFieldUpdateOperationsInput | number
    targetReps?: IntFieldUpdateOperationsInput | number
    actualReps?: IntFieldUpdateOperationsInput | number
    targetWeight?: NullableFloatFieldUpdateOperationsInput | number | null
    actualWeight?: NullableFloatFieldUpdateOperationsInput | number | null
    targetDuration?: NullableIntFieldUpdateOperationsInput | number | null
    actualDuration?: NullableIntFieldUpdateOperationsInput | number | null
    restTime?: NullableIntFieldUpdateOperationsInput | number | null
    rpe?: NullableIntFieldUpdateOperationsInput | number | null
    form?: NullableIntFieldUpdateOperationsInput | number | null
    difficulty?: NullableIntFieldUpdateOperationsInput | number | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isCompleted?: BoolFieldUpdateOperationsInput | boolean
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    session?: WorkoutSessionUpdateOneRequiredWithoutRecordsNestedInput
  }

  export type WorkoutRecordUncheckedUpdateWithoutExerciseInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sessionId?: StringFieldUpdateOperationsInput | string
    setNumber?: IntFieldUpdateOperationsInput | number
    targetReps?: IntFieldUpdateOperationsInput | number
    actualReps?: IntFieldUpdateOperationsInput | number
    targetWeight?: NullableFloatFieldUpdateOperationsInput | number | null
    actualWeight?: NullableFloatFieldUpdateOperationsInput | number | null
    targetDuration?: NullableIntFieldUpdateOperationsInput | number | null
    actualDuration?: NullableIntFieldUpdateOperationsInput | number | null
    restTime?: NullableIntFieldUpdateOperationsInput | number | null
    rpe?: NullableIntFieldUpdateOperationsInput | number | null
    form?: NullableIntFieldUpdateOperationsInput | number | null
    difficulty?: NullableIntFieldUpdateOperationsInput | number | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isCompleted?: BoolFieldUpdateOperationsInput | boolean
    notes?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type WorkoutRecordUncheckedUpdateManyWithoutExerciseInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sessionId?: StringFieldUpdateOperationsInput | string
    setNumber?: IntFieldUpdateOperationsInput | number
    targetReps?: IntFieldUpdateOperationsInput | number
    actualReps?: IntFieldUpdateOperationsInput | number
    targetWeight?: NullableFloatFieldUpdateOperationsInput | number | null
    actualWeight?: NullableFloatFieldUpdateOperationsInput | number | null
    targetDuration?: NullableIntFieldUpdateOperationsInput | number | null
    actualDuration?: NullableIntFieldUpdateOperationsInput | number | null
    restTime?: NullableIntFieldUpdateOperationsInput | number | null
    rpe?: NullableIntFieldUpdateOperationsInput | number | null
    form?: NullableIntFieldUpdateOperationsInput | number | null
    difficulty?: NullableIntFieldUpdateOperationsInput | number | null
    startedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isCompleted?: BoolFieldUpdateOperationsInput | boolean
    notes?: NullableStringFieldUpdateOperationsInput | string | null
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use WorkoutSessionCountOutputTypeDefaultArgs instead
     */
    export type WorkoutSessionCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = WorkoutSessionCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use WorkoutExerciseCountOutputTypeDefaultArgs instead
     */
    export type WorkoutExerciseCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = WorkoutExerciseCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use WorkoutSessionDefaultArgs instead
     */
    export type WorkoutSessionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = WorkoutSessionDefaultArgs<ExtArgs>
    /**
     * @deprecated Use UserSummaryDefaultArgs instead
     */
    export type UserSummaryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserSummaryDefaultArgs<ExtArgs>
    /**
     * @deprecated Use WorkoutExerciseDefaultArgs instead
     */
    export type WorkoutExerciseArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = WorkoutExerciseDefaultArgs<ExtArgs>
    /**
     * @deprecated Use WorkoutRecordDefaultArgs instead
     */
    export type WorkoutRecordArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = WorkoutRecordDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PersonalRecordDefaultArgs instead
     */
    export type PersonalRecordArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PersonalRecordDefaultArgs<ExtArgs>
    /**
     * @deprecated Use WorkoutTemplateDefaultArgs instead
     */
    export type WorkoutTemplateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = WorkoutTemplateDefaultArgs<ExtArgs>
    /**
     * @deprecated Use WorkoutGoalDefaultArgs instead
     */
    export type WorkoutGoalArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = WorkoutGoalDefaultArgs<ExtArgs>

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