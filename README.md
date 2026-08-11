# STS-frontend

## Docker

### Build and Run Locally

To build the Docker image locally:

```bash
docker build -t sts-frontend .
```

To run the container locally on port 8080:

```bash
docker run -p 8080:8080 sts-frontend
```

### Deploying to Google Cloud Run

Google Cloud Run can automatically build your Dockerfile and deploy the container. Make sure you are authenticated and have the correct project selected.

First, login, set your Google Cloud project, and set build location:

```bash
gcloud auth login

#list out projects
gcloud projects list

# Set the active project
gcloud config set project <project_id> # sts-data-portal

```

To deploy the application, we must split it into a two-step process (Build then Deploy) to bypass strict UHN data residency constraints that block Cloud Build's default US staging buckets. We will build the image locally and push it to the Toronto Artifact Registry.

```bash
# 1. Build and push the image using your local Docker to the Toronto Artifact Registry (force amd64 with --platform to ensure compatibility with cloud run deployments. M-series Macs will default to arm64 on dockerfile builds which is not compatible with Google Cloud Run standard deployment infrastructure)
docker build --platform linux/amd64 -t northamerica-northeast2-docker.pkg.dev/sts-data-portal/cloud-run-source-deploy/sts-frontend .

docker push northamerica-northeast2-docker.pkg.dev/sts-data-portal/cloud-run-source-deploy/sts-frontend

# 2. Deploy the built image to Cloud Run
# Note: this ensures the deployment can scale down to 0 instances when not in use to save costs
gcloud run deploy sts-frontend \
  --image northamerica-northeast2-docker.pkg.dev/sts-data-portal/cloud-run-source-deploy/sts-frontend \
  --region northamerica-northeast2 \
  --allow-unauthenticated \
  --memory 4Gi \
  --cpu 2 \
  --min-instances 0 \
  --max-instances 2
```
