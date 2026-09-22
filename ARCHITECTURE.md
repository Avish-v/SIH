# Architecture

```text
Browser (Next.js / React console)
  ├─ Leaflet + OpenStreetMap/Carto tiles
  ├─ localStorage incident queue (offline mode)
  └─ typed fetch client → /api/*
                         └─ Next.js route handler
                              └─ demo-backend repository + explainable risk engine
                                   ├─ seeded NER graph/data
                                   └─ simulated vehicle/weather data
```

`src/lib/demo-backend.ts` is an explicit demo adapter. It uses process-memory state and must not be treated as a database, a live weather source, live GPS source, production ML model, or OSRM routing. Its boundary is intentionally suitable for replacement by FastAPI endpoints.

The route score uses rainfall proxy, slope, historical landslide exposure, flood exposure, congestion and field-incident signals. The AI endpoints expose a deterministic explanatory calculation, not a trained or validated predictive model.
