#!/bin/bash

# Schemathesis Testing Environment Setup Script
# This script sets up the conda environment and installs dependencies

set -e  # Exit on any error

echo "🚀 Setting up Schemathesis testing environment..."

# Check if conda is available
if ! command -v conda &> /dev/null; then
    echo "❌ Error: conda is not installed or not in PATH"
    echo "   Please install Anaconda or Miniconda first"
    exit 1
fi

# Check if schemathesis environment exists
if conda env list | grep -q "schemathesis"; then
    echo "✅ Schemathesis environment already exists"
else
    echo "📦 Creating schemathesis conda environment..."
    conda create -n schemathesis python=3.8 -y
    echo "✅ Environment created successfully"
fi

# Activate the environment
echo "🔧 Activating schemathesis environment..."
source $(conda info --base)/etc/profile.d/conda.sh
conda activate schemathesis

# Verify we're in the right environment
if [[ "$CONDA_DEFAULT_ENV" != "schemathesis" ]]; then
    echo "❌ Error: Failed to activate schemathesis environment"
    exit 1
fi

echo "✅ Activated environment: $CONDA_DEFAULT_ENV"

# Change to schemathesis directory
echo "📁 Changing to schemathesis directory..."
cd ../tests/schemathesis

# Install requirements
echo "📥 Installing Python dependencies..."
pip install -r requirements.txt

echo "✅ Dependencies installed successfully"

# Read API port from .env file
echo "🔍 Reading API configuration from .env..."
if [ ! -f "../../.env" ]; then
    echo "❌ Error: .env file not found at ../../.env"
    echo "   Please ensure the .env file exists in the repository root"
    exit 1
fi

# Source the .env file to get APIPORT
export $(grep -v '^#' ../../.env | xargs)

if [ -z "$APIPORT" ]; then
    echo "❌ Error: APIPORT not found in .env file"
    echo "   Please ensure APIPORT is defined in your .env file"
    exit 1
fi

echo "📡 Using API port: ${APIPORT}"

# Check if API is running
echo "🔍 Checking if API is accessible..."
if curl -s http://localhost:${APIPORT}/healthcheck > /dev/null 2>&1; then
    echo "✅ API is running on port ${APIPORT} (healthcheck endpoint accessible)"
else
    echo "⚠️  Warning: API doesn't appear to be running on localhost:${APIPORT}"
    echo "   Make sure to run 'npm run dev' in another terminal first"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To run tests:"
echo "1. conda activate schemathesis"
echo "2. cd tests/schemathesis"
echo "3. Set your JWT token: export AUTH_TOKEN='your.jwt.token.here'"
echo "4. pytest test_property_based.py -v"
echo ""
echo "Or use npm scripts:"
echo "  npm run test:schemathesis:quick"
echo "  npm run test:schemathesis:auth"
echo ""
echo "To deactivate the environment:"
echo "conda deactivate"
