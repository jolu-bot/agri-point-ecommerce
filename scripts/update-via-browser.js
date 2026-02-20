/**
 * MISE À JOUR DES CHEMINS D'IMAGES VIA API
 * À exécuter depuis le navigateur (console DevTools) sur https://agri-ps.com
 */

// Copier-coller ce code dans la console du navigateur (DevTools) sur agri-ps.com

async function updateImagePathsViaAPI() {
  console.log('Mise a jour des chemins d\'images...\n');
  
  try {
    // Récupérer tous les produits
    const response = await fetch('/api/products');
    const data = await response.json();
    const products = data.products;
    
    console.log(`${products.length} produits trouves\n`);
    
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
      console.log('Tous les chemins sont deja a jour !');
      return;
    }
    
    console.log(`${updates.length} produit(s) a mettre a jour:\n`);
    updates.forEach(u => {
      console.log(`  ${u.name}: ${u.oldImage} -> ${u.newImage}`);
    });
    
    console.log('\nPour appliquer, executez updateProductImages() dans la console');
    
    // Exposer la fonction de mise a jour
    window.updateProductImages = async function() {
      console.log('\nMise a jour en cours...\n');
      
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
            console.log(`OK: ${update.name}`);
          } else {
            console.log(`ERREUR ${update.name}: ${res.status}`);
          }
        } catch (error) {
          console.log(`ERREUR ${update.name}: ${error.message}`);
        }
      }
      
      console.log('\nMise a jour terminee !');
      console.log('Rechargez la page pour voir les changements');
    };
    
    console.log('\nFonction updateProductImages() prete a etre executee');
    
  } catch (error) {
    console.error('Erreur:', error);
  }
}

// Lancer automatiquement
updateImagePathsViaAPI();
