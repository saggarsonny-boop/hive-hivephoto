"use client";

import { useEffect, useState } from "react";
import PersonCard from "./PersonCard";
import EmptyState from "@/components/shared/EmptyState";
import type { Person } from "@/lib/types/photo";

export default function PeopleGrid() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch("/api/people")
      .then((r) => r.json())
      .then((data: { people: Person[] }) => setPeople(data.people))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const createPerson = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/people", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const data = (await res.json()) as { person: Person };
      setPeople((prev) => [...prev, data.person]);
      setNewName("");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-hive-surface rounded-xl h-36 animate-pulse border border-hive-border" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Create person */}
      <div className="flex gap-3 mb-6 max-w-sm">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Add a person…"
          className="flex-1 px-3 py-2 bg-hive-surface border border-hive-border rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-hive-gold"
          onKeyDown={(e) => e.key === "Enter" && createPerson()}
        />
        <button
          onClick={createPerson}
          disabled={creating || !newName.trim()}
          className="px-4 py-2 bg-hive-gold text-black text-sm font-medium rounded-lg disabled:opacity-40"
        >
          Add
        </button>
      </div>

      {!people.length ? (
        <EmptyState
          title="No people yet"
          description="People are automatically detected when photos are analyzed. You can also add them manually above."
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {people.map((person) => (
            <PersonCard key={person.id} person={person} />
          ))}
        </div>
      )}
    </div>
  );
}
