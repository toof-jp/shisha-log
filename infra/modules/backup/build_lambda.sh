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

# Install dependencies for Lambda runtime
# Using Python 3.11 and installing with all dependencies
echo "Installing dependencies for Lambda..."
pip install \
    --platform manylinux2014_x86_64 \
    --implementation cp \
    --python-version 311 \
    --only-binary=:all: \
    --upgrade \
    --target "$BUILD_DIR" \
    psycopg2-binary zstandard

# Create deployment package
cd "$BUILD_DIR"
zip -r "$OUTPUT_ZIP" .

echo "Lambda deployment package created: $OUTPUT_ZIP"

# Display package size
echo "Package size: $(du -h "$OUTPUT_ZIP" | cut -f1)"

# Clean up
rm -rf "$BUILD_DIR"