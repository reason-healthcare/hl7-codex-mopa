#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# MOPA Reference Application — Demonstration Walkthrough
#
# An interactive, narrated script that walks through the full MOPA workflow:
#   - Starting services and loading fixtures
#   - Path 1: Approvable (all data present, order-select info → sign → PA not required)
#   - Path 2: DTR Required (HER2 missing → collect → Authorization Satisfied)
#   - Path 4: Biosimilar Substitution (payer modifies ordered regimen)
#
# Usage:
#   bash fixtures/demo-walkthrough.sh           # full walkthrough
#   bash fixtures/demo-walkthrough.sh --quick    # skip setup, assume services running
#
# Prerequisites: Node.js ≥ 20, pnpm ≥ 10, Docker
# ═══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

FHIR_BASE="${FHIR_BASE_URL:-http://localhost:8080/fhir}"
EHR_URL="http://localhost:4001"
HUB_URL="http://localhost:4000"
CRD_URL="http://localhost:4003"
DTR_URL="http://localhost:4004"
PAS_URL="http://localhost:4005"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
QUICK=false

if [[ "${1:-}" == "--quick" ]]; then
  QUICK=true
fi

# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

BOLD='\033[1m'
DIM='\033[2m'
GREEN='\033[32m'
BLUE='\033[34m'
YELLOW='\033[33m'
CYAN='\033[36m'
RESET='\033[0m'

step() {
  echo ""
  echo -e "${CYAN}═══════════════════════════════════════════════════════════════${RESET}"
  echo -e "${BOLD}  Step $1: $2${RESET}"
  echo -e "${CYAN}═══════════════════════════════════════════════════════════════${RESET}"
}

narrate() {
  echo -e "${DIM}  ┃ $1${RESET}"
}

action() {
  echo -e "${GREEN}  ▸ $1${RESET}"
}

prompt() {
  echo ""
  echo -e "${YELLOW}  ⏸  Press ENTER to continue...${RESET}"
  read -r
}

check_url() {
  local url="$1"
  local label="$2"
  if curl -sf "$url" > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓${RESET} $label — $url"
    return 0
  else
    echo -e "  ${YELLOW}✗${RESET} $label — $url (not responding)"
    return 1
  fi
}

# ─────────────────────────────────────────────────────────────────────────────
# Header
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo -e "${BOLD}╔═══════════════════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}║   MOPA Reference Application — Demonstration Walkthrough      ║${RESET}"
echo -e "${BOLD}║   Medical Oncology Prior Authorization                       ║${RESET}"
echo -e "${BOLD}╚═══════════════════════════════════════════════════════════════╝${RESET}"
echo ""
echo -e "${DIM}  This walkthrough demonstrates the two-stage CDS Hooks workflow:${RESET}"
echo -e "${DIM}  order-select (informational) → order-sign (binding determination).${RESET}"
echo -e "${DIM}  FHIR query-back via fhirAuthorization (no custom extension needed).${RESET}"
echo ""
echo -e "${DIM}  Four demo patients are available:${RESET}"
echo -e "${DIM}    Jane Smith   — ECOG 0, HER2+  → Approvable → PA not required${RESET}"
echo -e "${DIM}    Maria Garcia — ECOG 1, HER2+  → Approvable → PA required${RESET}"
echo -e "${DIM}    Sandra Chen  — ECOG 1, HER2✗  → DTR Required → Approvable${RESET}"
echo -e "${DIM}    Diane Roe    — ECOG 0, HER2+  → Approvable + biosimilar substitution${RESET}"

# ─────────────────────────────────────────────────────────────────────────────
# Step 0: Setup (skipped in --quick mode)
# ─────────────────────────────────────────────────────────────────────────────

if [[ "$QUICK" == false ]]; then
  step "0" "Start HAPI FHIR and load fixtures"

  narrate "Starting HAPI FHIR R4 server via Docker..."
  action "docker compose up hapi -d"
  docker compose up hapi -d 2>/dev/null || true
  prompt

  narrate "Waiting for HAPI to be ready..."
  echo -n "  "
  MAX_WAIT=90; WAITED=0
  until curl -sf "$FHIR_BASE/metadata" > /dev/null 2>&1; do
    [ "$WAITED" -ge "$MAX_WAIT" ] && echo "" && echo "ERROR: HAPI not ready after ${MAX_WAIT}s" && exit 1
    echo -n "."; sleep 2; WAITED=$((WAITED + 2))
  done
  echo " ready!"
  prompt

  narrate "Loading demo patient fixtures (Jane Smith, Maria Garcia, Sandra Chen, Diane Roe)..."
  action "bash fixtures/load-fixtures.sh"
  bash "$SCRIPT_DIR/load-fixtures.sh" "$FHIR_BASE"
  prompt

  narrate "Starting all MOPA applications (Turborepo dev mode)..."
  narrate "In a separate terminal, run: cd reference-app && pnpm dev"
  narrate "Or press ENTER after starting it yourself..."
  action "pnpm dev  (run in separate terminal)"
  prompt
fi

# ─────────────────────────────────────────────────────────────────────────────
# Step 1: Verify all services are running
# ─────────────────────────────────────────────────────────────────────────────

step "1" "Verify all services are running"

narrate "Checking service health..."
check_url "$HUB_URL" "Hub (port 4000)"
check_url "$EHR_URL" "EHR (port 4001)"
check_url "$CRD_URL/api/cds-services" "CRD Service (port 4003)"
check_url "$DTR_URL" "DTR Client (port 4004)"
prompt

# ─────────────────────────────────────────────────────────────────────────────
# Step 2: Inspect CRD discovery — standard CDS Hooks
# ─────────────────────────────────────────────────────────────────────────────

step "2" "Inspect CRD discovery — standard CDS Hooks"

narrate "The CRD service advertises two standard CDS Hooks services:"
narrate "  • order-select  — informational: checks approvability before signing"
narrate "  • order-sign    — binding: final determination of PA requirement"
narrate "No custom extension, no prefetch templates — CRD uses fhirAuthorization."
echo ""
action "curl -s $CRD_URL/api/cds-services | python3 -m json.tool"
echo ""
curl -sf "$CRD_URL/api/cds-services" | python3 -m json.tool 2>/dev/null || echo "  (could not reach CRD service)"
prompt

# ─────────────────────────────────────────────────────────────────────────────
# Step 3: Path 1 — Approvable, PA not required (Jane Smith)
# ─────────────────────────────────────────────────────────────────────────────

step "3" "Path 1 — Approvable, PA not required (Jane Smith, all data present)"

narrate "Jane Smith has all required oncology data in the EHR:"
narrate "  • Breast cancer diagnosis (SNOMED 372137005)"
narrate "  • HER2 status — Positive (IHC 3+)"
narrate "  • Cancer stage — Stage IIIA"
narrate "  • ECOG Performance Status — 0"
echo ""
narrate "order-select (informational):"
narrate "  The clinician selects the TH regimen and clicks 'Check Coverage'."
narrate "  CRD fires order-select, queries the EHR FHIR server via fhirAuthorization,"
narrate "  finds all required data → returns a green 'Approvable' card (indicator: info)."
narrate "  Coverage Criteria: Met. PA Requirement: Not required."
echo ""
narrate "order-sign (binding):"
narrate "  The clinician clicks 'Sign Order'. CRD fires order-sign with the same data."
narrate "  Since all criteria are met and ECOG < 1, PA can be bypassed."
narrate "  CRD returns 'Authorization Satisfied' (indicator: success)."
echo ""
narrate "Open the EHR in your browser and walk through:"
action "Open: $EHR_URL"
narrate "  1. Click on Jane Smith's patient chart"
narrate "  2. Go to Order Entry"
narrate "  3. Select the TH regimen (Trastuzumab + Paclitaxel)"
narrate "  4. Click 'Check Coverage' — fires order-select → green 'Approvable' badge"
narrate "  5. Observe: Coverage Criteria = Met, PA Requirement = Not required"
narrate "  6. Click 'Sign Order' — fires order-sign → green 'Authorization Satisfied'"
prompt

# ─────────────────────────────────────────────────────────────────────────────
# Step 4: Path 1b — Approvable, PA required (Maria Garcia)
# ─────────────────────────────────────────────────────────────────────────────

step "4" "Path 1b — Approvable, PA required (Maria Garcia, ECOG 1)"

narrate "Maria Garcia: same oncology profile as Jane Smith, but ECOG Performance Status = 1."
narrate "The payer policy requires PA submission when ECOG ≥ 1."
echo ""
narrate "order-select (informational):"
narrate "  All data is present → 'Approvable'. Coverage Criteria: Met."
narrate "  PA Requirement: Required (shown in the structured summary)."
echo ""
narrate "order-sign (binding):"
narrate "  CRD fires order-sign. Since ECOG ≥ 1, PA cannot be bypassed."
narrate "  CRD returns 'PA Required' card → the EHR shows a link to submit PA."
narrate "  The clinician submits PA to the PAS service, which returns 'Approved'."
echo ""
action "Open: $EHR_URL"
narrate "  1. Click on Maria Garcia"
narrate "  2. Order Entry → select TH regimen"
narrate "  3. Check Coverage → 'Approvable', PA Requirement: Required"
narrate "  4. Sign Order → 'PA Required' card with submission link"
prompt

# ─────────────────────────────────────────────────────────────────────────────
# Step 5: Path 2 — DTR Required (Sandra Chen, HER2 missing)
# ─────────────────────────────────────────────────────────────────────────────

step "5" "Path 2 — DTR Required (Sandra Chen, HER2 missing)"

narrate "Sandra Chen has breast cancer but NO HER2 result in the EHR:"
narrate "  • Breast cancer diagnosis — ✓"
narrate "  • Cancer stage — ✓ (Stage IIIA)"
narrate "  • ECOG Performance Status — ✓ (PS 1)"
narrate "  • HER2 status — ✗ MISSING"
echo ""
narrate "order-select fires: CRD queries the EHR, finds HER2 is absent."
narrate "CRD returns a yellow 'Documentation Required' card (indicator: warning)"
narrate "with a SMART link to launch the DTR client."
narrate "The card tells the clinician exactly which data element is missing."
echo ""
narrate "The clinician clicks the DTR link, enters HER2 status in the form,"
narrate "and submits. The DTR client writes a QuestionnaireResponse into the"
narrate "EHR's draftOrders context (not persisted to the FHIR server for clinical use)."
narrate "The browser returns to the EHR with the completed QuestionnaireResponse."
narrate "order-select fires again: now HER2 is present → 'Approvable' card."
echo ""
narrate "Open the EHR and walk through:"
action "Open: $EHR_URL"
narrate "  1. Click on Sandra Chen's patient chart"
narrate "  2. Go to Order Entry"
narrate "  3. Select the TH regimen"
narrate "  4. Click 'Check Coverage' — fires order-select"
narrate "  5. Observe: yellow 'Documentation Required' card with DTR SMART link"
narrate "  6. Click 'Complete Prior Authorization Documentation (DTR)'"
narrate "  7. DTR form opens — enter HER2 status: 'Positive (IHC 3+)'"
narrate "  8. Click 'Submit' — returns to EHR with QuestionnaireResponse"
narrate "  9. order-select fires again → green 'Approvable'"
prompt

# ─────────────────────────────────────────────────────────────────────────────
# Step 6: Path 4 — Biosimilar Substitution (Diane Roe)
# ─────────────────────────────────────────────────────────────────────────────

step "6" "Path 4 — Biosimilar Substitution (Diane Roe)"

narrate "Diane Roe: HER2+ breast cancer, Stage IIIA, ECOG 0 — all data present."
narrate "The payer policy approves the TH regimen but requires a biosimilar"
narrate "substitution: trastuzumab → trastuzumab-dttb (Ontrudy, RxNorm 1992624)."
echo ""
narrate "order-select fires: all criteria are met → 'Approvable'."
narrate "The card detail mentions the required biosimilar substitution."
narrate "A violet 'Biosimilar Sub' badge appears in the patient list and on the card."
echo ""
narrate "order-sign fires: the authorization-satisfied card carries the substitution"
narrate "detail so the clinician sees the payer modification before signing."
echo ""
action "Open: $EHR_URL"
narrate "  1. Click 'Diane Roe' — violet 'Biosimilar Sub' badge in patient list"
narrate "  2. Go to Order Entry → select 'TH — Trastuzumab + Paclitaxel'"
narrate "  3. Check Coverage → 'Approvable' card with biosimilar detail"
narrate "  4. Sign Order → 'Authorization Satisfied' card with substitution note"
narrate "  5. The order includes trastuzumab-dttb (Ontrudy) per payer policy"
prompt

# ─────────────────────────────────────────────────────────────────────────────
# Step 7: Direct CRD API call (show the FHIR query-back mechanism)
# ─────────────────────────────────────────────────────────────────────────────

step "7" "Direct CRD API call — see FHIR query-back in action"

narrate "Let's call the CRD service directly to see the response shapes."
narrate "The EHR's /api/crd-hooks proxy injects fhirServer and fhirAuthorization,"
narrate "but we can call the CRD directly with fhirServer pointing to HAPI."
echo ""
action "curl -s -X POST $CRD_URL/api/cds-services/oncology-crd \\"
action "  -H 'Content-Type: application/json' \\"
action "  -d '{\"hookInstance\":\"demo-1\",\"hook\":\"order-select\",..."
echo ""

RESPONSE=$(curl -sf -X POST "$CRD_URL/api/cds-services/oncology-crd" \
  -H "Content-Type: application/json" \
  -d "{
    \"hookInstance\": \"demo-walkthrough-1\",
    \"hook\": \"order-select\",
    \"context\": {
      \"userId\": \"Practitioner/demo\",
      \"patientId\": \"jane-smith\",
      \"draftOrders\": {
        \"resourceType\": \"Bundle\",
        \"type\": \"collection\",
        \"entry\": []
      },
      \"selections\": []
    },
    \"fhirServer\": \"$FHIR_BASE\"
  }" 2>/dev/null || echo '{"error": "CRD service unreachable"}')

echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
echo ""
narrate "order-select for Jane Smith: all required data present → indicator: 'info'"
narrate "('Approvable'). The card tells the clinician coverage criteria are met."
prompt

narrate "Now let's try Sandra Chen (HER2 is absent):"
echo ""

RESPONSE2=$(curl -sf -X POST "$CRD_URL/api/cds-services/oncology-crd" \
  -H "Content-Type: application/json" \
  -d "{
    \"hookInstance\": \"demo-walkthrough-2\",
    \"hook\": \"order-select\",
    \"context\": {
      \"userId\": \"Practitioner/demo\",
      \"patientId\": \"sandra-chen\",
      \"draftOrders\": {
        \"resourceType\": \"Bundle\",
        \"type\": \"collection\",
        \"entry\": []
      },
      \"selections\": []
    },
    \"fhirServer\": \"$FHIR_BASE\"
  }" 2>/dev/null || echo '{"error": "CRD service unreachable"}')

echo "$RESPONSE2" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE2"
echo ""
narrate "order-select for Sandra Chen: HER2 is missing → indicator: 'warning'"
narrate "'Documentation Required' card with a SMART link to launch the DTR client."
prompt

# ─────────────────────────────────────────────────────────────────────────────
# Step 8: Hub — knowledge artifacts and content viewer
# ─────────────────────────────────────────────────────────────────────────────

step "8" "Hub — knowledge artifacts and content viewer"

narrate "The Hub serves FHIR knowledge artifacts (PlanDefinitions, Libraries)"
narrate "and provides a content viewer for the clinical reasoning logic."
narrate "These are reference artifacts — the CRD service evaluates payer policy"
narrate "directly via the shared @mopa/oncology-policy TypeScript package."
echo ""
action "Open: $HUB_URL"
narrate "  • Home page: demo paths, quick start, services overview"
narrate "  • Content tab: payer policy (Layer 2) vs guideline context (Layer 1)"
narrate "  • FHIR API: /fhir/Library, /fhir/PlanDefinition"
prompt

# ─────────────────────────────────────────────────────────────────────────────
# Summary
# ─────────────────────────────────────────────────────────────────────────────

step "Summary" "What you've seen"

echo ""
echo -e "${BOLD}  The two-stage MOPA CDS Hooks workflow:${RESET}"
echo ""
echo -e "  1. ${BOLD}order-select (informational)${RESET} — fires when clinician selects a regimen."
echo -e "     CRD queries EHR FHIR server via fhirAuthorization. Returns 'Approvable'"
echo -e "     (indicator: info) when criteria are met, 'Documentation Required' (warning)"
echo -e "     when data is missing. Shows Coverage Criteria + PA Requirement status."
echo ""
echo -e "  2. ${BOLD}order-sign (binding)${RESET} — fires when clinician signs the order."
echo -e "     CRD makes the final determination. 'Authorization Satisfied' (success)"
echo -e "     when PA can be bypassed (ECOG 0); 'PA Required' (warning) when PA must"
echo -e "     be submitted. The clinician sees payer modifications (e.g. biosimilar"
echo -e "     substitution) at this stage before the order is finalized."
echo ""
echo -e "  3. ${BOLD}DTR${RESET} — launched from order-select when data is missing. The DTR"
echo -e "     client collects missing information and returns a QuestionnaireResponse"
echo -e "     in the context so CRD can re-evaluate without re-querying the FHIR server."
echo -e "     DTR data is NOT persisted to the EHR FHIR server for clinical use."
echo ""
echo -e "  4. ${BOLD}PAS${RESET} — invoked when PA is required (ECOG ≥ 1). The PAS service"
echo -e "     evaluates the PA request and returns a ClaimResponse. For biosimilar"
echo -e "     substitutions, processNote entries surface the payer modification."
echo ""
echo -e "  5. ${BOLD}Biosimilar Substitution${RESET} — payer approves the TH regimen but"
echo -e "     requires trastuzumab → trastuzumab-dttb (Ontrudy). The CRD card and"
echo -e "     PAS ClaimResponse carry the substitution detail so the clinician"
echo -e "     sees exactly what the payer will change before signing."
echo ""
echo -e "${DIM}  Services:${RESET}"
echo -e "${DIM}    Hub:           http://localhost:4000${RESET}"
echo -e "${DIM}    EHR:           http://localhost:4001${RESET}"
echo -e "${DIM}    CRD Service:   http://localhost:4003${RESET}"
echo -e "${DIM}    DTR Client:    http://localhost:4004${RESET}"
echo -e "${DIM}    PAS Service:   http://localhost:4005${RESET}"
echo -e "${DIM}    Payer Backend: http://localhost:4006${RESET}"
echo -e "${DIM}    HAPI FHIR:     http://localhost:8080/fhir${RESET}"
echo ""
