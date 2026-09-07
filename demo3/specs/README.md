# Spécifications — EnerFlex

Portail de suivi de consommation électrique multi-sites pour **Valmont Industries**, client
industriel B2B (12 sites). Les stories sont rédigées en français : ce sont les artefacts du
client. **Personne — ni humain de l'équipe de dev, ni agent — ne les modifie sans l'accord du
client.** Une reformulation proposée par l'agent `business-analyst` reste une proposition.

## Rôle

- **Énergie manager** : suit la consommation des sites, lit les factures, traite les alertes.
  Un seul rôle, pas d'authentification (démo).

## Ce qui existe déjà

Le socle de l'application (synthèse du parc, liste des sites, détail et facture d'un site,
alertes et acquittement, contrat et grille tarifaire) est livré et décrit dans
[`docs/SPEC-TECHNIQUE.md`](../docs/SPEC-TECHNIQUE.md) — modèle, règles métier, contrat
d'API, écrans.

## Backlog

| ID | Titre | État |
|----|-------|------|
| [US-006](US-006-optimisation-puissance-souscrite.md) | Recommander la puissance souscrite optimale d'un site | **À faire — story de la démo** |

## Conventions d'écriture d'une story

- Titre : un verbe, une fonctionnalité. Un « et » dans le titre signale deux stories.
- Sections fixes : contexte métier, story (« En tant que… je veux… afin de… »), critères
  d'acceptation numérotés (`CA-1`, `CA-2`…), règles métier, exemple chiffré, hors périmètre,
  note technique indicative.
- Chaque critère est observable : un écran, un chiffre, un message.
- Les montants sont HT sauf mention contraire ; les puissances en kVA (souscrite) ou kW
  (mesurée) ; les énergies en kWh.
