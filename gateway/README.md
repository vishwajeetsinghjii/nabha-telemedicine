# Health Center Gateway — Nabha Telemedicine Platform

An optional local health center network proxy component providing intermittent WAN resilience for Primary Health Centers (PHC) in Nabha, Punjab.

---

## Topology

```text
               LOCAL HEALTH CENTER
                        │
                  Local Gateway (Port 8080)
                        │
             ┌──────────┴──────────┐
             ▼                     ▼
          ASHAs                Local Cache
             │                     │
             └──────────┬──────────┘
                        │
                 Intermittent WAN
                        │
                        ▼
                 Central Platform (Port 5000)
```
