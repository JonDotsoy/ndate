// Formats a Date like the `toString()` of the Temporal types, without
// depending on the Temporal API (still unstable on Deno).

const pad = (value: number | string, length = 2) =>
  value.toString().padStart(length, "0");

const fraction = (date: Date) => {
  const ms = date.getUTCMilliseconds();
  return ms ? `.${pad(ms, 3).replace(/0+$/, "")}` : "";
};

const resolveTimeZone = (timeZone?: string) =>
  timeZone ?? new Intl.DateTimeFormat().resolvedOptions().timeZone;

const wallClock = (date: Date, timeZone?: string) => {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: resolveTimeZone(timeZone),
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).formatToParts(date).map(({ type, value }) => [type, value]),
  );
  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);
  const hour = Number(parts.hour);
  const minute = Number(parts.minute);
  const second = Number(parts.second);
  const offsetMinutes = Math.round(
    (Date.UTC(year, month - 1, day, hour, minute, second) -
      Math.floor(date.getTime() / 1000) * 1000) / 60_000,
  );
  return { year, month, day, hour, minute, second, offsetMinutes };
};

const formatOffset = (offsetMinutes: number) => {
  const sign = offsetMinutes < 0 ? "-" : "+";
  const abs = Math.abs(offsetMinutes);
  return `${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
};

export const toInstantString = (date: Date) =>
  date.toISOString().replace(/\.\d{3}Z$/, `${fraction(date)}Z`);

export const toPlainDateString = (date: Date, timeZone?: string) => {
  const { year, month, day } = wallClock(date, timeZone);
  return `${pad(year, 4)}-${pad(month)}-${pad(day)}`;
};

export const toPlainTimeString = (date: Date, timeZone?: string) => {
  const { hour, minute, second } = wallClock(date, timeZone);
  return `${pad(hour)}:${pad(minute)}:${pad(second)}${fraction(date)}`;
};

export const toPlainDateTimeString = (date: Date, timeZone?: string) =>
  `${toPlainDateString(date, timeZone)}T${toPlainTimeString(date, timeZone)}`;

export const toPlainYearMonthString = (date: Date, timeZone?: string) =>
  toPlainDateString(date, timeZone).slice(0, -3);

export const toPlainMonthDayString = (date: Date, timeZone?: string) =>
  toPlainDateString(date, timeZone).slice(-5);

export const toZonedDateTimeString = (date: Date, timeZone?: string) =>
  `${toPlainDateTimeString(date, timeZone)}${
    formatOffset(wallClock(date, timeZone).offsetMinutes)
  }[${resolveTimeZone(timeZone)}]`;
