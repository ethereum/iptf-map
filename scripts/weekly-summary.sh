#!/bin/bash
# Weekly summary generator for IPTF Map
# Outputs markdown suitable for TG/Twitter
# Optionally saves to weekly-updates/ with --save flag

set -e

# Parse flags
SAVE_OUTPUT=false
while [[ "$1" == --* ]]; do
    case "$1" in
        --save) SAVE_OUTPUT=true; shift ;;
        *) echo "Unknown flag: $1"; exit 1 ;;
    esac
done

# Default to last 7 days
START_DATE="${1:-$(date -v-7d +%Y-%m-%d 2>/dev/null || date -d '7 days ago' +%Y-%m-%d)}"
END_DATE="${2:-$(date +%Y-%m-%d)}"

REPO_URL="https://github.com/ethereum/iptf-map/blob/master"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
OUTPUT_DIR="$REPO_ROOT/weekly-updates"

format_date() {
    date -j -f %Y-%m-%d "$1" +"%b %d" 2>/dev/null || date -d "$1" +"%b %d"
}

# Initialize output file if saving
if [ "$SAVE_OUTPUT" = true ]; then
    OUTPUT_FILE="$OUTPUT_DIR/${END_DATE}.md"
    mkdir -p "$OUTPUT_DIR"
    : > "$OUTPUT_FILE"  # Clear file
fi

# Output function - writes to stdout and optionally to file
out() {
    echo "$@"
    if [ "$SAVE_OUTPUT" = true ]; then
        echo "$@" >> "$OUTPUT_FILE"
    fi
}

# Get commits in date range
COMMITS=$(git log --since="$START_DATE" --until="$END_DATE 23:59:59" --oneline --no-merges 2>/dev/null || true)

if [ -z "$COMMITS" ]; then
    echo "No changes in this period."
    exit 0
fi

# Header
if [ "$SAVE_OUTPUT" = true ]; then
    out "# IPTF Map Weekly Summary - $(format_date "$START_DATE") - $(format_date "$END_DATE")"
    out ""
    out "## Telegram Post"
    out ""
    out '```'
fi

out "📢 IPTF Map Weekly Update"
out ""

# Count changes for summary line
PATTERN_COUNT=$(echo "$COMMITS" | grep -cE "feat\(pattern" || echo 0)
VENDOR_COUNT=$(echo "$COMMITS" | grep -cE "feat\(vendor" || echo 0)
OTHER_COUNT=$(echo "$COMMITS" | grep -vcE "feat\((pattern|vendor)" || echo 0)

# Build summary
SUMMARY=""
[ "$PATTERN_COUNT" -gt 0 ] && SUMMARY="${PATTERN_COUNT} new pattern(s)"
[ "$VENDOR_COUNT" -gt 0 ] && SUMMARY="${SUMMARY}${SUMMARY:+, }${VENDOR_COUNT} new vendor(s)"
[ "$OTHER_COUNT" -gt 0 ] && SUMMARY="${SUMMARY}${SUMMARY:+, and }improvements"
out "$SUMMARY."
out ""
out "Full changelog: ${REPO_URL}/CHANGELOG.md"
out ""

# Extract new patterns
PATTERN_COMMITS=$(echo "$COMMITS" | grep -E "feat\(pattern" || true)
if [ -n "$PATTERN_COMMITS" ]; then
    out "New patterns:"
    echo "$PATTERN_COMMITS" | while read -r line; do
        NAME=$(echo "$line" | sed 's/^[a-f0-9]* //' | sed 's/feat(patterns\{0,1\}): add //' | sed 's/ pattern.*//' | sed 's/ (#[0-9]*)$//')
        SLUG=$(echo "$NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')
        if [ -f "patterns/pattern-${SLUG}.md" ]; then
            out "• ${NAME} - ${REPO_URL}/patterns/pattern-${SLUG}.md"
        else
            out "• ${NAME}"
        fi
    done
    out ""
fi

# Extract new vendors
VENDOR_COMMITS=$(echo "$COMMITS" | grep -E "feat\(vendor" || true)
if [ -n "$VENDOR_COMMITS" ]; then
    out "New vendors:"
    echo "$VENDOR_COMMITS" | while read -r line; do
        NAME=$(echo "$line" | sed 's/^[a-f0-9]* //' | sed 's/feat(vendor): //' | sed 's/^add //' | sed 's/ (#[0-9]*)$//')
        SLUG=$(echo "$NAME" | tr '[:upper:]' '[:lower:]')
        if [ -f "vendors/${SLUG}.md" ]; then
            out "• ${NAME} - ${REPO_URL}/vendors/${SLUG}.md"
        else
            out "• ${NAME}"
        fi
    done
    out ""
fi

# Extract improvements
OTHER_COMMITS=$(echo "$COMMITS" | grep -vE "feat\((pattern|vendor)" | head -5 || true)
if [ -n "$OTHER_COMMITS" ]; then
    out "Improvements:"
    echo "$OTHER_COMMITS" | while read -r line; do
        MSG=$(echo "$line" | sed 's/^[a-f0-9]* //' | sed 's/^[a-z]*([^)]*): //' | sed 's/^[a-z]*: //' | sed 's/ (#[0-9]*)$//')
        if [ -n "$MSG" ]; then
            out "• ${MSG}"
        fi
    done
    out ""
fi

out "Questions or feedback? Drop them here 👇"

if [ "$SAVE_OUTPUT" = true ]; then
    out '```'
    out ""
    out "---"
    out ""
    out "## Notes"
    out "- Generated with: \`./scripts/weekly-summary.sh --save ${START_DATE} ${END_DATE}\`"
    echo "Saved to: $OUTPUT_FILE"
fi
