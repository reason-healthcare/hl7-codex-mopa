#!/usr/bin/env bash
# Load Jane Smith fixture bundle into HAPI FHIR.
# Purges all existing Jane Smith data first so re-runs are idempotent.
#
# Usage: ./load-fixtures.sh [FHIR_BASE_URL]
#
# The HER2 Observation is intentionally absent from the base fixtures
# to exercise the DTR / gap-analysis flow.

set -euo pipefail

FHIR_BASE="${1:-${FHIR_BASE_URL:-http://localhost:8080/fhir}}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUNDLE="$SCRIPT_DIR/jane-smith-bundle.json"

echo "Loading Jane Smith fixtures into: $FHIR_BASE"
echo ""

# ---------------------------------------------------------------------------
# Wait for HAPI to be ready
# ---------------------------------------------------------------------------
MAX_WAIT=60
WAITED=0
echo -n "Waiting for HAPI FHIR..."
until curl -sf "$FHIR_BASE/metadata" > /dev/null 2>&1; do
  if [ "$WAITED" -ge "$MAX_WAIT" ]; then
    echo ""
    echo "ERROR: HAPI FHIR did not become ready within ${MAX_WAIT}s at $FHIR_BASE"
    echo "Make sure Docker Compose is running: docker compose up -d hapi"
    exit 1
  fi
  echo -n "."
  sleep 2
  WAITED=$((WAITED + 2))
done
echo " ready!"
echo ""

# ---------------------------------------------------------------------------
# Purge existing data
# Conditional deletes by patient catch both the fixed-ID fixtures and any
# server-ID resources written by the DTR (observations, questionnaire
# responses). Delete referencing resources before the patient.
# ---------------------------------------------------------------------------
echo "Purging existing data..."

cond_delete() {
  local path="$1"
  local status
  status=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE \
    -H "Accept: application/fhir+json" \
    "$FHIR_BASE/$path")
  case "$status" in
    200|204) echo "  deleted  $path" ;;
    404)     echo "  absent   $path" ;;
    *)       echo "  WARNING  $path returned HTTP $status" ;;
  esac
}

# All observations and conditions referencing this patient
cond_delete "Observation?patient=jane-smith"
cond_delete "Condition?patient=jane-smith"
cond_delete "QuestionnaireResponse?patient=jane-smith"

# Patient last
cond_delete "Patient/jane-smith"

echo ""

# ---------------------------------------------------------------------------
# Load bundle
# ---------------------------------------------------------------------------
echo "Loading bundle: $BUNDLE"
RESPONSE=$(curl -sf \
  -X POST \
  -H "Content-Type: application/fhir+json" \
  -H "Accept: application/fhir+json" \
  -d @"$BUNDLE" \
  "$FHIR_BASE")

echo "$RESPONSE" | python3 -c "
import json, sys
data = json.load(sys.stdin)
if data.get('resourceType') == 'Bundle':
    entries = data.get('entry', [])
    print(f'Transaction successful — {len(entries)} resources loaded:')
    for entry in entries:
        resp = entry.get('response', {})
        print(f'  {resp.get(\"status\", \"?\")}  {resp.get(\"location\", \"unknown\")}')
elif data.get('resourceType') == 'OperationOutcome':
    print('ERROR: OperationOutcome returned:')
    for issue in data.get('issue', []):
        print(f'  [{issue.get(\"severity\")}] {issue.get(\"diagnostics\", issue.get(\"details\", {}).get(\"text\", \"?\"))}')
    sys.exit(1)
else:
    print(json.dumps(data, indent=2))
" 2>/dev/null || echo "$RESPONSE"

echo ""
echo "Jane Smith fixtures loaded."
echo ""
echo "  Patient ID : jane-smith"
echo "  Chart URL  : http://localhost:4000/patients/jane-smith"
echo ""
echo "NOTE: HER2 Observation is absent — this triggers the DTR gap-analysis path."
echo ""
echo "  bash fixtures/add-her2.sh     # add IHC 3+ → pre-approved path"
echo "  bash fixtures/remove-her2.sh  # remove it  → back to gap state"
