set -e

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
apt install unzip python3-distutils python3-venv build-essential python3-dev libffi-dev libssl-dev python3-pip

# Set up the virtualenv.
cd back
pip3 install virtualenv
python3 -m venv env
source env/bin/activate
pip3 install --upgrade pip
pip3 install -r requirements.txt

# Set up the staging environment.
echo export SCC_ENV=COMPUTE_ENGINE >> /root/.bashrc
echo export WCA_HOST=https://staging.worldcubeassociation.org >> /root/.bashrc
echo export GOOGLE_CLOUD_PROJECT=scc-staging-391105 >> /root/.bashrc
