---
name: architecture-plan
description: Produire le plan d'implémentation d'une user story d'EnerFlex avant les tests et le code — règle métier en fonction pure avec exemple chiffré, contrat d'API, écran, plan de tests nommés, alternatives et ADR. Délègue à l'agent architect ; le plan est relu par un humain avant de continuer.
---

# Plan d'architecture d'une story

Le plan est **le document que l'humain relit** entre la story et le code. Il doit permettre
à quelqu'un qui ne lira pas le code de dire « oui, c'est ça qu'on veut » en cinq minutes, et
à `test-dev` d'écrire les tests sans poser une question.

## Qui fait le travail

L'agent **`architect`**, qui écrit uniquement dans `docs/architecture/` et `docs/adr/`. Lui
donner l'identifiant de la story, le chemin de la revue du `business-analyst` et **les
réponses de l'utilisateur** aux questions de cette revue.

## Ce que contient un bon plan (gabarit : `template/plan.md`)

1. **Cadrage** — ce qu'il faut décider, en trois phrases.
2. **Règle métier** — signature de la fonction pure dans `backend/src/domain/`, entrées,
   sortie, cas limites, arrondi, et **un exemple chiffré calculé à la main**. C'est la
   section la plus importante : le test du domaine en découle mot pour mot.
3. **Contrat d'API** — route, verbe, paramètres, type TypeScript de la réponse, erreurs et
   messages français.
4. **Frontend** — écran, composants, libellés à ajouter dans `labels.ts`, états à gérer.
5. **Plan de tests** — la liste nominative des tests attendus (domaine / API / UI), chacun
   rattaché à un critère d'acceptation, avec la valeur attendue.
6. **Décisions et alternatives** — deux options minimum par choix structurel, recommandation,
   ADR.
7. **Découpage** — ordre et répartition `node-dev` / `react-dev`.
8. **Questions ouvertes** — vides si tout est tranché ; sinon, on s'arrête là.

## Ce que le plan n'est pas

- Pas de code. Des signatures et des types, oui ; des corps de fonction, non.
- Pas une réécriture de la story : il la référence par ses critères.
- Pas un catalogue d'options : deux alternatives et une recommandation par choix.
- Pas plus de **150 lignes** (ADR à part, 30 lignes) : au-delà, l'humain de la porte n° 1
  ne le relit plus, il le survole. Un plan trop long est un plan mal relu.

## Lancer

```text
/architecture-plan US-006 — avec docs/revues/US-006-revue.md et les réponses
suivantes : (1) …, (2) ….
Contexte à lire, rien de plus : docs/SPEC-TECHNIQUE.md §4.3 et §5, backend/src/domain/
tarification.ts, backend/src/routes/sites.ts, frontend/src/pages/SiteDetailPage.tsx.
Plan en 150 lignes maximum.
```

Nommer les fichiers à lire est ce qui rend l'étape rapide : sans cette liste, l'agent
parcourt la spec entière et le code alentour, et le plan met deux à trois fois plus
longtemps à sortir — le temps mort le plus visible de la démo.

## Relecture humaine

Quand le plan est rendu, présenter en cinq lignes : la règle, la route, l'écran, le nombre
de tests prévus, l'alternative écartée. Puis demander la validation. On ne lance pas
`test-dev` sans elle.

## Checklist

- [ ] Plan construit depuis `template/plan.md`, huit sections.
- [ ] Exemple chiffré calculé à la main dans la section règle métier.
- [ ] Chaque critère d'acceptation → au moins un test nommé dans le plan de tests.
- [ ] Contrat d'API typé, erreurs avec messages français.
- [ ] Alternatives et ADR pour chaque choix structurel.
- [ ] Plan ≤ 150 lignes, ADR ≤ 30 lignes.
- [ ] Validé par l'humain avant `test-dev`.
