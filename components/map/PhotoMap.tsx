"use client";

import { useEffect, useState } from "react";
import type { Photo } from "@/lib/types/photo";

export default function PhotoMap() {
  const [geoPhotos, setGeoPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/photos?limit=500")
      .then((r) => r.json())
      .then((data: { photos: Photo[] }) => {
        setGeoPhotos(data.photos.filter((p) => p.gpsLat != null && p.gpsLon != null));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="h-96 bg-hive-surface rounded-xl border border-hive-border animate-pulse" />
    );
  }

  if (!geoPhotos.length) {
    return (
      <div className="h-96 bg-hive-surface rounded-xl border border-hive-border flex flex-col items-center justify-center gap-3 text-center p-8">
        <span className="text-4xl">🗺️</span>
        <p className="text-white font-medium">No geotagged photos</p>
        <p className="text-sm text-gray-400 max-w-xs">
          Photos with GPS data embedded in their EXIF will appear here. Most
          smartphone photos include location — make sure location access is enabled.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Map placeholder — requires Mapbox token */}
      <div className="h-96 bg-hive-surface rounded-xl border border-hive-border flex flex-col items-center justify-center gap-3 text-center p-8">
        <span className="text-4xl">🗺️</span>
        <p className="text-white font-medium">
          {geoPhotos.length} geotagged photo{geoPhotos.length !== 1 ? "s" : ""}
        </p>
        <p className="text-sm text-gray-400 max-w-md">
          Interactive map requires a Mapbox token. Add{" "}
          <code className="text-hive-gold bg-black/30 px-1 py-0.5 rounded text-xs">
            NEXT_PUBLIC_MAPBOX_TOKEN
          </code>{" "}
          to your environment variables and install{" "}
          <code className="text-hive-gold bg-black/30 px-1 py-0.5 rounded text-xs">
            react-map-gl mapbox-gl
          </code>{" "}
          to enable the map view.
        </p>
        <a
          href="https://account.mapbox.com/auth/signup/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-hive-gold text-sm underline hover:text-hive-amber"
        >
          Get a free Mapbox token →
        </a>
      </div>

      {/* Coordinate list */}
      <div className="bg-hive-surface border border-hive-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-hive-border">
          <p className="text-sm font-medium text-white">Geotagged photos</p>
        </div>
        <div className="divide-y divide-hive-border max-h-64 overflow-y-auto">
          {geoPhotos.map((photo) => (
            <div key={photo.id} className="px-4 py-2.5 flex items-center gap-3">
              {photo.thumbUrl && (
                <img
                  src={photo.thumbUrl}
                  alt=""
                  className="w-10 h-10 rounded object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">
                  {photo.aiLocation ?? photo.filename ?? photo.id.slice(0, 8)}
                </p>
                <p className="text-xs text-gray-500 font-mono">
                  {photo.gpsLat?.toFixed(4)}, {photo.gpsLon?.toFixed(4)}
                </p>
              </div>
              <a
                href={`/photo/${photo.id}`}
                className="text-xs text-hive-gold hover:text-hive-amber flex-shrink-0"
              >
                View →
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
