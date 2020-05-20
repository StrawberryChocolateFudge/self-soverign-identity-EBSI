# Self-Sovereign Identity Frontend Backend

## Getting started

Create a copy of `.env.example` and name it `.env`. Set the private key correctly.

Install the dependencies:

```sh
npm install
```

Start the server:

```sh
npm start
```

Open http://localhost:8080/demo/essif/issue-id

You should see a message: "It works!".

The backend API is available at http://localhost:8080/demo/essif/issue-id/api

## Creating a production build

To create a production build, run:

```sh
npm run build
```

## Auditing the dependencies

Audit dependencies with:

```sh
npm audit
```

## Linting

Lint all the files with one command:

```sh
npm run lint
```

You can also run the linters one by one:

### ESLint

```sh
npm run lint:js
# or
npx eslint . --ext .js,.jsx
```

### tsc (TypeScript)

```sh
npm run lint:ts
```

### Prettier

```sh
npm run lint:prettier
# or
npx prettier . --check
```

## Testing

All the tests:

```sh
npm run test
```

Unit tests only:

```sh
npm run test:unit
```

e2e tests only:

```sh
npm run test:e2e
```
