import { NextResponse } from "next/server";
import { requireCron } from "@/lib/auth/guards";
import { runCleanup } from "@/lib/cron/cleanup";

export async function GET(request: Request): Promise<Response> {
  try {
    requireCron(request);
    const result = await runCleanup();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
