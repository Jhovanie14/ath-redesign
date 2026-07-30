import { getSession } from "@/lib/auth";
import { SiteHeaderClient } from "./site-header-client";

export async function SiteHeader() {
  const session = await getSession();
  return <SiteHeaderClient session={session} />;
}
