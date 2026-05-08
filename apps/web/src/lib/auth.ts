export const AUTH_KEY = "demo_admin_auth";

export function isDemoAuthenticated() {
  return sessionStorage.getItem(AUTH_KEY) === "1";
}

export function setDemoAuthenticated() {
  sessionStorage.setItem(AUTH_KEY, "1");
}

export function clearDemoAuth() {
  sessionStorage.removeItem(AUTH_KEY);
}
