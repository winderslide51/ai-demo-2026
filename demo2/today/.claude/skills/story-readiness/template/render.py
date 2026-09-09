"""Render a CRA story-readiness Markdown report to HTML for Chrome PDF printing.

Usage: uv run --with markdown-it-py python <this file> US-009
"""

import sys
from pathlib import Path

from markdown_it import MarkdownIt


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("Usage: render.py US-0XX")

    story = sys.argv[1]
    source = Path("docs") / "revues" / f"{story}-revue.md"
    if not source.exists():
        raise SystemExit(f"Rapport introuvable : {source}")

    template_dir = Path(__file__).resolve().parent
    renderer = MarkdownIt("commonmark", {"html": True}).enable("table")
    body = renderer.render(source.read_text(encoding="utf-8"))
    css = (template_dir / "print.css").read_text(encoding="utf-8")
    target = source.with_suffix(".html")
    target.write_text(
        "<!doctype html><html lang='fr'><head><meta charset='utf-8'>"
        f"<title>Revue {story}</title><style>{css}</style></head>"
        f"<body>{body}</body></html>",
        encoding="utf-8",
    )
    print(f"HTML généré : {target}")


if __name__ == "__main__":
    main()
