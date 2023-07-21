import { assertSnapshot } from "https://deno.land/std@0.195.0/testing/snapshot.ts";
import { handler } from "./handler.ts";

const joinUint8ArrayGenerator = async (
  generator: AsyncGenerator<Uint8Array>,
) => {
  let buffEnd = new Uint8Array();
  for await (const line of generator) {
    buffEnd = new Uint8Array([...buffEnd, ...line]);
  }
  return buffEnd;
};

Deno.test("show help", async (t) => {
  await assertSnapshot(
    t,
    new TextDecoder().decode(
      await joinUint8ArrayGenerator(
        handler(["-h"]),
      ),
    ),
  );
});

Deno.test("render date", async (t) => {
  await assertSnapshot(
    t,
    new TextDecoder().decode(
      await joinUint8ArrayGenerator(
        handler(["-z", "-d", "2023-12-13 00:00","-l","es-cl",'-tz',"America/Santiago"]),
      ),
    ),
  );
});
