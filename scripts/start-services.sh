#!/bin/bash
# scripts/start-services.sh

# Default port if not set in environment
REDIS_SERVICE_PORT=${REDIS_SERVICE_PORT:-3002}
SERVER_PORT=${SERVER_PORT:-3001}

echo "Starting redis-service on port $REDIS_SERVICE_PORT..."
pnpm start:redis_service &
REDIS_PID=$!

echo "Waiting for redis-service to be ready on port $REDIS_SERVICE_PORT..."
# Simple wait loop
for i in {1..30}; do
  if nc -z localhost $REDIS_SERVICE_PORT; then
    echo "Redis service is up and running!"
    break
  fi
  
  if [ $i -eq 30 ]; then
    echo "Timed out waiting for redis-service to start"
    kill $REDIS_PID
    exit 1
  fi
  
  echo "Waiting for redis-service to start... ($i/30)"
  sleep 1
done

echo "Starting server on port $SERVER_PORT..."
pnpm start:server &
SERVER_PID=$!

# Setup trap to handle script termination
trap "echo 'Shutting down services...'; kill $REDIS_PID 2>/dev/null; kill $SERVER_PID 2>/dev/null; exit" SIGINT SIGTERM

# Wait for either process to exit
wait -n
EXIT_CODE=$?

# If any process exits, shut down both
kill $REDIS_PID 2>/dev/null
kill $SERVER_PID 2>/dev/null

echo "Services stopped with exit code $EXIT_CODE"
exit $EXIT_CODE