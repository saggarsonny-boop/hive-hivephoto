"use client";

import { useState, useRef, useEffect } from "react";

interface Props {
  onSearch: (query: string) => void;
  loading?: boolean;
  placeholder?: string;
}

const PLACEHOLDERS = [
  "beach photos from last summer",
  "photos of Sarah at the park",
  "birthday party 2023",
  "sunset landscapes",
  "dog photos",
  "family dinner Christmas",
  "travel photos Europe",
];

export default function SearchBar({ onSearch, loading = false, placeholder }: Props) {
  const [query, setQuery] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Typewriter effect for rotating placeholders
  useEffect(() => {
    const text = PLACEHOLDERS[placeholderIndex];
    let charIndex = 0;
    let typing = true;

    const interval = setInterval(() => {
      if (typing) {
        setDisplayedPlaceholder(text.slice(0, charIndex + 1));
        charIndex++;
        if (charIndex >= text.length) {
          typing = false;
          setTimeout(() => {
            charIndex = text.length;
            const deleteInterval = setInterval(() => {
              charIndex--;
              setDisplayedPlaceholder(text.slice(0, charIndex));
              if (charIndex <= 0) {
                clearInterval(deleteInterval);
                setPlaceholderIndex((i) => (i + 1) % PLACEHOLDERS.length);
              }
            }, 40);
          }, 2000);
          clearInterval(interval);
        }
      }
    }, 60);

    return () => clearInterval(interval);
  }, [placeholderIndex]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative flex items-center">
        <svg
          className="absolute left-4 text-gray-500 w-5 h-5 pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder ?? displayedPlaceholder}
          className="w-full pl-12 pr-28 py-3 bg-hive-surface border border-hive-border rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-hive-gold transition-colors text-sm"
        />

        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="absolute right-2 px-4 py-1.5 bg-hive-gold text-black text-sm font-medium rounded-lg disabled:opacity-40 hover:bg-hive-amber transition-colors"
        >
          {loading ? "…" : "Search"}
        </button>
      </div>
      <p className="text-xs text-gray-600 mt-1.5 ml-1">
        Natural language search powered by AI
      </p>
    </form>
  );
}
