# ndate script

Date format to console.

```shell
Usage: ndate [-] [--zero] [--date-style <full|long|medium|short>] [--time-style <full|long|medium|short>]
             [--time-zone] [--local <locale>] [--json] [--epoch] [--epoch-ms] [--date <date>]
             [--help] [-j] [-d <date>] [-l <locale>] [-z] [-h]
```

Please install with deno:

```shell
deno install https://deno.land/x/ndate/ndate.ts
```

Samples use:

```shell
ndate # Tuesday, October 11, 2022 at 5:59:37 PM Chile Summer Time
ndate --local es-CL # martes, 11 de octubre de 2022, 17:59:14 hora de verano de Chile
ndate --local en-CL # Tuesday, October 11, 2022 at 5:59:37 PM Chile Summer Time
ndate --time-zone Asia/Tokyo --local en-US # Thursday, July 13, 2023 at 6:46:21 AM Japan Standard Time
LANG=en-US ndate --time-zone Asia/Tokyo # Thursday, July 13, 2023 at 6:46:21 AM Japan Standard Time
LANG=en-US TZ=Asia/Tokyo ndate # Thursday, July 13, 2023 at 6:46:21 AM Japan Standard Time
echo 2022-10-12T05:39:19.678Z | ndate - # Wednesday, October 12, 2022 at 2:39:19 AM Chile Summer Time
ndate -j # 2022-10-12T05:40:33.246Z
ndate --epoch # 1689255846
ndate --epoch-ms # 1689255823663
```
