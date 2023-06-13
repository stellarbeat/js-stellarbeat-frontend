import { SemanticVersionComparer } from "@/services/SemanticVersionComparer";

describe("SemanticVersionComparer", () => {
  test("isBehind returns true when source version is behind target version", () => {
    const semanticVersionComparer = new SemanticVersionComparer();
    const isBehind = semanticVersionComparer.isBehind("1.0.0", "1.0.1");
    expect(isBehind).toBe(true);

    const isBehind2 = semanticVersionComparer.isBehind("1.0.0", "1.1.0");
    expect(isBehind2).toBe(true);

    const isBehind3 = semanticVersionComparer.isBehind("1.0.0", "2.0.0");
    expect(isBehind3).toBe(true);
  });

  test("isBehind returns false when source version is not behind target version", () => {
    const semanticVersionComparer = new SemanticVersionComparer();
    const isBehind = semanticVersionComparer.isBehind("1.0.1", "1.0.0");
    expect(isBehind).toBe(false);

    const isBehind2 = semanticVersionComparer.isBehind("1.1.0", "1.0.0");
    expect(isBehind2).toBe(false);

    const isBehind3 = semanticVersionComparer.isBehind("2.0.0", "1.0.0");
    expect(isBehind3).toBe(false);
  });

  test("isBehind returns false when source version is equal to target version", () => {
    const semanticVersionComparer = new SemanticVersionComparer();
    const isBehind = semanticVersionComparer.isBehind("1.0.0", "1.0.0");
    expect(isBehind).toBe(false);
  });

  test("isBehind returns false when source version is not a semantic version", () => {
    const semanticVersionComparer = new SemanticVersionComparer();
    const isBehind = semanticVersionComparer.isBehind("1.0.0", "");
    expect(isBehind).toBe(false);

    const isBehind2 = semanticVersionComparer.isBehind("1.0.0", "1.0");
    expect(isBehind2).toBe(false);

    const isBehind3 = semanticVersionComparer.isBehind("1.0.0", "1");
    expect(isBehind3).toBe(false);
  });

  test("isBehind returns false when target version is not a semantic version", () => {
    const semanticVersionComparer = new SemanticVersionComparer();
    const isBehind = semanticVersionComparer.isBehind("", "1.0.0");
    expect(isBehind).toBe(false);

    const isBehind2 = semanticVersionComparer.isBehind("1.0", "1.0.0");
    expect(isBehind2).toBe(false);

    const isBehind3 = semanticVersionComparer.isBehind("1", "1.0.0");
    expect(isBehind3).toBe(false);
  });

  test("isBehind returns false when target version is a release candidate ahead of source version", () => {
    const semanticVersionComparer = new SemanticVersionComparer();
    const isBehind = semanticVersionComparer.isBehind("1.0.0", "1.0.0-rc.1");
    expect(isBehind).toBe(false);

    const isBehind2 = semanticVersionComparer.isBehind("1.0.0", "1.0.0-rc.2");
    expect(isBehind2).toBe(false);

    const isBehind3 = semanticVersionComparer.isBehind("1.0.0", "1.0.0-rc.10");
    expect(isBehind3).toBe(false);
  });
});
