import type { Item } from "./types";

const ITEMS_URL = "/api/talk2/items";

export class TimeoutError extends Error {}

export function timeout(n: number): Promise<TimeoutError> {
  if (n <= 0) {
    throw new TimeoutError(
      `Argument ${n} to timeout must be a positive number.`,
    );
  }

  return new Promise((resolve) =>
    setTimeout(resolve, n, new TimeoutError("timed out!")),
  );
}

// IRL this isn't type-safe, but this is just an example
export async function raceFetch<T>(
  url: string,
  to: number,
  defaultValue: T,
  opts: RequestInit = {},
): Promise<T> {
  const controller = new AbortController();
  const { signal } = controller;
  try {
    const options: RequestInit = {
      ...opts,
      signal,
    };

    const response = await Promise.race([
      fetch(url, options),
      timeout(to), // we'll give the fetch 200ms to complete
    ]);

    if (response instanceof Error) {
      controller.abort();
      throw response;
    }

    // again, IRL you'd verify the json matches the expected schema
    return await response.json();
  } catch (err) {
    if (err instanceof TimeoutError) {
      console.log("Timed out on server fetch, deferring to client");
      return defaultValue;
    } else {
      throw err;
    }
  }
}

export async function getItems(): Promise<Item[]> {
  return raceFetch(`http://127.0.0.1:3000${ITEMS_URL}`, 200, []);
}

export async function backup(opts: RequestInit = {}): Promise<Item[]> {
  const response = await fetch(ITEMS_URL, opts);
  return await response.json();
}
