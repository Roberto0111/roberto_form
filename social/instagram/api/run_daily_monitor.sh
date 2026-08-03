#!/bin/zsh
set -euo pipefail

SCRIPT_DIR="${0:A:h}"
PYTHON_BIN="/opt/anaconda3/bin/python3"

exec "$PYTHON_BIN" "$SCRIPT_DIR/collect_insights.py"
