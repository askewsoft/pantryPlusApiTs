#!/bin/bash

# App Runner Migration Deployment Script
# This script deploys the PantryPlus API to AWS App Runner

set -e

# Configuration
AWS_REGION=${AWS_REGION:-us-east-1}
ECR_REPOSITORY_NAME="pantryplus-api"
APP_RUNNER_SERVICE_NAME="pantryplus-api-service"
IMAGE_TAG=${IMAGE_TAG:-latest}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # AWS CLI is required for all AWS operations - fail fast if not available
    if ! command -v aws &> /dev/null; then
        error "AWS CLI is not installed. Please install it first."
    fi
    
    # Docker is needed to build and push the container image to ECR
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install it first."
    fi
    
    log "Prerequisites check passed"
}

# Get AWS account ID
get_account_id() {
    aws sts get-caller-identity --query Account --output text
}

# Create ECR repository if it doesn't exist
create_ecr_repository() {
    log "Creating ECR repository if it doesn't exist..."
    
    local account_id=$(get_account_id)
    local repository_uri="$account_id.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY_NAME"
    
    # Check for existing repository to make script idempotent (safe to re-run)
    # ECR repository is persistent and can be reused across deployments
    if aws ecr describe-repositories --repository-names "$ECR_REPOSITORY_NAME" --region "$AWS_REGION" 2>/dev/null; then
        log "ECR repository already exists"
    else
        log "Creating ECR repository..."
        aws ecr create-repository \
            --repository-name "$ECR_REPOSITORY_NAME" \
            --region "$AWS_REGION"
    fi
    
    echo "$repository_uri"
}

# Build and push Docker image
build_and_push_image() {
    log "Building Docker image..."
    
    local repository_uri=$1
    
    # Authenticate Docker with ECR to enable pushing images
    # ECR uses temporary credentials that expire, so we need to login each time
    log "Logging in to ECR..."
    aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$repository_uri"
    
    # Build the Docker image from the current directory
    # This creates a new image with the latest code changes
    docker build -t "$ECR_REPOSITORY_NAME:$IMAGE_TAG" .
    
    # Tag the image with the ECR repository URI
    # App Runner needs the full ECR URI to pull the image
    docker tag "$ECR_REPOSITORY_NAME:$IMAGE_TAG" "$repository_uri:$IMAGE_TAG"
    
    # Push the image to ECR so App Runner can access it
    # This overwrites any existing image with the same tag
    log "Pushing image to ECR..."
    docker push "$repository_uri:$IMAGE_TAG"
    
    echo "$repository_uri:$IMAGE_TAG"
}

# Create App Runner service
create_app_runner_service() {
    log "Creating App Runner service..."
    
    local image_uri=$1
    
    # Check for existing service to make script idempotent (safe to re-run)
    # App Runner service updates require manual intervention or AWS console
    if aws apprunner describe-service --service-name "$APP_RUNNER_SERVICE_NAME" --region "$AWS_REGION" 2>/dev/null; then
        log "App Runner service already exists"
        warn "To update the service, you'll need to manually update the configuration or use the AWS console"
        return
    fi
    
    # Generate App Runner service configuration JSON
    # This includes environment variables, networking, and health check settings
    cat > app-runner-config.json << EOF
{
    "ServiceName": "$APP_RUNNER_SERVICE_NAME",
    "SourceConfiguration": {
        "ImageRepository": {
            "ImageIdentifier": "$image_uri",
            "ImageConfiguration": {
                "Port": "3000",
                "RuntimeEnvironmentVariables": {
                    "NODE_ENV": "production",
                    "APIPORT": "8080",
                    "DATABASE": "PANTRY_PLUS",
                    "DBREJECTUNAUTHORIZED": "false",
                    "LOG_LEVEL": "verbose"
                },
                "RuntimeEnvironmentSecrets": [
                    {
                        "Name": "DBPORT",
                        "Value": "/DBPORT"
                    },
                    {
                        "Name": "DBHOST",
                        "Value": "/DBHOST"
                    },
                    {
                        "Name": "DBUSER",
                        "Value": "/DBUSER"
                    },
                    {
                        "Name": "DBPASSWORD",
                        "Value": "/DBPASSWORD"
                    },
                    {
                        "Name": "DBSSL",
                        "Value": "/DBSSL"
                    }
                ]
            },
            "ImageRepositoryType": "ECR"
        },
        "AutoDeploymentsEnabled": false
    },
    "InstanceConfiguration": {
        "Cpu": "1 vCPU",
        "Memory": "2 GB",
        "InstanceRoleArn": "TODO: Replace with your App Runner instance role ARN"
    },
    "NetworkConfiguration": {
        "EgressConfiguration": {
            "EgressType": "VPC",
            "VpcConnectorArn": "TODO: Replace with your VPC connector ARN"
        }
    },
    "HealthCheckConfiguration": {
        "Protocol": "HTTP",
        "Path": "/healthcheck",
        "Interval": 5,
        "Timeout": 2,
        "HealthyThreshold": 1,
        "UnhealthyThreshold": 5
    }
}
EOF
    
    warn "Please update app-runner-config.json with your actual VPC connector ARN and instance role ARN"
    warn "Then run: aws apprunner create-service --cli-input-json file://app-runner-config.json --region $AWS_REGION"
}

# Main execution
main() {
    log "Starting App Runner deployment..."
    
    check_prerequisites
    
    local repository_uri=$(create_ecr_repository)
    local image_uri=$(build_and_push_image "$repository_uri")
    
    log "Image pushed successfully: $image_uri"
    
    create_app_runner_service "$image_uri"
    
    log "Deployment script completed successfully!"
    log "Next steps:"
    log "1. Update app-runner-config.json with your VPC connector and instance role ARNs"
    log "2. Run the App Runner service creation command"
    log "3. Configure custom domain and SSL certificate"
}

# Run main function
main "$@" 