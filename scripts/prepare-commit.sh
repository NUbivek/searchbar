#!/bin/bash

# Script to prepare and execute a GitHub commit for the searchbar project
# Usage: ./scripts/prepare-commit.sh "Your commit message"

# Check if a commit message was provided
if [ -z "$1" ]; then
  echo "Error: Please provide a commit message."
  echo "Usage: ./scripts/prepare-commit.sh \"Your commit message\""
  exit 1
fi

COMMIT_MESSAGE="$1"

# Navigate to the project root directory
cd "$(dirname "$0")/.." || exit

# Check if there are any changes to commit
if [ -z "$(git status --porcelain)" ]; then
  echo "No changes to commit. Exiting."
  exit 0
fi

# Display the changes that will be committed
echo "The following changes will be committed:"
git status --short

# Prompt for confirmation
read -p "Do you want to proceed with the commit? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Commit aborted."
  exit 0
fi

# Add all changes
git add .

# Commit with the provided message
git commit -m "$COMMIT_MESSAGE"

# Push to the main branch
read -p "Do you want to push the changes to the main branch? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  git push origin main
  echo "Changes pushed to main branch."
else
  echo "Changes committed locally but not pushed."
fi

echo "Commit process completed."
