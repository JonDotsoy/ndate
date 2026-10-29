import { toInstantString, toPlainDateString, toPlainDateTimeString, toPlainMonthDayString, toPlainTimeString, toPlainYearMonthString, toZonedDateTimeString } from "./temporal.ts";

export const localPartTypes = ["day", "dayPeriod", "era", "hour", "literal", "minute", "month", "second", "timeZoneName", "weekday", "year"] as const;

export const templateTransformDescriptions: [string, string][] = [
  ["json", "Quote the value as a JSON string."],
  ["sub:<start>:<end>", "Substring from <start> to <end>."],
  ["padStart:<length>:<fill>", "Pad the start up to <length> with <fill>."],
  ["padEnd:<length>:<fill>", "Pad the end up to <length> with <fill>."],
];

export const templateKeywordDescriptions: Record<string, string> = {
  epoch: "Unix time in seconds.",
  epoch_ms: "Unix time in milliseconds.",
  json: "ISO 8601 (alias of iso8601).",
  iso: "ISO 8601 (alias of iso8601).",
  iso8601: "ISO 8601, e.g. 2023-08-08T03:38:58.570Z.",
  utc: "RFC 7231 (alias of rfc7231).",
  rfc7231: "RFC 7231, e.g. Tue, 08 Aug 2023 03:38:58 GMT.",
  local: "Locale format, same as the default output.",
  time: "Result of date.getTime().",
  instant: "Same as --instant.",
  zoned_date_time: "Same as --zoned-date-time.",
  plain_date_time: "Same as --plain-date-time.",
  plain_date: "Same as --plain-date.",
  plain_time: "Same as --plain-time.",
  plain_year_month: "Same as --plain-year-month.",
  plain_month_day: "Same as --plain-month-day.",
  YYYY: "Year, 4 digits.",
  MM: "Month, 2 digits.",
  DD: "Day of month, 2 digits.",
  hh: "Hours, 2 digits (00-23).",
  mm: "Minutes, 2 digits.",
  ss: "Seconds, 2 digits.",
  ms: "Milliseconds, 3 digits.",
  full_year: "Result of date.getFullYear().",
  month: "Month, 1-12.",
  date: "Result of date.getDate().",
  day: "Day of week, 0 (Sunday) to 6.",
  hours: "Result of date.getHours().",
  minutes: "Result of date.getMinutes().",
  seconds: "Result of date.getSeconds().",
  milliseconds: "Result of date.getMilliseconds().",
  timezone_offset: "Result of date.getTimezoneOffset().",
  utc_full_year: "Result of date.getUTCFullYear().",
  utc_month: "UTC month, 1-12.",
  utc_date: "Result of date.getUTCDate().",
  utc_day: "Result of date.getUTCDay().",
  utc_hours: "Result of date.getUTCHours().",
  utc_minutes: "Result of date.getUTCMinutes().",
  utc_seconds: "Result of date.getUTCSeconds().",
  utc_milliseconds: "Result of date.getUTCMilliseconds().",
};

export const templateValues = (date: Date, locales?: string, options?: Intl.DateTimeFormatOptions): Record<string, any> => {
  const localeString = date.toLocaleString(locales, options);
  const parts = new Intl.DateTimeFormat(locales, options).formatToParts(date).map(({ type, value }) => [`local_${type}`, value] as const);

  const epochMS = Math.floor(date.getTime());
  const epoch = Math.floor(date.getTime() / 1000);

  const isoString = date.toISOString();
  const utcString = date.toUTCString();

  return Object.fromEntries([
    [`epoch`, epoch],
    [`epoch_ms`, epochMS],
    [`json`, isoString],
    [`iso`, isoString],
    [`iso8601`, isoString],
    [`utc`, utcString],
    [`rfc7231`, utcString],
    [`local`, localeString],
    ["time", date.getTime()],
    ["instant", toInstantString(date)],
    ["zoned_date_time", toZonedDateTimeString(date, options?.timeZone)],
    ["plain_date_time", toPlainDateTimeString(date, options?.timeZone)],
    ["plain_date", toPlainDateString(date, options?.timeZone)],
    ["plain_time", toPlainTimeString(date, options?.timeZone)],
    ["plain_year_month", toPlainYearMonthString(date, options?.timeZone)],
    ["plain_month_day", toPlainMonthDayString(date, options?.timeZone)],

    ["YYYY", date.getFullYear().toString().padStart(4, `0`)],
    ["MM", (date.getMonth() + 1).toString().padStart(2, `0`)],
    ["DD", date.getDate().toString().padStart(2, `0`)],

    ["hh", date.getHours().toString().padStart(2, `0`)],
    ["mm", date.getMinutes().toString().padStart(2, `0`)],
    ["ss", date.getSeconds().toString().padStart(2, `0`)],
    ["ms", date.getMilliseconds().toString().padStart(3, `0`)],


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
  ]);
};

/** Template keywords without the `local_*` parts, which depend on the locale */
export const templateKeywords = Object.keys(templateValues(new Date(0)))
  .filter((keyword) => !keyword.startsWith("local_"));

export function renderDateTemplate(template: string, date: Date, locales?: string, options?: Intl.DateTimeFormatOptions) {
  const values = templateValues(date, locales, options);

  const transforms: Record<string, (value: string, options?: string) => string> = {
    json: value => JSON.stringify(value),
    sub: (value, options) => {
      const [start = 0, end] = options?.split(':') ?? [];
      return value.toString().substring(Number(start), Number(end));
    },
    padStart: (values, options) => {
      const [maxLength = 0, fillString = ' '] = options?.split(':') ?? [];
      return values.toString().padStart(Number(maxLength), fillString);
    },
    padEnd: (values, options) => {
      const [maxLength = 0, fillString = ' '] = options?.split(':') ?? [];
      return values.toString().padEnd(Number(maxLength), fillString);
    },
    default: value => value,
  };

  const regexp = /\{\{(?<keyword>\w+)(\:(?<transform>\w+)(\:(?<transform_options>[\w\:\-]+))?)?\}\}/g;
  const stringTemplate: string[] = [];
  const substitution: string[] = [];
  let p: RegExpExecArray | null = null;
  let lastPointer = 0;
  do {
    p = regexp.exec(template);
    if(p) {
      stringTemplate.push(template.substring(lastPointer, p.index));
      lastPointer = p.index + p.at(0)!.length;
      const transform = transforms[p.groups?.transform ?? 'default'] ?? transforms.default;
      substitution.push(transform(values[p.groups!.keyword] ?? '', p.groups!.transform_options));
    }
  } while(p !== null);

  stringTemplate.push(template.substring(lastPointer));

  return String.raw({ raw: stringTemplate }, ...substitution);
}
