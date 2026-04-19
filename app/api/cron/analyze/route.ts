import { NextResponse } from "next/server";
import { requireCron } from "@/lib/auth/guards";
import { runAnalyzeCron } from "@/lib/cron/analyze";

export async function GET(request: Request): Promise<Response> {
  try {
    requireCron(request);
    const result = await runAnalyzeCron();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[cron/analyze]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
