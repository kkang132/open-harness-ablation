import { describe, expect, it } from "vitest";
import { parseEnvFile } from "../../envfile.ts";

describe("parseEnvFile case 4", () => {
  it("case 4", () => {
    expect(parseEnvFile("NOEQ\nGOOD=2")).toStrictEqual({ GOOD: "2" });
  });
});
