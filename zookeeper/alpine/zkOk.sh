#!/usr/bin/env bash
OK=$(curl -s -X GET http://127.0.0.1:8080/commands/stats)
results=$(echo $OK | jq -r .server_stats.server_state)
case "$results" in
  standalone)
           exit 0
           ;;
  follower)
           exit 0
           ;;
  leader)
           exit 0
           ;;
  *)
           exit 1
esac
