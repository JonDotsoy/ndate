import {
  dateParse,
  toDateStyle,
  toHourCycle,
  toTimeStyle,
} from "./lib/common.ts";
import { renderDateTemplate } from "./lib/renderDateTemplate.ts";
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

  const textUsage = `Usage: ndate`;

  const lines: string[] = [];
  let currentLine: string | undefined;
  for (const item of items) {
    if (!currentLine) {
      currentLine = lines.length
        ? `${" ".repeat(textUsage.length)}`
        : `${textUsage}`;
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
    optionsLabels,
  } = makeFlags(args);

  if (showHelp) {
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
