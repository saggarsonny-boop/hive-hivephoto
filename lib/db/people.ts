import { sql } from "./client";
import type { DbPerson } from "@/lib/types/db";
import type { Person } from "@/lib/types/photo";
import { mapPerson } from "./mappers";

export async function getPeopleByUser(userId: string): Promise<Person[]> {
  const rows = await sql`
    SELECT pe.*, COUNT(pf.id)::text AS face_count
    FROM people pe
    LEFT JOIN photo_faces pf ON pf.person_id = pe.id
    WHERE pe.user_id = ${userId}
    GROUP BY pe.id
    ORDER BY pe.name ASC NULLS LAST
  `;
  return (rows as unknown as (DbPerson & { face_count: string })[]).map(mapPerson);
}

export async function getPersonById(id: string, userId: string): Promise<Person | null> {
  const rows = await sql`
    SELECT pe.*, COUNT(pf.id)::text AS face_count
    FROM people pe
    LEFT JOIN photo_faces pf ON pf.person_id = pe.id
    WHERE pe.id = ${id} AND pe.user_id = ${userId}
    GROUP BY pe.id
    LIMIT 1
  `;
  if (!rows.length) return null;
  return mapPerson(rows[0] as unknown as DbPerson & { face_count: string });
}

export async function createPerson(userId: string, name: string): Promise<Person> {
  const rows = await sql`
    INSERT INTO people (user_id, name)
    VALUES (${userId}, ${name})
    RETURNING *
  `;
  return mapPerson(rows[0] as unknown as DbPerson & { face_count: string });
}

export async function updatePersonName(id: string, userId: string, name: string): Promise<void> {
  await sql`
    UPDATE people SET name = ${name}, updated_at = now()
    WHERE id = ${id} AND user_id = ${userId}
  `;
}

export async function deletePerson(id: string, userId: string): Promise<void> {
  await sql`DELETE FROM people WHERE id = ${id} AND user_id = ${userId}`;
}

export async function setPersonAvatar(id: string, thumbKey: string): Promise<void> {
  await sql`
    UPDATE people SET avatar_thumb_key = ${thumbKey}, updated_at = now()
    WHERE id = ${id}
  `;
}
