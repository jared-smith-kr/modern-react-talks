# Server Actions

Remember back when we first talked about RSCs and I said that `"use client"` marks a component as being client-side but `"use server"` did something completely different? Well, now we're going to talk about what `"use server"` actually does.

## The React Obesity Crisis

Lets look at what it takes to submit some data to a server _without_ `"use server"`:

```typescript
"use client";
import { ChangeEvent, FormEvent, useState, useTransition } from "react";

const formControlStyles = {
  display: "flex",
  flexDirection: "column",
} as const;

export function MyForm(): JSX.Element {
  // We'll discuss concurrent rendering next time
  const [isPending, startTransition] = useTransition();
  const [a, setA] = useState("");
  const [b, setB] = useState("");

  // again, not going to memoize, React compiler, later talk, yadda yadda
  const onSubmit = (evt: FormEvent<HTMLFormElement>): void => {
    evt.preventDefault();
    startTransition(() => {
      fetch("http://127.0.0.1:3000/api/talk3", {
        method: "POST",
        body: JSON.stringify({ a, b }),
      }).catch(console.error);
    });
  };

  const onChange = (evt: ChangeEvent<HTMLInputElement>): void => {
    if (evt.target.name === "a") {
      setA(evt.target.value);
    } else {
      setB(evt.target.value);
    }
  };

  return (
    <>
      <h3>{isPending ? "Sending" : "Sent"}</h3>
      <form onSubmit={onSubmit}>
        <input
          style={formControlStyles}
          type="text"
          name="a"
          value={a}
          onChange={onChange}
        />
        <input
          style={formControlStyles}
          type="text"
          name="b"
          value={b}
          onChange={onChange}
        />
        <button style={formControlStyles} type="submit">
          Submit
        </button>
      </form>
    </>
  );
}
```

Wow, that's a lot of code for a form submission. Oh, but wait! We forgot the server bits!

```typescript
export async function POST(req: Request): Promise<Response> {
  const { a, b } = await req.json();
  console.log(a, b);
  return Response.json({ message: "success!" });
}
```

Hmmm... I'm all about React enabling rich client-side applications, but this feels a little... ridiculuous? We've got client-side state, controlled inputs, serialization/deserialization logic to marshal data across the client-server divide, multiple Javascript event handlers, etc. It's not that the code is _hard to write_ per se, but this is very boilerplate-heavy. Stuff like this is why people wrote component scaffold CLI tools, although today you'd probably let an LLM write this kind of boilerplate for you. And of course, if you want this to be progressively enhanced, your pretty much out of luck.

What if I told you it didn't have to be like this (anymore)?

## Party like it's 1999

This is what the above looks like in modern React:

```typescript
// NOTE: No "use client"!
import { serverific } from "@/actions/talk3";

const formControlStyles = {
  display: "flex",
  flexDirection: "column",
} as const;

export function MyServerForm(): JSX.Element {
  return (
    <form action={serverific}>
      <input style={formControlStyles} type="text" name="a" />
      <input style={formControlStyles} type="text" name="b" />
      <button style={formControlStyles} type="submit">
        Submit
      </button>
    </form>
  );
}
```

Ok, wow, that looks... significantly easier. It's also a server component, meaning no runtime overhead. Of course, we haven't seen the code for the `serverific` function that's doing the heavy-lifting, lets take a look and see what the damage is...

```typescript
export async function serverific(data: FormData): Promise<void> {
  "use server";
  const a = data.get("a");
  const b = data.get("b");
  console.log(a, b);
}
```

Oh. Well ok then. Not only is it significantly shorter, it's also progressively enhanced. The `MyServerForm` component will work **_even with Javascript disabled_**. That's wild. Notice that all of our client-side state is now gone, it was only ever there to track form state to make serialization easy.

Granted, this is a pretty basic use case. We're not doing any validation, or response handling on the client, or error handling. Unfortunately, we won't be able to fully address that until we get to `useFormAction` in React 19, but we're on the way there at least enough for a cool demo.

## Caveats

TANSTAAFL, so lets talk about some gotchas:

1. They aren't meant to be used for data _fetching_ (if you recall we covered that in the last two talks), only data mutations and other side-effects.
2. In order to maintain progressive enhancement you'll be working with `FormData` instead of JSON.
3. MAAAAGIC (more on this in a second)
4. You can't use a server action directly in a client component unless it's from a file marked with "use server" at the top, instead you can pass it as props from a server component.

Speaking of marking an entire file with "use server"...

## Don't use the `"use server"` Directive at the top of files

When you do, the bundler will create client callable tokens and matching API endpoints for _every function exported from the file_, and if you didn't mean to allow the client to call a particular function congratulations: you just opened up a security vulnerability! While it certainly is convenient to be able to mark a bunch of server actions in the same file as such the fact that many people seem to mistakenly think they need to mark server component files with `"use server"` the way you do with client components means that it's probably better to not add to the confusion and just inline the `"use server"` directive directly in the function body and not contribute to further confusion. An alternative convention that could work is only having one server action per file, in a folder called `/actions`, and using the directive at the top of the file. Regardless, lets make sure we have _some_ sort of convention to get this right.

## It's Magic, Ya Know...

Probably the biggest downside to server actions is that the framework is obviously doing a **lot** of work under the hood on your behalf. That's fine if you've got a solid mental model of what's going on, but you can't ignore the man behind the curtain in the Emerald Palace of Nextjs/Redwood/whatever. I generally am skeptical of stuff like this that tries to do a bunch of magic to eliminate the client-server gap, but the benefits here are compelling enough to be worth a little complexity.

## What this means for Esperanto, circa today

Some takeaways of things you can be doing right now to help get Esperanto ready for this:

1. Use the `form` tag for form controls like `input`s, `select`s, and `textarea`s.
2. Again, try to separate out as much as you can the HTML bits from the stuff that really needs client side state (as opposed to incidental client-side state like the kind we got rid of in this example).
3. Relatedly, try to separate necessary client-side state from stuff that is only there because of how React works in preparation for the day we can refactor it away.
