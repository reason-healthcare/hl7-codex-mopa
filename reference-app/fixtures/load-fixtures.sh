#!/usr/bin/env bash
# Load Jane Smith fixture bundle into HAPI FHIR.
# Usage: ./load-fixtures.sh [FHIR_BASE_URL]
#
# The HER2 Observation is intentionally absent from the fixtures
# to exercise the DTR / gap-analysis flow in Phase 5+.

set -euo pipefail

FHIR_BASE="${1:-${FHIR_BASE_URL:-http://localhost:8080/fhir}}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUNDLE="$SCRIPT_DIR/jane-smith-bundle.json"

echo "Loading Jane Smith fixtures into: $FHIR_BASE"
echo "Bundle: $BUNDLE"
echo ""

# Wait for HAPI to be ready
MAX_WAIT=60
WAITED=0
echo -n "Waiting for HAPI FHIR to be ready..."
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

# POST the transaction bundle
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
    print(f'Transaction successful — {len(data.get(\"entry\", []))} resources loaded:')
    for entry in data.get('entry', []):
        resp = entry.get('response', {})
        print(f'  {resp.get(\"location\", \"unknown\")} → {resp.get(\"status\", \"?\")}')
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
echo "Patient ID: jane-smith"
echo "  Chart URL: http://localhost:4000/patients/jane-smith"
echo ""
echo "NOTE: HER2 Observation is intentionally absent from the base fixtures."
echo "      This triggers the DTR gap-analysis path (Phase 5–6)."
echo ""
echo "      To add HER2 and exercise the pre-approved / PA-required paths:"
echo "        bash fixtures/add-her2.sh       # writes IHC 3+ Observation"
echo "        bash fixtures/remove-her2.sh    # removes it (resets to gap state)"
echo "      Or launch the CDS SMART App from the EHR and submit via the inline form."
