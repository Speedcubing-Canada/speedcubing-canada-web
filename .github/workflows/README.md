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
    ├─────────────────────────────────┐
    ▼                                 ▼
cleanup-staging                 [manual approval]       (GitHub Environment: production)
(keep 5 newest, both services)        │
                                      ▼
                                deploy-production       (./deploy.sh -p)
                                      │
                                      ▼
                                cleanup-production
                                (keep 5 newest, both services)
```

---

## Authentication — Workload Identity Federation

The pipeline authenticates to GCP using **Workload Identity Federation (WIF)**
rather than long-lived JSON key files. GitHub Actions presents a short-lived
OIDC token; GCP verifies it and issues temporary credentials scoped to a
specific service account. No secrets are stored in GitHub.

There are four steps per GCP project: create the service account, grant it
deployment roles, create a WIF pool + provider, then allow the pool to
impersonate the service account.

### Variables used in the commands below

```bash
REPO="Speedcubing-Canada/speedcubing-canada-web"
```

---

### Staging project

```bash
PROJECT="scc-staging-391105"
SA="github-actions-staging@${PROJECT}.iam.gserviceaccount.com"
```

**1. Create the service account and grant deployment roles**

```bash
gcloud iam service-accounts create github-actions-staging \
  --display-name "GitHub Actions – Staging" \
  --project "${PROJECT}"

for role in \
  roles/appengine.deployer \
  roles/appengine.serviceAdmin \
  roles/cloudbuild.builds.editor \
  roles/storage.admin \
  roles/iam.serviceAccountUser; do
  gcloud projects add-iam-policy-binding "${PROJECT}" \
    --member="serviceAccount:${SA}" \
    --role="${role}"
done
```

> **`roles/iam.serviceAccountUser`** is required because `gcloud app deploy`
> internally submits a Cloud Build job that runs as the App Engine default
> service account; your SA must be allowed to impersonate it.

**2. Create the Workload Identity Pool and provider**

```bash
gcloud iam workload-identity-pools create "github-actions" \
  --project="${PROJECT}" \
  --location="global" \
  --display-name="GitHub Actions"

gcloud iam workload-identity-pools providers create-oidc "github" \
  --project="${PROJECT}" \
  --location="global" \
  --workload-identity-pool="github-actions" \
  --display-name="GitHub" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
  --attribute-condition="assertion.repository=='${REPO}'"
```

The `attribute-condition` locks the provider to this repository only — tokens
from any other repo are rejected by GCP before they reach the service account.

**3. Allow the pool to impersonate the staging SA**

```bash
POOL=$(gcloud iam workload-identity-pools describe "github-actions" \
  --project="${PROJECT}" \
  --location="global" \
  --format="value(name)")

gcloud iam service-accounts add-iam-policy-binding "${SA}" \
  --project="${PROJECT}" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/${POOL}/attribute.repository/${REPO}"
```

**4. Note the provider resource name** (you'll need it in step 3 below)

```bash
gcloud iam workload-identity-pools providers describe "github" \
  --project="${PROJECT}" \
  --location="global" \
  --workload-identity-pool="github-actions" \
  --format="value(name)"
# → projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-actions/providers/github
```

---

### Production project

Repeat the same four steps for the production project:

```bash
PROJECT="scc-production-398617"
SA="github-actions-prod@${PROJECT}.iam.gserviceaccount.com"

gcloud iam service-accounts create github-actions-prod \
  --display-name "GitHub Actions – Production" \
  --project "${PROJECT}"

for role in \
  roles/appengine.deployer \
  roles/appengine.serviceAdmin \
  roles/cloudbuild.builds.editor \
  roles/storage.admin \
  roles/iam.serviceAccountUser; do
  gcloud projects add-iam-policy-binding "${PROJECT}" \
    --member="serviceAccount:${SA}" \
    --role="${role}"
done

gcloud iam workload-identity-pools create "github-actions" \
  --project="${PROJECT}" \
  --location="global" \
  --display-name="GitHub Actions"

gcloud iam workload-identity-pools providers create-oidc "github" \
  --project="${PROJECT}" \
  --location="global" \
  --workload-identity-pool="github-actions" \
  --display-name="GitHub" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
  --attribute-condition="assertion.repository=='${REPO}'"

POOL=$(gcloud iam workload-identity-pools describe "github-actions" \
  --project="${PROJECT}" \
  --location="global" \
  --format="value(name)")

gcloud iam service-accounts add-iam-policy-binding "${SA}" \
  --project="${PROJECT}" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/${POOL}/attribute.repository/${REPO}"

gcloud iam workload-identity-pools providers describe "github" \
  --project="${PROJECT}" \
  --location="global" \
  --workload-identity-pool="github-actions" \
  --format="value(name)"
# → projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-actions/providers/github
```

---

## 2. Add repository variables to GitHub

Go to **Settings → Secrets and variables → Actions → Variables tab → New repository variable**
and add the following four variables. These are not secrets — WIF provider
names and service account emails are not sensitive.

| Variable name          | Value                                                               |
| ---------------------- | ------------------------------------------------------------------- |
| `WIF_PROVIDER_STAGING` | Provider resource name from the staging `describe` command above    |
| `WIF_SA_STAGING`       | `github-actions-staging@scc-staging-391105.iam.gserviceaccount.com` |
| `WIF_PROVIDER_PROD`    | Provider resource name from the production `describe` command above |
| `WIF_SA_PROD`          | `github-actions-prod@scc-production-398617.iam.gserviceaccount.com` |

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

## Version cleanup

Cleanup is automated by the pipeline: after every successful staging smoke test
and every production deploy, a cleanup job runs and deletes all but the 5 most
recent versions of each App Engine service (`default` and `api`). The job is
marked `continue-on-error` so a cleanup failure never blocks the pipeline.

**5 versions** gives you enough rollback history without significant storage
cost. If you want to adjust the number, change the `KEEP` env var in the two
cleanup jobs in `deploy.yml`.

If you ever need to clean up manually (e.g. after a failed pipeline left
orphaned versions):

```bash
# List versions for a project / service
gcloud app versions list --project scc-staging-391105 --service default
gcloud app versions list --project scc-staging-391105 --service api

# Delete a specific version
gcloud app versions delete ci-abc12345 \
  --project scc-staging-391105 --service default --quiet
gcloud app versions delete ci-abc12345 \
  --project scc-staging-391105 --service api --quiet
```

---

## Manual deploys

The `deploy.sh` script at the repo root is unchanged and can still be used
for one-off manual deployments. It requires `gcloud` to be authenticated
locally (e.g. via `gcloud auth login` or `gcloud auth application-default login`):

```bash
# Staging
./deploy.sh -s -v my-test-version

# Production
./deploy.sh -p
```
