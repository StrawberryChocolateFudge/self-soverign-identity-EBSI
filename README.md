![EBSI Logo](https://ec.europa.eu/cefdigital/wiki/images/logo/default-space-logo.svg)

# Self-Sovereign Identity

This repository contains the code of a Self-Sovereign Identity sample application. In the `packages/` folder, you will find the backend (`essif-backend/`) and the frontend (`essif-frontend/`), created as 2 distinct entities.

The backend is based on NestJS. The frontend uses Create-React-App.

In development, you can run both project separately. Refer to their own documentation for more information.

In production, the build of Create-React-App should be served from the `public/` folder, inside the backend. For convenience, you can use Docker Compose and the provided Dockerfile to automatically build and run the frontend and backend with 1 command. See the "Run with Docker Compose" section below for more information.

## Table of Contents

1. [Getting started](#Getting-started)
2. [Linting](#Linting)
3. [Auditing](#Auditing)
4. [Testing](#Testing)
5. [Run with Docker Compose](#Run-with-Docker-Compose)

## Getting started

### Requirements

You need:

- Node.js >= 12
- Yarn >= 1.22.0

### Installation

```sh
yarn install
```

## Linting

```sh
yarn lint
```

## Auditing

```sh
yarn run audit
```

## Testing

First of all, make sure to correctly configure your environment. This means 2 things:

- first, go to `packages/essif-backend`, create a copy of `.env.example` and call it `.env`. Set the variables. Make sure the private key is correctly defined.
- then, go to `packages/essif-frontend`, create a copy of `.env.example` and call it `.env`. Set the variables.

Now you can run the following command to run all the tests:

```sh
yarn test
```

You can also decide to run unit tests only with:

```sh
yarn test:unit
```

The backend also contains e2e tests that you can run with:

```sh
yarn test:e2e
```

## Run with Docker Compose

Before starting Docker Compose, create a copy of `.env.example` and name it `.env`. Set the environment variables accordingly. From now on, we'll consider that you're using the default environement variables and that you have the correct private key.

Now, run:

```sh
docker-compose up --build
```

And open http://localhost:8080/demo/essif/issue-id to see the results.

## Licensing

Copyright (c) 2019 European Commission  
Licensed under the EUPL, Version 1.2 or - as soon they will be approved by the European Commission - subsequent versions of the EUPL (the "Licence");
You may not use this work except in compliance with the Licence.
You may obtain a copy of the Licence at:

- <https://joinup.ec.europa.eu/page/eupl-text-11-12>

Unless required by applicable law or agreed to in writing, software distributed under the Licence is distributed on an "AS IS" basis, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the Licence for the specific language governing permissions and limitations under the Licence.
