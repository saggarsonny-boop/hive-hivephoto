"use client";

import { useEffect, useState } from "react";
import PhotoCard from "./PhotoCard";
import EmptyState from "@/components/shared/EmptyState";
import type { Photo } from "@/lib/types/photo";

interface Props {
  photos?: Photo[]; // If provided, use these (search results). Otherwise fetch.
}

export default function PhotoGrid({ photos: externalPhotos }: Props) {
  const [photos, setPhotos] = useState<Photo[]>(externalPhotos ?? []);
  const [loading, setLoading] = useState(!externalPhotos);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (externalPhotos !== undefined) {
      setPhotos(externalPhotos);
      return;
    }
    setLoading(true);
    fetch("/api/photos?limit=200")
      .then((r) => r.json())
      .then((data: { photos: Photo[] }) => {
        setPhotos(data.photos);
      })
      .catch(() => setError("Failed to load photos"))
      .finally(() => setLoading(false));
  }, [externalPhotos]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-lg bg-hive-surface animate-pulse border border-hive-border"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-red-400 text-sm">{error}</p>;
  }

  if (!photos.length) {
    return (
      <EmptyState
        title="No photos yet"
        description="Upload your first photo to get started."
        action={{ label: "Upload photos", href: "/upload" }}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
      {photos.map((photo) => (
        <PhotoCard key={photo.id} photo={photo} />
      ))}
    </div>
  );
}
