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

const setLabel = (obj: object, label: string) =>
  Reflect.set(obj, labelSymbol, label);
const getLabel = (obj: object) => Reflect.get(obj, labelSymbol);

const describeLabel = (test: Test<any>, label: string): Test<any> => {
  setLabel(test, label);
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
    [flag("-"), isBooleanAt("stdinReadable")],
    [
      describeLabel(flag("--date", "-d"), "<date>"),
      isArgumentTransformAt("date", dateParse),
    ],
    [
      describeLabel(flag("--date-style"), `<${dateStyles.join("|")}>`),
      isArgumentTransformAt("dateStyle", toDateStyleString),
    ],
    [
      describeLabel(flag("--time-style"), `<${timeStyles.join("|")}>`),
      isArgumentTransformAt("timeStyle", toTimeStyleString),
    ],
    [
      describeLabel(flag("--hour-cycles"), `<${hourCycles.join("|")}>`),
      isArgumentTransformAt("hourCycle", toHourCycleString),
    ],
    [
      describeLabel(flag("--time-zone", "-tz"), "<time-zone>"),
      isStringAt("timeZone"),
    ],
    [describeLabel(flag("--local", "-l"), "<locale>"), isStringAt("local")],
    [describeLabel(flag("--template"), "<template>"), isStringAt("template")],
    [flag("--json", "-j"), isBooleanAt("outputAsJSON")],
    [flag("--sheet"), isBooleanAt("outputAsSheet")],
    [flag("--utc"), isBooleanAt("outputAsUTC")],
    [flag("--epoch"), isBooleanAt("outputAsEpoch")],
    [flag("--epoch-ms"), isBooleanAt("outputAsEpochMS")],
    [flag("--help", "-h"), isBooleanAt("showHelp")],
    [
      flag("--zero", "-z"),
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
  } = rules.reduce((acc, rule) => {
    const [test] = rule;

    const withLabel = getLabel(test);

    for (const name of test.names ?? []) {
      Reflect.set(acc.transformOptions, name, null);
      Reflect.set(acc.optionsLabels, name, { label: withLabel });
    }

    return acc;
  }, {
    transformOptions: {} as Record<string, null>,
    optionsLabels: {} as Record<string, { label?: string } | undefined>,
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
    stdinReadable,
    showHelp,
    template,
    crontab,
    transformOptions,
    optionsLabels,
  };
}
