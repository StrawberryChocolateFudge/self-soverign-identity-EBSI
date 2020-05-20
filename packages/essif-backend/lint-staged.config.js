module.exports = {
  "*.{js,jsx,ts,tsx}": ["eslint --fix"],
  "*.{ts,tsx}": () => "tsc -p tsconfig.json --noEmit --incremental false",
  "*.{md,mdx,html,json,yml,yaml}": ["prettier --write"],
};
