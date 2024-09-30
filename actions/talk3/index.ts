"use server";

export type MyFormData = {
  a: string;
  b: string;
};

export async function serverific(value: MyFormData): Promise<void> {
  console.log(value);
}
