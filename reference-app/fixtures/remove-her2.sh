#!/usr/bin/env bash
# Delete the HER2 Observation for Jane Smith from HAPI FHIR.
# This puts the CRD service back into the "DTR required" path.
# Usage: ./remove-her2.sh [FHIR_BASE_URL]

set -euo pipefail
FHIR_BASE="${1:-${FHIR_BASE_URL:-http://localhost:8080/fhir}}"

echo "Removing HER2 Observation from $FHIR_BASE ..."

HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE \
  "$FHIR_BASE/Observation/jane-smith-her2")

if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "204" ]; then
  echo "HER2 Observation deleted (HTTP $HTTP_STATUS)."
elif [ "$HTTP_STATUS" = "404" ]; then
  echo "HER2 Observation not found — already absent."
else
  echo "Unexpected HTTP status: $HTTP_STATUS" >&2
  exit 1
fi

echo ""
echo "  Select TH regimen in EHR → CRD should return a DTR launch card."
