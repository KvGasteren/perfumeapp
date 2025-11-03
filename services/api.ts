const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

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
    json<T>(await fetch(`${BASE}${path}`, { cache: "no-store" })),
  post: async <T>(path: string, body?: unknown) =>
    json<T>(
      await fetch(`${BASE}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
    ),
  patch: async <T>(path: string, body?: unknown) =>
    json<T>(
      await fetch(`${BASE}${path}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
    ),
  del: async (path: string) => {
    const res = await fetch(`${BASE}${path}`, { method: "DELETE" });
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
