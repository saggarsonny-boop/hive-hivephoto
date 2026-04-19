import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { getPhotosByUser } from "@/lib/db/photos";

export async function GET(request: Request): Promise<Response> {
  try {
    const user = await requireUser();
    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "50"), 200);
    const offset = parseInt(url.searchParams.get("offset") ?? "0");

    const photos = await getPhotosByUser(user.id, limit, offset);
    return NextResponse.json({ photos, limit, offset, total: photos.length });
  } catch (err) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
