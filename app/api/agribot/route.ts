import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Order from '@/models/Order';
import ChatConversation from '@/models/ChatConversation';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─────────────────────────────────────────────
// BASE DE CONNAISSANCES AGRI POINT (RAG statique)
// ─────────────────────────────────────────────
const KNOWLEDGE_BASE = `
## AGRI POINT SERVICE - Base de Connaissances Complète

### IDENTITÉ DE L'ENTREPRISE
- **Nom** : AGRI POINT SERVICE
- **Slogan** : "Produire plus, Gagner plus, Mieux vivre"
- **Spécialité** : Distribution de biofertilisants de qualité au Cameroun
- **Zone de couverture** : Cameroun, Afrique Centrale
- **Impact** : 1 point couvrant 20 000 hectares / 10 000 personnes
- **Adresse** : B.P. 5111 Yaoundé, Quartier Fouda, Cameroun
- **Téléphone** : +237 657 39 39 39
- **WhatsApp** : 676026601
- **Email** : infos@agri-ps.com
- **Site** : https://agri-ps.com

### CATALOGUE PRODUITS COMPLET

#### HUMIFORTE (NPK 6-4-0.2)
- **Catégorie** : Biofertilisant foliaire
- **Formule** : N 6% P 4% K 0.2% + acides humiques
- **Action principale** : Stimule la croissance végétative, favorise le feuillage
- **Cultures cibles** : Agrumes, fruits tropicaux, horticulture, maraîchage
- **Dosage** : 1-2 L/Ha en pulvérisation foliaire, toutes les 2-3 semaines
- **Avantages** : Renforce le système racinaire, améliore la résistance aux stress
- **Prix indicatif** : Disponible en 1L, 5L, 20L

#### FOSNUTREN 20 (NPK 4.2-6.5)
- **Catégorie** : Biofertilisant floral
- **Action principale** : Garantit floraison abondante et fructification
- **Cultures cibles** : Tomates, poivrons, concombres, haricots, cultures maraîchères
- **Dosage** : Appliquer au stade floral, 1.5 L/Ha
- **Avantages** : Augmente le nombre de fleurs et de fruits noués
- **Moment d'application** : Dès l'apparition des premiers boutons floraux

#### KADOSTIM 20
- **Catégorie** : Biostimulant fruticole
- **Action principale** : Assure croissance optimale et qualité supérieure des fruits
- **Cultures cibles** : Cacao, café, manguier, avocatier, agrumes
- **Dosage** : 2 L/Ha en fin de floraison
- **Avantages** : Calibre, coloration et qualité gustative améliorés
- **Export** : Particulièrement adapté aux cultures d'exportation

#### AMINOL 20
- **Catégorie** : Biostimulant anti-stress à base d'acides aminés
- **Action principale** : Protection contre les stress (sécheresse, chaleur, maladies)
- **Cultures cibles** : Cacao, café, poivre, toutes cultures sous stress
- **Dosage** : 1 L/Ha, absorption foliaire immédiate
- **Avantages** : Récupération rapide, renforce l'immunité naturelle
- **Usage urgent** : À utiliser dès les premiers signes de stress

#### NATUR CARE
- **Catégorie** : Engrais organique liquide
- **Formule** : NPK complet d'origine organique
- **Action principale** : Restauration de la fertilité des sols
- **Cultures cibles** : Toutes cultures, idéal pour sols appauvris
- **Dosage** : 5 L/Ha en irrigation ou pulvérisation
- **Avantages** : Améliore la vie microbienne du sol, action durable
- **Certification** : Compatible avec l'agriculture biologique

### GUIDES TECHNIQUES

#### Agriculture Urbaine
- Balcons et terrasses : utiliser HUMIFORTE + FOSNUTREN en demi-dosage
- Potager en sac/bac : NATUR CARE pour enrichir le substrat
- Micro-pousses : pas de fertilisant nécessaire les 15 premiers jours
- Hydroponique : AMINOL 20 + FOSNUTREN en solution nutritive diluée (1/4 dose)

#### Calendrier Cultural Cameroun
- **Saison des pluies (Mars-Juin)** : Appliquer HUMIFORTE + AMINOL en préventif
- **Grande saison sèche (Juillet-Sept)** : AMINOL 20 obligatoire pour anti-stress
- **Deuxième saison des pluies (Sept-Nov)** : FOSNUTREN + KADOSTIM pour les récoltes
- **Petite saison sèche (Déc-Fév)** : NATUR CARE pour restaurer les sols

#### Problèmes Courants et Solutions
- **Jaunissement des feuilles** : Probablement carence en azote → HUMIFORTE immédiatement
- **Peu de fruits** : Carence en phosphore → FOSNUTREN 20
- **Fruits petits/mauvaise qualité** : KADOSTIM 20 en post-floraison
- **Plantes flasques après chaleur** : Stress hydrique → AMINOL 20 + arrosage
- **Sol compacté/stérile** : NATUR CARE + labour léger
- **Maladies fongiques (mildiou, etc.)** : Renforcer avec AMINOL + fongicide partenaire
- **Chute des fleurs** : Appliquer FOSNUTREN dès apparition des boutons

#### Dosages par Culture (tableau résumé)
| Culture | Phase végétative | Phase florale | Phase fructification |
|---------|-----------------|---------------|---------------------|
| Tomate | HUMIFORTE 1L/Ha | FOSNUTREN 1.5L/Ha | KADOSTIM 2L/Ha |
| Cacao | HUMIFORTE 2L/Ha | AMINOL 1L/Ha | KADOSTIM 2L/Ha |
| Café | HUMIFORTE 1L/Ha | FOSNUTREN 1L/Ha | KADOSTIM 1.5L/Ha |
| Maïs | HUMIFORTE 2L/Ha | FOSNUTREN 1L/Ha | NATUR CARE 5L/Ha |
| Légumes | HUMIFORTE 1L/Ha | FOSNUTREN 1L/Ha | - |

### SERVICES ET COMMANDES
- Commande en ligne : https://agri-ps.com/produits
- Livraison Yaoundé : 24-48h
- Livraison régions : 3-7 jours ouvrables
- Paiement : Mobile Money (MTN/Orange), Campost, virement
- Retours/SAV : Dans les 7 jours suivant la livraison
- Formation : Sessions disponibles sur demande pour groupements d'agriculteurs
- Consultation terrain : Sur rendez-vous, +237 657 39 39 39
`;

// ─────────────────────────────────────────────
// TOOLS (Function Calling OpenAI)
// ─────────────────────────────────────────────
const tools: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'get_products',
      description: 'Consulte le catalogue produits en temps réel depuis la base de données. Utiliser pour donner des infos sur les prix, stocks et caractéristiques actuels.',
      parameters: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            description: 'Catégorie optionnelle du produit',
          },
          name: {
            type: 'string',
            description: 'Nom ou mot-clé du produit recherché',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'check_order_status',
      description: "Vérifie le statut d'une commande client via son numéro de commande.",
      parameters: {
        type: 'object',
        required: ['orderNumber'],
        properties: {
          orderNumber: {
            type: 'string',
            description: 'Numéro de commande (ex: AP-2026-00123)',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_product_recommendation',
      description: 'Génère une recommandation produit personnalisée selon la culture, le problème et la région.',
      parameters: {
        type: 'object',
        required: ['culture'],
        properties: {
          culture: { type: 'string', description: 'Type de culture (tomate, cacao, café, etc.)' },
          problem: { type: 'string', description: 'Problème ou objectif (croissance, floraison, anti-stress, etc.)' },
          surface: { type: 'string', description: 'Surface en hectares ou description (balcon, 1Ha, etc.)' },
        },
      },
    },
  },
];

// ─────────────────────────────────────────────
// EXÉCUTION DES TOOLS
// ─────────────────────────────────────────────
async function executeTool(name: string, args: Record<string, string>): Promise<string> {
  try {
    await connectDB();

    if (name === 'get_products') {
      const query: Record<string, unknown> = { isActive: true };
      if (args.category) query.category = args.category;
      if (args.name) query.name = { $regex: args.name, $options: 'i' };

      const products = await Product.find(query)
        .select('name price promoPrice stock features description category variants')
        .limit(5)
        .lean();

      if (!products.length) return 'Aucun produit trouvé pour ces critères.';

      return (products as Record<string, unknown>[]).map((p) => {
        const features = p.features as Record<string, unknown> | undefined;
        const variants = p.variants as Array<{ name: string; price: number; stock: number }> | undefined;
        return `**${p.name}** - ${(p.promoPrice as number) || (p.price as number)} F CFA\n` +
          `Stock: ${(p.stock as number) > 0 ? `${p.stock} unités disponibles` : 'En rupture'}\n` +
          `${features?.npk ? `NPK: ${features.npk}\n` : ''}` +
          `${features?.dosage ? `Dosage: ${features.dosage}\n` : ''}` +
          `${features?.cultures ? `Cultures: ${(features.cultures as string[]).join(', ')}\n` : ''}` +
          `${variants?.length ? `Formats: ${variants.map((v) => v.name).join(', ')}` : ''}`;
      }).join('\n\n');
    }

    if (name === 'check_order_status') {
      const order = await Order.findOne({ orderNumber: args.orderNumber })
        .select('orderNumber status paymentStatus total createdAt')
        .lean() as Record<string, unknown> | null;

      if (!order) return `Commande "${args.orderNumber}" introuvable. Vérifiez le numéro ou contactez-nous.`;

      const statusLabels: Record<string, string> = {
        pending: '⏳ En attente de paiement',
        confirmed: '✅ Confirmée',
        processing: '🔄 En préparation',
        shipped: '🚚 Expédiée',
        delivered: '📦 Livrée',
        cancelled: '❌ Annulée',
      };

      return `Commande **${order.orderNumber}**\n` +
        `Statut: ${statusLabels[order.status as string] || order.status}\n` +
        `Paiement: ${order.paymentStatus}\n` +
        `Montant: ${order.total} F CFA\n` +
        `Date: ${new Date(order.createdAt as Date).toLocaleDateString('fr-FR')}`;
    }

    if (name === 'get_product_recommendation') {
      const cultureMap: Record<string, string> = {
        tomate: 'HUMIFORTE (croissance végétative), FOSNUTREN 20 (floraison), KADOSTIM 20 (qualité fruits)',
        cacao: 'HUMIFORTE (végétatif), AMINOL 20 (anti-stress), KADOSTIM 20 (post-floraison)',
        café: 'HUMIFORTE + FOSNUTREN (floraison), KADOSTIM 20 (fructification)',
        maïs: 'HUMIFORTE (montaison), FOSNUTREN (pollinisation), NATUR CARE (restauration sol)',
        légumes: 'HUMIFORTE + FOSNUTREN en alternance toutes les 2 semaines',
        agrumes: 'HUMIFORTE (feuillage dense), KADOSTIM 20 (calibre), NATUR CARE (sol)',
        default: 'HUMIFORTE pour démarrer, puis FOSNUTREN ou KADOSTIM selon la phase',
      };

      const key = Object.keys(cultureMap).find(k => args.culture.toLowerCase().includes(k)) || 'default';
      let response = `**Recommandation pour ${args.culture}** :\n${cultureMap[key]}`;

      if (args.problem?.toLowerCase().includes('stress') || args.problem?.toLowerCase().includes('sécheresse')) {
        response += '\n\n🚨 **Urgence stress** : AMINOL 20 immédiatement, 1L/Ha en foliar.';
      }
      if (args.surface) {
        response += `\n\n📏 Surface ${args.surface} : Appelez pour un devis personnalisé → +237 657 39 39 39.`;
      }
      return response;
    }

    return 'Tool non reconnu.';
  } catch (err) {
    console.error('AgriBot tool error:', err);
    return 'Impossible de récupérer les données. Contactez-nous directement.';
  }
}

// ─────────────────────────────────────────────
// DÉTECTION DE TAGS (apprentissage automatique)
// ─────────────────────────────────────────────
function extractTags(message: string): string[] {
  const tagMap: Record<string, string[]> = {
    produit: ['humiforte', 'fosnutren', 'kadostim', 'aminol', 'natur care', 'prix', 'stock'],
    culture: ['tomate', 'cacao', 'café', 'maïs', 'légume', 'agrume', 'poivron', 'concombre'],
    probleme: ['maladie', 'jaunissement', 'stress', 'carence', 'insecte', 'sécheresse'],
    commande: ['commande', 'livraison', 'paiement', 'suivi', 'retour'],
    urbain: ['balcon', 'terrasse', 'pot', 'jardin', 'appartement'],
  };
  const lower = message.toLowerCase();
  return Object.entries(tagMap)
    .filter(([, keywords]) => keywords.some(k => lower.includes(k)))
    .map(([tag]) => tag);
}

// ─────────────────────────────────────────────
// SYSTEM PROMPT DYNAMIQUE
// ─────────────────────────────────────────────
const SYSTEM_PROMPT = `Tu es **AgriBot** 🌱, l'assistant IA officiel d'AGRI POINT SERVICE au Cameroun.

Tu es expert en agriculture tropicale, biofertilisants et conseil agronomique.

## CONNAISSANCE MÉTIER COMPLÈTE
${KNOWLEDGE_BASE}

## RÈGLES DE COMPORTEMENT
1. **Réponses concises** : 150-250 mots max, format markdown avec émojis pertinents
2. **Utiliser les tools** quand on te demande : un prix, un stock, un suivi de commande, ou une recommandation précise par culture
3. **CTA systématique** : Finir par un appel à l'action (WhatsApp, commande, appel)
4. **Langage** : Français adapté au contexte camerounais, professionnel mais accessible
5. **Cross-sell intelligent** : Si l'utilisateur cite une culture, propose le pack adapté à toutes ses phases
6. **Escalade** : Si problème complexe ou urgent (pathologie grave, urgence terrain), proposer contact direct

## FORMAT DES RÉPONSES
- Utilise **gras**, *italique*, listes à puces et tableaux markdown
- Commence par une ligne contextuelle rapide
- Termine TOUJOURS par une action concrète

## CONTACTS AGRI POINT
📞 +237 657 39 39 39 | 💬 WhatsApp: 676026601 | ✉️ infos@agri-ps.com
🌐 https://agri-ps.com | Commander: https://agri-ps.com/produits`;

// ─────────────────────────────────────────────
// ROUTE PRINCIPALE (STREAMING SSE)
// ─────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const { message, history = [], sessionId, metadata = {} } = await req.json();

  if (!message?.trim()) {
    return new Response(JSON.stringify({ error: 'Message requis' }), { status: 400 });
  }

  // Mode démo sans clé OpenAI
  if (!process.env.OPENAI_API_KEY) {
    const demo = getDemoResponse(message);
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        const words = demo.split(' ');
        let i = 0;
        const interval = setInterval(() => {
          if (i < words.length) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'token', token: words[i] + ' ' })}\n\n`));
            i++;
          } else {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', tags: [] })}\n\n`));
            clearInterval(interval);
            controller.close();
          }
        }, 25);
      },
    });
    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
    });
  }

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.slice(-8).map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user', content: message },
  ];

  const encoder = new TextEncoder();
  let fullContent = '';
  let totalTokens = 0;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        // Première passe : peut invoquer des tools (function calling)
        const firstPass = await openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages,
          tools,
          tool_choice: 'auto',
          temperature: 0.7,
          max_tokens: 600,
        });

        const firstChoice = firstPass.choices[0];
        totalTokens = firstPass.usage?.total_tokens || 0;

        if (firstChoice.finish_reason === 'tool_calls' && firstChoice.message.tool_calls) {
          send({ type: 'tool_start', message: '🔍 Consultation de la base de données...' });

          const toolMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
            ...messages,
            firstChoice.message,
          ];

          for (const toolCall of firstChoice.message.tool_calls) {
            const args = JSON.parse(toolCall.function.arguments || '{}') as Record<string, string>;
            const result = await executeTool(toolCall.function.name, args);
            toolMessages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: result,
            });
          }

          // Deuxième passe en vrai streaming avec les résultats des tools
          const secondStream = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            messages: toolMessages,
            temperature: 0.7,
            max_tokens: 600,
            stream: true,
          });

          for await (const chunk of secondStream) {
            const token = chunk.choices[0]?.delta?.content || '';
            if (token) {
              fullContent += token;
              send({ type: 'token', token });
            }
          }
        } else {
          // Réponse directe sans tool → pseudo-streaming token par token
          const directContent = firstChoice.message.content || '';
          fullContent = directContent;
          const words = directContent.split(/(\s+)/);
          for (const word of words) {
            if (word) {
              send({ type: 'token', token: word });
              await new Promise(r => setTimeout(r, 12));
            }
          }
        }

        const tags = extractTags(message);
        send({ type: 'done', tags });

        // Persistance MongoDB en background (non-bloquant)
        if (sessionId) {
          connectDB().then(async () => {
            try {
              await ChatConversation.findOneAndUpdate(
                { sessionId },
                {
                  $push: {
                    messages: {
                      $each: [
                        { role: 'user', content: message, timestamp: new Date() },
                        { role: 'assistant', content: fullContent, timestamp: new Date(), tokens: totalTokens },
                      ],
                    },
                  },
                  $addToSet: { tags: { $each: tags } },
                  $inc: { 'metadata.totalTokens': totalTokens },
                  $set: {
                    'metadata.page': (metadata as Record<string, string>).page || '/',
                    'metadata.model': process.env.OPENAI_MODEL || 'gpt-4o-mini',
                  },
                },
                { upsert: true, new: true }
              );
            } catch (e) {
              console.error('AgriBot DB save error:', e);
            }
          }).catch(() => {/* silently ignore DB errors */});
        }

        controller.close();
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : 'Erreur inconnue';
        console.error('AgriBot streaming error:', errMsg);
        send({ type: 'error', message: 'Erreur technique. Contactez-nous au +237 657 39 39 39.' });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'X-Content-Type-Options': 'nosniff',
      Connection: 'keep-alive',
    },
  });
}

// ─────────────────────────────────────────────
// ENDPOINT FEEDBACK (apprentissage continu 👍/👎)
// ─────────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  try {
    const { sessionId, messageIndex, feedback } = await req.json() as {
      sessionId: string;
      messageIndex: number;
      feedback: 'positive' | 'negative';
    };
    if (!sessionId || !feedback) return new Response('KO', { status: 400 });

    await connectDB();
    const delta = feedback === 'positive' ? 5 : -5;

    await ChatConversation.findOneAndUpdate(
      { sessionId },
      {
        $set: { [`messages.${messageIndex}.feedback`]: feedback },
        $inc: { 'metadata.feedbackScore': delta },
      }
    );

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response('KO', { status: 500 });
  }
}

// ─────────────────────────────────────────────
// RÉPONSES DÉMO (sans clé OpenAI)
// ─────────────────────────────────────────────
function getDemoResponse(message: string): string {
  const m = message.toLowerCase();

  if (m.includes('tomate')) {
    return `🍅 **Recommandation pour vos tomates** :

**Phase végétative** → HUMIFORTE (1 L/Ha)
**Phase florale** → FOSNUTREN 20 (1.5 L/Ha)
**Fructification** → KADOSTIM 20 (2 L/Ha)

Répéter toutes les 2-3 semaines. Pour un conseil personnalisé :
📞 +237 657 39 39 39 | 💬 WhatsApp: 676026601`;
  }

  if (m.includes('prix') || m.includes('commande') || m.includes('acheter')) {
    return `🛒 **Commander nos produits** :

Visitez notre boutique → [agri-ps.com/produits](https://agri-ps.com/produits)

Ou contactez directement :
📞 +237 657 39 39 39
💬 WhatsApp: 676026601
✉️ infos@agri-ps.com

Livraison Yaoundé : 24-48h • Régions : 3-7 jours`;
  }

  if (m.includes('urbain') || m.includes('balcon') || m.includes('terrasse')) {
    return `🏙️ **Agriculture urbaine avec AGRI POINT** :

✅ **HUMIFORTE** + **FOSNUTREN 20** à demi-dosage pour balcons
✅ **NATUR CARE** pour enrichir votre substrat
✅ Application tous les 15 jours

Idéal : tomates cerises, herbes aromatiques, poivrons, laitues.

Des kits urbains sont disponibles ! Appelez le **+237 657 39 39 39**`;
  }

  if (m.includes('cacao') || m.includes('café')) {
    return `☕ **Pour le cacao et le café** :

- 🌱 **HUMIFORTE** : NPK croissance végétative
- 💪 **AMINOL 20** : Anti-stress absorption immédiate
- 🍫 **KADOSTIM 20** : Qualité et calibre post-floraison

Meilleure résistance aux maladies, fructification optimale.

Calendrier d'application sur mesure disponible !
📞 +237 657 39 39 39`;
  }

  if (m.includes('jaun') || m.includes('maladie') || m.includes('stress')) {
    return `🚨 **Diagnostic urgent** :

- **Jaunissement** → Carence azote : **HUMIFORTE** immédiatement
- **Stress sécheresse** → **AMINOL 20** 1L/Ha en foliar
- **Maladies fongiques** → **AMINOL 20** + fongicide

Pour un diagnostic précis de votre situation :
📞 +237 657 39 39 39 | 💬 WhatsApp: 676026601`;
  }

  return `🌱 Bonjour ! Je suis **AgriBot**, conseiller expert d'AGRI POINT SERVICE.

Je peux vous aider sur :
- 🌾 Conseils par culture (tomate, cacao, café, maïs…)
- 💊 Recommandations de biofertilisants
- 🏙️ Agriculture urbaine
- 📦 Suivi de commandes et prix

Posez votre question ou choisissez un sujet !
📞 +237 657 39 39 39 | 💬 WhatsApp: 676026601`;
}

