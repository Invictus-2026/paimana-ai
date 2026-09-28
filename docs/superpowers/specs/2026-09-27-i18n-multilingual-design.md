# Multilingual support (English / Hindi / Tamil / Bengali)

## Goal
Make the whole frontend (all 14 pages + shell) switchable between English, Hindi,
Tamil and Bengali, and have that same language drive the backend AI copilot's
response language.

## Approach
- Add `i18next`, `react-i18next`, `i18next-browser-languagedetector`.
- `frontend/src/i18n/index.ts` initializes i18next: `fallbackLng: 'en'`,
  detection order `localStorage` → `navigator`, cached to `localStorage`.
  Imported once in `main.tsx`.
- `frontend/src/i18n/locales/{en,hi,ta,bn}.json`: one flat, namespaced
  dictionary per language (`sidebar.*`, `header.*`, `dashboard.*`, etc).
- Every hardcoded UI string across `App.tsx`, `Layout.tsx`, `Sidebar.tsx`,
  `Header.tsx`, all pages under `src/pages/`, and the intelligence components
  is replaced with `t('key')` via `useTranslation()`. Data coming from the
  database (project names, ministries, states) is never translated.
- `LanguageSwitcher.tsx` (new, rendered in `Header.tsx`): dropdown with
  English / हिन्दी / தமிழ் / বাংলা, calls `i18n.changeLanguage(code)`.
- Shared map `{en:'en-IN', hi:'hi-IN', ta:'ta-IN', bn:'bn-IN'}` used by
  `IntelligencePage` and `LiveVoice` so the copilot/voice `language` param
  follows the global switcher; the page's separate English/Hindi dropdown is
  removed.

## Backend changes
- `backend/app/api/v1/intelligence.py`: `Question.language` widened from
  `Literal['en-IN','hi-IN']` to include `'ta-IN'`, `'bn-IN'`; the
  no-provider-configured fallback sentence gets Tamil/Bengali variants
  alongside the existing Hindi one.
- `backend/app/api/v1/live.py`: same language allowlist widened for voice
  sessions.

## Error handling
- Missing translation key falls back to the `en` value (i18next
  `fallbackLng`).
- Backend rejects any language outside the four codes via existing Pydantic
  `Literal` validation (422).

## Testing
- `npm run typecheck` and `npm run build`.
- Manual: switch languages in the running dev server, confirm shell + pages
  update without reload.
- `curl` `/api/v1/intelligence/ask` with `language=ta-IN` and `bn-IN` against
  the local Ollama model.
- Existing `npm test` and backend `pytest` suites stay green.

## Known limitation
Translations are machine-quality (produced by the assistant, not a certified
translator) — solid for an internal/dev tool, but should get a native-speaker
proofread pass before anything customer-facing.
