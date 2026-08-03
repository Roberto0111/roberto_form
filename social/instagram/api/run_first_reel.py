#!/usr/bin/env python3
"""Run the approved Radish Studio launch Reel with duplicate protection."""

from __future__ import annotations

import argparse
from datetime import datetime, timezone
import fcntl
import json
from pathlib import Path
import subprocess
import sys
from typing import Any


HERE = Path(__file__).resolve().parent
SOCIAL_DIR = HERE.parent
CAPTION_FILE = SOCIAL_DIR / "launch-grid" / "01-brand-intro-caption.txt"
PUBLIC_REEL_URL = (
    "https://form24-maker-catalog.robertolopolun.chatgpt.site/"
    "social/instagram/01-brand-intro-reel.mp4"
)
STATE_DIR = HERE / "state"
LOG_DIR = HERE / "logs"
MARKER_FILE = STATE_DIR / "01-brand-intro.json"
LOCK_FILE = STATE_DIR / "publish.lock"
LOG_FILE = LOG_DIR / "publish.jsonl"


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def append_log(event: dict[str, Any]) -> None:
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    with LOG_FILE.open("a", encoding="utf-8") as log_file:
        log_file.write(json.dumps(event, ensure_ascii=False) + "\n")


def run_publisher(mode: str) -> dict[str, Any]:
    command = [
        sys.executable,
        str(HERE / "publish_instagram.py"),
        "--config",
        str(HERE / "config.toml"),
        "--env-file",
        str(HERE / ".env"),
    ]
    if mode == "check-token":
        command.append("--check-token")
    else:
        command.extend(
            [
                "--reel",
                "--video-url",
                PUBLIC_REEL_URL,
                "--caption-file",
                str(CAPTION_FILE),
            ]
        )
        if mode == "dry-run":
            command.append("--dry-run")

    completed = subprocess.run(command, text=True, capture_output=True, check=False)
    if completed.returncode != 0:
        message = completed.stderr.strip() or completed.stdout.strip() or "Publisher failed"
        raise RuntimeError(message)
    return json.loads(completed.stdout)


def main() -> int:
    parser = argparse.ArgumentParser()
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--check-token", action="store_true")
    mode.add_argument("--dry-run", action="store_true")
    mode.add_argument("--publish", action="store_true")
    args = parser.parse_args()

    selected_mode = "check-token" if args.check_token else "dry-run" if args.dry_run else "publish"
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    with LOCK_FILE.open("a+", encoding="utf-8") as lock_file:
        fcntl.flock(lock_file.fileno(), fcntl.LOCK_EX)
        if selected_mode == "publish" and MARKER_FILE.exists():
            previous = json.loads(MARKER_FILE.read_text(encoding="utf-8"))
            print(
                json.dumps(
                    {
                        "skipped": True,
                        "reason": "already_published",
                        "previous": previous,
                    },
                    ensure_ascii=False,
                    indent=2,
                )
            )
            return 0

        started_at = now_iso()
        try:
            result = run_publisher(selected_mode)
        except Exception as error:
            append_log(
                {
                    "time": now_iso(),
                    "mode": selected_mode,
                    "status": "failed",
                    "error": str(error),
                }
            )
            raise

        event = {
            "time": now_iso(),
            "started_at": started_at,
            "mode": selected_mode,
            "status": "success",
            "result": result,
        }
        append_log(event)
        if selected_mode == "publish":
            temporary_marker = MARKER_FILE.with_suffix(".tmp")
            temporary_marker.write_text(
                json.dumps(event, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )
            temporary_marker.replace(MARKER_FILE)
        print(json.dumps(event, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as error:
        print(f"Radish launch Reel failed: {error}", file=sys.stderr)
        raise SystemExit(1)
