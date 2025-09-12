
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.TenantScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  name: 'name',
  domain: 'domain',
  isActive: 'isActive',
  settings: 'settings',
  maxUsers: 'maxUsers',
  maxProtocols: 'maxProtocols'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  email: 'email',
  name: 'name',
  tenantId: 'tenantId',
  isActive: 'isActive',
  lastLoginAt: 'lastLoginAt'
};

exports.Prisma.ProtocolScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  tenantId: 'tenantId',
  name: 'name',
  version: 'version',
  description: 'description',
  category: 'category',
  difficulty: 'difficulty',
  duration: 'duration',
  frequency: 'frequency',
  ownerId: 'ownerId',
  visibility: 'visibility',
  isActive: 'isActive',
  isPublic: 'isPublic',
  overview: 'overview',
  principles: 'principles',
  requirements: 'requirements'
};

exports.Prisma.BlockScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  protocolId: 'protocolId',
  name: 'name',
  description: 'description',
  order: 'order',
  duration: 'duration',
  phase: 'phase',
  intensity: 'intensity',
  volume: 'volume',
  parameters: 'parameters',
  rules: 'rules'
};

exports.Prisma.BlockSessionScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  blockId: 'blockId',
  name: 'name',
  dayOfWeek: 'dayOfWeek',
  order: 'order',
  exercises: 'exercises',
  duration: 'duration',
  notes: 'notes',
  intensity: 'intensity',
  volume: 'volume',
  rpe: 'rpe'
};

exports.Prisma.BlockProgressionScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  blockId: 'blockId',
  week: 'week',
  parameters: 'parameters',
  rules: 'rules',
  triggers: 'triggers'
};

exports.Prisma.ProtocolPermissionScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  protocolId: 'protocolId',
  userId: 'userId',
  role: 'role',
  permissions: 'permissions',
  grantedBy: 'grantedBy',
  grantedAt: 'grantedAt',
  expiresAt: 'expiresAt',
  isActive: 'isActive'
};

exports.Prisma.AuditLogScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  action: 'action',
  resourceType: 'resourceType',
  resourceId: 'resourceId',
  userId: 'userId',
  tenantId: 'tenantId',
  ip: 'ip',
  userAgent: 'userAgent',
  sessionId: 'sessionId',
  details: 'details',
  result: 'result'
};

exports.Prisma.ProtocolTemplateScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  protocolId: 'protocolId',
  name: 'name',
  description: 'description',
  parameters: 'parameters',
  isDefault: 'isDefault',
  usageCount: 'usageCount'
};

exports.Prisma.ProtocolExecutionScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  tenantId: 'tenantId',
  protocolId: 'protocolId',
  userId: 'userId',
  templateId: 'templateId',
  status: 'status',
  startDate: 'startDate',
  endDate: 'endDate',
  parameters: 'parameters',
  adaptations: 'adaptations',
  dataClassification: 'dataClassification',
  retentionUntil: 'retentionUntil',
  currentBlockId: 'currentBlockId',
  currentWeek: 'currentWeek',
  progress: 'progress'
};

exports.Prisma.BlockExecutionScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  executionId: 'executionId',
  blockId: 'blockId',
  status: 'status',
  startDate: 'startDate',
  endDate: 'endDate',
  adaptations: 'adaptations',
  notes: 'notes',
  currentWeek: 'currentWeek',
  progress: 'progress'
};

exports.Prisma.SessionExecutionScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  executionId: 'executionId',
  sessionId: 'sessionId',
  status: 'status',
  scheduledDate: 'scheduledDate',
  actualDate: 'actualDate',
  exercises: 'exercises',
  adaptations: 'adaptations',
  notes: 'notes',
  duration: 'duration',
  rpe: 'rpe',
  volume: 'volume'
};

exports.Prisma.ProtocolAnalyticsScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  protocolId: 'protocolId',
  userId: 'userId',
  metrics: 'metrics',
  insights: 'insights',
  recommendations: 'recommendations',
  periodStart: 'periodStart',
  periodEnd: 'periodEnd'
};

exports.Prisma.ProtocolShareScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  protocolId: 'protocolId',
  sharedBy: 'sharedBy',
  sharedWith: 'sharedWith',
  permissions: 'permissions',
  expiresAt: 'expiresAt',
  isActive: 'isActive',
  acceptedAt: 'acceptedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.Visibility = exports.$Enums.Visibility = {
  PRIVATE: 'PRIVATE',
  TENANT: 'TENANT',
  PUBLIC: 'PUBLIC'
};

exports.PermissionRole = exports.$Enums.PermissionRole = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  EDITOR: 'EDITOR',
  VIEWER: 'VIEWER',
  GUEST: 'GUEST'
};

exports.Permission = exports.$Enums.Permission = {
  READ: 'READ',
  WRITE: 'WRITE',
  EXECUTE: 'EXECUTE',
  SHARE: 'SHARE',
  DELETE: 'DELETE',
  ANALYTICS: 'ANALYTICS',
  EXPORT: 'EXPORT'
};

exports.DataClassification = exports.$Enums.DataClassification = {
  PUBLIC: 'PUBLIC',
  INTERNAL: 'INTERNAL',
  CONFIDENTIAL: 'CONFIDENTIAL',
  PERSONAL: 'PERSONAL',
  SENSITIVE: 'SENSITIVE'
};

exports.Prisma.ModelName = {
  Tenant: 'Tenant',
  User: 'User',
  Protocol: 'Protocol',
  Block: 'Block',
  BlockSession: 'BlockSession',
  BlockProgression: 'BlockProgression',
  ProtocolPermission: 'ProtocolPermission',
  AuditLog: 'AuditLog',
  ProtocolTemplate: 'ProtocolTemplate',
  ProtocolExecution: 'ProtocolExecution',
  BlockExecution: 'BlockExecution',
  SessionExecution: 'SessionExecution',
  ProtocolAnalytics: 'ProtocolAnalytics',
  ProtocolShare: 'ProtocolShare'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
