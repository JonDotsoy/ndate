# ndate script

Date format to console.

```shell
Usage: ndate [-] [--zero] [--date-style <full|long|medium|short>] [--time-style <full|long|medium|short>]
             [--time-zone <time-zone>] [--local <locale>] [--template <template>]
             [--json] [--epoch] [--epoch-ms] [--date <date>] [--help] [-j] [-d <date>]
             [-l <locale>] [-z] [-h]
```

Install with [homebrew](https://brew.sh/):

```shell
brew install jondotsoy/ndate/ndate
```

Or install with deno:

```shell
deno install --allow-env=TZ,LANG https://deno.land/x/ndate/ndate.ts
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
- `{{HH}}`: Hour in local time. Ej. `06`, `18`. 
- `{{MM}}`: Minute in local time. Ej. `23`, `59`.
- `{{SS}}`: Second in local time. Ej. `13`, `30`.
- `{{MS}}`: Millisecond in local time. Ej. `0456`, `998`.


**Sample**

```shell
ndate --template '{{utc_full_year}}-{{utc_month}}-{{utc_date}}' # 2023-6-13
```
