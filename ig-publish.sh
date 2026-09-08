#!/usr/bin/env bash
# =============================================================================
# ig-publish.sh — Build the OGCA IG and force-push output/ to origin/guide
#
# The remote branch "guide" should be configured in GitHub as a GitHub Pages
# source (Settings → Pages → Branch: guide / root).
#
# Usage:
#   ./ig-publish.sh [--skip-build] [--dry-run] [--help]
#
# Options:
#   --skip-build   Push the existing ./output as-is without rebuilding
#   --dry-run      Run the full build but stop before pushing
#   --help         Show this message
#
# What this script does:
#   1. Runs a full IG build via ig-build.sh (unless --skip-build)
#   2. Verifies ./output/index.html exists (sanity check)
#   3. Creates an orphan worktree of the current repo in a temp directory
#   4. Copies ./output/* into that worktree
#   5. Commits and force-pushes to origin/guide
#   6. Cleans up the temp worktree
# =============================================================================

set -eo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REMOTE="origin"
BRANCH="guide"
OUTPUT_DIR="$SCRIPT_DIR/output"

# ── Colours ──────────────────────────────────────────────────────────────────
if [ -t 1 ]; then
  BOLD="\033[1m"; RESET="\033[0m"
  BLUE="\033[1;34m"; GREEN="\033[1;32m"
  YELLOW="\033[1;33m"; RED="\033[1;31m"
  CYAN="\033[1;36m"
else
  BOLD="" RESET="" BLUE="" GREEN="" YELLOW="" RED="" CYAN=""
fi

step() { echo -e "\n${BLUE}▶ $*${RESET}"; }
ok()   { echo -e "${GREEN}  ✔ $*${RESET}"; }
warn() { echo -e "${YELLOW}  ⚠ $*${RESET}"; }
fail() { echo -e "${RED}  ✖ $*${RESET}"; }
info() { echo -e "${CYAN}  · $*${RESET}"; }
die()  { fail "$*"; exit 1; }

# ── Argument parsing ──────────────────────────────────────────────────────────
SKIP_BUILD=false
DRY_RUN=false

for arg in "$@"; do
  case "$arg" in
    --skip-build) SKIP_BUILD=true ;;
    --dry-run)    DRY_RUN=true ;;
    --help|-h)
      echo -e "${BOLD}ig-publish.sh${RESET} — Build and publish the OGCA IG to GitHub Pages\n"
      echo -e "${BOLD}Usage:${RESET}  ./ig-publish.sh [--skip-build] [--dry-run] [--help]\n"
      echo -e "${BOLD}Options:${RESET}"
      printf "  %-14s %s\n" "--skip-build" "Push existing ./output without rebuilding"
      printf "  %-14s %s\n" "--dry-run"    "Build but do not push"
      printf "  %-14s %s\n" "--help"       "Show this message"
      echo ""
      echo -e "${BOLD}Target:${RESET}  ${REMOTE}/${BRANCH}  (configure as GitHub Pages source)"
      exit 0
      ;;
    *)
      die "Unknown option: '$arg'. Run ./ig-publish.sh --help for usage."
      ;;
  esac
done

# ── Header ────────────────────────────────────────────────────────────────────
echo -e "${BOLD}╔══════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}║  OGCA IG Publish → ${REMOTE}/${BRANCH}$(printf '%*s' $((30 - ${#REMOTE} - ${#BRANCH})) '')║${RESET}"
echo -e "${BOLD}╚══════════════════════════════════════════════════╝${RESET}"

# ── Step 1: Build ─────────────────────────────────────────────────────────────
if [ "$SKIP_BUILD" = true ]; then
  warn "Skipping build (--skip-build). Using existing ./output."
else
  step "Cleaning previous IG build artifacts"
  (cd "$SCRIPT_DIR" && bash ig-build.sh clean)
  ok "Previous build artifacts removed."

  step "Running full IG build"
  (cd "$SCRIPT_DIR" && bash ig-build.sh)
  ok "Build complete."
fi

# ── Step 2: Sanity check ──────────────────────────────────────────────────────
step "Verifying build output"
if [ ! -f "$OUTPUT_DIR/index.html" ]; then
  die "./output/index.html not found — build may have failed. Aborting."
fi
FILE_COUNT=$(find "$OUTPUT_DIR" -type f | wc -l | tr -d ' ')
ok "Output verified ($FILE_COUNT files in ./output)."

if [ "$DRY_RUN" = true ]; then
  warn "Dry-run mode — stopping before push."
  info "Would force-push $FILE_COUNT files to ${REMOTE}/${BRANCH}."
  exit 0
fi

# ── Step 3: Prepare worktree ──────────────────────────────────────────────────
step "Preparing git worktree for ${BRANCH}"

WORKTREE_DIR=$(mktemp -d)
info "Temp worktree: $WORKTREE_DIR"

# Ensure the temp dir is cleaned up even on error
cleanup() {
  if [ -n "$WORKTREE_DIR" ] && [ -d "$WORKTREE_DIR" ]; then
    git -C "$SCRIPT_DIR" worktree remove --force "$WORKTREE_DIR" 2>/dev/null || true
    rm -rf "$WORKTREE_DIR"
    info "Worktree cleaned up."
  fi
}
trap cleanup EXIT

# Add a detached worktree (orphan-style: no branch tracking needed for force-push)
git -C "$SCRIPT_DIR" worktree add --detach "$WORKTREE_DIR"

ok "Worktree ready."

# ── Step 4: Copy output into worktree ────────────────────────────────────────
step "Copying ./output into worktree"

# Clear everything in the worktree (keep .git)
find "$WORKTREE_DIR" -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} +

# Copy the full output directory contents
cp -r "$OUTPUT_DIR"/. "$WORKTREE_DIR/"

ok "Copied $FILE_COUNT files."

# ── Step 5: Commit ────────────────────────────────────────────────────────────
step "Committing"

cd "$WORKTREE_DIR"

git add --all

SOURCE_COMMIT=$(git -C "$SCRIPT_DIR" rev-parse --short HEAD)
SOURCE_BRANCH=$(git -C "$SCRIPT_DIR" rev-parse --abbrev-ref HEAD)
TIMESTAMP=$(date -u '+%Y-%m-%d %H:%M UTC')

git commit \
  --allow-empty \
  -m "chore: publish IG output — ${TIMESTAMP}

Source: ${SOURCE_BRANCH}@${SOURCE_COMMIT}
Files: ${FILE_COUNT}
" 2>&1 | sed 's/^/  /'

ok "Commit created."

# ── Step 6: Force-push ────────────────────────────────────────────────────────
step "Force-pushing to ${REMOTE}/${BRANCH}"

git push --force "$REMOTE" "HEAD:refs/heads/${BRANCH}" 2>&1 | sed 's/^/  /'

ok "Pushed to ${REMOTE}/${BRANCH}."

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}✔ Published successfully.${RESET}"
echo ""
REMOTE_URL=$(git -C "$SCRIPT_DIR" remote get-url "$REMOTE" 2>/dev/null || echo "(unknown)")
info "Remote : $REMOTE_URL"
info "Branch : ${BRANCH}"
info "Commit : $(git rev-parse --short HEAD)"
info "GitHub Pages will rebuild in a few seconds."
echo ""
