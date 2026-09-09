# Consommation de tokens — EnerFlex

_Genere le 2026-09-08T11:52:35.318Z · Evenements : 5_

## Par agent principal, sous-agents et skills

| Type | Nom | Modele | Runs | Entree | Ecriture cache | Sortie | Total | Moyenne/run |
|---|---|---|---:|---:|---:|---:|---:|---:|
| main | `main:9260614b` | claude-opus-5 | 1 | 248 | 516 757 | 97 188 | 614 193 | 614 193 |
| agent | `business-analyst` | claude-opus-5 | 1 | 50 | 132 387 | 4 684 | 137 121 | 137 121 |
| skill | `claude-in-chrome` | — | 1 | — | — | — | — | — |
| skill | `update-config` | — | 1 | — | — | — | — | — |
| agent | `main` | — | 1 | 0 | 0 | 0 | 0 | 0 |
| **Tout** | | | 5 | **298** | **649 144** | **101 872** | **751 314** | |

### Par nature

| Nature | Runs | Entree | Ecriture cache | Sortie | Total |
|---|---:|---:|---:|---:|---:|
| main | 1 | 248 | 516 757 | 97 188 | 614 193 |
| agent | 2 | 50 | 132 387 | 4 684 | 137 121 |
| skill | 2 | — | — | — | — |

## Par user story

| Story | Evenements | Entree | Ecriture cache | Sortie | Total |
|---|---:|---:|---:|---:|---:|
| `US-006` | 5 | 298 | 649 144 | 101 872 | 751 314 |

> **main** = agent principal (session entiere, cumulatif, exact, une ligne par
> session). **agent** = sous-agent (son propre transcript, exact, une ligne par
> execution ; les agents du projet gardent leur nom, ceux geres par Claude
> tombent dans `main`). **skill** = invocation en ligne, **comptage seul**.
>
> **Modele** lu dans le transcript. **Entree** = nouveau, non cache. **Ecriture
> cache** = cache_creation (gonfle sur les agents longs par rafraichissement du
> cache). **Sortie** = genere. **Total** = la somme des trois. Les *lectures* de
> cache sont exclues. Pour le vrai travail, lire Entree + Sortie.

## Evenements (le plus recent en dernier)

| Heure (UTC) | Story | Type | Nom | Modele | Entree | Ecriture cache | Sortie | Total |
|---|---|---|---|---|---:|---:|---:|---:|
| 2026-09-08 11:48:04 | `US-006` | agent | `business-analyst` | claude-opus-5 | 50 | 132387 | 4684 | 137121 |
| 2026-09-08 11:49:31 | `US-006` | main | `main:9260614b` | claude-opus-5 | 248 | 516757 | 97188 | 614193 |
| 2026-09-08 11:19:06 | `US-006` | skill | `claude-in-chrome` | — | — | — | — | — |
| 2026-09-08 11:44:31 | `US-006` | skill | `update-config` | — | — | — | — | — |
| 2026-09-08 11:52:35 | `US-006` | agent | `main` | — | 0 | 0 | 0 | 0 |

<!-- diag - dernier evenement : subagentstop - cles du payload : session_id, transcript_path, cwd, scratchpad_dir, prompt_id, permission_mode, agent_id, agent_type, effort, hook_event_name, stop_hook_active, agent_transcript_path, last_assistant_message, background_tasks, session_crons -->
