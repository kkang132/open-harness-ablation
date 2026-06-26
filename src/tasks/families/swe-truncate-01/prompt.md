# Implement `truncate`

Implement `workdir/truncate.ts`. Do not edit the tests.

Implement `truncate(str, maxLength, suffix='...')`:
- if str.length <= maxLength, return str unchanged
- otherwise return a string of length exactly maxLength: the start of str plus the suffix
- if maxLength is less than or equal to suffix.length, return the first maxLength characters of the suffix

Examples: truncate("hello world", 8) -> "hello..."; truncate("hello", 10) -> "hello".
