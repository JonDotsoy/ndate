import {
  dateParse,
  DateStyle,
  dateStyles,
  hourCycles,
  TimeStyle,
  timeStyles,
  toDateStyleString,
  toHourCycleString,
  toTimeStyleString,
} from "./lib/common.ts";
import { flag, flags } from "npm:@jondotsoy/flags@3.2.1";

interface Rule {
  names: string[];
  label?: string;
  description: string;
}

const rule = (
  names: string[],
  description: string,
  label?: string,
): Rule => ({ names, label, description });

export function makeFlags(args: string[]) {
  const rules: Rule[] = [
    rule(["-"], "Read the date from stdin."),
    rule(
      ["--date", "-d"],
      "Date to format: now or any value accepted by new Date().",
      "<date>",
    ),
    rule(
      ["--date-style"],
      "Date style of the locale format. Default: full.",
      `<${dateStyles.join("|")}>`,
    ),
    rule(
      ["--time-style"],
      "Time style of the locale format. Default: full.",
      `<${timeStyles.join("|")}>`,
    ),
    rule(
      ["--hour-cycles"],
      "Hour cycle of the locale format, e.g. h23 for 24 hours.",
      `<${hourCycles.join("|")}>`,
    ),
    rule(
      ["--time-zone", "-tz"],
      "IANA time zone, e.g. America/Santiago. Default: $TZ.",
      "<time-zone>",
    ),
    rule(
      ["--local", "-l"],
      "Locale, e.g. es-CL. Default: $LANG.",
      "<locale>",
    ),
    rule(
      ["--template"],
      "Render the date with a template (see template properties). Also +<template>.",
      "<template>",
    ),
    rule(
      ["--json", "-j"],
      "Print as ISO 8601, e.g. 2023-08-08T03:38:58.570Z.",
    ),
    rule(["--sheet"], "Print as a spreadsheet formula =DATE()+TIME()."),
    rule(
      ["--utc"],
      "Print as RFC 7231, e.g. Tue, 08 Aug 2023 03:38:58 GMT.",
    ),
    rule(["--epoch"], "Print as unix time in seconds."),
    rule(["--epoch-ms"], "Print as unix time in milliseconds."),
    rule(
      ["--instant"],
      "Print as Temporal.Instant, e.g. 2023-08-08T03:38:58.57Z.",
    ),
    rule(["--zoned-date-time"], "Print as Temporal.ZonedDateTime."),
    rule(
      ["--plain-date-time"],
      "Print as Temporal.PlainDateTime, e.g. 2023-08-07T23:38:58.57.",
    ),
    rule(
      ["--plain-date"],
      "Print as Temporal.PlainDate, e.g. 2023-08-07.",
    ),
    rule(
      ["--plain-time"],
      "Print as Temporal.PlainTime, e.g. 23:38:58.57.",
    ),
    rule(
      ["--plain-year-month"],
      "Print as Temporal.PlainYearMonth, e.g. 2023-08.",
    ),
    rule(
      ["--plain-month-day"],
      "Print as Temporal.PlainMonthDay, e.g. 08-07.",
    ),
    rule(["--help", "-h"], "Show this help."),
    rule(["--version", "-v"], "Show the ndate version."),
    rule(["--zero", "-z"], "Do not print the final new line."),
    rule(["--verbose"], "Show the stack trace of errors."),
  ];

  const descriptionOf = (name: string) =>
    rules.find((r) => r.names[0] === name)!.description;
  const namesOf = (name: string) =>
    rules.find((r) => r.names[0] === name)!.names;
  const bool = (name: string) =>
    flag(...namesOf(name)).boolean().describe(descriptionOf(name));
  const str = (name: string) =>
    flag(...namesOf(name)).string().describe(descriptionOf(name));

  const whenGiven = <T>(fn: (value: string) => T) => (value: string | null) =>
    value === null ? null : fn(value);

  // Like `date +FORMAT`: an argument starting with "+" is a template, unless
  // it is the value of a flag that takes one (e.g. `-d +1`).
  const valueFlags = new Set(
    rules.filter((r) => r.label).flatMap((r) => r.names),
  );
  let positionalTemplate: string | undefined;
  const flagArgs = args.filter((arg, i) => {
    if (!arg.startsWith("+") || valueFlags.has(args[i - 1])) return true;
    positionalTemplate = arg.slice(1);
    return false;
  });

  const parsed = flags({
    stdinReadable: bool("-"),
    date: str("--date").transform(whenGiven(dateParse)),
    dateStyle: str("--date-style").transform(whenGiven(toDateStyleString)),
    timeStyle: str("--time-style").transform(whenGiven(toTimeStyleString)),
    hourCycle: str("--hour-cycles").transform(whenGiven(toHourCycleString)),
    timeZone: str("--time-zone"),
    local: str("--local"),
    template: str("--template"),
    outputAsJSON: bool("--json"),
    outputAsSheet: bool("--sheet"),
    outputAsUTC: bool("--utc"),
    outputAsEpoch: bool("--epoch"),
    outputAsEpochMS: bool("--epoch-ms"),
    outputAsInstant: bool("--instant"),
    outputAsZonedDateTime: bool("--zoned-date-time"),
    outputAsPlainDateTime: bool("--plain-date-time"),
    outputAsPlainDate: bool("--plain-date"),
    outputAsPlainTime: bool("--plain-time"),
    outputAsPlainYearMonth: bool("--plain-year-month"),
    outputAsPlainMonthDay: bool("--plain-month-day"),
    showHelp: bool("--help"),
    showVersion: bool("--version"),
    zero: bool("--zero"),
    verbose: bool("--verbose"),
  }).parse(flagArgs);

  const {
    zero,
    hourCycle,
    dateStyle,
    timeStyle,
    date,
    local,
    timeZone,
    template,
    ...options
  } = parsed;

  const transformOptions: Record<string, null> = {};
  const optionsLabels: Record<string, { label?: string }> = {};
  for (const { names, label } of rules) {
    for (const name of names) {
      transformOptions[name] = null;
      optionsLabels[name] = { label };
    }
  }

  return {
    ...options,
    hourCycle: hourCycle ?? "none",
    dateStyle: dateStyle ?? "full",
    timeStyle: timeStyle ?? "full",
    insertFinalNewLine: !zero,
    date: date ?? new Date(),
    local: local ?? undefined,
    timeZone: timeZone ?? undefined,
    template: template ?? positionalTemplate,
    transformOptions,
    optionsLabels,
    optionsHelp: rules.map((r) => ({ ...r, names: [...r.names] })),
  };
}
