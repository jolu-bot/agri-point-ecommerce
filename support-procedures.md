# Support Client — Procédures et templates

Objectif
- Offrir réponses rapides, tracking d'incidents et canal de feedback pour clients de la campagne.

Canaux support
- Email: support@agri-ps.com
- WhatsApp: numéro support
- Formulaire: /contact → category = "campaign"
- Téléphone: centralisé (heures ouvrées)

Workflow ticket
1. Ticket créé (ticketID)
2. Support triage: Priorité {P0,P1,P2}
3. P0 (critique): notifier Dev + PM (SLACK #on-call)
4. P1: assigner Dev, réponse sous 2h
5. P2: réponse standard sous 24h

Templates rapides
- Réponse initiale (éligibilité):
```
Bonjour {name},
Merci pour votre message. Nous avons bien reçu votre demande pour la campagne "Engrais Mars".
Nous vérifions votre dossier et revenons sous 2 heures.
Cordialement,
L'équipe Support
```

- Réponse problème paiement:
```
Bonjour {name},
Votre paiement n'a pas été confirmé. Nous avons transmis le dossier à notre équipe de paiement. Nous vous tiendrons informé sous 24h.
Si vous avez un reçu, répondez à ce message avec une capture.
```

Escalade & reporting
- Tous les P0 doivent être listés dans `support/incidents-YYYY-MM-DD.md` et notifier PM

Fin.
