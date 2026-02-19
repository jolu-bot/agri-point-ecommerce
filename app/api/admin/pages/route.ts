import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import connectDB from '@/lib/db';
import Page, { IPage } from '@/models/Page';

// Interface pour les stats
interface PageStats {
  total: number;
  published: number;
  drafts: number;
  scheduled: number;
  templates: number;
  totalViews: number;
}

// GET - Liste des pages
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    // Extraire les paramètres de recherche
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status');
    const layout = searchParams.get('layout');
    const search = searchParams.get('search');
    const includeTemplates = searchParams.get('includeTemplates') === 'true';
    const locale = searchParams.get('locale') || 'fr';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
    
    // Construire le filtre
    const filter: any = { locale };
    
    if (status) {
      filter.status = status;
    }
    
    if (layout) {
      filter.layout = layout;
    }
    
    if (!includeTemplates) {
      filter.isTemplate = false;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
      ];
    }
    
    // Récupérer les pages avec pagination
    const pages = await Page.find(filter)
      .select('-blocks -versionHistory')  // Exclure les données lourdes
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ [sortBy]: sortOrder })
      .limit(limit)
      .skip((page - 1) * limit);
    
    const total = await Page.countDocuments(filter);
    
    // Calculer les stats
    const [statsResult] = await Page.aggregate([
      { $match: { locale } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          published: {
            $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
          },
          drafts: {
            $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
          },
          scheduled: {
            $sum: { $cond: [{ $eq: ['$status', 'scheduled'] }, 1, 0] }
          },
          templates: {
            $sum: { $cond: ['$isTemplate', 1, 0] }
          },
          totalViews: { $sum: '$stats.views' },
        }
      }
    ]);
    
    const stats: PageStats = statsResult || {
      total: 0,
      published: 0,
      drafts: 0,
      scheduled: 0,
      templates: 0,
      totalViews: 0,
    };
    
    return NextResponse.json({
      pages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats,
    });
    
  } catch (error: any) {
    console.error('Error fetching pages:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des pages' },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle page
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    // Vérifier l'authentification
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    
    const decoded: any = verify(token, process.env.JWT_SECRET!);
    const user = decoded;
    
    // Vérifier le rôle (admin ou editor)
    if (!['admin', 'editor'].includes(user.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }
    
    const body = await req.json();
    
    // Auto-générer le slug à partir du titre si non fourni
    let slug = body.slug;
    if (!slug && body.title) {
      slug = body.title
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    
    // Vérifier l'unicité du slug
    const existingPage = await Page.findOne({ slug });
    if (existingPage) {
      slug = `${slug}-${Date.now()}`;
    }
    
    // Générer les IDs pour les blocs
    const blocksWithIds = (body.blocks || []).map((block: any, index: number) => ({
      ...block,
      id: block.id || `block_${Date.now()}_${index}`,
      order: block.order !== undefined ? block.order : index,
    }));
    
    // Créer la page
    const page = new Page({
      ...body,
      slug,
      blocks: blocksWithIds,
      createdBy: user.id,
      path: `/${slug}`,
    });
    
    await page.save();
    
    // Audit log
    console.log(`[AUDIT] Page créée: ${page.title} (${page.slug}) par user ${user.email}`);
    
    return NextResponse.json({ page }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error creating page:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Une page avec ce slug existe déjà' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la création de la page' },
      { status: 500 }
    );
  }
}

// PATCH - Mettre à jour une page
export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    
    // Vérifier l'authentification
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    
    const decoded: any = verify(token, process.env.JWT_SECRET!);
    const user = decoded;
    
    // Vérifier le rôle
    if (!['admin', 'editor'].includes(user.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }
    
    const searchParams = req.nextUrl.searchParams;
    const pageId = searchParams.get('id');
    
    if (!pageId) {
      return NextResponse.json(
        { error: 'ID de la page requis' },
        { status: 400 }
      );
    }
    
    const body = await req.json();
    
    // Trouver la page
    const page = await Page.findById(pageId);
    
    if (!page) {
      return NextResponse.json(
        { error: 'Page non trouvée' },
        { status: 404 }
      );
    }
    
    // Créer une version si demandé
    const createVersion = searchParams.get('createVersion') === 'true';
    if (createVersion) {
      // @ts-expect-error - Mongoose instance method
      page.createVersion(user.id, body.versionComment);
    }
    
    // Régénérer les IDs des nouveaux blocs
    if (body.blocks) {
      body.blocks = body.blocks.map((block: any, index: number) => ({
        ...block,
        id: block.id || `block_${Date.now()}_${index}`,
        order: block.order !== undefined ? block.order : index,
      }));
    }
    
    // Mettre à jour les champs
    Object.keys(body).forEach(key => {
      if (key !== 'versionComment' && key !== '_id') {
        (page as any)[key] = body[key];
      }
    });
    
    page.updatedBy = user.id as any;
    
    await page.save();
    
    // Audit log
    console.log(`[AUDIT] Page mise à jour: ${page.title} (${page.slug}) - version: ${createVersion}`);
    
    return NextResponse.json({ page });
    
  } catch (error: any) {
    console.error('Error updating page:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la page' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une page
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    
    // Vérifier l'authentification
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    
    const decoded: any = verify(token, process.env.JWT_SECRET!);
    const user = decoded;
    
    // Vérifier le rôle (admin uniquement)
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }
    
    const searchParams = req.nextUrl.searchParams;
    const pageId = searchParams.get('id');
    
    if (!pageId) {
      return NextResponse.json(
        { error: 'ID de la page requis' },
        { status: 400 }
      );
    }
    
    const page = await Page.findById(pageId);
    
    if (!page) {
      return NextResponse.json(
        { error: 'Page non trouvée' },
        { status: 404 }
      );
    }
    
    // Vérifier s'il y a des pages enfants
    const childrenCount = await Page.countDocuments({ parentPage: pageId });
    if (childrenCount > 0) {
      return NextResponse.json(
        { error: `Impossible de supprimer : ${childrenCount} page(s) enfant(s) existent` },
        { status: 400 }
      );
    }
    
    const pageTitle = page.title;
    const pageSlug = page.slug;
    
    await Page.findByIdAndDelete(pageId);
    
    // Audit log
    console.log(`[AUDIT] Page supprimée: ${pageTitle} (${pageSlug})`);
    
    return NextResponse.json({
      message: 'Page supprimée avec succès',
    });
    
  } catch (error: any) {
    console.error('Error deleting page:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la page' },
      { status: 500 }
    );
  }
}
