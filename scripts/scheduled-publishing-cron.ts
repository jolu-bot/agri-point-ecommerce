// Note: Ce script doit être exécuté avec ts-node et tsconfig-paths
// ou utiliser des imports relatifs en production
import dbConnect from '../lib/db';
import Page from '../models/Page';
import Product from '../models/Product';
import { getLogger } from '../lib/logger-rotation';

const logger = getLogger();

/**
 * Cron job pour publier automatiquement les contenus planifiés
 * À exécuter via: npm run cron:publish
 */
async function publishScheduledContent() {
  try {
    logger.info({}, 'Starting scheduled publishing cron job');

    // Connexion BD
    await dbConnect();

    const now = new Date();

    // Trouver les pages à publier
    const pagesToPublish = await Page.find({
      isPublished: false,
      scheduledPublishAt: { $lte: now },
      isArchived: false,
    });

    // Trouver les produits à publier
    const productsToPublish = await Product.find({
      isPublished: false,
      scheduledPublishAt: { $lte: now },
      isArchived: false,
    });

    const totalCount = pagesToPublish.length + productsToPublish.length;

    if (totalCount === 0) {
      logger.info({}, 'No content scheduled for publishing');
      return;
    }

    // Publier les pages
    for (const page of pagesToPublish) {
      await Page.findByIdAndUpdate(page._id, {
        isPublished: true,
        publishedAt: now,
      });
      logger.info({ pageId: page._id, title: page.title }, 'Page published');
    }

    // Publier les produits
    for (const product of productsToPublish) {
      await Product.findByIdAndUpdate(product._id, {
        isPublished: true,
        publishedAt: now,
      });
      logger.info(
        { productId: product._id, name: product.name },
        'Product published'
      );
    }

    logger.info(
      { pages: pagesToPublish.length, products: productsToPublish.length },
      'Scheduled publishing completed'
    );

    process.exit(0);
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : error },
      'Scheduled publishing cron job failed'
    );
    process.exit(1);
  }
}

// Exécuter le cron
publishScheduledContent();
