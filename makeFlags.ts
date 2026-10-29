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
import {
  describe,
  flag,
  flags,
  Handler,
  isBooleanAt,
  isStringAt,
  Rule,
  Test,
} from "npm:@jondotsoy/flags@2.0.2";

const labelSymbol = Symbol("label");
const descriptionSymbol = Symbol("description");

const setLabel = (obj: object, label: string) =>
  Reflect.set(obj, labelSymbol, label);
const getLabel = (obj: object) => Reflect.get(obj, labelSymbol);
const getDescription = (obj: object): string | undefined =>
  Reflect.get(obj, descriptionSymbol);

const describeLabel = (test: Test<any>, label: string): Test<any> => {
  setLabel(test, label);
  return test;
};

const describeHelp = (test: Test<any>, description: string): Test<any> => {
  Reflect.set(test, descriptionSymbol, description);
  return test;
};

interface Options {
  hourCycle: (typeof hourCycles)[number];
  dateStyle: DateStyle;
  timeStyle: TimeStyle;
  insertFinalNewLine: boolean;
  local: string;
  timeZone: string;
  date: Date;
  outputAsEpoch: boolean;
  outputAsEpochMS: boolean;
  outputAsJSON: boolean;
  outputAsUTC: boolean;
  outputAsSheet: boolean;
  outputAsInstant: boolean;
  outputAsZonedDateTime: boolean;
  outputAsPlainDateTime: boolean;
  outputAsPlainDate: boolean;
  outputAsPlainTime: boolean;
  outputAsPlainYearMonth: boolean;
  outputAsPlainMonthDay: boolean;
  stdinReadable: boolean;
  showHelp: boolean;
  template: string;
  crontab: string;
}

const isArgumentTransformAt =
  (field: string, transform: (v: string) => unknown): Handler<any> => (o) => {
    const value = o.argValue ?? o.args[o.index + 1];
    if (value) {
      o.nextIndex += 1;
      o.flags[field] = transform(value);
    }
  };

export function makeFlags(args: string[]) {
  const rules: Rule<Options>[] = [
    [
      describeHelp(flag("-"), "Read the date from stdin."),
      isBooleanAt("stdinReadable"),
    ],
    [
      describeHelp(
        describeLabel(flag("--date", "-d"), "<date>"),
        "Date to format: now or any value accepted by new Date().",
      ),
      isArgumentTransformAt("date", dateParse),
    ],
    [
      describeHelp(
        describeLabel(flag("--date-style"), `<${dateStyles.join("|")}>`),
        "Date style of the locale format. Default: full.",
      ),
      isArgumentTransformAt("dateStyle", toDateStyleString),
    ],
    [
      describeHelp(
        describeLabel(flag("--time-style"), `<${timeStyles.join("|")}>`),
        "Time style of the locale format. Default: full.",
      ),
      isArgumentTransformAt("timeStyle", toTimeStyleString),
    ],
    [
      describeHelp(
        describeLabel(flag("--hour-cycles"), `<${hourCycles.join("|")}>`),
        "Hour cycle of the locale format, e.g. h23 for 24 hours.",
      ),
      isArgumentTransformAt("hourCycle", toHourCycleString),
    ],
    [
      describeHelp(
        describeLabel(flag("--time-zone", "-tz"), "<time-zone>"),
        "IANA time zone, e.g. America/Santiago. Default: $TZ.",
      ),
      isStringAt("timeZone"),
    ],
    [
      describeHelp(
        describeLabel(flag("--local", "-l"), "<locale>"),
        "Locale, e.g. es-CL. Default: $LANG.",
      ),
      isStringAt("local"),
    ],
    [
      describeHelp(
        describeLabel(flag("--template"), "<template>"),
        "Render the date with a template (see template properties).",
      ),
      isStringAt("template"),
    ],
    [
      describeHelp(
        flag("--json", "-j"),
        "Print as ISO 8601, e.g. 2023-08-08T03:38:58.570Z.",
      ),
      isBooleanAt("outputAsJSON"),
    ],
    [
      describeHelp(
        flag("--sheet"),
        "Print as a spreadsheet formula =DATE()+TIME().",
      ),
      isBooleanAt("outputAsSheet"),
    ],
    [
      describeHelp(
        flag("--utc"),
        "Print as RFC 7231, e.g. Tue, 08 Aug 2023 03:38:58 GMT.",
      ),
      isBooleanAt("outputAsUTC"),
    ],
    [
      describeHelp(flag("--epoch"), "Print as unix time in seconds."),
      isBooleanAt("outputAsEpoch"),
    ],
    [
      describeHelp(flag("--epoch-ms"), "Print as unix time in milliseconds."),
      isBooleanAt("outputAsEpochMS"),
    ],
    [
      describeHelp(
        flag("--instant"),
        "Print as Temporal.Instant, e.g. 2023-08-08T03:38:58.57Z.",
      ),
      isBooleanAt("outputAsInstant"),
    ],
    [
      describeHelp(
        flag("--zoned-date-time"),
        "Print as Temporal.ZonedDateTime.",
      ),
      isBooleanAt("outputAsZonedDateTime"),
    ],
    [
      describeHelp(
        flag("--plain-date-time"),
        "Print as Temporal.PlainDateTime, e.g. 2023-08-07T23:38:58.57.",
      ),
      isBooleanAt("outputAsPlainDateTime"),
    ],
    [
      describeHelp(
        flag("--plain-date"),
        "Print as Temporal.PlainDate, e.g. 2023-08-07.",
      ),
      isBooleanAt("outputAsPlainDate"),
    ],
    [
      describeHelp(
        flag("--plain-time"),
        "Print as Temporal.PlainTime, e.g. 23:38:58.57.",
      ),
      isBooleanAt("outputAsPlainTime"),
    ],
    [
      describeHelp(
        flag("--plain-year-month"),
        "Print as Temporal.PlainYearMonth, e.g. 2023-08.",
      ),
      isBooleanAt("outputAsPlainYearMonth"),
    ],
    [
      describeHelp(
        flag("--plain-month-day"),
        "Print as Temporal.PlainMonthDay, e.g. 08-07.",
      ),
      isBooleanAt("outputAsPlainMonthDay"),
    ],
    [
      describeHelp(flag("--help", "-h"), "Show this help."),
      isBooleanAt("showHelp"),
    ],
    [
      describeHelp(flag("--zero", "-z"), "Do not print the final new line."),
      ({ flags }) => Reflect.set(flags, "insertFinalNewLine", false),
    ],
  ];

  const {
    hourCycle = "none",
    dateStyle = "full",
    timeStyle = "full",
    insertFinalNewLine = true,
    date = new Date(),
    outputAsEpoch = false,
    outputAsEpochMS = false,
    outputAsJSON = false,
    outputAsUTC = false,
    outputAsSheet = false,
    outputAsInstant = false,
    outputAsZonedDateTime = false,
    outputAsPlainDateTime = false,
    outputAsPlainDate = false,
    outputAsPlainTime = false,
    outputAsPlainYearMonth = false,
    outputAsPlainMonthDay = false,
    stdinReadable = false,
    showHelp = false,
    local,
    timeZone,
    template,
    crontab,
  } = flags<Options>(args, {}, rules);

  const {
    transformOptions,
    optionsLabels,
    optionsHelp,
  } = rules.reduce((acc, rule) => {
    const [test] = rule;

    const withLabel = getLabel(test);

    for (const name of test.names ?? []) {
      Reflect.set(acc.transformOptions, name, null);
      Reflect.set(acc.optionsLabels, name, { label: withLabel });
    }

    acc.optionsHelp.push({
      names: [...test.names ?? []],
      label: withLabel,
      description: getDescription(test),
    });

    return acc;
  }, {
    transformOptions: {} as Record<string, null>,
    optionsLabels: {} as Record<string, { label?: string } | undefined>,
    optionsHelp: [] as {
      names: string[];
      label?: string;
      description?: string;
    }[],
  });

  return {
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
    outputAsSheet,
    outputAsInstant,
    outputAsZonedDateTime,
    outputAsPlainDateTime,
    outputAsPlainDate,
    outputAsPlainTime,
    outputAsPlainYearMonth,
    outputAsPlainMonthDay,
    stdinReadable,
    showHelp,
    template,
    crontab,
    transformOptions,
    optionsLabels,
    optionsHelp,
  };
}
