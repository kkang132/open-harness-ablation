# Implement `parseQueryString`

Implement `workdir/querystring.ts`. Do not edit the tests.

Implement `parseQueryString(qs)`:
- ignore an optional leading "?"
- split on "&"; skip empty segments
- each segment is key=value; a segment with no "=" has value ""
- URL-decode keys and values, and treat "+" as a space
- a key that appears more than once becomes an array of its values, in order

Examples: parseQueryString("a=1&b=2") -> {a:"1",b:"2"}; parseQueryString("a=1&a=2") -> {a:["1","2"]}.
