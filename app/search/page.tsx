"use client";

import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { useState, useCallback } from "react";
import Shell from "@/components/layout/Shell";
import SearchBar from "@/components/search/SearchBar";
import PhotoGrid from "@/components/gallery/PhotoGrid";
import type { SearchFilters } from "@/lib/types/search";
import type { Photo } from "@/lib/types/photo";

export default function SearchPage() {
  const [results, setResults] = useState<Photo[] | null>(null);
  const [filters, setFilters] = useState<SearchFilters | null>(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  const handleSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults(null);
      setFilters(null);
      return;
    }
    setQuery(q);
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = (await res.json()) as { photos: Photo[]; filters: SearchFilters };
      setResults(data.photos);
      setFilters(data.filters);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <>
      <SignedIn>
        <Shell>
          <div className="px-4 py-6">
            <h1 className="text-2xl font-semibold text-white mb-6">Search</h1>
            <SearchBar onSearch={handleSearch} loading={loading} />

            {filters && (
              <div className="mt-4 flex flex-wrap gap-2">
                {filters.scene && (
                  <span className="px-2 py-1 text-xs rounded bg-hive-border text-gray-300">
                    Scene: {filters.scene}
                  </span>
                )}
                {filters.location && (
                  <span className="px-2 py-1 text-xs rounded bg-hive-border text-gray-300">
                    Location: {filters.location}
                  </span>
                )}
                {filters.personName && (
                  <span className="px-2 py-1 text-xs rounded bg-hive-border text-gray-300">
                    Person: {filters.personName}
                  </span>
                )}
                {filters.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs rounded bg-hive-gold/20 text-hive-gold"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {results === null && !loading && (
              <p className="text-gray-400 mt-8 text-center">
                Type anything — &ldquo;beach photos from last summer&rdquo;, &ldquo;photos of
                Sarah&rdquo;, &ldquo;birthday 2022&rdquo;
              </p>
            )}

            {results !== null && !loading && (
              <div className="mt-6">
                <p className="text-sm text-gray-400 mb-4">
                  {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{query}
                  &rdquo;
                </p>
                <PhotoGrid photos={results} />
              </div>
            )}
          </div>
        </Shell>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
