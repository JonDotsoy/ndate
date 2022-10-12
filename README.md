# ndate script

Date format to console.

```shell
Usage: ndate [-] [--zero] [--date-style <full|long|medium|short>] [--time-style <full|long|medium|short>]
             [--local <locale>] [--json] [--date <date>] [--help] [-j] [-d <date>]
             [-l <locale>] [-z] [-h]
```

Please install with deno:

```shell
deno install ndate.ts
```

Samples use:

```shell
ndate # Tuesday, October 11, 2022 at 5:59:37 PM Chile Summer Time
ndate --local es-CL # martes, 11 de octubre de 2022, 17:59:14 hora de verano de Chile
ndate --local en-CL # Tuesday, October 11, 2022 at 5:59:37 PM Chile Summer Time
```
