# WCA Database Download

Downloading the WCA database uses enough memory that it's difficult to do from App Engine. So we use a Compute Engine VM instead.

## Creating a new VM

You can create a new VM at https://console.cloud.google.com/compute/instancesAdd?project=<your-project>. Most of the settings can use the defaults.

- **Machine configuration**: We're currently using e2-medium.
- **Identity and API access**: Use the Compute Engine default service account.
- **Identity and API access**: Allow full access to all Cloud APIs.
- **Management**: Use the following Startup script:

```sh
apt-get update; apt-get upgrade -y
cd speedcubing-canada/back
git reset --hard HEAD
git pull
chmod +x backend/load_db/startup.sh
chmod +x backend/load_db/load_db.sh
backend/load_db/startup.sh
```

Next, SSH into the instance and follow the instructions in `vm_setup.sh`.

Download a service account private key from the Google Cloud Console IAM service accounts page (https://console.cloud.google.com/iam-admin/serviceaccounts/details/112965168706819091056/keys?project=scc-staging-391105) and save it as service-account.json in the app folder.

Finally, switch to the Instance Schedule tab, and either create a new schedule or attach it to an existing one. The schedule should both start and stop the instance.
