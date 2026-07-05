#!/bin/bash
# Deploy admin panel to AWS Amplify
# Usage: ./admin/deploy.sh

set -e

APP_ID="d1tmfphqdokw2q"
BRANCH="main"
REGION="ap-south-1"

echo "📦 Building admin panel..."
cd "$(dirname "$0")"
npm run build

echo "🗜️  Zipping dist..."
cd dist
zip -r ../admin-deploy.zip . -x "*.DS_Store"
cd ..

echo "🚀 Deploying to Amplify (app: $APP_ID, branch: $BRANCH)..."
JOB_ID=$(aws amplify create-deployment \
  --app-id "$APP_ID" \
  --branch-name "$BRANCH" \
  --region "$REGION" \
  --query 'jobId' \
  --output text)

UPLOAD_URL=$(aws amplify create-deployment \
  --app-id "$APP_ID" \
  --branch-name "$BRANCH" \
  --region "$REGION" \
  --query 'zipUploadUrl' \
  --output text)

curl -T admin-deploy.zip "$UPLOAD_URL"

aws amplify start-deployment \
  --app-id "$APP_ID" \
  --branch-name "$BRANCH" \
  --job-id "$JOB_ID" \
  --region "$REGION"

echo "✅ Deployment started! Job ID: $JOB_ID"
echo "🌐 URL: https://main.${APP_ID}.amplifyapp.com"

# Cleanup
rm -f admin-deploy.zip
