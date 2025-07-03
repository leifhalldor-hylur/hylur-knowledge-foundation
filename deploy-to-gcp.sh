#!/bin/bash

# Hylur Knowledge Foundation - Google Cloud Deployment Script
# This script automates the deployment of the application to Google Cloud

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command -v gcloud &> /dev/null; then
        print_error "gcloud CLI is not installed. Please install it first."
        exit 1
    fi
    
    if ! command -v gh &> /dev/null; then
        print_error "GitHub CLI is not installed. Please install it first."
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Get user inputs
get_user_inputs() {
    print_status "Getting deployment configuration..."
    
    # Project ID
    read -p "Enter your Google Cloud Project ID (or press Enter for 'hylur-knowledge-foundation'): " PROJECT_ID
    PROJECT_ID=${PROJECT_ID:-hylur-knowledge-foundation}
    
    # Database password
    read -s -p "Enter a secure password for the PostgreSQL database: " DB_PASSWORD
    echo
    
    # Confirm GitHub token is set
    if [ -z "$GITHUB_TOKEN" ]; then
        print_warning "GITHUB_TOKEN environment variable is not set."
        read -s -p "Enter your GitHub Personal Access Token: " GITHUB_TOKEN
        echo
        export GITHUB_TOKEN
    fi
    
    print_success "Configuration collected"
}

# Authenticate with Google Cloud
authenticate_gcloud() {
    print_status "Authenticating with Google Cloud..."
    
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
        print_status "Please authenticate with Google Cloud..."
        gcloud auth login
    fi
    
    print_success "Google Cloud authentication verified"
}

# Create or set Google Cloud project
setup_project() {
    print_status "Setting up Google Cloud project: $PROJECT_ID"
    
    # Check if project exists
    if gcloud projects describe $PROJECT_ID &>/dev/null; then
        print_warning "Project $PROJECT_ID already exists. Using existing project."
    else
        print_status "Creating new project: $PROJECT_ID"
        gcloud projects create $PROJECT_ID --name="Hylur Knowledge Foundation"
    fi
    
    gcloud config set project $PROJECT_ID
    print_success "Project $PROJECT_ID is set as active"
    
    print_warning "Please ensure billing is enabled for project $PROJECT_ID in the Google Cloud Console"
    read -p "Press Enter after enabling billing..."
}

# Enable required APIs
enable_apis() {
    print_status "Enabling required Google Cloud APIs..."
    
    gcloud services enable cloudbuild.googleapis.com
    gcloud services enable run.googleapis.com
    gcloud services enable sql-component.googleapis.com
    gcloud services enable sqladmin.googleapis.com
    gcloud services enable secretmanager.googleapis.com
    gcloud services enable containerregistry.googleapis.com
    
    print_success "APIs enabled successfully"
}

# Create Cloud SQL instance
create_database() {
    print_status "Creating Cloud SQL PostgreSQL instance..."
    
    # Check if instance already exists
    if gcloud sql instances describe hylur-postgres &>/dev/null; then
        print_warning "Cloud SQL instance 'hylur-postgres' already exists. Skipping creation."
    else
        gcloud sql instances create hylur-postgres \
            --database-version=POSTGRES_14 \
            --tier=db-f1-micro \
            --region=us-central1 \
            --storage-type=SSD \
            --storage-size=10GB \
            --authorized-networks=0.0.0.0/0
        
        print_success "Cloud SQL instance created"
    fi
    
    # Create database
    if gcloud sql databases describe hylur_db --instance=hylur-postgres &>/dev/null; then
        print_warning "Database 'hylur_db' already exists. Skipping creation."
    else
        gcloud sql databases create hylur_db --instance=hylur-postgres
        print_success "Database created"
    fi
    
    # Create user
    if gcloud sql users describe hylur_user --instance=hylur-postgres &>/dev/null; then
        print_warning "User 'hylur_user' already exists. Updating password."
        gcloud sql users set-password hylur_user --instance=hylur-postgres --password="$DB_PASSWORD"
    else
        gcloud sql users create hylur_user --instance=hylur-postgres --password="$DB_PASSWORD"
        print_success "Database user created"
    fi
    
    # Get connection name
    INSTANCE_CONNECTION_NAME=$(gcloud sql instances describe hylur-postgres --format="value(connectionName)")
    print_success "Database setup complete. Connection name: $INSTANCE_CONNECTION_NAME"
}

# Store secrets in Secret Manager
store_secrets() {
    print_status "Storing secrets in Secret Manager..."
    
    # Database URL
    DATABASE_URL="postgresql://hylur_user:$DB_PASSWORD@/hylur_db?host=/cloudsql/$INSTANCE_CONNECTION_NAME"
    
    # Create or update secrets
    if gcloud secrets describe DATABASE_URL &>/dev/null; then
        echo -n "$DATABASE_URL" | gcloud secrets versions add DATABASE_URL --data-file=-
    else
        echo -n "$DATABASE_URL" | gcloud secrets create DATABASE_URL --data-file=-
    fi
    
    # NextAuth Secret
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    if gcloud secrets describe NEXTAUTH_SECRET &>/dev/null; then
        echo -n "$NEXTAUTH_SECRET" | gcloud secrets versions add NEXTAUTH_SECRET --data-file=-
    else
        echo -n "$NEXTAUTH_SECRET" | gcloud secrets create NEXTAUTH_SECRET --data-file=-
    fi
    
    # AbacusAI API Key
    ABACUSAI_API_KEY="bf597d4ba720483199a6149f02065c67"
    if gcloud secrets describe ABACUSAI_API_KEY &>/dev/null; then
        echo -n "$ABACUSAI_API_KEY" | gcloud secrets versions add ABACUSAI_API_KEY --data-file=-
    else
        echo -n "$ABACUSAI_API_KEY" | gcloud secrets create ABACUSAI_API_KEY --data-file=-
    fi
    
    print_success "Secrets stored successfully"
}

# Create service account for GitHub Actions
create_service_account() {
    print_status "Creating service account for GitHub Actions..."
    
    # Create service account
    if gcloud iam service-accounts describe github-actions@$PROJECT_ID.iam.gserviceaccount.com &>/dev/null; then
        print_warning "Service account already exists. Skipping creation."
    else
        gcloud iam service-accounts create github-actions \
            --description="Service account for GitHub Actions" \
            --display-name="GitHub Actions"
    fi
    
    # Grant necessary roles
    gcloud projects add-iam-policy-binding $PROJECT_ID \
        --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
        --role="roles/cloudbuild.builds.editor"
    
    gcloud projects add-iam-policy-binding $PROJECT_ID \
        --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
        --role="roles/run.admin"
    
    gcloud projects add-iam-policy-binding $PROJECT_ID \
        --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
        --role="roles/storage.admin"
    
    gcloud projects add-iam-policy-binding $PROJECT_ID \
        --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
        --role="roles/secretmanager.secretAccessor"
    
    # Create service account key
    if [ -f "github-actions-key.json" ]; then
        print_warning "Service account key already exists. Removing old key."
        rm github-actions-key.json
    fi
    
    gcloud iam service-accounts keys create github-actions-key.json \
        --iam-account=github-actions@$PROJECT_ID.iam.gserviceaccount.com
    
    print_success "Service account created and key downloaded"
}

# Create GitHub repository
create_github_repo() {
    print_status "Creating GitHub repository..."
    
    # Authenticate with GitHub
    gh auth login --with-token <<< "$GITHUB_TOKEN"
    
    # Create repository
    if gh repo view hylur-knowledge-foundation &>/dev/null; then
        print_warning "GitHub repository already exists. Skipping creation."
    else
        gh repo create hylur-knowledge-foundation \
            --public \
            --description "Hylur Knowledge Foundation - Document management and AI chatbot platform" \
            --source . \
            --push
        print_success "GitHub repository created and code pushed"
    fi
    
    # Set GitHub secrets
    print_status "Setting GitHub repository secrets..."
    
    gh secret set GCP_PROJECT_ID --body "$PROJECT_ID"
    gh secret set GCP_SA_KEY --body "$(cat github-actions-key.json)"
    
    print_success "GitHub secrets configured"
}

# Deploy the application
deploy_application() {
    print_status "Deploying application to Cloud Run..."
    
    # Build and deploy
    gcloud builds submit --config cloudbuild.yaml
    
    print_success "Application deployed successfully"
}

# Set up custom domain
setup_domain() {
    print_status "Setting up custom domain mapping..."
    
    # Create domain mapping
    if gcloud run domain-mappings describe --domain=hylur.net --region=us-central1 &>/dev/null; then
        print_warning "Domain mapping already exists."
    else
        gcloud run domain-mappings create \
            --service=hylur-knowledge-foundation \
            --domain=hylur.net \
            --region=us-central1
    fi
    
    print_success "Domain mapping created"
    print_warning "Please configure your DNS provider with the following records:"
    gcloud run domain-mappings describe --domain=hylur.net --region=us-central1
}

# Main deployment function
main() {
    print_status "Starting Hylur Knowledge Foundation deployment..."
    
    check_prerequisites
    get_user_inputs
    authenticate_gcloud
    setup_project
    enable_apis
    create_database
    store_secrets
    create_service_account
    create_github_repo
    deploy_application
    setup_domain
    
    print_success "Deployment completed successfully!"
    print_status "Your application should be available at: https://hylur.net (after DNS propagation)"
    print_status "Cloud Run URL: $(gcloud run services describe hylur-knowledge-foundation --region=us-central1 --format='value(status.url)')"
    
    # Clean up sensitive files
    if [ -f "github-actions-key.json" ]; then
        rm github-actions-key.json
        print_status "Service account key file removed for security"
    fi
}

# Run the main function
main "$@"
