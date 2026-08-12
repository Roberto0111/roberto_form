# Radish Studio Instagram API

This is the Radish version of the local deployment used by `Robert_joke` and
`roberto__stock`. Credentials, identity checks, state and logs are isolated so
another account's token cannot be used accidentally.

The target is locked to:

- username: `radish_studio_`
- Instagram user ID: `17841466514369754`
- API mode: Instagram Login (`graph.instagram.com`)

## One-time secret setup

Put the Radish token in the ignored `.env` file:

```dotenv
RADISH_IG_ACCESS_TOKEN=your_token_here
```

Never put a Joke, Stock or News token in this file. The publisher still checks
the username returned by Meta and refuses any account except `radish_studio_`.

## Checks and first approved Reel

Run from this folder:

```bash
python3 run_first_reel.py --check-token
python3 run_first_reel.py --dry-run
python3 run_first_reel.py --publish
```

The runner verifies the public media URL, writes structured results under
`logs/`, and creates `state/01-brand-intro.json` after a confirmed publication.
That marker prevents a LaunchAgent retry from publishing the same Reel twice.

## LaunchAgent staging

`com.roberto.radish-studio.plist.example` mirrors the Mac LaunchAgent approach
used by the other projects. It runs at the supported evening windows; the
growth cycle reads `insights/best_time.json` and publishes only after the
account's recommended time. A successful post gets a state marker so retries
cannot duplicate it, and `last_publish.json` limits scheduled publishing to one
post per Taipei calendar day.

The tracked project and the ASCII-path runtime share the runtime lock and state
directory. `deploy_runtime.sh` refreshes the queue and scripts and merges older
per-product markers in both directions. Fresh Instagram insights are also
checked by normalized caption opening before publishing, so a product already
visible on the account is reconciled and skipped even if a local marker was
missing.

The installed LaunchAgent uses the production runtime
`/Users/roberto/Automation/Robert_form`. macOS launchd cannot reliably traverse
the project's protected `Documents` path after login. Run `deploy_runtime.sh`
after changing the tracked publisher code; it updates scripts and captions but
preserves the runtime's `.env`, `config.toml`, state, insights and logs.

Queue checks can be run manually:

```bash
python3 publish_queue.py --check-token
python3 publish_queue.py --dry-run
python3 publish_queue.py --publish-next
```

Add `StartCalendarInterval` only after a posting time is chosen. New product
posts can be appended to `queue.json` once their public image or Reel URL and
caption file are ready.

## Daily growth monitoring

`collect_insights.py` records account and media performance under the ignored
`insights/` folder. It tracks followers, views, reach, interactions, link taps,
shares, saves, watch time and Reel skip rate when Meta makes the metric
available. It also writes `daily_strategy.json` and `daily_strategy.md`. The
publisher uses those files to select a pending product and adapt the CTA. The
initial posting time is 20:30 Asia/Taipei; timing and content priority become
data-driven only after at least five measurable posts.

```bash
./run_daily_monitor.sh
./run_daily_growth_cycle.sh
```

The growth cycle checks insights first and publishes at most one queued post
plus its matching Story per Taipei calendar day. Captions use a specific DM
keyword so inquiries can be attributed to the Reel that generated them.
