# Communication alternative (clients sans SMS)

Contexte
- Certains clients ne reçoivent pas SMS (réseau, numéro invalide). Ce guide propose canaux alternatifs.

Canaux alternatifs
- WhatsApp (API / broadcast)
- Email (si présent)
- USSD / IVR (si partenaire opérateur disponible)
- Agents locaux (réseau terrain) — messages imprimés / distribution

Templates — WhatsApp court
```
Bonjour {name},
Votre commande pour la campagne Engrais Mars a été enregistrée. Vérifiez votre éligibilité et paiement ici: https://agri-ps.com/campagne-engrais
Contact: support@agri-ps.com
```

Procédure d'usage
1. Tenter envoi SMS (3 essais). Si échec, inscrire contact dans `non-sms-list.csv`.
2. Envoyer WhatsApp si disponible (API). Si non, email.
3. Si aucun canal, assigner agent terrain (zone) pour suivi.

Fin.
