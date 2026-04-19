import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { updateDuplicateStatus, getPhotoById } from "@/lib/db/photos";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const user = await requireUser();
    const { id } = await params;

    const photo = await getPhotoById(id, user.id);
    if (!photo) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await updateDuplicateStatus(id, "kept_both");
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
