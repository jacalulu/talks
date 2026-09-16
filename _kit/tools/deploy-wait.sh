#!/bin/bash
# Wait for the latest production deployment of the talks project to finish.
# Reads the Vercel API (JSON) instead of scraping CLI tables, which go to
# stderr when piped. Prints one line per state change, exits 0 on READY,
# 1 on ERROR/CANCELED, 2 on timeout (default 240s).
cd "/Users/jaclynkonzelmann/Documents/Jaclyn Konzelmann Talks" || exit 3
T=team_6KsvbG9PH4uLe4yxOIe2gKX7; P=prj_MrbT9f06I2Ypc6FX3GIwvayZGgMn
want_sha="$1"; max="${2:-240}"; t0=$(date +%s); last=""
while :; do
  json=$(npx --yes vercel@latest api "/v6/deployments?projectId=$P&teamId=$T&target=production&limit=1" 2>/dev/null)
  read -r state url sha < <(printf '%s' "$json" | python3 -c '
import json,sys
try:
    d=json.load(sys.stdin)["deployments"][0]
    print(d.get("readyState") or d.get("state"), d.get("url"), (d.get("meta") or {}).get("githubCommitSha","")[:7])
except Exception as e: print("UNKNOWN", "-", "-")')
  line="$state $url $sha"
  if [ -n "$want_sha" ] && [ "$sha" != "${want_sha:0:7}" ]; then line="waiting for $want_sha (latest is $sha, $state)"; state=PENDING; fi
  [ "$line" != "$last" ] && { echo "$(date +%H:%M:%S) $line"; last="$line"; }
  case "$state" in READY) exit 0;; ERROR|CANCELED) exit 1;; esac
  [ $(( $(date +%s) - t0 )) -ge "$max" ] && { echo "timeout after ${max}s"; exit 2; }
  sleep 8
done
