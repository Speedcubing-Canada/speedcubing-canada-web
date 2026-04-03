#!/usr/bin/env bash
set -euo pipefail

# Script run on VM startup.
# This is a wrapper for load_db.sh; most of the logic should be in there.
# This is not recommended for running locally, since it sets the environment
# to COMPUTE_ENGINE.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACK_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$BACK_DIR"

source env/bin/activate
source /root/.bashrc
python3 -m pip install -r requirements.txt

CURRENT_PROJECT=$(grep -oP '"project_id":\s*"\K[^"]+' service-account.json)

if [ "$CURRENT_PROJECT" = "scc-production-398617" ]; then
  ENV_TYPE="PROD"
elif [ "$CURRENT_PROJECT" = "scc-staging-391105" ]; then
  ENV_TYPE="STAGING"
else
  echo "Unknown project: $CURRENT_PROJECT. Exiting."
  exit 1
fi

echo "Detected project: $CURRENT_PROJECT, running in $ENV_TYPE mode"

SCC_ENV=COMPUTE_ENGINE ENV=$ENV_TYPE GOOGLE_CLOUD_PROJECT=$CURRENT_PROJECT WCA_HOST=https://worldcubeassociation.org GOOGLE_APPLICATION_CREDENTIALS=service-account.json ./backend/load_db/load_db.sh
