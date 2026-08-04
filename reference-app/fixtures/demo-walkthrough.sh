#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# MOPA Reference Application — Demonstration Walkthrough
#
# An interactive, narrated script that walks through the full MOPA workflow:
#   - Starting services and loading fixtures
#   - Path 1: Authorization Satisfied (all data present)
#   - Path 2: DTR Required (HER2 missing → collect → Authorization Satisfied)
#   - Layer 1: SMART App gap analysis and guideline-based regimen options
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
SMART_APP_URL="http://localhost:4002"
CRD_URL="http://localhost:4003"
DTR_URL="http://localhost:4004"
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
echo -e "${DIM}  This walkthrough demonstrates the simplified MOPA workflow:${RESET}"
echo -e "${DIM}  standard CDS Hooks with FHIR query-back via fhirAuthorization.${RESET}"
echo ""
echo -e "${DIM}  Three demo patients are available:${RESET}"
echo -e "${DIM}    Jane Smith   — ECOG 0, HER2+  → Authorization Satisfied${RESET}"
echo -e "${DIM}    Maria Garcia — ECOG 1, HER2+  → Authorization Satisfied${RESET}"
echo -e "${DIM}    Sandra Chen  — ECOG 1, HER2✗  → DTR Required${RESET}"

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

  narrate "Loading demo patient fixtures (Jane Smith, Maria Garcia, Sandra Chen)..."
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
check_url "$SMART_APP_URL" "SMART App (port 4002)"
check_url "$CRD_URL/api/cds-services" "CRD Service (port 4003)"
check_url "$DTR_URL" "DTR Client (port 4004)"
prompt

# ─────────────────────────────────────────────────────────────────────────────
# Step 2: Inspect CRD discovery (standard CDS Hooks, no custom extension)
# ─────────────────────────────────────────────────────────────────────────────

step "2" "Inspect CRD discovery — standard CDS Hooks"

narrate "The CRD service advertises two standard CDS Hooks services."
narrate "No custom extension, no prefetch templates — just the hooks."
narrate "The CRD queries the EHR FHIR server directly via fhirAuthorization."
echo ""
action "curl -s $CRD_URL/api/cds-services | python3 -m json.tool"
echo ""
curl -sf "$CRD_URL/api/cds-services" | python3 -m json.tool 2>/dev/null || echo "  (could not reach CRD service)"
prompt

# ─────────────────────────────────────────────────────────────────────────────
# Step 3: Path 1 — Authorization Satisfied (Jane Smith)
# ─────────────────────────────────────────────────────────────────────────────

step "3" "Path 1 — Authorization Satisfied (Jane Smith, all data present)"

narrate "Jane Smith has all required oncology data in the EHR:"
narrate "  • Breast cancer diagnosis (SNOMED 372137005)"
narrate "  • HER2 status — Positive (IHC 3+)"
narrate "  • Cancer stage — Stage IIIA"
narrate "  • ECOG Performance Status — 0"
echo ""
narrate "When the clinician selects the TH regimen and fires order-select,"
narrate "the CRD service queries the EHR FHIR server via fhirAuthorization,"
narrate "finds all required data, and returns 'Authorization Satisfied'."
echo ""
narrate "Open the EHR in your browser and walk through:"
action "Open: $EHR_URL"
narrate "  1. Click on Jane Smith's patient chart"
narrate "  2. Go to Order Entry"
narrate "  3. Select the TH regimen (Trastuzumab + Paclitaxel)"
narrate "  4. Click 'Check Coverage' — fires order-select"
narrate "  5. Observe: green 'Authorization Satisfied' card"
narrate "  6. Click 'Sign Order' — fires order-sign"
narrate "  7. Same 'Authorization Satisfied' card — PA can be bypassed"
prompt

# ─────────────────────────────────────────────────────────────────────────────
# Step 4: Path 2 — DTR Required (Sandra Chen, HER2 missing)
# ─────────────────────────────────────────────────────────────────────────────

step "4" "Path 2 — DTR Required (Sandra Chen, HER2 missing)"

narrate "Sandra Chen has breast cancer but NO HER2 result in the EHR:"
narrate "  • Breast cancer diagnosis — ✓"
narrate "  • Cancer stage — ✓ (Stage IIIA)"
narrate "  • ECOG Performance Status — ✓ (PS 1)"
narrate "  • HER2 status — ✗ MISSING"
echo ""
narrate "The CRD service queries the EHR, finds HER2 is absent,"
narrate "and returns a DTR launch card to collect the missing data."
echo ""
narrate "Open the EHR and walk through the DTR flow:"
action "Open: $EHR_URL"
narrate "  1. Click on Sandra Chen's patient chart"
narrate "  2. Go to Order Entry"
narrate "  3. Select the TH regimen"
narrate "  4. Click 'Check Coverage' — fires order-select"
narrate "  5. Observe: yellow 'Documentation Required' card with DTR link"
narrate "  6. Click 'Complete Prior Authorization Documentation (DTR)'"
narrate "  7. DTR Client launches — SMART app within the EHR"
narrate "  8. Enter HER2 status: select 'Positive (IHC 3+)'"
narrate "  9. Click 'Submit' — Observation written to EHR FHIR server"
narrate " 10. Browser returns to EHR order entry — auto-fires order-select"
narrate " 11. Now HER2 is present → 'Authorization Satisfied' card"
prompt

# ─────────────────────────────────────────────────────────────────────────────
# Step 5: Layer 1 — SMART App (pre-order CDS)
# ─────────────────────────────────────────────────────────────────────────────

step "5" "Layer 1 — SMART App (pre-order gap analysis & regimen options)"

narrate "The SMART App is an optional Layer 1 pre-order CDS tool."
narrate "It queries the EHR FHIR server directly for oncology data,"
narrate "shows a gap analysis table, and evaluates guideline-based"
narrate "regimen eligibility using CQL (BreastCancerGuideline)."
echo ""
narrate "With Sandra Chen (HER2 still missing from Step 4 if you skipped it,"
narrate "or use Jane Smith who has all data):"
echo ""
action "From the EHR patient chart, click 'Launch CDS App'"
narrate "  The SMART App opens in a new tab with:"
narrate "  • Gap Analysis table — shows each data element as present/missing"
narrate "  • If HER2 is missing: inline IHC selector to enter and write back"
narrate "  • Regimen Options table — guideline-concordant regimens highlighted"
narrate "  • 'Open in EHR Order Entry' link for each regimen"
echo ""
narrate "This is the Layer 1 → Layer 2 handoff:"
narrate "  SMART App (CDS) → clinician selects regimen → EHR order entry → CRD"
prompt

# ─────────────────────────────────────────────────────────────────────────────
# Step 6: Direct CRD API call (show the FHIR query-back mechanism)
# ─────────────────────────────────────────────────────────────────────────────

step "6" "Direct CRD API call — see FHIR query-back in action"

narrate "Let's call the CRD service directly to see the response shape."
narrate "The EHR's /api/crd-hooks proxy injects fhirServer and fhirAuthorization,"
narrate "but we can call the CRD with fhirServer pointing directly to HAPI."
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
narrate "The CRD queried HAPI for Conditions, Observations (HER2/stage/ECOG),"
narrate "and MedicationRequests. All required data was present for Jane Smith"
narrate "→ 'Authorization Satisfied' with indicator 'success'."
prompt

# Now try Sandra Chen (HER2 missing)
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
narrate "The CRD found HER2 is missing → 'Documentation Required' card"
narrate "with a SMART link to launch the DTR client."
prompt

# ─────────────────────────────────────────────────────────────────────────────
# Step 7: Hub — knowledge artifacts and content viewer
# ─────────────────────────────────────────────────────────────────────────────

step "7" "Hub — knowledge artifacts and content viewer"

narrate "The Hub serves FHIR knowledge artifacts (PlanDefinitions, Libraries)"
narrate "and provides a content viewer for the clinical reasoning logic."
narrate "These are reference artifacts — the CRD service itself no longer"
narrate "depends on them for evaluation."
echo ""
action "Open: $HUB_URL"
narrate "  • Home page: demo paths, quick start, services overview"
narrate "  • Content tab: Layer 1 (guideline) vs Layer 2 (payer policy)"
narrate "  • FHIR API: /fhir/Library, /fhir/PlanDefinition"
prompt

# ─────────────────────────────────────────────────────────────────────────────
# Step 8: Reset and try Maria Garcia
# ─────────────────────────────────────────────────────────────────────────────

step "8" "Try Maria Garcia (all data present, ECOG 1)"

narrate "Maria Garcia has all required data (like Jane Smith) but ECOG=1."
narrate "With the simplified spec, all data present = Authorization Satisfied"
narrate "regardless of ECOG value — PA conditions have been evaluated."
echo ""
action "Open: $EHR_URL"
narrate "  1. Click on Maria Garcia"
narrate "  2. Go to Order Entry → select TH regimen"
narrate "  3. Check Coverage → Authorization Satisfied"
prompt

# ─────────────────────────────────────────────────────────────────────────────
# Summary
# ─────────────────────────────────────────────────────────────────────────────

step "Summary" "What you've seen"

echo ""
echo -e "${BOLD}  The simplified MOPA workflow:${RESET}"
echo ""
echo -e "  1. ${BOLD}Standard CDS Hooks${RESET} — no custom discovery extension, no prefetch"
echo -e "     templates. The CRD service advertises order-select and order-sign hooks."
echo ""
echo -e "  2. ${BOLD}FHIR query-back${RESET} — the CRD uses fhirAuthorization to query the EHR"
echo -e "     FHIR server directly for oncology patient context (Condition, Observation"
echo -e "     for HER2/stage/ECOG, MedicationRequest for prior therapy)."
echo ""
echo -e "  3. ${BOLD}Authorization Satisfied${RESET} — when all required data is present and"
echo -e "     coverage criteria are met, PA can be bypassed."
echo ""
echo -e "  4. ${BOLD}DTR Required${RESET} — when data is missing, a DTR launch card lets the"
echo -e "     clinician enter the missing information. The DTR client writes Observations"
echo -e "     back to the EHR FHIR server."
echo ""
echo -e "  5. ${BOLD}Layer 1 SMART App${RESET} — optional pre-order CDS that performs gap"
echo -e "     analysis and presents guideline-concordant regimen options."
echo ""
echo -e "${DIM}  Services:${RESET}"
echo -e "${DIM}    Hub:          http://localhost:4000${RESET}"
echo -e "${DIM}    EHR:          http://localhost:4001${RESET}"
echo -e "${DIM}    SMART App:    http://localhost:4002${RESET}"
echo -e "${DIM}    CRD Service:  http://localhost:4003${RESET}"
echo -e"${DIM}    DTR Client:   http://localhost:4004${RESET}"
echo -e "${DIM}    PAS Service:  http://localhost:4005${RESET}"
echo -e "${DIM}    Payer Backend:http://localhost:4006${RESET}"
echo -e "${DIM}    HAPI FHIR:    http://localhost:8080/fhir${RESET}"
echo ""
