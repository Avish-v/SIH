# Project Status

| Feature | Status | Files | API | Frontend integration | Test result | Known limitation |
| --- | --- | --- | --- | --- | --- | --- |
| GIS map and NER corridor dashboard | 🟢 WORKING | `MapView.tsx`, `ner-data.ts` | N/A | Yes | Type-check passed | Uses seed corridor geometry, not official GIS layers |
| Route optimisation | 🟢 WORKING | `demo-backend.ts`, route page | `POST /api/routes/optimize` | Yes | API smoke test passed | Demo graph, not OSRM |
| Dynamic recalculation | 🟡 PARTIAL | `demo-backend.ts` | `POST /api/routes/recalculate` | No alert UI yet | Type-check passed | No automatic event trigger |
| Flood/landslide risk | 🟡 PARTIAL | `demo-backend.ts` | `/api/ai/*` | API only | Type-check passed | Explainable formula, not trained/validated ML |
| Vehicle tracking | 🟢 WORKING | `store.tsx`, map, backend | `/api/vehicles/live` | Map simulation | Type-check passed | Browser simulation, no hardware GPS |
| Incidents/offline queue | 🟢 WORKING | field page, `offline.ts` | `/api/incidents` | Yes | API smoke test passed | Queue sync is local-only; reports are process-memory |
| Accessibility | 🟢 WORKING | accessibility page, backend | `GET /api/accessibility/districts` | Yes | Type-check passed | Derived demo score |
| Copilot/hubs | 🟢 WORKING | copilot page, backend | `/api/copilot/query`, `/api/hubs/recommend` | Yes | API smoke test passed | Deterministic demo logic only |
| Alerts/weather | 🟡 PARTIAL | backend, console | `/api/alerts`, `/api/weather` | Alert API integrated | Type-check passed | Weather is a labelled proxy |
| Deliveries and analytics charts | 🟡 PARTIAL | existing console | No delivery API | Fleet/overview only | Build pending | No delivery persistence or Recharts |
| JWT/RBAC/PostgreSQL/Alembic/FastAPI | ⚪ NOT IMPLEMENTED | N/A | N/A | N/A | N/A | Required production phase |
| External OSRM/weather/traffic/GPS | ⚪ NOT IMPLEMENTED | `.env.example` | Adapter boundary only | N/A | N/A | No API keys/data contracts configured |

## 2026-09 verification update

The former delivery-status row is superseded by the current test-only implementation: `/api/deliveries` and `/api/deliveries/{id}/status` provide a validated, in-memory test lifecycle, while `/api/simulation/incidents` links an explicitly selected delivery to a configured corridor. The delivery page labels all records as **SIMULATION** and positions as **DEMO GPS**. An administrator-only `/api/system/health` page identifies the database, live incident feed, AI service, OSRM, and live GPS as unconfigured rather than live.

Authentication is now password-hashed and uses an eight-hour HMAC-signed HttpOnly session cookie. It remains in-memory and is not a production persistence/JWT/RBAC implementation.

## Startup

```powershell
npm.cmd install
npm.cmd run dev
```

Open `http://localhost:3000`; API is served at `http://localhost:3000/api/...`.

Demo entry is role selection on the landing page. There are no real login accounts because authentication is not implemented. Do not use the demo token outside local demonstrations.

## Verification

```powershell
npm.cmd run build
```

There is currently no unit-test runner or database setup command because a persistent backend has not yet been added.
