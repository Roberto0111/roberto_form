#!/usr/bin/env python3
"""Publish Radish Studio media through Meta's Instagram API."""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import time
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode, urlparse
from urllib.request import Request, urlopen

try:
    import tomllib
except ModuleNotFoundError:  # pragma: no cover - Python 3.10 fallback
    import tomli as tomllib  # type: ignore


EXPECTED_USERNAME = "radish_studio_"


def load_env(path: Path) -> None:
    """Load a small local .env file without overwriting the process environment."""
    if not path.exists():
        return
    for line_number, raw_line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith("export "):
            line = line[7:].strip()
        if "=" not in line:
            raise RuntimeError(f"Invalid .env entry at {path}:{line_number}")
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in {"'", '"'}:
            value = value[1:-1]
        if not key:
            raise RuntimeError(f"Empty .env key at {path}:{line_number}")
        os.environ.setdefault(key, value)


def load_config(path: Path, section: str) -> dict[str, Any]:
    if not path.exists():
        raise RuntimeError(f"Config not found: {path}")
    with path.open("rb") as config_file:
        config = tomllib.load(config_file)
    section_data = config.get(section)
    if not isinstance(section_data, dict):
        raise RuntimeError(f"Missing [{section}] section in {path}")
    return section_data


def get_token(config: dict[str, Any]) -> str:
    if config.get("access_token"):
        return str(config["access_token"]).strip()
    env_name = str(config.get("access_token_env") or "RADISH_IG_ACCESS_TOKEN")
    token = os.environ.get(env_name, "").strip()
    if not token:
        raise RuntimeError(f"Instagram token missing; set {env_name}")
    return token


def verify_public_media(url: str, expected_kind: str) -> dict[str, Any]:
    parsed = urlparse(url)
    if parsed.scheme != "https" or not parsed.netloc:
        raise RuntimeError("Instagram media must use a public HTTPS URL")

    request = Request(
        url,
        headers={
            "Range": "bytes=0-1023",
            "User-Agent": "RadishStudioPublisher/1.0",
        },
        method="GET",
    )
    try:
        with urlopen(request, timeout=60) as response:
            content_type = str(response.headers.get_content_type() or "").lower()
            content_length = response.headers.get("Content-Length")
            response.read(1024)
            status = int(getattr(response, "status", 200))
    except HTTPError as error:
        raise RuntimeError(f"Public media URL returned HTTP {error.code}") from error
    except URLError as error:
        raise RuntimeError(f"Public media URL is unreachable: {error.reason}") from error

    expected_prefix = "video/" if expected_kind == "video" else "image/"
    if not content_type.startswith(expected_prefix):
        raise RuntimeError(
            f"Public media has Content-Type {content_type or 'unknown'}; "
            f"expected {expected_prefix}*"
        )
    return {
        "url": url,
        "http_status": status,
        "content_type": content_type,
        "content_length": int(content_length) if content_length and content_length.isdigit() else None,
    }


def api_request(
    method: str,
    url: str,
    *,
    token: str,
    params: dict[str, Any] | None = None,
    timeout: int = 60,
) -> dict[str, Any]:
    payload = {key: str(value) for key, value in (params or {}).items() if value is not None}
    payload["access_token"] = token
    body = urlencode(payload).encode("utf-8") if method == "POST" else None
    if method == "GET":
        url = f"{url}?{urlencode(payload)}"
    request = Request(url, data=body, method=method)
    try:
        with urlopen(request, timeout=timeout) as response:
            return json.load(response)
    except HTTPError as error:
        raw = error.read().decode("utf-8", errors="replace")
        try:
            parsed = json.loads(raw)
            meta_error = parsed.get("error") or {}
            safe = {
                key: meta_error.get(key)
                for key in (
                    "message",
                    "type",
                    "code",
                    "error_subcode",
                    "error_user_title",
                    "error_user_msg",
                    "fbtrace_id",
                )
                if meta_error.get(key) is not None
            }
            detail = json.dumps(safe, ensure_ascii=False) if safe else raw[:500]
        except ValueError:
            detail = raw[:500]
        raise RuntimeError(f"Meta API returned HTTP {error.code}: {detail}") from error
    except URLError as error:
        raise RuntimeError(f"Meta API connection failed: {error.reason}") from error


def verify_identity(base: str, version: str, user_id: str, token: str) -> dict[str, Any]:
    profile = api_request(
        "GET",
        f"{base}/{version}/{user_id}",
        token=token,
        params={"fields": "id,username,name,account_type,media_count"},
    )
    username = str(profile.get("username") or "")
    if username != EXPECTED_USERNAME:
        raise RuntimeError(
            f"Refusing to publish: token resolves to @{username or 'unknown'}, "
            f"expected @{EXPECTED_USERNAME}."
        )
    return profile


def wait_until_ready(base: str, version: str, container_id: str, token: str) -> None:
    for _ in range(60):
        status = api_request(
            "GET",
            f"{base}/{version}/{container_id}",
            token=token,
            params={"fields": "status_code,status"},
        )
        status_code = str(status.get("status_code") or "")
        if status_code == "FINISHED":
            return
        if status_code in {"ERROR", "EXPIRED"}:
            raise RuntimeError(f"Instagram media processing failed: {status}")
        time.sleep(5)
    raise RuntimeError("Instagram media processing timed out after 5 minutes")


def publish(
    *,
    base: str,
    version: str,
    user_id: str,
    token: str,
    caption: str,
    image_url: str | None,
    video_url: str | None,
    is_reel: bool,
    thumb_offset_ms: int,
    publish_delay_seconds: int,
    dry_run: bool,
) -> dict[str, Any]:
    profile = verify_identity(base, version, user_id, token)
    media_url = f"{base}/{version}/{user_id}/media"
    publish_url = f"{base}/{version}/{user_id}/media_publish"

    if is_reel:
        if not video_url:
            raise RuntimeError("A public --video-url is required for a Reel")
        create_payload = {
            "media_type": "REELS",
            "video_url": video_url,
            "caption": caption,
            "share_to_feed": "true",
            "thumb_offset": max(0, thumb_offset_ms),
        }
    else:
        if not image_url:
            raise RuntimeError("A public --image-url is required for an image post")
        create_payload = {"image_url": image_url, "caption": caption}

    if dry_run:
        return {
            "dry_run": True,
            "username": profile.get("username"),
            "media_url": media_url,
            "media_type": "REELS" if is_reel else "IMAGE",
            "source_url": video_url if is_reel else image_url,
            "caption": caption,
        }

    created = api_request("POST", media_url, token=token, params=create_payload)
    container_id = str(created.get("id") or "")
    if not container_id:
        raise RuntimeError("Meta API did not return a media container ID")

    if is_reel:
        wait_until_ready(base, version, container_id, token)
    elif publish_delay_seconds:
        time.sleep(publish_delay_seconds)

    published = api_request(
        "POST",
        publish_url,
        token=token,
        params={"creation_id": container_id},
    )
    media_id = str(published.get("id") or "")
    if not media_id:
        raise RuntimeError("Meta API did not return a published media ID")

    recent = api_request(
        "GET",
        f"{base}/{version}/{user_id}/media",
        token=token,
        params={"fields": "id,media_type,media_product_type,permalink,timestamp", "limit": 25},
    )
    match = next((item for item in recent.get("data", []) if str(item.get("id")) == media_id), None)
    if not match:
        raise RuntimeError(f"Published media {media_id} was not found in the recent feed")
    return {
        "username": profile.get("username"),
        "media_id": media_id,
        "permalink": match.get("permalink"),
        "media_type": match.get("media_type"),
        "timestamp": match.get("timestamp"),
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", type=Path, default=Path(__file__).with_name("config.toml"))
    parser.add_argument("--env-file", type=Path, default=Path(__file__).with_name(".env"))
    parser.add_argument("--config-section", default="instagram")
    parser.add_argument("--caption")
    parser.add_argument("--caption-file", type=Path)
    parser.add_argument("--image-url")
    parser.add_argument("--video-url")
    parser.add_argument("--reel", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--check-token", action="store_true")
    args = parser.parse_args()

    load_env(args.env_file)
    config = load_config(args.config, args.config_section)
    if config.get("enabled") is False and not args.dry_run and not args.check_token:
        raise RuntimeError(f"[{args.config_section}] is disabled")

    user_id = str(config.get("ig_user_id") or "").strip()
    if not user_id:
        raise RuntimeError(f"Missing [{args.config_section}].ig_user_id")
    token = get_token(config)
    base = str(config.get("api_base_url") or "https://graph.instagram.com").rstrip("/")
    version = str(config.get("api_version") or "v23.0")

    if args.check_token:
        profile = verify_identity(base, version, user_id, token)
        print(json.dumps({"valid": True, "profile": profile}, ensure_ascii=False, indent=2))
        return 0

    caption = str(args.caption or "")
    if args.caption_file:
        caption = args.caption_file.read_text(encoding="utf-8").strip()
    if not caption:
        raise RuntimeError("Caption is empty")

    source_url = args.video_url if args.reel else args.image_url
    if not source_url:
        option = "--video-url" if args.reel else "--image-url"
        raise RuntimeError(f"Missing public media URL; use {option}")
    media_check = verify_public_media(source_url, "video" if args.reel else "image")

    result = publish(
        base=base,
        version=version,
        user_id=user_id,
        token=token,
        caption=caption,
        image_url=args.image_url,
        video_url=args.video_url,
        is_reel=args.reel,
        thumb_offset_ms=int(config.get("reel_thumb_offset_ms", 1200)),
        publish_delay_seconds=int(config.get("publish_delay_seconds", 5)),
        dry_run=args.dry_run,
    )
    result["media_check"] = media_check
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as error:
        print(f"Instagram publish failed: {error}", file=os.sys.stderr)
        raise SystemExit(1)
