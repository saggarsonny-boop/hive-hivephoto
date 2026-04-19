import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { getPhotoById, deletePhoto } from "@/lib/db/photos";
import { getFacesByPhoto } from "@/lib/db/faces";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const user = await requireUser();
    const { id } = await params;
    const photo = await getPhotoById(id, user.id);
    if (!photo) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const faces = await getFacesByPhoto(id);
    return NextResponse.json({ photo, faces });
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
    await deletePhoto(id, user.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
