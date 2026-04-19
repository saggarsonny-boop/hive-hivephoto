import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { getPhotoById } from "@/lib/db/photos";
import { sql } from "@/lib/db/client";
import { runAnalysisPipeline } from "@/lib/pipeline/analyze-photo";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const user = await requireUser();
    const { id } = await params;

    const photo = await getPhotoById(id, user.id);
    if (!photo) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Reset processing status
    await sql`
      UPDATE photos
      SET processing_status = 'pending',
          processing_attempts = 0,
          processing_error = NULL,
          updated_at = now()
      WHERE id = ${id} AND user_id = ${user.id}
    `;

    // Run analysis inline (for user-triggered reanalysis)
    await runAnalysisPipeline(id, user.id);

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[reanalyze]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
