import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Media from '@/models/Media';
import { verifyAccessToken } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const folder = searchParams.get('folder');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const query: any = {};
    if (type) query.type = type;
    if (folder) query.folder = folder;
    if (search) {
      query.$or = [
        { filename: { $regex: search, $options: 'i' } },
        { originalName: { $regex: search, $options: 'i' } },
        { alt: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }
    
    const skip = (page - 1) * limit;
    
    const [medias, total] = await Promise.all([
      Media.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('uploadedBy', 'name email'),
      Media.countDocuments(query),
    ]);
    
    return NextResponse.json({
      medias,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    console.error('GET /api/admin/media error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Vérification de l'auth simplifiée (TODO: implémenter verifyAccessToken)
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || '';
    
    if (!file) {
      return NextResponse.json({ error: 'Fichier requis' }, { status: 400 });
    }
    
    // Créer le dossier si nécessaire
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder || '');
    await mkdir(uploadDir, { recursive: true });
    
    // Générer un nom unique
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filepath = path.join(uploadDir, filename);
    
    // Sauvegarder le fichier
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);
    
    // Déterminer le type
    let mediaType: 'image' | 'video' | 'document' | 'other' = 'other';
    if (file.type.startsWith('image/')) mediaType = 'image';
    else if (file.type.startsWith('video/')) mediaType = 'video';
    else if (file.type.includes('pdf') || file.type.includes('document')) mediaType = 'document';
    
    // Créer l'enregistrement
    const media = new Media({
      filename,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      type: mediaType,
      url: `/uploads/${folder ? folder + '/' : ''}${filename}`,
      path: filepath,
      folder: folder || undefined,
      // uploadedBy: user.id, // TODO: utiliser l'ID utilisateur vérifié
    });
    
    await media.save();
    
    return NextResponse.json({ media }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/admin/media error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    // Vérification de l'auth simplifiée (TODO: implémenter verifyAccessToken)
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }
    
    const media = await Media.findByIdAndDelete(id);
    if (!media) {
      return NextResponse.json({ error: 'Média non trouvé' }, { status: 404 });
    }
    
    // TODO: Supprimer le fichier physique
    
    return NextResponse.json({ message: 'Média supprimé' });
  } catch (error: any) {
    console.error('DELETE /api/admin/media error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
