const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";


export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    const detail = payload?.detail ? ` ${payload.detail}` : "";
    throw new Error(`${payload?.error || `API request failed: ${response.status}`}${detail}`);
  }

  return payload;
}
