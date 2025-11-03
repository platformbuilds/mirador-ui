# Disabled Locales

This directory contains locale files that have been disabled for MiradorStack UI.

## Files moved here:

- `zh.ts` - Chinese locale (disabled for MiradorStack)
- `es.ts` - Spanish locale (disabled for MiradorStack)

## Current active locales:

- `en.ts` - English (primary and only active locale)

## To re-enable a locale:

1. Move the locale file back to `src/locales/lang/`
2. Add the import to `src/locales/index.ts`
3. Add the locale to the `messages` object
4. Update the `Languages` array in `src/constants/data.ts`

## MiradorStack Configuration:

MiradorStack UI is currently configured to use English only to simplify the localization process and focus on core functionality.
