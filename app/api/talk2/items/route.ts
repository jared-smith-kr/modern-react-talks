// This is a mock route file that will be used to mock a 3rd API response.
// IRL you would not use a route handler like this, but instead use a real API.
import type { Item } from "@/components/talk1/types";

function coinflip(): boolean {
  return Boolean(Math.round(Math.random()));
}

// Here we introduce some deliberate flakiness to the response. This isn't
// cached either,
export async function GET() {
  const timeout = coinflip() ? 5000 : 0;
  await new Promise((resolve) => setTimeout(resolve, timeout));
  const items: Item[] = [
    { id: 1, description: "f1r5t p05t!", text: "first" },
    { id: 2, description: "secondarily", text: "second" },
    { id: 3, description: "trifecta", text: "third" },
  ];
  return Response.json(items);
}
