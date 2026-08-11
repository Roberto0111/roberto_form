#!/bin/zsh
set -euo pipefail

SCRIPT_DIR="${0:A:h}"
PYTHON_BIN="/opt/anaconda3/bin/python3"

cd "$SCRIPT_DIR"
"$PYTHON_BIN" "$SCRIPT_DIR/collect_insights.py"

TARGET_TIME="$($PYTHON_BIN -c 'import json,pathlib; p=pathlib.Path("insights/best_time.json"); print(json.loads(p.read_text()).get("time", "20:30"))')"
TARGET_HOUR="${TARGET_TIME%%:*}"
CURRENT_HOUR="$(TZ=Asia/Taipei date +%H)"

if (( 10#$CURRENT_HOUR < 10#$TARGET_HOUR )); then
  print "Robert Form growth cycle: waiting for recommended time ${TARGET_TIME}."
  exit 0
fi

exec "$PYTHON_BIN" "$SCRIPT_DIR/publish_queue.py" --publish-next
