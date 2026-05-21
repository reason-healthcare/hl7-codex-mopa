#!/usr/bin/env bash
# Path 2: All data present, ECOG 1 → CRD returns coverage met, PA submission required.
#
# Pivot: ECOG Performance Status = 1 (Restricted in strenuous activity)
#   ECOG 0 → pre-authorized, no PA (Path 1)
#   ECOG ≥1 → coverage met, PA required (this path)
#
# Usage: bash fixtures/path2.sh [FHIR_BASE_URL]

set -euo pipefail
FHIR_BASE="${1:-${FHIR_BASE_URL:-http://localhost:8080/fhir}}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Base fixtures already have ECOG=1 — just add HER2
bash "$SCRIPT_DIR/load-fixtures.sh" "$FHIR_BASE"
bash "$SCRIPT_DIR/add-her2.sh" "$FHIR_BASE"

echo ""
echo "Path 2 ready: ECOG=1, HER2+ — all data present."
echo "  order-select → CRD: Coverage criteria met, PA required"
echo "  order-sign   → CRD: Prior authorization required — submit via PAS"
