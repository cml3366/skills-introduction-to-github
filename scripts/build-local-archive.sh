#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
archive_path="${1:-$repo_root/free-naming-agent-local.zip}"
script_dir="$(cd "$(dirname "$0")" && pwd)"

python3 "$script_dir/build-local-archive.py" "$archive_path"
