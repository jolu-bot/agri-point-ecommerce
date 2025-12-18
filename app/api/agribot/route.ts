import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `Tu es AgriBot, un assistant IA expert en agriculture pour AGRI POINT SERVICE au Cameroun.

CONTEXTE DE L'ENTREPRISE :
- AGRI POINT SERVICE distribue des biofertilisants de qualité au Cameroun
- Mission : "Produire plus, Gagner plus, Mieux vivre"
- Produits principaux : HUMIFORTE, FOSNUTREN 20, KADOSTIM 20, AMINOL 20, NATUR CARE
- Services : 1 point pour 20,000 hectares / 10,000 personnes
- Contact : +237 657 39 39 39, WhatsApp: 676026601, infos@agri-ps.com
- Adresse : B.P. 5111 Yaoundé, Quartier Fouda

TES COMPÉTENCES :
1. Conseils sur les cultures (cacao, café, tomates, agrumes, etc.)
2. Recommandations de produits biofertilisants adaptés
3. Guide pour l'agriculture urbaine (balcons, terrasses, micro-pousses)
4. Conseils sur les dosages et applications
5. Amélioration du rendement agricole
6. Solutions aux problèmes courants (maladies, carences, etc.)

PRODUITS ET USAGES :
- HUMIFORTE (NPK 6-4-0.2) : Favorise feuillage et croissance, pour agrumes, fruits, horticulture
- FOSNUTREN 20 (4.2-6.5) : Garantit floraison et fructification abondante
- KADOSTIM 20 : Assure croissance et qualité des fruits
- AMINOL 20 : Anti-stress, absorption immédiate pour cacao, café, poivre
- NATUR CARE : Restauration des sols, engrais organique liquide NPK

STYLE DE RÉPONSE :
- Sois amical, professionnel et encourageant
- Utilise des exemples pratiques et locaux (contexte camerounais)
- Donne des conseils concrets et actionnables
- Recommande les produits AGRI POINT quand c'est pertinent
- Propose toujours de contacter l'équipe pour des conseils personnalisés
- Limite tes réponses à 200-250 mots maximum

Si on te pose une question hors agriculture, redirige poliment vers ton domaine d'expertise.`;

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message requis' },
        { status: 400 }
      );
    }

    // Vérifier si OpenAI est configuré
    if (!process.env.OPENAI_API_KEY) {
      // Mode démo sans OpenAI
      return NextResponse.json({
        response: getDemoResponse(message),
      });
    }

    // Préparer les messages pour OpenAI
    const messages: any[] = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    // Ajouter l'historique (contexte)
    if (history && Array.isArray(history)) {
      history.forEach((msg: any) => {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      });
    }

    // Ajouter le nouveau message
    messages.push({
      role: 'user',
      content: message,
    });

    // Appel à OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content || 
      'Désolé, je n\'ai pas pu générer une réponse. Veuillez réessayer.';

    return NextResponse.json({ response });

  } catch (error: any) {
    console.error('Erreur AgriBot:', error);
    
    // En cas d'erreur, utiliser une réponse de secours
    return NextResponse.json({
      response: 'Je rencontre un problème technique. Pour une assistance immédiate, contactez-nous au +237 657 39 39 39 ou via WhatsApp au 676026601.',
    });
  }
}

// Réponses de démo pour les tests sans OpenAI
function getDemoResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('tomate')) {
    return `Pour vos tomates, je recommande :

🌱 **HUMIFORTE** : Pour favoriser la croissance et un feuillage vigoureux
🌸 **FOSNUTREN 20** : Pour une floraison abondante
🍅 **KADOSTIM 20** : Pour la maturation et la qualité des fruits

**Dosage recommandé** : 1-2L/Ha en pulvérisation foliaire, à répéter toutes les 2-3 semaines.

Pour un conseil personnalisé selon votre situation, contactez-nous :
📞 +237 657 39 39 39
💬 WhatsApp: 676026601`;
  }

  if (lowerMessage.includes('rendement') || lowerMessage.includes('production')) {
    return `Pour améliorer votre rendement :

✅ Utilisez des biofertilisants de qualité (HUMIFORTE, FOSNUTREN)
✅ Respectez les dosages et calendriers d'application
✅ Combinez avec une bonne préparation du sol
✅ Appliquez en phase de croissance et floraison

Nos clients constatent une **augmentation de 30-50% du rendement** ! 

Pour une stratégie adaptée à votre culture, parlons-en :
📞 +237 657 39 39 39`;
  }

  if (lowerMessage.includes('urbain') || lowerMessage.includes('balcon')) {
    return `L'agriculture urbaine avec AGRI POINT :

🏙️ **Kits de démarrage** pour balcons et terrasses
🌿 **Produits adaptés** en petits formats
📚 **Guides pratiques** et formations
🤝 **Accompagnement** personnalisé

Cultures idéales : tomates cerises, herbes aromatiques, laitues, micro-pousses !

Commencez petit, notre équipe vous guide :
💬 WhatsApp: 676026601`;
  }

  if (lowerMessage.includes('cacao') || lowerMessage.includes('café')) {
    return `Pour le cacao et le café :

☕ **AMINOL 20** : Bio-stimulant anti-stress, absorption immédiate
🌱 **HUMIFORTE** : NPK pour la croissance
🍫 **FOSNUTREN 20** : Pour la floraison

**Résultats** : Meilleure résistance, fructification optimale, rendement accru.

Dosage et calendrier d'application sur mesure disponibles !
📞 +237 657 39 39 39`;
  }

  // Réponse générique
  return `Merci pour votre question ! 

Je suis AgriBot, votre conseiller agricole. Je peux vous aider avec :
- Recommandations de produits
- Conseils par culture
- Agriculture urbaine
- Amélioration du rendement

Pour une réponse précise, contactez notre équipe :
📞 +237 657 39 39 39
💬 WhatsApp: 676026601
📧 infos@agri-ps.com

Quelle est votre culture ou votre besoin spécifique ?`;
}
