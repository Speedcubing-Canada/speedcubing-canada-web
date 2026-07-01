# Loader monitoring

## `stale-cache-alert.json`

Cloud Monitoring log-based alert policy that emails when the loader logs the
`STALE_CACHE_SKIPPED` marker. That marker is emitted by `load_db.py` when an old
`.filtered` incremental cache no longer matches the model's columns (usually a
column rename): the loader degrades to a one-time full reload instead of
crashing, but the event must not pass unnoticed.

The policy already references an email notification channel. To (re)create it in
a project:

```bash
# 1. Email notification channel (note the returned channel ID)
gcloud beta monitoring channels create \
  --display-name="SCC db-loader alerts" \
  --type=email \
  --channel-labels=email_address=aondet@speedcubingcanada.org \
  --project=scc-production-398617

# 2. Put the channel ID into notificationChannels in stale-cache-alert.json, then:
gcloud alpha monitoring policies create \
  --policy-from-file=stale-cache-alert.json \
  --project=scc-production-398617
```

`notificationRateLimit` caps alerts to one per hour so the per-table logs and the
end-of-run summary don't fan out into a burst of emails.

Verify the log filter matches where the loader's stdout actually lands before
relying on it (textPayload vs jsonPayload depends on the Ops Agent):

```bash
gcloud logging read \
  'resource.type="gce_instance" AND (textPayload:"STALE_CACHE_SKIPPED" OR jsonPayload.message:"STALE_CACHE_SKIPPED")' \
  --project=scc-production-398617 --freshness=30d --limit=5
```
