import { describe, expect, it } from "vitest";
import { parseEnvFile } from "../../envfile.ts";

describe("parseEnvFile case 0", () => {
  it("case 0", () => {
    expect(parseEnvFile("A=1\nB=2")).toStrictEqual({ A: "1", B: "2" });
  });
});
