// The Supabase project URL is not a secret — it's just the address of
// your project's API, the same as any other public API endpoint. It's
// safe to expose in the frontend bundle via a VITE_ env var. Nothing
// sensitive (like the service role key) is ever put here.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;

export function getProductImageUrl(path: string | null | undefined): string {
  if (!path) return "/placeholder.svg";
  if (!SUPABASE_URL) return "/placeholder.svg";
  return `${SUPABASE_URL}/storage/v1/object/public/product-images/${path}`;
}
