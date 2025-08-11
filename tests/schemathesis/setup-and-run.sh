#!/bin/bash

# Schemathesis Testing Setup and Execution Script
# This script sets up the conda environment and runs the tests

set -e  # Exit on any error

echo "🚀 Setting up Schemathesis testing environment..."

# Check if conda is available
if ! command -v conda &> /dev/null; then
    echo "❌ Error: conda is not installed or not in PATH"
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

# Install requirements
echo "📥 Installing Python dependencies..."
pip install -r requirements.txt

echo "✅ Dependencies installed successfully"

# Check if API is running
echo "🔍 Checking if API is accessible..."
if curl -s http://localhost:3000/v1/health > /dev/null 2>&1; then
    echo "✅ API is running and accessible"
elif curl -s http://localhost:3000/healthcheck > /dev/null 2>&1; then
    echo "✅ API is running (healthcheck endpoint accessible)"
else
    echo "⚠️  Warning: API doesn't appear to be running on localhost:3000"
    echo "   Make sure to run 'npm run dev' in another terminal first"
    echo "   Continuing anyway..."
fi

# Run the tests
echo "🧪 Running Schemathesis tests..."
echo "=================================="

# Run property-based tests
echo "Running property-based tests..."
pytest test_property_based.py -v

echo ""
echo "Running fuzzing tests..."
pytest test_fuzzing.py -v

echo ""
echo "🎉 Testing complete!"
echo ""
echo "To run tests manually in the future:"
echo "1. conda activate schemathesis"
echo "2. cd tests/schemathesis"
echo "3. Set your JWT token: export AUTH_TOKEN='your.jwt.token.here'"
echo "4. pytest test_property_based.py -v"
echo ""
echo "To deactivate the environment:"
echo "conda deactivate"
