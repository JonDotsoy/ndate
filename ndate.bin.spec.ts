import {
  assert,
  assertEquals,
  assertNotEquals,
  assertStringIncludes,
} from "jsr:@std/assert@1";

// End-to-end tests for the ndate executable.
//
// By default the CLI entry point (ndate.ts) is spawned with `deno run`. Set
// NDATE_BIN to the path of a binary built with `deno compile` to run the same
// cases against the compiled executable:
//
//   deno compile --allow-env=TZ,LANG --output ./bin/ndate ndate.ts
//   NDATE_BIN=./bin/ndate deno test --allow-run --allow-env --allow-read ndate.bin.spec.ts

const ndateBin = Deno.env.get("NDATE_BIN");
const entryPoint = new URL("./ndate.ts", import.meta.url).pathname;

const ndate = async (args: string[], stdin?: string) => {
  const command = ndateBin
    ? new Deno.Command(ndateBin, {
      args,
      stdin: stdin === undefined ? "null" : "piped",
      stdout: "piped",
      stderr: "piped",
    })
    : new Deno.Command(Deno.execPath(), {
      args: ["run", "--quiet", "--allow-env=TZ,LANG", entryPoint, ...args],
      stdin: stdin === undefined ? "null" : "piped",
      stdout: "piped",
      stderr: "piped",
    });

  const child = command.spawn();
  if (stdin !== undefined) {
    const writer = child.stdin.getWriter();
    await writer.write(new TextEncoder().encode(stdin));
    await writer.close();
  }
  const { code, stdout, stderr } = await child.output();
  return {
    code,
    stdout: new TextDecoder().decode(stdout),
    stderr: new TextDecoder().decode(stderr),
  };
};

const fixedDate = [
  "-d",
  "2023-08-08T03:38:58.570Z",
  "-l",
  "es-cl",
  "-tz",
  "America/Santiago",
];

Deno.test("bin: show short help without arguments", async () => {
  const { code, stdout } = await ndate([]);
  assertEquals(code, 0);
  assert(stdout.startsWith("Usage: ndate "));
  assertStringIncludes(stdout, "[--template <template>]");
  assertStringIncludes(stdout, "Run `ndate --help`");
});

Deno.test("bin: show long help", async (t) => {
  for (const flag of ["-h", "--help"]) {
    await t.step(flag, async () => {
      const { code, stdout } = await ndate([flag]);
      assertEquals(code, 0);
      assertStringIncludes(stdout, "Usage: ndate [options]");
      assertStringIncludes(stdout, "  -j, --json ");
      assertStringIncludes(stdout, "  --plain-date ");
      assertStringIncludes(stdout, "\n  {{epoch}} ");
      assertStringIncludes(stdout, "\n  {{utc_full_year}} ");
      assertStringIncludes(stdout, "\n  {{local_weekday}} ");
      assertStringIncludes(stdout, "\n  padStart:<length>:<fill> ");
    });
  }
});

Deno.test("bin: show version", async (t) => {
  const expected = (await Deno.readTextFile(
    new URL("./version", import.meta.url),
  )).trim();
  for (const flag of ["-v", "--version"]) {
    await t.step(flag, async () => {
      const { code, stdout } = await ndate([flag]);
      assertEquals(code, 0);
      assertEquals(stdout, `${expected}\n`);
    });
  }
});

Deno.test("bin: -d now uses the current date", async () => {
  const before = Date.now();
  const { code, stdout } = await ndate(["-z", "-d", "now", "--epoch-ms"]);
  assertEquals(code, 0);
  assert(Number(stdout) >= before && Number(stdout) <= Date.now());
});

Deno.test("bin: inserts a final new line by default", async () => {
  const { code, stdout } = await ndate([...fixedDate, "--json"]);
  assertEquals(code, 0);
  assertEquals(stdout, "2023-08-08T03:38:58.570Z\n");
});

Deno.test("bin: --zero omits the final new line", async () => {
  const { code, stdout } = await ndate(["-z", ...fixedDate, "--json"]);
  assertEquals(code, 0);
  assertEquals(stdout, "2023-08-08T03:38:58.570Z");
});

Deno.test("bin: render date with locale and time zone", async () => {
  const { code, stdout } = await ndate(["-z", ...fixedDate]);
  assertEquals(code, 0);
  assertStringIncludes(stdout, "lunes, 7 de agosto de 2023");
});

Deno.test("bin: output formats", async (t) => {
  const cases: [string, string][] = [
    ["--utc", "Tue, 08 Aug 2023 03:38:58 GMT"],
    ["--epoch", "1691465938"],
    ["--epoch-ms", "1691465938570"],
    ["--sheet", "=DATE(2023;8;7)+TIME(23;38;58)"],
    ["--instant", "2023-08-08T03:38:58.57Z"],
    [
      "--zoned-date-time",
      "2023-08-07T23:38:58.57-04:00[America/Santiago]",
    ],
    ["--plain-date-time", "2023-08-07T23:38:58.57"],
    ["--plain-date", "2023-08-07"],
    ["--plain-time", "23:38:58.57"],
    ["--plain-year-month", "2023-08"],
    ["--plain-month-day", "08-07"],
  ];
  for (const [flag, expected] of cases) {
    await t.step(flag, async () => {
      const { code, stdout } = await ndate(["-z", ...fixedDate, flag]);
      assertEquals(code, 0);
      assertEquals(stdout, expected);
    });
  }
});

Deno.test("bin: format template", async () => {
  const { code, stdout } = await ndate([
    "-z",
    ...fixedDate,
    "--template",
    "{{YYYY}}-{{MM}}-{{DD}} {{epoch}} {{month:padStart:4:0}}",
  ]);
  assertEquals(code, 0);
  assertEquals(stdout, "2023-08-07 1691465938 0008");
});

Deno.test("bin: zoned date time with a half hour offset", async () => {
  const { code, stdout } = await ndate([
    "-z",
    "-d",
    "2023-01-05T07:00:00Z",
    "-tz",
    "Asia/Kolkata",
    "--zoned-date-time",
  ]);
  assertEquals(code, 0);
  assertEquals(stdout, "2023-01-05T12:30:00+05:30[Asia/Kolkata]");
});

Deno.test("bin: temporal properties in template", async () => {
  const { code, stdout } = await ndate([
    "-z",
    ...fixedDate,
    "--template",
    "{{plain_date}} {{plain_time}} {{zoned_date_time}}",
  ]);
  assertEquals(code, 0);
  assertEquals(
    stdout,
    "2023-08-07 23:38:58.57 2023-08-07T23:38:58.57-04:00[America/Santiago]",
  );
});

Deno.test("bin: read date from stdin", async () => {
  const { code, stdout } = await ndate(
    ["-", "-z", "--json"],
    "2023-08-08T03:38:58.570Z\n",
  );
  assertEquals(code, 0);
  assertEquals(stdout, "2023-08-08T03:38:58.570Z");
});

Deno.test("bin: fails with an invalid date", async () => {
  const { code, stdout, stderr } = await ndate(["-d", "not a date"]);
  assertNotEquals(code, 0);
  assertEquals(stdout, "");
  assertStringIncludes(stderr, "no valid");
});

Deno.test("bin: unexpected argument prints only the message", async () => {
  const { code, stdout, stderr } = await ndate(["--no-valid-flag"]);
  assertEquals(code, 1);
  assertEquals(stdout, "");
  assertEquals(stderr, "Unexpected argument: --no-valid-flag\n");
});

Deno.test("bin: --verbose prints the stack trace of the error", async () => {
  const { code, stderr } = await ndate(["--no-valid-flag", "--verbose"]);
  assertEquals(code, 1);
  assertStringIncludes(stderr, "Unexpected argument: --no-valid-flag");
  assertStringIncludes(stderr, "    at ");
});
