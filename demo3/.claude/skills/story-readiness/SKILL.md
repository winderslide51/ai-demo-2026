---
name: story-readiness
description: Vérifier AVANT conception ou code qu'une user story d'EnerFlex est compréhensible, testable et complète. Délègue à l'agent business-analyst et produit un rapport par story (Markdown + PDF) dans docs/revues/. À lancer sur une story ou sur tout le backlog.
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
2. Le rapport atterrit dans `docs/revues/US-XXX-revue.md`, avec son **PDF** à côté
   (`US-XXX-revue.pdf`) — c'est le PDF qu'on montre et qu'on transmet.
3. Le verdict décide de la suite :

| Verdict | Suite |
|---|---|
| **Prête** | enchaîner sur `architect` |
| **À clarifier** | poser les questions à l'utilisateur ; ses réponses vont dans `specs/`, écrites par un humain, et sont transmises à `architect` |
| **Non prête** | ne pas lancer la conception |

4. Après correction de la story, relancer la revue : le rapport est daté et remplacé.

## Rendu PDF

Le même script que le rapport de livraison, à la racine du dépôt :

```bash
node scripts/md-to-pdf.mjs docs/revues/US-006-revue.md --pages
# → docs/revues/US-006-revue.pdf
```

C'est l'agent qui le lance à la fin de son travail. Après une relance de la revue (story
corrigée), le PDF est réécrit en même temps que le Markdown : les deux sont toujours datés
du même jour.

## Ce que le skill ne fait pas

- Il **ne modifie jamais `specs/`**.
- Il ne conçoit pas : ni route, ni structure, ni bibliothèque.
- Il ne cherche pas à rendre toutes les stories « Prêtes ». Un backlog dont chaque story
  passe du premier coup signale une revue complaisante.

## Lancer la revue

```text
/story-readiness specs/US-006-optimisation-puissance-souscrite.md — le rapport va
dans docs/revues/.
```

## Checklist

- [ ] Un rapport par story, construit depuis `template/revue.md`, daté.
- [ ] PDF rendu à côté du Markdown, nombre de pages annoncé.
- [ ] Les six axes jugés et justifiés.
- [ ] Chaque constat cite le critère mot pour mot et propose une reformulation.
- [ ] Les questions sont fermées : on y répond en une phrase.
- [ ] Aucun fichier de `specs/` modifié.
