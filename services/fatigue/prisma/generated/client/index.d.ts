
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
 * Model FatigueAssessment
 * 
 */
export type FatigueAssessment = $Result.DefaultSelection<Prisma.$FatigueAssessmentPayload>
/**
 * Model TrainingAdjustment
 * 
 */
export type TrainingAdjustment = $Result.DefaultSelection<Prisma.$TrainingAdjustmentPayload>
/**
 * Model FatiguePattern
 * 
 */
export type FatiguePattern = $Result.DefaultSelection<Prisma.$FatiguePatternPayload>
/**
 * Model UserFatigueProfile
 * 
 */
export type UserFatigueProfile = $Result.DefaultSelection<Prisma.$UserFatigueProfilePayload>

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more FatigueAssessments
 * const fatigueAssessments = await prisma.fatigueAssessment.findMany()
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
   * // Fetch zero or more FatigueAssessments
   * const fatigueAssessments = await prisma.fatigueAssessment.findMany()
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
   * `prisma.fatigueAssessment`: Exposes CRUD operations for the **FatigueAssessment** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more FatigueAssessments
    * const fatigueAssessments = await prisma.fatigueAssessment.findMany()
    * ```
    */
  get fatigueAssessment(): Prisma.FatigueAssessmentDelegate<ExtArgs>;

  /**
   * `prisma.trainingAdjustment`: Exposes CRUD operations for the **TrainingAdjustment** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TrainingAdjustments
    * const trainingAdjustments = await prisma.trainingAdjustment.findMany()
    * ```
    */
  get trainingAdjustment(): Prisma.TrainingAdjustmentDelegate<ExtArgs>;

  /**
   * `prisma.fatiguePattern`: Exposes CRUD operations for the **FatiguePattern** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more FatiguePatterns
    * const fatiguePatterns = await prisma.fatiguePattern.findMany()
    * ```
    */
  get fatiguePattern(): Prisma.FatiguePatternDelegate<ExtArgs>;

  /**
   * `prisma.userFatigueProfile`: Exposes CRUD operations for the **UserFatigueProfile** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserFatigueProfiles
    * const userFatigueProfiles = await prisma.userFatigueProfile.findMany()
    * ```
    */
  get userFatigueProfile(): Prisma.UserFatigueProfileDelegate<ExtArgs>;
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
    FatigueAssessment: 'FatigueAssessment',
    TrainingAdjustment: 'TrainingAdjustment',
    FatiguePattern: 'FatiguePattern',
    UserFatigueProfile: 'UserFatigueProfile'
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
      modelProps: "fatigueAssessment" | "trainingAdjustment" | "fatiguePattern" | "userFatigueProfile"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      FatigueAssessment: {
        payload: Prisma.$FatigueAssessmentPayload<ExtArgs>
        fields: Prisma.FatigueAssessmentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.FatigueAssessmentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FatigueAssessmentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.FatigueAssessmentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FatigueAssessmentPayload>
          }
          findFirst: {
            args: Prisma.FatigueAssessmentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FatigueAssessmentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.FatigueAssessmentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FatigueAssessmentPayload>
          }
          findMany: {
            args: Prisma.FatigueAssessmentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FatigueAssessmentPayload>[]
          }
          create: {
            args: Prisma.FatigueAssessmentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FatigueAssessmentPayload>
          }
          createMany: {
            args: Prisma.FatigueAssessmentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.FatigueAssessmentCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FatigueAssessmentPayload>[]
          }
          delete: {
            args: Prisma.FatigueAssessmentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FatigueAssessmentPayload>
          }
          update: {
            args: Prisma.FatigueAssessmentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FatigueAssessmentPayload>
          }
          deleteMany: {
            args: Prisma.FatigueAssessmentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.FatigueAssessmentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.FatigueAssessmentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FatigueAssessmentPayload>
          }
          aggregate: {
            args: Prisma.FatigueAssessmentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateFatigueAssessment>
          }
          groupBy: {
            args: Prisma.FatigueAssessmentGroupByArgs<ExtArgs>
            result: $Utils.Optional<FatigueAssessmentGroupByOutputType>[]
          }
          count: {
            args: Prisma.FatigueAssessmentCountArgs<ExtArgs>
            result: $Utils.Optional<FatigueAssessmentCountAggregateOutputType> | number
          }
        }
      }
      TrainingAdjustment: {
        payload: Prisma.$TrainingAdjustmentPayload<ExtArgs>
        fields: Prisma.TrainingAdjustmentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TrainingAdjustmentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingAdjustmentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TrainingAdjustmentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingAdjustmentPayload>
          }
          findFirst: {
            args: Prisma.TrainingAdjustmentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingAdjustmentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TrainingAdjustmentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingAdjustmentPayload>
          }
          findMany: {
            args: Prisma.TrainingAdjustmentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingAdjustmentPayload>[]
          }
          create: {
            args: Prisma.TrainingAdjustmentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingAdjustmentPayload>
          }
          createMany: {
            args: Prisma.TrainingAdjustmentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TrainingAdjustmentCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingAdjustmentPayload>[]
          }
          delete: {
            args: Prisma.TrainingAdjustmentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingAdjustmentPayload>
          }
          update: {
            args: Prisma.TrainingAdjustmentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingAdjustmentPayload>
          }
          deleteMany: {
            args: Prisma.TrainingAdjustmentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TrainingAdjustmentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.TrainingAdjustmentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrainingAdjustmentPayload>
          }
          aggregate: {
            args: Prisma.TrainingAdjustmentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTrainingAdjustment>
          }
          groupBy: {
            args: Prisma.TrainingAdjustmentGroupByArgs<ExtArgs>
            result: $Utils.Optional<TrainingAdjustmentGroupByOutputType>[]
          }
          count: {
            args: Prisma.TrainingAdjustmentCountArgs<ExtArgs>
            result: $Utils.Optional<TrainingAdjustmentCountAggregateOutputType> | number
          }
        }
      }
      FatiguePattern: {
        payload: Prisma.$FatiguePatternPayload<ExtArgs>
        fields: Prisma.FatiguePatternFieldRefs
        operations: {
          findUnique: {
            args: Prisma.FatiguePatternFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FatiguePatternPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.FatiguePatternFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FatiguePatternPayload>
          }
          findFirst: {
            args: Prisma.FatiguePatternFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FatiguePatternPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.FatiguePatternFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FatiguePatternPayload>
          }
          findMany: {
            args: Prisma.FatiguePatternFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FatiguePatternPayload>[]
          }
          create: {
            args: Prisma.FatiguePatternCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FatiguePatternPayload>
          }
          createMany: {
            args: Prisma.FatiguePatternCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.FatiguePatternCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FatiguePatternPayload>[]
          }
          delete: {
            args: Prisma.FatiguePatternDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FatiguePatternPayload>
          }
          update: {
            args: Prisma.FatiguePatternUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FatiguePatternPayload>
          }
          deleteMany: {
            args: Prisma.FatiguePatternDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.FatiguePatternUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.FatiguePatternUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FatiguePatternPayload>
          }
          aggregate: {
            args: Prisma.FatiguePatternAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateFatiguePattern>
          }
          groupBy: {
            args: Prisma.FatiguePatternGroupByArgs<ExtArgs>
            result: $Utils.Optional<FatiguePatternGroupByOutputType>[]
          }
          count: {
            args: Prisma.FatiguePatternCountArgs<ExtArgs>
            result: $Utils.Optional<FatiguePatternCountAggregateOutputType> | number
          }
        }
      }
      UserFatigueProfile: {
        payload: Prisma.$UserFatigueProfilePayload<ExtArgs>
        fields: Prisma.UserFatigueProfileFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFatigueProfileFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserFatigueProfilePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFatigueProfileFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserFatigueProfilePayload>
          }
          findFirst: {
            args: Prisma.UserFatigueProfileFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserFatigueProfilePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFatigueProfileFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserFatigueProfilePayload>
          }
          findMany: {
            args: Prisma.UserFatigueProfileFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserFatigueProfilePayload>[]
          }
          create: {
            args: Prisma.UserFatigueProfileCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserFatigueProfilePayload>
          }
          createMany: {
            args: Prisma.UserFatigueProfileCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserFatigueProfileCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserFatigueProfilePayload>[]
          }
          delete: {
            args: Prisma.UserFatigueProfileDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserFatigueProfilePayload>
          }
          update: {
            args: Prisma.UserFatigueProfileUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserFatigueProfilePayload>
          }
          deleteMany: {
            args: Prisma.UserFatigueProfileDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserFatigueProfileUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.UserFatigueProfileUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserFatigueProfilePayload>
          }
          aggregate: {
            args: Prisma.UserFatigueProfileAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserFatigueProfile>
          }
          groupBy: {
            args: Prisma.UserFatigueProfileGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserFatigueProfileGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserFatigueProfileCountArgs<ExtArgs>
            result: $Utils.Optional<UserFatigueProfileCountAggregateOutputType> | number
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
   * Models
   */

  /**
   * Model FatigueAssessment
   */

  export type AggregateFatigueAssessment = {
    _count: FatigueAssessmentCountAggregateOutputType | null
    _avg: FatigueAssessmentAvgAggregateOutputType | null
    _sum: FatigueAssessmentSumAggregateOutputType | null
    _min: FatigueAssessmentMinAggregateOutputType | null
    _max: FatigueAssessmentMaxAggregateOutputType | null
  }

  export type FatigueAssessmentAvgAggregateOutputType = {
    overallFatigue: number | null
    physicalFatigue: number | null
    mentalFatigue: number | null
    sleepQuality: number | null
    stressLevel: number | null
    timeSinceLastWorkout: number | null
  }

  export type FatigueAssessmentSumAggregateOutputType = {
    overallFatigue: number | null
    physicalFatigue: number | null
    mentalFatigue: number | null
    sleepQuality: number | null
    stressLevel: number | null
    timeSinceLastWorkout: number | null
  }

  export type FatigueAssessmentMinAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    updatedAt: Date | null
    userId: string | null
    sessionId: string | null
    overallFatigue: number | null
    physicalFatigue: number | null
    mentalFatigue: number | null
    sleepQuality: number | null
    stressLevel: number | null
    notes: string | null
    previousWorkout: string | null
    timeSinceLastWorkout: number | null
    assessmentType: string | null
    isActive: boolean | null
  }

  export type FatigueAssessmentMaxAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    updatedAt: Date | null
    userId: string | null
    sessionId: string | null
    overallFatigue: number | null
    physicalFatigue: number | null
    mentalFatigue: number | null
    sleepQuality: number | null
    stressLevel: number | null
    notes: string | null
    previousWorkout: string | null
    timeSinceLastWorkout: number | null
    assessmentType: string | null
    isActive: boolean | null
  }

  export type FatigueAssessmentCountAggregateOutputType = {
    id: number
    createdAt: number
    updatedAt: number
    userId: number
    sessionId: number
    overallFatigue: number
    physicalFatigue: number
    mentalFatigue: number
    sleepQuality: number
    stressLevel: number
    notes: number
    previousWorkout: number
    timeSinceLastWorkout: number
    assessmentType: number
    isActive: number
    _all: number
  }


  export type FatigueAssessmentAvgAggregateInputType = {
    overallFatigue?: true
    physicalFatigue?: true
    mentalFatigue?: true
    sleepQuality?: true
    stressLevel?: true
    timeSinceLastWorkout?: true
  }

  export type FatigueAssessmentSumAggregateInputType = {
    overallFatigue?: true
    physicalFatigue?: true
    mentalFatigue?: true
    sleepQuality?: true
    stressLevel?: true
    timeSinceLastWorkout?: true
  }

  export type FatigueAssessmentMinAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
    sessionId?: true
    overallFatigue?: true
    physicalFatigue?: true
    mentalFatigue?: true
    sleepQuality?: true
    stressLevel?: true
    notes?: true
    previousWorkout?: true
    timeSinceLastWorkout?: true
    assessmentType?: true
    isActive?: true
  }

  export type FatigueAssessmentMaxAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
    sessionId?: true
    overallFatigue?: true
    physicalFatigue?: true
    mentalFatigue?: true
    sleepQuality?: true
    stressLevel?: true
    notes?: true
    previousWorkout?: true
    timeSinceLastWorkout?: true
    assessmentType?: true
    isActive?: true
  }

  export type FatigueAssessmentCountAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
    sessionId?: true
    overallFatigue?: true
    physicalFatigue?: true
    mentalFatigue?: true
    sleepQuality?: true
    stressLevel?: true
    notes?: true
    previousWorkout?: true
    timeSinceLastWorkout?: true
    assessmentType?: true
    isActive?: true
    _all?: true
  }

  export type FatigueAssessmentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FatigueAssessment to aggregate.
     */
    where?: FatigueAssessmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FatigueAssessments to fetch.
     */
    orderBy?: FatigueAssessmentOrderByWithRelationInput | FatigueAssessmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: FatigueAssessmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FatigueAssessments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FatigueAssessments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned FatigueAssessments
    **/
    _count?: true | FatigueAssessmentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: FatigueAssessmentAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: FatigueAssessmentSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: FatigueAssessmentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: FatigueAssessmentMaxAggregateInputType
  }

  export type GetFatigueAssessmentAggregateType<T extends FatigueAssessmentAggregateArgs> = {
        [P in keyof T & keyof AggregateFatigueAssessment]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateFatigueAssessment[P]>
      : GetScalarType<T[P], AggregateFatigueAssessment[P]>
  }




  export type FatigueAssessmentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FatigueAssessmentWhereInput
    orderBy?: FatigueAssessmentOrderByWithAggregationInput | FatigueAssessmentOrderByWithAggregationInput[]
    by: FatigueAssessmentScalarFieldEnum[] | FatigueAssessmentScalarFieldEnum
    having?: FatigueAssessmentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: FatigueAssessmentCountAggregateInputType | true
    _avg?: FatigueAssessmentAvgAggregateInputType
    _sum?: FatigueAssessmentSumAggregateInputType
    _min?: FatigueAssessmentMinAggregateInputType
    _max?: FatigueAssessmentMaxAggregateInputType
  }

  export type FatigueAssessmentGroupByOutputType = {
    id: string
    createdAt: Date
    updatedAt: Date
    userId: string
    sessionId: string | null
    overallFatigue: number
    physicalFatigue: number
    mentalFatigue: number
    sleepQuality: number
    stressLevel: number
    notes: string | null
    previousWorkout: string | null
    timeSinceLastWorkout: number | null
    assessmentType: string
    isActive: boolean
    _count: FatigueAssessmentCountAggregateOutputType | null
    _avg: FatigueAssessmentAvgAggregateOutputType | null
    _sum: FatigueAssessmentSumAggregateOutputType | null
    _min: FatigueAssessmentMinAggregateOutputType | null
    _max: FatigueAssessmentMaxAggregateOutputType | null
  }

  type GetFatigueAssessmentGroupByPayload<T extends FatigueAssessmentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<FatigueAssessmentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof FatigueAssessmentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], FatigueAssessmentGroupByOutputType[P]>
            : GetScalarType<T[P], FatigueAssessmentGroupByOutputType[P]>
        }
      >
    >


  export type FatigueAssessmentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    sessionId?: boolean
    overallFatigue?: boolean
    physicalFatigue?: boolean
    mentalFatigue?: boolean
    sleepQuality?: boolean
    stressLevel?: boolean
    notes?: boolean
    previousWorkout?: boolean
    timeSinceLastWorkout?: boolean
    assessmentType?: boolean
    isActive?: boolean
  }, ExtArgs["result"]["fatigueAssessment"]>

  export type FatigueAssessmentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    sessionId?: boolean
    overallFatigue?: boolean
    physicalFatigue?: boolean
    mentalFatigue?: boolean
    sleepQuality?: boolean
    stressLevel?: boolean
    notes?: boolean
    previousWorkout?: boolean
    timeSinceLastWorkout?: boolean
    assessmentType?: boolean
    isActive?: boolean
  }, ExtArgs["result"]["fatigueAssessment"]>

  export type FatigueAssessmentSelectScalar = {
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    sessionId?: boolean
    overallFatigue?: boolean
    physicalFatigue?: boolean
    mentalFatigue?: boolean
    sleepQuality?: boolean
    stressLevel?: boolean
    notes?: boolean
    previousWorkout?: boolean
    timeSinceLastWorkout?: boolean
    assessmentType?: boolean
    isActive?: boolean
  }


  export type $FatigueAssessmentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "FatigueAssessment"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      createdAt: Date
      updatedAt: Date
      userId: string
      sessionId: string | null
      overallFatigue: number
      physicalFatigue: number
      mentalFatigue: number
      sleepQuality: number
      stressLevel: number
      notes: string | null
      previousWorkout: string | null
      timeSinceLastWorkout: number | null
      assessmentType: string
      isActive: boolean
    }, ExtArgs["result"]["fatigueAssessment"]>
    composites: {}
  }

  type FatigueAssessmentGetPayload<S extends boolean | null | undefined | FatigueAssessmentDefaultArgs> = $Result.GetResult<Prisma.$FatigueAssessmentPayload, S>

  type FatigueAssessmentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<FatigueAssessmentFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: FatigueAssessmentCountAggregateInputType | true
    }

  export interface FatigueAssessmentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['FatigueAssessment'], meta: { name: 'FatigueAssessment' } }
    /**
     * Find zero or one FatigueAssessment that matches the filter.
     * @param {FatigueAssessmentFindUniqueArgs} args - Arguments to find a FatigueAssessment
     * @example
     * // Get one FatigueAssessment
     * const fatigueAssessment = await prisma.fatigueAssessment.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends FatigueAssessmentFindUniqueArgs>(args: SelectSubset<T, FatigueAssessmentFindUniqueArgs<ExtArgs>>): Prisma__FatigueAssessmentClient<$Result.GetResult<Prisma.$FatigueAssessmentPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one FatigueAssessment that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {FatigueAssessmentFindUniqueOrThrowArgs} args - Arguments to find a FatigueAssessment
     * @example
     * // Get one FatigueAssessment
     * const fatigueAssessment = await prisma.fatigueAssessment.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends FatigueAssessmentFindUniqueOrThrowArgs>(args: SelectSubset<T, FatigueAssessmentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__FatigueAssessmentClient<$Result.GetResult<Prisma.$FatigueAssessmentPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first FatigueAssessment that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FatigueAssessmentFindFirstArgs} args - Arguments to find a FatigueAssessment
     * @example
     * // Get one FatigueAssessment
     * const fatigueAssessment = await prisma.fatigueAssessment.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends FatigueAssessmentFindFirstArgs>(args?: SelectSubset<T, FatigueAssessmentFindFirstArgs<ExtArgs>>): Prisma__FatigueAssessmentClient<$Result.GetResult<Prisma.$FatigueAssessmentPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first FatigueAssessment that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FatigueAssessmentFindFirstOrThrowArgs} args - Arguments to find a FatigueAssessment
     * @example
     * // Get one FatigueAssessment
     * const fatigueAssessment = await prisma.fatigueAssessment.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends FatigueAssessmentFindFirstOrThrowArgs>(args?: SelectSubset<T, FatigueAssessmentFindFirstOrThrowArgs<ExtArgs>>): Prisma__FatigueAssessmentClient<$Result.GetResult<Prisma.$FatigueAssessmentPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more FatigueAssessments that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FatigueAssessmentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all FatigueAssessments
     * const fatigueAssessments = await prisma.fatigueAssessment.findMany()
     * 
     * // Get first 10 FatigueAssessments
     * const fatigueAssessments = await prisma.fatigueAssessment.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const fatigueAssessmentWithIdOnly = await prisma.fatigueAssessment.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends FatigueAssessmentFindManyArgs>(args?: SelectSubset<T, FatigueAssessmentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FatigueAssessmentPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a FatigueAssessment.
     * @param {FatigueAssessmentCreateArgs} args - Arguments to create a FatigueAssessment.
     * @example
     * // Create one FatigueAssessment
     * const FatigueAssessment = await prisma.fatigueAssessment.create({
     *   data: {
     *     // ... data to create a FatigueAssessment
     *   }
     * })
     * 
     */
    create<T extends FatigueAssessmentCreateArgs>(args: SelectSubset<T, FatigueAssessmentCreateArgs<ExtArgs>>): Prisma__FatigueAssessmentClient<$Result.GetResult<Prisma.$FatigueAssessmentPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many FatigueAssessments.
     * @param {FatigueAssessmentCreateManyArgs} args - Arguments to create many FatigueAssessments.
     * @example
     * // Create many FatigueAssessments
     * const fatigueAssessment = await prisma.fatigueAssessment.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends FatigueAssessmentCreateManyArgs>(args?: SelectSubset<T, FatigueAssessmentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many FatigueAssessments and returns the data saved in the database.
     * @param {FatigueAssessmentCreateManyAndReturnArgs} args - Arguments to create many FatigueAssessments.
     * @example
     * // Create many FatigueAssessments
     * const fatigueAssessment = await prisma.fatigueAssessment.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many FatigueAssessments and only return the `id`
     * const fatigueAssessmentWithIdOnly = await prisma.fatigueAssessment.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends FatigueAssessmentCreateManyAndReturnArgs>(args?: SelectSubset<T, FatigueAssessmentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FatigueAssessmentPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a FatigueAssessment.
     * @param {FatigueAssessmentDeleteArgs} args - Arguments to delete one FatigueAssessment.
     * @example
     * // Delete one FatigueAssessment
     * const FatigueAssessment = await prisma.fatigueAssessment.delete({
     *   where: {
     *     // ... filter to delete one FatigueAssessment
     *   }
     * })
     * 
     */
    delete<T extends FatigueAssessmentDeleteArgs>(args: SelectSubset<T, FatigueAssessmentDeleteArgs<ExtArgs>>): Prisma__FatigueAssessmentClient<$Result.GetResult<Prisma.$FatigueAssessmentPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one FatigueAssessment.
     * @param {FatigueAssessmentUpdateArgs} args - Arguments to update one FatigueAssessment.
     * @example
     * // Update one FatigueAssessment
     * const fatigueAssessment = await prisma.fatigueAssessment.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends FatigueAssessmentUpdateArgs>(args: SelectSubset<T, FatigueAssessmentUpdateArgs<ExtArgs>>): Prisma__FatigueAssessmentClient<$Result.GetResult<Prisma.$FatigueAssessmentPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more FatigueAssessments.
     * @param {FatigueAssessmentDeleteManyArgs} args - Arguments to filter FatigueAssessments to delete.
     * @example
     * // Delete a few FatigueAssessments
     * const { count } = await prisma.fatigueAssessment.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends FatigueAssessmentDeleteManyArgs>(args?: SelectSubset<T, FatigueAssessmentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more FatigueAssessments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FatigueAssessmentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many FatigueAssessments
     * const fatigueAssessment = await prisma.fatigueAssessment.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends FatigueAssessmentUpdateManyArgs>(args: SelectSubset<T, FatigueAssessmentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one FatigueAssessment.
     * @param {FatigueAssessmentUpsertArgs} args - Arguments to update or create a FatigueAssessment.
     * @example
     * // Update or create a FatigueAssessment
     * const fatigueAssessment = await prisma.fatigueAssessment.upsert({
     *   create: {
     *     // ... data to create a FatigueAssessment
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the FatigueAssessment we want to update
     *   }
     * })
     */
    upsert<T extends FatigueAssessmentUpsertArgs>(args: SelectSubset<T, FatigueAssessmentUpsertArgs<ExtArgs>>): Prisma__FatigueAssessmentClient<$Result.GetResult<Prisma.$FatigueAssessmentPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of FatigueAssessments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FatigueAssessmentCountArgs} args - Arguments to filter FatigueAssessments to count.
     * @example
     * // Count the number of FatigueAssessments
     * const count = await prisma.fatigueAssessment.count({
     *   where: {
     *     // ... the filter for the FatigueAssessments we want to count
     *   }
     * })
    **/
    count<T extends FatigueAssessmentCountArgs>(
      args?: Subset<T, FatigueAssessmentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], FatigueAssessmentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a FatigueAssessment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FatigueAssessmentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends FatigueAssessmentAggregateArgs>(args: Subset<T, FatigueAssessmentAggregateArgs>): Prisma.PrismaPromise<GetFatigueAssessmentAggregateType<T>>

    /**
     * Group by FatigueAssessment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FatigueAssessmentGroupByArgs} args - Group by arguments.
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
      T extends FatigueAssessmentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: FatigueAssessmentGroupByArgs['orderBy'] }
        : { orderBy?: FatigueAssessmentGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, FatigueAssessmentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFatigueAssessmentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the FatigueAssessment model
   */
  readonly fields: FatigueAssessmentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for FatigueAssessment.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__FatigueAssessmentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the FatigueAssessment model
   */ 
  interface FatigueAssessmentFieldRefs {
    readonly id: FieldRef<"FatigueAssessment", 'String'>
    readonly createdAt: FieldRef<"FatigueAssessment", 'DateTime'>
    readonly updatedAt: FieldRef<"FatigueAssessment", 'DateTime'>
    readonly userId: FieldRef<"FatigueAssessment", 'String'>
    readonly sessionId: FieldRef<"FatigueAssessment", 'String'>
    readonly overallFatigue: FieldRef<"FatigueAssessment", 'Int'>
    readonly physicalFatigue: FieldRef<"FatigueAssessment", 'Int'>
    readonly mentalFatigue: FieldRef<"FatigueAssessment", 'Int'>
    readonly sleepQuality: FieldRef<"FatigueAssessment", 'Int'>
    readonly stressLevel: FieldRef<"FatigueAssessment", 'Int'>
    readonly notes: FieldRef<"FatigueAssessment", 'String'>
    readonly previousWorkout: FieldRef<"FatigueAssessment", 'String'>
    readonly timeSinceLastWorkout: FieldRef<"FatigueAssessment", 'Int'>
    readonly assessmentType: FieldRef<"FatigueAssessment", 'String'>
    readonly isActive: FieldRef<"FatigueAssessment", 'Boolean'>
  }
    

  // Custom InputTypes
  /**
   * FatigueAssessment findUnique
   */
  export type FatigueAssessmentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FatigueAssessment
     */
    select?: FatigueAssessmentSelect<ExtArgs> | null
    /**
     * Filter, which FatigueAssessment to fetch.
     */
    where: FatigueAssessmentWhereUniqueInput
  }

  /**
   * FatigueAssessment findUniqueOrThrow
   */
  export type FatigueAssessmentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FatigueAssessment
     */
    select?: FatigueAssessmentSelect<ExtArgs> | null
    /**
     * Filter, which FatigueAssessment to fetch.
     */
    where: FatigueAssessmentWhereUniqueInput
  }

  /**
   * FatigueAssessment findFirst
   */
  export type FatigueAssessmentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FatigueAssessment
     */
    select?: FatigueAssessmentSelect<ExtArgs> | null
    /**
     * Filter, which FatigueAssessment to fetch.
     */
    where?: FatigueAssessmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FatigueAssessments to fetch.
     */
    orderBy?: FatigueAssessmentOrderByWithRelationInput | FatigueAssessmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FatigueAssessments.
     */
    cursor?: FatigueAssessmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FatigueAssessments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FatigueAssessments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FatigueAssessments.
     */
    distinct?: FatigueAssessmentScalarFieldEnum | FatigueAssessmentScalarFieldEnum[]
  }

  /**
   * FatigueAssessment findFirstOrThrow
   */
  export type FatigueAssessmentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FatigueAssessment
     */
    select?: FatigueAssessmentSelect<ExtArgs> | null
    /**
     * Filter, which FatigueAssessment to fetch.
     */
    where?: FatigueAssessmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FatigueAssessments to fetch.
     */
    orderBy?: FatigueAssessmentOrderByWithRelationInput | FatigueAssessmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FatigueAssessments.
     */
    cursor?: FatigueAssessmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FatigueAssessments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FatigueAssessments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FatigueAssessments.
     */
    distinct?: FatigueAssessmentScalarFieldEnum | FatigueAssessmentScalarFieldEnum[]
  }

  /**
   * FatigueAssessment findMany
   */
  export type FatigueAssessmentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FatigueAssessment
     */
    select?: FatigueAssessmentSelect<ExtArgs> | null
    /**
     * Filter, which FatigueAssessments to fetch.
     */
    where?: FatigueAssessmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FatigueAssessments to fetch.
     */
    orderBy?: FatigueAssessmentOrderByWithRelationInput | FatigueAssessmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing FatigueAssessments.
     */
    cursor?: FatigueAssessmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FatigueAssessments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FatigueAssessments.
     */
    skip?: number
    distinct?: FatigueAssessmentScalarFieldEnum | FatigueAssessmentScalarFieldEnum[]
  }

  /**
   * FatigueAssessment create
   */
  export type FatigueAssessmentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FatigueAssessment
     */
    select?: FatigueAssessmentSelect<ExtArgs> | null
    /**
     * The data needed to create a FatigueAssessment.
     */
    data: XOR<FatigueAssessmentCreateInput, FatigueAssessmentUncheckedCreateInput>
  }

  /**
   * FatigueAssessment createMany
   */
  export type FatigueAssessmentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many FatigueAssessments.
     */
    data: FatigueAssessmentCreateManyInput | FatigueAssessmentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * FatigueAssessment createManyAndReturn
   */
  export type FatigueAssessmentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FatigueAssessment
     */
    select?: FatigueAssessmentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many FatigueAssessments.
     */
    data: FatigueAssessmentCreateManyInput | FatigueAssessmentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * FatigueAssessment update
   */
  export type FatigueAssessmentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FatigueAssessment
     */
    select?: FatigueAssessmentSelect<ExtArgs> | null
    /**
     * The data needed to update a FatigueAssessment.
     */
    data: XOR<FatigueAssessmentUpdateInput, FatigueAssessmentUncheckedUpdateInput>
    /**
     * Choose, which FatigueAssessment to update.
     */
    where: FatigueAssessmentWhereUniqueInput
  }

  /**
   * FatigueAssessment updateMany
   */
  export type FatigueAssessmentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update FatigueAssessments.
     */
    data: XOR<FatigueAssessmentUpdateManyMutationInput, FatigueAssessmentUncheckedUpdateManyInput>
    /**
     * Filter which FatigueAssessments to update
     */
    where?: FatigueAssessmentWhereInput
  }

  /**
   * FatigueAssessment upsert
   */
  export type FatigueAssessmentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FatigueAssessment
     */
    select?: FatigueAssessmentSelect<ExtArgs> | null
    /**
     * The filter to search for the FatigueAssessment to update in case it exists.
     */
    where: FatigueAssessmentWhereUniqueInput
    /**
     * In case the FatigueAssessment found by the `where` argument doesn't exist, create a new FatigueAssessment with this data.
     */
    create: XOR<FatigueAssessmentCreateInput, FatigueAssessmentUncheckedCreateInput>
    /**
     * In case the FatigueAssessment was found with the provided `where` argument, update it with this data.
     */
    update: XOR<FatigueAssessmentUpdateInput, FatigueAssessmentUncheckedUpdateInput>
  }

  /**
   * FatigueAssessment delete
   */
  export type FatigueAssessmentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FatigueAssessment
     */
    select?: FatigueAssessmentSelect<ExtArgs> | null
    /**
     * Filter which FatigueAssessment to delete.
     */
    where: FatigueAssessmentWhereUniqueInput
  }

  /**
   * FatigueAssessment deleteMany
   */
  export type FatigueAssessmentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FatigueAssessments to delete
     */
    where?: FatigueAssessmentWhereInput
  }

  /**
   * FatigueAssessment without action
   */
  export type FatigueAssessmentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FatigueAssessment
     */
    select?: FatigueAssessmentSelect<ExtArgs> | null
  }


  /**
   * Model TrainingAdjustment
   */

  export type AggregateTrainingAdjustment = {
    _count: TrainingAdjustmentCountAggregateOutputType | null
    _avg: TrainingAdjustmentAvgAggregateOutputType | null
    _sum: TrainingAdjustmentSumAggregateOutputType | null
    _min: TrainingAdjustmentMinAggregateOutputType | null
    _max: TrainingAdjustmentMaxAggregateOutputType | null
  }

  export type TrainingAdjustmentAvgAggregateOutputType = {
    confidence: number | null
    fatigueLevel: number | null
  }

  export type TrainingAdjustmentSumAggregateOutputType = {
    confidence: number | null
    fatigueLevel: number | null
  }

  export type TrainingAdjustmentMinAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    updatedAt: Date | null
    userId: string | null
    sessionId: string | null
    planId: string | null
    adjustmentType: string | null
    reason: string | null
    confidence: number | null
    fatigueLevel: number | null
    exerciseId: string | null
    exerciseName: string | null
    isApplied: boolean | null
    appliedAt: Date | null
    userFeedback: string | null
  }

  export type TrainingAdjustmentMaxAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    updatedAt: Date | null
    userId: string | null
    sessionId: string | null
    planId: string | null
    adjustmentType: string | null
    reason: string | null
    confidence: number | null
    fatigueLevel: number | null
    exerciseId: string | null
    exerciseName: string | null
    isApplied: boolean | null
    appliedAt: Date | null
    userFeedback: string | null
  }

  export type TrainingAdjustmentCountAggregateOutputType = {
    id: number
    createdAt: number
    updatedAt: number
    userId: number
    sessionId: number
    planId: number
    adjustmentType: number
    originalValue: number
    adjustedValue: number
    reason: number
    confidence: number
    fatigueLevel: number
    exerciseId: number
    exerciseName: number
    isApplied: number
    appliedAt: number
    userFeedback: number
    _all: number
  }


  export type TrainingAdjustmentAvgAggregateInputType = {
    confidence?: true
    fatigueLevel?: true
  }

  export type TrainingAdjustmentSumAggregateInputType = {
    confidence?: true
    fatigueLevel?: true
  }

  export type TrainingAdjustmentMinAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
    sessionId?: true
    planId?: true
    adjustmentType?: true
    reason?: true
    confidence?: true
    fatigueLevel?: true
    exerciseId?: true
    exerciseName?: true
    isApplied?: true
    appliedAt?: true
    userFeedback?: true
  }

  export type TrainingAdjustmentMaxAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
    sessionId?: true
    planId?: true
    adjustmentType?: true
    reason?: true
    confidence?: true
    fatigueLevel?: true
    exerciseId?: true
    exerciseName?: true
    isApplied?: true
    appliedAt?: true
    userFeedback?: true
  }

  export type TrainingAdjustmentCountAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
    sessionId?: true
    planId?: true
    adjustmentType?: true
    originalValue?: true
    adjustedValue?: true
    reason?: true
    confidence?: true
    fatigueLevel?: true
    exerciseId?: true
    exerciseName?: true
    isApplied?: true
    appliedAt?: true
    userFeedback?: true
    _all?: true
  }

  export type TrainingAdjustmentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TrainingAdjustment to aggregate.
     */
    where?: TrainingAdjustmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TrainingAdjustments to fetch.
     */
    orderBy?: TrainingAdjustmentOrderByWithRelationInput | TrainingAdjustmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TrainingAdjustmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TrainingAdjustments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TrainingAdjustments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TrainingAdjustments
    **/
    _count?: true | TrainingAdjustmentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TrainingAdjustmentAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TrainingAdjustmentSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TrainingAdjustmentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TrainingAdjustmentMaxAggregateInputType
  }

  export type GetTrainingAdjustmentAggregateType<T extends TrainingAdjustmentAggregateArgs> = {
        [P in keyof T & keyof AggregateTrainingAdjustment]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTrainingAdjustment[P]>
      : GetScalarType<T[P], AggregateTrainingAdjustment[P]>
  }




  export type TrainingAdjustmentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TrainingAdjustmentWhereInput
    orderBy?: TrainingAdjustmentOrderByWithAggregationInput | TrainingAdjustmentOrderByWithAggregationInput[]
    by: TrainingAdjustmentScalarFieldEnum[] | TrainingAdjustmentScalarFieldEnum
    having?: TrainingAdjustmentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TrainingAdjustmentCountAggregateInputType | true
    _avg?: TrainingAdjustmentAvgAggregateInputType
    _sum?: TrainingAdjustmentSumAggregateInputType
    _min?: TrainingAdjustmentMinAggregateInputType
    _max?: TrainingAdjustmentMaxAggregateInputType
  }

  export type TrainingAdjustmentGroupByOutputType = {
    id: string
    createdAt: Date
    updatedAt: Date
    userId: string
    sessionId: string | null
    planId: string | null
    adjustmentType: string
    originalValue: JsonValue
    adjustedValue: JsonValue
    reason: string
    confidence: number
    fatigueLevel: number
    exerciseId: string | null
    exerciseName: string | null
    isApplied: boolean
    appliedAt: Date | null
    userFeedback: string | null
    _count: TrainingAdjustmentCountAggregateOutputType | null
    _avg: TrainingAdjustmentAvgAggregateOutputType | null
    _sum: TrainingAdjustmentSumAggregateOutputType | null
    _min: TrainingAdjustmentMinAggregateOutputType | null
    _max: TrainingAdjustmentMaxAggregateOutputType | null
  }

  type GetTrainingAdjustmentGroupByPayload<T extends TrainingAdjustmentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TrainingAdjustmentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TrainingAdjustmentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TrainingAdjustmentGroupByOutputType[P]>
            : GetScalarType<T[P], TrainingAdjustmentGroupByOutputType[P]>
        }
      >
    >


  export type TrainingAdjustmentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    sessionId?: boolean
    planId?: boolean
    adjustmentType?: boolean
    originalValue?: boolean
    adjustedValue?: boolean
    reason?: boolean
    confidence?: boolean
    fatigueLevel?: boolean
    exerciseId?: boolean
    exerciseName?: boolean
    isApplied?: boolean
    appliedAt?: boolean
    userFeedback?: boolean
  }, ExtArgs["result"]["trainingAdjustment"]>

  export type TrainingAdjustmentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    sessionId?: boolean
    planId?: boolean
    adjustmentType?: boolean
    originalValue?: boolean
    adjustedValue?: boolean
    reason?: boolean
    confidence?: boolean
    fatigueLevel?: boolean
    exerciseId?: boolean
    exerciseName?: boolean
    isApplied?: boolean
    appliedAt?: boolean
    userFeedback?: boolean
  }, ExtArgs["result"]["trainingAdjustment"]>

  export type TrainingAdjustmentSelectScalar = {
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    sessionId?: boolean
    planId?: boolean
    adjustmentType?: boolean
    originalValue?: boolean
    adjustedValue?: boolean
    reason?: boolean
    confidence?: boolean
    fatigueLevel?: boolean
    exerciseId?: boolean
    exerciseName?: boolean
    isApplied?: boolean
    appliedAt?: boolean
    userFeedback?: boolean
  }


  export type $TrainingAdjustmentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TrainingAdjustment"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      createdAt: Date
      updatedAt: Date
      userId: string
      sessionId: string | null
      planId: string | null
      adjustmentType: string
      originalValue: Prisma.JsonValue
      adjustedValue: Prisma.JsonValue
      reason: string
      confidence: number
      fatigueLevel: number
      exerciseId: string | null
      exerciseName: string | null
      isApplied: boolean
      appliedAt: Date | null
      userFeedback: string | null
    }, ExtArgs["result"]["trainingAdjustment"]>
    composites: {}
  }

  type TrainingAdjustmentGetPayload<S extends boolean | null | undefined | TrainingAdjustmentDefaultArgs> = $Result.GetResult<Prisma.$TrainingAdjustmentPayload, S>

  type TrainingAdjustmentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<TrainingAdjustmentFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: TrainingAdjustmentCountAggregateInputType | true
    }

  export interface TrainingAdjustmentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TrainingAdjustment'], meta: { name: 'TrainingAdjustment' } }
    /**
     * Find zero or one TrainingAdjustment that matches the filter.
     * @param {TrainingAdjustmentFindUniqueArgs} args - Arguments to find a TrainingAdjustment
     * @example
     * // Get one TrainingAdjustment
     * const trainingAdjustment = await prisma.trainingAdjustment.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TrainingAdjustmentFindUniqueArgs>(args: SelectSubset<T, TrainingAdjustmentFindUniqueArgs<ExtArgs>>): Prisma__TrainingAdjustmentClient<$Result.GetResult<Prisma.$TrainingAdjustmentPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one TrainingAdjustment that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {TrainingAdjustmentFindUniqueOrThrowArgs} args - Arguments to find a TrainingAdjustment
     * @example
     * // Get one TrainingAdjustment
     * const trainingAdjustment = await prisma.trainingAdjustment.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TrainingAdjustmentFindUniqueOrThrowArgs>(args: SelectSubset<T, TrainingAdjustmentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TrainingAdjustmentClient<$Result.GetResult<Prisma.$TrainingAdjustmentPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first TrainingAdjustment that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrainingAdjustmentFindFirstArgs} args - Arguments to find a TrainingAdjustment
     * @example
     * // Get one TrainingAdjustment
     * const trainingAdjustment = await prisma.trainingAdjustment.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TrainingAdjustmentFindFirstArgs>(args?: SelectSubset<T, TrainingAdjustmentFindFirstArgs<ExtArgs>>): Prisma__TrainingAdjustmentClient<$Result.GetResult<Prisma.$TrainingAdjustmentPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first TrainingAdjustment that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrainingAdjustmentFindFirstOrThrowArgs} args - Arguments to find a TrainingAdjustment
     * @example
     * // Get one TrainingAdjustment
     * const trainingAdjustment = await prisma.trainingAdjustment.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TrainingAdjustmentFindFirstOrThrowArgs>(args?: SelectSubset<T, TrainingAdjustmentFindFirstOrThrowArgs<ExtArgs>>): Prisma__TrainingAdjustmentClient<$Result.GetResult<Prisma.$TrainingAdjustmentPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more TrainingAdjustments that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrainingAdjustmentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TrainingAdjustments
     * const trainingAdjustments = await prisma.trainingAdjustment.findMany()
     * 
     * // Get first 10 TrainingAdjustments
     * const trainingAdjustments = await prisma.trainingAdjustment.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const trainingAdjustmentWithIdOnly = await prisma.trainingAdjustment.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TrainingAdjustmentFindManyArgs>(args?: SelectSubset<T, TrainingAdjustmentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TrainingAdjustmentPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a TrainingAdjustment.
     * @param {TrainingAdjustmentCreateArgs} args - Arguments to create a TrainingAdjustment.
     * @example
     * // Create one TrainingAdjustment
     * const TrainingAdjustment = await prisma.trainingAdjustment.create({
     *   data: {
     *     // ... data to create a TrainingAdjustment
     *   }
     * })
     * 
     */
    create<T extends TrainingAdjustmentCreateArgs>(args: SelectSubset<T, TrainingAdjustmentCreateArgs<ExtArgs>>): Prisma__TrainingAdjustmentClient<$Result.GetResult<Prisma.$TrainingAdjustmentPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many TrainingAdjustments.
     * @param {TrainingAdjustmentCreateManyArgs} args - Arguments to create many TrainingAdjustments.
     * @example
     * // Create many TrainingAdjustments
     * const trainingAdjustment = await prisma.trainingAdjustment.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TrainingAdjustmentCreateManyArgs>(args?: SelectSubset<T, TrainingAdjustmentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TrainingAdjustments and returns the data saved in the database.
     * @param {TrainingAdjustmentCreateManyAndReturnArgs} args - Arguments to create many TrainingAdjustments.
     * @example
     * // Create many TrainingAdjustments
     * const trainingAdjustment = await prisma.trainingAdjustment.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TrainingAdjustments and only return the `id`
     * const trainingAdjustmentWithIdOnly = await prisma.trainingAdjustment.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TrainingAdjustmentCreateManyAndReturnArgs>(args?: SelectSubset<T, TrainingAdjustmentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TrainingAdjustmentPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a TrainingAdjustment.
     * @param {TrainingAdjustmentDeleteArgs} args - Arguments to delete one TrainingAdjustment.
     * @example
     * // Delete one TrainingAdjustment
     * const TrainingAdjustment = await prisma.trainingAdjustment.delete({
     *   where: {
     *     // ... filter to delete one TrainingAdjustment
     *   }
     * })
     * 
     */
    delete<T extends TrainingAdjustmentDeleteArgs>(args: SelectSubset<T, TrainingAdjustmentDeleteArgs<ExtArgs>>): Prisma__TrainingAdjustmentClient<$Result.GetResult<Prisma.$TrainingAdjustmentPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one TrainingAdjustment.
     * @param {TrainingAdjustmentUpdateArgs} args - Arguments to update one TrainingAdjustment.
     * @example
     * // Update one TrainingAdjustment
     * const trainingAdjustment = await prisma.trainingAdjustment.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TrainingAdjustmentUpdateArgs>(args: SelectSubset<T, TrainingAdjustmentUpdateArgs<ExtArgs>>): Prisma__TrainingAdjustmentClient<$Result.GetResult<Prisma.$TrainingAdjustmentPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more TrainingAdjustments.
     * @param {TrainingAdjustmentDeleteManyArgs} args - Arguments to filter TrainingAdjustments to delete.
     * @example
     * // Delete a few TrainingAdjustments
     * const { count } = await prisma.trainingAdjustment.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TrainingAdjustmentDeleteManyArgs>(args?: SelectSubset<T, TrainingAdjustmentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TrainingAdjustments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrainingAdjustmentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TrainingAdjustments
     * const trainingAdjustment = await prisma.trainingAdjustment.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TrainingAdjustmentUpdateManyArgs>(args: SelectSubset<T, TrainingAdjustmentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one TrainingAdjustment.
     * @param {TrainingAdjustmentUpsertArgs} args - Arguments to update or create a TrainingAdjustment.
     * @example
     * // Update or create a TrainingAdjustment
     * const trainingAdjustment = await prisma.trainingAdjustment.upsert({
     *   create: {
     *     // ... data to create a TrainingAdjustment
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TrainingAdjustment we want to update
     *   }
     * })
     */
    upsert<T extends TrainingAdjustmentUpsertArgs>(args: SelectSubset<T, TrainingAdjustmentUpsertArgs<ExtArgs>>): Prisma__TrainingAdjustmentClient<$Result.GetResult<Prisma.$TrainingAdjustmentPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of TrainingAdjustments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrainingAdjustmentCountArgs} args - Arguments to filter TrainingAdjustments to count.
     * @example
     * // Count the number of TrainingAdjustments
     * const count = await prisma.trainingAdjustment.count({
     *   where: {
     *     // ... the filter for the TrainingAdjustments we want to count
     *   }
     * })
    **/
    count<T extends TrainingAdjustmentCountArgs>(
      args?: Subset<T, TrainingAdjustmentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TrainingAdjustmentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TrainingAdjustment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrainingAdjustmentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends TrainingAdjustmentAggregateArgs>(args: Subset<T, TrainingAdjustmentAggregateArgs>): Prisma.PrismaPromise<GetTrainingAdjustmentAggregateType<T>>

    /**
     * Group by TrainingAdjustment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrainingAdjustmentGroupByArgs} args - Group by arguments.
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
      T extends TrainingAdjustmentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TrainingAdjustmentGroupByArgs['orderBy'] }
        : { orderBy?: TrainingAdjustmentGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, TrainingAdjustmentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTrainingAdjustmentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TrainingAdjustment model
   */
  readonly fields: TrainingAdjustmentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TrainingAdjustment.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TrainingAdjustmentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the TrainingAdjustment model
   */ 
  interface TrainingAdjustmentFieldRefs {
    readonly id: FieldRef<"TrainingAdjustment", 'String'>
    readonly createdAt: FieldRef<"TrainingAdjustment", 'DateTime'>
    readonly updatedAt: FieldRef<"TrainingAdjustment", 'DateTime'>
    readonly userId: FieldRef<"TrainingAdjustment", 'String'>
    readonly sessionId: FieldRef<"TrainingAdjustment", 'String'>
    readonly planId: FieldRef<"TrainingAdjustment", 'String'>
    readonly adjustmentType: FieldRef<"TrainingAdjustment", 'String'>
    readonly originalValue: FieldRef<"TrainingAdjustment", 'Json'>
    readonly adjustedValue: FieldRef<"TrainingAdjustment", 'Json'>
    readonly reason: FieldRef<"TrainingAdjustment", 'String'>
    readonly confidence: FieldRef<"TrainingAdjustment", 'Float'>
    readonly fatigueLevel: FieldRef<"TrainingAdjustment", 'Int'>
    readonly exerciseId: FieldRef<"TrainingAdjustment", 'String'>
    readonly exerciseName: FieldRef<"TrainingAdjustment", 'String'>
    readonly isApplied: FieldRef<"TrainingAdjustment", 'Boolean'>
    readonly appliedAt: FieldRef<"TrainingAdjustment", 'DateTime'>
    readonly userFeedback: FieldRef<"TrainingAdjustment", 'String'>
  }
    

  // Custom InputTypes
  /**
   * TrainingAdjustment findUnique
   */
  export type TrainingAdjustmentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingAdjustment
     */
    select?: TrainingAdjustmentSelect<ExtArgs> | null
    /**
     * Filter, which TrainingAdjustment to fetch.
     */
    where: TrainingAdjustmentWhereUniqueInput
  }

  /**
   * TrainingAdjustment findUniqueOrThrow
   */
  export type TrainingAdjustmentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingAdjustment
     */
    select?: TrainingAdjustmentSelect<ExtArgs> | null
    /**
     * Filter, which TrainingAdjustment to fetch.
     */
    where: TrainingAdjustmentWhereUniqueInput
  }

  /**
   * TrainingAdjustment findFirst
   */
  export type TrainingAdjustmentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingAdjustment
     */
    select?: TrainingAdjustmentSelect<ExtArgs> | null
    /**
     * Filter, which TrainingAdjustment to fetch.
     */
    where?: TrainingAdjustmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TrainingAdjustments to fetch.
     */
    orderBy?: TrainingAdjustmentOrderByWithRelationInput | TrainingAdjustmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TrainingAdjustments.
     */
    cursor?: TrainingAdjustmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TrainingAdjustments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TrainingAdjustments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TrainingAdjustments.
     */
    distinct?: TrainingAdjustmentScalarFieldEnum | TrainingAdjustmentScalarFieldEnum[]
  }

  /**
   * TrainingAdjustment findFirstOrThrow
   */
  export type TrainingAdjustmentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingAdjustment
     */
    select?: TrainingAdjustmentSelect<ExtArgs> | null
    /**
     * Filter, which TrainingAdjustment to fetch.
     */
    where?: TrainingAdjustmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TrainingAdjustments to fetch.
     */
    orderBy?: TrainingAdjustmentOrderByWithRelationInput | TrainingAdjustmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TrainingAdjustments.
     */
    cursor?: TrainingAdjustmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TrainingAdjustments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TrainingAdjustments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TrainingAdjustments.
     */
    distinct?: TrainingAdjustmentScalarFieldEnum | TrainingAdjustmentScalarFieldEnum[]
  }

  /**
   * TrainingAdjustment findMany
   */
  export type TrainingAdjustmentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingAdjustment
     */
    select?: TrainingAdjustmentSelect<ExtArgs> | null
    /**
     * Filter, which TrainingAdjustments to fetch.
     */
    where?: TrainingAdjustmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TrainingAdjustments to fetch.
     */
    orderBy?: TrainingAdjustmentOrderByWithRelationInput | TrainingAdjustmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TrainingAdjustments.
     */
    cursor?: TrainingAdjustmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TrainingAdjustments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TrainingAdjustments.
     */
    skip?: number
    distinct?: TrainingAdjustmentScalarFieldEnum | TrainingAdjustmentScalarFieldEnum[]
  }

  /**
   * TrainingAdjustment create
   */
  export type TrainingAdjustmentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingAdjustment
     */
    select?: TrainingAdjustmentSelect<ExtArgs> | null
    /**
     * The data needed to create a TrainingAdjustment.
     */
    data: XOR<TrainingAdjustmentCreateInput, TrainingAdjustmentUncheckedCreateInput>
  }

  /**
   * TrainingAdjustment createMany
   */
  export type TrainingAdjustmentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TrainingAdjustments.
     */
    data: TrainingAdjustmentCreateManyInput | TrainingAdjustmentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TrainingAdjustment createManyAndReturn
   */
  export type TrainingAdjustmentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingAdjustment
     */
    select?: TrainingAdjustmentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many TrainingAdjustments.
     */
    data: TrainingAdjustmentCreateManyInput | TrainingAdjustmentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TrainingAdjustment update
   */
  export type TrainingAdjustmentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingAdjustment
     */
    select?: TrainingAdjustmentSelect<ExtArgs> | null
    /**
     * The data needed to update a TrainingAdjustment.
     */
    data: XOR<TrainingAdjustmentUpdateInput, TrainingAdjustmentUncheckedUpdateInput>
    /**
     * Choose, which TrainingAdjustment to update.
     */
    where: TrainingAdjustmentWhereUniqueInput
  }

  /**
   * TrainingAdjustment updateMany
   */
  export type TrainingAdjustmentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TrainingAdjustments.
     */
    data: XOR<TrainingAdjustmentUpdateManyMutationInput, TrainingAdjustmentUncheckedUpdateManyInput>
    /**
     * Filter which TrainingAdjustments to update
     */
    where?: TrainingAdjustmentWhereInput
  }

  /**
   * TrainingAdjustment upsert
   */
  export type TrainingAdjustmentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingAdjustment
     */
    select?: TrainingAdjustmentSelect<ExtArgs> | null
    /**
     * The filter to search for the TrainingAdjustment to update in case it exists.
     */
    where: TrainingAdjustmentWhereUniqueInput
    /**
     * In case the TrainingAdjustment found by the `where` argument doesn't exist, create a new TrainingAdjustment with this data.
     */
    create: XOR<TrainingAdjustmentCreateInput, TrainingAdjustmentUncheckedCreateInput>
    /**
     * In case the TrainingAdjustment was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TrainingAdjustmentUpdateInput, TrainingAdjustmentUncheckedUpdateInput>
  }

  /**
   * TrainingAdjustment delete
   */
  export type TrainingAdjustmentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingAdjustment
     */
    select?: TrainingAdjustmentSelect<ExtArgs> | null
    /**
     * Filter which TrainingAdjustment to delete.
     */
    where: TrainingAdjustmentWhereUniqueInput
  }

  /**
   * TrainingAdjustment deleteMany
   */
  export type TrainingAdjustmentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TrainingAdjustments to delete
     */
    where?: TrainingAdjustmentWhereInput
  }

  /**
   * TrainingAdjustment without action
   */
  export type TrainingAdjustmentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrainingAdjustment
     */
    select?: TrainingAdjustmentSelect<ExtArgs> | null
  }


  /**
   * Model FatiguePattern
   */

  export type AggregateFatiguePattern = {
    _count: FatiguePatternCountAggregateOutputType | null
    _avg: FatiguePatternAvgAggregateOutputType | null
    _sum: FatiguePatternSumAggregateOutputType | null
    _min: FatiguePatternMinAggregateOutputType | null
    _max: FatiguePatternMaxAggregateOutputType | null
  }

  export type FatiguePatternAvgAggregateOutputType = {
    dayOfWeek: number | null
    timeOfDay: number | null
    averageFatigue: number | null
    sampleCount: number | null
  }

  export type FatiguePatternSumAggregateOutputType = {
    dayOfWeek: number | null
    timeOfDay: number | null
    averageFatigue: number | null
    sampleCount: number | null
  }

  export type FatiguePatternMinAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    updatedAt: Date | null
    userId: string | null
    dayOfWeek: number | null
    timeOfDay: number | null
    averageFatigue: number | null
    sampleCount: number | null
    isActive: boolean | null
    lastUpdated: Date | null
  }

  export type FatiguePatternMaxAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    updatedAt: Date | null
    userId: string | null
    dayOfWeek: number | null
    timeOfDay: number | null
    averageFatigue: number | null
    sampleCount: number | null
    isActive: boolean | null
    lastUpdated: Date | null
  }

  export type FatiguePatternCountAggregateOutputType = {
    id: number
    createdAt: number
    updatedAt: number
    userId: number
    dayOfWeek: number
    timeOfDay: number
    averageFatigue: number
    sampleCount: number
    isActive: number
    lastUpdated: number
    _all: number
  }


  export type FatiguePatternAvgAggregateInputType = {
    dayOfWeek?: true
    timeOfDay?: true
    averageFatigue?: true
    sampleCount?: true
  }

  export type FatiguePatternSumAggregateInputType = {
    dayOfWeek?: true
    timeOfDay?: true
    averageFatigue?: true
    sampleCount?: true
  }

  export type FatiguePatternMinAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
    dayOfWeek?: true
    timeOfDay?: true
    averageFatigue?: true
    sampleCount?: true
    isActive?: true
    lastUpdated?: true
  }

  export type FatiguePatternMaxAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
    dayOfWeek?: true
    timeOfDay?: true
    averageFatigue?: true
    sampleCount?: true
    isActive?: true
    lastUpdated?: true
  }

  export type FatiguePatternCountAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
    dayOfWeek?: true
    timeOfDay?: true
    averageFatigue?: true
    sampleCount?: true
    isActive?: true
    lastUpdated?: true
    _all?: true
  }

  export type FatiguePatternAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FatiguePattern to aggregate.
     */
    where?: FatiguePatternWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FatiguePatterns to fetch.
     */
    orderBy?: FatiguePatternOrderByWithRelationInput | FatiguePatternOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: FatiguePatternWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FatiguePatterns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FatiguePatterns.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned FatiguePatterns
    **/
    _count?: true | FatiguePatternCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: FatiguePatternAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: FatiguePatternSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: FatiguePatternMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: FatiguePatternMaxAggregateInputType
  }

  export type GetFatiguePatternAggregateType<T extends FatiguePatternAggregateArgs> = {
        [P in keyof T & keyof AggregateFatiguePattern]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateFatiguePattern[P]>
      : GetScalarType<T[P], AggregateFatiguePattern[P]>
  }




  export type FatiguePatternGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FatiguePatternWhereInput
    orderBy?: FatiguePatternOrderByWithAggregationInput | FatiguePatternOrderByWithAggregationInput[]
    by: FatiguePatternScalarFieldEnum[] | FatiguePatternScalarFieldEnum
    having?: FatiguePatternScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: FatiguePatternCountAggregateInputType | true
    _avg?: FatiguePatternAvgAggregateInputType
    _sum?: FatiguePatternSumAggregateInputType
    _min?: FatiguePatternMinAggregateInputType
    _max?: FatiguePatternMaxAggregateInputType
  }

  export type FatiguePatternGroupByOutputType = {
    id: string
    createdAt: Date
    updatedAt: Date
    userId: string
    dayOfWeek: number
    timeOfDay: number
    averageFatigue: number
    sampleCount: number
    isActive: boolean
    lastUpdated: Date
    _count: FatiguePatternCountAggregateOutputType | null
    _avg: FatiguePatternAvgAggregateOutputType | null
    _sum: FatiguePatternSumAggregateOutputType | null
    _min: FatiguePatternMinAggregateOutputType | null
    _max: FatiguePatternMaxAggregateOutputType | null
  }

  type GetFatiguePatternGroupByPayload<T extends FatiguePatternGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<FatiguePatternGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof FatiguePatternGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], FatiguePatternGroupByOutputType[P]>
            : GetScalarType<T[P], FatiguePatternGroupByOutputType[P]>
        }
      >
    >


  export type FatiguePatternSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    dayOfWeek?: boolean
    timeOfDay?: boolean
    averageFatigue?: boolean
    sampleCount?: boolean
    isActive?: boolean
    lastUpdated?: boolean
  }, ExtArgs["result"]["fatiguePattern"]>

  export type FatiguePatternSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    dayOfWeek?: boolean
    timeOfDay?: boolean
    averageFatigue?: boolean
    sampleCount?: boolean
    isActive?: boolean
    lastUpdated?: boolean
  }, ExtArgs["result"]["fatiguePattern"]>

  export type FatiguePatternSelectScalar = {
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    dayOfWeek?: boolean
    timeOfDay?: boolean
    averageFatigue?: boolean
    sampleCount?: boolean
    isActive?: boolean
    lastUpdated?: boolean
  }


  export type $FatiguePatternPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "FatiguePattern"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      createdAt: Date
      updatedAt: Date
      userId: string
      dayOfWeek: number
      timeOfDay: number
      averageFatigue: number
      sampleCount: number
      isActive: boolean
      lastUpdated: Date
    }, ExtArgs["result"]["fatiguePattern"]>
    composites: {}
  }

  type FatiguePatternGetPayload<S extends boolean | null | undefined | FatiguePatternDefaultArgs> = $Result.GetResult<Prisma.$FatiguePatternPayload, S>

  type FatiguePatternCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<FatiguePatternFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: FatiguePatternCountAggregateInputType | true
    }

  export interface FatiguePatternDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['FatiguePattern'], meta: { name: 'FatiguePattern' } }
    /**
     * Find zero or one FatiguePattern that matches the filter.
     * @param {FatiguePatternFindUniqueArgs} args - Arguments to find a FatiguePattern
     * @example
     * // Get one FatiguePattern
     * const fatiguePattern = await prisma.fatiguePattern.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends FatiguePatternFindUniqueArgs>(args: SelectSubset<T, FatiguePatternFindUniqueArgs<ExtArgs>>): Prisma__FatiguePatternClient<$Result.GetResult<Prisma.$FatiguePatternPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one FatiguePattern that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {FatiguePatternFindUniqueOrThrowArgs} args - Arguments to find a FatiguePattern
     * @example
     * // Get one FatiguePattern
     * const fatiguePattern = await prisma.fatiguePattern.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends FatiguePatternFindUniqueOrThrowArgs>(args: SelectSubset<T, FatiguePatternFindUniqueOrThrowArgs<ExtArgs>>): Prisma__FatiguePatternClient<$Result.GetResult<Prisma.$FatiguePatternPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first FatiguePattern that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FatiguePatternFindFirstArgs} args - Arguments to find a FatiguePattern
     * @example
     * // Get one FatiguePattern
     * const fatiguePattern = await prisma.fatiguePattern.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends FatiguePatternFindFirstArgs>(args?: SelectSubset<T, FatiguePatternFindFirstArgs<ExtArgs>>): Prisma__FatiguePatternClient<$Result.GetResult<Prisma.$FatiguePatternPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first FatiguePattern that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FatiguePatternFindFirstOrThrowArgs} args - Arguments to find a FatiguePattern
     * @example
     * // Get one FatiguePattern
     * const fatiguePattern = await prisma.fatiguePattern.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends FatiguePatternFindFirstOrThrowArgs>(args?: SelectSubset<T, FatiguePatternFindFirstOrThrowArgs<ExtArgs>>): Prisma__FatiguePatternClient<$Result.GetResult<Prisma.$FatiguePatternPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more FatiguePatterns that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FatiguePatternFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all FatiguePatterns
     * const fatiguePatterns = await prisma.fatiguePattern.findMany()
     * 
     * // Get first 10 FatiguePatterns
     * const fatiguePatterns = await prisma.fatiguePattern.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const fatiguePatternWithIdOnly = await prisma.fatiguePattern.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends FatiguePatternFindManyArgs>(args?: SelectSubset<T, FatiguePatternFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FatiguePatternPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a FatiguePattern.
     * @param {FatiguePatternCreateArgs} args - Arguments to create a FatiguePattern.
     * @example
     * // Create one FatiguePattern
     * const FatiguePattern = await prisma.fatiguePattern.create({
     *   data: {
     *     // ... data to create a FatiguePattern
     *   }
     * })
     * 
     */
    create<T extends FatiguePatternCreateArgs>(args: SelectSubset<T, FatiguePatternCreateArgs<ExtArgs>>): Prisma__FatiguePatternClient<$Result.GetResult<Prisma.$FatiguePatternPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many FatiguePatterns.
     * @param {FatiguePatternCreateManyArgs} args - Arguments to create many FatiguePatterns.
     * @example
     * // Create many FatiguePatterns
     * const fatiguePattern = await prisma.fatiguePattern.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends FatiguePatternCreateManyArgs>(args?: SelectSubset<T, FatiguePatternCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many FatiguePatterns and returns the data saved in the database.
     * @param {FatiguePatternCreateManyAndReturnArgs} args - Arguments to create many FatiguePatterns.
     * @example
     * // Create many FatiguePatterns
     * const fatiguePattern = await prisma.fatiguePattern.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many FatiguePatterns and only return the `id`
     * const fatiguePatternWithIdOnly = await prisma.fatiguePattern.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends FatiguePatternCreateManyAndReturnArgs>(args?: SelectSubset<T, FatiguePatternCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FatiguePatternPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a FatiguePattern.
     * @param {FatiguePatternDeleteArgs} args - Arguments to delete one FatiguePattern.
     * @example
     * // Delete one FatiguePattern
     * const FatiguePattern = await prisma.fatiguePattern.delete({
     *   where: {
     *     // ... filter to delete one FatiguePattern
     *   }
     * })
     * 
     */
    delete<T extends FatiguePatternDeleteArgs>(args: SelectSubset<T, FatiguePatternDeleteArgs<ExtArgs>>): Prisma__FatiguePatternClient<$Result.GetResult<Prisma.$FatiguePatternPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one FatiguePattern.
     * @param {FatiguePatternUpdateArgs} args - Arguments to update one FatiguePattern.
     * @example
     * // Update one FatiguePattern
     * const fatiguePattern = await prisma.fatiguePattern.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends FatiguePatternUpdateArgs>(args: SelectSubset<T, FatiguePatternUpdateArgs<ExtArgs>>): Prisma__FatiguePatternClient<$Result.GetResult<Prisma.$FatiguePatternPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more FatiguePatterns.
     * @param {FatiguePatternDeleteManyArgs} args - Arguments to filter FatiguePatterns to delete.
     * @example
     * // Delete a few FatiguePatterns
     * const { count } = await prisma.fatiguePattern.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends FatiguePatternDeleteManyArgs>(args?: SelectSubset<T, FatiguePatternDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more FatiguePatterns.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FatiguePatternUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many FatiguePatterns
     * const fatiguePattern = await prisma.fatiguePattern.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends FatiguePatternUpdateManyArgs>(args: SelectSubset<T, FatiguePatternUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one FatiguePattern.
     * @param {FatiguePatternUpsertArgs} args - Arguments to update or create a FatiguePattern.
     * @example
     * // Update or create a FatiguePattern
     * const fatiguePattern = await prisma.fatiguePattern.upsert({
     *   create: {
     *     // ... data to create a FatiguePattern
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the FatiguePattern we want to update
     *   }
     * })
     */
    upsert<T extends FatiguePatternUpsertArgs>(args: SelectSubset<T, FatiguePatternUpsertArgs<ExtArgs>>): Prisma__FatiguePatternClient<$Result.GetResult<Prisma.$FatiguePatternPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of FatiguePatterns.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FatiguePatternCountArgs} args - Arguments to filter FatiguePatterns to count.
     * @example
     * // Count the number of FatiguePatterns
     * const count = await prisma.fatiguePattern.count({
     *   where: {
     *     // ... the filter for the FatiguePatterns we want to count
     *   }
     * })
    **/
    count<T extends FatiguePatternCountArgs>(
      args?: Subset<T, FatiguePatternCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], FatiguePatternCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a FatiguePattern.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FatiguePatternAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends FatiguePatternAggregateArgs>(args: Subset<T, FatiguePatternAggregateArgs>): Prisma.PrismaPromise<GetFatiguePatternAggregateType<T>>

    /**
     * Group by FatiguePattern.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FatiguePatternGroupByArgs} args - Group by arguments.
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
      T extends FatiguePatternGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: FatiguePatternGroupByArgs['orderBy'] }
        : { orderBy?: FatiguePatternGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, FatiguePatternGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFatiguePatternGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the FatiguePattern model
   */
  readonly fields: FatiguePatternFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for FatiguePattern.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__FatiguePatternClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the FatiguePattern model
   */ 
  interface FatiguePatternFieldRefs {
    readonly id: FieldRef<"FatiguePattern", 'String'>
    readonly createdAt: FieldRef<"FatiguePattern", 'DateTime'>
    readonly updatedAt: FieldRef<"FatiguePattern", 'DateTime'>
    readonly userId: FieldRef<"FatiguePattern", 'String'>
    readonly dayOfWeek: FieldRef<"FatiguePattern", 'Int'>
    readonly timeOfDay: FieldRef<"FatiguePattern", 'Int'>
    readonly averageFatigue: FieldRef<"FatiguePattern", 'Float'>
    readonly sampleCount: FieldRef<"FatiguePattern", 'Int'>
    readonly isActive: FieldRef<"FatiguePattern", 'Boolean'>
    readonly lastUpdated: FieldRef<"FatiguePattern", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * FatiguePattern findUnique
   */
  export type FatiguePatternFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FatiguePattern
     */
    select?: FatiguePatternSelect<ExtArgs> | null
    /**
     * Filter, which FatiguePattern to fetch.
     */
    where: FatiguePatternWhereUniqueInput
  }

  /**
   * FatiguePattern findUniqueOrThrow
   */
  export type FatiguePatternFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FatiguePattern
     */
    select?: FatiguePatternSelect<ExtArgs> | null
    /**
     * Filter, which FatiguePattern to fetch.
     */
    where: FatiguePatternWhereUniqueInput
  }

  /**
   * FatiguePattern findFirst
   */
  export type FatiguePatternFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FatiguePattern
     */
    select?: FatiguePatternSelect<ExtArgs> | null
    /**
     * Filter, which FatiguePattern to fetch.
     */
    where?: FatiguePatternWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FatiguePatterns to fetch.
     */
    orderBy?: FatiguePatternOrderByWithRelationInput | FatiguePatternOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FatiguePatterns.
     */
    cursor?: FatiguePatternWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FatiguePatterns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FatiguePatterns.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FatiguePatterns.
     */
    distinct?: FatiguePatternScalarFieldEnum | FatiguePatternScalarFieldEnum[]
  }

  /**
   * FatiguePattern findFirstOrThrow
   */
  export type FatiguePatternFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FatiguePattern
     */
    select?: FatiguePatternSelect<ExtArgs> | null
    /**
     * Filter, which FatiguePattern to fetch.
     */
    where?: FatiguePatternWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FatiguePatterns to fetch.
     */
    orderBy?: FatiguePatternOrderByWithRelationInput | FatiguePatternOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FatiguePatterns.
     */
    cursor?: FatiguePatternWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FatiguePatterns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FatiguePatterns.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FatiguePatterns.
     */
    distinct?: FatiguePatternScalarFieldEnum | FatiguePatternScalarFieldEnum[]
  }

  /**
   * FatiguePattern findMany
   */
  export type FatiguePatternFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FatiguePattern
     */
    select?: FatiguePatternSelect<ExtArgs> | null
    /**
     * Filter, which FatiguePatterns to fetch.
     */
    where?: FatiguePatternWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FatiguePatterns to fetch.
     */
    orderBy?: FatiguePatternOrderByWithRelationInput | FatiguePatternOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing FatiguePatterns.
     */
    cursor?: FatiguePatternWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FatiguePatterns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FatiguePatterns.
     */
    skip?: number
    distinct?: FatiguePatternScalarFieldEnum | FatiguePatternScalarFieldEnum[]
  }

  /**
   * FatiguePattern create
   */
  export type FatiguePatternCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FatiguePattern
     */
    select?: FatiguePatternSelect<ExtArgs> | null
    /**
     * The data needed to create a FatiguePattern.
     */
    data: XOR<FatiguePatternCreateInput, FatiguePatternUncheckedCreateInput>
  }

  /**
   * FatiguePattern createMany
   */
  export type FatiguePatternCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many FatiguePatterns.
     */
    data: FatiguePatternCreateManyInput | FatiguePatternCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * FatiguePattern createManyAndReturn
   */
  export type FatiguePatternCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FatiguePattern
     */
    select?: FatiguePatternSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many FatiguePatterns.
     */
    data: FatiguePatternCreateManyInput | FatiguePatternCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * FatiguePattern update
   */
  export type FatiguePatternUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FatiguePattern
     */
    select?: FatiguePatternSelect<ExtArgs> | null
    /**
     * The data needed to update a FatiguePattern.
     */
    data: XOR<FatiguePatternUpdateInput, FatiguePatternUncheckedUpdateInput>
    /**
     * Choose, which FatiguePattern to update.
     */
    where: FatiguePatternWhereUniqueInput
  }

  /**
   * FatiguePattern updateMany
   */
  export type FatiguePatternUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update FatiguePatterns.
     */
    data: XOR<FatiguePatternUpdateManyMutationInput, FatiguePatternUncheckedUpdateManyInput>
    /**
     * Filter which FatiguePatterns to update
     */
    where?: FatiguePatternWhereInput
  }

  /**
   * FatiguePattern upsert
   */
  export type FatiguePatternUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FatiguePattern
     */
    select?: FatiguePatternSelect<ExtArgs> | null
    /**
     * The filter to search for the FatiguePattern to update in case it exists.
     */
    where: FatiguePatternWhereUniqueInput
    /**
     * In case the FatiguePattern found by the `where` argument doesn't exist, create a new FatiguePattern with this data.
     */
    create: XOR<FatiguePatternCreateInput, FatiguePatternUncheckedCreateInput>
    /**
     * In case the FatiguePattern was found with the provided `where` argument, update it with this data.
     */
    update: XOR<FatiguePatternUpdateInput, FatiguePatternUncheckedUpdateInput>
  }

  /**
   * FatiguePattern delete
   */
  export type FatiguePatternDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FatiguePattern
     */
    select?: FatiguePatternSelect<ExtArgs> | null
    /**
     * Filter which FatiguePattern to delete.
     */
    where: FatiguePatternWhereUniqueInput
  }

  /**
   * FatiguePattern deleteMany
   */
  export type FatiguePatternDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FatiguePatterns to delete
     */
    where?: FatiguePatternWhereInput
  }

  /**
   * FatiguePattern without action
   */
  export type FatiguePatternDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FatiguePattern
     */
    select?: FatiguePatternSelect<ExtArgs> | null
  }


  /**
   * Model UserFatigueProfile
   */

  export type AggregateUserFatigueProfile = {
    _count: UserFatigueProfileCountAggregateOutputType | null
    _avg: UserFatigueProfileAvgAggregateOutputType | null
    _sum: UserFatigueProfileSumAggregateOutputType | null
    _min: UserFatigueProfileMinAggregateOutputType | null
    _max: UserFatigueProfileMaxAggregateOutputType | null
  }

  export type UserFatigueProfileAvgAggregateOutputType = {
    adjustmentSensitivity: number | null
    lowFatigueThreshold: number | null
    highFatigueThreshold: number | null
    totalAssessments: number | null
    totalAdjustments: number | null
    userSatisfactionScore: number | null
  }

  export type UserFatigueProfileSumAggregateOutputType = {
    adjustmentSensitivity: number | null
    lowFatigueThreshold: number | null
    highFatigueThreshold: number | null
    totalAssessments: number | null
    totalAdjustments: number | null
    userSatisfactionScore: number | null
  }

  export type UserFatigueProfileMinAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    updatedAt: Date | null
    userId: string | null
    autoAdjustEnabled: boolean | null
    adjustmentSensitivity: number | null
    lowFatigueThreshold: number | null
    highFatigueThreshold: number | null
    totalAssessments: number | null
    totalAdjustments: number | null
    userSatisfactionScore: number | null
  }

  export type UserFatigueProfileMaxAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    updatedAt: Date | null
    userId: string | null
    autoAdjustEnabled: boolean | null
    adjustmentSensitivity: number | null
    lowFatigueThreshold: number | null
    highFatigueThreshold: number | null
    totalAssessments: number | null
    totalAdjustments: number | null
    userSatisfactionScore: number | null
  }

  export type UserFatigueProfileCountAggregateOutputType = {
    id: number
    createdAt: number
    updatedAt: number
    userId: number
    autoAdjustEnabled: number
    adjustmentSensitivity: number
    preferredAdjustmentTypes: number
    lowFatigueThreshold: number
    highFatigueThreshold: number
    totalAssessments: number
    totalAdjustments: number
    userSatisfactionScore: number
    _all: number
  }


  export type UserFatigueProfileAvgAggregateInputType = {
    adjustmentSensitivity?: true
    lowFatigueThreshold?: true
    highFatigueThreshold?: true
    totalAssessments?: true
    totalAdjustments?: true
    userSatisfactionScore?: true
  }

  export type UserFatigueProfileSumAggregateInputType = {
    adjustmentSensitivity?: true
    lowFatigueThreshold?: true
    highFatigueThreshold?: true
    totalAssessments?: true
    totalAdjustments?: true
    userSatisfactionScore?: true
  }

  export type UserFatigueProfileMinAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
    autoAdjustEnabled?: true
    adjustmentSensitivity?: true
    lowFatigueThreshold?: true
    highFatigueThreshold?: true
    totalAssessments?: true
    totalAdjustments?: true
    userSatisfactionScore?: true
  }

  export type UserFatigueProfileMaxAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
    autoAdjustEnabled?: true
    adjustmentSensitivity?: true
    lowFatigueThreshold?: true
    highFatigueThreshold?: true
    totalAssessments?: true
    totalAdjustments?: true
    userSatisfactionScore?: true
  }

  export type UserFatigueProfileCountAggregateInputType = {
    id?: true
    createdAt?: true
    updatedAt?: true
    userId?: true
    autoAdjustEnabled?: true
    adjustmentSensitivity?: true
    preferredAdjustmentTypes?: true
    lowFatigueThreshold?: true
    highFatigueThreshold?: true
    totalAssessments?: true
    totalAdjustments?: true
    userSatisfactionScore?: true
    _all?: true
  }

  export type UserFatigueProfileAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserFatigueProfile to aggregate.
     */
    where?: UserFatigueProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserFatigueProfiles to fetch.
     */
    orderBy?: UserFatigueProfileOrderByWithRelationInput | UserFatigueProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserFatigueProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserFatigueProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserFatigueProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserFatigueProfiles
    **/
    _count?: true | UserFatigueProfileCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserFatigueProfileAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserFatigueProfileSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserFatigueProfileMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserFatigueProfileMaxAggregateInputType
  }

  export type GetUserFatigueProfileAggregateType<T extends UserFatigueProfileAggregateArgs> = {
        [P in keyof T & keyof AggregateUserFatigueProfile]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserFatigueProfile[P]>
      : GetScalarType<T[P], AggregateUserFatigueProfile[P]>
  }




  export type UserFatigueProfileGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserFatigueProfileWhereInput
    orderBy?: UserFatigueProfileOrderByWithAggregationInput | UserFatigueProfileOrderByWithAggregationInput[]
    by: UserFatigueProfileScalarFieldEnum[] | UserFatigueProfileScalarFieldEnum
    having?: UserFatigueProfileScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserFatigueProfileCountAggregateInputType | true
    _avg?: UserFatigueProfileAvgAggregateInputType
    _sum?: UserFatigueProfileSumAggregateInputType
    _min?: UserFatigueProfileMinAggregateInputType
    _max?: UserFatigueProfileMaxAggregateInputType
  }

  export type UserFatigueProfileGroupByOutputType = {
    id: string
    createdAt: Date
    updatedAt: Date
    userId: string
    autoAdjustEnabled: boolean
    adjustmentSensitivity: number
    preferredAdjustmentTypes: string[]
    lowFatigueThreshold: number
    highFatigueThreshold: number
    totalAssessments: number
    totalAdjustments: number
    userSatisfactionScore: number | null
    _count: UserFatigueProfileCountAggregateOutputType | null
    _avg: UserFatigueProfileAvgAggregateOutputType | null
    _sum: UserFatigueProfileSumAggregateOutputType | null
    _min: UserFatigueProfileMinAggregateOutputType | null
    _max: UserFatigueProfileMaxAggregateOutputType | null
  }

  type GetUserFatigueProfileGroupByPayload<T extends UserFatigueProfileGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserFatigueProfileGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserFatigueProfileGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserFatigueProfileGroupByOutputType[P]>
            : GetScalarType<T[P], UserFatigueProfileGroupByOutputType[P]>
        }
      >
    >


  export type UserFatigueProfileSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    autoAdjustEnabled?: boolean
    adjustmentSensitivity?: boolean
    preferredAdjustmentTypes?: boolean
    lowFatigueThreshold?: boolean
    highFatigueThreshold?: boolean
    totalAssessments?: boolean
    totalAdjustments?: boolean
    userSatisfactionScore?: boolean
  }, ExtArgs["result"]["userFatigueProfile"]>

  export type UserFatigueProfileSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    autoAdjustEnabled?: boolean
    adjustmentSensitivity?: boolean
    preferredAdjustmentTypes?: boolean
    lowFatigueThreshold?: boolean
    highFatigueThreshold?: boolean
    totalAssessments?: boolean
    totalAdjustments?: boolean
    userSatisfactionScore?: boolean
  }, ExtArgs["result"]["userFatigueProfile"]>

  export type UserFatigueProfileSelectScalar = {
    id?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    userId?: boolean
    autoAdjustEnabled?: boolean
    adjustmentSensitivity?: boolean
    preferredAdjustmentTypes?: boolean
    lowFatigueThreshold?: boolean
    highFatigueThreshold?: boolean
    totalAssessments?: boolean
    totalAdjustments?: boolean
    userSatisfactionScore?: boolean
  }


  export type $UserFatigueProfilePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserFatigueProfile"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      createdAt: Date
      updatedAt: Date
      userId: string
      autoAdjustEnabled: boolean
      adjustmentSensitivity: number
      preferredAdjustmentTypes: string[]
      lowFatigueThreshold: number
      highFatigueThreshold: number
      totalAssessments: number
      totalAdjustments: number
      userSatisfactionScore: number | null
    }, ExtArgs["result"]["userFatigueProfile"]>
    composites: {}
  }

  type UserFatigueProfileGetPayload<S extends boolean | null | undefined | UserFatigueProfileDefaultArgs> = $Result.GetResult<Prisma.$UserFatigueProfilePayload, S>

  type UserFatigueProfileCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<UserFatigueProfileFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: UserFatigueProfileCountAggregateInputType | true
    }

  export interface UserFatigueProfileDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserFatigueProfile'], meta: { name: 'UserFatigueProfile' } }
    /**
     * Find zero or one UserFatigueProfile that matches the filter.
     * @param {UserFatigueProfileFindUniqueArgs} args - Arguments to find a UserFatigueProfile
     * @example
     * // Get one UserFatigueProfile
     * const userFatigueProfile = await prisma.userFatigueProfile.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFatigueProfileFindUniqueArgs>(args: SelectSubset<T, UserFatigueProfileFindUniqueArgs<ExtArgs>>): Prisma__UserFatigueProfileClient<$Result.GetResult<Prisma.$UserFatigueProfilePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one UserFatigueProfile that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {UserFatigueProfileFindUniqueOrThrowArgs} args - Arguments to find a UserFatigueProfile
     * @example
     * // Get one UserFatigueProfile
     * const userFatigueProfile = await prisma.userFatigueProfile.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFatigueProfileFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFatigueProfileFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserFatigueProfileClient<$Result.GetResult<Prisma.$UserFatigueProfilePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first UserFatigueProfile that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFatigueProfileFindFirstArgs} args - Arguments to find a UserFatigueProfile
     * @example
     * // Get one UserFatigueProfile
     * const userFatigueProfile = await prisma.userFatigueProfile.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFatigueProfileFindFirstArgs>(args?: SelectSubset<T, UserFatigueProfileFindFirstArgs<ExtArgs>>): Prisma__UserFatigueProfileClient<$Result.GetResult<Prisma.$UserFatigueProfilePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first UserFatigueProfile that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFatigueProfileFindFirstOrThrowArgs} args - Arguments to find a UserFatigueProfile
     * @example
     * // Get one UserFatigueProfile
     * const userFatigueProfile = await prisma.userFatigueProfile.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFatigueProfileFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFatigueProfileFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserFatigueProfileClient<$Result.GetResult<Prisma.$UserFatigueProfilePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more UserFatigueProfiles that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFatigueProfileFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserFatigueProfiles
     * const userFatigueProfiles = await prisma.userFatigueProfile.findMany()
     * 
     * // Get first 10 UserFatigueProfiles
     * const userFatigueProfiles = await prisma.userFatigueProfile.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userFatigueProfileWithIdOnly = await prisma.userFatigueProfile.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFatigueProfileFindManyArgs>(args?: SelectSubset<T, UserFatigueProfileFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserFatigueProfilePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a UserFatigueProfile.
     * @param {UserFatigueProfileCreateArgs} args - Arguments to create a UserFatigueProfile.
     * @example
     * // Create one UserFatigueProfile
     * const UserFatigueProfile = await prisma.userFatigueProfile.create({
     *   data: {
     *     // ... data to create a UserFatigueProfile
     *   }
     * })
     * 
     */
    create<T extends UserFatigueProfileCreateArgs>(args: SelectSubset<T, UserFatigueProfileCreateArgs<ExtArgs>>): Prisma__UserFatigueProfileClient<$Result.GetResult<Prisma.$UserFatigueProfilePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many UserFatigueProfiles.
     * @param {UserFatigueProfileCreateManyArgs} args - Arguments to create many UserFatigueProfiles.
     * @example
     * // Create many UserFatigueProfiles
     * const userFatigueProfile = await prisma.userFatigueProfile.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserFatigueProfileCreateManyArgs>(args?: SelectSubset<T, UserFatigueProfileCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many UserFatigueProfiles and returns the data saved in the database.
     * @param {UserFatigueProfileCreateManyAndReturnArgs} args - Arguments to create many UserFatigueProfiles.
     * @example
     * // Create many UserFatigueProfiles
     * const userFatigueProfile = await prisma.userFatigueProfile.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many UserFatigueProfiles and only return the `id`
     * const userFatigueProfileWithIdOnly = await prisma.userFatigueProfile.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserFatigueProfileCreateManyAndReturnArgs>(args?: SelectSubset<T, UserFatigueProfileCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserFatigueProfilePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a UserFatigueProfile.
     * @param {UserFatigueProfileDeleteArgs} args - Arguments to delete one UserFatigueProfile.
     * @example
     * // Delete one UserFatigueProfile
     * const UserFatigueProfile = await prisma.userFatigueProfile.delete({
     *   where: {
     *     // ... filter to delete one UserFatigueProfile
     *   }
     * })
     * 
     */
    delete<T extends UserFatigueProfileDeleteArgs>(args: SelectSubset<T, UserFatigueProfileDeleteArgs<ExtArgs>>): Prisma__UserFatigueProfileClient<$Result.GetResult<Prisma.$UserFatigueProfilePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one UserFatigueProfile.
     * @param {UserFatigueProfileUpdateArgs} args - Arguments to update one UserFatigueProfile.
     * @example
     * // Update one UserFatigueProfile
     * const userFatigueProfile = await prisma.userFatigueProfile.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserFatigueProfileUpdateArgs>(args: SelectSubset<T, UserFatigueProfileUpdateArgs<ExtArgs>>): Prisma__UserFatigueProfileClient<$Result.GetResult<Prisma.$UserFatigueProfilePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more UserFatigueProfiles.
     * @param {UserFatigueProfileDeleteManyArgs} args - Arguments to filter UserFatigueProfiles to delete.
     * @example
     * // Delete a few UserFatigueProfiles
     * const { count } = await prisma.userFatigueProfile.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserFatigueProfileDeleteManyArgs>(args?: SelectSubset<T, UserFatigueProfileDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserFatigueProfiles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFatigueProfileUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserFatigueProfiles
     * const userFatigueProfile = await prisma.userFatigueProfile.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserFatigueProfileUpdateManyArgs>(args: SelectSubset<T, UserFatigueProfileUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one UserFatigueProfile.
     * @param {UserFatigueProfileUpsertArgs} args - Arguments to update or create a UserFatigueProfile.
     * @example
     * // Update or create a UserFatigueProfile
     * const userFatigueProfile = await prisma.userFatigueProfile.upsert({
     *   create: {
     *     // ... data to create a UserFatigueProfile
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserFatigueProfile we want to update
     *   }
     * })
     */
    upsert<T extends UserFatigueProfileUpsertArgs>(args: SelectSubset<T, UserFatigueProfileUpsertArgs<ExtArgs>>): Prisma__UserFatigueProfileClient<$Result.GetResult<Prisma.$UserFatigueProfilePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of UserFatigueProfiles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFatigueProfileCountArgs} args - Arguments to filter UserFatigueProfiles to count.
     * @example
     * // Count the number of UserFatigueProfiles
     * const count = await prisma.userFatigueProfile.count({
     *   where: {
     *     // ... the filter for the UserFatigueProfiles we want to count
     *   }
     * })
    **/
    count<T extends UserFatigueProfileCountArgs>(
      args?: Subset<T, UserFatigueProfileCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserFatigueProfileCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserFatigueProfile.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFatigueProfileAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends UserFatigueProfileAggregateArgs>(args: Subset<T, UserFatigueProfileAggregateArgs>): Prisma.PrismaPromise<GetUserFatigueProfileAggregateType<T>>

    /**
     * Group by UserFatigueProfile.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFatigueProfileGroupByArgs} args - Group by arguments.
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
      T extends UserFatigueProfileGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserFatigueProfileGroupByArgs['orderBy'] }
        : { orderBy?: UserFatigueProfileGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, UserFatigueProfileGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserFatigueProfileGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserFatigueProfile model
   */
  readonly fields: UserFatigueProfileFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserFatigueProfile.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserFatigueProfileClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the UserFatigueProfile model
   */ 
  interface UserFatigueProfileFieldRefs {
    readonly id: FieldRef<"UserFatigueProfile", 'String'>
    readonly createdAt: FieldRef<"UserFatigueProfile", 'DateTime'>
    readonly updatedAt: FieldRef<"UserFatigueProfile", 'DateTime'>
    readonly userId: FieldRef<"UserFatigueProfile", 'String'>
    readonly autoAdjustEnabled: FieldRef<"UserFatigueProfile", 'Boolean'>
    readonly adjustmentSensitivity: FieldRef<"UserFatigueProfile", 'Float'>
    readonly preferredAdjustmentTypes: FieldRef<"UserFatigueProfile", 'String[]'>
    readonly lowFatigueThreshold: FieldRef<"UserFatigueProfile", 'Int'>
    readonly highFatigueThreshold: FieldRef<"UserFatigueProfile", 'Int'>
    readonly totalAssessments: FieldRef<"UserFatigueProfile", 'Int'>
    readonly totalAdjustments: FieldRef<"UserFatigueProfile", 'Int'>
    readonly userSatisfactionScore: FieldRef<"UserFatigueProfile", 'Float'>
  }
    

  // Custom InputTypes
  /**
   * UserFatigueProfile findUnique
   */
  export type UserFatigueProfileFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserFatigueProfile
     */
    select?: UserFatigueProfileSelect<ExtArgs> | null
    /**
     * Filter, which UserFatigueProfile to fetch.
     */
    where: UserFatigueProfileWhereUniqueInput
  }

  /**
   * UserFatigueProfile findUniqueOrThrow
   */
  export type UserFatigueProfileFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserFatigueProfile
     */
    select?: UserFatigueProfileSelect<ExtArgs> | null
    /**
     * Filter, which UserFatigueProfile to fetch.
     */
    where: UserFatigueProfileWhereUniqueInput
  }

  /**
   * UserFatigueProfile findFirst
   */
  export type UserFatigueProfileFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserFatigueProfile
     */
    select?: UserFatigueProfileSelect<ExtArgs> | null
    /**
     * Filter, which UserFatigueProfile to fetch.
     */
    where?: UserFatigueProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserFatigueProfiles to fetch.
     */
    orderBy?: UserFatigueProfileOrderByWithRelationInput | UserFatigueProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserFatigueProfiles.
     */
    cursor?: UserFatigueProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserFatigueProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserFatigueProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserFatigueProfiles.
     */
    distinct?: UserFatigueProfileScalarFieldEnum | UserFatigueProfileScalarFieldEnum[]
  }

  /**
   * UserFatigueProfile findFirstOrThrow
   */
  export type UserFatigueProfileFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserFatigueProfile
     */
    select?: UserFatigueProfileSelect<ExtArgs> | null
    /**
     * Filter, which UserFatigueProfile to fetch.
     */
    where?: UserFatigueProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserFatigueProfiles to fetch.
     */
    orderBy?: UserFatigueProfileOrderByWithRelationInput | UserFatigueProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserFatigueProfiles.
     */
    cursor?: UserFatigueProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserFatigueProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserFatigueProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserFatigueProfiles.
     */
    distinct?: UserFatigueProfileScalarFieldEnum | UserFatigueProfileScalarFieldEnum[]
  }

  /**
   * UserFatigueProfile findMany
   */
  export type UserFatigueProfileFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserFatigueProfile
     */
    select?: UserFatigueProfileSelect<ExtArgs> | null
    /**
     * Filter, which UserFatigueProfiles to fetch.
     */
    where?: UserFatigueProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserFatigueProfiles to fetch.
     */
    orderBy?: UserFatigueProfileOrderByWithRelationInput | UserFatigueProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserFatigueProfiles.
     */
    cursor?: UserFatigueProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserFatigueProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserFatigueProfiles.
     */
    skip?: number
    distinct?: UserFatigueProfileScalarFieldEnum | UserFatigueProfileScalarFieldEnum[]
  }

  /**
   * UserFatigueProfile create
   */
  export type UserFatigueProfileCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserFatigueProfile
     */
    select?: UserFatigueProfileSelect<ExtArgs> | null
    /**
     * The data needed to create a UserFatigueProfile.
     */
    data: XOR<UserFatigueProfileCreateInput, UserFatigueProfileUncheckedCreateInput>
  }

  /**
   * UserFatigueProfile createMany
   */
  export type UserFatigueProfileCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserFatigueProfiles.
     */
    data: UserFatigueProfileCreateManyInput | UserFatigueProfileCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserFatigueProfile createManyAndReturn
   */
  export type UserFatigueProfileCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserFatigueProfile
     */
    select?: UserFatigueProfileSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many UserFatigueProfiles.
     */
    data: UserFatigueProfileCreateManyInput | UserFatigueProfileCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserFatigueProfile update
   */
  export type UserFatigueProfileUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserFatigueProfile
     */
    select?: UserFatigueProfileSelect<ExtArgs> | null
    /**
     * The data needed to update a UserFatigueProfile.
     */
    data: XOR<UserFatigueProfileUpdateInput, UserFatigueProfileUncheckedUpdateInput>
    /**
     * Choose, which UserFatigueProfile to update.
     */
    where: UserFatigueProfileWhereUniqueInput
  }

  /**
   * UserFatigueProfile updateMany
   */
  export type UserFatigueProfileUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserFatigueProfiles.
     */
    data: XOR<UserFatigueProfileUpdateManyMutationInput, UserFatigueProfileUncheckedUpdateManyInput>
    /**
     * Filter which UserFatigueProfiles to update
     */
    where?: UserFatigueProfileWhereInput
  }

  /**
   * UserFatigueProfile upsert
   */
  export type UserFatigueProfileUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserFatigueProfile
     */
    select?: UserFatigueProfileSelect<ExtArgs> | null
    /**
     * The filter to search for the UserFatigueProfile to update in case it exists.
     */
    where: UserFatigueProfileWhereUniqueInput
    /**
     * In case the UserFatigueProfile found by the `where` argument doesn't exist, create a new UserFatigueProfile with this data.
     */
    create: XOR<UserFatigueProfileCreateInput, UserFatigueProfileUncheckedCreateInput>
    /**
     * In case the UserFatigueProfile was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserFatigueProfileUpdateInput, UserFatigueProfileUncheckedUpdateInput>
  }

  /**
   * UserFatigueProfile delete
   */
  export type UserFatigueProfileDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserFatigueProfile
     */
    select?: UserFatigueProfileSelect<ExtArgs> | null
    /**
     * Filter which UserFatigueProfile to delete.
     */
    where: UserFatigueProfileWhereUniqueInput
  }

  /**
   * UserFatigueProfile deleteMany
   */
  export type UserFatigueProfileDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserFatigueProfiles to delete
     */
    where?: UserFatigueProfileWhereInput
  }

  /**
   * UserFatigueProfile without action
   */
  export type UserFatigueProfileDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserFatigueProfile
     */
    select?: UserFatigueProfileSelect<ExtArgs> | null
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


  export const FatigueAssessmentScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    userId: 'userId',
    sessionId: 'sessionId',
    overallFatigue: 'overallFatigue',
    physicalFatigue: 'physicalFatigue',
    mentalFatigue: 'mentalFatigue',
    sleepQuality: 'sleepQuality',
    stressLevel: 'stressLevel',
    notes: 'notes',
    previousWorkout: 'previousWorkout',
    timeSinceLastWorkout: 'timeSinceLastWorkout',
    assessmentType: 'assessmentType',
    isActive: 'isActive'
  };

  export type FatigueAssessmentScalarFieldEnum = (typeof FatigueAssessmentScalarFieldEnum)[keyof typeof FatigueAssessmentScalarFieldEnum]


  export const TrainingAdjustmentScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    userId: 'userId',
    sessionId: 'sessionId',
    planId: 'planId',
    adjustmentType: 'adjustmentType',
    originalValue: 'originalValue',
    adjustedValue: 'adjustedValue',
    reason: 'reason',
    confidence: 'confidence',
    fatigueLevel: 'fatigueLevel',
    exerciseId: 'exerciseId',
    exerciseName: 'exerciseName',
    isApplied: 'isApplied',
    appliedAt: 'appliedAt',
    userFeedback: 'userFeedback'
  };

  export type TrainingAdjustmentScalarFieldEnum = (typeof TrainingAdjustmentScalarFieldEnum)[keyof typeof TrainingAdjustmentScalarFieldEnum]


  export const FatiguePatternScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    userId: 'userId',
    dayOfWeek: 'dayOfWeek',
    timeOfDay: 'timeOfDay',
    averageFatigue: 'averageFatigue',
    sampleCount: 'sampleCount',
    isActive: 'isActive',
    lastUpdated: 'lastUpdated'
  };

  export type FatiguePatternScalarFieldEnum = (typeof FatiguePatternScalarFieldEnum)[keyof typeof FatiguePatternScalarFieldEnum]


  export const UserFatigueProfileScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    userId: 'userId',
    autoAdjustEnabled: 'autoAdjustEnabled',
    adjustmentSensitivity: 'adjustmentSensitivity',
    preferredAdjustmentTypes: 'preferredAdjustmentTypes',
    lowFatigueThreshold: 'lowFatigueThreshold',
    highFatigueThreshold: 'highFatigueThreshold',
    totalAssessments: 'totalAssessments',
    totalAdjustments: 'totalAdjustments',
    userSatisfactionScore: 'userSatisfactionScore'
  };

  export type UserFatigueProfileScalarFieldEnum = (typeof UserFatigueProfileScalarFieldEnum)[keyof typeof UserFatigueProfileScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


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
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


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


  export type FatigueAssessmentWhereInput = {
    AND?: FatigueAssessmentWhereInput | FatigueAssessmentWhereInput[]
    OR?: FatigueAssessmentWhereInput[]
    NOT?: FatigueAssessmentWhereInput | FatigueAssessmentWhereInput[]
    id?: StringFilter<"FatigueAssessment"> | string
    createdAt?: DateTimeFilter<"FatigueAssessment"> | Date | string
    updatedAt?: DateTimeFilter<"FatigueAssessment"> | Date | string
    userId?: StringFilter<"FatigueAssessment"> | string
    sessionId?: StringNullableFilter<"FatigueAssessment"> | string | null
    overallFatigue?: IntFilter<"FatigueAssessment"> | number
    physicalFatigue?: IntFilter<"FatigueAssessment"> | number
    mentalFatigue?: IntFilter<"FatigueAssessment"> | number
    sleepQuality?: IntFilter<"FatigueAssessment"> | number
    stressLevel?: IntFilter<"FatigueAssessment"> | number
    notes?: StringNullableFilter<"FatigueAssessment"> | string | null
    previousWorkout?: StringNullableFilter<"FatigueAssessment"> | string | null
    timeSinceLastWorkout?: IntNullableFilter<"FatigueAssessment"> | number | null
    assessmentType?: StringFilter<"FatigueAssessment"> | string
    isActive?: BoolFilter<"FatigueAssessment"> | boolean
  }

  export type FatigueAssessmentOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    sessionId?: SortOrderInput | SortOrder
    overallFatigue?: SortOrder
    physicalFatigue?: SortOrder
    mentalFatigue?: SortOrder
    sleepQuality?: SortOrder
    stressLevel?: SortOrder
    notes?: SortOrderInput | SortOrder
    previousWorkout?: SortOrderInput | SortOrder
    timeSinceLastWorkout?: SortOrderInput | SortOrder
    assessmentType?: SortOrder
    isActive?: SortOrder
  }

  export type FatigueAssessmentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: FatigueAssessmentWhereInput | FatigueAssessmentWhereInput[]
    OR?: FatigueAssessmentWhereInput[]
    NOT?: FatigueAssessmentWhereInput | FatigueAssessmentWhereInput[]
    createdAt?: DateTimeFilter<"FatigueAssessment"> | Date | string
    updatedAt?: DateTimeFilter<"FatigueAssessment"> | Date | string
    userId?: StringFilter<"FatigueAssessment"> | string
    sessionId?: StringNullableFilter<"FatigueAssessment"> | string | null
    overallFatigue?: IntFilter<"FatigueAssessment"> | number
    physicalFatigue?: IntFilter<"FatigueAssessment"> | number
    mentalFatigue?: IntFilter<"FatigueAssessment"> | number
    sleepQuality?: IntFilter<"FatigueAssessment"> | number
    stressLevel?: IntFilter<"FatigueAssessment"> | number
    notes?: StringNullableFilter<"FatigueAssessment"> | string | null
    previousWorkout?: StringNullableFilter<"FatigueAssessment"> | string | null
    timeSinceLastWorkout?: IntNullableFilter<"FatigueAssessment"> | number | null
    assessmentType?: StringFilter<"FatigueAssessment"> | string
    isActive?: BoolFilter<"FatigueAssessment"> | boolean
  }, "id">

  export type FatigueAssessmentOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    sessionId?: SortOrderInput | SortOrder
    overallFatigue?: SortOrder
    physicalFatigue?: SortOrder
    mentalFatigue?: SortOrder
    sleepQuality?: SortOrder
    stressLevel?: SortOrder
    notes?: SortOrderInput | SortOrder
    previousWorkout?: SortOrderInput | SortOrder
    timeSinceLastWorkout?: SortOrderInput | SortOrder
    assessmentType?: SortOrder
    isActive?: SortOrder
    _count?: FatigueAssessmentCountOrderByAggregateInput
    _avg?: FatigueAssessmentAvgOrderByAggregateInput
    _max?: FatigueAssessmentMaxOrderByAggregateInput
    _min?: FatigueAssessmentMinOrderByAggregateInput
    _sum?: FatigueAssessmentSumOrderByAggregateInput
  }

  export type FatigueAssessmentScalarWhereWithAggregatesInput = {
    AND?: FatigueAssessmentScalarWhereWithAggregatesInput | FatigueAssessmentScalarWhereWithAggregatesInput[]
    OR?: FatigueAssessmentScalarWhereWithAggregatesInput[]
    NOT?: FatigueAssessmentScalarWhereWithAggregatesInput | FatigueAssessmentScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"FatigueAssessment"> | string
    createdAt?: DateTimeWithAggregatesFilter<"FatigueAssessment"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"FatigueAssessment"> | Date | string
    userId?: StringWithAggregatesFilter<"FatigueAssessment"> | string
    sessionId?: StringNullableWithAggregatesFilter<"FatigueAssessment"> | string | null
    overallFatigue?: IntWithAggregatesFilter<"FatigueAssessment"> | number
    physicalFatigue?: IntWithAggregatesFilter<"FatigueAssessment"> | number
    mentalFatigue?: IntWithAggregatesFilter<"FatigueAssessment"> | number
    sleepQuality?: IntWithAggregatesFilter<"FatigueAssessment"> | number
    stressLevel?: IntWithAggregatesFilter<"FatigueAssessment"> | number
    notes?: StringNullableWithAggregatesFilter<"FatigueAssessment"> | string | null
    previousWorkout?: StringNullableWithAggregatesFilter<"FatigueAssessment"> | string | null
    timeSinceLastWorkout?: IntNullableWithAggregatesFilter<"FatigueAssessment"> | number | null
    assessmentType?: StringWithAggregatesFilter<"FatigueAssessment"> | string
    isActive?: BoolWithAggregatesFilter<"FatigueAssessment"> | boolean
  }

  export type TrainingAdjustmentWhereInput = {
    AND?: TrainingAdjustmentWhereInput | TrainingAdjustmentWhereInput[]
    OR?: TrainingAdjustmentWhereInput[]
    NOT?: TrainingAdjustmentWhereInput | TrainingAdjustmentWhereInput[]
    id?: StringFilter<"TrainingAdjustment"> | string
    createdAt?: DateTimeFilter<"TrainingAdjustment"> | Date | string
    updatedAt?: DateTimeFilter<"TrainingAdjustment"> | Date | string
    userId?: StringFilter<"TrainingAdjustment"> | string
    sessionId?: StringNullableFilter<"TrainingAdjustment"> | string | null
    planId?: StringNullableFilter<"TrainingAdjustment"> | string | null
    adjustmentType?: StringFilter<"TrainingAdjustment"> | string
    originalValue?: JsonFilter<"TrainingAdjustment">
    adjustedValue?: JsonFilter<"TrainingAdjustment">
    reason?: StringFilter<"TrainingAdjustment"> | string
    confidence?: FloatFilter<"TrainingAdjustment"> | number
    fatigueLevel?: IntFilter<"TrainingAdjustment"> | number
    exerciseId?: StringNullableFilter<"TrainingAdjustment"> | string | null
    exerciseName?: StringNullableFilter<"TrainingAdjustment"> | string | null
    isApplied?: BoolFilter<"TrainingAdjustment"> | boolean
    appliedAt?: DateTimeNullableFilter<"TrainingAdjustment"> | Date | string | null
    userFeedback?: StringNullableFilter<"TrainingAdjustment"> | string | null
  }

  export type TrainingAdjustmentOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    sessionId?: SortOrderInput | SortOrder
    planId?: SortOrderInput | SortOrder
    adjustmentType?: SortOrder
    originalValue?: SortOrder
    adjustedValue?: SortOrder
    reason?: SortOrder
    confidence?: SortOrder
    fatigueLevel?: SortOrder
    exerciseId?: SortOrderInput | SortOrder
    exerciseName?: SortOrderInput | SortOrder
    isApplied?: SortOrder
    appliedAt?: SortOrderInput | SortOrder
    userFeedback?: SortOrderInput | SortOrder
  }

  export type TrainingAdjustmentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: TrainingAdjustmentWhereInput | TrainingAdjustmentWhereInput[]
    OR?: TrainingAdjustmentWhereInput[]
    NOT?: TrainingAdjustmentWhereInput | TrainingAdjustmentWhereInput[]
    createdAt?: DateTimeFilter<"TrainingAdjustment"> | Date | string
    updatedAt?: DateTimeFilter<"TrainingAdjustment"> | Date | string
    userId?: StringFilter<"TrainingAdjustment"> | string
    sessionId?: StringNullableFilter<"TrainingAdjustment"> | string | null
    planId?: StringNullableFilter<"TrainingAdjustment"> | string | null
    adjustmentType?: StringFilter<"TrainingAdjustment"> | string
    originalValue?: JsonFilter<"TrainingAdjustment">
    adjustedValue?: JsonFilter<"TrainingAdjustment">
    reason?: StringFilter<"TrainingAdjustment"> | string
    confidence?: FloatFilter<"TrainingAdjustment"> | number
    fatigueLevel?: IntFilter<"TrainingAdjustment"> | number
    exerciseId?: StringNullableFilter<"TrainingAdjustment"> | string | null
    exerciseName?: StringNullableFilter<"TrainingAdjustment"> | string | null
    isApplied?: BoolFilter<"TrainingAdjustment"> | boolean
    appliedAt?: DateTimeNullableFilter<"TrainingAdjustment"> | Date | string | null
    userFeedback?: StringNullableFilter<"TrainingAdjustment"> | string | null
  }, "id">

  export type TrainingAdjustmentOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    sessionId?: SortOrderInput | SortOrder
    planId?: SortOrderInput | SortOrder
    adjustmentType?: SortOrder
    originalValue?: SortOrder
    adjustedValue?: SortOrder
    reason?: SortOrder
    confidence?: SortOrder
    fatigueLevel?: SortOrder
    exerciseId?: SortOrderInput | SortOrder
    exerciseName?: SortOrderInput | SortOrder
    isApplied?: SortOrder
    appliedAt?: SortOrderInput | SortOrder
    userFeedback?: SortOrderInput | SortOrder
    _count?: TrainingAdjustmentCountOrderByAggregateInput
    _avg?: TrainingAdjustmentAvgOrderByAggregateInput
    _max?: TrainingAdjustmentMaxOrderByAggregateInput
    _min?: TrainingAdjustmentMinOrderByAggregateInput
    _sum?: TrainingAdjustmentSumOrderByAggregateInput
  }

  export type TrainingAdjustmentScalarWhereWithAggregatesInput = {
    AND?: TrainingAdjustmentScalarWhereWithAggregatesInput | TrainingAdjustmentScalarWhereWithAggregatesInput[]
    OR?: TrainingAdjustmentScalarWhereWithAggregatesInput[]
    NOT?: TrainingAdjustmentScalarWhereWithAggregatesInput | TrainingAdjustmentScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"TrainingAdjustment"> | string
    createdAt?: DateTimeWithAggregatesFilter<"TrainingAdjustment"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"TrainingAdjustment"> | Date | string
    userId?: StringWithAggregatesFilter<"TrainingAdjustment"> | string
    sessionId?: StringNullableWithAggregatesFilter<"TrainingAdjustment"> | string | null
    planId?: StringNullableWithAggregatesFilter<"TrainingAdjustment"> | string | null
    adjustmentType?: StringWithAggregatesFilter<"TrainingAdjustment"> | string
    originalValue?: JsonWithAggregatesFilter<"TrainingAdjustment">
    adjustedValue?: JsonWithAggregatesFilter<"TrainingAdjustment">
    reason?: StringWithAggregatesFilter<"TrainingAdjustment"> | string
    confidence?: FloatWithAggregatesFilter<"TrainingAdjustment"> | number
    fatigueLevel?: IntWithAggregatesFilter<"TrainingAdjustment"> | number
    exerciseId?: StringNullableWithAggregatesFilter<"TrainingAdjustment"> | string | null
    exerciseName?: StringNullableWithAggregatesFilter<"TrainingAdjustment"> | string | null
    isApplied?: BoolWithAggregatesFilter<"TrainingAdjustment"> | boolean
    appliedAt?: DateTimeNullableWithAggregatesFilter<"TrainingAdjustment"> | Date | string | null
    userFeedback?: StringNullableWithAggregatesFilter<"TrainingAdjustment"> | string | null
  }

  export type FatiguePatternWhereInput = {
    AND?: FatiguePatternWhereInput | FatiguePatternWhereInput[]
    OR?: FatiguePatternWhereInput[]
    NOT?: FatiguePatternWhereInput | FatiguePatternWhereInput[]
    id?: StringFilter<"FatiguePattern"> | string
    createdAt?: DateTimeFilter<"FatiguePattern"> | Date | string
    updatedAt?: DateTimeFilter<"FatiguePattern"> | Date | string
    userId?: StringFilter<"FatiguePattern"> | string
    dayOfWeek?: IntFilter<"FatiguePattern"> | number
    timeOfDay?: IntFilter<"FatiguePattern"> | number
    averageFatigue?: FloatFilter<"FatiguePattern"> | number
    sampleCount?: IntFilter<"FatiguePattern"> | number
    isActive?: BoolFilter<"FatiguePattern"> | boolean
    lastUpdated?: DateTimeFilter<"FatiguePattern"> | Date | string
  }

  export type FatiguePatternOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    dayOfWeek?: SortOrder
    timeOfDay?: SortOrder
    averageFatigue?: SortOrder
    sampleCount?: SortOrder
    isActive?: SortOrder
    lastUpdated?: SortOrder
  }

  export type FatiguePatternWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    userId_dayOfWeek_timeOfDay?: FatiguePatternUserIdDayOfWeekTimeOfDayCompoundUniqueInput
    AND?: FatiguePatternWhereInput | FatiguePatternWhereInput[]
    OR?: FatiguePatternWhereInput[]
    NOT?: FatiguePatternWhereInput | FatiguePatternWhereInput[]
    createdAt?: DateTimeFilter<"FatiguePattern"> | Date | string
    updatedAt?: DateTimeFilter<"FatiguePattern"> | Date | string
    userId?: StringFilter<"FatiguePattern"> | string
    dayOfWeek?: IntFilter<"FatiguePattern"> | number
    timeOfDay?: IntFilter<"FatiguePattern"> | number
    averageFatigue?: FloatFilter<"FatiguePattern"> | number
    sampleCount?: IntFilter<"FatiguePattern"> | number
    isActive?: BoolFilter<"FatiguePattern"> | boolean
    lastUpdated?: DateTimeFilter<"FatiguePattern"> | Date | string
  }, "id" | "userId_dayOfWeek_timeOfDay">

  export type FatiguePatternOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    dayOfWeek?: SortOrder
    timeOfDay?: SortOrder
    averageFatigue?: SortOrder
    sampleCount?: SortOrder
    isActive?: SortOrder
    lastUpdated?: SortOrder
    _count?: FatiguePatternCountOrderByAggregateInput
    _avg?: FatiguePatternAvgOrderByAggregateInput
    _max?: FatiguePatternMaxOrderByAggregateInput
    _min?: FatiguePatternMinOrderByAggregateInput
    _sum?: FatiguePatternSumOrderByAggregateInput
  }

  export type FatiguePatternScalarWhereWithAggregatesInput = {
    AND?: FatiguePatternScalarWhereWithAggregatesInput | FatiguePatternScalarWhereWithAggregatesInput[]
    OR?: FatiguePatternScalarWhereWithAggregatesInput[]
    NOT?: FatiguePatternScalarWhereWithAggregatesInput | FatiguePatternScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"FatiguePattern"> | string
    createdAt?: DateTimeWithAggregatesFilter<"FatiguePattern"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"FatiguePattern"> | Date | string
    userId?: StringWithAggregatesFilter<"FatiguePattern"> | string
    dayOfWeek?: IntWithAggregatesFilter<"FatiguePattern"> | number
    timeOfDay?: IntWithAggregatesFilter<"FatiguePattern"> | number
    averageFatigue?: FloatWithAggregatesFilter<"FatiguePattern"> | number
    sampleCount?: IntWithAggregatesFilter<"FatiguePattern"> | number
    isActive?: BoolWithAggregatesFilter<"FatiguePattern"> | boolean
    lastUpdated?: DateTimeWithAggregatesFilter<"FatiguePattern"> | Date | string
  }

  export type UserFatigueProfileWhereInput = {
    AND?: UserFatigueProfileWhereInput | UserFatigueProfileWhereInput[]
    OR?: UserFatigueProfileWhereInput[]
    NOT?: UserFatigueProfileWhereInput | UserFatigueProfileWhereInput[]
    id?: StringFilter<"UserFatigueProfile"> | string
    createdAt?: DateTimeFilter<"UserFatigueProfile"> | Date | string
    updatedAt?: DateTimeFilter<"UserFatigueProfile"> | Date | string
    userId?: StringFilter<"UserFatigueProfile"> | string
    autoAdjustEnabled?: BoolFilter<"UserFatigueProfile"> | boolean
    adjustmentSensitivity?: FloatFilter<"UserFatigueProfile"> | number
    preferredAdjustmentTypes?: StringNullableListFilter<"UserFatigueProfile">
    lowFatigueThreshold?: IntFilter<"UserFatigueProfile"> | number
    highFatigueThreshold?: IntFilter<"UserFatigueProfile"> | number
    totalAssessments?: IntFilter<"UserFatigueProfile"> | number
    totalAdjustments?: IntFilter<"UserFatigueProfile"> | number
    userSatisfactionScore?: FloatNullableFilter<"UserFatigueProfile"> | number | null
  }

  export type UserFatigueProfileOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    autoAdjustEnabled?: SortOrder
    adjustmentSensitivity?: SortOrder
    preferredAdjustmentTypes?: SortOrder
    lowFatigueThreshold?: SortOrder
    highFatigueThreshold?: SortOrder
    totalAssessments?: SortOrder
    totalAdjustments?: SortOrder
    userSatisfactionScore?: SortOrderInput | SortOrder
  }

  export type UserFatigueProfileWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    userId?: string
    AND?: UserFatigueProfileWhereInput | UserFatigueProfileWhereInput[]
    OR?: UserFatigueProfileWhereInput[]
    NOT?: UserFatigueProfileWhereInput | UserFatigueProfileWhereInput[]
    createdAt?: DateTimeFilter<"UserFatigueProfile"> | Date | string
    updatedAt?: DateTimeFilter<"UserFatigueProfile"> | Date | string
    autoAdjustEnabled?: BoolFilter<"UserFatigueProfile"> | boolean
    adjustmentSensitivity?: FloatFilter<"UserFatigueProfile"> | number
    preferredAdjustmentTypes?: StringNullableListFilter<"UserFatigueProfile">
    lowFatigueThreshold?: IntFilter<"UserFatigueProfile"> | number
    highFatigueThreshold?: IntFilter<"UserFatigueProfile"> | number
    totalAssessments?: IntFilter<"UserFatigueProfile"> | number
    totalAdjustments?: IntFilter<"UserFatigueProfile"> | number
    userSatisfactionScore?: FloatNullableFilter<"UserFatigueProfile"> | number | null
  }, "id" | "userId">

  export type UserFatigueProfileOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    autoAdjustEnabled?: SortOrder
    adjustmentSensitivity?: SortOrder
    preferredAdjustmentTypes?: SortOrder
    lowFatigueThreshold?: SortOrder
    highFatigueThreshold?: SortOrder
    totalAssessments?: SortOrder
    totalAdjustments?: SortOrder
    userSatisfactionScore?: SortOrderInput | SortOrder
    _count?: UserFatigueProfileCountOrderByAggregateInput
    _avg?: UserFatigueProfileAvgOrderByAggregateInput
    _max?: UserFatigueProfileMaxOrderByAggregateInput
    _min?: UserFatigueProfileMinOrderByAggregateInput
    _sum?: UserFatigueProfileSumOrderByAggregateInput
  }

  export type UserFatigueProfileScalarWhereWithAggregatesInput = {
    AND?: UserFatigueProfileScalarWhereWithAggregatesInput | UserFatigueProfileScalarWhereWithAggregatesInput[]
    OR?: UserFatigueProfileScalarWhereWithAggregatesInput[]
    NOT?: UserFatigueProfileScalarWhereWithAggregatesInput | UserFatigueProfileScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"UserFatigueProfile"> | string
    createdAt?: DateTimeWithAggregatesFilter<"UserFatigueProfile"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"UserFatigueProfile"> | Date | string
    userId?: StringWithAggregatesFilter<"UserFatigueProfile"> | string
    autoAdjustEnabled?: BoolWithAggregatesFilter<"UserFatigueProfile"> | boolean
    adjustmentSensitivity?: FloatWithAggregatesFilter<"UserFatigueProfile"> | number
    preferredAdjustmentTypes?: StringNullableListFilter<"UserFatigueProfile">
    lowFatigueThreshold?: IntWithAggregatesFilter<"UserFatigueProfile"> | number
    highFatigueThreshold?: IntWithAggregatesFilter<"UserFatigueProfile"> | number
    totalAssessments?: IntWithAggregatesFilter<"UserFatigueProfile"> | number
    totalAdjustments?: IntWithAggregatesFilter<"UserFatigueProfile"> | number
    userSatisfactionScore?: FloatNullableWithAggregatesFilter<"UserFatigueProfile"> | number | null
  }

  export type FatigueAssessmentCreateInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
    sessionId?: string | null
    overallFatigue: number
    physicalFatigue: number
    mentalFatigue: number
    sleepQuality: number
    stressLevel: number
    notes?: string | null
    previousWorkout?: string | null
    timeSinceLastWorkout?: number | null
    assessmentType: string
    isActive?: boolean
  }

  export type FatigueAssessmentUncheckedCreateInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
    sessionId?: string | null
    overallFatigue: number
    physicalFatigue: number
    mentalFatigue: number
    sleepQuality: number
    stressLevel: number
    notes?: string | null
    previousWorkout?: string | null
    timeSinceLastWorkout?: number | null
    assessmentType: string
    isActive?: boolean
  }

  export type FatigueAssessmentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    overallFatigue?: IntFieldUpdateOperationsInput | number
    physicalFatigue?: IntFieldUpdateOperationsInput | number
    mentalFatigue?: IntFieldUpdateOperationsInput | number
    sleepQuality?: IntFieldUpdateOperationsInput | number
    stressLevel?: IntFieldUpdateOperationsInput | number
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    previousWorkout?: NullableStringFieldUpdateOperationsInput | string | null
    timeSinceLastWorkout?: NullableIntFieldUpdateOperationsInput | number | null
    assessmentType?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
  }

  export type FatigueAssessmentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    overallFatigue?: IntFieldUpdateOperationsInput | number
    physicalFatigue?: IntFieldUpdateOperationsInput | number
    mentalFatigue?: IntFieldUpdateOperationsInput | number
    sleepQuality?: IntFieldUpdateOperationsInput | number
    stressLevel?: IntFieldUpdateOperationsInput | number
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    previousWorkout?: NullableStringFieldUpdateOperationsInput | string | null
    timeSinceLastWorkout?: NullableIntFieldUpdateOperationsInput | number | null
    assessmentType?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
  }

  export type FatigueAssessmentCreateManyInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
    sessionId?: string | null
    overallFatigue: number
    physicalFatigue: number
    mentalFatigue: number
    sleepQuality: number
    stressLevel: number
    notes?: string | null
    previousWorkout?: string | null
    timeSinceLastWorkout?: number | null
    assessmentType: string
    isActive?: boolean
  }

  export type FatigueAssessmentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    overallFatigue?: IntFieldUpdateOperationsInput | number
    physicalFatigue?: IntFieldUpdateOperationsInput | number
    mentalFatigue?: IntFieldUpdateOperationsInput | number
    sleepQuality?: IntFieldUpdateOperationsInput | number
    stressLevel?: IntFieldUpdateOperationsInput | number
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    previousWorkout?: NullableStringFieldUpdateOperationsInput | string | null
    timeSinceLastWorkout?: NullableIntFieldUpdateOperationsInput | number | null
    assessmentType?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
  }

  export type FatigueAssessmentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    overallFatigue?: IntFieldUpdateOperationsInput | number
    physicalFatigue?: IntFieldUpdateOperationsInput | number
    mentalFatigue?: IntFieldUpdateOperationsInput | number
    sleepQuality?: IntFieldUpdateOperationsInput | number
    stressLevel?: IntFieldUpdateOperationsInput | number
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    previousWorkout?: NullableStringFieldUpdateOperationsInput | string | null
    timeSinceLastWorkout?: NullableIntFieldUpdateOperationsInput | number | null
    assessmentType?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
  }

  export type TrainingAdjustmentCreateInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
    sessionId?: string | null
    planId?: string | null
    adjustmentType: string
    originalValue: JsonNullValueInput | InputJsonValue
    adjustedValue: JsonNullValueInput | InputJsonValue
    reason: string
    confidence: number
    fatigueLevel: number
    exerciseId?: string | null
    exerciseName?: string | null
    isApplied?: boolean
    appliedAt?: Date | string | null
    userFeedback?: string | null
  }

  export type TrainingAdjustmentUncheckedCreateInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
    sessionId?: string | null
    planId?: string | null
    adjustmentType: string
    originalValue: JsonNullValueInput | InputJsonValue
    adjustedValue: JsonNullValueInput | InputJsonValue
    reason: string
    confidence: number
    fatigueLevel: number
    exerciseId?: string | null
    exerciseName?: string | null
    isApplied?: boolean
    appliedAt?: Date | string | null
    userFeedback?: string | null
  }

  export type TrainingAdjustmentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    planId?: NullableStringFieldUpdateOperationsInput | string | null
    adjustmentType?: StringFieldUpdateOperationsInput | string
    originalValue?: JsonNullValueInput | InputJsonValue
    adjustedValue?: JsonNullValueInput | InputJsonValue
    reason?: StringFieldUpdateOperationsInput | string
    confidence?: FloatFieldUpdateOperationsInput | number
    fatigueLevel?: IntFieldUpdateOperationsInput | number
    exerciseId?: NullableStringFieldUpdateOperationsInput | string | null
    exerciseName?: NullableStringFieldUpdateOperationsInput | string | null
    isApplied?: BoolFieldUpdateOperationsInput | boolean
    appliedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    userFeedback?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type TrainingAdjustmentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    planId?: NullableStringFieldUpdateOperationsInput | string | null
    adjustmentType?: StringFieldUpdateOperationsInput | string
    originalValue?: JsonNullValueInput | InputJsonValue
    adjustedValue?: JsonNullValueInput | InputJsonValue
    reason?: StringFieldUpdateOperationsInput | string
    confidence?: FloatFieldUpdateOperationsInput | number
    fatigueLevel?: IntFieldUpdateOperationsInput | number
    exerciseId?: NullableStringFieldUpdateOperationsInput | string | null
    exerciseName?: NullableStringFieldUpdateOperationsInput | string | null
    isApplied?: BoolFieldUpdateOperationsInput | boolean
    appliedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    userFeedback?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type TrainingAdjustmentCreateManyInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
    sessionId?: string | null
    planId?: string | null
    adjustmentType: string
    originalValue: JsonNullValueInput | InputJsonValue
    adjustedValue: JsonNullValueInput | InputJsonValue
    reason: string
    confidence: number
    fatigueLevel: number
    exerciseId?: string | null
    exerciseName?: string | null
    isApplied?: boolean
    appliedAt?: Date | string | null
    userFeedback?: string | null
  }

  export type TrainingAdjustmentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    planId?: NullableStringFieldUpdateOperationsInput | string | null
    adjustmentType?: StringFieldUpdateOperationsInput | string
    originalValue?: JsonNullValueInput | InputJsonValue
    adjustedValue?: JsonNullValueInput | InputJsonValue
    reason?: StringFieldUpdateOperationsInput | string
    confidence?: FloatFieldUpdateOperationsInput | number
    fatigueLevel?: IntFieldUpdateOperationsInput | number
    exerciseId?: NullableStringFieldUpdateOperationsInput | string | null
    exerciseName?: NullableStringFieldUpdateOperationsInput | string | null
    isApplied?: BoolFieldUpdateOperationsInput | boolean
    appliedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    userFeedback?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type TrainingAdjustmentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    planId?: NullableStringFieldUpdateOperationsInput | string | null
    adjustmentType?: StringFieldUpdateOperationsInput | string
    originalValue?: JsonNullValueInput | InputJsonValue
    adjustedValue?: JsonNullValueInput | InputJsonValue
    reason?: StringFieldUpdateOperationsInput | string
    confidence?: FloatFieldUpdateOperationsInput | number
    fatigueLevel?: IntFieldUpdateOperationsInput | number
    exerciseId?: NullableStringFieldUpdateOperationsInput | string | null
    exerciseName?: NullableStringFieldUpdateOperationsInput | string | null
    isApplied?: BoolFieldUpdateOperationsInput | boolean
    appliedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    userFeedback?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type FatiguePatternCreateInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
    dayOfWeek: number
    timeOfDay: number
    averageFatigue: number
    sampleCount: number
    isActive?: boolean
    lastUpdated?: Date | string
  }

  export type FatiguePatternUncheckedCreateInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
    dayOfWeek: number
    timeOfDay: number
    averageFatigue: number
    sampleCount: number
    isActive?: boolean
    lastUpdated?: Date | string
  }

  export type FatiguePatternUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    dayOfWeek?: IntFieldUpdateOperationsInput | number
    timeOfDay?: IntFieldUpdateOperationsInput | number
    averageFatigue?: FloatFieldUpdateOperationsInput | number
    sampleCount?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastUpdated?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FatiguePatternUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    dayOfWeek?: IntFieldUpdateOperationsInput | number
    timeOfDay?: IntFieldUpdateOperationsInput | number
    averageFatigue?: FloatFieldUpdateOperationsInput | number
    sampleCount?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastUpdated?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FatiguePatternCreateManyInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
    dayOfWeek: number
    timeOfDay: number
    averageFatigue: number
    sampleCount: number
    isActive?: boolean
    lastUpdated?: Date | string
  }

  export type FatiguePatternUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    dayOfWeek?: IntFieldUpdateOperationsInput | number
    timeOfDay?: IntFieldUpdateOperationsInput | number
    averageFatigue?: FloatFieldUpdateOperationsInput | number
    sampleCount?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastUpdated?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FatiguePatternUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    dayOfWeek?: IntFieldUpdateOperationsInput | number
    timeOfDay?: IntFieldUpdateOperationsInput | number
    averageFatigue?: FloatFieldUpdateOperationsInput | number
    sampleCount?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastUpdated?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserFatigueProfileCreateInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
    autoAdjustEnabled?: boolean
    adjustmentSensitivity?: number
    preferredAdjustmentTypes?: UserFatigueProfileCreatepreferredAdjustmentTypesInput | string[]
    lowFatigueThreshold?: number
    highFatigueThreshold?: number
    totalAssessments?: number
    totalAdjustments?: number
    userSatisfactionScore?: number | null
  }

  export type UserFatigueProfileUncheckedCreateInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
    autoAdjustEnabled?: boolean
    adjustmentSensitivity?: number
    preferredAdjustmentTypes?: UserFatigueProfileCreatepreferredAdjustmentTypesInput | string[]
    lowFatigueThreshold?: number
    highFatigueThreshold?: number
    totalAssessments?: number
    totalAdjustments?: number
    userSatisfactionScore?: number | null
  }

  export type UserFatigueProfileUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    autoAdjustEnabled?: BoolFieldUpdateOperationsInput | boolean
    adjustmentSensitivity?: FloatFieldUpdateOperationsInput | number
    preferredAdjustmentTypes?: UserFatigueProfileUpdatepreferredAdjustmentTypesInput | string[]
    lowFatigueThreshold?: IntFieldUpdateOperationsInput | number
    highFatigueThreshold?: IntFieldUpdateOperationsInput | number
    totalAssessments?: IntFieldUpdateOperationsInput | number
    totalAdjustments?: IntFieldUpdateOperationsInput | number
    userSatisfactionScore?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type UserFatigueProfileUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    autoAdjustEnabled?: BoolFieldUpdateOperationsInput | boolean
    adjustmentSensitivity?: FloatFieldUpdateOperationsInput | number
    preferredAdjustmentTypes?: UserFatigueProfileUpdatepreferredAdjustmentTypesInput | string[]
    lowFatigueThreshold?: IntFieldUpdateOperationsInput | number
    highFatigueThreshold?: IntFieldUpdateOperationsInput | number
    totalAssessments?: IntFieldUpdateOperationsInput | number
    totalAdjustments?: IntFieldUpdateOperationsInput | number
    userSatisfactionScore?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type UserFatigueProfileCreateManyInput = {
    id?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
    autoAdjustEnabled?: boolean
    adjustmentSensitivity?: number
    preferredAdjustmentTypes?: UserFatigueProfileCreatepreferredAdjustmentTypesInput | string[]
    lowFatigueThreshold?: number
    highFatigueThreshold?: number
    totalAssessments?: number
    totalAdjustments?: number
    userSatisfactionScore?: number | null
  }

  export type UserFatigueProfileUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    autoAdjustEnabled?: BoolFieldUpdateOperationsInput | boolean
    adjustmentSensitivity?: FloatFieldUpdateOperationsInput | number
    preferredAdjustmentTypes?: UserFatigueProfileUpdatepreferredAdjustmentTypesInput | string[]
    lowFatigueThreshold?: IntFieldUpdateOperationsInput | number
    highFatigueThreshold?: IntFieldUpdateOperationsInput | number
    totalAssessments?: IntFieldUpdateOperationsInput | number
    totalAdjustments?: IntFieldUpdateOperationsInput | number
    userSatisfactionScore?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type UserFatigueProfileUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    autoAdjustEnabled?: BoolFieldUpdateOperationsInput | boolean
    adjustmentSensitivity?: FloatFieldUpdateOperationsInput | number
    preferredAdjustmentTypes?: UserFatigueProfileUpdatepreferredAdjustmentTypesInput | string[]
    lowFatigueThreshold?: IntFieldUpdateOperationsInput | number
    highFatigueThreshold?: IntFieldUpdateOperationsInput | number
    totalAssessments?: IntFieldUpdateOperationsInput | number
    totalAdjustments?: IntFieldUpdateOperationsInput | number
    userSatisfactionScore?: NullableFloatFieldUpdateOperationsInput | number | null
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

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type FatigueAssessmentCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    sessionId?: SortOrder
    overallFatigue?: SortOrder
    physicalFatigue?: SortOrder
    mentalFatigue?: SortOrder
    sleepQuality?: SortOrder
    stressLevel?: SortOrder
    notes?: SortOrder
    previousWorkout?: SortOrder
    timeSinceLastWorkout?: SortOrder
    assessmentType?: SortOrder
    isActive?: SortOrder
  }

  export type FatigueAssessmentAvgOrderByAggregateInput = {
    overallFatigue?: SortOrder
    physicalFatigue?: SortOrder
    mentalFatigue?: SortOrder
    sleepQuality?: SortOrder
    stressLevel?: SortOrder
    timeSinceLastWorkout?: SortOrder
  }

  export type FatigueAssessmentMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    sessionId?: SortOrder
    overallFatigue?: SortOrder
    physicalFatigue?: SortOrder
    mentalFatigue?: SortOrder
    sleepQuality?: SortOrder
    stressLevel?: SortOrder
    notes?: SortOrder
    previousWorkout?: SortOrder
    timeSinceLastWorkout?: SortOrder
    assessmentType?: SortOrder
    isActive?: SortOrder
  }

  export type FatigueAssessmentMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    sessionId?: SortOrder
    overallFatigue?: SortOrder
    physicalFatigue?: SortOrder
    mentalFatigue?: SortOrder
    sleepQuality?: SortOrder
    stressLevel?: SortOrder
    notes?: SortOrder
    previousWorkout?: SortOrder
    timeSinceLastWorkout?: SortOrder
    assessmentType?: SortOrder
    isActive?: SortOrder
  }

  export type FatigueAssessmentSumOrderByAggregateInput = {
    overallFatigue?: SortOrder
    physicalFatigue?: SortOrder
    mentalFatigue?: SortOrder
    sleepQuality?: SortOrder
    stressLevel?: SortOrder
    timeSinceLastWorkout?: SortOrder
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

  export type TrainingAdjustmentCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    sessionId?: SortOrder
    planId?: SortOrder
    adjustmentType?: SortOrder
    originalValue?: SortOrder
    adjustedValue?: SortOrder
    reason?: SortOrder
    confidence?: SortOrder
    fatigueLevel?: SortOrder
    exerciseId?: SortOrder
    exerciseName?: SortOrder
    isApplied?: SortOrder
    appliedAt?: SortOrder
    userFeedback?: SortOrder
  }

  export type TrainingAdjustmentAvgOrderByAggregateInput = {
    confidence?: SortOrder
    fatigueLevel?: SortOrder
  }

  export type TrainingAdjustmentMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    sessionId?: SortOrder
    planId?: SortOrder
    adjustmentType?: SortOrder
    reason?: SortOrder
    confidence?: SortOrder
    fatigueLevel?: SortOrder
    exerciseId?: SortOrder
    exerciseName?: SortOrder
    isApplied?: SortOrder
    appliedAt?: SortOrder
    userFeedback?: SortOrder
  }

  export type TrainingAdjustmentMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    sessionId?: SortOrder
    planId?: SortOrder
    adjustmentType?: SortOrder
    reason?: SortOrder
    confidence?: SortOrder
    fatigueLevel?: SortOrder
    exerciseId?: SortOrder
    exerciseName?: SortOrder
    isApplied?: SortOrder
    appliedAt?: SortOrder
    userFeedback?: SortOrder
  }

  export type TrainingAdjustmentSumOrderByAggregateInput = {
    confidence?: SortOrder
    fatigueLevel?: SortOrder
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

  export type FatiguePatternUserIdDayOfWeekTimeOfDayCompoundUniqueInput = {
    userId: string
    dayOfWeek: number
    timeOfDay: number
  }

  export type FatiguePatternCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    dayOfWeek?: SortOrder
    timeOfDay?: SortOrder
    averageFatigue?: SortOrder
    sampleCount?: SortOrder
    isActive?: SortOrder
    lastUpdated?: SortOrder
  }

  export type FatiguePatternAvgOrderByAggregateInput = {
    dayOfWeek?: SortOrder
    timeOfDay?: SortOrder
    averageFatigue?: SortOrder
    sampleCount?: SortOrder
  }

  export type FatiguePatternMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    dayOfWeek?: SortOrder
    timeOfDay?: SortOrder
    averageFatigue?: SortOrder
    sampleCount?: SortOrder
    isActive?: SortOrder
    lastUpdated?: SortOrder
  }

  export type FatiguePatternMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    dayOfWeek?: SortOrder
    timeOfDay?: SortOrder
    averageFatigue?: SortOrder
    sampleCount?: SortOrder
    isActive?: SortOrder
    lastUpdated?: SortOrder
  }

  export type FatiguePatternSumOrderByAggregateInput = {
    dayOfWeek?: SortOrder
    timeOfDay?: SortOrder
    averageFatigue?: SortOrder
    sampleCount?: SortOrder
  }

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
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

  export type UserFatigueProfileCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    autoAdjustEnabled?: SortOrder
    adjustmentSensitivity?: SortOrder
    preferredAdjustmentTypes?: SortOrder
    lowFatigueThreshold?: SortOrder
    highFatigueThreshold?: SortOrder
    totalAssessments?: SortOrder
    totalAdjustments?: SortOrder
    userSatisfactionScore?: SortOrder
  }

  export type UserFatigueProfileAvgOrderByAggregateInput = {
    adjustmentSensitivity?: SortOrder
    lowFatigueThreshold?: SortOrder
    highFatigueThreshold?: SortOrder
    totalAssessments?: SortOrder
    totalAdjustments?: SortOrder
    userSatisfactionScore?: SortOrder
  }

  export type UserFatigueProfileMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    autoAdjustEnabled?: SortOrder
    adjustmentSensitivity?: SortOrder
    lowFatigueThreshold?: SortOrder
    highFatigueThreshold?: SortOrder
    totalAssessments?: SortOrder
    totalAdjustments?: SortOrder
    userSatisfactionScore?: SortOrder
  }

  export type UserFatigueProfileMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    userId?: SortOrder
    autoAdjustEnabled?: SortOrder
    adjustmentSensitivity?: SortOrder
    lowFatigueThreshold?: SortOrder
    highFatigueThreshold?: SortOrder
    totalAssessments?: SortOrder
    totalAdjustments?: SortOrder
    userSatisfactionScore?: SortOrder
  }

  export type UserFatigueProfileSumOrderByAggregateInput = {
    adjustmentSensitivity?: SortOrder
    lowFatigueThreshold?: SortOrder
    highFatigueThreshold?: SortOrder
    totalAssessments?: SortOrder
    totalAdjustments?: SortOrder
    userSatisfactionScore?: SortOrder
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

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
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

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type UserFatigueProfileCreatepreferredAdjustmentTypesInput = {
    set: string[]
  }

  export type UserFatigueProfileUpdatepreferredAdjustmentTypesInput = {
    set?: string[]
    push?: string | string[]
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
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

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
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



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use FatigueAssessmentDefaultArgs instead
     */
    export type FatigueAssessmentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = FatigueAssessmentDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TrainingAdjustmentDefaultArgs instead
     */
    export type TrainingAdjustmentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TrainingAdjustmentDefaultArgs<ExtArgs>
    /**
     * @deprecated Use FatiguePatternDefaultArgs instead
     */
    export type FatiguePatternArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = FatiguePatternDefaultArgs<ExtArgs>
    /**
     * @deprecated Use UserFatigueProfileDefaultArgs instead
     */
    export type UserFatigueProfileArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserFatigueProfileDefaultArgs<ExtArgs>

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