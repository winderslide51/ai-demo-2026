---
name: delivery-report
description: Produire le rapport de livraison d'une user story d'EnerFlex (docs/rapports/US-XXX-rapport.md + PDF) — besoin, parcours par agent et portes humaines, ce qui a été construit, preuves (tests, couverture), revue, écarts, reste à faire. Tout est lu dans le dépôt. Utilisé par l'agent tech-writer.
---

# Rapport de livraison

Le rapport raconte la livraison **à quelqu'un qui n'était pas là** : le sponsor, le client,
le prochain développeur. Il est écrit en français, depuis les artefacts du dépôt, et rendu
en PDF parce que c'est le PDF qui circule.

## Sources, dans cet ordre

| Section | Lu dans |
|---|---|
| La story | `specs/US-XXX-*.md` |
| Revue du besoin | `docs/revues/US-XXX-revue.md` (verdict, questions, réponses) |
| Plan | `docs/architecture/US-XXX-plan.md` (règle, exemple chiffré, contrat) |
| Fichiers touchés | `git diff --stat <commit-de-départ>..HEAD` |
| Preuves | `npm test -w backend`, `npm test -w frontend` — **exécutés maintenant**, datés |
| Revue de code | `docs/revues/US-XXX-revue-code.md` |
| ADR | `docs/adr/` créés depuis le commit de départ |

Quand un chiffre n'est pas vérifiable, l'écrire (« non mesuré ») plutôt que l'inventer.

## Le gabarit

Partir de `template/rapport.md`, le copier dans `docs/rapports/US-XXX-rapport.md` et remplir
chaque `{{PLACEHOLDER}}`. Sept sections, aucune ajoutée, aucune supprimée : les rapports se
comparent d'une story à l'autre.

Le tableau du **parcours** est ce que le lecteur regarde en premier : une ligne par étape,
avec l'agent, le livrable (chemin) et la porte humaine (validée oui/non, avec la demande de
modification s'il y en a eu).

## Rendu PDF

Le script `scripts/md-to-pdf.mjs` (racine du dépôt) convertit un Markdown en HTML avec la
feuille `template/print.css` puis imprime en PDF avec Chrome headless :

```bash
node scripts/md-to-pdf.mjs docs/rapports/US-006-rapport.md
# → docs/rapports/US-006-rapport.pdf
```

Vérifier le résultat avant de le livrer :

```bash
node scripts/md-to-pdf.mjs docs/rapports/US-006-rapport.md --pages   # affiche le nombre de pages
```

Un rapport d'une seule page signale un gabarit mal rempli.

## Checklist

- [ ] Construit depuis `template/rapport.md`, sept sections.
- [ ] Aucun `{{PLACEHOLDER}}` restant.
- [ ] Chiffres de tests et couverture issus d'une exécution datée.
- [ ] Chaque critère d'acceptation relié au test qui le prouve.
- [ ] Portes humaines documentées (date, décision, demandes de modification).
- [ ] PDF rendu, nombre de pages annoncé.
