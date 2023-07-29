# speedcubingcanada.org

## Frontend

First, please move into the `frontend` directory.

In the project directory, you can run:

### `docker-compose up`


Runs de app and a development mysql database and an nginx server. The app is available at [http://localhost/](http://localhost/).

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

## Deployment

To deploy run the command:

```sh
gcloud app deploy frontend/app.yaml dispatch.yaml back/api.yaml 
```
