const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export async function getProjects(params = {}) {
  const query = new URLSearchParams(params).toString();
  const r = await fetch(`${API}/api/projects/${query ? `?${query}` : ""}`);
  if (!r.ok) throw new Error(`Projects ${r.status}`);
  return r.json();
}

export async function getProject(slug) {
  const r = await fetch(`${API}/api/projects/${slug}/`);
  if (!r.ok) throw new Error(`Project ${r.status}`);
  return r.json();
}

export async function login(username, password) {
  const r = await fetch(`${API}/api/auth/token/`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({username, password})
  });
  if (!r.ok) throw new Error("Invalid credentials");
  return r.json(); // {access, refresh}
}



export async function pingHealth() {
  const r = await fetch(`${API}/api/health/`);
  if (!r.ok) throw new Error(`Health ${r.status}`);
  return r.json(); // -> { status: "ok" }
}