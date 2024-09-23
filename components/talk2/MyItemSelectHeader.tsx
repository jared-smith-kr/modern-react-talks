import React from "react";

export function MyItemSelectHeader({
  children,
}: React.PropsWithChildren): JSX.Element {
  console.log("MyItemSelectHeader renders on the server!");
  return (
    <div className="whatever">
      <h2>Item List</h2>
      <p>These items are the ones that have extra specially goodness</p>
      {children}
    </div>
  );
}
