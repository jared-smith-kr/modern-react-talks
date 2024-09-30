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
