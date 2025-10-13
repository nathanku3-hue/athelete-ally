-- Ensure no NULL recommended RPE values remain before enforcing NOT NULL.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "movement_library" WHERE "recommended_rpe" IS NULL) THEN
    RAISE EXCEPTION 'movement_library.recommended_rpe contains NULL values; backfill before applying NOT NULL constraint';
  END IF;
END
$$;

ALTER TABLE "movement_library"
  ALTER COLUMN "recommended_rpe" SET NOT NULL;

CREATE INDEX IF NOT EXISTS "movement_staging_updated_at_idx"
  ON "movement_staging" ("updated_at");

CREATE INDEX IF NOT EXISTS "movement_library_updated_at_idx"
  ON "movement_library" ("updated_at");

CREATE INDEX IF NOT EXISTS "movement_library_slug_published_at_idx"
  ON "movement_library" ("slug", "published_at" DESC);
