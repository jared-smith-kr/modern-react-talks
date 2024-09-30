export async function serverific(data: FormData): Promise<void> {
  "use server";
  const a = data.get("a");
  const b = data.get("b");
  console.log(a, b);
}
