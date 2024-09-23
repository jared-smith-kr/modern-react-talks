import type { Item } from "@/components/talk1/types";

export function GET() {
  const items: Item[] = [
    { id: 1, description: "f1r5t p05t!", text: "first" },
    { id: 2, description: "secondarily", text: "second" },
    { id: 3, description: "trifecta", text: "third" },
  ];
  return Response.json(items);
}
