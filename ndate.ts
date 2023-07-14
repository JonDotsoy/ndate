#!/usr/bin/env deno run

function renderDateTemplate(template: string, date: Date, locales?: string, options?: Intl.DateTimeFormatOptions) {
    const localeString = date.toLocaleString(locales, options)
    const parts = new Intl.DateTimeFormat(locales, options).formatToParts(date).map(({ type, value }) => [`local_${type}`, value] as const)

    const epochMS =  Math.floor(date.getTime());
    const epoch =  Math.floor(date.getTime() / 1000);

    const isoString = date.toISOString();
    const utcString = date.toUTCString();

    const values: Record<string, any> = Object.fromEntries([
        [`epoch`, epoch],
        [`epoch_ms`, epochMS],
        [`json`, isoString],
        [`iso`, isoString],
        [`iso8601`, isoString],
        [`utc`, utcString],
        [`rfc7231`, utcString],
        [`local`, localeString],
        ["time", date.getTime()],

        ["YYYY", date.getFullYear().toString().padStart(4,`0`)],
        ["MM", (date.getMonth() + 1).toString().padStart(2,`0`)],
        ["DD", date.getDate().toString().padStart(2,`0`)],

        ["HH", date.getHours().toString().padStart(2,`0`)],
        ["MM", date.getMinutes().toString().padStart(2,`0`)],
        ["SS", date.getSeconds().toString().padStart(2,`0`)],
        ["MS", date.getMilliseconds().toString().padStart(4,`0`)],


        ["full_year", date.getFullYear()],
        ["month", date.getMonth() + 1],
        ["date", date.getDate()],
        ["day", date.getDay()],
        ["hours", date.getHours()],
        ["minutes", date.getMinutes()],
        ["seconds", date.getSeconds()],
        ["milliseconds", date.getMilliseconds()],
        ["timezone_offset", date.getTimezoneOffset()],

        ["utc_full_year", date.getUTCFullYear()],
        ["utc_month", date.getUTCMonth() + 1],
        ["utc_date", date.getUTCDate()],
        ["utc_day", date.getUTCDay()],
        ["utc_hours", date.getUTCHours()],
        ["utc_minutes", date.getUTCMinutes()],
        ["utc_seconds", date.getUTCSeconds()],
        ["utc_milliseconds", date.getUTCMilliseconds()],
        ...parts,
    ])

    const transforms:Record<string, (value: string, options?: string)=>string> = {
        json: value => JSON.stringify(value),
        sub: (value, options) => {
            const [start = 0,end] = options?.split(':') ?? []
            return value.toString().substring(Number(start), Number(end))
        },
        padStart: (values,options) => {
            const [maxLength = 0, fillString = ' '] = options?.split(':') ?? []
            return values.toString().padStart(Number(maxLength), fillString)
        },
        padEnd: (values,options) => {
            const [maxLength = 0, fillString = ' '] = options?.split(':') ?? []
            return values.toString().padEnd(Number(maxLength), fillString)
        },
        default: value => value,
    }

    const regexp = /\{\{(?<keyword>\w+)(\:(?<transform>\w+)(\:(?<transform_options>[\w\:\-]+))?)?\}\}/g
    const stringTemplate:  string[] = []
    const substitution:  string[] = []
    let p: RegExpExecArray | null=null
    let lastPointer = 0
    do {
        p = regexp.exec(template)
        if (p) {
            stringTemplate.push(template.substring(lastPointer, p.index))
            lastPointer = p.index + p.at(0)!.length
            const transform = transforms[p.groups?.transform ?? 'default'] ?? transforms.default
            substitution.push(transform(values[p.groups!.keyword] ?? '', p.groups!.transform_options))
        }
    } while (p !== null);

    stringTemplate.push(template.substring(lastPointer))

    return String.raw({ raw: stringTemplate }, ...substitution)
}


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
let insertFinalNewLine = true;
let local: string | undefined;
let timeZone: string | undefined;
let date = new Date();
let outputAsEpoch = false;
let outputAsEpochMS = false;
let outputAsJSON = false;
let outputAsUTC = false;
let stdinReadable = false;
let showHelp = false;
let template: string | undefined;
let crontab: string | undefined;

const parseCrontab = (str: string) => {
    const res = /^((?<predefined>@(annually|yearly|monthly|weekly|daily|hourly|reboot))|(?<every>@every ((?<every_value>\d+)(?<every_value_sign>ns|us|µs|ms|s|m|h))+)|(?<cron>(?<cron_minute>((\d+,)+\d+|(\d+(\/|-)\d+)|\d+|\*)) (?<cron_hour>((\d+,)+\d+|(\d+(\/|-)\d+)|\d+|\*)) (?<cron_day_month>((\d+,)+\d+|(\d+(\/|-)\d+)|\d+|\*)) (?<cron_month>((\d+,)+\d+|(\d+(\/|-)\d+)|\d+|\*)) (?<cron_day_week>((\d+,)+\d+|(\d+(\/|-)\d+)|\d+|\*))))$/.exec(str)

    if (!res) return null

    if (res.groups?.predefined)
        return {
            predefined: res.groups.predefined
        }
}

const transformOptions: Record<string, (nextArgument: () => string | undefined) => void> = {
    '-': () => { stdinReadable = true },
    '--zero': () => { insertFinalNewLine = false; },
    '--date-style': (nextArgument) => { dateStyle = toDateStyle(nextArgument()) ?? 'full' },
    '--time-style': (nextArgument) => { timeStyle = toTimeStyle(nextArgument()) ?? 'full' },
    '--time-zone': (nextArgument)=>{ timeZone = nextArgument() },
    '--local': (nextArgument) => { local = nextArgument() },
    '--template': (nextArgument) => { template = nextArgument() },
    '--json': () => { outputAsJSON = true },
    '--utc': () => { outputAsUTC = true },
    '--epoch': () => { outputAsEpoch = true },
    '--epoch-ms': () => { outputAsEpochMS = true },
    '--date': (nextArgument) => {
        const v = nextArgument();
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
    '--template': { label: `<template>` },
    '--time-zone': { label: `<time-zone>` },
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

    if (timeZone) Deno.env.set(`TZ`, timeZone)
    if (local) Deno.env.set(`LANG`, local)

    if (stdinReadable) {
        const buff = new Uint8Array(256);
        await Deno.stdin.read(buff);
        const text = new TextDecoder().decode(buff.subarray(0, buff.findIndex(p => p === 0))).trim();
        date = dateParse(text);
    }

    const toOutput = () => {
        if (template) return renderDateTemplate(template, date, local, { dateStyle, timeStyle, timeZone })
        if (outputAsEpochMS) return Math.floor(date.getTime()).toString();
        if (outputAsEpoch) return Math.floor(date.getTime() / 1000).toString();
        if (outputAsJSON) return date.toJSON()
        if (outputAsUTC) return date.toUTCString()
        return date.toLocaleString(local, { dateStyle, timeStyle, timeZone });
    }

    Deno.stdout.write(new TextEncoder().encode(toOutput()))

    if (insertFinalNewLine) Deno.stdout.write(
        new TextEncoder().encode(`\n`)
    )
}

await run();
