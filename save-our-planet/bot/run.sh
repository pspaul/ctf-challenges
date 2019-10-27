#!/bin/sh

if [ -z "$TIMEOUT" ]; then
    timeout="10"
fi

url="$1"

#timeout "$TIMEOUT" firefox -P headless -headless "$url"
timeout "$TIMEOUT" python3 /bot.py "$url"
