import { describe, expect, it } from "vitest";
import { parseEnvFile } from "../../envfile.ts";

describe("parseEnvFile case 3", () => {
  it("case 3", () => {
    expect(parseEnvFile("export PORT=3000")).toStrictEqual({ PORT: "3000" });
  });
});
