# ndate

Date format to console.

```shell
Usage: ndate [-] [--date <date>] [-d <date>] [--date-style <full|long|medium|short|none>]
             [--time-style <full|long|medium|short|none>] [--hour-cycles <h11|h12|h23|h24|none>]
             [--time-zone <time-zone>] [-tz <time-zone>] [--local <locale>] [-l <locale>]
             [--template <template>] [--json] [-j] [--sheet] [--utc] [--epoch] [--epoch-ms]
             [--instant] [--zoned-date-time] [--plain-date-time] [--plain-date] [--plain-time]
             [--plain-year-month] [--plain-month-day] [--help] [-h] [--zero] [-z]
```

Install with [homebrew](https://brew.sh/):

```shell
brew install jondotsoy/core/ndate
```

Or install with deno:

```shell
deno install --allow-env=TZ,LANG https://deno.land/x/ndate@morgan-v0.4.3/ndate.ts
```

Samples use:

```shell
ndate # Tuesday, October 11, 2022 at 5:59:37 PM Chile Summer Time
ndate -d 2023-07-13T06:40 # Thursday, July 13, 2023 at 6:40:00 AM Chile Standard Time
ndate --local es-CL # martes, 11 de octubre de 2022, 17:59:14 hora de verano de Chile
ndate --local en-CL # Tuesday, October 11, 2022 at 5:59:37 PM Chile Summer Time
ndate --time-zone Asia/Tokyo --local en-US # Thursday, July 13, 2023 at 6:46:21 AM Japan Standard Time
LANG=en-US ndate --time-zone Asia/Tokyo # Thursday, July 13, 2023 at 6:46:21 AM Japan Standard Time
LANG=en-US TZ=Asia/Tokyo ndate # Thursday, July 13, 2023 at 6:46:21 AM Japan Standard Time
echo 2022-10-12T05:39:19.678Z | ndate - # Wednesday, October 12, 2022 at 2:39:19 AM Chile Summer Time
ndate -j # 2022-10-12T05:40:33.246Z
ndate --epoch # 1689255846
ndate --epoch-ms # 1689255823663
ndate --epoch-ms -z # 1689255823663%
ndate --template '{{utc_full_year}}-{{utc_month:padStart:2:0}}-{{utc_date:padStart:2:0}}' # 2023-06-13
ndate --template '{{YYYY}}{{MM}}{{DD}}{{HH}}{{MM}}{{SS}}{{MS}}' # 202330142030590781
ndate --sheet # =DATE(2023;10;28)+TIME(1;17;12)
```

## Formatting a date

`ndate` reads the date from `-d`/`--date` (any value accepted by `new Date()`), from stdin with `-`, or uses the current date. Then pick how to print it:

**1. Locale format.** Set the language with `-l`/`--local`, the time zone with `-tz`/`--time-zone`, and adjust the style with `--date-style`, `--time-style` (`full|long|medium|short|none`) and `--hour-cycles` (`h11|h12|h23|h24`).

```shell
ndate -d 2023-08-08T03:38:58Z -tz America/Santiago -l en-US                                     # Monday, August 7, 2023 at 11:38:58 PM Chile Standard Time
ndate -d 2023-08-08T03:38:58Z -tz America/Santiago -l en-US --date-style short --time-style short # 8/7/23, 11:38 PM
ndate -d 2023-08-08T03:38:58Z -tz America/Santiago -l en-US --date-style medium --time-style none # Aug 7, 2023
ndate -d 2023-08-08T03:38:58Z -tz America/Santiago --date-style none --time-style short --hour-cycles h23 # 23:38
```

**2. Fixed formats.** `--json`, `--utc`, `--epoch`, `--epoch-ms`, `--sheet` and the Temporal formats below.

```shell
ndate -d 2023-08-08T03:38:58Z --json  # 2023-08-08T03:38:58.000Z
ndate -d 2023-08-08T03:38:58Z --epoch # 1691465938
echo 2023-08-08T03:38:58Z | ndate - --utc # Tue, 08 Aug 2023 03:38:58 GMT
```

**3. Templates.** `--template` replaces each `{{property}}` (see [Options to `--template`](#options-to---template)) and accepts transforms with `{{property:transform}}`: `json`, `sub:<start>:<end>`, `padStart:<length>:<fill>` and `padEnd:<length>:<fill>`. Run `ndate -h` to list every property.

```shell
ndate -d 2023-08-08T03:38:58Z -tz America/Santiago --template '{{YYYY}}-{{MM}}-{{DD}} {{hh}}:{{mm}}:{{ss}}' # 2023-08-07 23:38:58
ndate -d 2023-08-08T03:38:58Z -tz America/Santiago --template '{{DD}}/{{MM}}/{{YYYY}}'                      # 07/08/2023
ndate -d 2023-08-08T03:38:58Z -tz America/Santiago -l en-US --template '{{local_weekday}}, {{local_day}} {{local_month}}' # Monday, 7 August
ndate -d 2023-08-08T03:38:58Z -tz America/Santiago --template '{{month:padStart:2:0}}'                      # 08
```

Add `-z` to print without the final new line.

Formats from the [Temporal](https://tc39.es/proposal-temporal/docs/) API (same output as each type's `toString()`):

```shell
ndate -d 2023-08-08T03:38:58.570Z -tz America/Santiago --instant          # 2023-08-08T03:38:58.57Z
ndate -d 2023-08-08T03:38:58.570Z -tz America/Santiago --zoned-date-time  # 2023-08-07T23:38:58.57-04:00[America/Santiago]
ndate -d 2023-08-08T03:38:58.570Z -tz America/Santiago --plain-date-time  # 2023-08-07T23:38:58.57
ndate -d 2023-08-08T03:38:58.570Z -tz America/Santiago --plain-date       # 2023-08-07
ndate -d 2023-08-08T03:38:58.570Z -tz America/Santiago --plain-time       # 23:38:58.57
ndate -d 2023-08-08T03:38:58.570Z -tz America/Santiago --plain-year-month # 2023-08
ndate -d 2023-08-08T03:38:58.570Z -tz America/Santiago --plain-month-day  # 08-07
```

## Options to `--template`

- `{{epoch}}`: Date on [unix time](https://en.wikipedia.org/wiki/Unix_time) (It measures time by the number of **seconds** that have elapsed since 00:00:00 UTC on 1 January 1970)
- `{{epoch_ms}}`: Date on [unix time](https://en.wikipedia.org/wiki/Unix_time) (It measures time by the number of **milliseconds** that have elapsed since 00:00:00 UTC on 1 January 1970)
- `{{json}}`: Time on [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) (Alias of `{{iso8601}}`)
- `{{iso}}`: Time on [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) (Alias of `{{iso8601}}`)
- `{{iso8601}}`: Time on [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601)
- `{{utc}}`: Date in the [RFC 7231](https://datatracker.ietf.org/doc/html/rfc7231#section-7.1.1.1) format (Alias of `{{rfc7231}}`)
- `{{rfc7231}}`: Date in the [RFC 7231](https://datatracker.ietf.org/doc/html/rfc7231#section-7.1.1.1) format
- `{{time}}`: Result of `date.getTime()`
- `{{instant}}`: Same as `--instant`
- `{{zoned_date_time}}`: Same as `--zoned-date-time`
- `{{plain_date_time}}`: Same as `--plain-date-time`
- `{{plain_date}}`: Same as `--plain-date`
- `{{plain_time}}`: Same as `--plain-time`
- `{{plain_year_month}}`: Same as `--plain-year-month`
- `{{plain_month_day}}`: Same as `--plain-month-day`
- `{{full_year}}`: Result of `date.getFullYear()`
- `{{utc_full_year}}`: Result of `date.getUTCFullYear()`
- `{{month}}`: Result of `date.getMonth()`
- `{{utc_month}}`: Result of `date.getUTCMonth()`
- `{{date}}`: Result of `date.getDate()`
- `{{utc_date}}`: Result of `date.getUTCDate()`
- `{{day}}`: Result of `date.getDay()`
- `{{utc_day}}`: Result of `date.getUTCDay()`
- `{{hours}}`: Result of `date.getHours()`
- `{{utc_hours}}`: Result of `date.getUTCHours()`
- `{{minutes}}`: Result of `date.getMinutes()`
- `{{utc_minutes}}`: Result of `date.getUTCMinutes()`
- `{{seconds}}`: Result of `date.getSeconds()`
- `{{utc_seconds}}`: Result of `date.getUTCSeconds()`
- `{{milliseconds}}`: Result of `date.getMilliseconds()`
- `{{utc_milliseconds}}`: Result of `date.getUTCMilliseconds()`
- `{{timezone_offset}}`: Result of `date.getTimezoneOffset()`
- `{{local}}`: Result of `Intl.DateTimeFormat.format`
- `{{local_day}}`: `day` part of `Intl.DateTimeFormat`
- `{{local_dayPeriod}}`: `dayPeriod` part of `Intl.DateTimeFormat`
- `{{local_era}}`: `era` part of `Intl.DateTimeFormat`
- `{{local_hour}}`: `hour` part of `Intl.DateTimeFormat`
- `{{local_literal}}`: `literal` part of `Intl.DateTimeFormat`
- `{{local_minute}}`: `minute` part of `Intl.DateTimeFormat`
- `{{local_month}}`: `month` part of `Intl.DateTimeFormat`
- `{{local_second}}`: `second` part of `Intl.DateTimeFormat`
- `{{local_timeZoneName}}`: `timeZoneName` part of `Intl.DateTimeFormat`
- `{{local_weekday}}`: `weekday` part of `Intl.DateTimeFormat`
- `{{local_year}}`: `year` part of `Intl.DateTimeFormat`
- `{{YYYY}}`: Full year in local time. Ej. `2023`.
- `{{MM}}`: Month in local time. Ej. `07`, `12`.
- `{{DD}}`: Day of month in local time. Ej. `09`, `31`.
- `{{hh}}`: Hour in local time. Ej. `06`, `18`. 
- `{{mm}}`: Minute in local time. Ej. `23`, `59`.
- `{{ss}}`: Second in local time. Ej. `13`, `30`.
- `{{ms}}`: Millisecond in local time. Ej. `0456`, `998`.


**Sample**

```shell
ndate --template '{{utc_full_year}}-{{utc_month}}-{{utc_date}}' # 2023-6-13
```
