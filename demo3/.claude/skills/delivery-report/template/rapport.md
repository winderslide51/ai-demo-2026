# Rapport de livraison — {{ID_STORY}} — {{TITRE_STORY}}

*Rédigé le {{DATE}} par l'agent `tech-writer`. Commit de départ `{{COMMIT_DEPART}}`, commit
de fin `{{COMMIT_FIN}}`. Tout ce qui suit est lu dans le dépôt.*

## 1. La story

{{LA_STORY_EN_TROIS_LIGNES}}

Revue du besoin : **{{VERDICT_BA}}** — {{NB_QUESTIONS}} question(s) posée(s), réponses :

| # | Question | Réponse |
|---|---|---|
| 1 | {{QUESTION}} | {{REPONSE}} |

## 2. Le parcours

| Étape | Agent | Livrable | Porte humaine |
|---|---|---|---|
| Revue du besoin | `business-analyst` | `docs/revues/{{ID_STORY}}-revue.md` | — |
| Plan | `architect` | `docs/architecture/{{ID_STORY}}-plan.md` | validé le {{DATE}} {{MODIFS_DEMANDEES}} |
| Tests | `test-dev` | {{FICHIERS_DE_TEST}} | validés le {{DATE}} {{MODIFS_DEMANDEES}} |
| Backend | `node-dev` | {{FICHIERS_BACKEND}} | — |
| Frontend | `react-dev` | {{FICHIERS_FRONTEND}} | — |
| Revue de code | `reviewer` | `docs/revues/{{ID_STORY}}-revue-code.md` | code validé le {{DATE}} |
| Clôture | `tech-writer` | ce rapport, `docs/SPEC-TECHNIQUE.md` v{{VERSION}} | — |

## 3. Ce qui a été construit

**Règle métier** — `{{FICHIER_DOMAINE}}` : {{LA_REGLE_EN_DEUX_PHRASES}}

Exemple (du plan) : {{EXEMPLE_CHIFFRE}}

**Endpoint** — `{{VERBE}} {{ROUTE}}` → `{{TYPE_REPONSE}}` ; erreurs {{ERREURS}}.

**Écran** — {{PAGE}} : {{CE_QUI_A_ETE_AJOUTE}}

**Fichiers** (`git diff --stat`) :

```
{{DIFF_STAT}}
```

## 4. Preuves

| Critère d'acceptation | Test qui le prouve | Fichier |
|---|---|---|
| {{CA}} | « {{NOM_DU_TEST}} » | `{{FICHIER}}` |

Exécution du {{DATE_HEURE}} :

| Côté | Tests | Couverture (lignes / branches) |
|---|---|---|
| Backend | {{N}}/{{N}} | {{PCT}} % / {{PCT}} % |
| Frontend | {{N}}/{{N}} | {{PCT}} % / {{PCT}} % |

Écran vérifié dans Chrome : {{OUI_NON_ET_QUOI}}

## 5. Revue de code

| Sévérité | Nombre | Corrigés | Ouverts |
|---|---|---|---|
| BLOQUANT | {{N}} | {{N}} | {{N}} |
| À CORRIGER | {{N}} | {{N}} | {{N}} |
| SUGGESTION | {{N}} | — | {{N}} |

Constats laissés ouverts : {{LISTE_OU_AUCUN}}

## 6. Écarts et décisions

{{DIFFERENCES_STORY_PLAN_CODE_AVEC_RAISON}}

ADR créés : {{LISTE_OU_AUCUN}}

## 7. Reste à faire

{{SUGGESTIONS_NON_TRAITEES_DETTE_ASSUMEE_IDEES_HORS_STORY}}
