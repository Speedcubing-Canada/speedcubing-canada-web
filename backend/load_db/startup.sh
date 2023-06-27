# Script run on VM startup.
# This is a wrapper for load_db.sh; most of the logic should be in there.
# This is not recommended for running locally, since it sets the environment
# to COMPUTE_ENGINE.

source env/bin/activate
pip3 install -r requirements.txt

CUBINGUSA_ENV=COMPUTE_ENGINE ./app/load_db/load_db.sh
