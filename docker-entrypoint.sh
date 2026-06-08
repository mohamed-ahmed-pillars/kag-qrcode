#!/bin/sh
set -e

echo "→ Applying database migrations..."
bunx drizzle-kit migrate || {
  echo "✗ Migration failed. Aborting."
  exit 1
}
echo "✓ Migrations applied."

echo "→ Starting server..."
exec node server.js
