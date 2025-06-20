#!/bin/bash
# Script to build Lambda deployment package with psycopg2

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BUILD_DIR="$SCRIPT_DIR/lambda_build"
OUTPUT_ZIP="$SCRIPT_DIR/lambda_backup.zip"

echo "Building Lambda deployment package..."

# Clean up previous build
rm -rf "$BUILD_DIR"
rm -f "$OUTPUT_ZIP"

# Create build directory
mkdir -p "$BUILD_DIR"

# Copy Lambda function
cp "$SCRIPT_DIR/lambda_function.py" "$BUILD_DIR/index.py"

# Install psycopg2-binary in the build directory
echo "Installing psycopg2-binary..."
pip install psycopg2-binary -t "$BUILD_DIR" --no-deps

# Create deployment package
cd "$BUILD_DIR"
zip -r "$OUTPUT_ZIP" .

echo "Lambda deployment package created: $OUTPUT_ZIP"

# Clean up
rm -rf "$BUILD_DIR"