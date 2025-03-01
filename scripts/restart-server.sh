#!/bin/bash

echo "Stopping any running Next.js servers..."
pkill -f "node.*next"

echo "Killing any processes on port 3003..."
lsof -ti:3003 | xargs kill -9 2>/dev/null || echo "No processes found on port 3003"

echo "Starting server on port 3003..."
cd /Users/bivek/Documents/GitHub/searchbar
npm run dev -- -p 3003

echo "Server started on http://localhost:3003"
