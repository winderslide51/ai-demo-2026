# ADR-0002 — Données en mémoire, générées de façon déterministe

Statut : Acceptée — 2026-09-07

Contexte : la démo doit démarrer avec `npm install && npm run dev`, sur n'importe quel poste,
et montrer les mêmes chiffres à chaque exécution (les captures d'écran, les tests et le
discours de démo en dépendent).

Décision : aucune base de données. Les 12 sites sont décrits dans `data/sites.ts` ; les
relevés horaires sont produits par un générateur pseudo-aléatoire à graine fixe
(`hash(siteId + mois)`), avec des scénarios volontaires sur `2026-08`. L'acquittement des
alertes est le seul état mutable, conservé dans un `Set` en mémoire.

Conséquences : zéro installation, chiffres reproductibles, tests sans fixtures lourdes.
L'état est perdu au redémarrage — acceptable pour une démo, à remplacer par une base si
l'application devait vivre.

Alternatives considérées : SQLite + seed (rejeté : une dépendance native de plus pour aucun
gain de démo) ; fichiers JSON de relevés (rejeté : 12 × 6 × 744 lignes à versionner).
