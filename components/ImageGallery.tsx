'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface ImageGalleryProps {
  images: string[];
  alt?: string;
}

/**
 * Galerie d'images avec preview
 */
export default function ImageGallery({ images, alt = 'Image' }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!images || images.length === 0) {
    return <div className="text-gray-500">Aucune image disponible</div>;
  }

  return (
    <div className="space-y-4">
      {/* Image principale */}
      <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
        <Image
          src={images[selectedIndex]}
          alt={`${alt} ${selectedIndex + 1}`}
          fill
          className="object-contain"
        />
      </div>

      {/* Miniatures */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setSelectedIndex(index)}
              aria-label={`Voir ${alt} ${index + 1}`}
              className={`relative h-20 rounded overflow-hidden border-2 ${
                index === selectedIndex ? 'border-blue-500' : 'border-transparent'
              }`}
            >
              <Image
                src={image}
                alt={`${alt} miniature ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
