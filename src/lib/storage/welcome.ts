const STORAGE_KEY = "k8s-trainer-welcome-dismissed";

export function isWelcomeDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function dismissWelcome(): void {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // ignore quota / private mode
  }
}
