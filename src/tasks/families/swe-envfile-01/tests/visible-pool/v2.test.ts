import { describe, expect, it } from "vitest";
import { parseEnvFile } from "../../envfile.ts";

describe("parseEnvFile case 2", () => {
  it("case 2", () => {
    expect(parseEnvFile('NAME="hello world"')).toStrictEqual({ NAME: "hello world" });
  });
});
