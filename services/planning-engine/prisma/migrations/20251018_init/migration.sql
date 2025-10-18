-- CreateEnum
CREATE TYPE "MovementStageStatus" AS ENUM ('DRAFT', 'READY_FOR_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MovementAuditAction" AS ENUM ('CREATED', 'UPDATED', 'REVIEW_SUBMITTED', 'APPROVED', 'REJECTED', 'PUBLISHED', 'ARCHIVED', 'METADATA_UPDATED');

-- CreateTable
CREATE TABLE "plans" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "content" JSONB,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "microcycles" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "planId" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "name" TEXT,
    "phase" TEXT,

    CONSTRAINT "microcycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "microcycleId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "name" TEXT,
    "duration" INTEGER,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercises" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sessionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "sets" INTEGER,
    "reps" TEXT,
    "weight" TEXT,
    "notes" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_jobs" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "jobId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "requestData" JSONB NOT NULL,
    "resultData" JSONB,
    "errorData" JSONB,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,

    CONSTRAINT "plan_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rpe_feedback" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sessionId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "rpe" INTEGER NOT NULL,
    "completionRate" INTEGER NOT NULL,
    "notes" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rpe_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_metrics" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sessionId" TEXT NOT NULL,
    "totalVolume" DOUBLE PRECISION NOT NULL,
    "averageRPE" DOUBLE PRECISION NOT NULL,
    "completionRate" INTEGER NOT NULL,
    "recoveryTime" DOUBLE PRECISION NOT NULL,
    "sleepQuality" INTEGER NOT NULL,
    "stressLevel" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "performance_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adaptation_records" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "planId" TEXT NOT NULL,
    "sessionId" TEXT,
    "type" TEXT NOT NULL,
    "changes" JSONB NOT NULL,
    "rationale" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "implemented" BOOLEAN NOT NULL DEFAULT false,
    "appliedAt" TIMESTAMP(3),

    CONSTRAINT "adaptation_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movement_staging" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "classification" TEXT NOT NULL,
    "equipment" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "primaryMuscles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "secondaryMuscles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "recommendedRpe" DOUBLE PRECISION,
    "progressionIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "regressionIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "instructions" JSONB,
    "metadata" JSONB,
    "status" "MovementStageStatus" NOT NULL DEFAULT 'DRAFT',
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT NOT NULL,
    "reviewerId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "publishedMovementId" TEXT,

    CONSTRAINT "movement_staging_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movement_library" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "classification" TEXT NOT NULL,
    "equipment" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "primaryMuscles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "secondaryMuscles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "recommendedRpe" DOUBLE PRECISION,
    "progressionIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "regressionIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "instructions" JSONB,
    "metadata" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "stagingSourceId" TEXT,
    "stagingSnapshot" JSONB,
    "publishedById" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movement_library_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movement_audit_log" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" "MovementAuditAction" NOT NULL,
    "actorId" TEXT NOT NULL,
    "actorEmail" TEXT NOT NULL,
    "actorRole" TEXT,
    "movementStagingId" TEXT,
    "movementLibraryId" TEXT,
    "diff" JSONB,
    "notes" TEXT,
    "metadata" JSONB,

    CONSTRAINT "movement_audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "plan_jobs_jobId_key" ON "plan_jobs"("jobId");

-- CreateIndex
CREATE INDEX "plan_jobs_userId_idx" ON "plan_jobs"("userId");

-- CreateIndex
CREATE INDEX "plan_jobs_status_idx" ON "plan_jobs"("status");

-- CreateIndex
CREATE INDEX "plan_jobs_createdAt_idx" ON "plan_jobs"("createdAt");

-- CreateIndex
CREATE INDEX "rpe_feedback_sessionId_idx" ON "rpe_feedback"("sessionId");

-- CreateIndex
CREATE INDEX "rpe_feedback_exerciseId_idx" ON "rpe_feedback"("exerciseId");

-- CreateIndex
CREATE INDEX "rpe_feedback_timestamp_idx" ON "rpe_feedback"("timestamp");

-- CreateIndex
CREATE INDEX "performance_metrics_sessionId_idx" ON "performance_metrics"("sessionId");

-- CreateIndex
CREATE INDEX "performance_metrics_timestamp_idx" ON "performance_metrics"("timestamp");

-- CreateIndex
CREATE INDEX "adaptation_records_planId_idx" ON "adaptation_records"("planId");

-- CreateIndex
CREATE INDEX "adaptation_records_sessionId_idx" ON "adaptation_records"("sessionId");

-- CreateIndex
CREATE INDEX "adaptation_records_type_idx" ON "adaptation_records"("type");

-- CreateIndex
CREATE INDEX "adaptation_records_createdAt_idx" ON "adaptation_records"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "movement_staging_slug_key" ON "movement_staging"("slug");

-- CreateIndex
CREATE INDEX "movement_staging_status_idx" ON "movement_staging"("status");

-- CreateIndex
CREATE INDEX "movement_staging_createdById_idx" ON "movement_staging"("createdById");

-- CreateIndex
CREATE INDEX "movement_staging_reviewerId_idx" ON "movement_staging"("reviewerId");

-- CreateIndex
CREATE UNIQUE INDEX "movement_library_slug_key" ON "movement_library"("slug");

-- CreateIndex
CREATE INDEX "movement_library_classification_idx" ON "movement_library"("classification");

-- CreateIndex
CREATE INDEX "movement_library_publishedAt_idx" ON "movement_library"("publishedAt");

-- CreateIndex
CREATE INDEX "movement_audit_log_movementStagingId_idx" ON "movement_audit_log"("movementStagingId");

-- CreateIndex
CREATE INDEX "movement_audit_log_movementLibraryId_idx" ON "movement_audit_log"("movementLibraryId");

-- CreateIndex
CREATE INDEX "movement_audit_log_action_idx" ON "movement_audit_log"("action");

-- AddForeignKey
ALTER TABLE "microcycles" ADD CONSTRAINT "microcycles_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_microcycleId_fkey" FOREIGN KEY ("microcycleId") REFERENCES "microcycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movement_staging" ADD CONSTRAINT "movement_staging_publishedMovementId_fkey" FOREIGN KEY ("publishedMovementId") REFERENCES "movement_library"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movement_audit_log" ADD CONSTRAINT "movement_audit_log_movementStagingId_fkey" FOREIGN KEY ("movementStagingId") REFERENCES "movement_staging"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movement_audit_log" ADD CONSTRAINT "movement_audit_log_movementLibraryId_fkey" FOREIGN KEY ("movementLibraryId") REFERENCES "movement_library"("id") ON DELETE SET NULL ON UPDATE CASCADE;
