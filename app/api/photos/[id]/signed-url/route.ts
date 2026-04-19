import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { getPhotoById } from "@/lib/db/photos";
import { getSignedGetUrl } from "@/lib/storage/r2";
import { env } from "@/lib/env";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const user = await requireUser();
    const { id } = await params;

    const photo = await getPhotoById(id, user.id);
    if (!photo) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!photo.storageKey) {
      return NextResponse.json({ error: "Photo not yet uploaded" }, { status: 400 });
    }

    const url = await getSignedGetUrl(env.R2_BUCKET_ORIGINALS, photo.storageKey, 3600);
    return NextResponse.json({ url, expiresIn: 3600 });
  } catch (err) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
