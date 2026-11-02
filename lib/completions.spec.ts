import { assert, assertEquals, assertStringIncludes } from "jsr:@std/assert@1";
import { completionShells, renderCompletion } from "./completions.ts";
import { localPartTypes, templateKeywords } from "./renderDateTemplate.ts";
import { makeFlags } from "../makeFlags.ts";

// The scripts in completions/ are the output of `ndate completion <shell>`.
// If this fails, regenerate them:
//   for s in bash zsh fish; do deno run --allow-env=TZ,LANG ndate.ts completion $s > completions/ndate.$s; done
Deno.test("completions: files in completions/ are up to date", async () => {
  for (const shell of completionShells) {
    const file = await Deno.readTextFile(
      new URL(`../completions/ndate.${shell}`, import.meta.url),
    );
    assertEquals(file, renderCompletion(shell), `completions/ndate.${shell}`);
  }
});

Deno.test("completions: every flag is offered by every shell", () => {
  const names = makeFlags([]).optionsHelp.flatMap(({ names }) => names)
    .filter((name) => name !== "-");
  for (const shell of completionShells) {
    const script = renderCompletion(shell);
    for (const name of names) {
      // fish writes `--long` as `-l long` and `-s` as `-s s`
      const token = shell === "fish"
        ? name.startsWith("--")
          ? `-l ${name.slice(2)}`
          : name.length === 2
          ? `-s ${name.slice(1)}`
          : `-o ${name.slice(1)}`
        : name;
      assert(script.includes(token), `${shell} is missing ${name}`);
    }
  }
});

Deno.test("completions: every template property is offered by every shell", () => {
  const properties = [
    ...templateKeywords,
    ...localPartTypes.map((part) => `local_${part}`),
  ];
  assert(properties.length > 40);
  for (const shell of ["zsh", "fish"] as const) {
    const script = renderCompletion(shell);
    for (const property of properties) {
      assertStringIncludes(
        script,
        shell === "zsh" ? `'${property}:` : `'{{${property}}}\\t`,
      );
    }
  }
});

Deno.test("completions: bash script is valid bash", async () => {
  const { code, stderr } = await new Deno.Command("bash", {
    args: ["-n", "-c", renderCompletion("bash")],
    stderr: "piped",
  }).output();
  assertEquals(code, 0, new TextDecoder().decode(stderr));
});
