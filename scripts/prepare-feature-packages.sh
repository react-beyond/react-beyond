#!/bin/bash

# Define the directory containing the hocs
HOC_DIR="./hocs"

# Define the package.json and README templates
PACKAGE_TEMPLATE="./scripts/package.json.template"
README_TEMPLATE="./scripts/README.template.md"

# Iterate through the folders under "hocs"
for dir in "$HOC_DIR"/*/
do
  # Remove trailing slash and extract the folder name
  original_folder_name=$(basename "$dir")

  # Remove "deep-" prefix from the folder name
  folder_name=${original_folder_name#deep}

  # Convert folder name to lowercase
  folder_name=$(echo "$folder_name" | tr '[:upper:]' '[:lower:]')

  # Create the package name
  package_name="@react-beyond/$folder_name"

  # Create the paths for the new package.json and README.md files
  package_file_path="$dir/package.json"
  readme_file_path="$dir/README.md"

  # Copy the templates to the new locations
  cp "$PACKAGE_TEMPLATE" "$package_file_path"
  cp "$README_TEMPLATE" "$readme_file_path"

  # Replace the placeholders in the templates with the package name
  # and write the outputs to the new package.json and README.md files
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # Mac OSX
    sed -i '' "s:{{PACKAGE_NAME}}:$package_name:g" "$package_file_path"
    sed -i '' "s:{{ORIGINAL_FOLDER_NAME}}:$original_folder_name:g" "$package_file_path"
    sed -i '' "s:{{PACKAGE_NAME}}:$package_name:g" "$readme_file_path"
    sed -i '' "s:{{ORIGINAL_FOLDER_NAME}}:$original_folder_name:g" "$readme_file_path"
  else
    # GNU/Linux
    sed -i "s:{{PACKAGE_NAME}}:$package_name:g" "$package_file_path"
    sed -i "s:{{ORIGINAL_FOLDER_NAME}}:$original_folder_name:g" "$package_file_path"
    sed -i "s:{{PACKAGE_NAME}}:$package_name:g" "$readme_file_path"
    sed -i "s:{{ORIGINAL_FOLDER_NAME}}:$original_folder_name:g" "$readme_file_path"
  fi
done
