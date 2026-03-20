#!/usr/bin/env node
// scripts/seed-blog.js
// Seeds 3 sample blog articles in French
// Run: node -r dotenv/config scripts/seed-blog.js

const { MongoClient } = require('mongodb');

async function slugify(text) {
  return text.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const ARTICLES = [
  {
    title: 'Comment fertiliser le maïs avec SARAH NPK',
    excerpt: 'Le maïs est la culture de base au Cameroun. Découvrez comment optimiser sa fertilisation avec les engrais SARAH NPK pour doubler vos rendements.',
    category: 'fertilisation',
    author: 'Équipe AGRIPOINT',
    readTime: 6,
    tags: ['maïs', 'NPK', 'SARAH', 'fertilisation'],
    content: `<h2>Pourquoi fertiliser le maïs ?</h2>
<p>Le maïs est une grande consommatrice d'azote, de phosphore et de potassium. Sans apport extérieur, les sols camerounais s'épuisent rapidement, entraînant une chute dramatique des rendements.</p>

<h2>Le programme SARAH NPK recommandé</h2>
<p>AGRIPOINT recommande un programme en deux phases :</p>
<ol>
  <li><strong>Au semis :</strong> Apportez 100–150 kg/ha de <strong>SARAH NPK 10-30-10 50kg</strong> en placement dans le sillon, pour favoriser l'enracinement et la levée.</li>
  <li><strong>En couverture (30–45 jours) :</strong> Apportez 100 kg/ha d'<strong>Urée 46% 25kg</strong> ou de <strong>SARAH NPK 20-10-10 50kg</strong> pour soutenir la croissance végétative et la formation de l'épi.</li>
</ol>

<h2>Résultats attendus</h2>
<p>Avec ce programme, nos agriculteurs partenaires ont observé des rendements de <strong>3 à 5 tonnes/ha</strong> contre 1 à 1,5 t/ha sans intrants. Soit un gain moyen de <strong>+200%</strong>.</p>

<blockquote><p>"La première saison avec SARAH NPK, j'ai récupéré mon investissement dès le premier mois de vente." — Jean-Baptiste N., agriculteur à Bafoussam</p></blockquote>
`,
  },
  {
    title: 'Sol vivant : pourquoi les biofertilisants changent tout',
    excerpt: 'Les biofertilisants AMINOL, KADOSTIM et HUMIFORTE ne sont pas de simples engrais — ils régénèrent la vie microbienne de votre sol. Voici comment.',
    category: 'sol',
    author: 'Dr. Amélie Fouda, Agronome',
    readTime: 8,
    tags: ['biofertilisant', 'sol', 'microbiome', 'AMINOL', 'HUMIFORTE'],
    content: `<h2>Le sol est vivant</h2>
<p>Un sol agricole sain contient jusqu'à <strong>1 milliard de micro-organismes par gramme</strong>. Ces bactéries, champignons et vers de terre décomposent la matière organique, fixent l'azote atmosphérique et rendent les nutriments assimilables pour les plantes.</p>

<h2>Le problème des engrais chimiques seuls</h2>
<p>L'utilisation exclusive d'engrais minéraux acidifie le sol, détruit les micro-organismes bénéfiques et crée une <em>dépendance chimique</em>. À terme, il faut de plus en plus d'engrais pour obtenir les mêmes rendements.</p>

<h2>La solution AGRIPOINT : combinaison biominérale</h2>
<p>Notre gamme biofertilisante :</p>
<ul>
  <li><strong>AMINOL</strong> : acides aminés + micronutriments → stimule la photosynthèse</li>
  <li><strong>HUMIFORTE</strong> : acides humiques et fulviques → améliore la structure du sol</li>
  <li><strong>KADOSTIM</strong> : algues brown + minéraux → active les défenses naturelles</li>
  <li><strong>FOSNUTREN</strong> : phosphore organique → améliore l'absorption racinaire</li>
</ul>

<h2>Comment les utiliser ?</h2>
<p>Appliquer en pulvérisation foliaire, dilués à 2–5 mL/L, tous les 15–21 jours. Combiner avec le programme NPK SARAH pour des résultats optimaux.</p>
`,
  },
  {
    title: 'Maraîchage urbain rentable avec le Kit Urbain AGRIPOINT',
    excerpt: 'Cultivez tomates, légumes et herbes aromatiques dans votre cour ou sur votre terrasse avec le Kit Urbain Débutant AGRIPOINT — un investissement rentable dès le premier mois.',
    category: 'culture',
    author: 'Marie-Claire Essono',
    readTime: 5,
    tags: ['maraîchage', 'urbain', 'kit', 'tomate', 'légumes'],
    content: `<h2>Le maraîchage urbain : une opportunité au Cameroun</h2>
<p>Avec la montée des prix des légumes en ville, cultiver chez soi est devenu une stratégie économique efficace. En seulement <strong>2 m²</strong>, un ménage peut produire des tomates, des épinards et du basilic pour une consommation hebdomadaire.</p>

<h2>Le Kit Urbain Débutant AGRIPOINT</h2>
<p>Pour 35 000 FCFA, le kit comprend :</p>
<ul>
  <li>1 bidon AMINOL 1L (stimulant racinaire)</li>
  <li>1 bidon KADOSTIM 1L (protection naturelle)</li>
  <li>1 bidon HUMIFORTE 1L (structure du substrat)</li>
  <li>1 bidon FOSNUTREN 1L (nutrition phosphatée)</li>
</ul>

<h2>Résultats typiques sur 3 mois</h2>
<p>Avec un investissement de départ de 35 000 FCFA en intrants + substrat, nos utilisateurs urbains récoltent en moyenne :</p>
<ul>
  <li>15 à 20 kg de tomates (valeur marchande : 10 000–15 000 FCFA)</li>
  <li>5 kg d'épinards par mois (valeur : 3 000–5 000 FCFA)</li>
</ul>
<p>Soit un retour sur investissement en <strong>moins de 2 mois</strong>.</p>
`,
  },
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error('MONGODB_URI manquant'); process.exit(1); }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const coll = db.collection('blogposts');

  let inserted = 0;
  for (const article of ARTICLES) {
    const slug = await slugify(article.title);
    const exists = await coll.findOne({ slug });
    if (exists) { console.log(`Skipped (exists): ${slug}`); continue; }
    await coll.insertOne({
      ...article,
      slug,
      isPublished: true,
      publishedAt: new Date(),
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`Inserted: ${slug}`);
    inserted++;
  }

  console.log(`Done — ${inserted} articles seeded.`);
  await client.close();
}

main().catch(err => { console.error(err); process.exit(1); });
