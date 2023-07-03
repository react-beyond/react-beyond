#!/bin/bash

# Blacklist directories
# blacklist=("deepValtio" "deepState")
blacklist=()

npx tsc

# Publish the main package
npm version prerelease --preid=beta --no-git-tag-version
npm publish

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

  # If not blacklisted, continue with the versioning and publishing
  cd "$package_dir"

  npm version prerelease --preid=beta --no-git-tag-version

  # Publish the package
  npm publish

  # Change back to the original directory
  cd -
done
