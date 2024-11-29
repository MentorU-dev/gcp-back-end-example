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