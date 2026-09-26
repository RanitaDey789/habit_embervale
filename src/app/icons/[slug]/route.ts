import { paintIcon } from "@/lib/iconPng";

/**
 * Fallback icon server.
 *
 * Static files in public/icons/ take precedence when present. This route
 * only answers when they're missing from a deployment, guaranteeing the
 * PWA manifest icons (and favicon) can never 404 — the #1 cause of
 * "This app cannot be installed".
 */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> }
): Promise<Response> {
  const { slug } = await ctx.params;
  const match = /^icon-(192|512)\.png$/.exec(slug);
  if (!match) {
    return new Response("Not found", { status: 404 });
  }
  const body = paintIcon(Number(match[1]));
  return new Response(new Uint8Array(body), {
    headers: {
      "content-type": "image/png",
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}
