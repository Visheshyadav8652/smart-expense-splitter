const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const request = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data.message || "Request failed";
    throw new Error(message);
  }

  return data;
};

const requestForm = async (path, body) => {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data.message || "Request failed";
    throw new Error(message);
  }

  return data;
};

export const api = {
  getGroups: () => request("/groups"),
  createGroup: (payload) =>
    request("/groups", { method: "POST", body: JSON.stringify(payload) }),
  getGroup: (id) => request(`/groups/${id}`),
  getExpenses: (groupId) => request(`/expenses?groupId=${groupId}`),
  createExpense: (payload) =>
    request("/expenses", { method: "POST", body: JSON.stringify(payload) }),
  getBalances: (groupId) => request(`/balances?groupId=${groupId}`),
  getSettlements: (groupId) => request(`/settle?groupId=${groupId}`),
  parseExpense: (text) =>
    request("/ai/parse-expense", {
      method: "POST",
      body: JSON.stringify({ text }),
    }),
  parseBill: (text) =>
    request("/ai/parse-bill", {
      method: "POST",
      body: JSON.stringify({ text }),
    }),
  parseBillImage: (imageData) =>
    requestForm("/ai/parse-bill-image", { imageData }),
};
