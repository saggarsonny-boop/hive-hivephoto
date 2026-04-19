import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { finalizeUpload } from "@/lib/pipeline/finalize-upload";
import type { CompleteUploadRequest } from "@/lib/types/pipeline";

export async function POST(request: Request): Promise<Response> {
  try {
    const user = await requireUser();
    const body = (await request.json()) as CompleteUploadRequest;

    if (!body.photoId || !body.storageKey) {
      return NextResponse.json({ error: "Missing photoId or storageKey" }, { status: 400 });
    }

    const result = await finalizeUpload(user.id, body.photoId, body.storageKey);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[ingest/complete]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
