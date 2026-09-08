# MOPA IG Transition Plan

Project rename: **MOPA — Medical Oncology Prior Authorization**  
Purpose: Reframe this IG as **informative** and move substantive standards work to **DaVinci (CRD/DTR/PAS)** and **mCODE**.

## Tracking conventions

- **DaVinci proposal IDs:** `MOPA-DV-CRD-###`, `MOPA-DV-DTR-###`, `MOPA-DV-PAS-###`
- **mCODE proposal IDs:** `MOPA-MC-###`
- Proposal template for every item:
  - **Problem** (gap in current spec)
  - **Proposed solution**
  - **Examples**
  - **Target destination** (CRD/DTR/PAS or mCODE artifact)
  - **Disposition path** (Jira/Zulip/work group path)

## Phase 1 — Reframe the IG to informative

- [ ] Update `input/pagecontent/index.md` to MOPA framing and informative scope
- [ ] Update `input/pagecontent/background.md` to emphasize gap identification + upstream proposals
- [ ] Update `input/pagecontent/use-cases.md` to keep breast cancer as anchor use case
- [ ] Update `input/pagecontent/conformance.md` to remove normative/conformance-claim posture
- [ ] Replace references to OGCA naming with MOPA where applicable in narrative pages

## Phase 2 — Create proposal backlog pages

- [ ] Create `input/pagecontent/davinci-gap-proposals.md`
- [ ] Create `input/pagecontent/mcode-gap-proposals.md`
- [ ] Add both pages to `sushi-config.yaml` under `pages`
- [ ] Add both pages to `sushi-config.yaml` menu structure
- [ ] Add cross-links between breast cancer page and both proposal pages

## Phase 3 — Seed DaVinci proposal backlog (first pass)

### CRD
- [ ] `MOPA-DV-CRD-001` (define)
- [ ] `MOPA-DV-CRD-002` (define)
- [ ] `MOPA-DV-CRD-003` (define)
- [ ] `MOPA-DV-CRD-004` (define)
- [ ] `MOPA-DV-CRD-005` (define)

### DTR
- [ ] `MOPA-DV-DTR-001` (define)
- [ ] `MOPA-DV-DTR-002` (define)

### PAS
- [ ] `MOPA-DV-PAS-001` (define)
- [ ] `MOPA-DV-PAS-002` (define)
- [ ] `MOPA-DV-PAS-003` (define)

For each proposal above, include Problem/Solution/Examples and destination/disposition metadata.

## Phase 4 — Seed mCODE proposal backlog (first pass)

- [ ] `MOPA-MC-001` (define)
- [ ] `MOPA-MC-002` (define)
- [ ] `MOPA-MC-003` (define)
- [ ] `MOPA-MC-004` (define)
- [ ] `MOPA-MC-005` (define)
- [ ] `MOPA-MC-006` (define)
- [ ] `MOPA-MC-007` (define)
- [ ] `MOPA-MC-008` (define)

## Phase 5 — Consistency and publication readiness

- [ ] Ensure all proposal IDs are unique and consistently formatted
- [ ] Ensure all pages use MOPA terminology consistently
- [ ] Ensure every proposal includes at least one concrete example
- [ ] Link proposal IDs from relevant narrative sections (`breast-cancer-pa.md`, workflow pages)
- [ ] Build IG and resolve page/menu/navigation issues

## Progress notes

- [ ] Milestone A complete: Informative reframe merged
- [ ] Milestone B complete: Proposal pages added and wired in menu
- [ ] Milestone C complete: Initial DaVinci and mCODE proposal sets published
