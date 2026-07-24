# Bushel & Bone — Event Library

The ~120 MVP event cards (GitHub issue #16), authored against [`docs/content-schema.md`](../../docs/content-schema.md) in the voice of [`docs/style-guide.md`](../../docs/style-guide.md). One file per family; each file is a YAML list of event objects the engine loads at runtime.

## Target distribution (~120 at MVP, per §9 weights & severity shares)

| Family | Target | Status |
|---|---|---|
| `weather` | ~15 | ✅ 16 |
| `reckoning` | ~20 | ✅ 21 |
| `opportunities` | ~18 | ✅ 20 |
| `town` | ~18 | ✅ 18 |
| `pests` | ~15 | ✅ 14 |
| `personal` | ~15 | ✅ 16 |
| `wildlife` | ~12 | ✅ 12 |

***✅ 117 of ~120 — the MVP event library is COMPLETE.*** All 7 families, all severities. Validated: every file parses (pyyaml), no duplicate IDs, all required schema fields present. Additional cards beyond this are post-launch free content (D-035).

Severity mix within each family follows §9: ~30% flavor, ~45% minor, ~20% major, ~5% crisis (crises are `crisis_gate`d).

## Batch plan
- **Batch 1 (done):** `weather.yaml`, `reckoning.yaml` — the two mechanically central families, spanning all severities and all five Reckoning tiers (~35 cards).
- **Batch 2:** `opportunities.yaml`, `town.yaml` — the market/NPC-facing family and the town/festival family.
- **Batch 3:** `pests.yaml`, `wildlife.yaml`, `personal.yaml` — the farm-hazard and clone-drama families.

Cards written as schema examples in `docs/content-schema.md` (sour-milk, vanes-wagon, she-comes-back) have their **canonical home here** and are not duplicated in the doc.

## Authoring rules (enforced by the voice guide)
- One concrete image; at most one supernatural detail; the land shows, never tells.
- Hidden axes (Reckoning, Ghost Roll) appear in `effects` but the prose renders them as *omen*, never a number.
- Cruelty stated plainly, never relished. No modern diction (see the forbidden-words list).
