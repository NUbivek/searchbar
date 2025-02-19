#!/bin/bash
NEXT_PUBLIC_BASE_PATH=/searchbar npm run build
touch out/.nojekyll
echo "Deployment files prepared successfully"
