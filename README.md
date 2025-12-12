# Building Inspectors — Plug-and-Play

![Build & Publish (Stable)](https://github.com/kratos0686/building-inspectors-main-repo/actions/workflows/build.yml/badge.svg)
![Build & Publish (Beta)](https://github.com/kratos0686/building-inspectors-main-repo/actions/workflows/build-beta.yml/badge.svg)
![Latest Release](https://img.shields.io/github/v/release/kratos0686/building-inspectors-releases?label=Latest%20Release&style=for-the-badge)
![Total Downloads](https://img.shields.io/github/downloads/kratos0686/building-inspectors-releases/total?label=Total%20Downloads&style=for-the-badge)

## Quick Links
[Docs → Setup](docs/SETUP.md) • [Contributing](CONTRIBUTING.md) • [Code of Conduct](CODE_OF_CONDUCT.md) • [Changelog](CHANGELOG.md)

## Overview
Plug-and-play **Electron + PWA** app with **auto-updater** and **Tester Mode (beta channel)**, BI branding, splash screen, CI workflows, and issue templates.

## Run (desktop)
```bash
cd electron
npm install
npm run start
```

## Publish
```bash
# Stable (latest.yml)
# bump version in electron/package.json to 1.2.3
git commit -am "v1.2.3"
git tag v1.2.3
git push && git push --tags

# Beta (beta.yml)
# bump version to 1.2.3-beta.1
git commit -am "v1.2.3-beta.1"
git tag v1.2.3-beta.1
git push && git push --tags
```

## Splash screen
- Images in `assets/splash/`
- `electron/splash.js` loads `splash.html` and closes before main window.
