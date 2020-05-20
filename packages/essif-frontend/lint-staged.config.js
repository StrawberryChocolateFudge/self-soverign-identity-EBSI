module.exports = {
  "*.{js,jsx}": ["eslint --fix"],
  "*.{css,scss}": ["stylelint --fix"],
  "*.{md,mdx,html,json,yml,yaml}": ["prettier --write"],
};
