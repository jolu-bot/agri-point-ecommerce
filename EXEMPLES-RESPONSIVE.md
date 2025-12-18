# 🎨 Exemples Pratiques - Composants Responsive

Ce fichier contient des exemples concrets d'utilisation du système responsive pour différents cas d'usage.

---

## 📝 1. Sections avec espacement fluide

```tsx
export default function Section() {
  return (
    <section className="py-fluid-lg">
      <div className="container-fluid">
        <h2 className="section-title text-center">
          Nos Solutions
        </h2>
        <p className="section-subtitle text-center max-w-3xl mx-auto">
          Découvrez notre gamme complète de produits
        </p>
        
        {/* Grille auto-adaptative */}
        <div className="grid-auto-fit">
          {/* Les cartes s'organisent automatiquement */}
        </div>
      </div>
    </section>
  );
}
```

---

## 🛒 2. Grille de produits multi-formats

```tsx
// ✅ S'adapte automatiquement de 1 à 4 colonnes
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
  {products.map(product => (
    <ProductCard key={product.id} product={product} />
  ))}
</div>

// ✅ Avec grid-auto-fit (encore plus simple)
<div className="grid-auto-fit">
  {products.map(product => (
    <ProductCard key={product.id} product={product} />
  ))}
</div>
```

---

## 📊 3. Stats/Métriques responsive

```tsx
export default function Stats() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
      <div className="text-center p-fluid-sm bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="text-fluid-4xl font-bold text-primary-600">
          20K+
        </div>
        <div className="text-fluid-sm text-gray-600 dark:text-gray-400 mt-2">
          Hectares cultivés
        </div>
      </div>
      
      <div className="text-center p-fluid-sm bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="text-fluid-4xl font-bold text-primary-600">
          10K+
        </div>
        <div className="text-fluid-sm text-gray-600 dark:text-gray-400 mt-2">
          Agriculteurs satisfaits
        </div>
      </div>
      
      <div className="text-center p-fluid-sm bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="text-fluid-4xl font-bold text-primary-600">
          50+
        </div>
        <div className="text-fluid-sm text-gray-600 dark:text-gray-400 mt-2">
          Produits bio
        </div>
      </div>
      
      <div className="text-center p-fluid-sm bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="text-fluid-4xl font-bold text-primary-600">
          100%
        </div>
        <div className="text-fluid-sm text-gray-600 dark:text-gray-400 mt-2">
          Satisfaction client
        </div>
      </div>
    </div>
  );
}
```

---

## 📄 4. Hero Section responsive complet

```tsx
export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container-fluid py-fluid-lg">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          
          {/* Colonne texte */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center px-fluid-xs py-2 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-4 md:mb-6">
              <span className="text-fluid-sm font-semibold text-primary-700 dark:text-primary-300">
                🌱 Nouveau
              </span>
            </div>
            
            {/* Titre principal fluide */}
            <h1 className="text-fluid-6xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6">
              Cultivez votre{' '}
              <span className="text-primary-600 dark:text-primary-400">
                succès
              </span>
            </h1>
            
            {/* Description fluide */}
            <p className="text-fluid-lg text-gray-600 dark:text-gray-300 mb-6 md:mb-8 max-w-2xl">
              Découvrez notre gamme complète de biofertilisants de qualité 
              pour booster vos rendements naturellement.
            </p>
            
            {/* CTA en stack sur mobile */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <button className="btn-primary">
                Découvrir nos produits
              </button>
              <button className="btn-outline">
                En savoir plus
              </button>
            </div>
          </div>
          
          {/* Colonne image - cachée sur très petits écrans */}
          <div className="hidden sm:block relative">
            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
              <Image 
                src="/hero-image.jpg" 
                alt="Agriculture moderne"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

---

## 🎴 5. Carte avec détails responsive

```tsx
export default function DetailedCard({ product }) {
  return (
    <div className="card">
      {/* Image responsive */}
      <div className="relative aspect-video md:aspect-square mb-4 rounded-lg overflow-hidden">
        <Image 
          src={product.image} 
          alt={product.name}
          fill
          className="object-cover hover:scale-110 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        
        {/* Badge promo */}
        {product.discount && (
          <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-red-500 text-white px-fluid-xs py-1 rounded-full">
            <span className="text-fluid-xs font-bold">
              -{product.discount}%
            </span>
          </div>
        )}
      </div>
      
      {/* Catégorie */}
      <div className="text-fluid-xs text-primary-600 dark:text-primary-400 font-semibold mb-2 uppercase tracking-wide">
        {product.category}
      </div>
      
      {/* Titre */}
      <h3 className="text-fluid-xl font-bold mb-2 text-gray-900 dark:text-white line-clamp-2">
        {product.name}
      </h3>
      
      {/* Description - limitée à 2 lignes sur mobile */}
      <p className="text-fluid-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 md:line-clamp-3">
        {product.description}
      </p>
      
      {/* Features - masonry sur desktop */}
      <ul className="grid grid-cols-2 gap-2 mb-4">
        {product.features?.slice(0, 4).map((feature, idx) => (
          <li key={idx} className="flex items-center text-fluid-xs text-gray-600 dark:text-gray-400">
            <span className="text-green-500 mr-1">✓</span>
            {feature}
          </li>
        ))}
      </ul>
      
      {/* Prix et actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div>
          {product.oldPrice && (
            <div className="text-fluid-sm text-gray-500 line-through">
              {product.oldPrice} FCFA
            </div>
          )}
          <div className="text-fluid-2xl font-bold text-primary-600">
            {product.price} FCFA
          </div>
        </div>
        
        <button className="btn-primary w-full sm:w-auto">
          Ajouter
        </button>
      </div>
    </div>
  );
}
```

---

## 📋 6. Formulaire responsive

```tsx
export default function ContactForm() {
  return (
    <form className="space-y-4 md:space-y-6 max-w-2xl mx-auto">
      {/* Champs en grille sur desktop */}
      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        <div>
          <label className="block text-fluid-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Prénom
          </label>
          <input 
            type="text" 
            className="input-field" 
            placeholder="Jean"
          />
        </div>
        
        <div>
          <label className="block text-fluid-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Nom
          </label>
          <input 
            type="text" 
            className="input-field" 
            placeholder="Dupont"
          />
        </div>
      </div>
      
      {/* Email pleine largeur */}
      <div>
        <label className="block text-fluid-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          Email
        </label>
        <input 
          type="email" 
          className="input-field" 
          placeholder="jean.dupont@email.com"
        />
      </div>
      
      {/* Message */}
      <div>
        <label className="block text-fluid-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          Message
        </label>
        <textarea 
          rows={4}
          className="input-field resize-none" 
          placeholder="Votre message..."
        />
      </div>
      
      {/* Bouton submit */}
      <button type="submit" className="btn-primary w-full sm:w-auto sm:px-12">
        Envoyer
      </button>
    </form>
  );
}
```

---

## 🎯 7. Navigation à onglets responsive

```tsx
export default function Tabs() {
  const [activeTab, setActiveTab] = useState('description');
  
  return (
    <div>
      {/* Onglets - défilement horizontal sur mobile */}
      <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <nav className="flex space-x-4 md:space-x-8 min-w-max md:min-w-0">
          <button
            onClick={() => setActiveTab('description')}
            className={`py-3 px-1 border-b-2 text-fluid-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'description'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Description
          </button>
          
          <button
            onClick={() => setActiveTab('features')}
            className={`py-3 px-1 border-b-2 text-fluid-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'features'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Caractéristiques
          </button>
          
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-3 px-1 border-b-2 text-fluid-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'reviews'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Avis clients
          </button>
        </nav>
      </div>
      
      {/* Contenu des onglets */}
      <div className="py-fluid-sm">
        <div className="text-fluid-base text-gray-700 dark:text-gray-300">
          {/* Contenu selon activeTab */}
        </div>
      </div>
    </div>
  );
}
```

---

## 🏷️ 8. Liste de prix responsive

```tsx
export default function PricingCards() {
  return (
    <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
      {/* Plan Starter */}
      <div className="card border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 transition-colors">
        <div className="text-center">
          <h3 className="text-fluid-xl font-bold mb-2">Starter</h3>
          <div className="text-fluid-sm text-gray-600 dark:text-gray-400 mb-4">
            Pour débuter
          </div>
          <div className="mb-6">
            <span className="text-fluid-5xl font-bold text-gray-900 dark:text-white">
              15K
            </span>
            <span className="text-fluid-lg text-gray-600 dark:text-gray-400">
              {' '}FCFA/mois
            </span>
          </div>
        </div>
        
        <ul className="space-y-3 mb-6">
          {['5 produits', 'Support email', 'Livraison standard'].map((item, idx) => (
            <li key={idx} className="flex items-center text-fluid-sm">
              <span className="text-green-500 mr-2">✓</span>
              {item}
            </li>
          ))}
        </ul>
        
        <button className="btn-outline w-full">
          Choisir
        </button>
      </div>
      
      {/* Plan Pro (populaire) */}
      <div className="card bg-primary-600 text-white transform scale-100 md:scale-105 shadow-2xl">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <div className="bg-secondary-500 text-white px-fluid-xs py-1 rounded-full text-fluid-xs font-bold">
            Populaire
          </div>
        </div>
        
        <div className="text-center">
          <h3 className="text-fluid-xl font-bold mb-2">Pro</h3>
          <div className="text-fluid-sm text-primary-100 mb-4">
            Pour les professionnels
          </div>
          <div className="mb-6">
            <span className="text-fluid-5xl font-bold">
              35K
            </span>
            <span className="text-fluid-lg text-primary-100">
              {' '}FCFA/mois
            </span>
          </div>
        </div>
        
        <ul className="space-y-3 mb-6">
          {['20 produits', 'Support prioritaire', 'Livraison express', 'Formation gratuite'].map((item, idx) => (
            <li key={idx} className="flex items-center text-fluid-sm">
              <span className="mr-2">✓</span>
              {item}
            </li>
          ))}
        </ul>
        
        <button className="bg-white text-primary-600 hover:bg-gray-100 font-semibold rounded-lg w-full py-3">
          Choisir
        </button>
      </div>
      
      {/* Plan Enterprise */}
      <div className="card border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 transition-colors">
        <div className="text-center">
          <h3 className="text-fluid-xl font-bold mb-2">Enterprise</h3>
          <div className="text-fluid-sm text-gray-600 dark:text-gray-400 mb-4">
            Pour les grandes exploitations
          </div>
          <div className="mb-6">
            <span className="text-fluid-5xl font-bold text-gray-900 dark:text-white">
              Sur mesure
            </span>
          </div>
        </div>
        
        <ul className="space-y-3 mb-6">
          {['Produits illimités', 'Support 24/7', 'Livraison personnalisée', 'Consultant dédié'].map((item, idx) => (
            <li key={idx} className="flex items-center text-fluid-sm">
              <span className="text-green-500 mr-2">✓</span>
              {item}
            </li>
          ))}
        </ul>
        
        <button className="btn-primary w-full">
          Nous contacter
        </button>
      </div>
    </div>
  );
}
```

---

## 🖼️ 9. Galerie d'images responsive

```tsx
export default function ImageGallery({ images }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
      {images.map((image, idx) => (
        <div 
          key={idx}
          className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer"
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          
          {/* Overlay au hover */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white text-fluid-sm font-semibold">
              Voir plus
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## 📱 10. Bottom Navigation (Mobile)

```tsx
export default function MobileBottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-40">
      <div className="grid grid-cols-4 gap-1 p-2">
        <Link href="/" className="flex flex-col items-center py-2 text-gray-600 dark:text-gray-400 hover:text-primary-600">
          <Home className="w-6 h-6 mb-1" />
          <span className="text-xs">Accueil</span>
        </Link>
        
        <Link href="/produits" className="flex flex-col items-center py-2 text-gray-600 dark:text-gray-400 hover:text-primary-600">
          <ShoppingBag className="w-6 h-6 mb-1" />
          <span className="text-xs">Boutique</span>
        </Link>
        
        <Link href="/panier" className="flex flex-col items-center py-2 text-gray-600 dark:text-gray-400 hover:text-primary-600">
          <ShoppingCart className="w-6 h-6 mb-1" />
          <span className="text-xs">Panier</span>
        </Link>
        
        <Link href="/compte" className="flex flex-col items-center py-2 text-gray-600 dark:text-gray-400 hover:text-primary-600">
          <User className="w-6 h-6 mb-1" />
          <span className="text-xs">Compte</span>
        </Link>
      </div>
    </nav>
  );
}
```

---

**💡 Conseil** : Testez toujours vos composants sur plusieurs tailles d'écran en utilisant les DevTools de votre navigateur !
