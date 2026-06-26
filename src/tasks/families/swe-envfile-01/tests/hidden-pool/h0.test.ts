import { describe, expect, it } from "vitest";
import { parseEnvFile } from "../../envfile.ts";

describe("parseEnvFile case 0", () => {
  it("case 0", () => {
    expect(parseEnvFile("URL=http://a=b")).toStrictEqual({ URL: "http://a=b" });
  });
});
