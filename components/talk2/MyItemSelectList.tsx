"use client"; // marks as client component
import React, { useState, useEffect } from "react";
import { backup } from "./getItems";
import type { Item } from "./types";

export type MyChildComponentProps = {
  items: Item[];
};

export function MyItemSelectList({
  items,
}: MyChildComponentProps): JSX.Element {
  console.log("MyItemSelectList renders on the client!");
  const [selected, setSelected] = useState<Item>();
  const [list, setList] = useState(items);

  useEffect(() => {
    if (!items.length) {
      console.log("Something went wrong on the server, fetching client-side");
      backup().then(setList).catch(console.error);
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
