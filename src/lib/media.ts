import fs from "node:fs";
import path from "node:path";

const EXTENSIONS = ["jpg", "jpeg", "png", "webp", "avif"];

/**
 * Server-only. Given a base path under /public without extension
 * (e.g. "images/hero"), returns the public URL of the first matching image
 * file that exists, or undefined. Lets photos be dropped into /public with no
 * code change — the EditorialImage slot renders craft art until a file appears.
 *
 * Note: for statically-generated pages the check runs at build time, so add
 * images then rebuild (in `next dev` it resolves per request).
 */
export function resolveImage(baseRelPath: string): string | undefined {
  const base = baseRelPath.replace(/^\/+/, "").replace(/\.[a-z0-9]+$/i, "");
  for (const ext of EXTENSIONS) {
    const rel = `${base}.${ext}`;
    if (fs.existsSync(path.join(process.cwd(), "public", rel))) {
      return `/${rel}`;
    }
  }
  return undefined;
}
