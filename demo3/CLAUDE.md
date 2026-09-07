# CLAUDE.md — EnerFlex

Project instructions live in **AGENTS.md** (single source of truth). Read it and follow it.

@AGENTS.md

## Claude Code specifics

- Deliver a user story with the skill **`implement-us`** — it chains the project agents
  (`business-analyst`, `architect`, `test-dev`, `node-dev`, `react-dev`, `reviewer`,
  `tech-writer`) with a human gate after each artefact. Never implement a story inline
  in the main conversation.
- Skills in `.claude/skills/` surface by description — load the matching one before coding.
- `.claude/rules/*.md` are hard constraints, auto-loaded.
- The demo script is in `PLAN.MD`.
