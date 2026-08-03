#!/bin/zsh
set -euo pipefail

SCRIPT_DIR="${0:A:h}"
PYTHON_BIN="/opt/anaconda3/bin/python3"

if [[ ! -x "$PYTHON_BIN" ]]; then
  print -u2 "Radish Instagram runner requires $PYTHON_BIN"
  exit 1
fi

exec "$PYTHON_BIN" "$SCRIPT_DIR/publish_queue.py" --publish-next
