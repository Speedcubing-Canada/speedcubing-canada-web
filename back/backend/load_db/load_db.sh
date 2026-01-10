#!/usr/bin/env bash
set -euo pipefail

export PYTHONPATH=$(pwd)

if [ "$SCC_ENV" != "COMPUTE_ENGINE" ]
then
  echo "Emulating datastore."
  #$(gcloud beta emulators datastore env-init)
fi

echo "Deleting old exports"
python3 backend/load_db/delete_old_exports.py \
    --export_base=exports/
echo "Done deleting old exports"

SAVED_EXPORT=$(python3 backend/load_db/get_latest_export.py)
LATEST_EXPORT=$(curl https://www.worldcubeassociation.org/export/results \
| grep TSV:.*WCA_export \
| sed -s 's/.*\(WCA_export[0-9A-Za-z_]*\).tsv.zip.*/\1/')

if [ "$SAVED_EXPORT" == "$LATEST_EXPORT" ]
then
  echo "Already have latest export $LATEST_EXPORT; returning."
fi

if [ "$SAVED_EXPORT" != "$LATEST_EXPORT" ]
then
  echo "Downloading $LATEST_EXPORT"
  URL_TO_FETCH="https://www.worldcubeassociation.org/export/results/WCA_export.tsv"
  EXPORT_DIR="exports/$LATEST_EXPORT"
  mkdir -p exports/
  rm -rf ./$EXPORT_DIR
  mkdir $EXPORT_DIR
  ZIP_FILE="$EXPORT_DIR/$LATEST_EXPORT.tsv.zip"

  curl -L $URL_TO_FETCH > $ZIP_FILE
  unzip $ZIP_FILE -d $EXPORT_DIR
  rm $ZIP_FILE

  GOOGLE_APPLICATION_CREDENTIALS=service-account.json python3 backend/load_db/load_db.py \
      --old_export_id="$SAVED_EXPORT" \
      --new_export_id="$LATEST_EXPORT" \
      --export_base=exports/
fi

/usr/sbin/shutdown -h now
