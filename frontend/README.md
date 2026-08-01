# Frontend

This folder contains the React + Vite client for the credit card dispute resolution project.

## What It Does

The frontend provides:

- A complaint analysis form with fast-only and full-analysis modes.
- Model switching between BERT and the TF-IDF baseline.
- PDF, TXT, and CSV batch upload support.
- A dashboard for backend health and model stats.
- A local history panel that uses browser `localStorage`.
- A generated dispute letter that can be edited, copied, or downloaded.

## Main Files

- `src/App.jsx` - top-level tab shell and result flow.
- `src/components/DisputeForm.jsx` - complaint input and submission.
- `src/components/PDFUpload.jsx` - batch file upload and export.
- `src/components/Dashboard.jsx` - backend health and model overview.
- `src/components/DisputeLetter.jsx` - dispute letter generation.
- `src/components/HistoryPanel.jsx` - browser-local history storage and management.
- `src/lib/api.js` - backend URL helper.

## Setup

```bash
npm install
npm run dev
```

If the backend is not on the same origin, set `VITE_API_BASE_URL` before starting the app.

## Build

```bash
npm run build
```

## Notes

- This is no longer a stock Vite template.
- The UI is wired to the real backend endpoints used by the project.
- History is stored only in the browser, not in a server database.
