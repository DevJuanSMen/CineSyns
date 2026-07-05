// Genera un session ID persistente en localStorage
export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("cinesync_session");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("cinesync_session", id);
  }
  return id;
}

export function getUsername(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("cinesync_username") ?? "";
}

export function setUsername(name: string) {
  localStorage.setItem("cinesync_username", name);
}
