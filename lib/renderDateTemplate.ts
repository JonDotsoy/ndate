export function renderDateTemplate(template: string, date: Date, locales?: string, options?: Intl.DateTimeFormatOptions) {
  const localeString = date.toLocaleString(locales, options);
  const parts = new Intl.DateTimeFormat(locales, options).formatToParts(date).map(({ type, value }) => [`local_${type}`, value] as const);

  const epochMS = Math.floor(date.getTime());
  const epoch = Math.floor(date.getTime() / 1000);

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
