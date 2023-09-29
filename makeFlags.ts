import { 
    dateStyles,
    timeStyles,
    DateStyle,
    TimeStyle,
    toDateStyleString,
    toTimeStyleString,
    dateParse,
    hourCycles,
toHourCycleString,
 } from "./lib/common.ts";

export function makeFlags(args: string[]) {
  let hourCycle: (typeof hourCycles)[number] = 'none';
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
  let outputAsSheet = false;
  let stdinReadable = false;
  let showHelp = false;
  let template: string | undefined;
  let crontab: string | undefined;

  const transformOptions: Record<string, (nextArgument: () => string | undefined) => void> = {
    '-': () => { stdinReadable = true; },
    '--zero': () => { insertFinalNewLine = false; },
    '--date-style': (nextArgument) => { dateStyle = toDateStyleString(nextArgument()); },
    '--time-style': (nextArgument) => { timeStyle = toTimeStyleString(nextArgument()); },
    '--hour-cycles': (nextArgument) => { hourCycle = toHourCycleString(nextArgument()) },
    '--time-zone': (nextArgument) => { timeZone = nextArgument(); },
    '--local': (nextArgument) => { local = nextArgument(); },
    '--template': (nextArgument) => { template = nextArgument(); },
    '--json': () => { outputAsJSON = true; },
    '--sheet': () => { outputAsSheet = true; },
    '--utc': () => { outputAsUTC = true; },
    '--epoch': () => { outputAsEpoch = true; },
    '--epoch-ms': () => { outputAsEpochMS = true; },
    '--date': (nextArgument) => {
      const v = nextArgument();
      if(v) {
        date = dateParse(v);
      }
    },
    '--help': () => { showHelp = true; },
    get "-j"() { return this['--json']; },
    get "-d"() { return this["--date"]; },
    get "-l"() { return this["--local"]; },
    get "-tz"() { return this["--time-zone"]; },
    get "-z"() { return this["--zero"]; },
    get "-h"() { return this["--help"]; },
  };

  const optionsLabels: Record<string, undefined | { label?: string; }> = {
    '--date-style': { label: `<${dateStyles.join('|')}>` },
    '--time-style': { label: `<${timeStyles.join('|')}>` },
    '--hour-cycles': { label: `<${hourCycles.join('|')}>` },
    '--local': { label: `<locale>` },
    '--date': { label: `<date>` },
    '--template': { label: `<template>` },
    '--time-zone': { label: `<time-zone>` },
    get "-j"() { return this['--json']; },
    get "-d"() { return this["--date"]; },
    get "-l"() { return this["--local"]; },
    get "-tz"() { return this["--time-zone"]; },
    get "-z"() { return this["--zero"]; },
    get "-h"() { return this["--help"]; },
  };

  const parseCrontab = (str: string) => {
    const res = /^((?<predefined>@(annually|yearly|monthly|weekly|daily|hourly|reboot))|(?<every>@every ((?<every_value>\d+)(?<every_value_sign>ns|us|µs|ms|s|m|h))+)|(?<cron>(?<cron_minute>((\d+,)+\d+|(\d+(\/|-)\d+)|\d+|\*)) (?<cron_hour>((\d+,)+\d+|(\d+(\/|-)\d+)|\d+|\*)) (?<cron_day_month>((\d+,)+\d+|(\d+(\/|-)\d+)|\d+|\*)) (?<cron_month>((\d+,)+\d+|(\d+(\/|-)\d+)|\d+|\*)) (?<cron_day_week>((\d+,)+\d+|(\d+(\/|-)\d+)|\d+|\*))))$/.exec(str);

    if(!res) return null;

    if(res.groups?.predefined)
      return {
        predefined: res.groups.predefined
      };
  };

  for(let argsCursor = args[Symbol.iterator](), { value: arg, done } = argsCursor.next();!done;{ value: arg, done } = argsCursor.next()) {
    const next = (): string | undefined => argsCursor.next().value;
    if(typeof arg === "string" && arg in transformOptions) { transformOptions[arg](next); }
  }

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
