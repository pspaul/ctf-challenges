#!/bin/sh

target="$1"

# nobody can escape the minijail!?
/usr/bin/minijail0 -n -S /app/minijail-seccomp.policy "$target"
