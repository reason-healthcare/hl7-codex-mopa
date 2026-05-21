#!/usr/bin/env bash
# Path 3: HER2 absent → CRD triggers DTR (documentation requirements tool).
#
# After completing DTR, the outcome depends on the ECOG value already present:
#   ECOG=1 (default)  → post-DTR becomes Path 2 (PA required)
#   Run path1.sh then remove-her2.sh to test the DTR → pre-approved variant.
#
# Usage: bash fixtures/path3.sh [FHIR_BASE_URL]

set -euo pipefail
FHIR_BASE="${1:-${FHIR_BASE_URL:-http://localhost:8080/fhir}}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Base fixtures: ECOG=1, HER2 absent — this is the default load-fixtures state
bash "$SCRIPT_DIR/load-fixtures.sh" "$FHIR_BASE"

echo ""
echo "Path 3 ready: ECOG=1, HER2 absent."
echo "  order-select → CRD: Additional information required — launches DTR"
echo "  After DTR (HER2 answered positive): re-fires order-select → Path 2"
echo ""
echo "  To test DTR → pre-approved variant:"
echo "    bash fixtures/path1.sh && bash fixtures/remove-her2.sh"
