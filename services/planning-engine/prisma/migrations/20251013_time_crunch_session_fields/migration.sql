-- Add Time Crunch Mode fields to sessions
ALTER TABLE "sessions"
  ADD COLUMN "is_time_crunch_active" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "time_crunch_minutes" INTEGER,
  ADD COLUMN "time_crunch_applied_at" TIMESTAMP(3),
  ADD COLUMN "compressed_plan" JSONB,
  ADD COLUMN "compression_diff" JSONB,
  ADD COLUMN "compression_summary" TEXT;
