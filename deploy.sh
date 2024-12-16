# Axmos Technologies 
# Axmos Back End Example is an Open Source Project
# This file is just an example and is distributed without any warranty
# Made with love

#!/bin/bash

export $(grep -v '^#' $BRANCH_NAME.env_deploy | xargs)
export NOW=$(date '+%Y%m%d%H%M%S')
export VERSION=$1

# Reemplazar placeholders en el archivo de plantilla
sed -e "s/{ARTIFACT_REPOSITORY}/$ARTIFACT_REPOSITORY/g" \
    -e "s/{SERVICE_NAME}/$SERVICE_NAME/g" \
    -e "s/{REGION}/$REGION/g" \
    -e "s/{CICD_PROJECT_ID}/$CICD_PROJECT_ID/g" \
    -e "s/{VERSION}/$VERSION/g" \
    -e "s/{DIFYAI_API_KEY}/$DIFYAI_API_KEY/g" \
    deployment_template.yaml > deployment.yaml

# Mostrar el contenido del archivo generado (opcional, para depuración)
cat deployment.yaml

gcloud beta run services replace deployment.yaml --platform managed --region "$REGION" 

#gcloud run services update $SERVICE_NAME --vpc-connector $VPC_CONNECTOR --region $REGION