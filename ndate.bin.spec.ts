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

Deno.test("bin: show help", async () => {
  const { code, stdout } = await ndate(["-h"]);
  assertEquals(code, 0);
  assert(stdout.startsWith("Usage: ndate "));
  assertStringIncludes(stdout, "[--json]");
  assertStringIncludes(stdout, "[--template <template>]");
  assertStringIncludes(stdout, "Template properties: {{epoch}}");
  assertStringIncludes(stdout, "{{utc_full_year}}");
  assertStringIncludes(stdout, "{{local_weekday}}");
  assertStringIncludes(stdout, "Template transforms: json");
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
