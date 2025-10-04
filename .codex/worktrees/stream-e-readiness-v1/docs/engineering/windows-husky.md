# Windows Husky Notes

On Windows, if hooks do not run after clone:

1. Set hooks path to repo: git config core.hooksPath .husky

2. Install hooks: npx --yes husky install

Troubleshooting:

- Run `npm ci` if pre-commit blocks due to missing deps.
- If you see index.lock errors, remove `.git/index.lock` and retry.
