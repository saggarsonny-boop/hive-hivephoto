"use client";

import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Shell from "@/components/layout/Shell";
import EmptyState from "@/components/shared/EmptyState";
import type { Photo } from "@/lib/types/photo";
import Link from "next/link";

export default function DuplicatesPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDuplicates = async () => {
    const res = await fetch("/api/duplicates");
    const data = (await res.json()) as { photos: Photo[] };
    setPhotos(data.photos);
    setLoading(false);
  };

  useEffect(() => {
    fetchDuplicates();
  }, []);

  const handleAction = async (
    photoId: string,
    action: "keep-new" | "keep-original" | "keep-both"
  ) => {
    await fetch(`/api/duplicates/${photoId}/${action}`, { method: "POST" });
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
  };

  return (
    <>
      <SignedIn>
        <Shell>
          <div className="px-4 py-6">
            <h1 className="text-2xl font-semibold text-white mb-2">Possible Duplicates</h1>
            <p className="text-sm text-gray-400 mb-6">
              These photos look very similar. Choose what to keep.
            </p>

            {loading && <p className="text-gray-400">Loading…</p>}

            {!loading && photos.length === 0 && (
              <EmptyState
                title="No duplicates found"
                description="Your library looks clean. Any near-duplicate photos will appear here for review."
              />
            )}

            <div className="space-y-4">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="bg-hive-surface border border-hive-border rounded-xl p-4 flex gap-4 items-start"
                >
                  <Link href={`/photo/${photo.id}`}>
                    {photo.thumbUrl ? (
                      <img
                        src={photo.thumbUrl}
                        alt={photo.filename ?? "Photo"}
                        className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-hive-border rounded-lg flex-shrink-0 flex items-center justify-center text-gray-500 text-xs">
                        No thumb
                      </div>
                    )}
                  </Link>

                  <div className="flex-1">
                    <p className="text-white font-medium">{photo.filename ?? photo.id}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(photo.takenAt).toLocaleDateString()} ·{" "}
                      {photo.fileSize ? `${(photo.fileSize / 1024 / 1024).toFixed(1)} MB` : ""}
                    </p>
                    {photo.aiDescription && (
                      <p className="text-sm text-gray-300 mt-1 line-clamp-2">
                        {photo.aiDescription}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleAction(photo.id, "keep-new")}
                      className="px-3 py-1.5 text-sm bg-hive-gold text-black rounded font-medium hover:bg-hive-amber"
                    >
                      Keep new
                    </button>
                    <button
                      onClick={() => handleAction(photo.id, "keep-original")}
                      className="px-3 py-1.5 text-sm bg-hive-border text-white rounded hover:bg-neutral-600"
                    >
                      Keep original
                    </button>
                    <button
                      onClick={() => handleAction(photo.id, "keep-both")}
                      className="px-3 py-1.5 text-sm border border-hive-border text-gray-300 rounded hover:border-gray-400"
                    >
                      Keep both
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Shell>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
