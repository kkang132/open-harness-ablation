# Implement `parseEnvFile`

Implement `workdir/envfile.ts`. Do not edit the tests.

Implement `parseEnvFile(text)` for .env files:
- one assignment per line: KEY=VALUE
- ignore blank lines and lines whose first non-space char is "#"
- split on the FIRST "=" only (values may contain "=")
- trim whitespace around the key; an optional "export " prefix on the key is removed
- trim the value; if it is wrapped in matching single or double quotes, strip them

Examples: parseEnvFile("A=1") -> {A:"1"}; parseEnvFile('N="a b"') -> {N:"a b"}.
