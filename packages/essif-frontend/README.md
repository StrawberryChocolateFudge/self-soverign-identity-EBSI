# Self-Sovereign Identity Frontend

## Getting started

Create a copy of `.env.example` and name it `.env`.

Install the dependencies:

```sh
npm install
```

Start the dev server:

```sh
npm start
```

It will open http://localhost:3000/ automatically.

Create a production build:

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

### stylelint

```sh
npm run lint:css
# or
npx stylelint "**/*.css"
```

### Prettier

```sh
npm run lint:prettier
# or
npx prettier . --check
```

## Testing

```sh
npm test
```
