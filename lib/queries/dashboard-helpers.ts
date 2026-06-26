/**
 * Pure helpers for the dashboard data layer (no I/O), kept separate so they are
 * trivially unit-testable.
 */

/** Resolve a friendly display name from profile name + email, with a fallback. */
export function resolveDisplayName(
  profileName: string | null | undefined,
  email: string | null | undefined,
): string {
  if (profileName && profileName.trim()) return profileName.trim();
  if (email && email.includes("@")) return email.split("@")[0];
  return "there";
}

/** The avatar initial: first letter of the display name, uppercased. */
export function avatarInitial(displayName: string): string {
  return displayName.trim().charAt(0).toUpperCase() || "U";
}

/** Two-digit display index used on subject cards (1 -> "01"). */
export function cardIndex(zeroBased: number): string {
  return String(zeroBased + 1).padStart(2, "0");
}
