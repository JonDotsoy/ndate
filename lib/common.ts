export const dateStyles = ["full", "long", "medium", "short", "none"] as const;
export const timeStyles = ["full", "long", "medium", "short", "none"] as const;
export type DateStyle = (typeof dateStyles)[number];
export type TimeStyle = (typeof dateStyles)[number];
export const toDateStyleString = (v: unknown): DateStyle => typeof v === "string" ? dateStyles.find(dateStyle => dateStyle.startsWith(v)) ?? "none" : "none";
export const toDateStyle = (v: DateStyle) => v === "none" ? undefined : v
export const toTimeStyleString = (v: unknown): TimeStyle => typeof v === "string" ? timeStyles.find(timeStyle => timeStyle.startsWith(v)) ?? "none" : "none";
export const toTimeStyle = (v: TimeStyle) => v === "none" ? undefined : v
export const dateParse = (val: string): Date => {
    const d = new Date(val);
    if (Number.isNaN(Number(d))) {
        throw new Error(`the ${Deno.inspect(val)} time stamp no valid`);
    }
    return d;
}
export const hourCycles = ["h11", "h12", "h23", "h24", "none"] as const
export const toHourCycleString = (v: unknown): typeof hourCycles[number] => typeof v === "string" ? hourCycles.find(hourCycle => hourCycle.startsWith(v)) ?? 'none' : 'none'
export const toHourCycle = (v: typeof hourCycles[number]) => v === 'none' ? undefined : v
