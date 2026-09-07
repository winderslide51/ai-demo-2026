# Plan — {{ID_STORY}} — {{TITRE_STORY}}

*Écrit le {{DATE}} par l'agent `architect`, depuis la story, la revue
`docs/revues/{{ID_STORY}}-revue.md` et les réponses de l'utilisateur. À relire par un humain
avant `test-dev`.*

## 1. Cadrage

{{CE_QU_IL_FAUT_DECIDER_EN_TROIS_PHRASES}}

Critères d'acceptation concernés : {{LISTE_CA}}

## 2. Règle métier

**Fichier :** `backend/src/domain/{{fichier}}.ts`

```ts
export function {{nomFonction}}({{parametres}}): {{TypeRetour}}
```

| Entrée | Type | Rôle |
|---|---|---|
| {{param}} | {{type}} | {{role}} |

**Sortie :** {{DESCRIPTION_DE_LA_SORTIE}}

**Cas limites :**

- {{CAS_ZERO}}
- {{CAS_EGALITE}}
- {{CAS_VIDE}}

**Arrondi :** {{OU_ET_COMMENT}}

**Exemple chiffré (calculé à la main) :**

{{ENTREES_CHIFFREES}}

{{CALCUL_ETAPE_PAR_ETAPE}}

→ résultat attendu : {{RESULTAT}}

## 3. Contrat d'API

| Verbe | Route | Paramètres | Réponse | Erreurs |
|---|---|---|---|---|
| {{GET}} | `/api/…` | `mois` | `{{Type}}` | 400 « … », 404 « … » |

```ts
type {{Type}} = {
  …
}
```

## 4. Frontend

- **Écran :** {{page}} (`frontend/src/pages/…`)
- **Composant(s) :** {{nouveaux_ou_etendus}}
- **Libellés à ajouter dans `labels.ts` :** {{liste}}
- **États :** chargement / erreur (message du backend) / vide / {{cas_metier_particulier}}

## 5. Plan de tests

| # | Critère | Côté | Fichier | Nom du test (français) | Valeur attendue |
|---|---|---|---|---|---|
| 1 | CA-1 | domaine | `backend/tests/….test.ts` | « … » | … |
| 2 | CA-1 | API | `backend/tests/api.test.ts` | « … » | … |
| 3 | CA-2 | UI | `frontend/src/pages/….test.tsx` | « … » | … |

## 6. Décisions et alternatives

### {{DECISION_1}}

| Option | Avantages | Inconvénients |
|---|---|---|
| A — {{option}} | … | … |
| B — {{option}} | … | … |

**Recommandation :** {{A_OU_B_ET_POURQUOI}} → ADR-{{NNNN}}

## 7. Découpage

| Ordre | Agent | Tâche | Peut commencer |
|---|---|---|---|
| 1 | `test-dev` | tests du §5 | tout de suite |
| 2 | `node-dev` | domaine → service → route | après validation des tests |
| 2 | `react-dev` | types → api → hook → composant → page | en parallèle de `node-dev` |

## 8. Questions ouvertes

{{AUCUNE_OU_LISTE}}
