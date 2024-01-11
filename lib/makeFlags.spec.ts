import {
  assertArrayIncludes,
  assertEquals,
  assertInstanceOf,
  assertObjectMatch,
} from "https://deno.land/std@0.204.0/assert/mod.ts";
import { makeFlags as makeFlags2 } from "../makeFlags.ts";

Deno.test("should parse zero argument", () => {
  assertEquals(makeFlags2([]).insertFinalNewLine, true);
  assertEquals(makeFlags2(["-z"]).insertFinalNewLine, false);
  assertEquals(makeFlags2(["--zero"]).insertFinalNewLine, false);
});

Deno.test("should parse date argument", () => {
  assertInstanceOf(makeFlags2([]).date, Date);
  assertEquals(
    makeFlags2(["-d", "2024-04-02T05:23:05Z"]).date.toJSON(),
    "2024-04-02T05:23:05.000Z",
  );
  assertEquals(
    makeFlags2(["--date", "2024-04-02T05:23:05Z"]).date.toJSON(),
    "2024-04-02T05:23:05.000Z",
  );
});

Deno.test("should parse help argument", () => {
  assertEquals(makeFlags2([]).showHelp, false);
  assertEquals(makeFlags2(["-h"]).showHelp, true);
  assertEquals(makeFlags2(["--help"]).showHelp, true);
});

Deno.test("should parse date-style argument", () => {
  assertEquals(makeFlags2([]).dateStyle, "full");
  assertEquals(makeFlags2(["--date-style", "other"]).dateStyle, "none");
  assertEquals(makeFlags2(["--date-style", "medium"]).dateStyle, "medium");
});

Deno.test("should parse time-style argument", () => {
  assertEquals(makeFlags2([]).timeStyle, "full");
  assertEquals(makeFlags2(["--time-style", "other"]).timeStyle, "none");
  assertEquals(makeFlags2(["--time-style", "medium"]).timeStyle, "medium");
});

Deno.test("should parse hour-cycles argument", () => {
  assertEquals(makeFlags2([]).hourCycle, "none");
  assertEquals(makeFlags2(["--hour-cycles", "h23"]).hourCycle, "h23");
  assertEquals(makeFlags2(["--hour-cycles", "h12"]).hourCycle, "h12");
});

Deno.test("should parse time-zone argument", () => {
  assertEquals(makeFlags2([]).timeZone, undefined);
  assertEquals(
    makeFlags2(["--time-zone", "America/Santiago"]).timeZone,
    "America/Santiago",
  );
  assertEquals(
    makeFlags2(["-tz", "America/Santiago"]).timeZone,
    "America/Santiago",
  );
});

Deno.test("should parse local argument", () => {
  assertEquals(makeFlags2([]).local, undefined);
  assertEquals(makeFlags2(["--local", "es-CL"]).local, "es-CL");
  assertEquals(makeFlags2(["-l", "es-CL"]).local, "es-CL");
});

Deno.test("should parse template argument", () => {
  assertEquals(makeFlags2([]).template, undefined);
  assertEquals(makeFlags2(["--template", "hello"]).template, "hello");
});

Deno.test("should parse json argument", () => {
  assertEquals(makeFlags2([]).outputAsJSON, false);
  assertEquals(makeFlags2(["--json"]).outputAsJSON, true);
  assertEquals(makeFlags2(["-j"]).outputAsJSON, true);
});

Deno.test("should parse sheet argument", () => {
  assertEquals(makeFlags2([]).outputAsSheet, false);
  assertEquals(makeFlags2(["--sheet"]).outputAsSheet, true);
});

Deno.test("should parse utc argument", () => {
  assertEquals(makeFlags2([]).outputAsUTC, false);
  assertEquals(makeFlags2(["--utc"]).outputAsUTC, true);
});

Deno.test("should parse epoch argument", () => {
  assertEquals(makeFlags2([]).outputAsEpoch, false);
  assertEquals(makeFlags2(["--epoch"]).outputAsEpoch, true);
});

Deno.test("should parse epoch-ms argument", () => {
  assertEquals(makeFlags2([]).outputAsEpochMS, false);
  assertEquals(makeFlags2(["--epoch-ms"]).outputAsEpochMS, true);
});

Deno.test("should parse hyphen argument", () => {
  assertEquals(makeFlags2([]).stdinReadable, false);
  assertEquals(makeFlags2(["-"]).stdinReadable, true);
});

Deno.test("should get the transformOptions field", () => {
  const s = Array.from(Object.keys(makeFlags2([]).transformOptions));

  assertArrayIncludes(s, [
    "-",
    "--zero",
    "--date-style",
    "--time-style",
    "--hour-cycles",
    "--time-zone",
    "--local",
    "--template",
    "--json",
    "--sheet",
    "--utc",
    "--epoch",
    "--epoch-ms",
    "--date",
    "--help",
    "-j",
    "-d",
    "-l",
    "-tz",
    "-z",
    "-h",
  ]);
});

Deno.test("should get the optionsLabels field", () => {
  const s = makeFlags2([]).optionsLabels;

  assertObjectMatch(s, {
    "--date": {
      label: "<date>",
    },
    "-d": {
      label: "<date>",
    },
    "--date-style": {
      label: "<full|long|medium|short|none>",
    },
    "--hour-cycles": {
      label: "<h11|h12|h23|h24|none>",
    },
    "--local": {
      label: "<locale>",
    },
    "-l": {
      label: "<locale>",
    },
    "--template": {
      label: "<template>",
    },
    "--time-style": {
      label: "<full|long|medium|short|none>",
    },
    "--time-zone": {
      label: "<time-zone>",
    },
    "-tz": {
      label: "<time-zone>",
    },
  });
});
