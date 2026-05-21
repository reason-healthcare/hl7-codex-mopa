#!/usr/bin/env bash
# Path 1: All data present, ECOG 0 → CRD pre-authorizes (no PA submission required).
#
# Pivot: ECOG Performance Status = 0 (Fully active)
#   ECOG 0 → CRD returns "Coverage pre-authorized — prior authorization not required"
#   ECOG ≥1 → CRD returns coverage met but requires PA submission (Path 2)
#
# Usage: bash fixtures/path1.sh [FHIR_BASE_URL]

set -euo pipefail
FHIR_BASE="${1:-${FHIR_BASE_URL:-http://localhost:8080/fhir}}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Start from a clean base (ECOG=1, no HER2)
bash "$SCRIPT_DIR/load-fixtures.sh" "$FHIR_BASE"

echo "Applying Path 1 overrides..."

# Override ECOG to 0 (Fully active — triggers pre-approval)
curl -sf -X PUT "$FHIR_BASE/Observation/jane-smith-ecog-ps" \
  -H "Content-Type: application/fhir+json" \
  -d '{
    "resourceType": "Observation",
    "id": "jane-smith-ecog-ps",
    "status": "final",
    "category": [{"coding": [{"system": "http://terminology.hl7.org/CodeSystem/observation-category", "code": "survey", "display": "Survey"}]}],
    "code": {"coding": [{"system": "http://loinc.org", "code": "89247-1", "display": "ECOG Performance Status score"}], "text": "ECOG Performance Status"},
    "subject": {"reference": "Patient/jane-smith"},
    "effectiveDateTime": "2024-01-20",
    "valueInteger": 0
  }' > /dev/null
echo "  set ECOG = 0"

# Add HER2 positive
bash "$SCRIPT_DIR/add-her2.sh" "$FHIR_BASE"

echo ""
echo "Path 1 ready: ECOG=0, HER2+ — all data present."
echo "  order-select → CRD: Coverage pre-authorized, no PA required"
echo "  order-sign   → CRD: Coverage pre-authorized, no PA required"
