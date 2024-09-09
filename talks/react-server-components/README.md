# React Server Components

When I first learned about RSCs I had a lot of wrong mental models about them, and I (wrongly) thought they added a lot of complexity to the React API in the name of performance. So on the assumption that I'm not the only one, I want to break those down a bit.

## The Dawn of React - Yet Another Party I Was Fashionable Late To

In 2017 I was working on a component library and had thrown in the towel on Web Components. Glancing around the ecosystem I didn't see anything that excited me too much. Ember was slowly burning out (pun intended), my flirtation with AngularJS ended in sadness, and React used _classes_ (not a popular choice during peak "functional JS"). But I kept hearing about it, and this was before the days of the current crop of social media tech influencers when that meant more, so I gave the at-the-time fairly new `create-react-app` a spin. I wasn't expecting to fall in love.

React had a few big things going for it:

1. The model was _simple_, your views are pure functions of your application state
2. Implied by bullet 1, the data flow is uni-directional. This was such a big win it convinced the Angular folks to do a
   complete re-write to get rid of their two-way data binding system.
3. The tooling was excellent (ain't nobody got time to configure webpack by hand)
4. They abandoned the industry standard practice of templating

### Every Templating Language Sucks - Rant Time

Templates target this imaginary group of people who aren't allergic to code but also aren't wonk enough to use a real programming language. But designers don't want to code at all, and coders want the expressivity of a real programming language, which is why every templating system inevitably adds conditionals/loops/error handling until it becomes a crappy simulacrum of a programming language. But I digress.

## The Great Transistion: F#@k You useEffect

Despite the clickbait-y heading I don't actually hate `useEffect`, but even it's staunchest defenders would have to concede that `useEffect` is **not simple**. I love hooks, but they did add a lot of complexity to something that previously had simplicity as a selling point. I thought with React Server Components we had strayed even further away from one of the main selling points of React. But the truth is, we already had.

### The Elephant in the Room

We left the simple world when we started to do Server-Side Rendering. All that simplicity I loved only really pertained to CSR React, SSR requires you to simultaneously hold two different mental models in your head when looking at any given component. How many of us have forgotten a `if (typeof window === 'undefined')` check before? Don't lie, I read the RUM report. If you take nothing else away from this today, this is key to understanding the "why" of React Server Components:

> React Server Components are Very Different from SSR

In the new React model, you don't have to worry about where a component might run, because Server components _only_ run on the server, and Client components _only_ run on the client. This is actually _simpler_ conceptually than the current SSR model. Not gonna lie though, there are some changes that arise out of the implications of that which may be more complicated than what you're doing today. Lets dig in.

## Meat and Potatoes

Since React Server Components only ever run on the server, meaning you can do things you can't do in the client but also have the limitations of something that lives in the HTTP request/response cycle:

1. Server components can be async
2. Server components can use node.js APIs
3. Server components **cannot be stateful**: no `useState`/`useReducer`/`useContext` and no Redux!

Server components are meant to be reduced to plain HTML/CSS/JS with no access to the React runtime. What this buys you is that parts of your app that aren't actually reactive can be pre-rendered, cached, and very quickly served to requesters, and parts of your app that need simple data fetches can easily do so in node.js. What this means in practice is that in order to realize the maximum benefits of RSCs you have to _push state down_ the render tree instead of lifting it up. The old pratices of having most/all of your state in the root-level App component (and/or having all your Context Providers at the root) need to go. To be fair, we were _always_ supposed to have been doing this if you read the recommended best practices from the team at Meta, but most of us didn't out of pure convenience.

## There's a Jeff Goldblum-Sized Fly in the Ointment

How do you know if a component is a client component or a server component? Here are the rules, and much like the rules of hooks they suck but the benefits are real:

1. Components are treated as Server Components by default
2. Any component marked with the 'use client' directive is a Client Component
3. **Any child or nested child of a Client Component is itself a Client Component**

The last one is the one that is \#problematic. It's pretty easy to stick something clearly intended to be a RSC as the child of something that is necessarily a client component (e.g. something stateful). It's also the reason I said that we need to start thinking about pushing state down the render tree: a stateful component near the root means that none of its children/nested children can be pre-rendered on the server or use server-side APIs.

So rather than thinking about it positively, i.e. "if I add this to the component it makes it a Client or Server
component" I prefer to think _negatively_: "if I add this to the component it _cannot be_ a Client/Server component". So
here are _my_ rules of componenting in modern React, which don't actually conflict with the rules above:

1. If it's async or uses Node APIs it _cannot be_ a Client Component _nor the descendant of one_.
2. If it is stateful then it _cannot be_ a server component and _cannot have async/node-api-using components as a descendant_.
3. If neither of those applies then it can be rendered either on the server or on the client and which one of those happens is dependent on its ancestors.

clear as mud? what this means if you have a component that doesn't have state or make async calls and you want to add statefulness or asynchrony you need to pay attention to how that component interacts with other components. This model does force you to be a bit more intentional about _where_ you add those things: you could de-optimize large swathes of your app by placing client state to close to the root of the render tree or find that making an async call in a component triggers a build error because it was a child of a stateful and therefor Client-only component and you didn't realize.

This is the complex bit of using server components: it's not necessarily enough to look at the component itself, you have to be aware of the context it is used in. In a "distributed" application like Esperanto this can get fuzzy. Some frameworks like Nextjs include a "poison pill" side-effective import so that a component can _only_ be rendered on the server without triggering a build error (and you can always mark a component 'use client' to ensure it isn't rendered on the server even if it isn't stateful).

### Quick Aside about 'use server'

The 'use server' directive is **not** the opposite twin of the 'use client' directive despite the superficial similarity. This seems to be a common point of confusion: components are treated as Server Components by default and you do not need to mark them as such. We'll talk more about what 'use server' is for in a later session, but just know for now that it's completely different.

## What the 'Ask' Here Is

- Look for ways to push state down the render tree: if you see a call to e.g. `connect` in a place where we could easily
  push it down to multiple calls in children then move it down.
- Look for places to split things that could be inert HTML out from things that are inherently stateful.

Let's look at a quick example:

```typescript
function MyComponent(): JSX.Element {
  const [selected, setSelected] = useState<Item>();
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    fetch('some url')
      .then((resp) => resp.json())
      .catch(handleError);
  }, []);

  const handleChange = useCallback(() => {
    return (idx: number) => setSelected(items[idx]);
  }, []);

  return (
    <div className="whatever">
      <h2>Item List</h2>
      <p>These items are the ones that have extra specially goodness</p>
      <p>{selected && selected.description}</p>
      <label>Item
        <select>
          {
            items.map((item: Item, index: number): JSX.Element => {
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            });
          }
        </select>
      </label>
    </div>
  );
}
```

to "modernize" this we would split out the inert parts and make an async server-side call:

```typescript
export function MyComponentSkeleton({ children }: PropsWithChildren): JSX.Element {
  return (
    <div className="whatever">
      <h2>Item List</h2>
      <p>These items are the ones that have extra specially goodness</p>
      { children }
    </div>
  );
}
```

and another component file:

```typescript
'use client' // marks as client component

export function MyClientComponent({ items }: MyChildComponentProps): JSX.Element {
  const [selected, setSelected] = useState<Item>();

  // We'll count on the React compiler to memoize this for us, we'll talk
  // more about it in a later session
  const handleChange = (evt: React.ChangeEvent<HTMLSelectElement>): void =>
    setSelected(items[Number(evt.target.value))]);

  return (
    <p>{selected && selected.description}</p>
    <label>Item
      <select onChange={handleChange}>
        {
          items.map((item: Item): JSX.Element => {
            <option key={item.id} value={item.id}>
              {item.text}
            </option>
          });
        }
      </select>
    </label>
  );
}
```

then in yet another file:

```typescript
// Look ma! async even!
export async function MyItemSelectSkeleton(): Promise<JSX.Element> {
  let items: Items[] = [];
  try {
    const resp = await fetch('some url');
    const data = await resp.json();
    items = data;
  } catch (err) {
    handleError(err);
  }

  return (
    <MyComponentSkeleton>
      <MyClientComponent items={items} />
    </MyComponentSkeleton>
  );
}
```

Note some things that fall out of this: the individual components are much simpler and easier to test. There's a clear delineation between the client and the server bits. The stateless stuff is separated from the part that is stateful. The state related to fetching data is just gone entirely and the what remains is purely local to the component. The static HTML is now cacheable, including using Akamai for edge caching. What's lost is the ability to glance at a single file an figure out what's happening, and the convenience of having access to stuff in a closure rather than passing it explicitly as props. I appreciate that it can obscure the business logic a bit, but the cleaner separation of concerns and performance wins are worth it.
