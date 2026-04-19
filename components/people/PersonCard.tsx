"use client";

import Link from "next/link";
import type { Person } from "@/lib/types/photo";

interface Props {
  person: Person;
}

export default function PersonCard({ person }: Props) {
  return (
    <Link href={`/people/${person.id}`} className="group block">
      <div className="bg-hive-surface border border-hive-border rounded-xl p-4 hover:border-hive-gold/50 transition-colors">
        <div className="flex flex-col items-center gap-3">
          {person.avatarThumbUrl ? (
            <img
              src={person.avatarThumbUrl}
              alt={person.name ?? "Person"}
              className="w-20 h-20 rounded-full object-cover border-2 border-hive-border group-hover:border-hive-gold/50 transition-colors"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-hive-border flex items-center justify-center text-2xl">
              👤
            </div>
          )}
          <div className="text-center">
            <p className="text-white font-medium text-sm">
              {person.name ?? (
                <span className="text-gray-500 italic">Unnamed</span>
              )}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {person.faceCount ?? 0} photo{(person.faceCount ?? 0) !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
