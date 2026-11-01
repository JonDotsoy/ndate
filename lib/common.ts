import { InvalidOptionError } from "./errors.ts";

export const dateStyles = ["full", "long", "medium", "short", "none"] as const;
export const timeStyles = ["full", "long", "medium", "short", "none"] as const;
export type DateStyle = (typeof dateStyles)[number];
export type TimeStyle = (typeof dateStyles)[number];
export const toDateStyle = (v: DateStyle) => v === "none" ? undefined : v
export const toTimeStyle = (v: TimeStyle) => v === "none" ? undefined : v
export const dateParse = (val: string): Date => {
    if (val === "now") return new Date();
    const d = new Date(val);
    if (Number.isNaN(Number(d))) {
        throw new Error(`the ${Deno.inspect(val)} time stamp no valid`);
    }
    return d;
}
export const hourCycles = ["h11", "h12", "h23", "h24", "none"] as const
export const toHourCycle = (v: typeof hourCycles[number]) => v === 'none' ? undefined : v

// Resolves `value` against `choices` (exact match or unique prefix) and
// throws an InvalidOptionError listing the valid choices otherwise.
const toChoice = <T extends string>(
  flagName: string,
  choices: readonly T[],
  value: unknown,
): T => {
  if (typeof value === "string" && value !== "") {
    const exact = choices.find((choice) => choice === value);
    if (exact) return exact;
    const matches = choices.filter((choice) => choice.startsWith(value));
    if (matches.length === 1) return matches[0];
  }
  throw new InvalidOptionError(
    `Invalid value ${Deno.inspect(value)} for ${flagName}. Expected one of: ${choices.join(", ")}`,
  );
};
export const toDateStyleString = (v: unknown): DateStyle => toChoice("--date-style", dateStyles, v);
export const toTimeStyleString = (v: unknown): TimeStyle => toChoice("--time-style", timeStyles, v);
export const toHourCycleString = (v: unknown): typeof hourCycles[number] => toChoice("--hour-cycles", hourCycles, v);
export const toTimeZoneString = (v: string): string => {
  try {
    new Intl.DateTimeFormat(undefined, { timeZone: v });
    return v;
  } catch {
    throw new InvalidOptionError(
      `Invalid value ${Deno.inspect(v)} for --time-zone. Expected an IANA time zone, e.g. America/Santiago`,
    );
  }
};
export const toLocaleString = (v: string): string => {
  try {
    Intl.getCanonicalLocales(v);
    return v;
  } catch {
    throw new InvalidOptionError(
      `Invalid value ${Deno.inspect(v)} for --local. Expected a BCP 47 locale, e.g. es-CL`,
    );
  }
};
