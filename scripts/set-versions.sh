#!/bin/bash

# Check if a version argument is provided
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <version>"
    exit 1
fi

# The desired version
VERSION=$1

# Set the version for the root package.json
if [[ "$OSTYPE" == "darwin"* ]]; then
    # For macOS
    sed "s/\"version\": \"[^\"]*\"/\"version\": \"$VERSION\"/" "package.json" > "package.json.tmp" && mv "package.json.tmp" "package.json"
else
    # For Linux
    sed -i "s/\"version\": \"[^\"]*\"/\"version\": \"$VERSION\"/" "package.json"
fi

# Blacklist directories
blacklist=()

# Define the directory containing the packages
PACKAGE_DIR="./gallery"

# Find all the package.json files in the package directory and its subdirectories
for package in $(find "$PACKAGE_DIR" -name 'package.json')
do
  # Get the directory of the package
  package_dir=$(dirname "$package")

  # Check if the current package directory is in the blacklist
  for blacklisted_dir in "${blacklist[@]}"; do
    if [[ "$package_dir" == *"$blacklisted_dir"* ]]; then
      echo "Skipping blacklisted directory $package_dir"
      continue 2
    fi
  done

  # Use sed to update the version in the package.json file
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # For macOS
    sed "s/\"version\": \"[^\"]*\"/\"version\": \"$VERSION\"/" "$package" > "$package.tmp" && mv "$package.tmp" "$package"
  else
    # For Linux
    sed -i "s/\"version\": \"[^\"]*\"/\"version\": \"$VERSION\"/" "$package"
  fi

done

echo "Version update complete."
