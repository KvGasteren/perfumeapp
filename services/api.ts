import { getBaseUrl } from "@/lib/getBaseUrl";

const baseUrl = getBaseUrl();

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const j = await res.json();
      msg = j.error ?? msg;
    } catch {}
    throw new Error(msg);
  }
  return (await res.json()) as T;
}

export const api = {
  get: async <T>(path: string) =>
    json<T>(await fetch(`${baseUrl}${path}`, { cache: "no-store" })),
  post: async <T>(path: string, body?: unknown) =>
    json<T>(
      await fetch(`${baseUrl}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
    ),
  patch: async <T>(path: string, body?: unknown) =>
    json<T>(
      await fetch(`${baseUrl}${path}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
    ),
  del: async (path: string) => {
    const res = await fetch(`${baseUrl}${path}`, { method: "DELETE" });
    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try {
        const j = await res.json();
        msg = j.error ?? msg;
      } catch {}
      throw new Error(msg);
    }
  },
};
