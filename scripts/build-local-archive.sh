#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
archive_path="${1:-$repo_root/free-naming-agent-local.zip}"

cd "$repo_root"
zip -r "$archive_path" . \
  -x '.git/*' \
  -x '*.zip' \
  -x 'node_modules/*'

echo "Archive created at: $archive_path"
