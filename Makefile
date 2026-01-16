# IPTF Map - Local Validation Commands
# Run these before pushing to catch issues early

.PHONY: help install validate lint check marketing-check

help:
	@echo "IPTF Map Validation Commands"
	@echo ""
	@echo "  make install    - Install dependencies"
	@echo "  make validate   - Run pattern validation"
	@echo "  make lint       - Run markdown linting"
	@echo "  make check      - Run all checks (validate + lint)"
	@echo "  make marketing-check - Check for marketing language"
	@echo ""

install:
	cd scripts && npm install

validate:
	node scripts/validate-patterns.js

lint:
	@echo "Running markdownlint..."
	@npx markdownlint-cli2 "patterns/*.md" "approaches/*.md" "use-cases/*.md" "vendors/*.md" 2>/dev/null || echo "Install markdownlint-cli2: npm install -g markdownlint-cli2"

marketing-check:
	@echo "Checking for marketing language..."
	@MARKETING_WORDS="best|leading|superior|unmatched|revolutionary|cutting-edge|world-class|industry-leading|state-of-the-art|groundbreaking|innovative|seamless|robust|scalable|enterprise-grade|next-generation|unique|only|first|fastest|most secure|unparalleled|comprehensive|end-to-end|one-stop|game-changing|disruptive|bleeding-edge|turnkey|holistic|best-in-class|market-leading|unrivaled|premier|top-tier|ultimate|unprecedented"; \
	if grep -r -i -E "($$MARKETING_WORDS)" vendors/*.md patterns/*.md approaches/*.md 2>/dev/null | grep -v "_template.md"; then \
		echo ""; \
		echo "⚠️  Found potential marketing language. Review and use neutral terms."; \
	else \
		echo "✅ No marketing language detected"; \
	fi

check: validate lint marketing-check
	@echo ""
	@echo "✅ All checks complete"
