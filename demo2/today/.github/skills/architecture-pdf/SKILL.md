---
name: architecture-pdf
description: Use when producing or refreshing docs/architecture.pdf from the CRA repository, design notes, ADRs, implemented routes, models, screens, and measured test results.
---

# Architecture PDF

Produce `docs/architecture.pdf` from repository evidence. Do not invent architecture or
present planned behavior as implemented behavior.

## Sources in priority order

| Content | Source |
|---|---|
| context, stack, conventions | `AGENT.md` |
| planned design and contracts | `docs/architecture/*.md` |
| decisions | `docs/adr/*.md` |
| real endpoints | `backend/app/routers/*.py` or running `/openapi.json` |
| real data model | `backend/app/models/*.py` |
| real screens and routes | `frontend/src/pages/`, `frontend/src/App.tsx` |
| quality figures | actual backend and frontend test runs |

Resolve disagreement in favor of implemented code, while recording the design as
**planned**. Reproduce ADR status exactly, including superseded decisions.

## Fixed template

Start from `template/architecture.md` beside this skill and place the filled document at
`docs/architecture.md`. Remove guidance comments and replace every placeholder.

The template has exactly nine numbered top-level sections:

1. project summary;
2. stack and structure;
3. system overview;
4. domain model;
5. API contract;
6. frontend;
7. architecture decisions;
8. quality;
9. remaining work.

Never add, remove, merge, or renumber a section. If a section is not applicable, state
why in one sentence. The deliverable is French; code identifiers remain English.

## Repository inventory

Record routes from decorators or OpenAPI, not from memory. A real CRA route entry is:

```text
POST /api/cra/{annee}/{mois}/soumettre | 200 | CONSULTANT
409 {"detail": "Ce CRA ne contient aucune saisie."}
```

For the domain section, distinguish implemented mappings from planned entities:

```python
class CraStatus(StrEnum):
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    APPROVED = "APPROVED"
```

For each invariant, name its enforcement location, such as a unique database constraint,
`cra_service.add_entry`, or the `require_manager` dependency.

## Markdown to HTML

Use a CommonMark-capable engine. `markdown-it-py` preserves fenced blocks nested in lists
and blockquotes, unlike `python-markdown` in this document shape.

```powershell
@'
from pathlib import Path
from markdown_it import MarkdownIt

source = Path("docs/architecture.md")
template = Path(".claude/skills/architecture-pdf/template")
body = MarkdownIt("commonmark", {"html": True}).enable("table").render(
    source.read_text(encoding="utf-8")
)
css = (template / "print.css").read_text(encoding="utf-8")
Path("docs/architecture.html").write_text(
    "<!doctype html><html lang='fr'><head><meta charset='utf-8'>"
    f"<title>Architecture</title><style>{css}</style></head><body>{body}</body></html>",
    encoding="utf-8",
)
'@ | uv run --with markdown-it-py python -
```

The identical GitHub template path may be used when only `.github/skills/` is available.

## HTML to PDF

Use installed Chrome or Chromium in headless mode with:

```text
--headless
--disable-gpu
--no-pdf-header-footer
--print-to-pdf=docs\architecture.pdf
```

Open the local `docs\architecture.html` file. Use the supplied `template/print.css`;
do not substitute WeasyPrint, which may require unavailable native libraries.

## Rendering verification

Create a screenshot under `docs\` or the session artifact folder, then inspect it. Check:

- all nine section headings appear once and in order;
- code remains in code blocks and comments did not become headings;
- tables retain headers and do not clip columns;
- long code lines wrap;
- rows and code blocks do not split badly across pages;
- color is retained in print;
- no placeholder or template guidance comment remains.

Count PDF pages and report the count. Delete only generated intermediate HTML or
verification images after inspection; keep the Markdown source and final PDF.

## Quality evidence

Run the existing test commands and date the results. Report actual test counts and
coverage, including failures. Never copy historical figures from a note. If dependencies
or code are absent, state that measurement was unavailable and why.

## Before considering the task complete

- [ ] `docs/architecture.md` uses the supplied template and exactly nine sections.
- [ ] No placeholder or guidance comment remains.
- [ ] Every claim traces to repository evidence.
- [ ] Planned and implemented behavior are explicitly distinguished.
- [ ] Routes, models, screens, and ADR statuses match the repository.
- [ ] Test figures come from dated real runs.
- [ ] CommonMark HTML and Chrome PDF were generated with the supplied CSS.
- [ ] Page count is reported and a screenshot was visually inspected.
- [ ] The document is French and code identifiers remain English.
