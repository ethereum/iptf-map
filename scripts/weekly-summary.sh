#!/bin/bash
# Weekly summary generator for IPTF Map
# Outputs markdown suitable for TG/Twitter

set -e

# Default to last 7 days
START_DATE="${1:-$(date -v-7d +%Y-%m-%d 2>/dev/null || date -d '7 days ago' +%Y-%m-%d)}"
END_DATE="${2:-$(date +%Y-%m-%d)}"

REPO_URL="https://github.com/ethereum/iptf-map/blob/master"

format_date() {
    date -j -f %Y-%m-%d "$1" +"%b %d" 2>/dev/null || date -d "$1" +"%b %d"
}

echo "IPTF Map Weekly Update ($(format_date "$START_DATE") - $(format_date "$END_DATE"))"
echo ""

# Get commits in date range
COMMITS=$(git log --since="$START_DATE" --until="$END_DATE 23:59:59" --oneline --no-merges 2>/dev/null || true)

if [ -z "$COMMITS" ]; then
    echo "No changes in this period."
    exit 0
fi

# Extract new patterns (feat commits with pattern in scope)
PATTERN_COMMITS=$(echo "$COMMITS" | grep -E "feat\(pattern" || true)
if [ -n "$PATTERN_COMMITS" ]; then
    echo "New patterns:"
    echo "$PATTERN_COMMITS" | while read -r line; do
        # Extract the pattern name from message
        NAME=$(echo "$line" | sed 's/^[a-f0-9]* //' | sed 's/feat(patterns): add //' | sed 's/ pattern.*//' | sed 's/ (#[0-9]*)$//')
        SLUG=$(echo "$NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')

        # Check if file exists
        if [ -f "patterns/pattern-${SLUG}.md" ]; then
            echo "- [${NAME}](patterns/pattern-${SLUG}.md)"
        else
            echo "- ${NAME}"
        fi
    done
    echo ""
fi

# Extract new vendors
VENDOR_COMMITS=$(echo "$COMMITS" | grep -E "feat\(vendor" || true)
if [ -n "$VENDOR_COMMITS" ]; then
    echo "New vendors:"
    echo "$VENDOR_COMMITS" | while read -r line; do
        NAME=$(echo "$line" | sed 's/^[a-f0-9]* //' | sed 's/feat(vendor): //' | sed 's/ (#[0-9]*)$//')
        SLUG=$(echo "$NAME" | tr '[:upper:]' '[:lower:]')

        if [ -f "vendors/${SLUG}.md" ]; then
            echo "- [${NAME}](vendors/${SLUG}.md)"
        else
            echo "- ${NAME}"
        fi
    done
    echo ""
fi

# Extract improvements (fix, docs, chore - excluding pattern/vendor additions)
OTHER_COMMITS=$(echo "$COMMITS" | grep -vE "feat\((pattern|vendor)" | head -5 || true)
if [ -n "$OTHER_COMMITS" ]; then
    echo "Improvements:"
    echo "$OTHER_COMMITS" | while read -r line; do
        MSG=$(echo "$line" | sed 's/^[a-f0-9]* //' | sed 's/^[a-z]*([^)]*): //' | sed 's/^[a-z]*: //' | sed 's/ (#[0-9]*)$//')
        if [ -n "$MSG" ]; then
            echo "- ${MSG}"
        fi
    done
    echo ""
fi

echo "Full changelog: ${REPO_URL}/CHANGELOG.md"
