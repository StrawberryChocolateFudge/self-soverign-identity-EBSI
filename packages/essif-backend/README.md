# Self-Sovereign Identity Frontend Backend

## Requirements

You need:

- Node.js >= 12
- Yarn >= 1.22.0

## Getting started

Create a copy of `.env.example` and name it `.env`. Set the private key correctly.

Install the dependencies:

```sh
yarn install
```

Start the server:

```sh
yarn start
```

Open http://localhost:8080/demo/essif/issue-id

You should see a message: "It works!".

The backend API is available at http://localhost:8080/demo/essif/issue-id/api

## Creating a production build

To create a production build, run:

```sh
yarn build
```

## Auditing the dependencies

Audit dependencies with:

```sh
yarn audit
```

## Linting

Lint all the files with one command:

```sh
yarn lint
```

You can also run the linters one by one:

### ESLint

```sh
yarn lint:js
```

### tsc (TypeScript)

```sh
yarn lint:ts
```

### Prettier

```sh
yarn lint:prettier
```

## Testing

All the tests:

```sh
yarn test
```

Unit tests only:

```sh
yarn test:unit
```

e2e tests only:

```sh
yarn test:e2e
```
