import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { getPeopleByUser, createPerson } from "@/lib/db/people";

export async function GET(): Promise<Response> {
  try {
    const user = await requireUser();
    const people = await getPeopleByUser(user.id);
    return NextResponse.json({ people });
  } catch (err) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const user = await requireUser();
    const { name } = (await request.json()) as { name: string };
    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    const person = await createPerson(user.id, name.trim());
    return NextResponse.json({ person }, { status: 201 });
  } catch (err) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
