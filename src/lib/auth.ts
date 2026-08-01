/** Whether a real Clerk publishable key is present. The template ships a placeholder. */
export const hasClerk = (() => {
  const key = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '';
  return /^pk_(test_|live_)[A-Za-z0-9]{8,}$/.test(key);
})();

export const clerkKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '';

/** Dev-only: fake a signed-in session when Clerk isn't configured. */
export const devSignedIn = !hasClerk;
