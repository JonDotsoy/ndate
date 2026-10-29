// Errors whose message is enough for the user; any other error is printed
// in full (with its stack trace) because it is not expected.
const printableErrorPatterns = [
  /^Unexpected argument: /,
  /time stamp no valid$/,
];

export const isPrintableError = (error: unknown): error is Error =>
  error instanceof Error &&
  printableErrorPatterns.some((pattern) => pattern.test(error.message));

export const formatError = (error: unknown, verbose = false): string =>
  !verbose && isPrintableError(error) ? error.message : Deno.inspect(error);
