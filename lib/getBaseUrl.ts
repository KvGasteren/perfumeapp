export function getBaseUrl() {
  // 1. If we’re on the client, just use relative paths
  if (typeof window !== "undefined") {
    return "";
  }

  // 2. If we’re on Vercel, they give us the domain
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // 3. If you set your own public base URL, use that
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  // 4. Fallback for local dev SSR
  return "http://localhost:3000";
}
