# Contributing guide

## Release Candidate

The release candidate start on a brach `release/{name}`.


## Testing the binary

`ndate.bin.spec.ts` spawns the CLI and checks its output and exit code.

```shell
# Run against the entry point (ndate.ts)
deno test --allow-run --allow-env --allow-read ndate.bin.spec.ts

# Run against a compiled binary
deno compile --allow-env=TZ,LANG --output ./bin/ndate ndate.ts
NDATE_BIN=./bin/ndate deno test --allow-run --allow-env --allow-read ndate.bin.spec.ts
```
