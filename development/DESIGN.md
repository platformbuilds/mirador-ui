---
title: "MiradorStack — Figma to Code Mapping"
author: "PlatformBuilds Design & Frontend Team"
date: "2025-11-05"
version: "1.0"
---

# 🎨 Figma → Code Mapping (MiradorStack Sovereign Observability UI)

This table provides a one-to-one mapping between **Figma design components** and their **corresponding React + D3.js implementations**.  
It ensures design-to-development consistency across all UI modules.

---

## 📁 Directory Structure
src/
├─ components/
│   ├─ KpiCard/
│   ├─ AnomalyChip/
│   ├─ NarrativePanel/
│   ├─ TimelineMulti/
│   ├─ CauseMatrix/
│   ├─ ServiceGraph/
│   ├─ JourneyFunnel/
│   ├─ ChatPanel/
│   ├─ GlossaryDrawer/
│   └─ Shared/
│        ├─ Modal/
│        ├─ Button/
│        ├─ Tooltip/
│        └─ Badge/
├─ pages/
│   ├─ Home/
│   ├─ Incident/
│   ├─ Explore/
│   ├─ Journeys/
│   ├─ Chat/
│   └─ Library/
├─ theme/
├─ colors.ts
├─ typography.ts
└─ tailwind.config.js
---

## 🧱 Component Mapping Table

| Figma Component | React / D3 Component | Description | Data Source / API | Notes |
|-----------------|----------------------|--------------|-------------------|-------|
| **KPI Card** | `src/components/KpiCard` | Displays KPI name, value, delta %, SLA badge, and sparkline | `/api/v1/kpi/summary` | Color tokens: `ImpactPositive`, `ImpactNegative` |
| **Anomaly Chip** | `src/components/AnomalyChip` | Inline anomaly indicator (Isolation Forest anomalies) | `/api/v1/anomalies/summary` | Tooltip shows anomaly confidence |
| **Narrative Panel** | `src/components/NarrativePanel` | Displays AI-generated RCA explanation (WHAT → WHY → HOW) | `/api/v1/rca/investigate` | Shows model + confidence badge |
| **Timeline Chart (Multi-Series)** | `src/components/TimelineMulti` | D3 chart overlaying Impact and Cause signals | `/api/v1/metrics/query` | Highlights first degrading signal |
| **Cause Matrix** | `src/components/CauseMatrix` | Categorizes causes (Infra, App, Dependency, Config) | `/api/v1/rca/investigate` | Derived from RCA JSON structure |
| **Service Dependency Graph** | `src/components/ServiceGraph` | Force-directed visualization of service dependencies | `/api/v1/rca/investigate` | Highlights suspect cause node |
| **Journey Funnel** | `src/components/JourneyFunnel` | Conversion or user journey funnel | `/api/v1/journeys/data` | Annotated with drop-offs and cause hints |
| **Chat Panel (Ask Mira)** | `src/components/ChatPanel` | RCA chatbot with streaming answers (SSE) | `/api/v1/ai/chat` | Handles tokens stream + attachments |
| **Glossary Drawer** | `src/components/GlossaryDrawer` | Definitions and meanings of telemetry signals | `/api/v1/library` | Fetched from VectorDB (signal embeddings) |
| **Feedback Widget** | `src/components/Feedback/` | Thumbs up/down + comments for AI responses | `/api/v1/rca/feedback` | Persists embeddings in VectorDB |
| **Impact→Cause Graph** | `src/components/ImpactCauseGraph` | Visual connection of business impact to technical cause | `/api/v1/rca/investigate` | Animated D3 Sankey layout |
| **Anomaly Timeline** | `src/components/AnomalyTimeline` | Global anomaly view (events bar) | `/api/v1/anomalies/stream` | SSE/WS live updates |
| **Postmortem Report View** | `src/pages/Incident/Postmortem` | Displays generated RCA report + timeline | `/api/v1/rca/report` | Markdown → PDF export |
| **Settings Drawer** | `src/pages/Settings/Drawer` | User prefs, theme, notifications | Local storage / `/api/v1/user/settings` | RBAC controlled |
| **Home Dashboard Layout** | `src/pages/Home` | Executive summary dashboard | Aggregates multiple components | Entry point for business users |

---

## 🎨 Design Tokens Mapping

| Figma Token | Tailwind / Theme Variable | Usage |
|--------------|---------------------------|--------|
| `ImpactPrimary` | `--color-impact-primary` | Business KPI highlights |
| `CausePrimary` | `--color-cause-primary` | Technical cause highlights |
| `ImpactToCauseGradient` | `bg-gradient-to-r from-impact to-cause` | Used in graph edges and headers |
| `AnomalyRed` | `--color-anomaly` | Anomaly chips and chart markers |
| `ConfidenceHigh` | `text-green-500` | High-confidence RCA explanations |
| `ConfidenceLow` | `text-yellow-500` | Low-confidence AI explanations |
| `NeutralBG` | `bg-surface-100` | Card background |
| `TextPrimary` | `text-gray-800` | Main text color |
| `FontFamilySans` | `font-sans` | UI text |
| `FontFamilyMono` | `font-mono` | Metrics/numeric displays |

---

## 🧩 Interaction Mapping

| Figma Interaction | Code Implementation | Component / File |
|-------------------|---------------------|------------------|
| Hover on Anomaly Chip → Tooltip | `<Tooltip>` with `@headlessui/react` | `AnomalyChip/Tooltip.tsx` |
| Click KPI Card → Open RCA Panel | State in `Home/index.tsx` → opens `<NarrativePanel>` | `Home/` |
| Hover Timeline → Show crosshair + tooltip | D3 event handlers | `TimelineMulti/d3Hooks.ts` |
| Chat send (Enter key) → Stream SSE | Fetch stream + append tokens | `ChatPanel/index.tsx` |
| Feedback click → POST feedback | API client hook | `Feedback/useFeedback.ts` |
| Dark/Light mode toggle | Tailwind theme context | `Settings/ThemeSwitch.tsx` |

---

## 🧠 Model Feedback & AI Integration Points

| Figma Element | AI Binding | Source |
|----------------|-------------|--------|
| Narrative Text Box | `response.explanation` | `/api/v1/rca/investigate` |
| Confidence Meter | `response.root_cause.confidence` | RCA JSON |
| Model Badge | `response.meta.model` | RCA JSON |
| Chat Stream | SSE messages | `/api/v1/ai/chat` |
| Feedback Input | POST JSON | `/api/v1/rca/feedback` |
| Glossary Tooltip | VectorDB query | `/api/v1/library` |

---

## 🧰 Developer Notes

- **D3.js Integration:** Each visualization component exports a React hook `useD3()` that binds data and handles resize.
- **Tailwind Tokens:** The design system tokens exported from Figma (`colors.json`, `typography.json`) are synced into `tailwind.config.js`.
- **Storybook:** All components mapped here will have a matching Storybook story for visual review.
- **Naming Convention:** Use `PascalCase` for components and align with Figma component names.

---

## 🔗 Figma File References

| Page | Figma URL |
|------|------------|
| Executive Overview | [Figma → Home Dashboard](https://figma.com/file/xxx/MiradorStack-Home) |
| RCA Detail View | [Figma → Incident RCA](https://figma.com/file/xxx/MiradorStack-RCA) |
| Explore / Metrics | [Figma → Signals Explorer](https://figma.com/file/xxx/MiradorStack-Explore) |
| Chat (Ask Mira) | [Figma → RCA Chat Assistant](https://figma.com/file/xxx/MiradorStack-Chat) |
| Glossary & Library | [Figma → Glossary](https://figma.com/file/xxx/MiradorStack-Glossary) |

*(Replace `xxx` with your actual Figma file IDs or workspace URLs.)*

---

## ✅ Review Checklist

- [ ] All Figma components have mapped React counterparts.
- [ ] Tokens exported and loaded in Tailwind theme.
- [ ] Storybook previews match Figma frames.
- [ ] Accessibility (color contrast, keyboard nav) verified per Figma design specs.
- [ ] Figma variables → theme variables documented in `/theme/tokens.md`.

---


