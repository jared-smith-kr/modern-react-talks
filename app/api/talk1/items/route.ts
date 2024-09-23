// This is a mock route file that will be used to mock a 3rd API response.
// IRL you would not use a route handler like this, but instead use a real API.
import type { Item } from "@/components/talk1/types";

export function GET() {
  const items: Item[] = [
    { id: 1, description: "f1r5t p05t!", text: "first" },
    { id: 2, description: "secondarily", text: "second" },
    { id: 3, description: "trifecta", text: "third" },
  ];
  return Response.json(items);
}
