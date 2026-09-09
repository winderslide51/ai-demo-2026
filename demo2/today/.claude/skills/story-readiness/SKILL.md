---
name: story-readiness
description: Use before designing or coding one or more CRA user stories to assess whether each story is understandable, atomic, testable, complete, bounded, and implementable.
---

# Story readiness

Run this skill before architecture or implementation. It reviews the requirement, not
the proposed solution, and produces one report per story under `docs/revues/`.

## Owner and boundaries

Delegate the review to the `business-analyst` agent with the story identifier.

- Read `specs/`, the declared prerequisite, `README.md`, and relevant existing behavior.
- Write only `docs/revues/US-0XX-revue.md` and its generated PDF.
- Never modify `specs/`; proposed wording remains a proposal.
- Do not design routes, tables, components, or libraries.

For a batch, use one analyst per independent story and combine verdicts after all reports
are complete.

## Six required axes

| Axis | Question |
|---|---|
| Understandable | Can a reader explain the user, action, and expected outcome? |
| Atomic | Does the story deliver one coherent increment? |
| Testable | Can every criterion become an objective pass/fail check? |
| Complete | Are success, failure, role, and user-visible feedback specified? |
| Bounded | Are limits, exclusions, dates, and ownership explicit? |
| Implementable | Can it be built from existing prerequisites without guessing? |

Prioritize expensive omissions:

- a business rule without its failure case;
- a role without the denied-role behavior;
- missing French user feedback;
- an undecided boundary value;
- data assumed to exist without a prerequisite;
- contradiction with another story or `AGENT.md`.

## Workflow

1. Identify the story and read it in full.
2. Read its declared prerequisite and verify that it provides what the story assumes.
3. Copy `template/revue.md` to `docs/revues/US-0XX-revue.md`.
4. Judge all six axes with evidence.
5. List findings from highest to lowest severity.
6. Quote the exact criterion for every finding.
7. Ask one closed question and propose replacement wording.
8. Assign the verdict from the rules below.
9. Render the Markdown to HTML with `template/render.py`, then print it to PDF in Chrome.
10. For a batch, publish a summary table of verdicts and finding counts.

## Finding format

Use a concrete CRA-domain finding:

```markdown
### [À clarifier] Durée maximale du commentaire non définie

> « Le manager saisit un commentaire obligatoire avant de refuser le CRA. »

**Ce qui manque :** aucune longueur maximale ni erreur attendue n'est indiquée.

**Question à poser :** la limite est-elle de 500 caractères, avec une réponse 422 ?

**Reformulation proposée :** « Le commentaire contient de 1 à 500 caractères ;
au-delà, l'API répond 422 et affiche un message en français. »
```

A finding without an exact quotation is not actionable. Keep product language French in
the report even though this operational skill is English.

## Verdict rules

| Verdict | Meaning | Next step |
|---|---|---|
| **Prête** | no blocking ambiguity; acceptance tests can be written | continue to `architect` |
| **À clarifier** | one or more closed product questions remain | ask the story author |
| **Non prête** | scope or behavior is too incomplete or contradictory | stop before design |

Suggestions alone do not prevent **Prête**. A missing failure rule, authorization result,
or boundary normally requires **À clarifier**. Contradictory core behavior or an absent
prerequisite normally requires **Non prête**.

## Report and PDF

The Markdown report is the versioned source. The PDF is the shareable artifact:

```powershell
$story = "US-009"
uv run --with markdown-it-py python `
  .claude\skills\story-readiness\template\render.py $story
```

Print `docs\revues\$story-revue.html` with headless Chrome to
`docs\revues\$story-revue.pdf`, using the supplied stylesheet. Delete the intermediate
HTML after verifying the PDF. The renderer uses `markdown-it-py` in CommonMark mode;
do not replace it with `python-markdown`.

For each PDF, report its page count. Visually inspect at least one PDF in a batch and all
PDFs when rendering differs.

## Batch summary

```markdown
| Story | Verdict | Bloquants | À clarifier |
|---|---|---:|---:|
| US-007 | Prête | 0 | 0 |
| US-008 | À clarifier | 0 | 2 |
```

Do not average or soften verdicts in the summary. Link each row to its source report.

## Before considering the task complete

- [ ] One dated report exists per story and uses `template/revue.md`.
- [ ] All six axes are judged and justified.
- [ ] Every finding quotes the story and asks a closed question.
- [ ] Every finding proposes concrete French replacement wording.
- [ ] Prerequisites and contradictions were checked.
- [ ] The verdict follows the stated rules.
- [ ] No file under `specs/` was modified.
- [ ] Each report was rendered to PDF with CommonMark and the supplied CSS.
- [ ] Page counts and a batch summary were reported when applicable.
