import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { executeSearch } from "@/lib/search/query";

export async function GET(request: Request): Promise<Response> {
  try {
    const user = await requireUser();
    const url = new URL(request.url);
    const query = url.searchParams.get("q") ?? "";
    const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "50"), 200);
    const offset = parseInt(url.searchParams.get("offset") ?? "0");

    if (!query.trim()) {
      return NextResponse.json({ filters: {}, photos: [], total: 0, page: 0, limit });
    }

    const result = await executeSearch(user.id, query, limit, offset);
    return NextResponse.json({ ...result, page: Math.floor(offset / limit) });
  } catch (err) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
