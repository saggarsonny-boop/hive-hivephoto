"use client";

import Link from "next/link";
import type { Photo } from "@/lib/types/photo";

interface Props {
  photo: Photo;
}

export default function PhotoCard({ photo }: Props) {
  const thumbSrc = photo.thumbUrl ?? null;
  const date = new Date(photo.takenAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link href={`/photo/${photo.id}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-hive-surface border border-hive-border">
        {thumbSrc ? (
          <img
            src={thumbSrc}
            alt={photo.aiDescription ?? photo.filename ?? "Photo"}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm">
            {photo.processingStatus === "pending" ? (
              <span className="text-xs text-gray-500 text-center px-2">
                Processing…
              </span>
            ) : (
              <span className="text-gray-600">No preview</span>
            )}
          </div>
        )}

        {/* Status badge */}
        {photo.processingStatus === "done" && photo.aiScene && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 pt-4 pb-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="text-xs text-white truncate">{photo.aiScene}</p>
          </div>
        )}

        {photo.duplicateReviewStatus === "flagged" && (
          <div className="absolute top-2 right-2 px-1.5 py-0.5 text-xs bg-yellow-500/80 text-black rounded font-medium">
            Dup
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-1 truncate">{date}</p>
    </Link>
  );
}
