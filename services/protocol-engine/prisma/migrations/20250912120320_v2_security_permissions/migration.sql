-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PRIVATE', 'TENANT', 'PUBLIC');

-- CreateEnum
CREATE TYPE "PermissionRole" AS ENUM ('OWNER', 'ADMIN', 'EDITOR', 'VIEWER', 'GUEST');

-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('READ', 'WRITE', 'EXECUTE', 'SHARE', 'DELETE', 'ANALYTICS', 'EXPORT');

-- CreateEnum
CREATE TYPE "DataClassification" AS ENUM ('PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'PERSONAL', 'SENSITIVE');

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "settings" JSONB,
    "maxUsers" INTEGER NOT NULL DEFAULT 100,
    "maxProtocols" INTEGER NOT NULL DEFAULT 1000,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "tenantId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "protocols" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "description" TEXT,
    "category" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "duration" INTEGER,
    "frequency" INTEGER,
    "ownerId" TEXT NOT NULL,
    "visibility" "Visibility" NOT NULL DEFAULT 'PRIVATE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "overview" TEXT,
    "principles" TEXT[],
    "requirements" TEXT[],

    CONSTRAINT "protocols_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blocks" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "protocolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "phase" TEXT NOT NULL,
    "intensity" TEXT NOT NULL,
    "volume" TEXT NOT NULL,
    "parameters" JSONB,
    "rules" JSONB,

    CONSTRAINT "blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "block_sessions" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "blockId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "exercises" JSONB NOT NULL,
    "duration" INTEGER,
    "notes" TEXT,
    "intensity" DOUBLE PRECISION,
    "volume" DOUBLE PRECISION,
    "rpe" DOUBLE PRECISION,

    CONSTRAINT "block_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "block_progressions" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "blockId" TEXT NOT NULL,
    "week" INTEGER NOT NULL,
    "parameters" JSONB NOT NULL,
    "rules" JSONB,
    "triggers" JSONB,

    CONSTRAINT "block_progressions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "protocol_permissions" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "protocolId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "PermissionRole" NOT NULL,
    "permissions" "Permission"[],
    "grantedBy" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "protocol_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "sessionId" TEXT,
    "details" JSONB,
    "result" TEXT NOT NULL,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "protocol_templates" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "protocolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parameters" JSONB NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "usageCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "protocol_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "protocol_executions" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,
    "protocolId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "templateId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "parameters" JSONB NOT NULL,
    "adaptations" JSONB,
    "dataClassification" "DataClassification" NOT NULL DEFAULT 'PERSONAL',
    "retentionUntil" TIMESTAMP(3),
    "currentBlockId" TEXT,
    "currentWeek" INTEGER NOT NULL DEFAULT 1,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0.0,

    CONSTRAINT "protocol_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "block_executions" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "executionId" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "adaptations" JSONB,
    "notes" TEXT,
    "currentWeek" INTEGER NOT NULL DEFAULT 1,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0.0,

    CONSTRAINT "block_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_executions" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "executionId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "actualDate" TIMESTAMP(3),
    "exercises" JSONB,
    "adaptations" JSONB,
    "notes" TEXT,
    "duration" INTEGER,
    "rpe" DOUBLE PRECISION,
    "volume" DOUBLE PRECISION,

    CONSTRAINT "session_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "protocol_analytics" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "protocolId" TEXT NOT NULL,
    "userId" TEXT,
    "metrics" JSONB NOT NULL,
    "insights" JSONB,
    "recommendations" JSONB,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "protocol_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "protocol_shares" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "protocolId" TEXT NOT NULL,
    "sharedBy" TEXT NOT NULL,
    "sharedWith" TEXT NOT NULL,
    "permissions" "Permission"[],
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "acceptedAt" TIMESTAMP(3),

    CONSTRAINT "protocol_shares_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_name_key" ON "tenants"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_domain_key" ON "tenants"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_tenantId_isActive_idx" ON "users"("tenantId", "isActive");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "protocols_name_key" ON "protocols"("name");

-- CreateIndex
CREATE INDEX "protocols_tenantId_isActive_idx" ON "protocols"("tenantId", "isActive");

-- CreateIndex
CREATE INDEX "protocols_tenantId_category_difficulty_idx" ON "protocols"("tenantId", "category", "difficulty");

-- CreateIndex
CREATE INDEX "protocols_ownerId_isActive_idx" ON "protocols"("ownerId", "isActive");

-- CreateIndex
CREATE INDEX "protocols_visibility_isPublic_idx" ON "protocols"("visibility", "isPublic");

-- CreateIndex
CREATE INDEX "blocks_protocolId_order_idx" ON "blocks"("protocolId", "order");

-- CreateIndex
CREATE INDEX "blocks_phase_idx" ON "blocks"("phase");

-- CreateIndex
CREATE INDEX "block_sessions_blockId_dayOfWeek_order_idx" ON "block_sessions"("blockId", "dayOfWeek", "order");

-- CreateIndex
CREATE UNIQUE INDEX "block_progressions_blockId_week_key" ON "block_progressions"("blockId", "week");

-- CreateIndex
CREATE INDEX "protocol_permissions_userId_isActive_idx" ON "protocol_permissions"("userId", "isActive");

-- CreateIndex
CREATE INDEX "protocol_permissions_protocolId_role_idx" ON "protocol_permissions"("protocolId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "protocol_permissions_protocolId_userId_key" ON "protocol_permissions"("protocolId", "userId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_createdAt_idx" ON "audit_logs"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_action_createdAt_idx" ON "audit_logs"("action", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_resourceType_resourceId_idx" ON "audit_logs"("resourceType", "resourceId");

-- CreateIndex
CREATE INDEX "audit_logs_tenantId_createdAt_idx" ON "audit_logs"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "protocol_templates_protocolId_idx" ON "protocol_templates"("protocolId");

-- CreateIndex
CREATE INDEX "protocol_executions_tenantId_userId_status_idx" ON "protocol_executions"("tenantId", "userId", "status");

-- CreateIndex
CREATE INDEX "protocol_executions_protocolId_idx" ON "protocol_executions"("protocolId");

-- CreateIndex
CREATE INDEX "protocol_executions_dataClassification_idx" ON "protocol_executions"("dataClassification");

-- CreateIndex
CREATE INDEX "block_executions_executionId_idx" ON "block_executions"("executionId");

-- CreateIndex
CREATE INDEX "block_executions_blockId_idx" ON "block_executions"("blockId");

-- CreateIndex
CREATE INDEX "session_executions_executionId_scheduledDate_idx" ON "session_executions"("executionId", "scheduledDate");

-- CreateIndex
CREATE INDEX "protocol_analytics_protocolId_periodStart_idx" ON "protocol_analytics"("protocolId", "periodStart");

-- CreateIndex
CREATE INDEX "protocol_analytics_userId_idx" ON "protocol_analytics"("userId");

-- CreateIndex
CREATE INDEX "protocol_shares_sharedBy_idx" ON "protocol_shares"("sharedBy");

-- CreateIndex
CREATE INDEX "protocol_shares_sharedWith_idx" ON "protocol_shares"("sharedWith");

-- CreateIndex
CREATE UNIQUE INDEX "protocol_shares_protocolId_sharedWith_key" ON "protocol_shares"("protocolId", "sharedWith");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "protocols" ADD CONSTRAINT "protocols_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "protocols" ADD CONSTRAINT "protocols_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_protocolId_fkey" FOREIGN KEY ("protocolId") REFERENCES "protocols"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "block_sessions" ADD CONSTRAINT "block_sessions_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "block_progressions" ADD CONSTRAINT "block_progressions_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "protocol_permissions" ADD CONSTRAINT "protocol_permissions_protocolId_fkey" FOREIGN KEY ("protocolId") REFERENCES "protocols"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "protocol_permissions" ADD CONSTRAINT "protocol_permissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "protocol_templates" ADD CONSTRAINT "protocol_templates_protocolId_fkey" FOREIGN KEY ("protocolId") REFERENCES "protocols"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "protocol_executions" ADD CONSTRAINT "protocol_executions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "protocol_executions" ADD CONSTRAINT "protocol_executions_protocolId_fkey" FOREIGN KEY ("protocolId") REFERENCES "protocols"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "protocol_executions" ADD CONSTRAINT "protocol_executions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "block_executions" ADD CONSTRAINT "block_executions_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "protocol_executions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "block_executions" ADD CONSTRAINT "block_executions_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_executions" ADD CONSTRAINT "session_executions_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "protocol_executions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "protocol_shares" ADD CONSTRAINT "protocol_shares_protocolId_fkey" FOREIGN KEY ("protocolId") REFERENCES "protocols"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "protocol_shares" ADD CONSTRAINT "protocol_shares_sharedBy_fkey" FOREIGN KEY ("sharedBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "protocol_shares" ADD CONSTRAINT "protocol_shares_sharedWith_fkey" FOREIGN KEY ("sharedWith") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
