#!/bin/bash
# scripts/start-services.sh

# Default port if not set in environment
SERVER_PORT=${SERVER_PORT:-3001}

echo "Starting server on port $SERVER_PORT..."
pnpm start:server

# No need for background processes or process management
# since we're only running one service now

echo "Server stopped with exit code $?"