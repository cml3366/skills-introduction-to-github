#!/usr/bin/env python3
from __future__ import annotations

import sys
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile


def should_skip(path: Path, repo_root: Path, archive_path: Path) -> bool:
    rel = path.relative_to(repo_root).as_posix()
    if rel.startswith(".git/"):
        return True
    if rel.endswith(".zip"):
        return True
    if rel.startswith("node_modules/"):
        return True
    if path == archive_path:
        return True
    return False


def main() -> int:
    repo_root = Path(__file__).resolve().parent.parent
    archive_path = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else repo_root / "free-naming-agent-local.zip"

    with ZipFile(archive_path, "w", compression=ZIP_DEFLATED) as archive:
        for path in repo_root.rglob("*"):
            if path.is_dir() or should_skip(path, repo_root, archive_path):
                continue
            archive.write(path, path.relative_to(repo_root))

    print(f"Archive created at: {archive_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
