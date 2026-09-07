---
name: tech-spec-update
description: Mettre à jour docs/SPEC-TECHNIQUE.md après la livraison d'une user story d'EnerFlex — uniquement les sections touchées (structure, modèle, règles, contrat d'API, frontend, ADR, historique), vérifiées dans le code, version incrémentée. Utilisé par l'agent tech-writer.
---

# Mise à jour de la spécification technique

`docs/SPEC-TECHNIQUE.md` décrit **ce qui est construit**. Après chaque story, il doit
continuer à dire la vérité — ni plus (pas de « prévu »), ni moins (pas de route oubliée).
C'est le document qu'un nouvel arrivant, ou le prochain agent `architect`, lit en premier.

## Principe : toucher peu, vérifier tout

On **ne réécrit pas** la spec ; on modifie les sections que la story a rendues fausses ou
incomplètes. Chaque ajout est vérifié dans le code avant d'être écrit.

| Section | Quand la toucher | Vérifier dans |
|---|---|---|
| §2 Stack et structure | fichier ou dossier nouveau dans l'arborescence | `ls backend/src frontend/src` |
| §3 Modèle de domaine | entité, champ, invariant nouveau | `backend/src/types.ts` |
| §4 Règles métier | règle nouvelle ou modifiée : formule, paramètres, exemple chiffré | `backend/src/domain/*.ts` |
| §5 Contrat d'API | route nouvelle ou modifiée : ligne du tableau **et** type de réponse | `backend/src/routes/*.ts`, `types.ts` |
| §6 Frontend | écran ou bloc nouveau, libellés | `frontend/src/pages/*.tsx` |
| §7 ADR | chaque ADR créé par la story, avec son statut | `docs/adr/` |
| §8 Qualité | changement du dispositif de test | `vitest.config.ts`, `vite.config.ts` |
| §9 Historique | **toujours** : une ligne `date · story · résumé` | — |

En-tête : incrémenter la version (`1.0` → `1.1`) et la date.

## Style

- Même ton, mêmes tableaux, même niveau de détail que les sections existantes.
- Une règle métier s'écrit comme au §4.3 : formule en bloc, paramètres nommés, ordre des
  lignes ou des champs, arrondi.
- Une route s'ajoute dans le tableau du §5 **et** son type dans le bloc `ts` qui suit.
- Français ; identifiants de code en anglais ou tels qu'ils sont dans le code.

## Vérifier avant de rendre

```bash
# chaque route de la spec existe dans le code
grep -n "router\.\(get\|post\)" backend/src/routes/*.ts
# chaque type de réponse de la spec existe
grep -n "^export type" backend/src/types.ts
```

## Checklist

- [ ] Seules les sections concernées ont changé ; le reste est byte-identique.
- [ ] Chaque route et type ajoutés existent dans le code.
- [ ] Règle métier avec formule et exemple chiffré.
- [ ] ADR listés avec leur statut.
- [ ] Ligne d'historique ajoutée, version et date incrémentées.
- [ ] Aucune mention de « prévu », « à venir », « sera ».
