# Axmos Technologies 
# Axmos Back End Example is an Open Source Project
# This file is just an example and is distributed without any warranty
# Made with love

#!/usr/bin/env bash
gcloud secrets create DB_NAME \
    --replication-policy="automatic"

echo -n "98765" | \
    gcloud secrets versions add DB_NAME --data-file=-


bq mk \
 -t \
 --expiration 3600 \
 --description "Test Login Table" \
 $DATASET.Login-test \
 email:STRING,date:DATETIME,success:BOOLEAN