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
