# CHANGELOG

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## Changelog Categories

- `BREAKING` for breaking changes.
- `Added` for new features.
- `Changed` for changes in existing functionality.
- `Deprecated` for soon-to-be removed features.
- `Removed` for now removed features.
- `Fixed` for any bug fixes.
- `Security` in case of vulnerabilities.

---
## [3.0.1] - 2026-03-15
### Changed
- README: Show both ESM and CJS import patterns in quick start (matching wonderful-fetch convention)
- Bump prepare-package to 2.0.7
- Fix test import for CJS compatibility

---
## [3.0.0] - 2026-03-15
### BREAKING
- Constructor option renamed from `form` to `formId` (`form` still accepted for backwards compat)
- `submit()` signature changed to `submit(formId?, data, options?)` — form ID can now be passed as first argument
- Removed legacy JSON error processing — now uses semantic HTTP responses

### Changed
- Migrated to prepare-package bundle mode (ESM, CJS, IIFE outputs)
- Simplified module to use native `fetch` and modern error handling
- Rewrote tests with comprehensive coverage (21 tests)
- Updated README with modern examples and new API docs
- Upgraded all dependencies to latest

### Removed
- Custom build tooling, `.npmignore`, and `CNAME`

### Added
- Browser support via `window.Slapform` and ESM exports
- `dist/` added to `.gitignore`, using `"files"` field in package.json instead

---
## [1.0.0] - 2024-06-19
### Added
- Initial release of the project 🚀
