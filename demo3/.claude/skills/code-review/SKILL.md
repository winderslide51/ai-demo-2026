---
name: code-review
description: Relire le code d'une user story d'EnerFlex après implémentation — couverture des critères, fidélité au plan, respect des règles, tests non affaiblis, vérification dans le navigateur — et produire un rapport de revue classé par sévérité dans docs/revues/. Délègue à l'agent reviewer ; le rapport est relu par un humain.
---

# Revue de code d'une story

La revue est la **troisième porte humaine** : c'est le rapport que l'utilisateur lit pour
décider si la story est livrée. Il doit être court, vérifié, et classé.

## Qui fait le travail

L'agent **`reviewer`**, en lecture seule sur le code. Lui donner l'identifiant, le chemin du
plan et le commit de départ de la story (`git diff <commit>..HEAD`).

## La grille, dans l'ordre

1. **Critères d'acceptation** → code + test pour chacun. Un critère sans test n'est pas couvert.
2. **Fidélité au plan** : règle, contrat, libellés, états. Un écart non documenté est un constat.
3. **Tests non affaiblis** : `git diff <commit-des-tests>..HEAD -- '*.test.*'` doit être vide
   ou ne contenir que des ajouts.
4. **Règles Do/Don't** des deux côtés.
5. **Exécution réelle** : `npm test -w backend`, `npm test -w frontend`, chiffres rapportés.
6. **Navigateur** : l'écran de la story vu dans Chrome (`ui-verification`).

## Format du rapport (`docs/revues/US-XXX-revue-code.md`)

```markdown
# Revue de code — US-006 — Recommander la puissance souscrite optimale

*Revue faite le 2026-09-XX par l'agent `reviewer`, sur le diff abc1234..HEAD.*

## Verdict
7 critères sur 7 couverts · backend 48/48 tests, 91 % · frontend 36/36 tests, 84 % · écran vu dans Chrome.
**Livrable**, sous réserve d'un constat À CORRIGER.

## Couverture des critères
| Critère | Code | Test | État |
|---|---|---|---|

## Constats
### [À CORRIGER] chemin:ligne — titre
Pourquoi / Critère concerné / Correction suggérée

## Ce qui est bien fait
(deux ou trois lignes — le relecteur note aussi ce qu'il faut garder)
```

| Sévérité | Signification |
|---|---|
| `BLOQUANT` | critère non couvert, test affaibli, suite rouge, règle hors du domaine |
| `À CORRIGER` | règle violée, cas limite sans test, état manquant, écart au plan non documenté |
| `SUGGESTION` | nommage, duplication, lisibilité |

## Après la revue

- `BLOQUANT` → corriger par l'agent propriétaire, re-vérifier, re-relire (deux tours max).
- `À CORRIGER` → corriger si rapide, sinon dans le rapport de livraison.
- `SUGGESTION` → rapport de livraison, section « reste à faire ».

## Checklist

- [ ] Chaque critère marqué couvert (code + test) ou non.
- [ ] Chaque constat vérifié dans le fichier, chemin et ligne.
- [ ] Tests de `test-dev` comparés à leur version initiale.
- [ ] Suites exécutées, chiffres réels.
- [ ] Écran vu dans Chrome ou impossibilité rapportée.
- [ ] Verdict en une ligne ; rapport relu par l'humain avant clôture.
