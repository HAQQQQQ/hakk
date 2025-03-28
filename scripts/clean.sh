#!/bin/bash

echo "🧹 Cleaning node_modules, dist, and package-lock.json files..."

# Remove root node_modules and lockfile
rm -rf node_modules pnpm-lock.yaml package-lock.json

# Remove from all packages
find ./packages -type d -name "node_modules" -prune -exec rm -rf '{}' +
find ./packages -type d -name "dist" -prune -exec rm -rf '{}' +
find ./packages -type f -name "package-lock.json" -exec rm -f '{}' +

# Remove from ./types if needed
# rm -rf ./types/node_modules ./types/dist ./types/package-lock.json

echo "✅ Clean complete."
