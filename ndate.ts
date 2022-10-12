const dateStyles = ["full", "long", "medium", "short"] as const;
const timeStyles = ["full", "long", "medium", "short"] as const;
type DateStyle = (typeof dateStyles)[number];
type TimeStyle = (typeof dateStyles)[number];
const toDateStyle = (v: unknown): DateStyle | undefined => typeof v === "string" ? dateStyles.find(dateStyle => dateStyle.startsWith(v)) : undefined;
const toTimeStyle = (v: unknown): DateStyle | undefined => typeof v === "string" ? timeStyles.find(timeStyle => timeStyle.startsWith(v)) : undefined;
const dateParse = (val: string): Date => {
    const d = new Date(val);
    if (Number.isNaN(Number(d))) {
        throw new Error(`the ${Deno.inspect(val)} time stamp no valid`);
    }
    return d;
}

let dateStyle: DateStyle = 'full';
let timeStyle: TimeStyle = 'full';
let newLine = true;
let local: string | undefined;
let date = new Date();
let json = false;
let stdinRedeable = false;
let showHelp = false;

const transformOptions: Record<string, (next: () => string | undefined) => void> = {
    '-': () => { stdinRedeable = true },
    '--zero': () => { newLine = false; },
    '--date-style': (next) => { dateStyle = toDateStyle(next()) ?? 'full' },
    '--time-style': (next) => { timeStyle = toTimeStyle(next()) ?? 'full' },
    '--local': (next) => { local = next() },
    '--json': () => { json = true },
    '--date': (next) => {
        const v = next();
        if (v) {
            date = dateParse(v);
        }
    },
    '--help': () => { showHelp = true },
    get "-j"() { return this['--json'] },
    get "-d"() { return this["--date"] },
    get "-l"() { return this["--local"] },
    get "-z"() { return this["--zero"] },
    get "-h"() { return this["--help"] },
};

const optionsLabels: Record<string, undefined | { label?: string }> = {
    '--date-style': { label: `<${dateStyles.join('|')}>` },
    '--time-style': { label: `<${timeStyles.join('|')}>` },
    '--local': { label: `<locale>` },
    '--date': { label: `<date>` },
    get "-j"() { return this['--json'] },
    get "-d"() { return this["--date"] },
    get "-l"() { return this["--local"] },
    get "-z"() { return this["--zero"] },
    get "-h"() { return this["--help"] },
};

for (
    let argsCursor = Deno.args[Symbol.iterator](),
    { value: arg, done } = argsCursor.next();
    !done;
    { value: arg, done } = argsCursor.next()
) {
    const next = (): string | undefined => argsCursor.next().value;
    if (typeof arg === "string" && arg in transformOptions) { transformOptions[arg](next); }
}

const run = async () => {
    if (showHelp) {
        const items = Object.keys(transformOptions)
            .map(item => {
                const label = optionsLabels[item]?.label;
                return label ? `[${item} ${label}]` : `[${item}]`;
            });

        const textUsage = `Usage: ndate`;

        const lines: string[] = [];
        let currentLine: string | undefined;
        for (const item of items) {
            if (!currentLine) {
                currentLine = lines.length ? `${' '.repeat(textUsage.length)}` : `${textUsage}`;
            }

            currentLine = `${currentLine} ${item}`;
            if (currentLine.length > 80) {
                lines.push(currentLine);
                currentLine = undefined;
            }
        }

        if (currentLine) lines.push(currentLine);

        for (const line of lines) {
            console.log(line);
        }

        return;
    }

    if (stdinRedeable) {
        const buff = new Uint8Array(256);
        await Deno.stdin.read(buff);
        const text = new TextDecoder().decode(buff.subarray(0, buff.findIndex(p => p === 0))).trim();
        date = dateParse(text);
    }

    const dateStr = json ? date.toJSON() : date.toLocaleString(local, { dateStyle, timeStyle });

    Deno.stdout.write(new TextEncoder().encode(dateStr))

    if (newLine) Deno.stdout.write(
        new TextEncoder().encode(`\n`)
    )
}

await run();
