"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PhotoMeta from "./PhotoMeta";
import type { Photo } from "@/lib/types/photo";
import type { PhotoFace } from "@/lib/types/photo";

interface Props {
  photoId: string;
}

interface PhotoResponse {
  photo: Photo;
  faces: PhotoFace[];
}

export default function PhotoDetail({ photoId }: Props) {
  const [data, setData] = useState<PhotoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [reanalyzing, setReanalyzing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/photos/${photoId}`)
      .then((r) => r.json())
      .then((d: PhotoResponse) => {
        setData(d);
        // Fetch signed URL for the full-res original
        if (d.photo.storageKey) {
          return fetch(`/api/photos/${photoId}/signed-url`)
            .then((r) => r.json())
            .then((urlData: { url: string }) => setSignedUrl(urlData.url));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [photoId]);

  const handleDelete = async () => {
    if (!confirm("Delete this photo? This cannot be undone.")) return;
    await fetch(`/api/photos/${photoId}`, { method: "DELETE" });
    router.push("/");
  };

  const handleReanalyze = async () => {
    setReanalyzing(true);
    try {
      await fetch(`/api/photos/${photoId}/reanalyze`, { method: "POST" });
      // Reload data
      const res = await fetch(`/api/photos/${photoId}`);
      const d = (await res.json()) as PhotoResponse;
      setData(d);
    } finally {
      setReanalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-32 bg-hive-surface rounded" />
          <div className="aspect-[4/3] bg-hive-surface rounded-xl max-w-2xl" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="px-4 py-6">
        <p className="text-red-400">Photo not found.</p>
        <Link href="/" className="text-hive-gold text-sm mt-2 inline-block">
          ← Back to gallery
        </Link>
      </div>
    );
  }

  const { photo, faces } = data;

  return (
    <div className="px-4 py-6">
      {/* Back */}
      <Link href="/" className="text-sm text-gray-400 hover:text-white mb-4 inline-block">
        ← Gallery
      </Link>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Image */}
        <div className="lg:flex-1">
          <div className="relative rounded-xl overflow-hidden bg-hive-surface border border-hive-border">
            {photo.thumbUrl ? (
              <img
                src={signedUrl ?? photo.thumbUrl}
                alt={photo.aiDescription ?? photo.filename ?? "Photo"}
                className="w-full h-auto object-contain max-h-[75vh]"
              />
            ) : (
              <div className="aspect-video flex items-center justify-center text-gray-500">
                {photo.processingStatus === "pending"
                  ? "Awaiting AI analysis…"
                  : "No preview available"}
              </div>
            )}
          </div>

          {/* Faces overlay info */}
          {faces.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-xs text-gray-500">Faces detected:</span>
              {faces.map((face) => (
                <span
                  key={face.id}
                  className="text-xs px-2 py-0.5 rounded bg-hive-border text-gray-300"
                >
                  {face.personId ? `Person ${face.personId.slice(0, 6)}` : "Unknown"}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 flex gap-3">
            {signedUrl && (
              <a
                href={signedUrl}
                download={photo.filename ?? "photo"}
                className="px-4 py-2 text-sm bg-hive-surface border border-hive-border rounded-lg text-gray-300 hover:text-white"
              >
                Download original
              </a>
            )}
            <button
              onClick={handleReanalyze}
              disabled={reanalyzing}
              className="px-4 py-2 text-sm bg-hive-surface border border-hive-border rounded-lg text-gray-300 hover:text-white disabled:opacity-50"
            >
              {reanalyzing ? "Analyzing…" : "Re-analyze"}
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-sm bg-red-900/30 border border-red-800/50 rounded-lg text-red-400 hover:text-red-300 ml-auto"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Metadata panel */}
        <div className="lg:w-80 bg-hive-surface border border-hive-border rounded-xl p-5">
          <h2 className="text-sm font-medium text-white mb-4">
            {photo.filename ?? "Photo details"}
          </h2>
          <PhotoMeta photo={photo} />
        </div>
      </div>
    </div>
  );
}
