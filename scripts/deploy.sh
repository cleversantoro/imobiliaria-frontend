#!/usr/bin/env bash
set -euo pipefail

# Directory where the built Angular assets must live.
TARGET_DIR="/var/www/angular-app"

echo "==> Installing dependencies (production build uses package-lock/pnpm-lock)..."
if command -v pnpm >/dev/null 2>&1; then
  pnpm install --frozen-lockfile
else
  npm install --no-audit --no-fund
fi

echo "==> Building Angular app with production configuration..."
npm run build

BUILD_DIR="dist/angular-frontend/browser"
if [ ! -d "${BUILD_DIR}" ]; then
  echo "Build directory ${BUILD_DIR} not found. Is Angular build output path correct?" >&2
  exit 1
fi

echo "==> Deploying build artifacts to ${TARGET_DIR}..."
sudo mkdir -p "${TARGET_DIR}"
sudo rsync -ah --delete "${BUILD_DIR}/" "${TARGET_DIR}/"

echo "Deployment completed successfully."
