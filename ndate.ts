#!/usr/bin/env deno run

import { handler } from "./handler.ts";

for await (const buff of handler(Deno.args)) {
    Deno.stdout.write(buff)
}
