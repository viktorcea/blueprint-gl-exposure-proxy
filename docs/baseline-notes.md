# Blueprint Baseline Notes

Date: 2026-06-05

Build: Out-of-box Blueprint baseline

## What The Baseline Does Well

- Preserves the source GL Exposures workbench shape: header actions, metric tiles, Analysis/Detail tabs, grouped rollups, detail filters, and edit mode.
- Uses real Blueprint.js React components for the app shell, controls, cards, tabs, popovers, tags, dialogs, alerts, callouts, buttons, and icons.
- Keeps unresolved exposure values as `--` and treats `0` as a confirmed numeric value in edit/display logic.
- Keeps missing class, blank exposure, unknown state, excluded, and low-confidence source rows visible and filterable.
- Lets rollup issue indicators drill into scoped Detail rows.
- Supports sortable rollup/detail tables, CSV download simulation, add/edit/exclude/delete, cancel, and save.

## Needs UX Critic Review

- Information hierarchy is still mostly Blueprint/default workbench hierarchy; the next best action may not be obvious enough.
- Issue counts are clickable, but the status icon treatment may be too compact for stakeholder review.
- Table density is credible, but scanning parent rows versus child rows may need clearer product-specific rhythm.
- Row correction affordances are plausible but split between inline edit mode and dialogs.
- Narrow viewport behavior preserves the workflow through horizontal pressure, but it should be reviewed on mobile/tablet.
- Empty, loading, and unavailable-data states are represented lightly; the critic pass should decide whether more state fixtures are needed.

## Scope Guardrails

- Synthetic/proxy content only.
- No real customer data, internal screenshots, production workflow details, or private design-system assets.
- No pack-guided redesign has been implemented yet.
