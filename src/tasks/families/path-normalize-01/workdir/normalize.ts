// Normalize a POSIX-style path. See prompt.md for the full spec.
// This implementation is incomplete: it mishandles `..` in relative paths and
// paths that resolve to nothing.
export function normalizePath(path: string): string {
  if (path === "") return ".";
  const isAbsolute = path.startsWith("/");
  const parts = path.split("/").filter((p) => p !== "" && p !== ".");
  const stack: string[] = [];
  for (const part of parts) {
    if (part === "..") {
      stack.pop();
    } else {
      stack.push(part);
    }
  }
  return (isAbsolute ? "/" : "") + stack.join("/");
}
