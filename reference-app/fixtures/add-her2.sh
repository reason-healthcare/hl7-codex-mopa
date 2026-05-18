#!/usr/bin/env bash
# Add a HER2-positive Observation for Jane Smith to HAPI FHIR.
# This puts the CRD service into the "pre-approved" path.
# Usage: ./add-her2.sh [FHIR_BASE_URL]

set -euo pipefail
FHIR_BASE="${1:-${FHIR_BASE_URL:-http://localhost:8080/fhir}}"

echo "Adding HER2-positive Observation to $FHIR_BASE ..."

curl -sf -X PUT "$FHIR_BASE/Observation/jane-smith-her2" \
  -H "Content-Type: application/fhir+json" \
  -d '{
    "resourceType": "Observation",
    "id": "jane-smith-her2",
    "status": "final",
    "category": [{
      "coding": [{
        "system": "http://terminology.hl7.org/CodeSystem/observation-category",
        "code": "laboratory"
      }]
    }],
    "code": {
      "coding": [
        {
          "system": "http://loinc.org",
          "code": "85319-2",
          "display": "HER2 [Presence] in Breast cancer specimen by Immune stain"
        }
      ],
      "text": "HER2 Status"
    },
    "subject": { "reference": "Patient/jane-smith" },
    "effectiveDateTime": "2024-01-25",
    "valueCodeableConcept": {
      "coding": [{
        "system": "http://snomed.info/sct",
        "code": "431396003",
        "display": "Human epidermal growth factor 2 gene amplification detected (finding)"
      }],
      "text": "HER2 positive (IHC 3+)"
    }
  }' | python3 -c "
import json,sys
r=json.load(sys.stdin)
print('Created:', r.get('resourceType'), r.get('id'))
"

echo ""
echo "HER2-positive Observation loaded."
echo "  Select TH regimen in EHR → CRD should return a pre-approved card."
