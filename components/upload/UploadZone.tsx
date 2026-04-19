"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import UploadProgress, { type FileUploadState } from "./UploadProgress";
import type { PresignResponse, CompleteUploadResponse } from "@/lib/types/pipeline";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif", "image/gif", "image/avif", "image/tiff"];
const MAX_SIZE = 50 * 1024 * 1024; // 50 MB

async function computeSha256(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function UploadZone() {
  const [fileStates, setFileStates] = useState<FileUploadState[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const updateFile = (index: number, update: Partial<FileUploadState>) => {
    setFileStates((prev) => prev.map((f, i) => (i === index ? { ...f, ...update } : f)));
  };

  const processFiles = useCallback(async (files: File[]) => {
    const valid = files.filter((f) => {
      if (!ACCEPTED.includes(f.type)) return false;
      if (f.size > MAX_SIZE) return false;
      return true;
    });

    if (!valid.length) return;

    const startIndex = fileStates.length;
    const initialStates: FileUploadState[] = valid.map((f) => ({
      name: f.name,
      progress: 0,
      status: "hashing",
    }));
    setFileStates((prev) => [...prev, ...initialStates]);

    for (let i = 0; i < valid.length; i++) {
      const file = valid[i];
      const idx = startIndex + i;

      try {
        // Step 1: Hash
        updateFile(idx, { status: "hashing", progress: 10 });
        const sha256 = await computeSha256(file);

        // Step 2: Presign
        updateFile(idx, { status: "presigning", progress: 25 });
        const presignRes = await fetch("/api/ingest/presign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            mimeType: file.type || "image/jpeg",
            fileSize: file.size,
            sha256,
          }),
        });

        if (!presignRes.ok) throw new Error("Presign failed");
        const presign = (await presignRes.json()) as PresignResponse;

        if (presign.isDuplicate) {
          updateFile(idx, { status: "duplicate", progress: 100 });
          continue;
        }

        if (!presign.uploadUrl || !presign.photoId || !presign.storageKey) {
          throw new Error("Invalid presign response");
        }

        // Step 3: Upload directly to R2
        updateFile(idx, { status: "uploading", progress: 40 });
        const uploadRes = await fetch(presign.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type || "image/jpeg" },
          body: file,
        });

        if (!uploadRes.ok) throw new Error("Upload to R2 failed");
        updateFile(idx, { progress: 85 });

        // Step 4: Complete
        updateFile(idx, { status: "completing", progress: 90 });
        const completeRes = await fetch("/api/ingest/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            photoId: presign.photoId,
            storageKey: presign.storageKey,
          }),
        });

        if (!completeRes.ok) throw new Error("Complete failed");
        await completeRes.json() as CompleteUploadResponse;

        updateFile(idx, { status: "done", progress: 100 });
      } catch (err) {
        updateFile(idx, {
          status: "error",
          progress: 0,
          error: err instanceof Error ? err.message : "Upload failed",
        });
      }
    }

    // Navigate to gallery after all done
    const allDone = valid.every((_, i) => {
      const s = fileStates[startIndex + i]?.status;
      return s === "done" || s === "duplicate" || s === "error";
    });
    if (allDone) {
      setTimeout(() => router.push("/"), 1500);
    }
  }, [fileStates, router]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    processFiles(files);
    e.target.value = "";
  };

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
          isDragging
            ? "border-hive-gold bg-hive-gold/5"
            : "border-hive-border hover:border-hive-gold/50 bg-hive-surface hover:bg-hive-gold/5"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED.join(",")}
          onChange={onFileChange}
          className="sr-only"
        />

        <div className="text-5xl mb-4">📷</div>
        <p className="text-white font-medium text-lg">
          {isDragging ? "Drop photos here" : "Drag photos here or click to browse"}
        </p>
        <p className="text-sm text-gray-400 mt-2">
          JPEG, PNG, WebP, HEIC, AVIF · Max 50 MB per file
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Photos are hashed client-side — exact duplicates are skipped automatically
        </p>
      </div>

      <UploadProgress files={fileStates} />
    </div>
  );
}
