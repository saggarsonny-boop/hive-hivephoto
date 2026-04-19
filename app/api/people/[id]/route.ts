import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { getPersonById, updatePersonName, deletePerson } from "@/lib/db/people";
import { getFacesByPerson } from "@/lib/db/faces";
import { getPhotoById } from "@/lib/db/photos";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const user = await requireUser();
    const { id } = await params;

    const person = await getPersonById(id, user.id);
    if (!person) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const faces = await getFacesByPerson(id);

    // Gather unique photos for this person
    const photoIds = Array.from(new Set(faces.map((f) => f.photoId)));
    const photos = (
      await Promise.all(photoIds.map((pid) => getPhotoById(pid, user.id)))
    ).filter(Boolean);

    return NextResponse.json({ person, faces, photos });
  } catch (err) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const user = await requireUser();
    const { id } = await params;
    const { name } = (await request.json()) as { name: string };

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    await updatePersonName(id, user.id, name.trim());
    const person = await getPersonById(id, user.id);
    return NextResponse.json({ person });
  } catch (err) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const user = await requireUser();
    const { id } = await params;
    await deletePerson(id, user.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
