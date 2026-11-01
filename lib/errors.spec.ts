import { assertSnapshot } from "jsr:@std/testing@1/snapshot";
import { assertEquals } from "jsr:@std/assert@1";
import { handler } from "../handler.ts";
import { formatError, isPrintableError } from "./errors.ts";

const errorOf = async (args: string[]): Promise<unknown> => {
  try {
    for await (const _ of handler(args)) { /* drain */ }
  } catch (error) {
    return error;
  }
  throw new Error(`expected ndate ${args.join(" ")} to fail`);
};

const printableCases: Record<string, string[]> = {
  "unexpected argument": ["--no-valid-flag"],
  "invalid date": ["-d", "not a date"],
  "invalid time zone": ["--time-zone", "Nope/Zone"],
  "invalid locale": ["--local", "not a locale"],
  "invalid date style": ["--date-style", "bogus"],
  "invalid time style": ["--time-style", "bogus"],
  "invalid hour cycles": ["--hour-cycles", "h99"],
};

for (const [name, args] of Object.entries(printableCases)) {
  Deno.test(`printable error message: ${name}`, async (t) => {
    const error = await errorOf(args);
    assertEquals(isPrintableError(error), true);
    await assertSnapshot(t, formatError(error));
  });
}

Deno.test("unexpected errors are not printable and keep the stack", () => {
  const error = new RangeError("boom");
  assertEquals(isPrintableError(error), false);
  assertEquals(formatError(error).includes("    at "), true);
});
