import React from "react";
import { MyItemSelectHeader } from "./MyItemSelectHeader";
import { MyItemSelectList } from "./MyItemSelectList";
import type { Item } from "./types";

export async function MyItemSelect(): Promise<JSX.Element> {
  console.log("MyItemSelect renders on the server!");
  let items: Item[] = [];
  const resp = await fetch("http://127.0.0.1:3000/api/talk1/items");
  const data = await resp.json();
  items = data;

  return (
    <MyItemSelectHeader>
      <MyItemSelectList items={items} />
    </MyItemSelectHeader>
  );
}
