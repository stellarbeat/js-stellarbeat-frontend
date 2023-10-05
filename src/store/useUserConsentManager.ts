import UserConsentManager from "@/services/UserConsentManager";

let userConsentManager: UserConsentManager | null = null;
export default function (): UserConsentManager {
  if (userConsentManager === null)
    userConsentManager = new UserConsentManager();

  return userConsentManager;
}
