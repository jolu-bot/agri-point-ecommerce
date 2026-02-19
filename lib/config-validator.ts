/**
 * Système de Validation Intelligente pour SiteConfig
 * Valide les configurations avant sauvegarde pour éviter les erreurs
 */

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  suggestion?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  suggestions: ValidationError[];
}

/**
 * Valider une configuration complète
 */
export async function validateSiteConfig(config: any): Promise<ValidationResult> {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const suggestions: ValidationError[] = [];

  // === BRANDING VALIDATION ===
  if (config.branding) {
    validateBranding(config.branding, errors, warnings, suggestions);
  }

  // === HEADER VALIDATION ===
  if (config.header) {
    validateHeader(config.header, errors, warnings, suggestions);
  }

  // === COLORS VALIDATION ===
  if (config.colors) {
    validateColors(config.colors, errors, warnings, suggestions);
  }

  // === MODULES VALIDATION ===
  if (config.modules) {
    validateModules(config.modules, errors, warnings, suggestions);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    suggestions
  };
}

/**
 * Valider la section Branding
 */
function validateBranding(
  branding: any,
  errors: ValidationError[],
  warnings: ValidationError[],
  suggestions: ValidationError[]
) {
  // Site Name requis
  if (!branding.siteName || branding.siteName.trim() === '') {
    errors.push({
      field: 'branding.siteName',
      message: 'Le nom du site est obligatoire',
      severity: 'error'
    });
  } else {
    // Vérifier longueur
    if (branding.siteName.length < 3) {
      warnings.push({
        field: 'branding.siteName',
        message: 'Le nom du site est très court (< 3 caractères)',
        severity: 'warning',
        suggestion: 'Un nom plus descriptif améliore le SEO'
      });
    }
    if (branding.siteName.length > 60) {
      warnings.push({
        field: 'branding.siteName',
        message: 'Le nom du site est très long (> 60 caractères)',
        severity: 'warning',
        suggestion: 'Les titres courts sont mieux pour le SEO'
      });
    }
  }

  // Logo URL validation
  if (branding.logoUrl) {
    if (!isValidUrl(branding.logoUrl) && !isRelativePath(branding.logoUrl)) {
      errors.push({
        field: 'branding.logoUrl',
        message: 'URL du logo invalide',
        severity: 'error',
        suggestion: 'Utilisez une URL complète ou un chemin relatif valide'
      });
    }
  }

  // Favicon validation
  if (branding.faviconUrl) {
    if (!isValidUrl(branding.faviconUrl) && !isRelativePath(branding.faviconUrl)) {
      warnings.push({
        field: 'branding.faviconUrl',
        message: 'URL du favicon potentiellement invalide',
        severity: 'warning'
      });
    }
  }

  // Tagline optimal length
  if (branding.tagline && branding.tagline.length > 100) {
    suggestions.push({
      field: 'branding.tagline',
      message: 'Le slogan est long',
      severity: 'info',
      suggestion: 'Les slogans courts (< 100 chars) sont plus mémorables'
    });
  }
}

/**
 * Valider la section Header
 */
function validateHeader(
  header: any,
  errors: ValidationError[],
  warnings: ValidationError[],
  suggestions: ValidationError[]
) {
  // Logo sizes validation
  if (header.logo?.sizes) {
    const sizes = header.logo.sizes;
    ['mobile', 'tablet', 'desktop'].forEach(device => {
      if (sizes[device]) {
        if (!isValidTailwindSize(sizes[device])) {
          errors.push({
            field: `header.logo.sizes.${device}`,
            message: 'Taille Tailwind invalide',
            severity: 'error',
            suggestion: 'Utilisez des classes Tailwind valides comme "w-10 h-10"'
          });
        }
      }
    });
  }

  // Primary text validation
  if (header.primaryText) {
    if (!header.primaryText.content) {
      errors.push({
        field: 'header.primaryText.content',
        message: 'Texte principal requis',
        severity: 'error'
      });
    }

    // Font weight validation
    if (header.primaryText.fontWeight && !isValidTailwindFontWeight(header.primaryText.fontWeight)) {
      warnings.push({
        field: 'header.primaryText.fontWeight',
        message: 'Font weight CSS potentiellement invalide',
        severity: 'warning',
        suggestion: 'Utilisez: font-light, font-normal, font-medium, font-semibold, font-bold, font-extrabold'
      });
    }

    // Color validation
    if (header.primaryText.color && !isValidTailwindColor(header.primaryText.color)) {
      warnings.push({
        field: 'header.primaryText.color',
        message: 'Couleur Tailwind potentiellement invalide',
        severity: 'warning'
      });
    }
  }

  // Secondary text validation  
  if (header.secondaryText) {
    if (header.secondaryText.content && header.secondaryText.content.length > 50) {
      suggestions.push({
        field: 'header.secondaryText.content',
        message: 'Le sous-titre est long',
        severity: 'info',
        suggestion: 'Les sous-titres courts sont plus lisibles'
      });
    }
  }
}

/**
 * Valider la section Colors
 */
function validateColors(
  colors: any,
  errors: ValidationError[],
  warnings: ValidationError[],
  suggestions: ValidationError[]
) {
  const requiredColors = ['primary', 'secondary', 'accent'];
  
  requiredColors.forEach(colorKey => {
    if (!colors[colorKey]) {
      warnings.push({
        field: `colors.${colorKey}`,
        message: `Couleur ${colorKey} manquante`,
        severity: 'warning',
        suggestion: 'Définissez toutes les couleurs de base pour une cohérence visuelle'
      });
    } else {
      // Valider format hex
      if (!isValidHexColor(colors[colorKey])) {
        errors.push({
          field: `colors.${colorKey}`,
          message: `Couleur hex invalide: ${colors[colorKey]}`,
          severity: 'error',
          suggestion: 'Utilisez un format hex valide: #RRGGBB ou #RGB'
        });
      }
    }
  });

  // Vérifier contraste (si primary et secondary sont similaires)
  if (colors.primary && colors.secondary) {
    if (colorsAreTooSimilar(colors.primary, colors.secondary)) {
      warnings.push({
        field: 'colors',
        message: 'Les couleurs primary et secondary sont trop similaires',
        severity: 'warning',
        suggestion: 'Utilisez des couleurs contrastées pour une meilleure lisibilité'
      });
    }
  }
}

/**
 * Valider les modules
 */
function validateModules(
  modules: any,
  errors: ValidationError[],
  warnings: ValidationError[],
  suggestions: ValidationError[]
) {
  // Vérifier que au moins un module est activé
  const activeModules = Object.values(modules).filter((m: any) => m.enabled);
  
  if (activeModules.length === 0) {
    warnings.push({
      field: 'modules',
      message: 'Aucun module activé',
      severity: 'warning',
      suggestion: 'Activez au moins un module pour un site fonctionnel'
    });
  }

  // Valider chaque module
  Object.entries(modules).forEach(([key, module]: [string, any]) => {
    if (module.order !== undefined) {
      if (typeof module.order !== 'number' || module.order < 0) {
        errors.push({
          field: `modules.${key}.order`,
          message: 'L\'ordre doit être un nombre positif',
          severity: 'error'
        });
      }
    }
  });
}

// === HELPER FUNCTIONS ===

/**
 * Vérifier si une chaîne est une URL valide
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Vérifier si c'est un chemin relatif valide
 */
function isRelativePath(path: string): boolean {
  return path.startsWith('/') || path.startsWith('./') || path.startsWith('../');
}

/**
 * Vérifier si c'est une couleur hex valide
 */
function isValidHexColor(color: string): boolean {
  return /^#([0-9A-F]{3}){1,2}$/i.test(color);
}

/**
 * Vérifier si c'est une taille Tailwind valide
 */
function isValidTailwindSize(size: string): boolean {
  // Format: w-{number} h-{number}
  const sizeRegex = /^w-\d+(\.\d+)?\s+h-\d+(\.\d+)?$/;
  return sizeRegex.test(size);
}

/**
 * Vérifier si c'est un font weight Tailwind valide
 */
function isValidTailwindFontWeight(weight: string): boolean {
  const validWeights = [
    'font-thin',
    'font-extralight',
    'font-light',
    'font-normal',
    'font-medium',
    'font-semibold',
    'font-bold',
    'font-extrabold',
    'font-black'
  ];
  return validWeights.includes(weight);
}

/**
 * Vérifier si c'est une couleur Tailwind valide
 */
function isValidTailwindColor(color: string): boolean {
  // Simplifiez: accepte text-{color}-{shade} ou text-{color}
  const colorRegex = /^text-[a-z]+-?\d*$/;
  return colorRegex.test(color) || color.startsWith('text-gradient-');
}

/**
 * Vérifier si deux couleurs sont trop similaires
 */
function colorsAreTooSimilar(color1: string, color2: string): boolean {
  // Convertir hex en RGB et calculer distance
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return false;
  
  const distance = Math.sqrt(
    Math.pow(rgb1.r - rgb2.r, 2) +
    Math.pow(rgb1.g - rgb2.g, 2) +
    Math.pow(rgb1.b - rgb2.b, 2)
  );
  
  // Si distance < 50, considéré comme trop similaire
  return distance < 50;
}

/**
 * Convertir hex en RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Validation rapide (seulement les erreurs critiques)
 */
export function quickValidate(config: any): string[] {
  const errors: string[] = [];

  if (!config.branding?.siteName) {
    errors.push('Le nom du site est obligatoire');
  }

  if (!config.colors?.primary) {
    errors.push('La couleur primaire est obligatoire');
  }

  if (config.colors?.primary && !isValidHexColor(config.colors.primary)) {
    errors.push('La couleur primaire doit être au format hex (#RRGGBB)');
  }

  return errors;
}
