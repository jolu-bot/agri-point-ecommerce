'use client';

import ResponsiveContainer from '@/components/ui/ResponsiveContainer';
import { FluidHeading1, FluidHeading2, FluidHeading3, FluidParagraph } from '@/components/ui/ResponsiveText';

/**
 * Page de démonstration du système responsive
 * Utilisez cette page pour tester visuellement l'adaptation sur différents écrans
 */
export default function ResponsiveTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header de test */}
      <div className="bg-primary-600 text-white py-fluid-sm">
        <ResponsiveContainer>
          <FluidHeading1 className="text-white text-center">
            Test de Responsivité
          </FluidHeading1>
          <p className="text-center text-fluid-base mt-4 text-white/90">
            Redimensionnez votre navigateur pour voir les adaptations
          </p>
        </ResponsiveContainer>
      </div>

      <ResponsiveContainer className="py-fluid-md">
        {/* Indicateurs de taille d'écran */}
        <section className="mb-fluid-md">
          <FluidHeading2 className="mb-4">
            📱 Taille d&apos;écran actuelle
          </FluidHeading2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg text-center">
              <div className="xs:hidden text-2xl mb-2">📱</div>
              <div className="xs:hidden text-sm font-semibold">XS</div>
              <div className="xs:hidden text-xs text-gray-500">&lt; 475px</div>
              <div className="hidden xs:block text-green-500 text-2xl mb-2">✓</div>
              <div className="hidden xs:block text-sm font-semibold text-green-600">XS</div>
              <div className="hidden xs:block text-xs text-green-600">≥ 475px</div>
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg text-center">
              <div className="sm:hidden text-2xl mb-2">📱</div>
              <div className="sm:hidden text-sm font-semibold">SM</div>
              <div className="sm:hidden text-xs text-gray-500">&lt; 640px</div>
              <div className="hidden sm:block text-green-500 text-2xl mb-2">✓</div>
              <div className="hidden sm:block text-sm font-semibold text-green-600">SM</div>
              <div className="hidden sm:block text-xs text-green-600">≥ 640px</div>
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg text-center">
              <div className="md:hidden text-2xl mb-2">💻</div>
              <div className="md:hidden text-sm font-semibold">MD</div>
              <div className="md:hidden text-xs text-gray-500">&lt; 768px</div>
              <div className="hidden md:block text-green-500 text-2xl mb-2">✓</div>
              <div className="hidden md:block text-sm font-semibold text-green-600">MD</div>
              <div className="hidden md:block text-xs text-green-600">≥ 768px</div>
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg text-center">
              <div className="lg:hidden text-2xl mb-2">💻</div>
              <div className="lg:hidden text-sm font-semibold">LG</div>
              <div className="lg:hidden text-xs text-gray-500">&lt; 1024px</div>
              <div className="hidden lg:block text-green-500 text-2xl mb-2">✓</div>
              <div className="hidden lg:block text-sm font-semibold text-green-600">LG</div>
              <div className="hidden lg:block text-xs text-green-600">≥ 1024px</div>
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg text-center">
              <div className="xl:hidden text-2xl mb-2">🖥️</div>
              <div className="xl:hidden text-sm font-semibold">XL</div>
              <div className="xl:hidden text-xs text-gray-500">&lt; 1280px</div>
              <div className="hidden xl:block text-green-500 text-2xl mb-2">✓</div>
              <div className="hidden xl:block text-sm font-semibold text-green-600">XL</div>
              <div className="hidden xl:block text-xs text-green-600">≥ 1280px</div>
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg text-center">
              <div className="2xl:hidden text-2xl mb-2">🖥️</div>
              <div className="2xl:hidden text-sm font-semibold">2XL</div>
              <div className="2xl:hidden text-xs text-gray-500">&lt; 1536px</div>
              <div className="hidden 2xl:block text-green-500 text-2xl mb-2">✓</div>
              <div className="hidden 2xl:block text-sm font-semibold text-green-600">2XL</div>
              <div className="hidden 2xl:block text-xs text-green-600">≥ 1536px</div>
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg text-center">
              <div className="3xl:hidden text-2xl mb-2">🖥️</div>
              <div className="3xl:hidden text-sm font-semibold">3XL</div>
              <div className="3xl:hidden text-xs text-gray-500">&lt; 1920px</div>
              <div className="hidden 3xl:block text-green-500 text-2xl mb-2">✓</div>
              <div className="hidden 3xl:block text-sm font-semibold text-green-600">3XL</div>
              <div className="hidden 3xl:block text-xs text-green-600">≥ 1920px</div>
            </div>
          </div>
        </section>

        {/* Test de typographie fluide */}
        <section className="mb-fluid-md">
          <FluidHeading2 className="mb-4">
            ✍️ Typographie Fluide
          </FluidHeading2>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-fluid-sm space-y-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">text-fluid-6xl</div>
              <div className="text-fluid-6xl font-bold">Titre Hero XXL</div>
            </div>
            
            <div>
              <div className="text-xs text-gray-500 mb-1">text-fluid-5xl</div>
              <div className="text-fluid-5xl font-bold">Titre Principal</div>
            </div>
            
            <div>
              <div className="text-xs text-gray-500 mb-1">text-fluid-4xl</div>
              <div className="text-fluid-4xl font-bold">Titre H1</div>
            </div>
            
            <div>
              <div className="text-xs text-gray-500 mb-1">text-fluid-3xl</div>
              <div className="text-fluid-3xl font-bold">Titre H2</div>
            </div>
            
            <div>
              <div className="text-xs text-gray-500 mb-1">text-fluid-2xl</div>
              <div className="text-fluid-2xl font-semibold">Titre H3</div>
            </div>
            
            <div>
              <div className="text-xs text-gray-500 mb-1">text-fluid-xl</div>
              <div className="text-fluid-xl">Titre de carte</div>
            </div>
            
            <div>
              <div className="text-xs text-gray-500 mb-1">text-fluid-base</div>
              <FluidParagraph>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                Texte de corps principal qui s&apos;adapte automatiquement à la taille de l&apos;écran.
              </FluidParagraph>
            </div>
            
            <div>
              <div className="text-xs text-gray-500 mb-1">text-fluid-sm</div>
              <div className="text-fluid-sm text-gray-600">
                Texte secondaire ou descriptif
              </div>
            </div>
            
            <div>
              <div className="text-xs text-gray-500 mb-1">text-fluid-xs</div>
              <div className="text-fluid-xs text-gray-500">
                Labels, notes de bas de page
              </div>
            </div>
          </div>
        </section>

        {/* Test de grille responsive */}
        <section className="mb-fluid-md">
          <FluidHeading2 className="mb-4">
            📊 Grilles Responsive
          </FluidHeading2>
          
          <div className="space-y-8">
            {/* Grille auto-fit */}
            <div>
              <h3 className="text-fluid-lg font-semibold mb-3">Grid Auto-fit</h3>
              <div className="grid-auto-fit">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-primary-100 dark:bg-primary-900 rounded-lg p-4 text-center">
                    <div className="text-fluid-xl font-bold">Item {i}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Grille classique */}
            <div>
              <h3 className="text-fluid-lg font-semibold mb-3">
                Grid cols-1 sm:cols-2 lg:cols-3 xl:cols-4
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="bg-secondary-100 dark:bg-secondary-900 rounded-lg p-4 text-center">
                    <div className="text-fluid-xl font-bold">Card {i}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Test d'espacements fluides */}
        <section className="mb-fluid-md">
          <FluidHeading2 className="mb-4">
            📏 Espacements Fluides
          </FluidHeading2>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
            <div className="p-fluid-xs bg-blue-100 dark:bg-blue-900 border-b border-gray-200 dark:border-gray-700">
              <div className="text-sm font-mono">p-fluid-xs</div>
            </div>
            <div className="p-fluid-sm bg-green-100 dark:bg-green-900 border-b border-gray-200 dark:border-gray-700">
              <div className="text-sm font-mono">p-fluid-sm</div>
            </div>
            <div className="p-fluid-md bg-yellow-100 dark:bg-yellow-900 border-b border-gray-200 dark:border-gray-700">
              <div className="text-sm font-mono">p-fluid-md</div>
            </div>
            <div className="p-fluid-lg bg-purple-100 dark:bg-purple-900">
              <div className="text-sm font-mono">p-fluid-lg</div>
            </div>
          </div>
        </section>

        {/* Test de composants utilitaires */}
        <section className="mb-fluid-md">
          <FluidHeading2 className="mb-4">
            🎨 Composants Utilitaires
          </FluidHeading2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-fluid-lg font-semibold mb-2">Boutons</h3>
              <div className="flex flex-wrap gap-3">
                <button className="btn-primary">Primary</button>
                <button className="btn-secondary">Secondary</button>
                <button className="btn-outline">Outline</button>
              </div>
            </div>

            <div>
              <h3 className="text-fluid-lg font-semibold mb-2">Cartes</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="card">
                  <h4 className="text-fluid-xl font-bold mb-2">Carte 1</h4>
                  <p className="text-fluid-sm text-gray-600 dark:text-gray-400">
                    Avec padding fluide qui s&apos;adapte
                  </p>
                </div>
                <div className="card">
                  <h4 className="text-fluid-xl font-bold mb-2">Carte 2</h4>
                  <p className="text-fluid-sm text-gray-600 dark:text-gray-400">
                    Hover pour voir l&apos;effet
                  </p>
                </div>
                <div className="card">
                  <h4 className="text-fluid-xl font-bold mb-2">Carte 3</h4>
                  <p className="text-fluid-sm text-gray-600 dark:text-gray-400">
                    Responsive automatique
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-fluid-lg font-semibold mb-2">Formulaires</h3>
              <div className="max-w-md space-y-3">
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Email"
                />
                <input 
                  type="password" 
                  className="input-field" 
                  placeholder="Mot de passe"
                />
                <button className="btn-primary w-full">
                  Se connecter
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Test de visibilité conditionnelle */}
        <section className="mb-fluid-md">
          <FluidHeading2 className="mb-4">
            👁️ Visibilité Conditionnelle
          </FluidHeading2>
          
          <div className="space-y-3">
            <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-lg hide-mobile">
              <div className="font-semibold">Caché sur mobile (hide-mobile)</div>
              <div className="text-sm">Visible uniquement sur tablette et desktop</div>
            </div>
            
            <div className="p-4 bg-green-100 dark:bg-green-900 rounded-lg show-mobile">
              <div className="font-semibold">Visible sur mobile (show-mobile)</div>
              <div className="text-sm">Caché sur tablette et desktop</div>
            </div>
            
            <div className="p-4 bg-purple-100 dark:bg-purple-900 rounded-lg hidden lg:block">
              <div className="font-semibold">Desktop uniquement (hidden lg:block)</div>
              <div className="text-sm">Visible uniquement sur écrans ≥1024px</div>
            </div>
          </div>
        </section>

        {/* Recommandations */}
        <section className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-fluid-sm">
          <FluidHeading3 className="mb-4">
            💡 Recommandations
          </FluidHeading3>
          
          <ul className="space-y-2 text-fluid-base">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Utilisez les classes <code className="bg-primary-100 dark:bg-primary-900 px-2 py-1 rounded">text-fluid-*</code> pour une typographie adaptative</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Préférez <code className="bg-primary-100 dark:bg-primary-900 px-2 py-1 rounded">grid-auto-fit</code> pour des grilles vraiment responsives</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Testez sur plusieurs tailles : mobile (375px), tablette (768px), desktop (1280px), 4K (2560px)</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Assurez-vous que le texte reste lisible (min 16px pour le corps)</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Zones de toucher sur mobile : minimum 44x44px (appliqué automatiquement)</span>
            </li>
          </ul>
        </section>
      </ResponsiveContainer>
    </div>
  );
}
