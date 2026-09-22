# Project Audit — 10 September 2026

## Existing workspace

The repository was a single Next.js 15 / TypeScript application named `ner-logix`. It contains a dark Leaflet command console, deterministic corridor-risk engine, seeded NER districts/corridors/vehicles, localStorage offline report queue, English/Hindi/Assamese string structure, and one legacy `GET /api/risk` handler.

There was no Vite application, FastAPI service, Python ML service, PostgreSQL database, Alembic migration, JWT implementation, Docker configuration, external weather/traffic/GPS adapter, or test suite. The interface was largely client-side state; route and field-report actions did not call a backend.

## Working features found

- Leaflet/Carto map with OSM attribution, corridors, district, vehicle and incident popups.
- Explainable deterministic demo risk calculation and graph route search.
- Simulated vehicle movement and offline local report queue.
- Responsive dashboard shell and basic language framework.

## Problems discovered

- The project’s claimed architecture in `README.md` was ahead of the code: only one API endpoint existed.
- Several UTF-8 strings are mojibake in source/display output and should be normalised in a dedicated localization pass.
- `npm` cannot run directly in the local PowerShell session because script execution is disabled; `npm.cmd` works.
- `next lint` is not a supported command in modern Next 15 and must be replaced with a direct ESLint command if linting is added.

## Recommended architecture

Keep the existing Next.js app as the SIH demo console for now, with typed route handlers as its demo API boundary. A production phase should move the route handlers’ repository functions into FastAPI, replace the in-memory demo repository with SQLAlchemy/PostgreSQL/Alembic, provide a separate scikit-learn model service, and point the TypeScript client at the FastAPI base URL. This preserves the user experience while making the transport/data adapters replaceable.

## Implementation completed in this pass

- Added a clearly-labelled in-memory demo backend and catch-all documented API surface.
- Connected route optimisation and online incident submission to that API.
- Added API-backed accessibility monitoring and deterministic logistics copilot pages.
- Added documentation and transparent status tracking.
