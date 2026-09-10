# Backend tests

Two kinds live side by side:

- **Unit tests**: pure helpers with `MagicMock`. No setup, always run.
- **Route tests** (`test_routes.py`): the real Flask app against a real Cloud
  Datastore emulator, via the fixtures in `conftest.py`. They are skipped when no
  emulator is reachable, so `pytest` works with or without one.

## Running the emulator

```sh
gcloud beta emulators datastore start --project=test --host-port=localhost:8081 --no-store-on-disk
```

or, with the compose stack:

```sh
docker compose up -d datastore
```

Then, from `back/`:

```sh
pip install -r requirements.txt -r requirements-dev.txt
pytest
```

`DATASTORE_EMULATOR_HOST` defaults to `localhost:8081`.

## Adding a route test

Take the `client` fixture (unauthenticated), or `as_user` plus `make_user` to log
someone in. `make_region` / `make_province` / `make_user` seed entities; extend
them in `conftest.py` rather than writing entities inline.
