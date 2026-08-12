#!/usr/bin/env python3
"""Publish the next Radish Studio queue item, once, with an audit trail."""

from __future__ import annotations

import argparse
from datetime import datetime, timezone
import fcntl
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import unicodedata
from typing import Any
from zoneinfo import ZoneInfo


HERE = Path(__file__).resolve().parent
SOCIAL_DIR = HERE.parent
QUEUE_FILE = HERE / "queue.json"
SHARED_RUNTIME_API = Path(
    os.environ.get(
        "RADISH_RUNTIME_API",
        "/Users/roberto/Automation/Robert_form/social/instagram/api",
    )
)
STATE_DIR = SHARED_RUNTIME_API / "state"
LOG_DIR = SHARED_RUNTIME_API / "logs"
LOCK_FILE = STATE_DIR / "publish.lock"
LOG_FILE = LOG_DIR / "publish.jsonl"
LAST_PUBLISH_FILE = STATE_DIR / "last_publish.json"
STRATEGY_FILE = HERE / "insights" / "daily_strategy.json"
INSIGHTS_FILE = HERE / "insights" / "latest.json"
ADAPTED_CAPTION_DIR = STATE_DIR / "captions"
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


def load_strategy() -> dict[str, Any]:
    if not STRATEGY_FILE.exists():
        return {}
    try:
        return json.loads(STRATEGY_FILE.read_text(encoding="utf-8"))
    except (OSError, ValueError, TypeError):
        return {}


def caption_opening(caption: str) -> str:
    for raw_line in caption.splitlines():
        line = unicodedata.normalize("NFKC", raw_line).strip()
        if line and not line.startswith("#"):
            return re.sub(r"\s+", "", line)
    return ""


def remote_post_matches(posts: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    try:
        report = json.loads(INSIGHTS_FILE.read_text(encoding="utf-8"))
    except (OSError, ValueError, TypeError):
        return {}
    remote_by_opening: dict[str, dict[str, Any]] = {}
    for media in report.get("media") or []:
        opening = caption_opening(str(media.get("caption") or ""))
        if len(opening) >= 12:
            remote_by_opening.setdefault(opening, media)

    matches = {}
    for post in posts:
        post_id = str(post["id"])
        if (STATE_DIR / f"{post_id}.json").exists():
            continue
        try:
            opening = caption_opening(caption_path(post).read_text(encoding="utf-8"))
        except OSError:
            continue
        if len(opening) >= 12 and opening in remote_by_opening:
            matches[post_id] = remote_by_opening[opening]
    return matches


def write_remote_reconciliation(matches: dict[str, dict[str, Any]]) -> None:
    for post_id, media in matches.items():
        marker = STATE_DIR / f"{post_id}.json"
        if marker.exists():
            continue
        event = {
            "time": now_iso(),
            "mode": "remote-reconciliation",
            "post_id": post_id,
            "status": "reconciled_existing_remote",
            "result": {
                "media_id": media.get("id"),
                "permalink": media.get("permalink"),
                "timestamp": media.get("timestamp"),
            },
        }
        temporary = marker.with_suffix(".tmp")
        temporary.write_text(json.dumps(event, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        temporary.replace(marker)
        append_log(event)


def pending_posts(
    posts: list[dict[str, Any]],
    remote_matches: dict[str, dict[str, Any]] | None = None,
) -> list[dict[str, Any]]:
    remote_ids = set((remote_matches or {}).keys())
    return [
        post
        for post in posts
        if post.get("enabled", True)
        and not (STATE_DIR / f"{str(post['id'])}.json").exists()
        and str(post["id"]) not in remote_ids
    ]


def next_pending(
    posts: list[dict[str, Any]],
    strategy: dict[str, Any],
    remote_matches: dict[str, dict[str, Any]] | None = None,
) -> dict[str, Any] | None:
    pending = pending_posts(posts, remote_matches)
    if not pending:
        return None
    priorities = [str(item) for item in strategy.get("priority_post_ids") or []]
    by_id = {str(post["id"]): post for post in pending}
    for post_id in priorities:
        if post_id in by_id:
            return by_id[post_id]
    return pending[0]


def caption_path(post: dict[str, Any]) -> Path:
    relative = Path(str(post.get("caption_file") or ""))
    path = (SOCIAL_DIR / relative).resolve()
    if not path.is_relative_to(SOCIAL_DIR.resolve()):
        raise RuntimeError(f"Caption path escapes the social folder: {relative}")
    if not path.is_file():
        raise RuntimeError(f"Caption file not found: {path}")
    return path


def effective_caption_path(post: dict[str, Any], strategy: dict[str, Any]) -> Path:
    original = caption_path(post)
    cta_mode = str(strategy.get("format_settings", {}).get("cta") or "dm_keyword")
    if cta_mode == "dm_keyword":
        return original

    caption = original.read_text(encoding="utf-8").strip()
    lines = caption.splitlines()
    hashtag_index = next(
        (index for index, line in enumerate(lines) if line.lstrip().startswith("#")),
        len(lines),
    )
    if cta_mode == "share":
        cta = "傳給最近正在整理空間、找客製禮物，或剛好需要這個解法的人。"
    else:
        cta = "先收藏，量尺寸或整理需求時再回來看。"
    body = lines[:hashtag_index]
    hashtags = lines[hashtag_index:]
    adapted = "\n".join([*body, "", cta, "", *hashtags]).strip() + "\n"
    ADAPTED_CAPTION_DIR.mkdir(parents=True, exist_ok=True)
    output = ADAPTED_CAPTION_DIR / f"{post['id']}.txt"
    output.write_text(adapted, encoding="utf-8")
    return output


def publisher_command(
    post: dict[str, Any] | None,
    *,
    dry_run: bool,
    strategy: dict[str, Any],
    story: bool = False,
) -> list[str]:
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
    if story:
        source_option = "--video-url" if media_type == "reel" else "--image-url"
        command.extend(["--story", source_option, str(post["source_url"])])
    elif media_type == "reel":
        command.extend(["--reel", "--video-url", str(post["source_url"])])
    else:
        command.extend(["--image-url", str(post["source_url"])])
    command.extend(["--caption-file", str(effective_caption_path(post, strategy))])
    if dry_run:
        command.append("--dry-run")
    return command


def run_publisher(
    post: dict[str, Any] | None,
    *,
    dry_run: bool,
    strategy: dict[str, Any],
    story: bool = False,
) -> dict[str, Any]:
    completed = subprocess.run(
        publisher_command(post, dry_run=dry_run, strategy=strategy, story=story),
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
    parser.add_argument(
        "--allow-same-day",
        action="store_true",
        help="Manual-only override after an explicit same-day publish request",
    )
    args = parser.parse_args()

    selected_mode = "check-token" if args.check_token else "dry-run" if args.dry_run else "publish-next"
    if args.allow_same_day and selected_mode != "publish-next":
        raise RuntimeError("--allow-same-day can only be used with --publish-next")
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    with LOCK_FILE.open("a+", encoding="utf-8") as lock_file:
        fcntl.flock(lock_file.fileno(), fcntl.LOCK_EX)
        strategy = load_strategy()
        posts = [] if selected_mode == "check-token" else load_queue()
        remote_matches = {} if selected_mode == "check-token" else remote_post_matches(posts)
        if selected_mode == "publish-next":
            write_remote_reconciliation(remote_matches)
        post = (
            None
            if selected_mode == "check-token"
            else next_pending(posts, strategy, remote_matches)
        )
        if selected_mode != "check-token" and post is None:
            result = {"skipped": True, "reason": "no_pending_posts"}
            print(json.dumps(result, ensure_ascii=False, indent=2))
            return 0

        if (
            selected_mode == "publish-next"
            and not args.allow_same_day
            and LAST_PUBLISH_FILE.exists()
        ):
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
            result = run_publisher(
                post,
                dry_run=selected_mode == "dry-run",
                strategy=strategy,
            )
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

        story_error = ""
        if result.get("skipped"):
            result["story"] = {
                "status": "skipped",
                "reason": "feed_duplicate_was_not_republished",
            }
        else:
            try:
                story_result = run_publisher(
                    post,
                    dry_run=selected_mode == "dry-run",
                    strategy=strategy,
                    story=True,
                )
                result["story"] = {
                    "status": "dry_run" if selected_mode == "dry-run" else "published",
                    **story_result,
                }
            except Exception as error:
                story_error = str(error)[:800]
                result["story"] = {"status": "failed", "error": story_error}

        event = {
            "time": now_iso(),
            "started_at": started_at,
            "mode": selected_mode,
            "same_day_override": bool(args.allow_same_day),
            "post_id": post_id,
            "growth_strategy": strategy.get("format_settings", {}),
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
                "story_media_id": result.get("story", {}).get("media_id"),
                "story_status": result.get("story", {}).get("status"),
                "story_error": story_error,
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
