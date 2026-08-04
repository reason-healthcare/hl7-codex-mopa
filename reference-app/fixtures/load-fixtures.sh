#!/usr/bin/env bash
# Load all MOPA demo patient fixtures into HAPI FHIR.
# Three patient cases — each demonstrating a different CDS outcome:
#
#   jane-smith    ECOG 0, HER2+   → Pre-authorized (no PA required)
#   maria-garcia  ECOG 1, HER2+   → PA required
#   sandra-chen   ECOG 1, HER2 ✗  → DTR required (collect HER2 first)
#
# Re-running is idempotent — existing data is purged before each load.
# Usage: bash fixtures/load-fixtures.sh [FHIR_BASE_URL]

set -euo pipefail

FHIR_BASE="${1:-${FHIR_BASE_URL:-http://localhost:8080/fhir}}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Loading MOPA demo fixtures into: $FHIR_BASE"
echo ""

# ---------------------------------------------------------------------------
# Wait for HAPI
# ---------------------------------------------------------------------------
MAX_WAIT=60; WAITED=0
echo -n "Waiting for HAPI FHIR..."
until curl -sf "$FHIR_BASE/metadata" > /dev/null 2>&1; do
  [ "$WAITED" -ge "$MAX_WAIT" ] && echo "" && echo "ERROR: HAPI not ready after ${MAX_WAIT}s" && exit 1
  echo -n "."; sleep 2; WAITED=$((WAITED + 2))
done
echo " ready!"
echo ""

# ---------------------------------------------------------------------------
# Purge helper
# ---------------------------------------------------------------------------
cond_delete() {
  local path="$1"
  local status
  status=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE \
    -H "Accept: application/fhir+json" "$FHIR_BASE/$path")
  case "$status" in
    200|204) echo "  deleted  $path" ;;
    404)     echo "  absent   $path" ;;
    *)       echo "  WARNING  $path → HTTP $status" ;;
  esac
}

# ---------------------------------------------------------------------------
# Load helper
# ---------------------------------------------------------------------------
load_bundle() {
  local label="$1"
  local bundle="$2"
  local patient_id="$3"

  echo "── $label ($patient_id) ────────────────────"
  echo "Purging existing data..."
  cond_delete "Observation?patient=${patient_id}"
  cond_delete "Condition?patient=${patient_id}"
  cond_delete "QuestionnaireResponse?patient=${patient_id}"
  cond_delete "Patient/${patient_id}"
  echo ""

  echo "Loading bundle: $(basename "$bundle")"
  RESPONSE=$(curl -sf \
    -X POST \
    -H "Content-Type: application/fhir+json" \
    -H "Accept: application/fhir+json" \
    -d @"$bundle" \
    "$FHIR_BASE")

  echo "$RESPONSE" | python3 -c "
import json, sys
data = json.load(sys.stdin)
if data.get('resourceType') == 'Bundle':
    entries = data.get('entry', [])
    print(f'  OK — {len(entries)} resources loaded')
    for e in entries:
        r = e.get('response', {})
        print(f'    {r.get(\"status\", \"?\")}  {r.get(\"location\", \"unknown\")}')
elif data.get('resourceType') == 'OperationOutcome':
    for issue in data.get('issue', []):
        print(f'  ERROR [{issue.get(\"severity\")}] {issue.get(\"diagnostics\", \"?\")}')
    sys.exit(1)
else:
    print(json.dumps(data, indent=2))
" 2>/dev/null || echo "$RESPONSE"
  echo ""
}

# ---------------------------------------------------------------------------
# Load all three cases
# ---------------------------------------------------------------------------
load_bundle "Case 1 — Pre-authorized"  "$SCRIPT_DIR/jane-smith-bundle.json"    "jane-smith"
load_bundle "Case 2 — PA Required"     "$SCRIPT_DIR/maria-garcia-bundle.json"  "maria-garcia"
load_bundle "Case 3 — DTR Required"    "$SCRIPT_DIR/sandra-chen-bundle.json"   "sandra-chen"

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
EHR_BASE="${EHR_BASE_URL:-http://localhost:4001}"
echo "═══════════════════════════════════════════════"
echo "All fixtures loaded."
echo ""
printf "  %-14s  %-8s  %s\n" "Patient ID" "ECOG" "Expected CDS outcome"
printf "  %-14s  %-8s  %s\n" "──────────" "────" "────────────────────"
printf "  %-14s  %-8s  %s\n" "jane-smith"    "0"  "Authorization Satisfied (PA not required)"
printf "  %-14s  %-8s  %s\n" "maria-garcia"  "1"  "PA Required"
printf "  %-14s  %-8s  %s\n" "sandra-chen"   "1"  "DTR Required (HER2 absent)"
echo ""
echo "  EHR patient list: ${EHR_BASE}"
echo ""
