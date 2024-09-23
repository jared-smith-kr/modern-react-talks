# Resilliency in React Server Components

**CAVEAT**: there's a lot to writing robust code. We're not going to cover all of it today. This talk will be scoped mostly to some RSC patterns. It also shouldn't be as deep as the last one.

## How long should we wait?

Last time we took a look at a server component that did some async data fetching. But we didn't do any error handling,
and we didn't set any kind of timeout in case the upstream API call takes forever:

```typescript
export async function MyItemSelect(): Promise<JSX.Element> {
  let items: Item[] = [];
  try {
    const resp = await fetch('some url');
    const data = await resp.json();
    items = data;
  } catch (err) {
    handleError(err);
  }

  return (
    <MyItemSelectHeader>
      <MyClientItemSelect items={items} />
    </MyItemSelectHeader>
  );
}
```

So let's fix it!

```typescript
export class TimeoutError extends Error {}

export function timeout(n: number): Promise<TimeoutError> {
  return new Promise((resolve) =>
    setTimeout(resolve, n, new TimeoutError("timed out!")),
  );
}

async function getItems(): Promise<Item[]> {
  try {
    const resp = await Promise.race([
      fetch('some url'),
      timeout(200)
    ]);

    if (resp instanceof Error) throw resp;
    return await resp.json();
  } catch (err) {
    if (err instanceof TimeoutError) {
      return [];
    }

    throw err; // unknown err
  }
}

export async function MyItemSelect(): Promise<JSX.Element> {
  const items: Item[] = await getItems();

  return (
    <MyItemSelectHeader>
      <MyClientItemSelect items={items} />
    </MyItemSelectHeader>
  );
}
```

Okay cool. But what happens if we get an empty array on the client? Lets add some client side data fetching:

```typescript
export function MyItemSelectList({
  items,
}: MyChildComponentProps): JSX.Element {
  console.log("MyItemSelectList renders on the client!");
  const [selected, setSelected] = useState<Item>();
  const [list, setList] = useState(items);

  useEffect(() => {
    if (!items.length) {
      fetch('some-url').then(setList).catch(console.error);
    }
  }, []);

  // We'll count on the React compiler to memoize this for us, we'll talk
  // more about it in a later session
  const handleChange = (evt: React.ChangeEvent<HTMLSelectElement>): void =>
    setSelected(list[Number(evt.target.value)]);

  return (
    <>
      <p>{selected ? selected.description : list[0]?.description}</p>
      <label>
        Item
        <select onChange={handleChange}>
          {list.map(
            (item: Item, i: number): JSX.Element => (
              <option key={item.id} value={i}>
                {item.text}
              </option>
            ),
          )}
        </select>
      </label>
    </>
  );
}
```

So as you can see here, this is robust: we handle errors, we include a fallback empty array. It's performant: we do a race with a timeout Promise so we don't wait too long to respond from the server. It's relatively succinct, and what boilerplate there is can easily be abstracted out.

```typescript
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
```

## What this means for Esperanto:

It's likely that Calypso will be updated to integrate some of these patterns but to the extent that it isn't, be prepared to use patterns like this for data fetching.
