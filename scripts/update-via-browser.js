/**
 * MISE À JOUR DES CHEMINS D'IMAGES VIA API
 * À exécuter depuis le navigateur (console DevTools) sur https://blue-goose-561723.hostingersite.com
 */

// Copier-coller ce code dans la console du navigateur de votre site Hostinger

async function updateImagePathsViaAPI() {
  console.log('🔄 Mise à jour des chemins d'images...\n');
  
  try {
    // Récupérer tous les produits
    const response = await fetch('/api/products');
    const data = await response.json();
    const products = data.products;
    
    console.log(`📦 ${products.length} produits trouvés\n`);
    
    const updates = [];
    
    for (const product of products) {
      const oldImage = product.images[0];
      const newImage = oldImage
        .replace('.jpeg', '.webp')
        .replace('.jpg', '.webp');
      
      if (oldImage !== newImage) {
        updates.push({
          id: product._id,
          name: product.name,
          oldImage,
          newImage
        });
      }
    }
    
    if (updates.length === 0) {
      console.log('✅ Tous les chemins sont déjà à jour !');
      return;
    }
    
    console.log(`🔧 ${updates.length} produit(s) à mettre à jour:\n`);
    updates.forEach(u => {
      console.log(`  ${u.name}: ${u.oldImage} → ${u.newImage}`);
    });
    
    console.log('\n💡 Pour appliquer, exécutez updateProductImages() dans la console');
    
    // Exposer la fonction de mise à jour
    window.updateProductImages = async function() {
      console.log('\n🚀 Mise à jour en cours...\n');
      
      for (const update of updates) {
        try {
          const res = await fetch(`/api/admin/products/${update.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              images: [update.newImage]
            })
          });
          
          if (res.ok) {
            console.log(`✅ ${update.name}`);
          } else {
            console.log(`❌ ${update.name}: ${res.status}`);
          }
        } catch (error) {
          console.log(`❌ ${update.name}: ${error.message}`);
        }
      }
      
      console.log('\n🎉 Mise à jour terminée !');
      console.log('🔄 Rechargez la page pour voir les changements');
    };
    
    console.log('\n📝 Fonction updateProductImages() prête à être exécutée');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Lancer automatiquement
updateImagePathsViaAPI();
