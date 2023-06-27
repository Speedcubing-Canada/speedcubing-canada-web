# WCA Database Download

Downloading the WCA database uses enough memory that it's difficult to do from App Engine.  So we use a Compute Engine VM instead.

## Creating a new VM

You can create a new VM at https://console.cloud.google.com/compute/instancesAdd?project=staging-cubingusa-org.  Most of the settings can use the defaults.

* **Machine configuration**: We're currently using e2-medium.
* **Identity and API access**: Use the Compute Engine default service account.
* **Identity and API access**: Allow full access to all Cloud APIs.
* **Management**: Use the following Startup script:

```sh
apt upgrade
cd cubingusa
git pull
app/load_db/startup.sh
```

Next, SSH into the instance and follow the instructions in `vm_setup.sh`.

Finally, switch to the Instance Schedule tab, and either create a new schedule or attach it to an existing one.  The schedule should both start and stop the instance.
