const API_BASE_URL = "https://web-production-110f3.up.railway.app";
const TOKEN_KEY = "access_token";

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    let message = "Erro ao comunicar com o servidor";
    if (data?.detail) {
      message = Array.isArray(data.detail) 
        ? data.detail.map(d => d.msg).join(", ") 
        : data.detail;
    } else if (data?.message) {
      message = data.message;
    }
    throw new Error(message);
  }

  return data;
}
