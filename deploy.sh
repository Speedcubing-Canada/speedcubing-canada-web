#!/usr/bin/env bash

# Arguments:
# -p: deploy to prod
# -s: deploy to staging
# -f: frontend only
# -b: backend only
# -v <app version>: On staging, the name of the app version to upload.

set -euo pipefail

PROD_PROJECT="scc-production-398617"
STAGING_PROJECT="scc-staging-391105"

PROJECT=""
IS_PROD=0
VERSION=""
FRONTEND_ONLY=0
BACKEND_ONLY=0

while getopts "psfbv:" opt; do
  case $opt in
    p)
      PROJECT="$PROD_PROJECT"
      IS_PROD=1
      ;;
    s)
      PROJECT="$STAGING_PROJECT"
      IS_PROD=0
      ;;
    f)
      FRONTEND_ONLY=1
      ;;
    b)
      BACKEND_ONLY=1
      ;;
    v)
      VERSION="$OPTARG"
      if [ "$VERSION" == "admin" ]
      then
        echo "You can't use -v admin.  Please select another version name."
        exit 1
      fi
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      exit 1
      ;;
    :)
      echo "Option -$OPTARG requires an argument." >&2
      exit 1
      ;;
  esac
done


if [ -z "$PROJECT" ]
then
  echo "Either -p (prod) or -s (staging) must be set." >&2
  exit 1
fi

if [ $FRONTEND_ONLY -eq 1 ] && [ $BACKEND_ONLY -eq 1 ]
then
  echo "Cannot set both -f (frontend only) and -b (backend only)." >&2
  exit 1
fi

if [ "$IS_PROD" == "1" -a ! -z "$VERSION" ]
then
  echo "You can't specify a version for the prod app." >&2
  exit 1
fi

if [ "$IS_PROD" == "0" -a -z "$VERSION" ]
then
  echo "You must specify a version with -v for the staging app." >&2
  exit 1
fi

if [ $BACKEND_ONLY -eq 1 ]
then
  echo "Deploying backend only."
  CMD="gcloud app deploy back/api.yaml --project $PROJECT"
  if [ ! -z "$VERSION" ]
  then
    CMD="$CMD --version $VERSION"
  fi
  echo "$CMD"
  $CMD
  exit 0
fi

echo "Recompiling react."
rm -rf app/dist
cd app
if [ "$IS_PROD" == "0" ]
then
  echo "Setting VITE_API_BASE_URL to staging."
  VITE_API_BASE_URL="https://api.staging.speedcubingcanada.org" npm run build
else
  echo "Setting VITE_API_BASE_URL to prod."
  VITE_API_BASE_URL="https://api.speedcubingcanada.org" npm run build
fi
cd ..

if [ $FRONTEND_ONLY -eq 1 ]
then
  echo "Deploying frontend only."
  CMD="gcloud app deploy app/app.yaml --project $PROJECT"
else
  echo "Deploying to App Engine."
  CMD="gcloud app deploy app/app.yaml dispatch.yaml back/api.yaml --project $PROJECT"
fi

if [ ! -z "$VERSION" ]
then
  CMD="$CMD --version $VERSION"
fi

echo "$CMD"
$CMD

if [ ! -z "$VERSION" ]
then
  URI="https://${VERSION}-dot-$PROJECT.appspot.com"
else
  URI="https://$PROJECT.appspot.com"
fi
echo "Successfully uploaded to $URI."

if [ ! -z "$VERSION" ]
then
  echo "Once you're done testing, please clean up by running:"
  echo "gcloud app versions delete $VERSION --project $PROJECT"
fi