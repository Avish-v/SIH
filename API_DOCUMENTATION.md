# API documentation

All endpoints return `mode: "DEMO"` and a disclaimer in this release. Requests and results are JSON.

| Endpoint | Operation | Status |
| --- | --- | --- |
| `/api/dashboard/summary` | GET dashboard totals and risk summary | Working demo |
| `/api/routes/optimize` | POST `{origin,destination,...}` and return safest/fastest/balanced routes | Working demo graph |
| `/api/routes/recalculate` | POST updated factors; returns an update envelope | Working demo |
| `/api/ai/flood-risk`, `/api/ai/landslide-risk`, `/api/ai/route-risk` | POST risk calculation | Working deterministic demo |
| `/api/vehicles`, `/api/vehicles/live`, `/api/vehicles/location` | GET simulated positions / POST accepted simulated update | Working simulation |
| `/api/incidents` | GET reports / POST validated report | Working process-memory demo |
| `/api/deliveries`, `/api/deliveries/{id}/status` | GET/POST test delivery; PATCH validated lifecycle | Working in-memory simulation |
| `/api/simulation/incidents`, `/api/simulation/reset` | POST selected-route test disruption / remove test records | Admin-only simulation |
| `/api/alerts`, `/api/alerts/{id}/acknowledge` | GET active / PATCH acknowledgement | Working process-memory demo |
| `/api/health`, `/api/system/health` | GET truthful integration status | Admin-only; unconfigured services are not reported as live |
| `/api/weather` | GET rainfall proxy/weather warning | Demo weather only |
| `/api/accessibility/districts` | GET district scores | Working demo calculation |
| `/api/hubs`, `/api/hubs/recommend` | GET/POST hub ranking | Working demo calculation |
| `/api/copilot/query` | POST `{query}` structured recommendation | Working deterministic demo |
| `/api/auth/login`, `/api/auth/register`, `/api/auth/me` | Demo auth envelope | Stub — no JWT security |

Correction: the current login uses password hashing and an eight-hour HMAC-signed HttpOnly session cookie, with server-side role checks on operations and health endpoints. Users and sessions are process-memory only; this is not persistent production identity or JWT.

The delivery API is strictly in-memory simulation. A production database, actual OSRM, weather provider, persistent identity/RBAC, and FastAPI services are not implemented and must not be represented as complete.
