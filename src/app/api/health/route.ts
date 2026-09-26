/**
 * Liveness probe.
 *
 * Embervale is local-first: all user data lives in the visitor's browser
 * (IndexedDB). No server-side database is used, so this endpoint has no
 * external dependencies and always answers from the runtime itself.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    ok: true,
    app: "Embervale",
    storage: "local-first — IndexedDB in the browser",
    serverDatabase: "not used",
  });
}
