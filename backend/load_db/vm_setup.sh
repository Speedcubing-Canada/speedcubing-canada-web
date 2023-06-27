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
# Next, clone the cubingusa repository:
#
# cd /
# apt install git
# git clone https://github.com/cubingusa/org cubingusa
#
# Then cd into the cubingusa directory and run this script (without sudo).
# Finally, run app/load_db/startup.sh to download the WCA database and
# initialize the datastore.  The first run can take >1 hour; subsequent runs are
# faster since they only need to load entities that have changed.
#
# These commands can also be used to get a local development server working.

# Install dependencies.
apt install unzip python3-distutils python3-venv build-essential python3-dev libffi-dev libssl-dev python3-pip

# Set up the virtualenv.
pip3 install virtualenv
python3 -m venv env
source env/bin/activate
pip3 install --upgrade pip
pip3 install -r requirements.txt

# Set up the production environment.
echo CUBINGUSA_ENV=COMPUTE_ENGINE | tee /etc/environment
