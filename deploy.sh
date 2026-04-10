#!/bin/bash

# Build and push backend image to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ECR_URI/backend

docker build -t nagendra-backend ./backend
docker tag nagendra-backend:latest YOUR_ECR_URI/backend:latest
docker push YOUR_ECR_URI/backend:latest

# Build and push frontend image to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ECR_URI/frontend

docker build -t nagendra-frontend ./frontend
docker tag nagendra-frontend:latest YOUR_ECR_URI/frontend:latest
docker push YOUR_ECR_URI/frontend:latest