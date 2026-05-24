# Deployment Pipeline — Setup Guide

This document explains the one-time setup required before the
[`deploy.yml`](deploy.yml) workflow can run successfully.

---

## Pipeline overview

```
push to main
    │
    ▼
deploy-staging                  (./deploy.sh -s -v ci-<sha>)
    │
    ▼
smoke-test (two steps)
  ├─ frontend  GET https://staging.speedcubingcanada.org/
  │            Express serves dist/index.html → expect 2xx
  └─ api       GET https://api.staging.speedcubingcanada.org/test_rankings
    │           Flask returns hardcoded JSON (province_rankings.py, no DB/auth) → expect 2xx
    │
    ▼ (blocks here if either check fails)
[manual approval]               (GitHub Environment: production)
    │
    ▼
deploy-production               (./deploy.sh -p)
```

---

## 1. Create GCP service accounts

The pipeline uses **two separate service accounts** — one per environment — so
that a compromised staging credential cannot be used to push to production.

### Staging service account

```bash
gcloud iam service-accounts create github-actions-staging \
  --display-name "GitHub Actions – Staging" \
  --project scc-staging-391105
```

Grant the roles it needs to deploy App Engine services:

```bash
SA="github-actions-staging@scc-staging-391105.iam.gserviceaccount.com"
PROJECT="scc-staging-391105"

for role in \
  roles/appengine.deployer \
  roles/appengine.serviceAdmin \
  roles/cloudbuild.builds.editor \
  roles/storage.admin \
  roles/iam.serviceAccountUser; do
  gcloud projects add-iam-policy-binding "$PROJECT" \
    --member="serviceAccount:${SA}" \
    --role="$role"
done
```

> **`roles/iam.serviceAccountUser`** is required because `gcloud app deploy`
> internally submits a Cloud Build job that runs as the App Engine default
> service account; your SA must be allowed to impersonate it.

Generate and download the JSON key:

```bash
gcloud iam service-accounts keys create staging-sa-key.json \
  --iam-account "$SA" \
  --project "$PROJECT"
```

### Production service account

Repeat the same steps for the production project, substituting
`scc-production-398617`:

```bash
gcloud iam service-accounts create github-actions-prod \
  --display-name "GitHub Actions – Production" \
  --project scc-production-398617

SA="github-actions-prod@scc-production-398617.iam.gserviceaccount.com"
PROJECT="scc-production-398617"

for role in \
  roles/appengine.deployer \
  roles/appengine.serviceAdmin \
  roles/cloudbuild.builds.editor \
  roles/storage.admin \
  roles/iam.serviceAccountUser; do
  gcloud projects add-iam-policy-binding "$PROJECT" \
    --member="serviceAccount:${SA}" \
    --role="$role"
done

gcloud iam service-accounts keys create prod-sa-key.json \
  --iam-account "$SA" \
  --project "$PROJECT"
```

---

## 2. Add secrets to the GitHub repository

Go to **Settings → Secrets and variables → Actions → New repository secret**
and add the following two secrets.

| Secret name          | Value                                  |
| -------------------- | -------------------------------------- |
| `GCP_SA_KEY_STAGING` | Full contents of `staging-sa-key.json` |
| `GCP_SA_KEY_PROD`    | Full contents of `prod-sa-key.json`    |

Delete the local key files after uploading:

```bash
rm staging-sa-key.json prod-sa-key.json
```

---

## 3. Create the `production` environment with required reviewers

The `deploy-production` job references `environment: production`. GitHub will
pause that job and send a review request to the configured reviewers.

1. Go to **Settings → Environments → New environment**.
2. Name it exactly **`production`** (case-sensitive).
3. Under **Deployment protection rules**, enable **Required reviewers** and add
   at least one GitHub user or team.
4. Optionally enable **Deployment branches** → **Selected branches** → add
   `main` to prevent accidental production deploys from feature branches.
5. Save the environment.

When a push to `main` reaches the production job, reviewers will receive a
GitHub notification and can approve or reject from the Actions run page.

---

## Staging version cleanup

Each CI run deploys a uniquely versioned staging version
(`ci-<8-char-sha>`). Old versions accumulate and incur small storage costs.
Clean them up periodically:

```bash
# List all staging versions
gcloud app versions list --project scc-staging-391105

# Delete a specific version (frontend + API service)
gcloud app versions delete ci-abc12345 \
  --project scc-staging-391105 \
  --service default

gcloud app versions delete ci-abc12345 \
  --project scc-staging-391105 \
  --service api
```

---

## Optional: Workload Identity Federation (passwordless auth)

The workflow above uses long-lived JSON key files. For higher security,
[Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation)
lets GitHub Actions authenticate without any stored credentials. If you migrate
to WIF, replace the `credentials_json` input in `deploy.yml` with
`workload_identity_provider` and `service_account` parameters as described in
the [`google-github-actions/auth` README](https://github.com/google-github-actions/auth).
