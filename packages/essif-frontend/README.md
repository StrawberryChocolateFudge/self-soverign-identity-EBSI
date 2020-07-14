# Self-Sovereign Identity Frontend

## Requirements

You need:

- Node.js >= 12
- Yarn >= 1.22.0

## Getting started

Create a copy of `.env.example` and name it `.env`.

Install the dependencies:

```sh
yarn install
```

Start the dev server:

```sh
yarn start
```

It will open http://localhost:3000/ automatically.

Create a production build:

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

### stylelint

```sh
yarn lint:css
```

### Prettier

```sh
yarn lint:prettier
```

## Testing

```sh
yarn test
```
