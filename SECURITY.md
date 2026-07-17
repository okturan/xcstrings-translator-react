# Security policy

## Supported version

This repository deploys a rolling browser application rather than versioned release lines. Security fixes apply to the current `browser-api` branch and the latest deployment at <https://xcstrings-translator-react.pages.dev/>. Older commits, forks, and third-party deployments are not maintained by this project.

## Reporting a vulnerability

Please do not disclose a suspected vulnerability in a public issue, discussion, or pull request. Use GitHub's [private vulnerability reporting form](https://github.com/okturan/xcstrings-translator-react/security/advisories/new) instead.

Include the affected URL or commit, browser and operating system, reproduction steps, impact, and any suggested mitigation. Remove API keys, private localization content, and other sensitive data from screenshots, catalogs, traces, and logs before attaching them.

The maintainer will use the private advisory to confirm scope, coordinate a fix, and agree on disclosure. A report may be closed when it cannot be reproduced, is outside this repository's control, or describes the documented client-side storage model without a new exploit.

## Important trust boundary

The application has no project-owned backend. Imported catalogs are processed in the browser. When AI translation is requested, the selected source text, translation key, language pair, and optional comment are sent directly to OpenRouter.

The OpenRouter key is stored unencrypted in this origin's browser `localStorage`. A masked input is not encryption. Use a scoped or low-limit key, remove it after use, and do not enter a production credential on an untrusted device or deployment. Reports that demonstrate a new way to expose the key or imported catalog data are in scope.
