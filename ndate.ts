#!/usr/bin/env deno run

import { handler } from "./handler.ts";
import { formatError } from "./lib/errors.ts";

const verbose = Deno.args.includes("--verbose");

try {
  for await (const buff of handler(Deno.args)) {
    Deno.stdout.write(buff)
  }
} catch (error) {
  console.error(formatError(error, verbose));
  Deno.exit(1);
}
