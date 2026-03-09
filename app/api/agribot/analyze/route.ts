// ═══════════════════════════════════════════════════════════════════
// AGRIBOT VISION — Analyse photo de maladies de plantes (GPT-4o)
// POST /api/agribot/analyze
// Body: multipart/form-data — champ "image" (File) + "context" (string optionnel)
// ═══════════════════════════════════════════════════════════════════
import { NextRequest } from 'next/server';
import OpenAI from 'openai';

function isOpenAIReady(): boolean {
  const k = process.env.OPENAI_API_KEY || '';
  return k.startsWith('sk-') && k.length > 30 && !k.includes('votre') && !k.includes('your');
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const VISION_SYSTEM_PROMPT = `Tu es un agronome expert basé au Cameroun avec 15 ans d'expérience en diagnostic phytosanitaire.
Tu analyses des photos de plantes malades ou en difficulté et tu fournis un diagnostic précis et des recommandations d'action immédiates.

## FORMAT DE RÉPONSE OBLIGATOIRE
Structurer TOUJOURS en 4 sections :

### 🔍 Diagnostic
- Nom du problème (maladie, carence, ravageur, stress hydrique...)
- Niveau de gravité : 🟢 Faible / 🟡 Moyen / 🔴 Grave
- Confiance du diagnostic : x%

### 🦠 Cause probable
- Agent pathogène / carence / cause abiotique
- Conditions favorisant l'apparition

### ⚡ Action immédiate (48h max)
- Traitement ou intervention à faire maintenant
- Produit recommandé si applicable (HUMIFORTE, NATUR CARE, FOSNUTREN, KADOSTIM, AMINOL FORTE...)
- Dose et mode d'application

### 🛡️ Prévention
- Comment éviter la récidive
- Produits préventifs recommandés

## RÈGLES
- Si l'image n'est PAS une plante → répondre poliment que tu ne peux analyser que des plantes
- Toujours mentionner si la confiance est faible (< 60%) et recommander un technicien terrain
- Adapter les conseils au contexte camerounais (cultures locales, disponibilité produits AGRIPOINT SERVICES)
- Terminer par : "📞 Besoin d'un technicien terrain ? +237 657 39 39 39"`;

export async function POST(req: NextRequest) {
  if (!isOpenAIReady()) {
    return Response.json(
      { error: 'Service Vision non disponible. Configurez OPENAI_API_KEY avec un modèle GPT-4o.', demo: true },
      { status: 503 }
    );
  }

  try {
    const formData = await req.formData();
    const imageFile = formData.get('image') as File | null;
    const context   = (formData.get('context') as string | null) || '';
    const memory    = JSON.parse((formData.get('memory') as string | null) || '{}') as {
      location?: string; mainCrops?: string[];
    };

    if (!imageFile) {
      return Response.json({ error: 'Image requise' }, { status: 400 });
    }

    // Validation taille & type
    if (imageFile.size > 5 * 1024 * 1024) {
      return Response.json({ error: 'Image trop grande (max 5 MB)' }, { status: 400 });
    }
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(imageFile.type)) {
      return Response.json({ error: 'Format non supporté. Utilisez JPEG, PNG ou WebP.' }, { status: 400 });
    }

    // Convertir en base64
    const bytes    = await imageFile.arrayBuffer();
    const base64   = Buffer.from(bytes).toString('base64');
    const mimeType = imageFile.type;

    // Construire le message utilisateur
    const userText = [
      context ? `Contexte : ${context}` : '',
      memory.location ? `Localisation : ${memory.location}` : '',
      memory.mainCrops?.length ? `Cultures : ${memory.mainCrops.join(', ')}` : '',
      'Analyse cette photo de plante et fournis un diagnostic complet.',
    ].filter(Boolean).join('\n');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 1000,
      messages: [
        { role: 'system', content: VISION_SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            { type: 'text', text: userText },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64}`,
                detail: 'high',
              },
            },
          ],
        },
      ],
    });

    const diagnosis = response.choices[0]?.message?.content || 'Impossible d\'analyser cette image.';
    const tokens    = response.usage?.total_tokens || 0;

    return Response.json({
      diagnosis,
      tokens,
      model: 'gpt-4o',
      imageSize: imageFile.size,
    });
  } catch (err: unknown) {
    console.error('Vision analysis error:', err instanceof Error ? err.message : err);

    // Fallback si pas de GPT-4o mais GPT-4o-mini dispo
    if (err instanceof Error && err.message.includes('model')) {
      return Response.json({
        error: 'Modèle GPT-4o requis pour l\'analyse photo. Votre clé OpenAI ne supporte pas ce modèle.',
        fallback: true,
      }, { status: 503 });
    }

    return Response.json({ error: 'Erreur lors de l\'analyse. Réessayez.' }, { status: 500 });
  }
}
