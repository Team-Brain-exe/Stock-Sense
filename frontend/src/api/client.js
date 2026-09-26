// Shared API client for Arya's pages (Dashboard, Deliveries, Transfers, Ledger).
// Every call has a matching mock fallback so the UI never breaks mid-demo if
// Darwin/Aparna's endpoint isn't live yet or a request fails â€” it just logs
// a warning and keeps running on local/mock data.

const BASE_URL = "/api";

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) {
    throw new Error(`${options.method || "GET"} ${path} failed: ${response.status}`);
  }
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export async function apiGet(path, fallback) {
  try {
    return await request(path);
  } catch (err) {
    console.warn(`[api] falling back to mock data for GET ${path}:`, err.message);
    return fallback;
  }
}

export async function apiPost(path, body, fallback) {
  try {
    return await request(path, { method: "POST", body: JSON.stringify(body) });
  } catch (err) {
    console.warn(`[api] falling back to local write for POST ${path}:`, err.message);
    return fallback;
  }
}

export async function apiPatch(path, body, fallback) {
  try {
    return await request(path, { method: "PATCH", body: JSON.stringify(body) });
  } catch (err) {
    console.warn(`[api] falling back to local write for PATCH ${path}:`, err.message);
    return fallback;
  }
}