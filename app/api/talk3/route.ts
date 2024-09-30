export async function POST(req: Request): Promise<Response> {
  const { a, b } = await req.json();
  console.log(a, b);
  return Response.json({ message: "success!" });
}
