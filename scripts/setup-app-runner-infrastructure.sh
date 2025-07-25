#!/bin/bash

# App Runner Infrastructure Setup Script
# This script creates the required AWS infrastructure for App Runner deployment

set -e

# Configuration
AWS_REGION=${AWS_REGION:-us-east-1}
VPC_CONNECTOR_NAME="pantryplus-vpc-connector"
APP_RUNNER_ROLE_NAME="AppRunnerECRAccessRole"
APP_RUNNER_INSTANCE_ROLE_NAME="AppRunnerInstanceRole"

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
    
    # jq is needed for JSON parsing in bash - used for extracting ARNs and IDs
    if ! command -v jq &> /dev/null; then
        error "jq is not installed. Please install it first."
    fi
    
    log "Prerequisites check passed"
}

# Get default VPC ID
get_default_vpc() {
    log "Getting default VPC..."
    # Use default VPC to avoid creating complex networking - App Runner VPC connector
    # needs to be in the same VPC as the RDS instance for connectivity
    local vpc_id=$(aws ec2 describe-vpcs \
        --filters "Name=is-default,Values=true" \
        --query 'Vpcs[0].VpcId' \
        --output text \
        --region "$AWS_REGION")
    
    if [ "$vpc_id" = "None" ] || [ -z "$vpc_id" ]; then
        error "No default VPC found in region $AWS_REGION"
    fi
    
    echo "$vpc_id"
}

# Get default subnets
get_default_subnets() {
    log "Getting default subnets..."
    local vpc_id=$1
    
    # App Runner VPC connector requires at least 2 subnets for high availability
    # Using default subnets ensures they're in different AZs automatically
    local subnets=$(aws ec2 describe-subnets \
        --filters "Name=vpc-id,Values=$vpc_id" \
        --query 'Subnets[*].SubnetId' \
        --output text \
        --region "$AWS_REGION")
    
    echo "$subnets"
}

# Create VPC Connector
create_vpc_connector() {
    log "Creating VPC Connector..."
    
    local vpc_id=$1
    local subnets=$2
    
    # App Runner VPC connector requires exactly 2 subnets for redundancy
    # Taking first two ensures we get different AZs for high availability
    local subnet_array=($subnets)
    local subnet1=${subnet_array[0]}
    local subnet2=${subnet_array[1]}
    
    if [ -z "$subnet1" ] || [ -z "$subnet2" ]; then
        error "Not enough subnets found for VPC connector"
    fi
    
    # Security group controls network access - only allow outbound MySQL traffic to RDS
    # Check for existing to make script idempotent (safe to re-run)
    local security_group_id
    if aws ec2 describe-security-groups --group-names "app-runner-vpc-connector-sg" --region "$AWS_REGION" 2>/dev/null; then
        log "Security group already exists, getting ID..."
        security_group_id=$(aws ec2 describe-security-groups \
            --group-names "app-runner-vpc-connector-sg" \
            --region "$AWS_REGION" \
            --query 'SecurityGroups[0].GroupId' \
            --output text)
    else
        log "Creating security group..."
        security_group_id=$(aws ec2 create-security-group \
            --group-name "app-runner-vpc-connector-sg" \
            --description "Security group for App Runner VPC connector" \
            --vpc-id "$vpc_id" \
            --region "$AWS_REGION" \
            --query 'GroupId' \
            --output text)
        
        # Allow outbound MySQL traffic (port 3306) to RDS instance
        # Using 0.0.0.0/0 since RDS security group will restrict access
        aws ec2 authorize-security-group-egress \
            --group-id "$security_group_id" \
            --protocol tcp \
            --port 3306 \
            --cidr 0.0.0.0/0 \
            --region "$AWS_REGION"
    fi
    
    # VPC connector enables App Runner to access private resources (RDS) in VPC
    # Check for existing to make script idempotent (safe to re-run)
    local connector_arn
    if aws apprunner describe-vpc-connector --vpc-connector-name "$VPC_CONNECTOR_NAME" --region "$AWS_REGION" 2>/dev/null; then
        log "VPC connector already exists, getting ARN..."
        connector_arn=$(aws apprunner describe-vpc-connector \
            --vpc-connector-name "$VPC_CONNECTOR_NAME" \
            --region "$AWS_REGION" \
            --query 'VpcConnector.VpcConnectorArn' \
            --output text)
    else
        log "Creating VPC connector..."
        connector_arn=$(aws apprunner create-vpc-connector \
            --vpc-connector-name "$VPC_CONNECTOR_NAME" \
            --subnets "$subnet1" "$subnet2" \
            --security-groups "$security_group_id" \
            --region "$AWS_REGION" \
            --query 'VpcConnector.VpcConnectorArn' \
            --output text)
    fi
    
    echo "$connector_arn"
}

# Create App Runner ECR access role
create_app_runner_ecr_role() {
    log "Creating App Runner ECR access role..."
    
    # Check for existing role to make script idempotent (safe to re-run)
    if aws iam get-role --role-name "$APP_RUNNER_ROLE_NAME" --region "$AWS_REGION" 2>/dev/null; then
        log "ECR access role already exists, getting ARN..."
        local role_arn=$(aws iam get-role \
            --role-name "$APP_RUNNER_ROLE_NAME" \
            --query 'Role.Arn' \
            --output text)
        echo "$role_arn"
        return
    fi
    
    # Trust policy allows App Runner build service to assume this role
    # This is required for App Runner to pull images from ECR
    cat > trust-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Service": "build.apprunner.amazonaws.com"
            },
            "Action": "sts:AssumeRole"
        }
    ]
}
EOF
    
    # Create the IAM role with the trust policy
    aws iam create-role \
        --role-name "$APP_RUNNER_ROLE_NAME" \
        --assume-role-policy-document file://trust-policy.json
    
    # Attach AWS managed policy that grants ECR read access
    # This allows App Runner to pull our Docker images from ECR
    aws iam attach-role-policy \
        --role-name "$APP_RUNNER_ROLE_NAME" \
        --policy-arn arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess
    
    # Get role ARN
    local role_arn=$(aws iam get-role \
        --role-name "$APP_RUNNER_ROLE_NAME" \
        --query 'Role.Arn' \
        --output text)
    
    echo "$role_arn"
}

# Create App Runner instance role
create_app_runner_instance_role() {
    log "Creating App Runner instance role..."
    
    # Check for existing role to make script idempotent (safe to re-run)
    if aws iam get-role --role-name "$APP_RUNNER_INSTANCE_ROLE_NAME" --region "$AWS_REGION" 2>/dev/null; then
        log "Instance role already exists, getting ARN..."
        local role_arn=$(aws iam get-role \
            --role-name "$APP_RUNNER_INSTANCE_ROLE_NAME" \
            --query 'Role.Arn' \
            --output text)
        echo "$role_arn"
        return
    fi
    
    # Trust policy allows App Runner tasks to assume this role
    # This enables the running application to access AWS services
    cat > instance-trust-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Service": "tasks.apprunner.amazonaws.com"
            },
            "Action": "sts:AssumeRole"
        }
    ]
}
EOF
    
    # Create the IAM role with the trust policy
    aws iam create-role \
        --role-name "$APP_RUNNER_INSTANCE_ROLE_NAME" \
        --assume-role-policy-document file://instance-trust-policy.json
    
    # Custom policy grants CloudWatch Logs and Parameter Store permissions
    # This allows the application to send logs and access configuration parameters
    cat > app-runner-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "ssm:GetParameter",
                "ssm:GetParameters",
                "ssm:GetParametersByPath"
            ],
            "Resource": [
                "arn:aws:ssm:*:*:parameter/DBHOST",
                "arn:aws:ssm:*:*:parameter/DBPASSWORD",
                "arn:aws:ssm:*:*:parameter/DBPORT",
                "arn:aws:ssm:*:*:parameter/DBSSL",
                "arn:aws:ssm:*:*:parameter/DBUSER"
            ]
        }
    ]
}
EOF
    
    # Attach the custom policy to the role
    aws iam put-role-policy \
        --role-name "$APP_RUNNER_INSTANCE_ROLE_NAME" \
        --policy-name "AppRunnerPolicy" \
        --policy-document file://app-runner-policy.json
    
    # Get role ARN
    local role_arn=$(aws iam get-role \
        --role-name "$APP_RUNNER_INSTANCE_ROLE_NAME" \
        --query 'Role.Arn' \
        --output text)
    
    echo "$role_arn"
}

# Clean up temporary files
cleanup() {
    rm -f trust-policy.json instance-trust-policy.json app-runner-policy.json
}

# Main execution
main() {
    log "Starting App Runner infrastructure setup..."
    
    check_prerequisites
    
    # Get VPC and subnet information
    local vpc_id=$(get_default_vpc)
    local subnets=$(get_default_subnets "$vpc_id")
    
    log "Using VPC: $vpc_id"
    log "Available subnets: $subnets"
    
    # Create VPC connector
    local vpc_connector_arn=$(create_vpc_connector "$vpc_id" "$subnets")
    log "VPC Connector created: $vpc_connector_arn"
    
    # Create IAM roles
    local ecr_role_arn=$(create_app_runner_ecr_role)
    log "ECR access role created: $ecr_role_arn"
    
    local instance_role_arn=$(create_app_runner_instance_role)
    log "Instance role created: $instance_role_arn"
    
    # Create configuration file
    cat > app-runner-infrastructure.json << EOF
{
    "vpc_connector_arn": "$vpc_connector_arn",
    "ecr_role_arn": "$ecr_role_arn",
    "instance_role_arn": "$instance_role_arn",
    "region": "$AWS_REGION"
}
EOF
    
    cleanup
    
    log "Infrastructure setup completed successfully!"
    log "Configuration saved to: app-runner-infrastructure.json"
    log ""
    log "Next steps:"
    log "1. Update your deploy script with the ARNs from app-runner-infrastructure.json"
    log "2. Run the deployment script: ./scripts/deploy-app-runner.sh"
}

# Run main function
main "$@" 