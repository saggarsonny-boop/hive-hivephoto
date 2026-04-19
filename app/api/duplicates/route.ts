import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { getDuplicateFlagged } from "@/lib/db/photos";

export async function GET(): Promise<Response> {
  try {
    const user = await requireUser();
    const photos = await getDuplicateFlagged(user.id);
    return NextResponse.json({ photos });
  } catch (err) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
