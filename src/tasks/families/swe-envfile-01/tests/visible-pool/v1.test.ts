import { describe, expect, it } from "vitest";
import { parseEnvFile } from "../../envfile.ts";

describe("parseEnvFile case 1", () => {
  it("case 1", () => {
    expect(parseEnvFile("# comment\nX=y")).toStrictEqual({ X: "y" });
  });
});
