#!/usr/bin/env bash
set -euo pipefail

# Commands that should be run to set up a new Compute Engine VM.
# First, switch to root.  You'll need to set up a root password, use the one
# from the Tech Secrets doc ("Compute Engine VMs").
#
# sudo passwd
# su
#
# (in general, if you're using the VM, you'll likely want to be root).
#
# Next, clone the Speedcubing-Canada repository:
#
# cd /
# apt install git
# git clone https://github.com/Speedcubing-Canada/speedcubing-canada-web speedcubing-canada
#
# Then cd into the Speedcubing-Canada directory in the back folder and run this script (without sudo).
# Finally, run backend/load_db/startup.sh to download the WCA database and
# initialize the datastore.  The first run can take >1 hour; subsequent runs are
# faster since they only need to load entities that have changed.
#
# These commands can also be used to get a local development server working.

# Install dependencies.
apt install -y unzip python3-venv build-essential python3-dev libffi-dev libssl-dev python3-pip python3-virtualenv

PYTHON_VERSION=$(python3 -c 'import sys; print(f"{sys.version_info[0]}.{sys.version_info[1]}")')
if ! python3 -c 'import sys; sys.exit(0 if sys.version_info >= (3, 10) else 1)'; then
  echo "ERROR: python3 is $PYTHON_VERSION, but this codebase requires Python 3.10+." >&2
  echo "Recreate this VM on the debian-13 image family (see README.md)." >&2
  exit 1
fi

# Set up the virtualenv.
cd back
python3 -m venv env
source env/bin/activate
pip3 install --upgrade pip
pip3 install -r requirements.txt
mkdir -p exports

# Set up the staging environment.
git config --global pull.rebase false
