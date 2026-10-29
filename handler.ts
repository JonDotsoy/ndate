import {
  dateParse,
  toDateStyle,
  toHourCycle,
  toTimeStyle,
} from "./lib/common.ts";
import {
  localPartTypes,
  renderDateTemplate,
  templateKeywordDescriptions,
  templateKeywords,
  templateTransformDescriptions,
} from "./lib/renderDateTemplate.ts";
import {
  toInstantString,
  toPlainDateString,
  toPlainDateTimeString,
  toPlainMonthDayString,
  toPlainTimeString,
  toPlainYearMonthString,
  toZonedDateTimeString,
} from "./lib/temporal.ts";
import { makeFlags } from "./makeFlags.ts";

const renderSheet = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const dayOfMonth = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  return `=DATE(${year};${month};${dayOfMonth})+TIME(${hours};${minutes};${seconds})`;
};

const makeHelpDialog = function* (
  transformOptions: Record<
    string,
    unknown
  >,
  optionsLabels: Record<
    string,
    {
      label?: string | undefined;
    } | undefined
  >,
) {
  const items = Object.keys(transformOptions)
    .map((item) => {
      const label = optionsLabels[item]?.label;
      return label ? `[${item} ${label}]` : `[${item}]`;
    });

  yield* wrapLines(`Usage: ndate`, items);
  yield new TextEncoder().encode(
    "\nRun `ndate --help` to see every flag and template property.\n",
  );
};

const makeLongHelpDialog = function* (
  optionsHelp: { names: string[]; label?: string; description?: string }[],
) {
  const section = function* (title: string, rows: [string, string][]) {
    const maxWidth = 26;
    const width = Math.min(
      maxWidth,
      Math.max(...rows.map(([name]) => name.length)),
    ) + 2;
    yield new TextEncoder().encode(`\n${title}\n`);
    for (const [name, description] of rows) {
      const line = name.length > maxWidth
        ? `  ${name}\n  ${" ".repeat(width)}${description}`
        : `  ${name.padEnd(width)}${description}`;
      yield new TextEncoder().encode(`${line.trimEnd()}\n`);
    }
  };

  yield new TextEncoder().encode(
    "ndate - Date format to console.\n\nUsage: ndate [options]\n",
  );

  yield* section(
    "Options:",
    optionsHelp.map(({ names, label, description = "" }) => [
      [...names].sort((a, b) => a.length - b.length).join(", ") +
      (label ? ` ${label}` : ""),
      description,
    ]),
  );

  yield* section(
    "Template properties (--template '{{<property>}}'):",
    [
      ...templateKeywords.map((keyword): [string, string] => [
        `{{${keyword}}}`,
        templateKeywordDescriptions[keyword] ?? "",
      ]),
      ...localPartTypes.map((part): [string, string] => [
        `{{local_${part}}}`,
        `"${part}" part of Intl.DateTimeFormat.`,
      ]),
    ],
  );

  yield* section(
    "Template transforms (--template '{{<property>:<transform>}}'):",
    templateTransformDescriptions,
  );

  yield* section("Examples:", [
    ["ndate -d now", ""],
    ["ndate -d 2023-08-08T03:38:58Z -tz America/Santiago -l es-CL", ""],
    ["ndate --template '{{YYYY}}-{{MM}}-{{DD}} {{hh}}:{{mm}}'", ""],
    ["ndate --template '{{month:padStart:2:0}}'", ""],
    ["echo 2023-08-08T03:38:58Z | ndate - --epoch", ""],
  ]);
};

const wrapLines = function* (title: string, items: string[]) {
  const lines: string[] = [];
  let currentLine: string | undefined;
  for (const item of items) {
    if (!currentLine) {
      currentLine = lines.length ? `${" ".repeat(title.length)}` : `${title}`;
    }

    currentLine = `${currentLine} ${item}`;
    if (currentLine.length > 80) {
      lines.push(currentLine);
      currentLine = undefined;
    }
  }

  if (currentLine) lines.push(currentLine);

  for (const line of lines) {
    yield new TextEncoder().encode(line);
    yield new TextEncoder().encode("\n");
  }
};

export const handler = async function* (
  args: string[],
): AsyncGenerator<Uint8Array> {
  let {
    hourCycle,
    dateStyle,
    timeStyle,
    insertFinalNewLine,
    local,
    timeZone,
    date,
    outputAsEpoch,
    outputAsEpochMS,
    outputAsJSON,
    outputAsUTC,
    stdinReadable,
    showHelp,
    template,
    transformOptions,
    outputAsSheet,
    outputAsInstant,
    outputAsZonedDateTime,
    outputAsPlainDateTime,
    outputAsPlainDate,
    outputAsPlainTime,
    outputAsPlainYearMonth,
    outputAsPlainMonthDay,
    optionsLabels,
    optionsHelp,
  } = makeFlags(args);

  if (showHelp) {
    yield* makeLongHelpDialog(optionsHelp);
    return;
  }

  if (!args.length) {
    yield* makeHelpDialog(transformOptions, optionsLabels);
    return;
  }

  if (timeZone) Deno.env.set(`TZ`, timeZone);
  if (local) Deno.env.set(`LANG`, local);

  if (stdinReadable) {
    const buff = new Uint8Array(256);
    await Deno.stdin.read(buff);
    const text = new TextDecoder().decode(
      buff.subarray(0, buff.findIndex((p) => p === 0)),
    ).trim();
    date = dateParse(text);
  }

  const toOutput = () => {
    if (template) {
      return renderDateTemplate(template, date, local, {
        dateStyle: toDateStyle(dateStyle),
        timeStyle: toTimeStyle(timeStyle),
        timeZone,
        hourCycle: toHourCycle(hourCycle),
      });
    }
    if (outputAsEpochMS) return Math.floor(date.getTime()).toString();
    if (outputAsEpoch) return Math.floor(date.getTime() / 1000).toString();
    if (outputAsJSON) return date.toJSON();
    if (outputAsUTC) return date.toUTCString();
    if (outputAsSheet) return renderSheet(date);
    if (outputAsInstant) return toInstantString(date);
    if (outputAsZonedDateTime) return toZonedDateTimeString(date, timeZone);
    if (outputAsPlainDateTime) return toPlainDateTimeString(date, timeZone);
    if (outputAsPlainDate) return toPlainDateString(date, timeZone);
    if (outputAsPlainTime) return toPlainTimeString(date, timeZone);
    if (outputAsPlainYearMonth) return toPlainYearMonthString(date, timeZone);
    if (outputAsPlainMonthDay) return toPlainMonthDayString(date, timeZone);
    return date.toLocaleString(local, {
      dateStyle: toDateStyle(dateStyle),
      timeStyle: toTimeStyle(timeStyle),
      timeZone,
      hourCycle: toHourCycle(hourCycle),
    });
  };

  yield new TextEncoder().encode(toOutput());

  if (insertFinalNewLine) yield new TextEncoder().encode(`\n`);
};
