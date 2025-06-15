#!/bin/bash

# Load environment variables from .env file and export as Terraform variables
# Usage: source scripts/load-env.sh [environment]
# Example: source scripts/load-env.sh prod

set -e

# Default to development environment
ENV=${1:-dev}
ENV_FILE=".env"

# Check if specific environment file exists
if [ -f ".env.${ENV}" ]; then
    ENV_FILE=".env.${ENV}"
    echo "Loading environment variables from ${ENV_FILE}"
elif [ -f ".env" ]; then
    echo "Loading environment variables from .env"
else
    echo "Error: No .env file found. Please create .env or .env.${ENV}"
    return 1
fi

# Function to export environment variable as Terraform variable
export_tf_var() {
    local var_name=$1
    local var_value=$2
    
    if [ -n "$var_value" ]; then
        export "TF_VAR_${var_name}=${var_value}"
        echo "✓ TF_VAR_${var_name} set"
    else
        echo "⚠ Warning: ${var_name} is empty or not set"
    fi
}

# Set environment-specific defaults
if [ "$ENV" = "prod" ]; then
    export TF_VAR_environment="prod"
    export TF_VAR_bundle_id="${BUNDLE_ID:-small_2_0}"
    export TF_VAR_domain_name="${DOMAIN_NAME:-api.shisha.toof.jp}"
    export TF_VAR_container_image="${CONTAINER_IMAGE:-public.ecr.aws/571600847070/shisha-log:latest}"
    export TF_VAR_allowed_origins="${ALLOWED_ORIGINS:-https://shisha.toof.jp,https://www.shisha.toof.jp}"
else
    export TF_VAR_environment="dev"
    export TF_VAR_bundle_id="${BUNDLE_ID:-nano_2_0}"
    export TF_VAR_domain_name="${DOMAIN_NAME:-api-dev.shisha.toof.jp}"
    export TF_VAR_container_image="${CONTAINER_IMAGE:-public.ecr.aws/571600847070/shisha-log:dev-latest}"
    export TF_VAR_allowed_origins="${ALLOWED_ORIGINS:-http://localhost:3000,http://localhost:5173,https://dev.shisha.toof.jp}"
fi

# Set common defaults
export TF_VAR_project_name="${PROJECT_NAME:-shisha-log}"
export TF_VAR_aws_region="${AWS_REGION:-ap-northeast-1}"
export TF_VAR_availability_zone="${AVAILABILITY_ZONE:-ap-northeast-1a}"
export TF_VAR_container_registry="${CONTAINER_REGISTRY:-public.ecr.aws}"
export TF_VAR_token_duration="${TOKEN_DURATION:-24h}"

echo "✓ Environment-specific defaults set for ${ENV}"

# Load .env file and process variables
if [ -f "$ENV_FILE" ]; then
    # Read .env file line by line
    while IFS= read -r line; do
        # Skip comments and empty lines
        if [[ $line =~ ^[[:space:]]*# ]] || [[ -z $line ]]; then
            continue
        fi
        
        # Extract variable name and value
        if [[ $line =~ ^([A-Za-z_][A-Za-z0-9_]*)[[:space:]]*=[[:space:]]*(.*) ]]; then
            var_name="${BASH_REMATCH[1]}"
            var_value="${BASH_REMATCH[2]}"
            
            # Remove inline comments (everything after #)
            var_value=$(echo "$var_value" | sed 's/#.*//' | sed 's/[[:space:]]*$//')
            
            # Remove quotes if present
            var_value=$(echo "$var_value" | sed 's/^"//;s/"$//')
            
            # Export as environment variable
            export "$var_name=$var_value"
            
            # Map ALL variables to Terraform variables
            case $var_name in
                # Infrastructure variables
                PROJECT_NAME)
                    export_tf_var "project_name" "$var_value"
                    ;;
                ENVIRONMENT)
                    export_tf_var "environment" "$var_value"
                    ;;
                AWS_REGION)
                    export AWS_REGION="$var_value"
                    export_tf_var "aws_region" "$var_value"
                    echo "✓ AWS_REGION set"
                    ;;
                AVAILABILITY_ZONE)
                    export_tf_var "availability_zone" "$var_value"
                    ;;
                BUNDLE_ID)
                    export_tf_var "bundle_id" "$var_value"
                    ;;
                DOMAIN_NAME)
                    export_tf_var "domain_name" "$var_value"
                    ;;
                # Container registry
                CONTAINER_REGISTRY)
                    export_tf_var "container_registry" "$var_value"
                    ;;
                CONTAINER_IMAGE)
                    export_tf_var "container_image" "$var_value"
                    ;;
                REGISTRY_USERNAME)
                    export_tf_var "registry_username" "$var_value"
                    ;;
                REGISTRY_PASSWORD)
                    export_tf_var "registry_password" "$var_value"
                    ;;
                # Supabase configuration
                SUPABASE_URL)
                    export_tf_var "supabase_url" "$var_value"
                    ;;
                SUPABASE_ANON_KEY)
                    export_tf_var "supabase_anon_key" "$var_value"
                    ;;
                SUPABASE_SERVICE_ROLE_KEY)
                    export_tf_var "supabase_service_role_key" "$var_value"
                    ;;
                # Application configuration
                JWT_SECRET)
                    export_tf_var "jwt_secret" "$var_value"
                    ;;
                DATABASE_URL)
                    export_tf_var "database_url" "$var_value"
                    ;;
                ALLOWED_ORIGINS)
                    export_tf_var "allowed_origins" "$var_value"
                    ;;
                TOKEN_DURATION)
                    export_tf_var "token_duration" "$var_value"
                    ;;
                # AWS credentials
                AWS_ACCESS_KEY_ID)
                    export AWS_ACCESS_KEY_ID="$var_value"
                    echo "✓ AWS_ACCESS_KEY_ID set"
                    ;;
                AWS_SECRET_ACCESS_KEY)
                    export AWS_SECRET_ACCESS_KEY="$var_value"
                    echo "✓ AWS_SECRET_ACCESS_KEY set"
                    ;;
            esac
        fi
    done < "$ENV_FILE"
    
    echo ""
    echo "Environment variables loaded successfully!"
    echo "All Terraform variables are now set from ${ENV_FILE}"
else
    echo "Error: ${ENV_FILE} not found"
    return 1
fi