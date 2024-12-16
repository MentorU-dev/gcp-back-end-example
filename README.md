# Axmos Back End Example

## Project Overview

This repository provides a Node.js TypeScript backend example designed for deployment on Google Cloud Run. It serves as a foundation for startups looking to quickly establish a backend service on Google Cloud Platform. This project uses a Postgres Database and Google Identity Platform as Authentication Provider.

## Architecture

This repository is part of a set of open source projects created by Axmos to provide the startup community with a foundation to easily get started with their projects on Google Cloud.

![Axmos Startup Starter Kit Architecture](Arch%20-%20Startup%20Starter%20Kit.png)

## Local Development

### Prerequisites

*   Node.js (v16 or later)
*   npm or yarn
*   gcloud CLI
* Docker

### Installation

1. Clone the repository:

    ```bash
    git clone [repository_url]
    cd gcp-back-end-example
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Create a `.env` file in the root directory and add the following environment variables:

    ```
    PORT=8080
    DB_HOST=
    DB_PORT=5432
    DB_NAME=
    DB_USER=
    DB_PASSWORD=
    AUTH_PLATFORM_KEY=
    AUTH_PLATFORM_DOMAIN=
    PROJECT_ID=
    DATASET=
    DIFYAI_BASE_URL=
    DIFYAI_API_KEY=
    ```

    *   `PORT`: The port the server will listen on (default: 8080).
    *   `DB_HOST`: The hostname or IP address of your PostgreSQL database.
    *   `DB_PORT`: The port number of your PostgreSQL database.
    *   `DB_NAME`: The name of your PostgreSQL database.
    *   `DB_USER`: The username for your PostgreSQL database.
    *   `DB_PASSWORD`: The password for your PostgreSQL database.
    *   `AUTH_PLATFORM_KEY`: Your Google Identity Platform API key.
    *   `AUTH_PLATFORM_DOMAIN`: Your Google Identity Platform domain.
    *   `PROJECT_ID`: Your Google Cloud Project ID.
    *   `DATASET`:  Your Google Identity Platform Dataset. You can get `AUTH_PLATFORM_KEY` and `AUTH_PLATFORM_DOMAIN` from the Identity Platform section in Google Cloud Console.

### Running Locally

Start the development server:

```bash
npm run dev
```

The server should now be running on `http://localhost:8080`.

## Deployment to Google Cloud Run

This project uses Google Cloud Build for continuous integration and deployment (CI/CD) to Google Cloud Run.

### Deployment Configuration

#### Branch-Specific Environment Variables (`.env_deploy` files)

For each branch you intend to deploy (e.g., `main`, `develop`), create a corresponding `.env_deploy` file (e.g., `main.env_deploy`, `develop.env_deploy`). These files contain environment variables specific to each deployment environment:

Example `main.env_deploy`:

```
SERVICE_NAME=gcp-back-end-example
CICD_PROJECT_ID=zitein
ARTIFACT_REPOSITORY=zitein
REGION=southamerica-west1
ZONE=southamerica-west1-c
VPC_CONNECTOR=zitein-subnet-connector
```

*   `SERVICE_NAME`: The name of your Cloud Run service.
*   `CICD_PROJECT_ID`: Your Google Cloud Project ID.
*   `ARTIFACT_REPOSITORY`: The name of the Artifact Registry repository where Docker images will be stored.
*   `REGION`: The Google Cloud region where the service will be deployed.
*   `ZONE`: The Google Cloud zone within the region.
*   `VPC_CONNECTOR`:  The name of the VPC connector to use for connecting to your VPC network resources.

#### Cloud Build Configuration (`cloudbuild.yaml`)

The `cloudbuild.yaml` file defines the steps for building and deploying your application:

```yaml
# Axmos Technologies
# Axmos Back End Example is an Open Source Project
# This file is just an example and is distributed without any warranty
# Made with love

steps:
  # Build and push Docker image
  - name: 'gcr.io/cloud-builders/docker'
    script: |
      #!/usr/bin/env bash
      export $(grep -v '^#' $BRANCH_NAME.env_deploy | xargs)
      export VERSION=$(date '+%Y%m%d%H%M%S')
      export IMAGE="$REGION-docker.pkg.dev/$CICD_PROJECT_ID/$ARTIFACT_REPOSITORY/$SERVICE_NAME:$VERSION"
      echo $VERSION > /workspace/VERSION.txt
      docker build -t $IMAGE .
      docker push $IMAGE
    env:
      - 'BRANCH_NAME=$BRANCH_NAME'
      - 'PROJECT_ID=$PROJECT_ID'
  # Execute deploy.sh with image tag provided by Docker build step
  - name: 'gcr.io/cloud-builders/gcloud'
    script: |
      #!/usr/bin/env bash
      export VERSION=$(cat /workspace/VERSION.txt)
      echo $VERSION
      sh deploy.sh $VERSION
    env:
      - 'BRANCH_NAME=$BRANCH_NAME'
      - 'PROJECT_ID=$PROJECT_ID'
```

##### Cloud Build Steps Explained:

1. **Build and Push Docker Image:**
    *   This step uses the `gcr.io/cloud-builders/docker` builder.
    *   It loads environment variables from the corresponding `.env_deploy` file based on the branch being built (`$BRANCH_NAME`).
    *   It generates a unique version tag based on the current timestamp (`$VERSION`).
    *   It builds a Docker image, tags it with the generated version, and pushes it to Google Artifact Registry.
    *   It saves the version tag to a file named `VERSION.txt` for use in the next step.

2. **Execute Deployment Script (`deploy.sh`):**
    *   This step uses the `gcr.io/cloud-builders/gcloud` builder.
    *   It retrieves the version tag from `VERSION.txt`.
    *   It executes the `deploy.sh` script, passing the version tag as an argument.

#### Deployment Script (`deploy.sh`)

The `deploy.sh` script handles the deployment of the Docker image to Cloud Run:

```bash
# Axmos Technologies
# Axmos Back End Example is an Open Source Project
# This file is just an example and is distributed without any warranty
# Made with love

#!/bin/bash

export $(grep -v '^#' $BRANCH_NAME.env_deploy | xargs)
export NOW=$(date '+%Y%m%d%H%M%S')
export VERSION=$1

export SED_STRING="s/{ARTIFACT_REPOSITORY}/$ARTIFACT_REPOSITORY/g;s/{SERVICE_NAME}/$SERVICE_NAME/g;s/{REGION}/$REGION/g;s/{CICD_PROJECT_ID}/$CICD_PROJECT_ID/g;s/{VERSION}/$VERSION/g;"

echo $SED_STRING;
sed $SED_STRING deployment_template.yaml > deployment.yaml;
cat deployment.yaml

gcloud beta run services replace deployment.yaml --platform managed --region $REGION 

gcloud run services update $SERVICE_NAME --vpc-connector $VPC_CONNECTOR --region $REGION
```

##### Deploy Script Steps Explained:

1. **Load Environment Variables:**
    *   Loads environment variables from the corresponding `.env_deploy` file.
    *   Sets `NOW` to the current timestamp and `VERSION` to the provided argument.

2. **Prepare Deployment Configuration:**
    *   Creates a `SED_STRING` to replace placeholders in the `deployment_template.yaml` file with actual values from environment variables.
    *   Uses `sed` to substitute placeholders in `deployment_template.yaml` and saves the result to `deployment.yaml`.
    *   Prints the content of the generated `deployment.yaml` for debugging.

3. **Deploy to Cloud Run:**
    *   Uses `gcloud beta run services replace` to deploy or update the Cloud Run service.
        *   `--platform managed`: Specifies that Cloud Run should be fully managed.
        *   `--region $REGION`: Specifies the region for deployment.
    *   Uses `gcloud run services update` to update the service adding the VPC connector
        *   `--vpc-connector $VPC_CONNECTOR`: Specifies the VPC connector to use.
        *   `--region $REGION`: Specifies the region for deployment.

#### Cloud Run Deployment Configuration (`deployment_template.yaml`)

The `deployment_template.yaml` file defines the configuration for your Cloud Run service:

```yaml
# Axmos Technologies
# Axmos Back End Example is an Open Source Project
# This file is just an example and is distributed without any warranty
# Made with love
---
```yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: {SERVICE_NAME}
  labels:
    cloud.googleapis.com/location: {REGION}
  annotations:
    run.googleapis.com/ingress: all
spec:
  template:
    metadata:
      annotations:
        run.googleapis.com/execution-environment: gen2
        autoscaling.knative.dev/maxScale: '100'
        run.googleapis.com/startup-cpu-boost: 'true'
    spec:
      containerConcurrency: 80
      containers:
        - image: {REGION}-docker.pkg.dev/{CICD_PROJECT_ID}/{ARTIFACT_REPOSITORY}/{SERVICE_NAME}:{VERSION}
          ports:
            - containerPort: 8080
          env:
            - name: DB_PASS
              valueFrom:
                secretKeyRef:
                  key: latest
                  name: DB_PASS
            - name: DB_USER
              valueFrom:
                secretKeyRef:
                  key: latest
                  name: DB_USER
            - name: DB_HOST
              valueFrom:
                secretKeyRef:
                  key: latest
                  name: DB_HOST
            - name: DB_NAME
              valueFrom:
                secretKeyRef:
                  key: latest
                  name: DB_NAME
            - name: AUTH_PLATFORM_KEY
              valueFrom:
                secretKeyRef:
                  key: latest
                  name: AUTH_PLATFORM_KEY
            - name: AUTH_PLATFORM_DOMAIN
              valueFrom:
                secretKeyRef:
                  key: latest
                  name: AUTH_PLATFORM_DOMAIN
          resources:
            limits:
              cpu: 1000m
              memory: 512Mi
```

##### Cloud Run Deployment Configuration Explained:

*   **`apiVersion`**: Specifies the Knative Serving API version.
*   **`kind`**: Indicates that this is a Cloud Run service.
*   **`metadata.name`**:  The name of the service, which is dynamically replaced by the `deploy.sh` script.
*   **`metadata.labels`**: Labels for the service, including the deployment region.
*   **`metadata.annotations`**: Annotations for the service, such as ingress settings.
    *   `run.googleapis.com/ingress: all`: Allows all traffic to the service.
*   **`spec.template.metadata.annotations`**:
    *   `run.googleapis.com/execution-environment: gen2`: Specifies the use of the second-generation Cloud Run execution environment.
    *   `autoscaling.knative.dev/maxScale: '100'`: Sets the maximum number of instances to 100.
    *   `run.googleapis.com/startup-cpu-boost: 'true'`: Enables CPU boost during startup for faster cold starts.
*   **`spec.template.spec.containerConcurrency`**: Sets the number of concurrent requests each container instance can handle (80 in this case).
*   **`spec.template.spec.containers`**: Defines the container(s) for the service.
    *   **`image`**: The Docker image to use, dynamically replaced by the `deploy.sh` script.
    *   **`ports`**: Specifies the port the container listens on (8080).
    *   **`env`**: Environment variables for the container.
        *   Sensitive information (database credentials, API keys) is pulled from Google Secret Manager by referencing secret keys.
    *   **`resources.limits`**: Resource limits for the container (1 CPU core and 512Mi of memory).

### Setting up CI/CD with Cloud Build

1. **Enable Required APIs:**
    *   Enable the Cloud Build API, Cloud Run API, Artifact Registry API, and Secret Manager API in your Google Cloud project.
2. **Create an Artifact Registry Repository:**
    *   Create a Docker repository in Artifact Registry to store your container images.
3. **Create Secrets in Secret Manager:**
    *   Store your sensitive environment variables (database credentials, API keys) in Secret Manager. Make sure to grant the Cloud Run service account access to these secrets.
4. **Configure Cloud Build Trigger:**
    *   In the Google Cloud Console, navigate to Cloud Build and create a new trigger.
    *   Connect your repository (GitHub, Bitbucket, Cloud Source Repositories, etc.).
    *   Specify the branch(es) you want to trigger builds from (e.g., `main`, `develop`).
    *   Choose the `cloudbuild.yaml` configuration file.
    *   Add the following substitution variables:
        *   `_REGION`:  Your chosen Google Cloud region (e.g., `southamerica-west1`).
        *   `_SERVICE_NAME`: The name of your Cloud Run service (e.g., `gcp-back-end-example`).
        *   `_ARTIFACT_REPOSITORY`: The name of your Artifact Registry repository (e.g., `zitein`).
        *   `_CICD_PROJECT_ID`: Your Google Cloud Project ID (e.g., `zitein`).
        *   `_VPC_CONNECTOR`:  Your VPC connector name (e.g., `zitein-subnet-connector`).
    *   Save the trigger.

### Deploy Process

1. Push changes to your Git repository (to the branch configured in the Cloud Build trigger).
2. Cloud Build will automatically trigger a build.
3. The build steps will be executed as defined in `cloudbuild.yaml`:
    *   The Docker image will be built, tagged, and pushed to Artifact Registry.
    *   The `deploy.sh` script will deploy the new image to Cloud Run.
4. Your Cloud Run service will be updated with the new version.

## Additional Considerations

*   **Security:** Ensure that your environment variables, especially sensitive ones, are stored securely in Secret Manager. Implement appropriate authentication and authorization mechanisms for your API endpoints.
*   **Error Handling:** Implement robust error handling and logging in your application to facilitate debugging and monitoring.
*   **Testing:** Write thorough unit and integration tests to ensure the quality and reliability of your backend service.
*   **Monitoring:** Utilize Google Cloud Monitoring to track the performance and health of your Cloud Run service.
*   **Scaling:** Cloud Run automatically scales your service based on demand, but you can configure scaling parameters as needed.
*   **VPC Connector:** If you need access resources on your VPC network you need to create a VPC connector, in this case we are using to connect to the Postgres database.
*   **Domain Mapping:** If you have a custom domain, map it to your Cloud Run service for a more user-friendly URL.

This detailed README should help you get started with deploying your Node.js TypeScript backend to Google Cloud Run using Cloud Build. Let me know if you have any other questions!
```
