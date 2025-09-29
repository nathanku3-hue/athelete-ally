# Prisma Engines Mirror In CI

In restricted CI environments, downloads to Prisma's default engine host can fail (e.g., DNS for binaries.prisma.sh).
To improve reliability, our CI scripts support an optional mirror via the PRISMA_ENGINES_MIRROR environment variable.

## How To Use

- Add a repository or organization secret: PRISMA_ENGINES_MIRROR
  - Example: https://cache.prisma.build (or an approved internal mirror)
- The Prisma generation wrapper (scripts/ci/prisma-generate.sh) honors the variable automatically.
- CI also caches Prisma engines (~/.cache/prisma) to reduce repeated downloads.

## Notes

- The mirror should host the same engine artifacts as the official Prisma endpoints.
- We still retry generation 3x with exponential backoff for transient issues.
- For non-runtime jobs (type-check/lint/build), prefer pre-generated clients.
