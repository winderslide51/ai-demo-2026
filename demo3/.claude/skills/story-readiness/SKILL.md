---
name: story-readiness
description: Vérifier AVANT conception ou code qu'une user story d'EnerFlex est compréhensible, testable et complète. Délègue à l'agent business-analyst et produit un rapport par story dans docs/revues/. À lancer sur une story ou sur tout le backlog.
---

# Revue de préparation d'une story

Répond à une seule question, avant la moindre ligne de code : **peut-on implémenter cette
story telle qu'elle est écrite, ou faudra-t-il deviner ?**

Deviner coûte cher tard. Un critère ambigu se règle en une phrase avant de coder, et en une
demi-journée de reprise après. C'est la seule étape du dispositif où le **besoin** est
contesté — `architect` conçoit, `reviewer` relit le code, personne d'autre ne relit la demande.

## Qui fait le travail

L'agent **`business-analyst`**, en lecture seule sur `specs/`. Lui donner l'identifiant de
la story ; il juge les six axes et remplit `template/revue.md`. Ne pas faire ce travail
dans la conversation principale : l'agent a son propre cadrage et ne doit pas être
contaminé par le contexte de développement.

## Déroulé

1. Lancer l'agent avec l'identifiant (`US-006`). Pour un lot, un agent par story, en parallèle.
2. Le rapport atterrit dans `docs/revues/US-XXX-revue.md`.
3. Le verdict décide de la suite :

| Verdict | Suite |
|---|---|
| **Prête** | enchaîner sur `architect` |
| **À clarifier** | poser les questions à l'utilisateur ; ses réponses vont dans `specs/`, écrites par un humain, et sont transmises à `architect` |
| **Non prête** | ne pas lancer la conception |

4. Après correction de la story, relancer la revue : le rapport est daté et remplacé.

## Ce que le skill ne fait pas

- Il **ne modifie jamais `specs/`**.
- Il ne conçoit pas : ni route, ni structure, ni bibliothèque.
- Il ne cherche pas à rendre toutes les stories « Prêtes ». Un backlog dont chaque story
  passe du premier coup signale une revue complaisante.

## Lancer la revue

```text
Utilise le skill story-readiness sur specs/US-006-optimisation-puissance-souscrite.md :
délègue à l'agent business-analyst et écris son rapport dans docs/revues/.
```

## Checklist

- [ ] Un rapport par story, construit depuis `template/revue.md`, daté.
- [ ] Les six axes jugés et justifiés.
- [ ] Chaque constat cite le critère mot pour mot et propose une reformulation.
- [ ] Les questions sont fermées : on y répond en une phrase.
- [ ] Aucun fichier de `specs/` modifié.
