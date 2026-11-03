"""Build mindustry-mod-studio.zip and install into Steam Mindustry mods."""
from __future__ import annotations

import shutil
import zipfile
from pathlib import Path

SRC = Path.home() / "OneDrive" / "Desktop" / "Aoen"
STEAM_MODS = Path(r"C:\Program Files (x86)\Steam\steamapps\common\Mindustry\saves\mods")
APP_MODS = Path.home() / "AppData" / "Roaming" / "Mindustry" / "mods"
ZIP_NAME = "mindustry-mod-studio.zip"
SKIP = {"tools", "__pycache__", ".git", "_aoen_backup", "archive", "node_modules"}


def kill_path(p: Path) -> None:
    if not p.exists():
        return
    try:
        if p.is_dir():
            shutil.rmtree(p)
        else:
            p.unlink()
        print("removed", p)
    except OSError as e:
        print("keep/fail", p, e)


def collect_files() -> list[tuple[Path, str]]:
    out: list[tuple[Path, str]] = []
    for path in SRC.rglob("*"):
        if path.is_dir():
            continue
        rel = path.relative_to(SRC)
        if rel.parts and rel.parts[0] in SKIP:
            continue
        if path.suffix.lower() in {".zip", ".pyc"}:
            continue
        out.append((path, "/".join(rel.parts)))
    return out


def build_zip(dest: Path) -> int:
    files = collect_files()
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists():
        dest.unlink()
    with zipfile.ZipFile(dest, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for src, arc in sorted(files, key=lambda x: x[1]):
            zf.write(src, arc)
    return len(files)


def wipe_old() -> None:
    for root in (STEAM_MODS, APP_MODS):
        if not root.exists():
            continue
        for p in list(root.iterdir()):
            n = p.name.lower()
            if n in {"aoen.zip", "aoen", ZIP_NAME.lower(), "mindustry-mod-studio", "mishalindarenka-creatoraoen.zip", "mishalindarenka-creatoraoen1.zip"}:
                kill_path(p)
            if "aoen" in n and n.endswith(".zip"):
                kill_path(p)


def main() -> None:
    wipe_old()
    desktop = Path.home() / "OneDrive" / "Desktop" / ZIP_NAME
    steam = STEAM_MODS / ZIP_NAME
    n = build_zip(steam)
    shutil.copy2(steam, desktop)
    print("installed", steam, f"({n} files)")
    print("desktop copy:", desktop)
    if STEAM_MODS.exists():
        print("steam studio entries:", [p.name for p in STEAM_MODS.iterdir() if "studio" in p.name.lower() or p.name == ZIP_NAME])


if __name__ == "__main__":
    main()
