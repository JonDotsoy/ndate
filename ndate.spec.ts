import { assertSnapshot } from "https://deno.land/std@0.195.0/testing/snapshot.ts";
import { handler } from "./handler.ts";

const ArrayFromAsync = async <T, R = T>(iterator: AsyncIterable<T>, mapFn?: (element: T, index: number) => R, thisArg?: any): Promise<R[]> => {
  const items: R[] = []
  let index = -1
  for await (const item of iterator) {
    index = index + 1
    items.push(mapFn?.call(thisArg, item, index) ?? item as R)
  }
  return items
}

const joinUint8ArrayGenerator = async (
  generator: AsyncIterable<Uint8Array>,
) => new Uint8Array(
  (await ArrayFromAsync(generator, e => [...e])).flat()
);

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
        handler(["-z", "-d", "2023-12-13 00:00", "-l", "es-cl", '-tz', "America/Santiago"]),
      ),
    ),
  );
});

Deno.test("format json", async (t) => {
  await assertSnapshot(
    t,
    new TextDecoder().decode(
      await joinUint8ArrayGenerator(
        handler([
          "-z",
          "-d",
          "2023-08-08T03:38:58.570Z",
          "-l",
          "es-cl",
          '-tz',
          "America/Santiago",
          '--json'
        ]),
      ),
    ),
  );
})

Deno.test("format utc", async (t) => {
  await assertSnapshot(
    t,
    new TextDecoder().decode(
      await joinUint8ArrayGenerator(
        handler([
          "-z",
          "-d",
          "2023-08-08T03:38:58.570Z",
          "-l",
          "es-cl",
          '-tz',
          "America/Santiago",
          '--utc'
        ]),
      ),
    ),
  );
})

Deno.test("format epoch", async (t) => {
  await assertSnapshot(
    t,
    new TextDecoder().decode(
      await joinUint8ArrayGenerator(
        handler([
          "-z",
          "-d",
          "2023-08-08T03:38:58.570Z",
          "-l",
          "es-cl",
          '-tz',
          "America/Santiago",
          '--epoch'
        ]),
      ),
    ),
  );
})


Deno.test("format epoch ms", async (t) => {
  await assertSnapshot(
    t,
    new TextDecoder().decode(
      await joinUint8ArrayGenerator(
        handler([
          "-z",
          "-d",
          "2023-08-08T03:38:58.570Z",
          "-l",
          "es-cl",
          '-tz',
          "America/Santiago",
          '--epoch-ms'
        ]),
      ),
    ),
  );
})


Deno.test("format template", async (t) => {
  await assertSnapshot(
    t,
    new TextDecoder().decode(
      await joinUint8ArrayGenerator(
        handler([
          "-z",
          "-d",
          "2023-08-08T03:38:58.570Z",
          "-l",
          "es-cl",
          '-tz',
          "America/Santiago",
          '--template',
          'epoch:{{epoch}}\nepoch_ms:{{epoch_ms}}\njson:{{json}}\niso:{{iso}}\niso8601:{{iso8601}}\nutc:{{utc}}\nrfc7231:{{rfc7231}}\nlocal:{{local}}\ntime:{{time}}\nYYYY:{{YYYY}}\nMM:{{MM}}\nDD:{{DD}}\nhh:{{hh}}\nmm:{{mm}}\nss:{{ss}}\nms:{{ms}}\nfull_year:{{full_year}}\nmonth:{{month}}\ndate:{{date}}\nday:{{day}}\nhours:{{hours}}\nminutes:{{minutes}}\nseconds:{{seconds}}\nmilliseconds:{{milliseconds}}\ntimezone_offset:{{timezone_offset}}\nutc_full_year:{{utc_full_year}}\nutc_month:{{utc_month}}\nutc_date:{{utc_date}}\nutc_day:{{utc_day}}\nutc_hours:{{utc_hours}}\nutc_minutes:{{utc_minutes}}\nutc_seconds:{{utc_seconds}}\nutc_milliseconds:{{utc_milliseconds}}\nlocal_weekday:{{local_weekday}}\nlocal_literal:{{local_literal}}\nlocal_day:{{local_day}}\nlocal_month:{{local_month}}\nlocal_year:{{local_year}}\nlocal_hour:{{local_hour}}\nlocal_minute:{{local_minute}}\nlocal_second:{{local_second}}\nlocal_timeZoneName:{{local_timeZoneName}}'
        ]),
      ),
    ),
  );
})

Deno.test("format template with transform", async (t) => {
  await assertSnapshot(
    t,
    new TextDecoder().decode(
      await joinUint8ArrayGenerator(
        handler([
          "-z",
          "-d",
          "2023-08-08T03:38:58.570Z",
          "-l",
          "es-cl",
          '-tz',
          "America/Santiago",
          '--template',
          '{{rfc7231:json}}'
        ]),
      ),
    ),
  );
})

Deno.test("format template with transform", async (t) => {
  await assertSnapshot(
    t,
    new TextDecoder().decode(
      await joinUint8ArrayGenerator(
        handler([
          "-z",
          "-d",
          "2023-08-08T03:38:58.570Z",
          "-l",
          "es-cl",
          '-tz',
          "America/Santiago",
          '--template',
          '{{rfc7231:sub:0:3}}'
        ]),
      ),
    ),
  );
})

Deno.test("format template with transform", async (t) => {
  await assertSnapshot(
    t,
    new TextDecoder().decode(
      await joinUint8ArrayGenerator(
        handler([
          "-z",
          "-d",
          "2023-08-08T03:38:58.570Z",
          "-l",
          "es-cl",
          '-tz',
          "America/Santiago",
          '--template',
          '{{month:padStart:4:0}}'
        ]),
      ),
    ),
  );
})

Deno.test("format template with transform", async (t) => {
  await assertSnapshot(
    t,
    new TextDecoder().decode(
      await joinUint8ArrayGenerator(
        handler([
          "-z",
          "-d",
          "2023-08-08T03:38:58.570Z",
          "-l",
          "es-cl",
          '-tz',
          "America/Santiago",
          '--template',
          '{{month:padEnd:4:0}}'
        ]),
      ),
    ),
  );
})
