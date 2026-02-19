'use client';

import React, { useState, useEffect } from 'react';
import { Upload, Image, File, Video, Search, Trash2, Loader2, Plus } from 'lucide-react';

export default function MediaManagerPage() {
  const [medias, setMedias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    fetchMedias();
  }, [searchQuery, selectedType]);

  const fetchMedias = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedType !== 'all') params.append('type', selectedType);
      
      const response = await fetch(`/api/admin/media?${params}`);
      const data = await response.json();
      setMedias(data.medias || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        await fetch('/api/admin/media', {
          method: 'POST',
          body: formData,
        });
      } catch (error) {
        console.error('Erreur upload:', error);
      }
    }
    
    setUploading(false);
    fetchMedias();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce média ?')) return;
    
    try {
      await fetch(`/api/admin/media?id=${id}`, { method: 'DELETE' });
      fetchMedias();
    } catch (error) {
      alert('Erreur lors de la suppression');
    }
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'image': return Image;
      case 'video': return Video;
      default: return File;
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Médiathèque</h1>
          <p className="text-gray-600 mt-1">Gérez vos images, vidéos et documents</p>
        </div>
        <label className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 cursor-pointer shadow-lg">
          <Upload className="w-5 h-5" />
          {uploading ? 'Upload en cours...' : 'Uploader'}
          <input
            type="file"
            multiple
            onChange={handleUpload}
            className="hidden"
            accept="image/*,video/*,.pdf,.doc,.docx"
          />
        </label>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les types</option>
            <option value="image">Images</option>
            <option value="video">Vidéos</option>
            <option value="document">Documents</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : medias.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Aucun média pour le moment</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {medias.map((media) => {
            const Icon = getMediaIcon(media.type);
            return (
              <div key={media._id} className="bg-white rounded-lg shadow-sm border overflow-hidden group">
                {media.type === 'image' ? (
                  <div className="aspect-square bg-gray-100 overflow-hidden">
                    <img src={media.url} alt={media.alt || media.filename} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    <Icon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="p-3">
                  <p className="text-sm text-gray-900 truncate font-medium mb-1">{media.originalName}</p>
                  <p className="text-xs text-gray-500">{(media.size / 1024).toFixed(0)} KB</p>
                  <button
                    onClick={() => handleDelete(media._id)}
                    className="mt-2 w-full text-xs text-red-600 hover:text-red-700 py-1 px-2 border border-red-200 rounded hover:bg-red-50 transition-colors flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Supprimer
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
