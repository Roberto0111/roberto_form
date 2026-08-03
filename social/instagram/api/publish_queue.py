#!/usr/bin/env python3
"""Publish the next Radish Studio queue item, once, with an audit trail."""

from __future__ import annotations

import argparse
from datetime import datetime, timezone
import fcntl
import json
from pathlib import Path
import re
import subprocess
import sys
from typing import Any
from zoneinfo import ZoneInfo


HERE = Path(__file__).resolve().parent
SOCIAL_DIR = HERE.parent
QUEUE_FILE = HERE / "queue.json"
STATE_DIR = HERE / "state"
LOG_DIR = HERE / "logs"
LOCK_FILE = STATE_DIR / "publish.lock"
LOG_FILE = LOG_DIR / "publish.jsonl"
LAST_PUBLISH_FILE = STATE_DIR / "last_publish.json"
EXPECTED_ACCOUNT = "radish_studio_"
SAFE_ID = re.compile(r"^[A-Za-z0-9._-]+$")
TAIPEI = ZoneInfo("Asia/Taipei")


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def taipei_date() -> str:
    return datetime.now(TAIPEI).date().isoformat()


def append_log(event: dict[str, Any]) -> None:
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    with LOG_FILE.open("a", encoding="utf-8") as log_file:
        log_file.write(json.dumps(event, ensure_ascii=False) + "\n")


def load_queue() -> list[dict[str, Any]]:
    raw = json.loads(QUEUE_FILE.read_text(encoding="utf-8"))
    if raw.get("account") != EXPECTED_ACCOUNT:
        raise RuntimeError(
            f"Queue account must be {EXPECTED_ACCOUNT}, got {raw.get('account') or 'missing'}"
        )
    posts = raw.get("posts")
    if not isinstance(posts, list):
        raise RuntimeError("queue.json must contain a posts array")
    seen: set[str] = set()
    for post in posts:
        if not isinstance(post, dict):
            raise RuntimeError("Every queue post must be an object")
        post_id = str(post.get("id") or "")
        if not SAFE_ID.fullmatch(post_id):
            raise RuntimeError(f"Unsafe or empty queue post id: {post_id!r}")
        if post_id in seen:
            raise RuntimeError(f"Duplicate queue post id: {post_id}")
        seen.add(post_id)
        if post.get("media_type") not in {"image", "reel"}:
            raise RuntimeError(f"Unsupported media_type for {post_id}")
        if not str(post.get("source_url") or "").startswith("https://"):
            raise RuntimeError(f"Post {post_id} requires a public HTTPS source_url")
    return posts


def next_pending(posts: list[dict[str, Any]]) -> dict[str, Any] | None:
    for post in posts:
        post_id = str(post["id"])
        if post.get("enabled", True) and not (STATE_DIR / f"{post_id}.json").exists():
            return post
    return None


def caption_path(post: dict[str, Any]) -> Path:
    relative = Path(str(post.get("caption_file") or ""))
    path = (SOCIAL_DIR / relative).resolve()
    if not path.is_relative_to(SOCIAL_DIR.resolve()):
        raise RuntimeError(f"Caption path escapes the social folder: {relative}")
    if not path.is_file():
        raise RuntimeError(f"Caption file not found: {path}")
    return path


def publisher_command(post: dict[str, Any] | None, *, dry_run: bool) -> list[str]:
    command = [
        sys.executable,
        str(HERE / "publish_instagram.py"),
        "--config",
        str(HERE / "config.toml"),
        "--env-file",
        str(HERE / ".env"),
    ]
    if post is None:
        command.append("--check-token")
        return command

    media_type = str(post["media_type"])
    if media_type == "reel":
        command.extend(["--reel", "--video-url", str(post["source_url"])])
    else:
        command.extend(["--image-url", str(post["source_url"])])
    command.extend(["--caption-file", str(caption_path(post))])
    if dry_run:
        command.append("--dry-run")
    return command


def run_publisher(post: dict[str, Any] | None, *, dry_run: bool) -> dict[str, Any]:
    completed = subprocess.run(
        publisher_command(post, dry_run=dry_run),
        text=True,
        capture_output=True,
        check=False,
    )
    if completed.returncode != 0:
        message = completed.stderr.strip() or completed.stdout.strip() or "Publisher failed"
        raise RuntimeError(message)
    return json.loads(completed.stdout)


def main() -> int:
    parser = argparse.ArgumentParser()
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--check-token", action="store_true")
    mode.add_argument("--dry-run", action="store_true")
    mode.add_argument("--publish-next", action="store_true")
    args = parser.parse_args()

    selected_mode = "check-token" if args.check_token else "dry-run" if args.dry_run else "publish-next"
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    with LOCK_FILE.open("a+", encoding="utf-8") as lock_file:
        fcntl.flock(lock_file.fileno(), fcntl.LOCK_EX)
        post = None if selected_mode == "check-token" else next_pending(load_queue())
        if selected_mode != "check-token" and post is None:
            result = {"skipped": True, "reason": "no_pending_posts"}
            print(json.dumps(result, ensure_ascii=False, indent=2))
            return 0

        if selected_mode == "publish-next" and LAST_PUBLISH_FILE.exists():
            last_publish = json.loads(LAST_PUBLISH_FILE.read_text(encoding="utf-8"))
            if last_publish.get("date_taipei") == taipei_date():
                result = {
                    "skipped": True,
                    "reason": "already_published_today",
                    "post_id": last_publish.get("post_id"),
                    "permalink": last_publish.get("permalink"),
                }
                print(json.dumps(result, ensure_ascii=False, indent=2))
                return 0

        post_id = str(post["id"]) if post else None
        started_at = now_iso()
        try:
            result = run_publisher(post, dry_run=selected_mode == "dry-run")
        except Exception as error:
            append_log(
                {
                    "time": now_iso(),
                    "mode": selected_mode,
                    "post_id": post_id,
                    "status": "failed",
                    "error": str(error),
                }
            )
            raise

        event = {
            "time": now_iso(),
            "started_at": started_at,
            "mode": selected_mode,
            "post_id": post_id,
            "status": "success",
            "result": result,
        }
        append_log(event)
        if selected_mode == "publish-next" and post_id:
            marker = STATE_DIR / f"{post_id}.json"
            temporary = marker.with_suffix(".tmp")
            temporary.write_text(
                json.dumps(event, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )
            temporary.replace(marker)
            daily_state = {
                "date_taipei": taipei_date(),
                "post_id": post_id,
                "media_id": result.get("media_id"),
                "permalink": result.get("permalink"),
                "published_at": event["time"],
            }
            temporary_daily = LAST_PUBLISH_FILE.with_suffix(".tmp")
            temporary_daily.write_text(
                json.dumps(daily_state, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )
            temporary_daily.replace(LAST_PUBLISH_FILE)
        print(json.dumps(event, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as error:
        print(f"Radish queue failed: {error}", file=sys.stderr)
        raise SystemExit(1)
