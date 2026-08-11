#!/bin/zsh
set -euo pipefail

SOURCE_ROOT="${0:A:h}"
SOCIAL_ROOT="${SOURCE_ROOT:h}"
RUNTIME_ROOT="/Users/roberto/Automation/Robert_form/social/instagram"
RUNTIME_API="${RUNTIME_ROOT}/api"

mkdir -p "$RUNTIME_API" "${RUNTIME_ROOT}/launch-grid"

for file in \
  README.md \
  collect_insights.py \
  publish_instagram.py \
  publish_queue.py \
  queue.json \
  run_daily_growth_cycle.sh \
  run_daily_monitor.sh \
  run_first_reel.py \
  run_radish_instagram.sh \
  com.roberto.radish-studio.plist.example \
  config.toml.example \
  .env.example
do
  cp "${SOURCE_ROOT}/${file}" "${RUNTIME_API}/${file}"
done

for caption in "${SOCIAL_ROOT}"/launch-grid/*-caption.txt; do
  cp "$caption" "${RUNTIME_ROOT}/launch-grid/"
done

chmod +x "$RUNTIME_API"/*.sh "$RUNTIME_API"/*.py
print "Robert Form Instagram runtime updated: ${RUNTIME_ROOT}"
print "Local .env, config.toml, state, insights and logs were preserved."
