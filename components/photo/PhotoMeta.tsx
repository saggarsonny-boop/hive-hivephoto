"use client";

import type { Photo } from "@/lib/types/photo";

interface Props {
  photo: Photo;
}

export default function PhotoMeta({ photo }: Props) {
  return (
    <div className="space-y-4">
      {photo.aiDescription && (
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Description</p>
          <p className="text-sm text-gray-200">{photo.aiDescription}</p>
        </div>
      )}

      {photo.aiTags && photo.aiTags.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Tags</p>
          <div className="flex flex-wrap gap-1.5">
            {photo.aiTags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs rounded-full bg-hive-gold/20 text-hive-gold"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 text-sm">
        {photo.aiScene && (
          <div>
            <p className="text-xs text-gray-500">Scene</p>
            <p className="text-gray-200 capitalize">{photo.aiScene}</p>
          </div>
        )}

        {photo.aiLocation && (
          <div>
            <p className="text-xs text-gray-500">Location</p>
            <p className="text-gray-200">{photo.aiLocation}</p>
          </div>
        )}

        <div>
          <p className="text-xs text-gray-500">Date</p>
          <p className="text-gray-200">
            {new Date(photo.takenAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {(photo.gpsLat != null && photo.gpsLon != null) && (
          <div>
            <p className="text-xs text-gray-500">GPS</p>
            <p className="text-gray-200 text-xs font-mono">
              {photo.gpsLat.toFixed(5)}, {photo.gpsLon.toFixed(5)}
            </p>
          </div>
        )}

        {photo.width && photo.height && (
          <div>
            <p className="text-xs text-gray-500">Dimensions</p>
            <p className="text-gray-200">
              {photo.width} × {photo.height}
            </p>
          </div>
        )}

        {photo.fileSize && (
          <div>
            <p className="text-xs text-gray-500">File size</p>
            <p className="text-gray-200">
              {(photo.fileSize / 1024 / 1024).toFixed(1)} MB
            </p>
          </div>
        )}

        {photo.mimeType && (
          <div>
            <p className="text-xs text-gray-500">Format</p>
            <p className="text-gray-200">{photo.mimeType.split("/")[1]?.toUpperCase()}</p>
          </div>
        )}
      </div>

      <div className="text-xs text-gray-600 pt-2 border-t border-hive-border">
        <p>ID: {photo.id}</p>
        <p>Status: {photo.processingStatus}</p>
        {photo.processingError && (
          <p className="text-red-400 mt-1">Error: {photo.processingError}</p>
        )}
      </div>
    </div>
  );
}
