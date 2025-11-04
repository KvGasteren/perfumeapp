"use client";

import { useMemo, useState } from "react";

export function useSearch<T>(
  items: T[],
  options: {
    // which fields to search over
    keys?: (keyof T)[];
  } = {}
) {
  const { keys } = options;
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query) return items;
    const q = query.toLowerCase();

    return items.filter((item) => {
      // if keys are specified, search those
      if (keys && keys.length > 0) {
        return keys.some((key) => {
          const value = item[key];
          if (typeof value === "string" || typeof value === "number") {
            return String(value).toLowerCase().includes(q);
          }
          return false;
        });
      }

      // fallback: try to stringify the whole thing
      return JSON.stringify(item).toLowerCase().includes(q);
    });
  }, [items, query, keys]);

  return { query, setQuery, filtered };
}
