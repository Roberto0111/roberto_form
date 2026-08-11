#!/usr/bin/env python3
"""Collect Radish Studio account and media insights without exposing credentials."""

from __future__ import annotations

import argparse
from collections import defaultdict
from datetime import datetime, timedelta, timezone
import importlib.util
import json
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo


HERE = Path(__file__).resolve().parent
INSIGHTS_DIR = HERE / "insights"
TAIPEI = ZoneInfo("Asia/Taipei")
DEFAULT_POSTING_TIME = "20:30"
ACCOUNT_METRICS = (
    "reach,views,total_interactions,accounts_engaged,profile_links_taps"
)
REEL_METRICS = (
    "views",
    "reach",
    "likes",
    "comments",
    "saved",
    "shares",
    "total_interactions",
    "ig_reels_video_view_total_time",
    "ig_reels_avg_watch_time",
    "reels_skip_rate",
)
FEED_METRICS = (
    "views",
    "reach",
    "likes",
    "comments",
    "saved",
    "shares",
    "total_interactions",
)


def load_publisher():
    path = HERE / "publish_instagram.py"
    spec = importlib.util.spec_from_file_location("radish_publish", path)
    if spec is None or spec.loader is None:
        raise RuntimeError("Unable to load Instagram publisher")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def metric_value(item: dict[str, Any]) -> int | float | None:
    total_value = item.get("total_value")
    if isinstance(total_value, dict) and isinstance(total_value.get("value"), (int, float)):
        return total_value["value"]
    values = item.get("values")
    if isinstance(values, list) and values:
        value = values[0].get("value") if isinstance(values[0], dict) else None
        if isinstance(value, (int, float)):
            return value
    return None


def fetch_media_metrics(
    publisher: Any,
    *,
    base: str,
    version: str,
    token: str,
    media: dict[str, Any],
) -> tuple[dict[str, int | float], list[str]]:
    media_id = str(media["id"])
    names = REEL_METRICS if media.get("media_product_type") == "REELS" else FEED_METRICS
    metrics: dict[str, int | float] = {}
    unavailable: list[str] = []
    for name in names:
        try:
            response = publisher.api_request(
                "GET",
                f"{base}/{version}/{media_id}/insights",
                token=token,
                params={"metric": name},
            )
        except RuntimeError:
            unavailable.append(name)
            continue
        for item in response.get("data", []):
            value = metric_value(item)
            if value is not None:
                metrics[str(item.get("name") or name)] = value
    return metrics, unavailable


def previous_snapshot(today_path: Path) -> dict[str, Any] | None:
    candidates = sorted(
        path for path in INSIGHTS_DIR.glob("????-??-??.json") if path != today_path
    )
    if not candidates:
        return None
    return json.loads(candidates[-1].read_text(encoding="utf-8"))


def choose_posting_time(media_rows: list[dict[str, Any]]) -> dict[str, Any]:
    scored: list[tuple[int, float]] = []
    for row in media_rows:
        metrics = row.get("insights") or {}
        views = float(metrics.get("views") or 0)
        reach = float(metrics.get("reach") or 0)
        interactions = float(metrics.get("total_interactions") or 0)
        if views <= 0 and reach <= 0:
            continue
        timestamp = datetime.fromisoformat(str(row["timestamp"]).replace("Z", "+00:00"))
        hour = timestamp.astimezone(TAIPEI).hour
        scored.append((hour, views + reach + interactions * 5))

    if len(scored) < 5:
        return {
            "time": DEFAULT_POSTING_TIME,
            "basis": "starter_evening_window",
            "sample_size": len(scored),
            "minimum_sample_size": 5,
        }

    hourly: dict[int, list[float]] = defaultdict(list)
    for hour, score in scored:
        hourly[hour].append(score)
    best_hour = max(hourly, key=lambda hour: sum(hourly[hour]) / len(hourly[hour]))
    best_hour = min(22, max(19, best_hour))
    return {
        "time": f"{best_hour:02d}:30",
        "basis": "account_media_performance",
        "sample_size": len(scored),
        "minimum_sample_size": 5,
    }


def media_summary(media_rows: list[dict[str, Any]]) -> dict[str, float | int]:
    measurable = [
        row
        for row in media_rows
        if float(row.get("insights", {}).get("views") or 0) > 0
        or float(row.get("insights", {}).get("reach") or 0) > 0
    ]
    totals = {
        name: sum(float(row.get("insights", {}).get(name) or 0) for row in measurable)
        for name in ("views", "reach", "saved", "shares", "total_interactions")
    }
    watch_times = [
        float(row.get("insights", {}).get("ig_reels_avg_watch_time") or 0)
        for row in measurable
        if float(row.get("insights", {}).get("ig_reels_avg_watch_time") or 0) > 0
    ]
    reach = totals["reach"]
    return {
        "samples": len(measurable),
        "avg_views": totals["views"] / len(measurable) if measurable else 0,
        "avg_reach": reach / len(measurable) if measurable else 0,
        "interaction_rate": totals["total_interactions"] / reach if reach else 0,
        "share_rate": totals["shares"] / reach if reach else 0,
        "save_rate": totals["saved"] / reach if reach else 0,
        "avg_watch_time_ms": sum(watch_times) / len(watch_times) if watch_times else 0,
    }


def build_growth_strategy(snapshot: dict[str, Any]) -> dict[str, Any]:
    stats = media_summary(snapshot["media"])
    account = snapshot.get("account_insights", {})
    settings: dict[str, Any] = {
        "hook_seconds": 2.0,
        "target_seconds": 10,
        "cta": "dm_keyword",
    }
    priority_post_ids: list[str] = []
    recommendations: list[str] = []

    if stats["samples"] < 5:
        recommendations.append("可量測內容未滿 5 篇；維持原佇列順序與晚間固定發布，不因單篇數據換風格。")
        recommendations.append("每篇保留一個可歸因的私訊關鍵字，先建立詢問與成交基準。")
    else:
        if 0 < stats["avg_watch_time_ms"] < 3000:
            settings["hook_seconds"] = 1.5
            settings["target_seconds"] = 8
            recommendations.append("平均觀看時間偏短；下一支在 1.5 秒內先展示完成品與用途。")
        if stats["share_rate"] < 0.005:
            settings["cta"] = "share"
            priority_post_ids.extend(
                ["04-desk-organizer", "08-chair-sand-adaptors", "07-custom-luggage-tags"]
            )
            recommendations.append("分享率偏低；優先發布能直接解決日常問題的產品，結尾改成轉傳型 CTA。")
        if stats["save_rate"] < 0.01:
            priority_post_ids.extend(["09-custom-process", "07-custom-luggage-tags"])
            recommendations.append("收藏率偏低；優先尺寸、流程與客製步驟明確的內容。")
        if float(account.get("profile_links_taps") or 0) == 0:
            settings["cta"] = "dm_keyword"
            recommendations.append("近 7 日連結點擊仍為 0；保留具體私訊關鍵字，避免只寫抽象品牌文案。")

    return {
        "updated_at": snapshot["collected_at"],
        "account": snapshot["profile"].get("username"),
        "stats": stats,
        "recommended_posting_time": snapshot["recommended_posting_time"],
        "format_settings": settings,
        "priority_post_ids": list(dict.fromkeys(priority_post_ids)),
        "recommendations": recommendations,
    }


def render_strategy(strategy: dict[str, Any]) -> str:
    settings = strategy["format_settings"]
    stats = strategy["stats"]
    lines = [
        "# Robert Form 每日成長策略",
        "",
        f"- 更新：{strategy['updated_at']}",
        f"- 可量測樣本：{stats['samples']}",
        f"- 建議發布時間：{strategy['recommended_posting_time']['time']}",
        f"- 下一篇 CTA：{settings['cta']}",
        f"- 開場目標：{settings['hook_seconds']} 秒",
        "",
        "## 下一篇",
        "",
        *[f"- {item}" for item in strategy["recommendations"]],
        "",
        "## 原則",
        "",
        "- 先看分享、收藏、觀看時間與私訊／連結行為，不以按讚數單獨決策。",
        "- 未滿 5 篇不更換整體視覺系統；產品規格與相容性不得因流量數據改寫。",
        "- 每日最多發布一篇，既有發布標記必須保留。",
        "",
    ]
    return "\n".join(lines)


def render_report(snapshot: dict[str, Any], previous: dict[str, Any] | None) -> str:
    profile = snapshot["profile"]
    followers = int(profile.get("followers_count") or 0)
    previous_followers = (
        int(previous.get("profile", {}).get("followers_count") or 0) if previous else followers
    )
    delta = followers - previous_followers
    rows = snapshot["media"]
    top = max(
        rows,
        key=lambda row: (
            float(row.get("insights", {}).get("views") or 0),
            float(row.get("insights", {}).get("total_interactions") or 0),
        ),
        default=None,
    )
    account = snapshot.get("account_insights", {})
    best = snapshot["recommended_posting_time"]
    lines = [
        f"# Radish Studio 每日成效｜{snapshot['date_taipei']}",
        "",
        f"- 粉絲：{followers}（較上次 {delta:+d}）",
        f"- 近 7 日觀看：{account.get('views', 0)}",
        f"- 近 7 日觸及：{account.get('reach', 0)}",
        f"- 近 7 日互動：{account.get('total_interactions', 0)}",
        f"- 個人檔案／聯絡連結點擊：{account.get('profile_links_taps', 0)}",
        f"- 建議發布時間：台北 {best['time']}（樣本 {best['sample_size']} 篇）",
    ]
    if top:
        metrics = top.get("insights", {})
        lines.extend(
            [
                "",
                "## 目前表現最佳內容",
                "",
                f"- {top.get('permalink')}",
                f"- 觀看 {metrics.get('views', 0)}｜觸及 {metrics.get('reach', 0)}｜互動 {metrics.get('total_interactions', 0)}",
                f"- 收藏 {metrics.get('saved', 0)}｜分享 {metrics.get('shares', 0)}｜前三秒略過率 {metrics.get('reels_skip_rate', '尚無資料')}",
            ]
        )
    lines.extend(
        [
            "",
            "## 經營判讀",
            "",
            "樣本不足時維持晚間固定發布；滿 5 篇後才依帳號自身數據更新建議時段。",
            "內容優先觀察分享、收藏、平均觀看時間與前三秒略過率，並持續使用明確的私訊關鍵字導向訂單。",
            "",
        ]
    )
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=25)
    args = parser.parse_args()

    publisher = load_publisher()
    publisher.load_env(HERE / ".env")
    config = publisher.load_config(HERE / "config.toml", "instagram")
    token = publisher.get_token(config)
    base = str(config.get("api_base_url") or "https://graph.instagram.com").rstrip("/")
    version = str(config.get("api_version") or "v23.0")
    user_id = str(config["ig_user_id"])
    profile = publisher.verify_identity(base, version, user_id, token)
    profile = publisher.api_request(
        "GET",
        f"{base}/{version}/{user_id}",
        token=token,
        params={"fields": "id,username,name,account_type,followers_count,follows_count,media_count"},
    )

    media_response = publisher.api_request(
        "GET",
        f"{base}/{version}/{user_id}/media",
        token=token,
        params={
            "fields": "id,caption,media_type,media_product_type,permalink,timestamp,like_count,comments_count",
            "limit": max(1, min(args.limit, 100)),
        },
    )
    media_rows: list[dict[str, Any]] = []
    for media in media_response.get("data", []):
        metrics, unavailable = fetch_media_metrics(
            publisher,
            base=base,
            version=version,
            token=token,
            media=media,
        )
        media_rows.append({**media, "insights": metrics, "unavailable_metrics": unavailable})

    now = datetime.now(TAIPEI)
    since = int((now - timedelta(days=8)).timestamp())
    until = int(now.timestamp())
    account_response = publisher.api_request(
        "GET",
        f"{base}/{version}/{user_id}/insights",
        token=token,
        params={
            "metric": ACCOUNT_METRICS,
            "period": "day",
            "metric_type": "total_value",
            "since": since,
            "until": until,
        },
    )
    account_metrics = {
        str(item.get("name")): metric_value(item) or 0
        for item in account_response.get("data", [])
    }
    recommendation = choose_posting_time(media_rows)
    snapshot = {
        "collected_at": datetime.now(timezone.utc).isoformat(),
        "date_taipei": now.date().isoformat(),
        "profile": profile,
        "account_insights": account_metrics,
        "recommended_posting_time": recommendation,
        "media": media_rows,
    }

    INSIGHTS_DIR.mkdir(parents=True, exist_ok=True)
    daily_path = INSIGHTS_DIR / f"{snapshot['date_taipei']}.json"
    previous = previous_snapshot(daily_path)
    daily_path.write_text(json.dumps(snapshot, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (INSIGHTS_DIR / "latest.json").write_text(
        json.dumps(snapshot, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    (INSIGHTS_DIR / "best_time.json").write_text(
        json.dumps(recommendation, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    report = render_report(snapshot, previous)
    (INSIGHTS_DIR / "latest-report.md").write_text(report, encoding="utf-8")
    strategy = build_growth_strategy(snapshot)
    (INSIGHTS_DIR / "daily_strategy.json").write_text(
        json.dumps(strategy, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    (INSIGHTS_DIR / "daily_strategy.md").write_text(
        render_strategy(strategy),
        encoding="utf-8",
    )
    print(
        json.dumps(
            {
                "account": profile.get("username"),
                "followers": profile.get("followers_count"),
                "media_count": profile.get("media_count"),
                "recommended_posting_time": recommendation,
                "growth_strategy": strategy["format_settings"],
                "report": str(INSIGHTS_DIR / "latest-report.md"),
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
