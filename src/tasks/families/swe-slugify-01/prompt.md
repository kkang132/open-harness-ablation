# Implement `slugify`

Implement `workdir/slugify.ts`. Do not edit the tests.

Implement `slugify(input)` for URL slugs:
- lowercase the string
- replace every run of non-alphanumeric characters with a single hyphen
- remove leading and trailing hyphens

Examples: slugify("Hello World") -> "hello-world"; slugify("  Foo--Bar!! ") -> "foo-bar".
