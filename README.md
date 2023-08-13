# speedcubingcanada.org

## Running the app locally
In order to run the app locally, you will need three independant services running at the same time:
 - The frontend
 - The backend
 - The datastore emulator

The quickest way to get all three running is to use docker-compose for the frontend and backend, and the gcloud client for the datastore emulator.
Right now, the python part is commented in the docker-compose file, so you can either uncomment it or run it locally (useful if you want to use a debugger for example).
## Frontend
First option, in the project root directory, you can run:

### `docker-compose up`
Runs the app and an nginx server. The app is available at [http://localhost/](http://localhost/).

Second option:
Move into the `frontend` directory.

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:2003](http://localhost:2003) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

Currently, there are no tests.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

Currently, this step is handled automatically by an AWS build pipeline.

## Backend
As mentioned above you can either use docker-compose or run the app locally.

To run the app locally, you will need to move the `back` folder first and install the dependencies (I recommend using a virtual environment):

```shell
cd back
pip install -r requirements.txt
```

Then you can run the flask app with:
```shell
gunicorn -b :8083 backend:app
```
If you use pycharm, you can also create a flask configuration and run it from there (keep in mind the target folder is `back/backend`.

## Datastore emulator

```shell
gcloud beta emulators datastore start
```

## Deployment

To deploy run the command (make sure you built the frontend first):

```sh
gcloud app deploy frontend/app.yaml dispatch.yaml back/api.yaml 
```

You can also deploy the backend and frontend separately, but the first time make sure you either deploy everything at once or the app and then the dispatch and the api together, because the services need to be created first.
