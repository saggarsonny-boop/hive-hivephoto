import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { labelFace, unlabelFace } from "@/lib/db/faces";
import { getPersonById } from "@/lib/db/people";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = (await request.json()) as { personId?: string | null };

    if (body.personId === null || body.personId === undefined) {
      await unlabelFace(id);
      return NextResponse.json({ success: true });
    }

    // Verify person belongs to user
    const person = await getPersonById(body.personId, user.id);
    if (!person) {
      return NextResponse.json({ error: "Person not found" }, { status: 404 });
    }

    await labelFace(id, body.personId);
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
