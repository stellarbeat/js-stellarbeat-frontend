class UserConsentManager {
  private consentTimestampKey = "consentTimestamp";

  private getStoredConsentTimestamp(): number | null {
    const storedTimestamp = localStorage.getItem(this.consentTimestampKey);
    return storedTimestamp ? parseInt(storedTimestamp, 10) : null;
  }

  giveConsent(latestTermsChangeTimestamp: number): void {
    localStorage.setItem(
      this.consentTimestampKey,
      latestTermsChangeTimestamp.toString(),
    );
  }

  userHasGivenConsent(latestTermsChangeTimestamp: number): boolean {
    const storedConsentTimestamp = this.getStoredConsentTimestamp();

    if (!storedConsentTimestamp) {
      return false;
    }

    return storedConsentTimestamp === latestTermsChangeTimestamp;
  }
}

export default UserConsentManager;
