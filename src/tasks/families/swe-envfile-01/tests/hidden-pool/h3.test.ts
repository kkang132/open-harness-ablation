import { describe, expect, it } from "vitest";
import { parseEnvFile } from "../../envfile.ts";

describe("parseEnvFile case 3", () => {
  it("case 3", () => {
    expect(parseEnvFile("#a\n#b\nONLY=1")).toStrictEqual({ ONLY: "1" });
  });
});
