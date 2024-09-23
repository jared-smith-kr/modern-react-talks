"use client"; // marks as client component
import React, { useState } from "react";
import type { Item } from "./types";

export type MyChildComponentProps = {
  items: Item[];
};

export function MyItemSelectList({
  items,
}: MyChildComponentProps): JSX.Element {
  console.log("MyItemSelectList renders on the client!");
  const [selected, setSelected] = useState<Item>();

  // We'll count on the React compiler to memoize this for us, we'll talk
  // more about it in a later session
  const handleChange = (evt: React.ChangeEvent<HTMLSelectElement>): void =>
    setSelected(items[Number(evt.target.value)]);

  return (
    <>
      <p>{selected ? selected.description : items[0]?.description}</p>
      <label>
        Item
        <select onChange={handleChange}>
          {items.map(
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
