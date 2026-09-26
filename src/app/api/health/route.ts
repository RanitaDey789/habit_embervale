import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!db) {
    // App is local-first; the DB probe is optional.
    return Response.json(
      { ok: false, database: "not configured — set DATABASE_URL to enable this probe" },
      { status: 503 }
    );
  }
  try {
    await db.execute(sql`select 1`);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
