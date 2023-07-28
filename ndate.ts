#!/usr/bin/env deno run

import { handler } from "./handler.ts";

const setup = async () => {
    for await (const buff of handler(Deno.args)) {
        Deno.stdout.write(buff)
    }
}

await setup();
