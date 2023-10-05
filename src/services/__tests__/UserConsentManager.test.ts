// userConsentManager.test.ts
import "jest-localstorage-mock";
import UserConsentManager from "@/services/UserConsentManager";

describe("UserConsentManager", () => {
  let consentManager: UserConsentManager;

  beforeEach(() => {
    consentManager = new UserConsentManager();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  test("should return false if user has not given consent at all", () => {
    expect(consentManager.userHasGivenConsent(0)).toBe(false);
  });

  test("should return true if user has given consent", () => {
    consentManager.giveConsent(100000);
    expect(consentManager.userHasGivenConsent(100000)).toBe(true);
  });

  test("should return false if user has not given consent for new, updated terms", () => {
    consentManager.giveConsent(100000); // Simulate terms change
    expect(consentManager.userHasGivenConsent(110000)).toBe(false);
  });

  test("should update consent with the provided timestamp", () => {
    consentManager.giveConsent(100000); // Simulate terms change
    consentManager.giveConsent(200000); // Update consent

    expect(localStorage.getItem("consent")).toBe("true");
    expect(localStorage.getItem("consentTimestamp")).toBe("200000");
  });
});
