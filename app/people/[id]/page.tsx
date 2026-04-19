"use client";

import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Shell from "@/components/layout/Shell";
import PhotoGrid from "@/components/gallery/PhotoGrid";
import type { Person, Photo } from "@/lib/types/photo";

export default function PersonPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [person, setPerson] = useState<Person | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    fetch(`/api/people/${params.id}`)
      .then((r) => r.json())
      .then((data: { person: Person; photos: Photo[] }) => {
        setPerson(data.person);
        setPhotos(data.photos);
        setName(data.person.name ?? "");
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  const saveName = async () => {
    if (!name.trim()) return;
    await fetch(`/api/people/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    setPerson((p) => (p ? { ...p, name: name.trim() } : p));
    setEditing(false);
  };

  const deletePerson = async () => {
    if (!confirm("Delete this person? Their face labels will be removed.")) return;
    await fetch(`/api/people/${params.id}`, { method: "DELETE" });
    router.push("/people");
  };

  if (loading) {
    return (
      <SignedIn>
        <Shell>
          <div className="px-4 py-6 text-gray-400">Loading…</div>
        </Shell>
      </SignedIn>
    );
  }

  return (
    <>
      <SignedIn>
        <Shell>
          <div className="px-4 py-6">
            <div className="flex items-center gap-4 mb-6">
              {person?.avatarThumbUrl && (
                <img
                  src={person.avatarThumbUrl}
                  alt={person.name ?? "Person"}
                  className="w-16 h-16 rounded-full object-cover"
                />
              )}
              <div>
                {editing ? (
                  <div className="flex gap-2">
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-hive-surface border border-hive-border rounded px-3 py-1 text-white text-lg"
                      onKeyDown={(e) => e.key === "Enter" && saveName()}
                      autoFocus
                    />
                    <button
                      onClick={saveName}
                      className="px-3 py-1 bg-hive-gold text-black rounded text-sm font-medium"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="px-3 py-1 bg-hive-border text-white rounded text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <h1
                    className="text-2xl font-semibold text-white cursor-pointer hover:text-hive-gold"
                    onClick={() => setEditing(true)}
                  >
                    {person?.name ?? "Unnamed person"}
                  </h1>
                )}
                <p className="text-sm text-gray-400 mt-1">
                  {person?.faceCount ?? photos.length} photo
                  {(person?.faceCount ?? photos.length) !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="ml-auto">
                <button
                  onClick={deletePerson}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  Delete person
                </button>
              </div>
            </div>
            <PhotoGrid photos={photos} />
          </div>
        </Shell>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
