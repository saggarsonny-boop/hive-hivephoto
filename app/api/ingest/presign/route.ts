import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { presignUpload } from "@/lib/pipeline/presign";
import type { PresignRequest } from "@/lib/types/pipeline";

export async function POST(request: Request): Promise<Response> {
  try {
    const user = await requireUser();
    const body = (await request.json()) as PresignRequest;

    if (!body.filename || !body.mimeType || !body.fileSize || !body.sha256) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!body.mimeType.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are supported" }, { status: 400 });
    }

    const result = await presignUpload(user.id, body);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[presign]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
