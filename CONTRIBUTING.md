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

## Release

Run the **release** workflow from the Actions tab (or `gh workflow run release.yml -f bump=patch`) and pick `patch`, `minor` or `major`. It:

1. Runs the binary tests.
2. Bumps the `version` file, commits it to the selected branch and pushes a `vX.Y.Z` tag.
3. Compiles `ndate` for Linux, macOS (x86_64 and arm64) and Windows.
4. Creates a GitHub release with generated notes and the binaries attached.
