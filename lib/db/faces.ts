import { sql } from "./client";
import type { DbPhotoFace } from "@/lib/types/db";
import type { PhotoFace } from "@/lib/types/photo";
import type { AiFaceDetection } from "@/lib/types/pipeline";
import { mapFace } from "./mappers";

export async function insertFaces(photoId: string, faces: AiFaceDetection[]): Promise<void> {
  for (const face of faces) {
    await sql`
      INSERT INTO photo_faces (photo_id, bbox, confidence)
      VALUES (
        ${photoId},
        ${JSON.stringify(face.bbox)},
        ${0.9}
      )
      ON CONFLICT DO NOTHING
    `;
  }
}

export async function getFacesByPhoto(photoId: string): Promise<PhotoFace[]> {
  const rows = await sql`
    SELECT * FROM photo_faces WHERE photo_id = ${photoId} ORDER BY created_at ASC
  `;
  return (rows as unknown as DbPhotoFace[]).map(mapFace);
}

export async function getFacesByPerson(personId: string): Promise<PhotoFace[]> {
  const rows = await sql`
    SELECT * FROM photo_faces WHERE person_id = ${personId} ORDER BY created_at ASC
  `;
  return (rows as unknown as DbPhotoFace[]).map(mapFace);
}

export async function labelFace(faceId: string, personId: string): Promise<void> {
  await sql`
    UPDATE photo_faces SET person_id = ${personId} WHERE id = ${faceId}
  `;
}

export async function unlabelFace(faceId: string): Promise<void> {
  await sql`
    UPDATE photo_faces SET person_id = NULL WHERE id = ${faceId}
  `;
}
