import React from "react";
import { MyItemSelectHeader } from "./MyItemSelectHeader";
import { MyItemSelectList } from "./MyItemSelectList";
import { getItems } from "./getItems";
import type { Item } from "./types";

export async function MyItemSelect(): Promise<JSX.Element> {
  console.log("MyItemSelect renders on the server!");
  const items: Item[] = await getItems();

  return (
    <MyItemSelectHeader>
      <MyItemSelectList items={items} />
    </MyItemSelectHeader>
  );
}
